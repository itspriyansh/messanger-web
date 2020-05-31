import React from 'react';
import Header from './header.component';
import { Form, Button, Badge, Media } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

class ChatScreen extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            message: ''
        }
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    scrollToBottom = () => {
        if(this.messagesEnd)
        this.messagesEnd.scrollIntoView();
    }
      
    componentDidMount() {
        this.scrollToBottom();
    }
      
    componentDidUpdate() {
        this.scrollToBottom();
    }

    handleSubmit(event) {
        event.preventDefault();
        if(!this.state.message) return;
        this.props.sendMessage(this.props.chat.id, this.state.message);
        this.setState({message: ''});
    }

    render(){
        if(!this.props.chat){
            return(<div>Loading...</div>);
        }
        return(
            <div className="bg-light" style={{height: '100vh'}}>
                <Header history={this.props.history} icon={this.props.chat.icon} title={this.props.chat.name} back={true} />
                <div style={{height: '80vh', overflowY: 'scroll'}}>
                    <div style={{display: "flex", flexDirection: "column", justifyContent: 'flex-end'}}>
                        {this.props.chat.messages.map((message, index) => {
                            return(
                                <Media key={index} style={{alignSelf: index%2 ? 'flex-start' : 'flex-end'}}>
                                    {index%2
                                    ? <Media>
                                        <Media style={{width: 30, marginRight: 0, borderRadius: '50%'}} object src={this.props.chat.icon} alt="Profile Picture" />
                                    </Media>
                                    : null}
                                    <Media body>
                                        <Badge color={index%2 ? 'secondary' : 'primary'}
                                        style={{fontSize: 15, padding: 10, margin: 10, textAlign: 'left', whiteSpace: 'normal'}}>
                                                {message}
                                        </Badge>
                                    </Media>
                                </Media>
                            );
                        })}
                    </div>
                    <div style={{ float:"left", clear: "both" }}
                        ref={(el) => { this.messagesEnd = el; }}>
                    </div>
                </div>
                <Form inline className="fixed-bottom" onSubmit={this.handleSubmit}>
                    <textarea name="message" id="message" value={this.state.message}
                        onChange={event => this.setState({message: event.target.value})}
                        placeholder="Enter Message Here" style={{height: 60, width: '85%', borderRadius: 30, padding: 10, borderColor: 'grey', fontSize: 20, resize: 'none'}}>
                    </textarea>
                    <Button color="primary"
                        style={{height: 60, width: 60, borderRadius: '50%'}}>
                        <FontAwesomeIcon icon={faPaperPlane} size="lg" />
                    </Button>
                </Form>
            </div>
        );
    }
}

export default ChatScreen;