import React from 'react'
import { Parallax, ParallaxBanner } from 'react-scroll-parallax'
import {
  Avatar,
  Button,
  Card,
  CardContent,
  Chip,
  Paper,
  ListItem,
  ListItemText,
  CircularProgress
} from '@material-ui/core'
import DeleteForeverIcon from '@material-ui/icons/DeleteForever'
import { Skeleton } from '@material-ui/lab'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import moment from 'moment'
import axios from 'axios'

import Header from '../../components/Header'
import Footer from '../../components/Footer'

import anonymousProfile from '../../assets/images/anonymous-profile.png'
import playButton from '../../assets/svgs/play-button.svg'
import './style.scss'

class Movie extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: true,
      scraping: true,
      movie: {},
      credits: {},
      comments: [],
      links: [],
      message: ''
    }
  }

  componentDidMount() {
    const {
      match: { params }
    } = this.props

    this.fetchData(params.id).catch(() => {
      window.location.href = '/error'
    })
  }

  async fetchData(id) {
    const requests = [
      axios.get(`${global.API_URL}/movies/details/${id}`),
      axios.get(`${global.API_URL}/movies/${id}/comments`),
      axios.get(`${global.API_URL}/movies/credits/${id}`)
    ]

    const res = await Promise.all(requests)

    this.fetchTorrents(res[0].data.imdb_id)

    this.setState({
      loading: false,
      movie: res[0].data,
      comments: res[1].data.comments,
      credits: res[2].data
    })
  }

  async fetchTorrents(imdbId) {
    const res = await axios.get(`${global.API_URL}/movies/torrents/${imdbId}`)
    this.setState({
      scraping: false,
      links: res.data.results
    })
  }

  handleClickPoster() {
    const { movie, links } = this.state

    if (links.length > 0)
      window.location.href = `/watch/${movie.id}/${movie.imdb_id}/${encodeURIComponent(links[0].magnet)}`
  }

  render() {
    console.log(this.state.comments)
    const {
      user,
      lang,
      match: { params }
    } = this.props

    const { movie, links, comments, credits, loading, scraping } = this.state

    const poster = movie.poster
    const title = movie.title
    const tagline = movie.tagline
    const genres = movie.genres || []
    const release_date = moment(movie.release_date || 0).format('LL')
    const runtime = moment
      .utc()
      .startOf('day')
      .add({ minutes: movie.runtime || 0 })
      .format('HH[h]mm')
    const overview = movie.overview
    const companies = movie.production_companies || []
    const casting = credits.cast || []
    const crew = credits.crew || []
    const deleteMovieComments = async (movieId, commentId) => {
      try {
        const res = await axios.delete(`${global.API_URL}/movies/${movieId}/comments/${commentId}`)
        if (res.status === 200) {
          const filterComments = comments.filter(comment => comment._id !== commentId)
          this.setState({
            comments: filterComments
          })
        }
      } catch (error) {
        throw error
      }
    }

    const addMovieComment = async (movieId, message) => {
      try {
        if (message === '') return
        const res = await axios.put(`${global.API_URL}/movies/comments/`, {
          movieId: movieId,
          message: message
        })
        if (res.status === 201) {
          const res = await axios.get(`${global.API_URL}/movies/${movieId}/comments`)
          this.setState({
            comments: res.data.comments,
            message: ''
          })
        }
      } catch (error) {
        throw error
      }
    }

    const handleCommentChange = e => {
      this.setState({
        [e.target.id]: e.target.value
      })
    }

    return (
      <>
        <Header />
        <div id="movie" className="page">
          <ParallaxBanner
            layers={[
              {
                image: `${movie.backdrop}`,
                amount: 0.7
              }
            ]}
            style={{
              height: '42vh'
            }}
          />

          <div className="content">
            <div className="movie">
              <div className="poster">
                <div id="play-button-container">
                  <img id="play-button" src={playButton} alt="" />
                </div>
                {loading ? <Skeleton variant="rect" width="100%" height="100%" /> : <></>}
                <img id="poster" src={poster} alt="" />
              </div>
              <Paper className="links" elevation={3}>
                {scraping ? (
                  <CircularProgress id="scraping-progress" size={24} />
                ) : (
                  links.map((link, idx) => (
                    <a
                      key={`link-${idx}`}
                      href={`/watch/${movie.id}/${movie.imdb_id}/${encodeURIComponent(link.magnet)}`}
                    >
                      <ListItem className="link" button>
                        <ListItemText id="link-name" primary={link.name} />
                        <ListItemText id="link-seeders" primary={link.seeders} />
                      </ListItem>
                    </a>
                  ))
                )}
              </Paper>
            </div>
            <div className="infos">
              <Card variant="outlined">
                <CardContent>
                  <div className="centered">
                    <h1 id="title">{title}</h1>
                    <h3 id="tagline">{tagline}</h3>

                    <div id="genres">
                      {(genres || []).map((genre, idx) => (
                        <Chip key={idx} color="primary" label={genre} clickable></Chip>
                      ))}
                    </div>

                    <div id="times">
                      <div className="time">
                        <span>{lang['release']}</span>:<span>{release_date}</span>
                      </div>
                      <div className="time">
                        <span>{lang['duration']}</span>:<span>{runtime}</span>
                      </div>
                    </div>
                  </div>

                  <h2 className="title">{lang['overview']}</h2>
                  <p id="overview">{overview}</p>

                  <h2 className="title">{lang['prod_companies']}</h2>
                  <ul id="companies">
                    {companies.map((company, idx) => (
                      <li key={idx}>
                        {company.origin_country !== '' ? (
                          <img src={'https://www.countryflags.io/' + company.origin_country + '/flat/32.png'} alt="" />
                        ) : (
                          <span className="ph-country" />
                        )}
                        <p>{company.name}</p>
                      </li>
                    ))}
                  </ul>

                  <h2 className="title">{lang['casting']}</h2>
                  <div id="casting">
                    {casting.slice(0, 60).map((item, idx) => (
                      <Paper key={`cast-${idx}`} className="item" elevation={3}>
                        <Avatar src={`https://image.tmdb.org/t/p/w500${item.profile_path}`}></Avatar>
                        <br />
                        <p className="name">{item.name}</p>
                        <p className="role">{item.character}</p>
                      </Paper>
                    ))}
                  </div>

                  <h2 className="title">{lang['crew']}</h2>
                  <div id="crew">
                    {crew.slice(0, 60).map((item, idx) => (
                      <Paper key={`crew-${idx}`} className="item" elevation={3}>
                        <Avatar src={`https://image.tmdb.org/t/p/w500${item.profile_path}`}></Avatar>
                        <br />
                        <p className="name">{item.name}</p>
                        <p className="role">{item.department}</p>
                      </Paper>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent>
                  <h2 className="title">{lang['comments']}</h2>
                  <div className="add-comment-wrapper">
                    <div className="textarea-container">
                      <textarea
                        id="message"
                        className="message-comment"
                        onChange={handleCommentChange}
                        value={this.state.message}
                      ></textarea>
                    </div>
                    <div className="add-comment-button-container">
                      {
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => addMovieComment(movie.id, this.state.message)}
                        >
                          {lang['send']}
                        </Button>
                      }
                    </div>
                  </div>

                  {Object.keys(comments)
                    .reverse()
                    .map((item, key) => (
                      <Paper key={key} className="comment-item" elevation={3}>
                        <div className="comment-wrapper">
                          <div key={key} className="left-side-comment">
                            <Avatar
                              classname="profile-picture"
                              src={comments[item].userId.avatar}
                              onClick={() =>
                                (window.location.href = `/account/${comments[item].userId.username}`)
                              }
                            ></Avatar>

                            <div className="message">
                              <p>
                                {comments[item].userId.username} - {new Date(comments[item].date).toLocaleString()}
                              </p>
                              <p>{comments[item].message}</p>
                            </div>
                          </div>

                          {comments[item].userId._id === user._id && (
                            <div className="delete-button-container">
                              <Avatar onClick={() => deleteMovieComments(movie.id, comments[item]._id)}>
                                <DeleteForeverIcon />
                              </Avatar>
                            </div>
                          )}
                        </div>
                      </Paper>
                    ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }
}

const mapStateToProps = state => ({
  user: state.user,
  lang: state.lang
})

export default connect(mapStateToProps)(Movie)
