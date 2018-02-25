import ImageAnnotationEdit from './components/ImageAnnotationEdit';

import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/App';

const app = document.createElement('div');
app.className = "main-wrapper";
document.body.appendChild(app);

ReactDOM.render(
    <App/>,
    app
);


module.export = {
    ImageAnnotationEdit: ImageAnnotationEdit
};