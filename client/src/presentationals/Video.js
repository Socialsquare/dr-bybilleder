import React, { Component, PropTypes } from 'react';
import { generateStyle } from '../utils';

export default class Video extends Component {
  static propTypes = {
    video: PropTypes.object.isRequired,
    background: PropTypes.object.isRequired
  }

  constructor() {
    super();
    this.videoElement = null;
    this.player = null;
  }

  componentDidMount() {
    this.initPlayer();
    this.registerListeners();
    this.setPosition();
  }

  componentDidUpdate() {
    this.setPosition();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  initPlayer() {
    this.player = window.videojs(this.videoElement, {
      controls: 'auto',
      loop: true,
      autoplay: true,
      preload: 'auto',
      muted: true,
      bigPlayButton: false,
      inactivityTimeout: 500,
      poster: this.props.video.videoData.files.thumbnail,
      techOrder: ['html5', 'flash'],
      controlBar: {
        playToggle: false,
        progressControl: false,
        remainingTimeDisplay: false,
        fullscreenToggle: false
      }
    });

    this.props.registerChildPlayer(this.player);
  }

  registerListeners() {
    const { player } = this;
    // When the video starts playing the large collage control get hidden.
    player.on('click', () => {
      player.muted(false);
      // Mute all other players
      this.props.muteAllPlayers(player);
    });
  }

  removeListeners() {
    const { player } = this;
    player.off('suspend');
    player.off('play');
  }

  setPosition() {
    const devicePixelRatio = window.devicePixelRatio || 1;
    const { video, background } = this.props;

    const width = video.width * background.width;
    const height = video.height * background.height;
    const x = background.x + video.xPos * background.width;
    const y = background.y + video.yPos * background.height;
    const rotationDeg = video.rotation / (2 * Math.PI) * 360;

    if(this.player.isFullscreen()) {
      // Make sure full-screening is not destroyed by a strange position.
      this.player.setAttribute('style', '');
    } else {
      const style = {
        width: width / devicePixelRatio + 'px',
        height: height / devicePixelRatio + 'px',
        left: x / devicePixelRatio + 'px',
        top: y / devicePixelRatio + 'px',
        transform: 'rotate(' + rotationDeg + 'deg)',
        'transform-origin': '0 0' // Rotate around the upper left corner
      };
      this.player.setAttribute('style', generateStyle(style));
    }
  }

  render() {
    const { hls, rtmpFlv, rtmpMpeg4 } = this.props.video.videoData.files;

    return (
      <video ref={video => {this.videoElement = video}} className='video-js vjs-default-skin CollageCanvas__video'>
        <source src={hls} type='application/x-mpegURL'/>
        <source src={rtmpFlv} type='rtmp/mp4'/>
        <source src={rtmpMpeg4} type='rtmp/flv'/>
      </video>
    )
  }
}
