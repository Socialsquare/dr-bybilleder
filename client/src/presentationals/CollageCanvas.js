import React, { Component, PropTypes } from 'react';

import './CollageCanvas.css';

class CollageCanvas extends Component {

  resources = {};

  constructor() {
    super();
    this.resized = this.resized.bind(this);
  }

  resized() {
    // Set the height to the height of the element
    this.canvas.height = this.canvas.offsetHeight;
    this.canvas.width = this.canvas.offsetWidth;
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
      videoElement.setAttribute('preload', 'auto');
      videoElement.setAttribute('autoplay', 'true');

      this.resources.videos.push({
        element: videoElement,
        x: video.xPos,
        y: video.yPos,
        width: video.width,
        height: video.height,
        rotation: video.rotation
      });

      const sourceElement = document.createElement('source');
      sourceElement.setAttribute('src', video.videoData.files.hls);
      sourceElement.setAttribute('type', 'application/x-mpegURL');
      videoElement.appendChild(sourceElement);

      this.videoContainer.appendChild(videoElement);
      window.videojs(videoElement);
      videoElement.play();
    });
    this.redraw();
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

  redraw() {
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
          ctx.translate(x, y);
          ctx.rotate(video.rotation);
          ctx.drawImage(video.element, 0, 0, width, height);
          ctx.rotate(-video.rotation);
          ctx.translate(-x, -y);
        });
      }
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.resized);
    this.resized();
    this.loadResources();
    // Redraw forever
    const step = () => {
      this.redraw();
      window.requestAnimationFrame(step);
    };
    step();
  }

  componentDidUpdate(prevProps, prevState) {
    if(prevProps.collage.id !== this.props.collage.id) {
      this.loadResources();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resized);
  }

  render() {
    return (
      <div className="CollageCanvas">
        <canvas className="CollageCanvas__canvas"
          ref={(e) => { this.canvas = e; }} />
        <div className="CollageCanvas__video-container"
          ref={(e) => { this.videoContainer = e; }} />
      </div>
    );
  }
}

CollageCanvas.propTypes = {
  collage: PropTypes.object.isRequired
};

export default CollageCanvas;
