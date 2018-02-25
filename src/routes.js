import React from 'react';
import {BrowserRouter as Router, Route,Switch,Redirect,hashHistory} from 'react-router-dom';
import App from './components/App';
import Annotate from './components/Annotate';
import Login from './components/Login';
import Annotations from './components/Annotations';
import {localStorageConstants} from './config/localStorageConstants';



let routes = (
  <Router>
    
    <Switch>
      {window.location.pathname.includes('index.html') && <Redirect to="/" />}
    <Route path={'/login'} component={Login} />
    <Route path={'/download'} component={Annotations} />
    <Route exact path={'/'} component={Annotate}/>
    </Switch>
  </Router>
);

export default routes;
