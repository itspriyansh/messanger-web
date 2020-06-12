import * as ActionTypes from './ActionTypes';

export const Messages = (state = {users: {}}, action) => {
    let users, messageDetail;
    switch(action.type) {
        case ActionTypes.FETCH_MESSAGES:
            return {...state, users: action.payload};
        case ActionTypes.SEND_MESSAGE:
            messageDetail = action.payload.messageDetail;
            const id = action.payload.id;
            users = state.users;
            users[id].chat[messageDetail.index] =  messageDetail;
            localStorage.setItem(id, JSON.stringify(users[id].chat));
            return {...state, users: users};
        case ActionTypes.ADD_USERS_TO_CHAT:
            users = state.users;
            action.payload.forEach(user => {
                user.timestamp = Date.now();
                if(!user.name) {
                    user.name = user.phone;
                }
                users[user._id] = user;
            });
            localStorage.setItem('users', JSON.stringify(users));
            action.payload.forEach(user => {
                users[user._id].chat = {};
                localStorage.setItem(user._id,'{}');
            });
            return {...state, users: users};
        case ActionTypes.RECEIVE_MESSAGES:
            const messageDetails = action.payload;
            users = state.users;
            messageDetails.forEach((messageDetail, index) => {
                messageDetail.status = 'new';
                users[messageDetail.from].chat[`${String(new Date()-0)}-${index}`] = messageDetail;
                localStorage.setItem(messageDetail.from, JSON.stringify(users[messageDetail.from].chat));
            });
            return {...state, users: users};
        case ActionTypes.UPDATE_STATUS:
            const {status,userId,index} = action.payload;
            users = state.users;
            if(users[userId].chat[index] && (users[userId].chat[index].status!=='Seen' || !(users[userId].chat[index].status === 'Delivered' && status==='Sent'))) {
                users[userId].chat[index].status = status;
                localStorage.setItem(userId, JSON.stringify(users[userId].chat));
            }
            return {...state, users: users};
        case ActionTypes.UPDATE_CHAT_NAME:
            const {_id, name} = action.payload;
            users = state.users;
            users[_id].name = name;
            const chat = users[_id].chat;
            delete users[_id].chat;
            localStorage.setItem('users', JSON.stringify(users));
            users[_id].chat = chat;
            return {...state, users: users};
        case ActionTypes.UPDATE_STATUS_IN_BULK:
            const statusList = action.payload;
            users = state.users;
            const modifiedChats = new Set();
            statusList.forEach(statusData => {
                if(users[statusData.to] && users[statusData.to].chat[statusData.index]) {
                    users[statusData.to].chat[statusData.index].status = statusData.status;
                    modifiedChats.add(statusData.to);
                }
            });
            [...modifiedChats].forEach(userId=> {
                localStorage.setItem(userId, JSON.stringify(users[userId].chat));
            });
            return {...state, users: users};
        default:
            return state;
    }
}