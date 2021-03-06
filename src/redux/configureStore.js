import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';
import { User } from './user';
import { Messages } from './messages';
import { addChat } from './addChat';

export const ConfigureStore = () => {
    return createStore(combineReducers({
        user: User,
        messages: Messages,
        addChat: addChat
    }),
    applyMiddleware(thunk, logger));
};