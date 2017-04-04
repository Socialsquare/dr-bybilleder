import React, { Component } from 'react';

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
    const id = this.props.match.params.id;
    return (
      <div>
        <h1>Collage #{id}</h1>
        {this.state.collage ? (
          <img src={this.state.collage.thumbnail} alt="Collage" />
        ) : null}
      </div>
    );
  }
}

export default Collage;
