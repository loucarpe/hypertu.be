import React from 'react'
import { StarRateRounded, Visibility } from '@material-ui/icons'
import { Chip, Avatar } from '@material-ui/core'
import { Skeleton } from '@material-ui/lab'
import { Link } from 'react-router-dom'

import moviePopcorn from '../../assets/svgs/movie-popcorn.svg'
import './style.scss'

class MovieThumbnail extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      imgLoaded: false
    }
  }

  handleImgLoaded() {
    this.setState({ imgLoaded: true })
  }

  render() {
    const { id, vote, release_date, title, original_title, poster } = this.props.movie
    const { watched } = this.props
    const { imgLoaded } = this.state

    return (
      <div id="movie-thumbnail">
        <div className={'container' + (!imgLoaded ? ' hidden' : '')}>
          <a href={`/movie/${id}`}>
            <Chip
              id="release-date"
              className="overlay"
              color="primary"
              label={new Date(release_date).getFullYear() || 'N/A'}
            />

            <Chip
              id="vote"
              className="overlay"
              color="primary"
              label={vote || 0}
              avatar={
                <Avatar>
                  <StarRateRounded />
                </Avatar>
              }
            />

            <div id="sticker-container">
              <img id="sticker" className="overlay" src={moviePopcorn} alt="Action sticker" />
            </div>

            <div id="title-container">
              <Chip
                id="title"
                className="overlay"
                color="primary"
                label={title || original_title || 'N/A'}
                avatar={
                  watched ? (
                    <Avatar>
                      <Visibility id="watched" />
                    </Avatar>
                  ) : (
                    <></>
                  )
                }
              />
            </div>

            <div id="poster">
              <img
                className="thumbnail"
                src={poster}
                onLoad={this.handleImgLoaded.bind(this)}
                alt={title + ' poster'}
              />
            </div>
          </a>
        </div>
        {!imgLoaded ? <Skeleton variant="rect" width="100%" height="100%" /> : <></>}
      </div>
    )
  }
}

export default MovieThumbnail
