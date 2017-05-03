import React, { Component, PropTypes } from 'react';
import { addSource, generateStyle, fullscreen } from '../utils';
import Video from './Video';

import './CollageCanvas.css';
// import DogGridSvg from '../svgs/dot-grid.svg';
// import PlaySvg from '../svgs/play.svg';
import FullscreenSvg from '../svgs/fullscreen.svg';
import FullscreenOffSvg from '../svgs/fullscreen-off.svg';

export default class CollageCanvas extends Component {
  static propTypes = {
    collage: PropTypes.object.isRequired
  }

  constructor() {
    super();
    this.resized = this.resized.bind(this);
    this.play = this.play.bind(this);
    this.fullscreen = this.fullscreen.bind(this);
    this.state = {
      background: null,
    }
    this.registerChildPlayer = this.registerChildPlayer.bind(this);
    this.muteAllPlayers = this.muteAllPlayers.bind(this);

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
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resized);
  }

  registerChildPlayer(player) {
    this.players.push(player);
  }
  muteAllPlayers(exceptPlayer) {
    this.players.forEach(player => {
      if(player !== exceptPlayer) {
        player.muted(true);
      }
    });
  }
  drawCanvas() {
    const devicePixelRatio = window.devicePixelRatio || 1;
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

  /* Loads the background image and all the videos that makes up the collage */
  loadResources() {
    const collage = this.props.collage;
    // The background image
    const background = document.createElement('img');
    background.addEventListener('load', () => {
      this.setState({ background });
    });
    background.src = collage.image;
  }

  play() {
    // Loop though all the video elements and start playback
    this.resources.videos.forEach(video => {
      if(!video.player.paused()) {
        video.player.pause();
      }
      video.player.play();
    });
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

  muteAllPlayers(exceptPlayer) {
    this.resources.videos.forEach(video => {
      if(video.player !== exceptPlayer) {
        video.player.muted(true);
      }
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
        <div className="CollageCanvas__video-container">
        { this.state.background &&
          this.props.collage.videos.map(video => {
            return (
              <Video
                video={video}
                background={this.backgroundPosition()}
                registerChildPlayer={this.registerChildPlayer}
                muteAllPlayers={this.muteAllPlayers}/> )})
        }
        </div>
        <a className="CollageCanvas__facebook-btn"
          href={'http://www.facebook.com/sharer.php?u=' + location.href}
          target="_blank">
          Del på Facebook
        </a>
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
