import * as ActionTypes from './ActionTypes';
import baseurl from '../shared/baseurl';
import AES256 from '../shared/aes-256';
import RSA from '../shared/rsa';
import swal from 'sweetalert';

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

const initialiseLocalStorage = (token, user) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if(!storedUser || storedUser._id !== user._id) {
        localStorage.clear();
        localStorage.setItem('users', '{}');
        localStorage.setItem('pendingMessages', '[]');
        localStorage.setItem('pendingStatusList', '[]');
    }
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
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
    const token = localStorage.getItem('token');
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
            const user = tryUser(JSON.parse(localStorage.getItem('user')));
            dispatch(user);
            localStorage.setItem("pendingMessages", JSON.stringify(response.messages));
            localStorage.setItem("pendingStatusList", JSON.stringify(response.statusList));
            return dispatch(fetchMessages());;
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
            initialiseLocalStorage(response.token, response.user);
            (checkUser())(dispatch);
            swal("Welcome", response.message, "success");
        } else {
            dispatch(submitPhone(response.err, response.err.indexOf('OTP') === -1 ? 'red' : 'orange', phone));
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
    const token = localStorage.getItem('token');
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
                type: ActionTypes.ADD_USERS_TO_CHAT,
                payload: [response.user]
            });
            toggle();
        } else {
            dispatch(addChatError(response.message));
        }
    }).catch(err => {
        dispatch(addChatError(err.message));
    });
}

export const logout = (socket) => dispatch => {
    socket.emit("end");
    swal({
        title: "Do you want to delete your chat data?",
        text: "Once deleted, you will not be able to recover your data!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
        .then((clearData) => {
    if (clearData) {
        dispatch({type: ActionTypes.LOGOUT, payload: true});
        dispatch(checkUser());
    } else {
        dispatch({type: ActionTypes.LOGOUT, payload: false});
        dispatch(checkUser());
    }
    });
}

export const addMessage = (id, messageDetail) => ({
    type: ActionTypes.SEND_MESSAGE,
    payload: {messageDetail: messageDetail, id: id}
});

export const sendMessage = (id, from, message, socket, privateKey, nKey, index, type) => dispatch => {
    const key = AES256.generateRandomKey();
    const messageDetail = {
        from: from,
        key: key,
        message: AES256.EncryptMain({key: key, text: message}, type),
        type: type,
        index: index
    };
    dispatch(addMessage(id, {...messageDetail, status: 'Sending...', time: Date.now()}));
    const token = localStorage.getItem('token');
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

export const receiveMessages = (messageDetails, users, socket, userId, privateKey, nKey) => dispatch => {
    const dispatchReceiveMessage = () => {
        const token = localStorage.getItem('token');
        fetch(baseurl+'users/getKeysInBulk',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer '+token
            },
            body: JSON.stringify({users: messageDetails.map(messageDetail => messageDetail.from)})
        }).then(response => response.json())
        .then(keys => {
            messageDetails.forEach(messageDetail => {
                const encryptedKey = messageDetail.key;
                let decryptedKey = RSA.Decryption(encryptedKey, {private: keys[messageDetail.from].public, n: keys[messageDetail.from].n});
                decryptedKey = RSA.Decryption(decryptedKey, {private: privateKey, n: nKey});
                // let decryptedKey = RSA.Decryption(encryptedKey, {private: privateKey, n: nKey});
                messageDetail.key = decryptedKey;     
            });
            dispatch({
                type: ActionTypes.RECEIVE_MESSAGES,
                payload: messageDetails
            });
        });
        messageDetails.forEach(messageDetail => {
            socket.emit('UpdateStatus', {
                status: "Delivered",
                from: messageDetail.from,
                to: userId,
                index: messageDetail.index
            });
        });
    }
    const newUsers = new Set();
    messageDetails.forEach(messageDetail=> {
        if(!users[messageDetail.from]){
            newUsers.add(messageDetail.from);
        }
    });
    if(newUsers.size){
        const token = localStorage.getItem('token');
        fetch(baseurl+'users/get-info-in-bulk',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer '+token
            },
            body: JSON.stringify({users: [...newUsers]})
        })
        .then(response => response.json())
        .then(response => {
            if(response.success){
                dispatch({
                    type: ActionTypes.ADD_USERS_TO_CHAT,
                    payload: response.users
                });
                dispatchReceiveMessage();
            }
        });
    } else dispatchReceiveMessage();
}

export const changeStatus = (status, userId, index, socket, myUserId, foreignIndex=null) => dispatch => {
    if(foreignIndex){
        socket.emit("UpdateStatus", {
            status: "Seen",
            from: userId,
            to: myUserId,
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
    });
    socket.emit('AcknoledgementReceived', {
        status: status,
        from: userId,
        to: myUserId,
        index: index
    });
}

export const changeStatusInBulk = (statusList) => dispatch => {
    dispatch({
        type: ActionTypes.UPDATE_STATUS_IN_BULK,
        payload: statusList
    });
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
    const token = localStorage.getItem('token');
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
    const token = localStorage.getItem('token');
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
    const token = localStorage.getItem('token');
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