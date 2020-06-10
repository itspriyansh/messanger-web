import React, { PureComponent } from 'react';
import { Form, Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faCamera, faImage, faVideo, faPaste } from '@fortawesome/free-solid-svg-icons';

class MessageBox extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            message: '',
            mediaDropdown: false,
            render: false,
            chatId: null
        }
        this.toggleMediaDropdown = this.toggleMediaDropdown.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.toggleMessageBox = this.toggleMessageBox.bind(this);
    }

    toggleMessageBox(render, chatId) {
        if(render!==this.state.render || chatId!==this.state.chatId){
            this.setState({
            render: render,
            chatId: chatId
            });
        }
      }

    handleSubmit(event) {
        event.preventDefault();
        if(!this.state.message) return;
        this.props.sendMessage(this.state.message,this.state.chatId);
        this.setState({message: ''});
    }

    toggleMediaDropdown = () => {
        this.setState({mediaDropdown: !this.state.mediaDropdown});
    }

    render() {
        return(
            <>
                {this.state.render
                ? <Form inline className="fixed-bottom" onSubmit={this.handleSubmit}>
                    <textarea name="message" id="message" value={this.state.message}
                        onChange={event => this.setState({message: event.target.value})}
                        placeholder="Enter Message Here" style={{height: 60,
                        width: '100%',
                        zIndex:"-100",
                        borderRadius: 30,
                        padding: 10,
                        paddingRight: 65,
                        paddingLeft: 60,
                        borderColor: 'grey',
                        fontSize: 20,
                        resize: 'none'}}>
                    </textarea>
                    <Dropdown direction="up"
                        isOpen={this.state.mediaDropdown}
                        toggle={this.toggleMediaDropdown}
                        style={{marginTop: -60}}>
                        <DropdownToggle style={{marginLeft: 5, width: 50, height: 50, borderRadius: '50%'}}>
                            <FontAwesomeIcon icon={faCamera} size="lg" />
                        </DropdownToggle>
                        <DropdownMenu>
                            <DropdownItem>
                                <FontAwesomeIcon icon={faPaste} />{'  '}Document
                            </DropdownItem>
                            <DropdownItem divider></DropdownItem>
                            <DropdownItem>
                                <FontAwesomeIcon icon={faImage} />{'  '}Image
                            </DropdownItem>
                            <DropdownItem divider></DropdownItem>
                            <DropdownItem>
                                <FontAwesomeIcon icon={faVideo} />{'  '}Video
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                    <Button color="primary"
                        style={{height: 60, width: 60, marginTop: -60, marginLeft: 'auto', borderRadius: '50%'}}>
                        <FontAwesomeIcon icon={faPaperPlane} size="lg" />
                    </Button>
                </Form>
                : null}
            </>
        );
    }
}

export default MessageBox;