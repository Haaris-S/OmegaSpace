import React from 'react'
import vm from 'vm'
import CodeMirror from 'react-codemirror'

require('es6-promise').polyfill();
require('isomorphic-fetch');

import ReactQuill from 'react-quill';
import OmegaLogo from '../assets/OmegaSpace.png';
import GithubLogo from '../assets/GithubLogo.png';

import openSocket from 'socket.io-client';
const socket = openSocket('http://localhost:8000');

import './Home.css'
require('codemirror/lib/codemirror.css');
require('codemirror/theme/dracula.css');
require('codemirror/mode/javascript/javascript');
require('codemirror/addon/edit/closebrackets.js');
// require('');
const sandbox = {}
vm.createContext(sandbox)

class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      text: '',
      savedStatus: 'not saving',
      execution: null,
      notes: '',
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleNotesChange = this.handleNotesChange.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleSaveStatus = this.handleSaveStatus.bind(this);
    this.runCode = this.runCode.bind(this);
    // socket.on('subscribeToText', (text) => {
    //   this.setState({ notes: text });
    // });
  }

  componentDidMount() {
    fetch('/api/gettext')
      .then(res => res.json())
      .then(data => this.setState({ notes: data }));
    socket.on('subscribeToText', (text) => {
      console.log('I am receiving!')
      this.setState({ notes: text });
      // debugger
    });

    socket.on('subscribeToCode', (text) => {
      console.log('I am receiving!')
      this.setState({ text: text });
      // debugger
    });
  };

  handleNotesChange(value) {
    let status = '';

    if (value.length !== this.state.notes.length) {
      console.log("I am emitting!");
      socket.emit('toText', value);
      status = 'Changes not saved.'
    };

    this.setState({ notes: value, savedStatus: status });
  }

  handleChange(value) {
    let status = '';

    if (value.length !== this.state.text.length) {
      // socket.emit('toCode', value);
    };

    this.setState({ text: value});
  };

  handleSaveStatus(status) {
    this.setState({ savedStatus: status })
    if (status === 'Saved!') {
      setTimeout(() => {
        this.setState({ savedStatus: 'not saving' })
      }, 2000)
    }
  }

  handleSave() {
    this.handleSaveStatus('Loading...')
    fetch('/api/savetext', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ notes: this.state.notes })
    })
      .then(res => res.json())
      .then(data => {
        this.handleSaveStatus('Saved!')
      })
  }

  runCode() {
    this.setState({ text: this.refs.editor.getCodeMirror().getValue() })
    let text = this.state.text;

    // const sandbox = {}
    // vm.createContext(sandbox)
    // let result = vm.runInContext(text, sandbox)
    let result = vm.runInNewContext(`${text}`, sandbox)
    this.setState({ execution: result })
  }

  render() {
    let { savedStatus } = this.state;
    let saveStatusRender = () => {
      if (savedStatus === 'not saving') {
        return '';
      } else {
        return savedStatus;
      }
    }
    // console.log(this.state.text)
    return (
      <div>
        <div className="top-nav">
          <div className="omega-logo">
            <img src={OmegaLogo} alt='OmegaSpace Logo' />
          </div>

          <p className="save-status">{saveStatusRender()}</p>

          <div onClick={this.handleSave} className="save-button">
            Save
          </div>

          <div className="github-logo">
            <a href="https://github.com/StephenGrable1/OmegaSpace">
              <img src={GithubLogo} alt="Github Logo" />
            </a>
          </div>
        </div>

        <div id="container">
          <ReactQuill id="quill" theme="snow" placeholder={'Start your Omega journey... '} value={this.state.notes} onChange={this.handleNotesChange} />
          <CodeMirror
            id='editor'
            ref='editor'
            value={this.state.text}
            onChange={this.handleChange}
            options={{
              autoCloseBrackets: true,
              mode: 'javascript',
              lineNumbers: true,
              theme: 'dracula',
            }}
          />

          <div id="bottom-half">
            <div style={{ marginTop: 10 }}>
              <button onClick={this.runCode}>Run Code</button>
            </div>
            
            <div id="execution-context">
              {this.state.execution}
            </div>
          </div>

        </div>
      </div>
    );
  }
};

export default Home;