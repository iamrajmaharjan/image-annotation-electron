import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import Routes from './routes';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import 'bootstrap/dist/css/bootstrap.css'
import './static/css/main.css';
// ReactDOM.render(
//   <App />,
//   document.getElementById('root')
// );

ReactDOM.render(<MuiThemeProvider> {Routes} </MuiThemeProvider>, document.getElementById('root'));
