import *as ActionTypes from './ActionTypes';

export const Messages = (state = {messages: []}, action) => {
    switch(action.type) {
        case ActionTypes.FETCH_MESSAGES:
            return {...state, messages: action.payload};
        case ActionTypes.SEND_MESSAGE:
            let messages = state.messages;
            const id = parseInt(action.payload.id);
            const message = action.payload.message;
            let chat = messages.filter(messages => messages.id === id)[0];
            chat.messages.push(message);
            localStorage.setItem(chat.id, JSON.stringify(chat.messages));
            return {...state, messages: messages};
        default:
            return state;
    }
}