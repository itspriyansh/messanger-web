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
            users[id].chat.push(messageDetail);
            localStorage.setItem(id, JSON.stringify(users[id].chat));
            return {...state, users: users};
        case ActionTypes.ADD_USER_TO_CHAT:
            users = state.users;
            action.payload.timestamp = Date.now();
            users[action.payload._id] = action.payload;
            localStorage.setItem('users', JSON.stringify(users));
            users[action.payload._id].chat = [];
            localStorage.setItem(action.payload._id,'[]');
            return {...state, users: users};
        case ActionTypes.RECEIVE_MESSAGE:
            messageDetail = action.payload;
            messageDetail.status = 'new';
            messageDetail.time = Date.now();
            users = state.users;
            users[messageDetail.from].chat.push(messageDetail);
            localStorage.setItem(messageDetail.from, JSON.stringify(users[messageDetail.from].chat));
            return {...state, users: users};
        case ActionTypes.UPDATE_STATUS:
            const {status,userId,index} = action.payload;
            users = state.users;
            users[userId].chat[index].status = status;
            localStorage.setItem(userId, JSON.stringify(users[userId].chat));
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
        default:
            return state;
    }
}