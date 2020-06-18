import React, { useState } from 'react';
import { Media, Badge } from 'reactstrap';
import baseurl from '../shared/baseurl';
import AES256 from '../shared/aes-256';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamation, faSave, faPaste } from '@fortawesome/free-solid-svg-icons';
import swal from 'sweetalert';
import { save } from 'save-file';
import compressjs from 'keybase-compressjs';
import PictureModal from './picture-modal.component';

const decryptMessage = (message, key, type) => {
    return new Promise(resolve => {
        AES256.DecryptMain({text: message, key: key}, type)
        .then(decryptedMessage => {
            resolve(decryptedMessage);
        });
    });
}

const downloadFile = (name, message, key, type) => {
    decryptMessage(message, key, type)
    .then(compressedFileData => {
        const compressedBuffer = Buffer.alloc(compressedFileData.length);
        for(let i=0;i<compressedFileData.length;i++) {
            compressedBuffer[i] = compressedFileData.charCodeAt(i);
        }
        const algorithm = compressjs.Bzip2;
        let fileData = new Buffer(algorithm.decompressFile(compressedBuffer)).toString('utf8');
        save(fileData, name);
    });
}

function Message({message, userId, prevMessage, last, image, sendMessage, deleteMessage}) {
    const notMyMessage = message.from !== userId;
    const [messageText, setMessageText] = useState('');
    const [open, setOpen] = useState(false);
    const toggleOpen = () => {
        setOpen(!open);
    }

    decryptMessage(message.message, message.key, message.type)
    .then(decryptedMessage => {
        if(message.type === 'image') {
            const compressedBuffer = Buffer.alloc(decryptedMessage.length);
            for(let i=0;i<decryptedMessage.length;i++) {
                compressedBuffer[i] = decryptedMessage.charCodeAt(i);
            }
            const algorithm = compressjs.Bzip2;
            decryptedMessage = new Buffer(algorithm.decompressFile(compressedBuffer)).toString('utf8');
        }
        setMessageText(decryptedMessage);
    });
    const unableToSendAlert = () => {
        swal({
            title: "Unable To Send!",
            icon: "warning",
            buttons: {
                cancel: "Cancel",
                sendAgain: {
                    text: "Send Again",
                    value: "sendAgain"
                },
                delete: {
                    text: "Delete",
                    value: "delete"
                }
            }
        }).then(value => {
            switch(value) {
                case "sendAgain":
                    decryptMessage(message.message, message.key, message.type)
                    .then(messageText => {
                        sendMessage(message.index, messageText, message.type,  message.name);
                    });
                    break;
                case "delete":
                    deleteMessage(message.index);
                    break;
                default:
                    break;
            }
        });
    }
    return(
        <>
            <Media style={{alignSelf: notMyMessage ? 'flex-start' : 'flex-end'}}>
                {notMyMessage && (!prevMessage || prevMessage.from!==message.from)
                ? <Media>
                    <Media style={{width: 30, marginRight: 0, borderRadius: '50%'}} object src={baseurl+image} alt="Profile Picture" />
                </Media>
                : null}
                <Media body>
                    {message.status === "Unable To Send"
                    ? <FontAwesomeIcon icon={faExclamation} size="lg"
                        className="text-danger cursor-pointer" onClick={unableToSendAlert} />
                    : null}
                    <Badge color={notMyMessage ? 'secondary' : 'primary'}
                    style={{fontSize: 15,
                    padding: 10,
                    margin: 10,
                    marginLeft: (notMyMessage && prevMessage && prevMessage.from===message.from ? 40 : 10),
                    textAlign: 'left',
                    whiteSpace: 'normal'}}>
                            {message.type!=='doc' && message.type!=='image' && message.type!=='video'
                            ? messageText
                            : message.type === 'doc'
                            ? <div className="d-flex align-items-center">
                                <FontAwesomeIcon icon={faPaste} style={{fontSize: 30, marginRight: 5}} />
                                {message.name}
                                <FontAwesomeIcon icon={faSave} 
                                    style={{fontSize: 20, marginLeft: 10}}
                                    className="cursor-pointer"
                                    onClick={() => downloadFile(message.name, message.message, message.key, message.type)} />
                            </div>
                            : message.type === 'image'
                            ? <img style={{width: 200}} alt={message.name} src={messageText} onClick={toggleOpen} className="cursor-pointer" />
                            : message.name}
                    </Badge>
                    <br/>
                    <div style={{marginTop: -14,
                        marginRight: 10,
                        marginLeft: (notMyMessage && prevMessage && prevMessage.from===message.from ? 40 : 10)}} className={!notMyMessage?" text-right":"text-left"}>
                        <sub className="text-secondary">
                            {message.status==="Unable To Send"
                            ? null
                            : new Date() - new Date(message.time) <= 60000
                            ? 'Now'
                            :new Date(message.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </sub>
                        {!notMyMessage && (message.status==='Sending...' || last)
                        ? <>
                            <br />
                            <sup className={message.status==="Unable To Send" ? "text-danger":"text-secondary"}>
                                {message.status}
                            </sup>
                        </>
                        : null}
                    </div>
                </Media>
            </Media>
            {message.type === 'image'
            ? <PictureModal open={open} toggle={toggleOpen}
                name={message.name} src={messageText}/>
            : null}
        </>
    );
}

export default Message;