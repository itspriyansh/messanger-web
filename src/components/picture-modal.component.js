import React from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';

function PictureModal({open, toggle, name, src}) {
    return(
        <Modal isOpen={open} toggle={toggle}>
            <ModalHeader toggle={toggle}>{name}</ModalHeader>
            <ModalBody>
                <img src={src} alt={name} className="w-100 img-fluid" />
            </ModalBody>
        </Modal>
    );
}

export default PictureModal;