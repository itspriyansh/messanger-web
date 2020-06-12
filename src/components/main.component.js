import React, { PureComponent } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import Login from './login.component';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import {
    login,
    fetchMessages,
    sendMessage,
    checkUser,
    verifyOtp,
    addChat,
    logout,
    receiveMessages,
    changeStatus ,
    uploadProfilePicture,
    updateProfileName,
    resetProfilePicture,
    updateChatName,
    changeStatusInBulk
} from '../redux/ActionCreators';
import Home from './home.component';
import ChatScreen from './chat-screen.component';
import AddUserModal from './addusermodal.component';
import baseurl from '../shared/baseurl';
import io from 'socket.io-client';
import Profile from './profile.component';
import UtfString from 'utfstring';

const mapStateToProps = state => {
    return {
        user: state.user,
        messages: state.messages,
        addChat: state.addChat
    };
};

const mapDispatchToProps = dispatch => {
    return {
        login: (phone) => dispatch(login(phone)),
        fetchMessages: () => dispatch(fetchMessages()),
        sendMessage: (id, from, message, socket, privateKey, nKey, index, type='utf-8') =>
            dispatch(sendMessage(id, from, message, socket, privateKey, nKey, index, type)),
        checkUser: () => dispatch(checkUser()),
        verifyOtp: (phone, otp) => dispatch(verifyOtp(phone,otp)),
        addChatAction: (name, phone, users, toggle) => dispatch(addChat(name, phone, users, toggle)),
        logout: (socket) => {
            dispatch(logout(socket))
            socket=null;
        },
        receiveMessages: (messageDetail, users, socket, userId, privateKey, nKey) =>
            dispatch(receiveMessages(messageDetail, users, socket, userId, privateKey, nKey)),
        changeStatus: (status, userId, index, socket, from, foreignIndex=null) => dispatch(changeStatus(status, userId, index, socket, from, foreignIndex)),
        uploadProfilePicture: (image, name, type) => dispatch(uploadProfilePicture(image, name, type)),
        updateProfileName: name => dispatch(updateProfileName(name)),
        resetProfilePicture: () => dispatch(resetProfilePicture()),
        updateChatName: (id, name) => dispatch(updateChatName(id, name)),
        changeStatusInBulk: (statusList) => dispatch(changeStatusInBulk(statusList))
    };
};

const getEncoding = (message) => {
    let maxCharCode = 0;
    for(let i=0;i<UtfString.length(message);i++) {
        const charCode = UtfString.charCodeAt(message, i);
        maxCharCode = Math.max(maxCharCode, charCode);
    }
    const utf8Limit = 256;
    if(maxCharCode < utf8Limit) return 'utf-8';
    else if(maxCharCode < Math.pow(utf8Limit,2)) return 'utf-16';
    else if(maxCharCode < Math.pow(utf8Limit,3)) return 'utf-24';
    else return 'utf-32';
}

class Main extends PureComponent{
    constructor(props) {
        super(props);
        this.state = {
            addUserModal: false
        };
        this.toggleAddUserModal = this.toggleAddUserModal.bind(this);
        this.sendMessageMinified = this.sendMessageMinified.bind(this);
        this.setUpSocket = this.setUpSocket.bind(this);
        this.dispatchPendingMessagesAndStatus = this.dispatchPendingMessagesAndStatus.bind(this);
    }
    componentDidMount() {
        this.props.checkUser();
        this.setUpSocket();
        this.dispatchPendingMessagesAndStatus();
    }

    toggleAddUserModal() {
        this.setState({
            addUserModal: !this.state.addUserModal
        });
    }

    componentDidUpdate() {
        this.setUpSocket();
        this.dispatchPendingMessagesAndStatus();
    }

    setUpSocket() {
        if(!this.socket && this.props.user.user){
            this.socket = io.connect(baseurl, {query: {token: localStorage.getItem('token')}});
            this.socket.on(this.props.user.user._id, data => {
                if(this.props.user.user) {
                    this.props.receiveMessages([data.messageDetail],
                        this.props.messages.users,
                        this.socket,
                        this.props.user.user._id,
                        this.props.user.user.private,
                        this.props.user.user.n);
                }
                
            });
            this.socket.on(this.props.user.user._id+'Acknoledge', data => {
                this.socket.emit(`AcknoledgementReceived-${JSON.stringify(data)}`, data);
                this.props.changeStatus(
                    data.status,
                    data.to,
                    data.index,
                    this.socket,
                    this.props.user.user._id
                );
            });
        }
    }

    dispatchPendingMessagesAndStatus() {
        if(!this.props.user.user) return;
        const pendingMessages = JSON.parse(localStorage.getItem("pendingMessages"));
        if(pendingMessages.length) {
            console.log(pendingMessages)
            localStorage.setItem("pendingMessages", '[]');
            this.props.receiveMessages(
                pendingMessages,
                this.props.messages.users,
                this.socket,
                this.props.user.user._id,
                this.props.user.user.private,
                this.props.user.user.n
            );
        }
        const pendingStatusList = JSON.parse(localStorage.getItem("pendingStatusList"));
        if(pendingStatusList.length) {
            localStorage.setItem("pendingStatusList", '[]');
            this.props.changeStatusInBulk(pendingStatusList
            .filter(status => this.props.messages.users[status.to] && new Date(status.createdAt) > new Date(this.props.messages.users[status.to].timestamp)));
        }
        
    }

    sendMessageMinified(message, chatId) {
        const user = this.props.user.user;

        this.props.sendMessage(
            chatId,
            user._id,
            message,
            this.socket,
            user.private,
            user.n,
            String(new Date()-0),
            getEncoding(message)
        );
    }

    render(){
        const ChatWithId = ({match}) => {
            const chat = Object.values(this.props.messages.users).filter(message => message._id === match.params.chatId)[0];
            return (
                <ChatScreen history={this.props.history}
                    userId={this.props.user.user._id}
                    privateKey={this.props.user.user.private} nKey={this.props.user.user.n}
                    socket = {this.socket} changeStatus={this.props.changeStatus}
                    chat={chat} toggleMessageBox={this.props.toggleMessageBox}
                />
            );
        }

        return(
            <>
                <Switch>
                    {this.props.user.user
                    ? <>
                        <Route exact path='/home' component={() => <Home user={this.props.user.user}
                            messages={this.props.messages.users}
                            toggleAddUserModal={this.toggleAddUserModal}
                            logout={() => this.props.logout(this.socket)} history={this.props.history} />} />
                        <Route exact path='/chat/:chatId' component={ChatWithId} />
                        <Route exact path='/my-profile' component={() => <Profile user={this.props.user.user}
                            uploadProfilePicture={this.props.uploadProfilePicture}
                            isPictureLoading={this.props.user.isProfilePictureLoading}
                            isNameLoading={this.props.user.isNameLoading}
                            updateProfileName={this.props.updateProfileName}
                            myProfile={true}
                            resetProfilePicture={this.props.resetProfilePicture} />} />
                        <Route exact path='/profile/:profileId'
                            component={({match}) => <Profile
                                user={this.props.messages.users[match.params.profileId]}
                                history={this.props.history}
                                updateChatName={this.props.updateChatName} />} />
                        <Redirect to='/home' />
                    </>
                    : <>
                        <Route exact path='/login' component={() => <Login login={this.props.login}
                            verifyOtp={this.props.verifyOtp}
                            user={this.props.user} history={this.props.history} />} />
                        <Redirect to='/login' />
                    </>}
                </Switch>
                <AddUserModal open={this.state.addUserModal}
                    addChatAction={this.props.addChatAction}
                    addChat={this.props.addChat}
                    toggle={this.toggleAddUserModal}
                    users={this.props.messages.users} />
            </>
        );
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps, null, {forwardRef: true})(Main));