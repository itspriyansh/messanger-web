import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';
import { User } from './user';
import { Messages } from './messages';

export const ConfigureStore = () => {
    return createStore(combineReducers({
        user: User,
        messages: Messages
    }),
    applyMiddleware(thunk, logger));
};