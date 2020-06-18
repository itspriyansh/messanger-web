import React, { PureComponent } from 'react';
import { Form, Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faCamera, faImage, faVideo, faPaste } from '@fortawesome/free-solid-svg-icons';
import imageCompression from 'browser-image-compression';

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
        this.handleSendFile = this.handleSendFile.bind(this);
        this.handleUploadFile = this.handleUploadFile.bind(this);
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

    handleSendFile(type) {
        this[type].click();
    }
    
    async handleUploadFile(event) {
        let file = event.target.files[0];
        const type = event.target.id;
        if(type === 'image') {
            file = await imageCompression(file, {
                maxSizeMB: 1,
                maxWidthOrHeight: 600,
                useWebWorker: true
            });
        }
        const name = file.name;
        var reader = new FileReader();
        reader.readAsDataURL(file);
        // reader.readAsText(file, "UTF-8");
        const index = String(Date.now()-0);
        reader.onload = (event) => {
            this.props.sendMessage(event.target.result, this.state.chatId, type, name, index);
        }
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
                            <DropdownItem onClick={event => this.handleSendFile("doc")}>
                                <FontAwesomeIcon icon={faPaste} />{'  '}Document
                            </DropdownItem>
                            <DropdownItem divider></DropdownItem>
                            <DropdownItem onClick={event => this.handleSendFile("image")}>
                                <FontAwesomeIcon icon={faImage} />{'  '}Image
                            </DropdownItem>
                            <DropdownItem divider></DropdownItem>
                            <DropdownItem onClick={event => this.handleSendFile("video")}>
                                <FontAwesomeIcon icon={faVideo} />{'  '}Video
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                    <Button color="primary"
                        style={{height: 60, width: 60, marginTop: -60, marginLeft: 'auto', borderRadius: '50%'}}>
                        <FontAwesomeIcon icon={faPaperPlane} size="lg" />
                    </Button>
                    <input type="file" id="doc" ref={ref => this.doc=ref} style={{display: "none"}}
                        accept=".xlsx,.xls,image/*,.doc, .docx,.ppt, .pptx,.txt,.pdf"
                        onChange={this.handleUploadFile} />
                    <input type="file" id="image" ref={ref => this.image=ref} style={{display: "none"}}
                        accept="image/*" onChange={this.handleUploadFile} />
                    <input type="file" id="video" ref={ref => this.video=ref} style={{display: "none"}}
                        acccept="video/mp4,video/x-m4v,video/*" capture="camcorder;fileupload"
                        onChange={this.handleUploadFile} />

                </Form>
                : null}
            </>
        );
    }
}

export default MessageBox;