import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';
import DropNCrop from '@synapsestudios/react-drop-n-crop';
import '@synapsestudios/react-drop-n-crop/lib/react-drop-n-crop.min.css';

function UploadPicture(props) {
    const [value, setValue] = useState({
        result: null,
        filename: null,
        filetype: null,
        src: null,
        error: null,
    });
    const [disabled, setDisabled] = useState(true);
    const [changeCount, setChangeCount] = useState(0);
    const onChange = value => {
        setValue(value);
        changeCount === 1 ? setDisabled(false) : setChangeCount(changeCount+1);
    };

    const onSubmit = async() => {
        props.uploadProfilePicture(value.result, value.filename, value.filetype);
        setValue({
            result: null,
            filename: null,
            filetype: null,
            src: null,
            error: null,
        });
        setDisabled(true);
        setChangeCount(0);
        props.toggle();
    }

    return(
        <Modal isOpen={props.open} toggle={props.toggle}>
            <ModalHeader toggle={props.toggle}>Upload Picture</ModalHeader>
            <ModalBody>
                <DropNCrop onChange={onChange} value={value}
                    cropperOptions={{guides: true, viewMode: 0, autoCropArea: 1, aspectRatio: 1/1}} />
            </ModalBody>
            <ModalFooter>
                <Button color="primary" disabled={disabled}
                    onClick={onSubmit}>Confirm</Button>{' '}
                <Button color="secondary" onClick={props.toggle}>Cancel</Button>
            </ModalFooter>
        </Modal>
    );
}

export default UploadPicture;