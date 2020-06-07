import React, { Component } from 'react';
import { Form, Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faCamera, faImage, faVideo, faPaste } from '@fortawesome/free-solid-svg-icons';

class MessageBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            message: '',
            mediaDropdown: false
        }
        this.toggleMediaDropdown = this.toggleMediaDropdown.bind(this);
    }

    toggleMediaDropdown = () => {
        this.setState({mediaDropdown: !this.state.mediaDropdown});
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextState !== {
            message: '',
            mediaDropdown: false
        };
    }

    render() {
        return(
            <Form inline className="fixed-bottom" onSubmit={(event) => {
                this.props.handleSubmit(event, this.state.message);
                this.setState({message: ''});
            }}>
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
        );
    }
}

export default MessageBox;