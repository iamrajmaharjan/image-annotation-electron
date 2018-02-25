import React from 'react';
// import { Redirect, BrowserRouter } from 'react-router-dom';

const App = (props) => {
//   <BrowserRouter>
//   <div>
//     {window.location.pathname.includes('index.html') && <Redirect to="/" />}
//   </div>
// </BrowserRouter>
  return(
    <div>
      <div className="container">
        {props.children}
      </div>
    </div>
  );
}

export default App;
