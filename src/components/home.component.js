import React from 'react';
import Header from './header.component';
import { ListGroup, ListGroupItem, Media }from 'reactstrap';
import { Link } from 'react-router-dom';

function Home(props) {
    return(
        <>
            <Header title='Messanger' dropdownOptions={[{name: 'My Profile'},{name: 'Add Contact'}]} />
            <ListGroup>
                {props.messages.map((message, index) => {
                    return (
                        <ListGroupItem key={index}>
                            <Link to={`/chat/${message.id}`} style={{textDecoration: 'none'}}>
                                <Media>
                                    <Media>
                                        <Media style={{width: 70, marginRight: 10, borderRadius: '50%'}} object src={message.icon} alt="Profile Picture" />
                                    </Media>
                                    <Media body>
                                        <Media heading>{message.name}</Media>
                                        {message.messages.length ? message.messages[message.messages.length-1]:''}
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