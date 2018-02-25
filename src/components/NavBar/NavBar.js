import React from 'react';
import {Link} from 'react-router-dom';
import {localStorageConstants} from '../../config/localStorageConstants';

let navigations = {
  'Annotate' : '/',
  'Download' : '/download',
  'Log Out':'/login'
}


const NavBar = () => (
<nav className="navbar navbar-default">
<div className="container-fluid">
  <div className="navbar-header">
    <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
      <span className="sr-only">Toggle navigation</span>
      <span className="icon-bar"></span>
      <span className="icon-bar"></span>
      <span className="icon-bar"></span>
    </button>
    <a className="navbar-brand" href="#">Image Annotator</a>
  </div>

  <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
    <ul className="nav navbar-nav navbar-right">
     {
       Object.keys(navigations).map(navigation =>
       <li key={navigation}>
          <Link to={navigations[navigation]} >{navigation}</Link>
        </li>
      )
     }
    </ul>
  </div>
</div>
</nav>
  )

  export default NavBar;
