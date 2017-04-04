import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

require('es6-promise').polyfill();
require('isomorphic-fetch');

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
