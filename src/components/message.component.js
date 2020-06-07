import React from 'react';
import { Media, Badge } from 'reactstrap';
import baseurl from '../shared/baseurl';
import AES256 from '../shared/aes-256';

function Message({message, userId, prevMessage, last, image}) {
    const notMyMessage = message.from !== userId;
    return(
        <Media style={{alignSelf: notMyMessage ? 'flex-start' : 'flex-end'}}>
            {notMyMessage && (!prevMessage || prevMessage.from!==message.from)
            ? <Media>
                <Media style={{width: 30, marginRight: 0, borderRadius: '50%'}} object src={baseurl+image} alt="Profile Picture" />
            </Media>
            : null}
            <Media body>
                <Badge color={notMyMessage ? 'secondary' : 'primary'}
                style={{fontSize: 15,
                padding: 10,
                margin: 10,
                marginLeft: (notMyMessage && prevMessage && prevMessage.from===message.from ? 40 : 10),
                textAlign: 'left',
                whiteSpace: 'normal'}}>
                        {AES256.DecryptMain({text: message.message, key: message.key})}
                </Badge>
                <br/>
                <div style={{marginTop: -14,
                    marginRight: 10,
                    marginLeft: (notMyMessage && prevMessage && prevMessage.from===message.from ? 40 : 10)}} className={!notMyMessage?" text-right":"text-left"}>
                    <sub className="text-secondary">
                        {new Date() - new Date(message.time) <= 60000
                        ? 'Now'
                        :new Date(message.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </sub>
                    {!notMyMessage && (message.status==='Sending...' || last)
                    ? <>
                        <br />
                        <sup className="text-secondary">{message.status}</sup>
                    </>
                    : null}
                </div>
            </Media>
        </Media>
    );
}

export default Message;