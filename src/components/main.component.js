import React, { Component } from 'react';
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
    receiveMessage,
    changeStatus ,
    uploadProfilePicture,
    updateProfileName,
    resetProfilePicture,
    updateChatName
} from '../redux/ActionCreators';
import Home from './home.component';
import ChatScreen from './chat-screen.component';
import AddUserModal from './addusermodal.component';
import baseurl from '../shared/baseurl';
import io from 'socket.io-client';
import Profile from './profile.component';

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
        sendMessage: (id, from, message, index, socket, privateKey, nKey) => dispatch(sendMessage(id, from, message, index, socket, privateKey, nKey)),
        checkUser: () => dispatch(checkUser()),
        verifyOtp: (phone, otp) => dispatch(verifyOtp(phone,otp)),
        addChatAction: (name, phone, users, toggle) => dispatch(addChat(name, phone, users, toggle)),
        logout: () => dispatch(logout()),
        receiveMessage: (messageDetail, users, socket, userId, privateKey, nKey) => dispatch(receiveMessage(messageDetail, users, socket, userId, privateKey, nKey)),
        changeStatus: (status, userId, index, socket=null, from=null, foreignIndex=null) => dispatch(changeStatus(status, userId, index, socket, from, foreignIndex)),
        uploadProfilePicture: (image, name, type) => dispatch(uploadProfilePicture(image, name, type)),
        updateProfileName: name => dispatch(updateProfileName(name)),
        resetProfilePicture: () => dispatch(resetProfilePicture()),
        updateChatName: (id, name) => dispatch(updateChatName(id, name))
    };
};

class Main extends Component{
    constructor(props) {
        super(props);
        this.state = {
            addUserModal: false
        };
        this.toggleAddUserModal = this.toggleAddUserModal.bind(this);
    }
    componentDidMount() {
        this.props.checkUser();
    }

    toggleAddUserModal() {
        this.setState({
            addUserModal: !this.state.addUserModal
        });
    }

    componentDidUpdate() {
        if(!this.socket && this.props.user.user){
            this.socket = io.connect(baseurl, {query: {token: localStorage.getItem('token')}});
            this.socket.on(this.props.user.user._id, data => {
                this.props.receiveMessage(data.messageDetail,
                    this.props.messages.users,
                    this.socket,
                    this.props.user.user._id,
                    this.props.user.user.private,
                    this.props.user.user.n);
                
            });
            this.socket.on(this.props.user.user._id+'Acknoledge', data => {
                this.props.changeStatus(data.status, data.to, data.index);
            });
        }
    }

    render(){
        const ChatWithId = ({match}) => {
            return (
                <ChatScreen sendMessage={this.props.sendMessage} history={this.props.history}
                    userId={this.props.user.user._id}
                    privateKey={this.props.user.user.private} nKey={this.props.user.user.n}
                    socket = {this.socket} changeStatus={this.props.changeStatus}
                    chat={Object.values(this.props.messages.users).filter(message => message._id === match.params.chatId)[0]}
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
                            logout={this.props.logout} history={this.props.history} />} />
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
                        <Redirect to={(!this.props.user.user.name && this.props.user.user.image.indexOf('default')!==-1 ? '/my-profile' : '/home')} />
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Main));