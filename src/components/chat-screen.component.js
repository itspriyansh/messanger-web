import React from 'react';
import Header from './header.component';
import baseurl from '../shared/baseurl';
import Message from './message.component';

class ChatScreen extends React.Component {
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
                        <div ref={(el) => { this.messagesEnd = el; }}>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ChatScreen;