import * as ActionTypes from './ActionTypes';
import baseurl from '../shared/baseurl';
import AES256 from '../shared/aes-256';
import RSA from '../shared/rsa';

const token = localStorage.getItem('token');
export const submitPhone = (message, color='red', phone='+91 ') => ({
    type: ActionTypes.SUBMIT_PHONE,
    payload: {message: message, color: color, phone: phone}
});

export const login = (phone) => dispatch => {
    dispatch({type: ActionTypes.USER_LOADING});
    fetch(baseurl + 'users/login',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({phone: phone})
    })
    .then(response => response.json())
    .then(response => {
        if(response.success) {
            return dispatch(submitPhone(response.message, 'green', phone));
        } else {
            return dispatch(submitPhone(response.err));
        }
    }).catch(err => {
        return dispatch(submitPhone(err.message));
    });
}

export const getMessages = (messages) => ({
    type: ActionTypes.FETCH_MESSAGES,
    payload: messages
});

const initialiseLocalStorage = () => {
    localStorage.clear();
    localStorage.setItem('users', '{}');
}

export const fetchMessages = () => (dispatch) => {
    let users = JSON.parse(localStorage.getItem('users'));
    for(let id in users) {
        users[id].chat = JSON.parse(localStorage.getItem(id));
    }
    dispatch(getMessages(users));
}

export const tryUser = (user) => ({
    type: ActionTypes.CHECK_USER,
    payload: user
});

export const checkUser = () => dispatch => {
    if(!token) {
        return dispatch(tryUser(null));
    }

    fetch(baseurl + 'users',{
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer '+localStorage.getItem('token')
        }
    }).then(response => response.json())
    .then(response => {
        if(response.success){
            dispatch(tryUser(JSON.parse(localStorage.getItem('user'))));
            return dispatch(fetchMessages());
        } else {
            return dispatch(tryUser(null));
        }
    }).catch(err => {
        return dispatch(tryUser(null));
    });
}

export const verifyOtp = (phone, otp) => dispatch => {
    dispatch({type: ActionTypes.USER_LOADING});
    fetch(baseurl + 'users/verify-otp',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: phone,
            password: otp
        })
    }).then(response => response.json())
    .then(response => {
        if(response.success) {
            initialiseLocalStorage();
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            dispatch(checkUser());
            alert(response.message);
        } else {
            dispatch(submitPhone(response.err, response.err.indexOf('OTP') === -1 ? 'red' : 'orange'));
        }
    }).catch(err => {
        dispatch(submitPhone(err.message));
    })
}

const addChatError = (error) => ({
    type: ActionTypes.ADD_CHAT_ERROR,
    payload: error
});

export const addChat = (name, phone, users, toggle) => dispatch => {
    for(let id in users) {
        if(users[id].name === name) {
            return dispatch(addChatError(`${name} is already for ${users[id].phone}`));
        } else if(users[id].phone === phone) {
            return dispatch(addChatError(`${phone} aleady exists in your contacts`));
        }
    }
    dispatch({type: ActionTypes.ADD_CHAT_LOADING});
    fetch(baseurl + 'users/get-info',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer '+token
        },
        body: JSON.stringify({phone: phone})
    }).then(response => response.json())
    .then(response => {
        if(response.success){
            response.user.name = name;
            dispatch({
                type: ActionTypes.ADD_USER_TO_CHAT,
                payload: response.user
            });
            toggle();
        } else {
            dispatch(addChatError(response.message));
        }
    }).catch(err => {
        dispatch(addChatError(err.message));
    });
}

export const logout = () => dispatch => {
    dispatch({type: ActionTypes.LOGOUT});
    dispatch(checkUser());
}

export const addMessage = (id, messageDetail) => ({
    type: ActionTypes.SEND_MESSAGE,
    payload: {messageDetail: messageDetail, id: id}
});

export const sendMessage = (id, from, message, index, socket, privateKey, nKey) => dispatch => {
    const key = AES256.generateRandomKey();
    const messageDetail = {
        from: from,
        key: key,
        message: AES256.EncryptMain({key: key, text: message}),
        type: 'text',
        index: index
    };
    dispatch(addMessage(id, {...messageDetail, status: 'Sending...', time: Date.now()}));
    fetch(baseurl+'users/'+id+'/getKeys',{
        headers: {
            'Authorization': 'Bearer '+token
        }
    }).then(response => response.json())
    .then(keys => {
        let encryptedKey = RSA.Encryption(key, {public: keys.public, n: keys.n});
        encryptedKey = RSA.Encryption(encryptedKey, {public: privateKey, n: nKey});
        // let encryptedKey = RSA.Encryption(key, {public: keys.public, n: keys.n});
        socket.emit('send', {id: id, messageDetail: {...messageDetail, key: encryptedKey}});
    });
}

export const receiveMessage = (messageDetail, users, socket, userId, privateKey, nKey) => dispatch => {
    const dispatchReceiveMessage = () => {
        socket.emit('UpdateStatus', {
            status: "Delivered",
            from: messageDetail.from,
            to: userId,
            index: messageDetail.index
        });
        const encryptedKey = messageDetail.key;
        fetch(baseurl+'users/'+messageDetail.from+'/getKeys',{
            headers: {
                'Authorization': 'Bearer '+token
            }
        }).then(response => response.json())
        .then(keys => {
            let decryptedKey = RSA.Decryption(encryptedKey, {private: keys.public, n: keys.n});
            decryptedKey = RSA.Decryption(decryptedKey, {private: privateKey, n: nKey});
            // let decryptedKey = RSA.Decryption(encryptedKey, {private: privateKey, n: nKey});
            messageDetail.key = decryptedKey;     
            dispatch({
                type: ActionTypes.RECEIVE_MESSAGE,
                payload: messageDetail
            });
        });
    }
    if(!users[messageDetail.from]){
        fetch(baseurl+'users/'+messageDetail.from+'/get-info',{
            headers: {
                'Authorization': 'Bearer '+token
            }
        })
        .then(response => response.json())
        .then(response => {
            if(response.success){
                dispatch({
                    type: ActionTypes.ADD_USER_TO_CHAT,
                    payload: {...response.user, name: response.user.phone}
                });
                dispatchReceiveMessage();
            }
        });
    } else dispatchReceiveMessage();
}

export const changeStatus = (status, userId, index, socket=null, from=null, foreignIndex=null) => dispatch => {
    if(socket){
        socket.emit("UpdateStatus", {
            status: "Seen",
            from: userId,
            to: from,
            index: foreignIndex
        });
    }
    dispatch({
        type: ActionTypes.UPDATE_STATUS,
        payload: {
            status: status,
            userId: userId,
            index: index
        }
    })
}

const decodeBase64Image = (dataString) => {
    var byteString = atob(dataString.split(',')[1]);
    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return ab;
}

export const uploadProfilePicture = (image, name, type) => dispatch => {
    dispatch({type: ActionTypes.USER_PROFILE_PICTURE_LOADING});
    const body = new FormData();
    body.append("image", new Blob([decodeBase64Image(image)], {type: type}), name);

    fetch("http://localhost:3000/users/upload-profile-picture", {
        body:body,
        headers: {
            Authorization: "Bearer "+token
        },
        method: "POST"
    })
    .then(response => response.json())
    .then(response => {
        if(response.success) {
            dispatch({
                type: ActionTypes.UPDATE_PROFILE_PICTURE,
                payload: response.path
            });
        } else {
            dispatch({
                type: ActionTypes.USER_ERR_MESSAGE,
                payload: response.message
            });
        }
    });
}

export const resetProfilePicture = () => dispatch => {
    dispatch({type: ActionTypes.USER_PROFILE_PICTURE_LOADING});

    fetch("http://localhost:3000/users/reset-profile-picture", {
        headers: {
            Authorization: "Bearer "+token
        }
    })
    .then(response => response.json())
    .then(response => {
        if(response.success) {
            dispatch({
                type: ActionTypes.UPDATE_PROFILE_PICTURE,
                payload: response.path
            });
        } else {
            dispatch({
                type: ActionTypes.USER_ERR_MESSAGE,
                payload: response.message
            });
        }
    });
}

export const updateProfileName = (name) => dispatch => {
    dispatch({type: ActionTypes.USER_NAME_LOADING});
    fetch(baseurl + 'users/update-name', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer '+token
        },
        body: JSON.stringify({name: name})
    }).then(response => response.json())
    .then(response => {
        if(response.success) {
            dispatch({
                type: ActionTypes.UPDATE_PROFILE_NAME,
                payload: response.name
            });
        }
    });
}

export const updateChatName = (id, name) => dispatch => {
    dispatch({
        type: ActionTypes.UPDATE_CHAT_NAME,
        payload: {
            _id: id,
            name: name
        }
    });
}