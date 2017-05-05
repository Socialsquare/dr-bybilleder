import React, { Component } from 'react';
import PropTypes from 'prop-types';1

export default class Video extends Component {
  static propTypes = {
    video: PropTypes.object.isRequired,
    background: PropTypes.object.isRequired,
    muted: PropTypes.bool
  }

  static defaultProps = {
    muted: true
  }

  constructor(props) {
    super(props);
    this.videoElement = null;
    this.player = null;
    this.state = {
      muted: props.muted
    }
  }

  componentDidMount() {
    this.initPlayer();
    this.registerListeners();
  }

  componentWillReceiveProps({muted}) {
    this.setState({ muted });
  }

  componentDidUpdate() {
    this.player.muted(this.state.muted);
    //this.setPosition();
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
      muted: this.state.muted,
      bigPlayButton: false,
      inactivityTimeout: 500,
      poster: this.props.video.videoData.files.thumbnail,
      techOrder: ['html5', 'flash'],
      textTrackSettings: false,
      controlBar: {
        playToggle: false,
        progressControl: false,
        remainingTimeDisplay: false,
        fullscreenToggle: false
      }
    });
  }

  registerListeners() {
    const { player } = this;
    player.on('click', (e) => {
      this.mute(!this.state.muted);
    });

    player.on('useractive', () => {
      player.play();
      let shouldMute = !this.state.muted;
      this.props.muteAllPlayers();
      this.mute(shouldMute);
    });
  }

  removeListeners() {
    this.player.off('click');
    this.player.off('useractive');
  }

  getPosition() {
    if(this.player && this.player.isFullscreen()) return null;

    const devicePixelRatio = window.devicePixelRatio || 1;
    const { video, background } = this.props;

    const width = video.width * background.width;
    const height = video.height * background.height;
    const x = background.x + video.xPos * background.width;
    const y = background.y + video.yPos * background.height;
    const rotationDeg = video.rotation / (2 * Math.PI) * 360;

    return {
      width: width / devicePixelRatio + 'px',
      height: height / devicePixelRatio + 'px',
      left: x / devicePixelRatio + 'px',
      top: y / devicePixelRatio + 'px',
      transform: 'rotate(' + rotationDeg + 'deg)',
      transformOrigin: '0 0', // Rotate around the upper left corner
      position: 'absolute'
    };
  }

  mute(muted) {
    this.setState({ muted });
  }

  render() {
    const { hls, rtmpFlv, rtmpMpeg4 } = this.props.video.videoData.files;

    let overlayClassName = 'CollageCanvas__video-overlay';
    if(this.state.muted) overlayClassName += ' CollageCanvas__video-overlay--muted';

    return (
      <div style={this.getPosition()}>
        <div className={overlayClassName}>
          <span> { this.state.muted ? 'Muted' : 'Lyd'} </span>
          <span>Link</span>
        </div>
        <video ref={video => {this.videoElement = video}} className='video-js vjs-default-skin CollageCanvas__video'>
          <source src={hls} type='application/x-mpegURL'/>
          <source src={rtmpFlv} type='rtmp/mp4'/>
          <source src={rtmpMpeg4} type='rtmp/flv'/>
        </video>
      </div>
    )
  }
}
