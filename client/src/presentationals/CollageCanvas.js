import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { fullscreen } from '../utils';
import Videos from './Video';

import './CollageCanvas.css';
// import DogGridSvg from '../svgs/dot-grid.svg';
// import PlaySvg from '../svgs/play.svg';
import FullscreenSvg from '../svgs/fullscreen.svg';
import FullscreenOffSvg from '../svgs/fullscreen-off.svg';

export default class CollageCanvas extends Component {
  static propTypes = {
    collage: PropTypes.object.isRequired
  }

  state = {
    background: null
  }

  constructor() {
    super();
    this.resized = this.resized.bind(this);
    this.fullscreen = this.fullscreen.bind(this);
    this.muteAllPlayers = this.muteAllPlayers.bind(this);

    this.muteAllOnNextRender = false;

    this.players = [];
  }

  componentDidMount() {
    this.loadResources();
    window.addEventListener('resize', this.resized);
    this.resized();
  }

  componentDidUpdate(prevProps, prevState) {
    if(prevProps.collage.id !== this.props.collage.id) {
      this.loadResources();
    }
    this.drawCanvas();
    this.muteAllOnNextRender = false;
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resized);
  }

  muteAllPlayers() {
    this.muteAllOnNextRender = true;
    this.setState(this.state);
  }

  /* Loads the background image*/
  loadResources() {
    const collage = this.props.collage;
    // The background image
    const background = document.createElement('img');
    background.addEventListener('load', () => this.setState({ background }) );
    // Start loading the image so we can trigger the above listener.
    background.src = collage.image;
  }

  drawCanvas() {
    // Initiate the canvas
    const ctx = this.canvas.getContext('2d');

    if(this.state.background) {
      const backgroundPosition = this.backgroundPosition();

      ctx.drawImage(
        this.state.background,
        backgroundPosition.x,
        backgroundPosition.y,
        backgroundPosition.width,
        backgroundPosition.height
      );
    }
  }

  resized() {
    const devicePixelRatio = window.devicePixelRatio || 1;
    this.canvas.height = this.canvas.offsetHeight * devicePixelRatio;
    this.canvas.width = this.canvas.offsetWidth * devicePixelRatio;
    this.setState(this.state);
  }

  fullscreen() {
    if (!fullscreen.is()) {
      fullscreen.request(this.everything);
    } else {
      fullscreen.exit();
    }
    // Update the state
    this.setState({
      fullscreen: fullscreen.is()
    });
  }

  backgroundPosition() {
    const background = this.state.background;
    const canvas = this.canvas;

    const canvasRatio = canvas.width / canvas.height;
    const backgroundRatio = background.width / background.height;

    if(canvasRatio > backgroundRatio) {
      const height = canvas.height;
      const width = canvas.height * backgroundRatio;
      return {
        height,
        width,
        x: (canvas.width - width) / 2,
        y: 0
      }
    } else {
      const height = canvas.width / backgroundRatio;
      const width = canvas.width;
      return {
        height,
        width,
        x: 0,
        y: (canvas.height - height) / 2
      }
    }
  }

  render() {
    return (
      <div className="CollageCanvas"
        ref={(e) => { this.everything = e; }}>
        <canvas className="CollageCanvas__canvas"
          ref={(e) => { this.canvas = e; }} />
        { this.state.background &&
          <Videos
            videos={this.props.collage.videos}
            background={this.backgroundPosition()}
            muteAllPlayers={this.muteAllPlayers}
            shouldMuteAll={this.muteAllOnNextRender}/>
        }
        <div className="CollageCanvas__links">
          <a className="CollageCanvas__link"
            href={'http://www.facebook.com/sharer.php?u=' + location.href}
            target="_blank">
            Del på Facebook
          </a>

          <a className="CollageCanvas__link"
            href="http://www.danskkulturarv.dk/dinby/"
            target="_blank">
            Læs mere
          </a>
        </div>
        <div className="CollageCanvas__fullscreen-btn"
          onClick={this.fullscreen}>
          {this.state.fullscreen ? (
            <img src={FullscreenOffSvg} alt="Luk fuld skærm" />
          ) : (
            <img src={FullscreenSvg} alt="Åbn i fuld skærm" />
          )}
        </div>
      </div>
    );
  }
}
