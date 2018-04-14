import React from 'react'
require('es6-promise').polyfill();
require('isomorphic-fetch');

import ReactQuill from 'react-quill';
import OmegaLogo from '../assets/OmegaSpace.png';
import GithubLogo from '../assets/GithubLogo.png';

import openSocket from 'socket.io-client';
const  socket = openSocket('http://localhost:8000');

import './Home.css'

class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = { text: '' }
    this.handleChange = this.handleChange.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.listenToSocket = this.listenToSocket.bind(this);
  }

  componentDidMount(){
    //This set interval for web socket hack
    // setInterval(() => {
      fetch('/api/gettext')
        .then(res => res.json())
        .then(data => this.setState({ text: data }));

    // }, 10000)


     this.listenToSocket();
    }
    
    listenToSocket() {
    socket.on('subscribeToText', (text) => {
      this.setState({text: text})
      console.log("Hey this is inside socket: ", text);
    });
  }

  handleChange(value) {
    socket.emit('subscribeToText', value);
  }

  handleSave() {
    fetch('/api/savetext', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({text: this.state.text})
    })
      .then(res => res.json())
      .then(data => console.log('here is data from server: ', data))
  }
  render() {
    return (
      <div>
        <div className="top-nav">
          <div className="omega-logo">
            <img src={OmegaLogo} alt='OmegaSpace Logo' />
          </div>

          <div onClick={this.handleSave} className="save-button">
            Save
          </div>

          <div className="github-logo">
            <a href="https://github.com/StephenGrable1/OmegaSpace">
              <img src={GithubLogo} alt="Github Logo" />
            </a>
          </div>

        </div>
        <ReactQuill placeholder={'Start your Omega journey... '} value={this.state.text} onChange={this.handleChange} />
      </div>
    );
  }
};

export default Home;