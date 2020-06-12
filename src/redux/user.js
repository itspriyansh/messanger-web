import * as ActionTypes from './ActionTypes';

export const User = (state={
    isLoading: true,
    errMess: null,
    user: null,
    color: 'red',
    phone: '+91 ',
    isProfilePictureLoading: false,
    isNameLoading: false
}, action) => {
    let user;
    switch(action.type) {
        case ActionTypes.CHECK_USER:
            return {...state, isLoading: false, user: action.payload, errMess: null};
        case ActionTypes.SUBMIT_PHONE:
            return {...state, isLoading: false, errMess: action.payload.message, color: action.payload.color, phone: action.payload.phone};
        case ActionTypes.USER_LOADING:
            return {...state, isLoading: true, color: 'red'};
        case ActionTypes.USER_PROFILE_PICTURE_LOADING:
            return {...state, isProfilePictureLoading: true, color: 'red'};
        case ActionTypes.USER_NAME_LOADING:
            return {...state, isNameLoading: true, color: 'red'};
        case ActionTypes.LOGOUT:
            localStorage.removeItem("token");
            if(action.payload) {
                localStorage.clear();
            }
            return {...state, user: null};
        case ActionTypes.USER_ERR_MESSAGE:
            return {...state, isLoading: false,
                isProfilePictureLoading: false,
                isNameLoading: false,
                errMess: action.payload,
                color: 'red'};
        case ActionTypes.UPDATE_PROFILE_PICTURE:
            user = JSON.parse(localStorage.getItem('user'));
            user.image = action.payload;
            localStorage.setItem('user', JSON.stringify(user));
            return {...state, user: user, errMess: null, isProfilePictureLoading: false}
        case ActionTypes.UPDATE_PROFILE_NAME:
            user = JSON.parse(localStorage.getItem('user'));
            user.name = action.payload;
            localStorage.setItem('user', JSON.stringify(user));
            return {...state, user: user, errMess: null, isNameLoading: false}
        default:
            return state;
    }
}