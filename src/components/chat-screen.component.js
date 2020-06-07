import React from 'react';
import Header from './header.component';
import baseurl from '../shared/baseurl';
import Message from './message.component';
import MessageBox from './message-box.component';

class ChatScreen extends React.Component {
    constructor(props){
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    scrollToBottom = () => {
        if(this.messagesEnd)
        this.messagesEnd.scrollIntoView();
    }
    

    componentDidMount() {
        this.scrollToBottom();
        this.props.chat.chat.forEach((message, index) => {
            const notMyMessage = this.props.userId !== message.from;
            if(notMyMessage && message.status === 'new') {
                this.props.changeStatus('', message.from, index, this.props.socket, this.props.userId, message.index);
            }
        });
    }
      
    componentDidUpdate() {
        this.scrollToBottom();
        this.props.chat.chat.forEach((message, index) => {
            const notMyMessage = this.props.userId !== message.from;
            if(notMyMessage && message.status === 'new') {
                this.props.changeStatus('', message.from, index, this.props.socket, this.props.userId, message.index);
            }
        });
    }

    handleSubmit(event, message) {
        event.preventDefault();
        if(!message) return;
        this.props.sendMessage(this.props.chat._id,
            this.props.userId,
            message,
            this.props.chat.chat.length,
            this.props.socket,
            this.props.privateKey,
            this.props.nKey);
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
                    <div style={{display: "flex", flexDirection: "column", height: '80vh'}}>
                        {this.props.chat.chat.map((message, index) => {
                            return(
                                <React.Fragment key={index}>
                                    {!index || new Date(message.time).toLocaleDateString() !== new Date(this.props.chat.chat[index-1].time).toLocaleDateString()
                                    ? <div className="text-center my-3">{new Date(message.time).toLocaleDateString()}</div>
                                    : null}
                                    <Message message={message} userId={this.props.userId}
                                    last={index+1 === this.props.chat.chat.length}
                                    image={this.props.chat.image}
                                    prevMessage={(index ? this.props.chat.chat[index-1] : null)} />
                                </React.Fragment>
                            );
                        })}
                    </div>
                    <div style={{clear: "both" }}
                        ref={(el) => { this.messagesEnd = el; }}>
                    </div>
                </div>
                <MessageBox handleSubmit={this.handleSubmit} />
            </div>
        );
    }
}

export default ChatScreen;