import React from 'react';
import Header from './header.component';
import { ListGroup, ListGroupItem, Media }from 'reactstrap';
import { Link } from 'react-router-dom';
import baseurl from '../shared/baseurl';
import AES256 from '../shared/aes-256';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUserPlus, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { Redirect } from 'react-router-dom';

const getMessageToShow = (message)=> {
    const chats = Object.values(message.chat)
        .sort((message1, message2) => new Date(message1.time) - new Date(message2.time));
    const last = chats.length;
    const text =  chats && last ? AES256.DecryptMain({
        text: chats[last-1].message,
        key: chats[last-1].key
    }, chats[last-1].type):'';
    return (text.length <= 18 ? text : text.substr(0,15)+'...');
}

function Home(props) {
    if(!props.user.name && props.user.image.indexOf('default')!==-1) {
        return <Redirect to='/my-profile' />
    }
    return(
        <>
            <Header title='Messanger' dropdownOptions={[
                {name: 'My Profile', onClick: () => {props.history.push('/my-profile')}, icon: faUser},
                {name: 'Add Contact', onClick: props.toggleAddUserModal, icon: faUserPlus},
                {name: 'Logout', onClick: props.logout, icon: faSignOutAlt}]} />
            {!Object.keys(props.messages).length
            ? <div className="text-secondary" onClick={props.toggleAddUserModal}
                style={{marginTop: '35vh', textAlign: 'center', cursor: 'pointer'}}>
                <FontAwesomeIcon className="mb-3" icon={faUserPlus} style={{fontSize: 50}} />
                <br />
                Click here to<br/>Start your first chat
            </div>
            : null}
            <ListGroup>
                {Object.values(props.messages)
                .sort((message1, message2) => {
                    const getTime = (message) => {
                        const chats = Object.values(message.chat);
                        return (chats && chats.length ? chats[chats.length-1].time : message.timestamp);
                    }
                    const time1 = new Date(getTime(message1));
                    const time2 = new Date(getTime(message2));
                    return time2-time1;
                })
                .map((message, index) => {
                    const chats = Object.values(message.chat);
                    const last = (chats? chats.length : 0);
                    const newMessageCount = chats.reduce((count, chat) => {
                        if(chat.status === 'new') count++;
                        return count;
                    }, 0);
                    return (
                        <ListGroupItem key={index}>
                            <Link to={`/chat/${message._id}`} style={{textDecoration: 'none'}}>
                                <Media>
                                    <Media>
                                        <Media style={{width: 70, marginRight: 10, borderRadius: '50%'}} object src={baseurl+message.image} alt="Profile Picture" />
                                    </Media>
                                    <Media body>
                                        <Media heading className="text-dark">{message.name}</Media>
                                        <div className={!newMessageCount?"text-secondary":"text-dark font-weight-bold"}>
                                            {getMessageToShow(message)}
                                            {newMessageCount ? <><span>{' '}</span><span className="badge badge-pill badge-primary">{newMessageCount}</span></>:null}
                                            <span className="float-right">
                                                {chats && last
                                                ? new Date(chats[last-1].time).toLocaleDateString() === new Date().toLocaleDateString()
                                                ? new Date()-new Date(chats[last-1].time) <= 60000
                                                ? 'Now'
                                                : new Date(chats[last-1].time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                                                : new Date(chats[last-1].time).toLocaleDateString()
                                                :  new Date(message.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </Media>
                                </Media>
                            </Link>
                        </ListGroupItem>
                    );
                })}
            </ListGroup>
        </>
    );
}

export default Home;