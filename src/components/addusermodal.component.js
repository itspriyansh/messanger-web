import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';
import Loading from './loading.component';

function AddUserModal(props) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('+91 ');

    function onChange(event) {
        const value = event.target.value;
        const name = event.target.name;
        if(name==='name'){
            setName(value);
            return;
        }
        if(value.indexOf('+91 ')!==-1 && !isNaN(Number(value.substr(4))) && value.length<=14){
            setPhone(value);
        }
    }

    return(
        <Modal isOpen={props.open} toggle={props.toggle}>
            <ModalHeader toggle={props.toggle}>Add User</ModalHeader>
            <ModalBody>
                {!props.addChat.isLoading
                ? <Form>
                    <FormGroup>
                        <Label className="text-danger">{props.addChat.errMess}</Label>
                    </FormGroup>
                    <FormGroup>
                        <Label for="addUserName">Name</Label>
                        <Input type="text" name="name" id="addUserName" placeholder="Name of the user"
                        value={name} onChange={event => onChange(event)} />
                    </FormGroup>
                    <FormGroup>
                        <Label for="addUserPhone">Phone No.</Label>
                        <Input type="tex" name="phone" id="addUserPhone" 
                        value={phone} onChange={event => onChange(event)} />
                    </FormGroup>
                </Form>
                : <Loading marginTop='12vh' marginBottom='12vh' />}
            </ModalBody>
            <ModalFooter>
                <Button color="primary" disabled={!name.length || phone.length<14}
                onClick={() => props.addChatAction(name,phone,props.users,props.toggle)}>Confirm</Button>{' '}
                <Button color="secondary" onClick={props.toggle}>Cancel</Button>
            </ModalFooter>
        </Modal>
    );
}

export default AddUserModal;