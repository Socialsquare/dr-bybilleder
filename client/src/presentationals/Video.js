import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Videos extends Component {
  static propTypes = {
    videos: PropTypes.array.isRequired,
    background: PropTypes.object.isRequired,
    muteAllPlayers: PropTypes.func.isRequired,
    shouldMuteAll: PropTypes.bool
  }

  static defaultProps = {
    shouldMuteAll: true
  }

  render() {
    const { videos, background,  muteAllPlayers, shouldMuteAll } = this.props;

    return (
      <div className="CollageCanvas__video-container">
        { videos.map(video => {
          return (
            <Video
              key={video.videoData.title}
              video={video}
              background={background}
              muteAllPlayers={muteAllPlayers}
              muted={shouldMuteAll} />
          )}
        ) }
      </div>
    );
  }
}

class Video extends Component {
  static propTypes = {
    video: PropTypes.object.isRequired,
    background: PropTypes.object.isRequired,
    muteAllPlayers: PropTypes.func.isRequired,
    muted: PropTypes.bool
  }

  static defaultProps = {
    muted: true
  }

  state = {
    muted: true
  }

  constructor() {
    super();
    this.videoElement = null;
    this.player = null;
  }

  componentDidMount() {
    this.initPlayer();
    this.registerListeners();
  }

  componentWillReceiveProps({ muted }) {
    this.setState({ muted });
  }

  componentDidUpdate() {
    this.player.muted(this.state.muted);
    //this.setPosition();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  mute(muted) {
    this.setState({ muted });
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

  render() {
    const { hls, rtmpFlv, rtmpMpeg4 } = this.props.video.videoData.files;

    let overlayClassName = 'CollageCanvas__video-overlay';
    if(this.state.muted) overlayClassName += ' CollageCanvas__video-overlay--muted';

    return (
      <div style={this.getPosition()}>
        <div className={overlayClassName}>
          { !this.state.muted && <HearingIcon />}
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

const HearingIcon = () => {
  return (
    <svg fill="#FFFFFF" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 20c-.29 0-.56-.06-.76-.15-.71-.37-1.21-.88-1.71-2.38-.51-1.56-1.47-2.29-2.39-3-.79-.61-1.61-1.24-2.32-2.53C9.29 10.98 9 9.93 9 9c0-2.8 2.2-5 5-5s5 2.2 5 5h2c0-3.93-3.07-7-7-7S7 5.07 7 9c0 1.26.38 2.65 1.07 3.9.91 1.65 1.98 2.48 2.85 3.15.81.62 1.39 1.07 1.71 2.05.6 1.82 1.37 2.84 2.73 3.55.51.23 1.07.35 1.64.35 2.21 0 4-1.79 4-4h-2c0 1.1-.9 2-2 2zM7.64 2.64L6.22 1.22C4.23 3.21 3 5.96 3 9s1.23 5.79 3.22 7.78l1.41-1.41C6.01 13.74 5 11.49 5 9s1.01-4.74 2.64-6.36zM11.5 9c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5-2.5 1.12-2.5 2.5z"/>
      <path d="M0 0h24v24H0z" fill="none"/>
    </svg>
  );
}
