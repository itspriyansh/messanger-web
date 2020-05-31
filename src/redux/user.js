import * as ActionTypes from './ActionTypes';

export const User = (state={isLoading: false, errMess: null, user: null}, action) => {
    switch(action.type) {
        case ActionTypes.CHECK_USER:
            let user = localStorage.getItem('user');
            if(user) user = JSON.parse(user);
            return {...state, user: user};
        case ActionTypes.LOGIN:
            localStorage.setItem('user', JSON.stringify(action.payload));
            return {...state, user: action.payload};
        default:
            return state;
    }
}