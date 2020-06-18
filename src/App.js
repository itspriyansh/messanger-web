import React, { PureComponent } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Main from './components/main.component';
import { Provider } from 'react-redux';
import { ConfigureStore } from './redux/configureStore';
import './App.css';
import MessageBox from './components/message-box.component';

const store = ConfigureStore();;

class App extends PureComponent {
  constructor() {
    super();
    this.toggleMessageBox = this.toggleMessageBox.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
  }

  toggleMessageBox(see, chatId) {
    this.messageBox.toggleMessageBox(see, chatId);
  }

  sendMessage(message, chatId, type=null, name=null, index=null) {
    this.mainComponent.sendMessageMinified(message, chatId, type, name, index);
  }

  render() {
    return (
      <Provider store={store}>
        <BrowserRouter>
          <Main toggleMessageBox={this.toggleMessageBox}
            wrappedComponentRef={instance => this.mainComponent = instance} />
          <MessageBox ref={instance => this.messageBox = instance}
            sendMessage={this.sendMessage} />
        </BrowserRouter>
      </Provider>
    );
  }
}

export default App;
