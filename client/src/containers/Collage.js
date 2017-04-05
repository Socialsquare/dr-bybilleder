import React, { Component } from 'react';

import CollageCanvas from '../presentationals/CollageCanvas';

class Collage extends Component {

  state = {
    collage: null
  };

  componentDidMount() {
    const id = this.props.match.params.id;
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    fetch('/' + id, {
      headers
    }).then(response => {
      if (response.ok) {
        response.json().then(collage => {
          this.setState({
            collage
          });
        });
      }
    });
  }

  render() {
    return this.state.collage && (
      <CollageCanvas collage={this.state.collage} />
    );
  }
}

export default Collage;
