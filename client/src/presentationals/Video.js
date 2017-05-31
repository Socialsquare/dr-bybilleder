import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Videos extends Component {
  static propTypes = {
    videos: PropTypes.array.isRequired,
    background: PropTypes.object.isRequired,
    muteAllPlayers: PropTypes.func.isRequired,
    shouldMuteAll: PropTypes.bool
  }

  render() {
    const { videos, background,  muteAllPlayers, shouldMuteAll } = this.props;
    let props = { background, muteAllPlayers };
    if(shouldMuteAll) props.muted = true;

    return (
      <div className="CollageCanvas__video-container">
        { videos.map(video => (
            <Video key={video.videoData.title} video={video} {...props} />
          )) }
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

  state = {
    muted: true
  }

  constructor() {
    super();
    this.videoElement = null;
    this.player = null;

    this.ignoreNextUserActive = false;
  }

  componentDidMount() {
    this.initPlayer();
  }

  componentWillReceiveProps({ muted }) {
    // Only explicit changes in the muted prop should change our state.
    // That means parent components should only pass the muted prop in case
    // they wan't to force set it here.
    if(typeof(muted) !== 'undefined') {
      this.setState({ muted });
    }
  }

  componentDidUpdate() {
    // Synchronize the players state with the components
    this.player.muted(this.state.muted);
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

  goToVideo = (e) => {
    e.stopPropagation(); // Let's not trigger an overlay click.
    window.open('http://danskkulturarv.dk/?guid=' + this.props.video.videoData.guid, '_blank');
  }

  onOverlayClick = (e) => {
    this.player.play();
    let currentMutedStatus = this.state.muted;
    this.props.muteAllPlayers(() => {
      // We're providing a callback function so that
      // React doesn't batch our state changes.
      this.mute(!currentMutedStatus);
    });
  }

  render() {
    const { hls, rtmpFlv, rtmpMpeg4 } = this.props.video.videoData.files;

    return (
      <div style={this.getPosition()}>
        <div onClick={this.onOverlayClick.bind(this)} className='CollageCanvas__video-overlay'>
          { !this.state.muted && <VolumeIcon />}
          <LinkIcon goToVideo={this.goToVideo}/>
        </div>
        <video autoPlay muted playInline ref={video => {this.videoElement = video}} className='video-js vjs-default-skin CollageCanvas__video'>
          <source src={hls} type='application/x-mpegURL'/>
          <source src={rtmpFlv} type='rtmp/mp4'/>
          <source src={rtmpMpeg4} type='rtmp/flv'/>
        </video>
      </div>
    )
  }
}

const VolumeIcon = () => (
  <svg className="VideoIcon VideoIcon--volume" fill="#FFFFFF" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
    <path d="M0 0h24v24H0z" fill="none"/>
  </svg>
);

const LinkIcon = ({goToVideo}) => (
  <svg onClick={goToVideo} className="VideoIcon VideoIcon--link" fill="#FFFFFF" version="1.1" x="0px" y="0px" width="512px" height="512px" viewBox="0 0 459 459" xmlns="http://www.w3.org/2000/svg" >
    <path d="M459,216.75L280.5,38.25v102c-178.5,25.5-255,153-280.5,280.5C63.75,331.5,153,290.7,280.5,290.7v104.55L459,216.75z" />
  </svg>
);
