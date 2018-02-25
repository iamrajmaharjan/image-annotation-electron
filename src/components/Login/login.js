import React, {Component} from 'react';
import { post} from '../../utils/httpUtils';
import {baseUrl, uri} from '../../config/uri';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
// const electron = window.require('electron');

const USER_TOKEN = 'userToken';
const window=null;

class Login extends Component {

    constructor(props){
        super(props);

        this.state = {
          email:'',
          password:''
        }
    }

componentWillMount(){
   localStorage.removeItem(USER_TOKEN);
}

componentDidMount(){  
    
 }

  render(){

    return(
        <MuiThemeProvider>
          <AppBar
            style={{textAlign:'center'}}
            showMenuIconButton={false}
            title="Login"
           />
           <div className="container" style={{width:'300px'}}>
           <TextField
             type="email"
             hintText="Enter your Email Address"
             floatingLabelText="Email"
             onChange = {(event,newValue) => this.setState({email:newValue})}
             />
           <br/>
             <TextField
               type="password"
               hintText="Enter your Password"
               floatingLabelText="Password"
               onChange = {(event,newValue) => this.setState({password:newValue})}
               />
             <br/>
             <RaisedButton label="Submit" primary={true} style={{margin: 15}} onClick={(event) => this.handleClick(event)}/>
         </div>
         </MuiThemeProvider>

    );
  }

  handleClick(event){
    if(!this.state.email || !this.state.password){
        alert("Email and Password are required.");
        return;
    } 
    var payload={
        "emailId":this.state.email,
        "password":this.state.password
        }
    post(`${uri.authenticate}`, payload)
    .then(response=> {
        if(response.data){
            localStorage.setItem(USER_TOKEN, response.data);
            this.props.history.push("/")
        }
    })
    .catch(error=> {
        debugger;
       alert("Email and Password combination does not match.");
    });
    }
}
export default Login;