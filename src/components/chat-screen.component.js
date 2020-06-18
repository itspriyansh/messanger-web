import React from 'react';
import Header from './header.component';
import baseurl from '../shared/baseurl';
import Message from './message.component';

class ChatScreen extends React.Component {
    constructor() {
        super();
        this.markSeen = this.markSeen.bind(this);
        this.scrollToBottom = this.scrollToBottom.bind(this);
        this.sendMessageMinified = this.sendMessageMinified.bind(this);
        this.deleteMessageMinified = this.deleteMessageMinified.bind(this);
    }
    scrollToBottom = () => {
        if(this.messagesEnd)
        this.messagesEnd.scrollIntoView();
    }

    componentWillUnmount() {
        if(this.props.history.location.pathname !== `/chat/${this.props.chat._id}`) {
            this.props.toggleMessageBox(false, null);
        }
    }

    componentDidMount() {
        this.props.toggleMessageBox(true, this.props.chat._id);
        this.scrollToBottom();
        this.markSeen();
    }
      
    componentDidUpdate() {
        this.scrollToBottom();
        this.markSeen();
    }

    markSeen() {
        Object.keys(this.props.chat.chat).forEach((index) => {
            const message = this.props.chat.chat[index];
            const notMyMessage = this.props.userId !== message.from;
            if(notMyMessage && message.status === 'new') {
                this.props.changeStatus('', message.from, index, this.props.socket, this.props.userId, message.index);
            }
        });
    }

    sendMessageMinified(index,message, type) {
        this.props.sendMessage(
            this.props.chat._id,
            this.props.userId,
            message,
            this.props.socket,
            this.props.privateKey,
            this.props.nKey,
            index,
            type
        );
    }

    deleteMessageMinified(index) {
        this.props.deleteMessage(this.props.chat._id, index);
    }

    render(){
        if(!this.props.chat){
            return(<div>Loading...</div>);
        }
        return(
            <div className="bg-light" style={{height: '100vh', backgroundAttachment: 'fixed'}}>
                <Header history={this.props.history}
                    icon={baseurl+this.props.chat.image} link={`/profile/${this.props.chat._id}`}
                    title={this.props.chat.name} back={true} />
                <div style={{overflowY: 'scroll'}}>
                    <div style={{display: "flex", flexDirection: "column", height: '78vh'}}>
                        {Object.values(this.props.chat.chat)
                        .sort((message1, message2) => new Date(message1.time) - new Date(message2.time))
                        .map((message, index) => {
                            return(
                                <React.Fragment key={index}>
                                    {!index || new Date(message.time).toLocaleDateString() !== new Date(Object.values(this.props.chat.chat)[index-1].time).toLocaleDateString()
                                    ? <div className="text-center my-3">{new Date(message.time).toLocaleDateString()}</div>
                                    : null}
                                    <Message message={message} userId={this.props.userId}
                                    last={index+1 === Object.values(this.props.chat.chat).length}
                                    image={this.props.chat.image}
                                    prevMessage={(index ? Object.values(this.props.chat.chat)[index-1] : null)}
                                    sendMessage={this.sendMessageMinified}
                                    deleteMessage={this.deleteMessageMinified} />
                                </React.Fragment>
                            );
                        })}
                        <div ref={(el) => { this.messagesEnd = el; }}>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ChatScreen;