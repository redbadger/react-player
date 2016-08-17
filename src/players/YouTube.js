import React from 'react'
import loadScript from 'load-script'

import Base from './Base'
import { parseStartTime } from '../utils'

const SDK_URL = 'https://www.youtube.com/iframe_api'
const SDK_GLOBAL = 'YT'
const SDK_GLOBAL_READY = 'onYouTubeIframeAPIReady'
const MATCH_URL = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/
const PLAYER_ID = 'youtube-player'
const BLANK_VIDEO_URL = 'https://www.youtube.com/watch?v=GlCmAC4MHek'
const DEFAULT_PLAYER_VARS = {
  autoplay: 0,
  playsinline: 1,
  showinfo: 0,
  rel: 0,
  iv_load_policy: 3
}

let playerIdCount = 0

export default class YouTube extends Base {
  static displayName = 'YouTube'
  static canPlay (url) {
    return MATCH_URL.test(url)
  }
  isReady = false
  startOnPlay = true
  durationOnPlay = false
  seekOnPlay = null
  playerId = PLAYER_ID + '-' + playerIdCount++
  componentDidMount () {
    if (!this.props.url && this.props.youtubeConfig.preload) {
      this.preloading = true
      this.load(BLANK_VIDEO_URL)
    }
    super.componentDidMount()
  }
  getSDK () {
    if (window[SDK_GLOBAL] && window[SDK_GLOBAL].loaded) {
      return Promise.resolve(window[SDK_GLOBAL])
    }
    return new Promise((resolve, reject) => {
      const previousOnReady = window[SDK_GLOBAL_READY]
      window[SDK_GLOBAL_READY] = function () {
        if (previousOnReady) previousOnReady()
        resolve(window[SDK_GLOBAL])
      }
      loadScript(SDK_URL, err => {
        if (err) reject(err)
      })
    })
  }
  load (url) {
    const id = url && url.match(MATCH_URL)[1]
    if (this.isReady) {
      this.player.cueVideoById({
        videoId: id,
        startSeconds: parseStartTime(url)
      })
      return
    }

    let playerVars = this.props.youtubeConfig ? this.props.youtubeConfig.playerVars : {};
    if (this.props.loop) {
      playerVars = { ...playerVars, loop: 1, playlist: id }
    }

    if (this.loadingSDK) {
      this.loadOnReady = url
      return
    }
    this.loadingSDK = true
    this.getSDK().then(YT => {
      this.player = new YT.Player(this.playerId, {
        width: '100%',
        height: '100%',
        videoId: id,
        playerVars: {
          ...DEFAULT_PLAYER_VARS,
          controls: this.props.controls ? 1 : 0,
          ...playerVars,
          start: parseStartTime(url),
          origin: window.location.origin
        },
        events: {
          onReady: () => {
            this.loadingSDK = false
            if (this.props.onReady) {
              this.props.onReady.forEach((func) => { func(this) })
            }
            this.onReady()
          },
          onStateChange: this.onStateChange,
          onError: event => this.props.onError(event.data)
        }
      })
    }, this.props.onError)
  }
  onStateChange = ({ data }) => {
    const { PLAYING, PAUSED, BUFFERING, ENDED, CUED } = window[SDK_GLOBAL].PlayerState
    if (data === PLAYING) this.onPlay()
    if (data === PAUSED) this.props.onPause()
    if (data === BUFFERING) this.props.onBuffer()
    if (data === ENDED) this.onEnded()
    if (data === CUED) this.onReady()
  }
  onEnded = () => {
    if (this.props.loop) {
      this.seekTo(0)
    }
    this.props.onEnded()
  }
  play () {
    if (!this.isReady || !this.player.playVideo) return
    this.player.playVideo()
  }
  pause () {
    if (!this.isReady || !this.player.pauseVideo) return
    this.player.pauseVideo()
  }
  stop () {
    if (!this.isReady || !this.player.stopVideo) return
    this.player.stopVideo()
  }
  mute () {
    if (!this.player.mute) return
    this.player.mute()
  }
  seekTo (fraction) {
    super.seekTo(fraction)
    if (!this.isReady || !this.player.seekTo) return
    this.player.seekTo(this.getDuration() * fraction)
  }
  setVolume (fraction) {
    if (!this.isReady || !this.player.setVolume) return
    this.player.setVolume(fraction * 100)
  }
  getDuration () {
    if (!this.isReady || !this.player.getDuration) return null
    return this.player.getDuration()
  }
  getFractionPlayed () {
    if (!this.isReady || !this.getDuration()) return null
    return this.player.getCurrentTime() / this.getDuration()
  }
  getFractionLoaded () {
    if (!this.isReady || !this.player.getVideoLoadedFraction) return null
    return this.player.getVideoLoadedFraction()
  }
  render () {
    const style = {
      height: '100%',
      display: this.props.url ? 'block' : 'none'
    }
    return (
      <div style={style}>
        <div id={this.playerId} />
      </div>
    )
  }
}
