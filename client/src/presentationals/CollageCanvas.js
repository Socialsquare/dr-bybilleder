import React, { Component, PropTypes } from 'react';

import './CollageCanvas.css';

const generateStyle = attributes => {
  return Object.keys(attributes).map(key => {
    const value = attributes[key];
    return key + ':' + value + ';';
  }).join('');
};

class CollageCanvas extends Component {

  resources = {};

  state = {
    controlsVisible: false
  };

  constructor() {
    super();
    this.resized = this.resized.bind(this);
    this.play = this.play.bind(this);
    this.showControls = this.showControls.bind(this);
    this.hideControls = this.hideControls.bind(this);
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

          const style = {
            width: width + 'px',
            height: height + 'px'
          };
          video.player.setAttribute('style', generateStyle(style));
          /*
          ctx.translate(x, y);
          ctx.rotate(video.rotation);
          ctx.drawImage(video.element, 0, 0, width, height);
          ctx.rotate(-video.rotation);
          ctx.translate(-x, -y);
          */
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
      this.redraw();
    });
    backgroundElement.src = collage.image;
    // The videos
    this.resources.videos = [];
    collage.videos.forEach(video => {
      const videoElement = document.createElement('video');
      const videoClasses = 'video-js vjs-default-skin CollageCanvas__video';
      videoElement.setAttribute('class', videoClasses);
      // TODO: Consider putting a thumbnail in the videos poster attribute

      const sourceElement = document.createElement('source');
      sourceElement.setAttribute('src', video.videoData.files.hls);
      sourceElement.setAttribute('type', 'video/mp4');
      // sourceElement.setAttribute('type', 'application/x-mpegURL');
      videoElement.appendChild(sourceElement);

      this.videoContainer.appendChild(videoElement);
      const player = window.videojs(videoElement, {
        'loop': true,
        'autoplay': true,
        'preload': 'auto'
      });

      this.resources.videos.push({
        element: videoElement,
        player,
        x: video.xPos,
        y: video.yPos,
        width: video.width,
        height: video.height,
        rotation: video.rotation
      });

      videoElement.addEventListener('suspend', this.showControls);
      videoElement.addEventListener('playing', this.hideControls);
      // Add a listner on error as well ...
    });
    this.redraw();
  }

  play() {
    // Loop though all the video elements and start playback
    this.resources.videos.forEach(video => {
      video.element.play();
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
    // Redraw forever
    /*
    const step = () => {
      this.redraw();
      window.requestAnimationFrame(step);
    };
    step();
    */
  }

  componentDidUpdate(prevProps, prevState) {
    if(prevProps.collage.id !== this.props.collage.id) {
      this.loadResources();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resized);
    this.resources.videos.forEach(video => {
      video.element.removeEventListener('suspend', this.showControls);
      video.element.removeEventListener('playing', this.hideControls);
    });
  }

  render() {
    const controlsClassNames = [
      'CollageCanvas__controls'
    ];
    if(this.state.controlsVisible) {
      controlsClassNames.push('CollageCanvas__controls--visible');
    }
    return (
      <div className="CollageCanvas">
        <canvas className="CollageCanvas__canvas"
          ref={(e) => { this.canvas = e; }} />
        <div className="CollageCanvas__video-container"
          ref={(e) => { this.videoContainer = e; }} />
        <div className={controlsClassNames.join(' ')} onClick={this.play}>
          Afspil
        </div>
      </div>
    );
  }
}

CollageCanvas.propTypes = {
  collage: PropTypes.object.isRequired
};

export default CollageCanvas;
