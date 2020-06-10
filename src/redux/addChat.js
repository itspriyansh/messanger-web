import * as ActionTypes from './ActionTypes';

export const addChat = (state = {isLoading: false, errMess: null}, action) => {
    switch(action.type) {
        case ActionTypes.ADD_CHAT_LOADING:
            return {...state, isLoading: true, errMess: null};
        case ActionTypes.ADD_CHAT_ERROR:
            return {...state, isLoading: false, errMess: action.payload};
        default: 
            return {...state, isLoading: false};
    }
}