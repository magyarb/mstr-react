import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';

var convert = require('xml-js');

class App extends Component {
    constructor(props) {
        super(props);
        this.state = ({
            response: {},
            respOK: false,
            loginData: {},
            strtosend: '',
            token: '',
            username: '',
            password: '',
            baseUrl: 'https://bixdev01/MicroStrategy/asp/TaskAdmin.aspx',
            loginparams: {
                taskId: 'getSessionState',
                taskEnv: 'xml',
                taskContentType: 'xml',
                server: 'bixdev01',
                project: 'OTP DEMO'
            },
            reportparams: {
                taskId: 'reportExecute',
                taskEnv: 'xml',
                taskContentType: 'xml',
                styleName: 'ReportGridStyle',
                maxRows: 150000
            },
            iserr: false,
            reportID: '5F21893446622B9A22125A955931AAEF'
        });
    }

    componentDidMount() {
        //this.login();
    }

    send() {
        var payload = {};
        payload.params = this.state.reportparams;
        payload.params.sessionState = this.state.token;
        payload.params.reportID = this.state.reportID;
        payload.params.valuePromptAnswers = this.state.strtosend;
        console.log(payload);
        axios.get(this.state.baseUrl, payload)
            .then(res => {
                try {
                    var json = convert.xml2json(res.data, {compact: true, spaces: 4});
                    var obj = JSON.parse(json);
                    console.log(obj);
                    var resp = obj.taskResponse.div.table[0].tr.td.div.div.div.table.tr;
                    console.log(resp);
                    this.setState({response: resp, respOK: true});
                }
                catch (e) {
                    alert('error parsing');
                    this.setState({respOK: false});
                }
            }).catch(error => {
            this.setState({iserr: true, response: error, respOK: false});
        });
    }

    login() {
        var payload = {};
        payload.params = this.state.loginparams;
        payload.params.uid = this.state.username;
        payload.params.pwd = this.state.password;
        console.log(JSON.stringify(payload));
        axios.get(this.state.baseUrl, payload)
            .then(res => {
                try {
                    var json = convert.xml2json(res.data, {compact: true, spaces: 4});
                    var obj = JSON.parse(json);
                    var token = obj.taskResponse['session-states']['min-state']._text;
                    this.setState({token: token});
                }
                catch (e) {
                    alert('error logging in');
                }
            }).catch(error => {
            this.setState({iserr: true, response: error});
        });
    }

    handleChange(e) {
        var prop = e.target.name;
        var obj = {};
        obj[prop] = e.target.value;
        this.setState(obj);
    }

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo"/>
                    <h1 className="App-title">Welcome to React-MSTR</h1>
                </header>
                <p className="App-intro">
                    user:
                    <input name="username" onChange={this.handleChange.bind(this)}
                           placeholder="username" className="form-control" value={this.state.username}/><br/>
                    passwd:
                    <input name="password" onChange={this.handleChange.bind(this)}
                           placeholder="password" className="form-control" value={this.state.password}/><br/>
                    <button onClick={this.login.bind(this)}>OK</button>
                    <br/><br/>
                    {this.state.token === '' ? ('Not logged in.') : ('Logged in.')}
                    <br/><br/>
                    reportid:
                    <input name="reportID" onChange={this.handleChange.bind(this)}
                           placeholder="reportid" className="form-control" value={this.state.reportID}/><br/>
                    parameter:
                    <input name="strtosend" onChange={this.handleChange.bind(this)}
                           placeholder="parameter" className="form-control" value={this.state.strtosend}/><br/>
                    <button onClick={this.send.bind(this)}>OK</button>
                    <br/><br/>
                    <table>
                    {this.state.respOK === true ? (this.state.response.map(item => (
                            <tr>
                                {item.TD.map(tditem => (
                                    <td>
                                    {tditem._text}
                                    </td>
                                ))}
                            </tr>)))
                     : ""}
                    </table>

                </p>
            </div>
        );
    }
}

export default App;
