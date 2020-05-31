import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import Login from './login.component';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { login, fetchMessages, sendMessage, checkUser } from '../redux/ActionCreators';
import Home from './home.component';
import ChatScreen from './chat-screen.component';

const mapStateToProps = state => {
    return {
        user: state.user,
        messages: state.messages
    };
};

const mapDispatchToProps = dispatch => {
    return {
        login: (phone, otp, name) => dispatch(login(phone, otp, name)),
        fetchMessages: () => dispatch(fetchMessages()),
        sendMessage: (id, message) => dispatch(sendMessage(id, message)),
        checkUser: () => dispatch(checkUser())
    };
};

class Main extends Component{

    componentDidMount() {
        this.props.checkUser();
        this.props.fetchMessages();
    }

    render(){
        const ChatWithId = ({match}) => {
            return (
                <ChatScreen sendMessage={this.props.sendMessage} history={this.props.history}
                    chat={this.props.messages.messages.filter(message => message.id === parseInt(match.params.chatId))[0]}
                />
            );
        }

        return(
            <Switch>
                {!this.props.user.user
                ? <>
                    <Route exact path='/login' component={() => <Login login={this.props.login} user={this.props.user.user} />} />
                </> : null}
                {this.props.user.user
                ? <>
                    <Route exact path='/home' component={() => <Home user={this.props.user.user} messages={this.props.messages.messages} />} />
                    <Route exact path='/chat/:chatId' component={ChatWithId} />
                </>
                : null}
                <Redirect to={this.props.user.user ? '/home' : '/login'} />
                <Redirect to='/home' />
            </Switch>
        );
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Main));