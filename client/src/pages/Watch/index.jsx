import React from 'react'
import { Backdrop, CircularProgress } from '@material-ui/core'
import axios from 'axios'
import Plyr from 'plyr'

import './style.scss'

class Watch extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      subtitles: {},
      loading: true
    }
  }

  componentDidMount() {
    const {
      match: { params }
    } = this.props

    this.fetchSubtitles(params.imdb_id)
    this.addToWatchlist(params.movieId)
  }

  async addToWatchlist(movieId) {
    try {
      const res = await axios.put(`${global.API_URL}/account/watchlist/${movieId}`)
    } catch (error) {}
  }

  async fetchSubtitles(imdbId) {
    try {
      const subtitles = (await axios.get(`${global.API_URL}/movies/subtitles/${imdbId}`)).data

      this.player = new Plyr('#player')
      this.player.on('canplay', () => {
        this.player.play()

        this.setState({
          loading: false
        })
      })

      this.setState({
        subtitles
      })
    } catch (ex) {}
  }

  componentWillUnmount() {
    if (this.player && this.player.dispose) {
      this.player.dispose()
    }
  }

  render() {
    const { subtitles, loading } = this.state
    const {
      match: { params }
    } = this.props

    return (
      <div id="watch" className="fullscreen-page">
        <Backdrop open={loading}>
          <CircularProgress color="primary" />
          <p>Loading... please wait.</p>
        </Backdrop>
        <video id="player" crossOrigin="anonymous" controls>
          <source src={`${global.API_URL}/watch/${params.movieId}/${params.magnet}`} type="video/mp4" />

          {this.getSubtitles(subtitles)}
        </video>
      </div>
    )
  }

  getSubtitles(subtitles) {
    let result = []

    for (let lang in subtitles) {
      const subtitle = subtitles[lang]
      result.push(<track key={lang} kind="captions" label={subtitle.name} src={subtitle.file} srcLang={lang} />)
    }

    return result
  }
}

export default Watch
