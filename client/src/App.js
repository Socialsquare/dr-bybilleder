import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route
} from 'react-router-dom';

import Collage from './containers/Collage';

import './App.css';

const Overview = () => {
  return (<h1>Velkommen til Bybilleder</h1>);
};

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Route exact path="/" component={Overview} />
          <Route path="/:id" component={Collage} />
        </div>
      </Router>
    );
  }
}

export default App;
