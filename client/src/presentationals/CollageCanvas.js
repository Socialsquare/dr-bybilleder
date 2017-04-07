import React, { Component, PropTypes } from 'react';

import './CollageCanvas.css';

const generateStyle = attributes => {
  return Object.keys(attributes).map(key => {
    const value = attributes[key];
    return key + ':' + value + ';';
  }).join('');
};

const addSource = (element, url, type) => {
  const sourceElement = document.createElement('source');
  sourceElement.setAttribute('src', url);
  sourceElement.setAttribute('type', type);
  element.appendChild(sourceElement);
};

const fullscreen = {
  is: () => {
    const fullscreenElement = document.fullscreenElement ||
                              document.webkitFullscreenElement ||
                              document.mozFullScreenElement ||
                              document.msFullscreenElement;
    return !!fullscreenElement;
  },
  request: e => {
    const req = e.requestFullscreen ||
                e.msRequestFullscreen ||
                e.mozRequestFullScreen ||
                e.webkitRequestFullscreen;
    if(req) {
      req.call(e);
    }
  },
  exit: () => {
    if (document.exitFullscreen) {
    	document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
    	document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
    	document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
    	document.msExitFullscreen();
    }
  },
  addListener: listener => {
    document.addEventListener('fullscreenchange', listener);
    document.addEventListener('webkitfullscreenchange', listener);
    document.addEventListener('mozfullscreenchange', listener);
    document.addEventListener('MSFullscreenChange', listener);
  },
  removeListener: listener => {
    document.removeEventListener('fullscreenchange', listener);
    document.removeEventListener('webkitfullscreenchange', listener);
    document.removeEventListener('mozfullscreenchange', listener);
    document.removeEventListener('MSFullscreenChange', listener);
  }
};

// import DogGridSvg from '../svgs/dot-grid.svg';
import PlaySvg from '../svgs/play.svg';
import FullscreenSvg from '../svgs/fullscreen.svg';
import FullscreenOffSvg from '../svgs/fullscreen-off.svg';

class CollageCanvas extends Component {

  resources = {};

  state = {
    controlsVisible: false,
    facebookHref: 'http://www.facebook.com/sharer.php?u='
  };

  constructor() {
    super();
    this.resized = this.resized.bind(this);
    this.play = this.play.bind(this);
    this.fullscreen = this.fullscreen.bind(this);
    this.showControls = this.showControls.bind(this);
    this.hideControls = this.hideControls.bind(this);
    this.redraw = this.redraw.bind(this);
  }

  redraw() {
    const devicePixelRatio = window.devicePixelRatio || 1;
    // Initiate the canvas
    const ctx = this.canvas.getContext('2d');

    if(this.resources.background) {
      const background = this.backgroundPosition();

      ctx.drawImage(this.resources.background,
                    background.x,
                    background.y,
                    background.width,
                    background.height);

      if(this.resources.videos) {
        this.resources.videos.forEach(video => {
          const width = video.width * background.width;
          const height = video.height * background.height;
          const x = background.x + video.x * background.width;
          const y = background.y + video.y * background.height;
          const rotationDeg = video.rotation / (2 * Math.PI) * 360;

          if(video.player.isFullscreen()) {
            // Make sure full-screening is not distroyed by a strange position.
            video.player.setAttribute('style', '');
          } else {
            const style = {
              width: width / devicePixelRatio + 'px',
              height: height / devicePixelRatio + 'px',
              left: x / devicePixelRatio + 'px',
              top: y / devicePixelRatio + 'px',
              transform: 'rotate(' + rotationDeg + 'deg)',
              'transform-origin': '0 0' // Rotate around the upper left corner
            };
            video.player.setAttribute('style', generateStyle(style));
          }
        });
      }
    }
  }

  resized() {
    // Considering the device pixels might be different from "pixels"
    const devicePixelRatio = window.devicePixelRatio || 1;
    // Set the height to the height of the element
    this.canvas.height = this.canvas.offsetHeight * devicePixelRatio;
    this.canvas.width = this.canvas.offsetWidth * devicePixelRatio;
    this.redraw();
  }

  /* Loads the background image and all the videos that makes up the collage */
  loadResources() {
    const collage = this.props.collage;
    // The background image
    const backgroundElement = document.createElement('img');
    backgroundElement.addEventListener('load', () => {
      // When loaded, add this as a resource
      this.resources.background = backgroundElement;
      // Add a class to display the videos
      this.videoContainer.className += ' CollageCanvas__video-container--visible';
      this.redraw();
    });
    backgroundElement.src = collage.image;
    // The videos
    this.resources.videos = [];
    collage.videos.forEach(video => {
      const element = document.createElement('video');
      const classes = 'video-js vjs-default-skin CollageCanvas__video';
      element.setAttribute('class', classes);
      // TODO: Consider putting a thumbnail in the videos poster attribute
      addSource(element, video.videoData.files.hls, 'application/x-mpegURL');
      addSource(element, video.videoData.files.rtmpMpeg4, 'rtmp/mp4');
      addSource(element, video.videoData.files.rtmpFlv, 'rtmp/flv');

      this.videoContainer.appendChild(element);
      const player = window.videojs(element, {
        controls: 'auto',
        loop: true,
        autoplay: true,
        preload: 'auto',
        muted: true,
        bigPlayButton: false,
        inactivityTimeout: 500,
        controlBar: {
          children: {
            fullscreenToggle: true
          }
        },
        poster: video.videoData.files.thumbnail,
        techOrder: ['html5', 'flash']
      });

      this.resources.videos.push({
        element,
        player,
        x: video.xPos,
        y: video.yPos,
        width: video.width,
        height: video.height,
        rotation: video.rotation
      });

      // If the video needs a user gesture to start, we show the controls.
      player.on('suspend', (e) => {
        if(player.paused()) {
          this.showControls();
        }
      });
      // When the video starts playing the large collage control get hidden.
      player.on('play', this.hideControls);
      player.on('useractive', () => {
        // Mute all other players
        this.muteAllPlayers(player);
        // unmute
        player.muted(false);
        // and start playing this
        player.play();
      });
      // TODO: Add a listner on error as well ...
    });
    this.redraw();
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

  showControls() {
    this.setState({
      controlsVisible: true
    });
  }

  hideControls() {
    this.setState({
      controlsVisible: false
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
    const background = this.resources.background;
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

  componentDidMount() {
    window.addEventListener('resize', this.resized);
    this.resized();
    this.loadResources();
    // Redraw when fullscreen changes
    fullscreen.addListener(this.redraw);
    // Set the facebook url to share the current URL
    const url = location.href;
    this.setState({
      facebookHref: 'http://www.facebook.com/sharer.php?u=' + url
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if(prevProps.collage.id !== this.props.collage.id) {
      this.loadResources();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resized);
    this.resources.videos.forEach(video => {
      video.player.off('suspend');
      video.player.off('play');
      video.player.off('volumechange');
    });
    // Redraw when fullscreen changes
    fullscreen.removeListener(this.redraw);
  }

  render() {
    return (
      <div className="CollageCanvas"
        ref={(e) => { this.everything = e; }}>
        <canvas className="CollageCanvas__canvas"
          ref={(e) => { this.canvas = e; }} />
        <div className="CollageCanvas__video-container"
          ref={(e) => { this.videoContainer = e; }} />
        <a className="CollageCanvas__facebook-btn"
          href={this.state.facebookHref}>
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

CollageCanvas.propTypes = {
  collage: PropTypes.object.isRequired
};

export default CollageCanvas;
