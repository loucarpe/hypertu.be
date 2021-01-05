import React from 'react'
import { Grid, CircularProgress } from '@material-ui/core'
import { connect } from 'react-redux'
import axios from 'axios'

import MovieThummail from '../../components/MovieThumbnail'
import SearchBar from '../../components/SearchBar'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

import './style.scss'

class Index extends React.Component {
  constructor(props) {
    super(props)
    this.onScroll = this.onScroll.bind(this)

    this.page = 1
    this.searchQuery = null
    this.year = null
    this.genre = null
    this.typingTimeout = null
    this.loading = true

    this.state = {
      movies: [],
      endReached: false
    }
  }

  componentDidMount() {
    window.addEventListener('scroll', this.onScroll, false)

    this.fetchMovies()
  }

  onScroll() {
    if (window.scrollY + window.innerHeight > document.body.offsetHeight - 142) {
      const { loading } = this
      const { endReached } = this.state

      if (!loading && !endReached) {
        this.fetchMovies(false)
      }
    }
  }

  async fetchMovies(reset = true) {
    const movies = this.state.movies
    const { page, searchQuery: query, year, genre } = this

    const newPage = reset ? 1 : page + 1

    try {
      this.loading = true

      const { page: inPage, total_pages, results } = (
        await axios.get(
          query || year || genre
            ? this.generateSearchUrl(newPage, query, year, genre)
            : `${global.API_URL}/movies?page=${newPage}`
        )
      ).data

      this.loading = false
      this.page = newPage

      this.setState({
        movies: reset ? results : movies.concat(results),
        endReached: inPage >= total_pages
      })
    } catch (ex) {}
  }

  generateSearchUrl(page, query, year, genre) {
    let url = `${global.API_URL}/movies/search?page=${page}`

    if (query != null && query !== '') url += `&query=${encodeURIComponent(query)}`
    if (year != null) url += `&year=${year}`
    if (genre != null) url += `&genre=${genre}`

    return url
  }

  async search(input) {
    if (this.typingTimeout != null) {
      clearTimeout(this.typingTimeout)
    }

    this.typingTimeout = setTimeout(() => {
      this.searchQuery = input
      this.fetchMovies()
    }, 500)
  }

  filter(filters) {
    if (this.year !== filters.year || this.genre !== filters.genre) {
      this.year = filters.year
      this.genre = filters.genre
  
      this.fetchMovies()
    }
  }
  
  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScroll, false)
  }

  render() {
    const { movies, endReached } = this.state
    const { user } = this.props

    return (
      <>
        <Header />
        <div id="index" className="page" style={{ backgroundColor: '#000' }}>
          <div className="sb-wrapper">
            <SearchBar onChange={this.search.bind(this)} onFilter={this.filter.bind(this)} />
          </div>
          <Grid className="movies" container direction="row" justify="space-around" alignItems="flex-start">
            {movies.map((movie, idx) => {
              return (
                <div key={movie.id} className="thumnail-frame">
                  <MovieThummail movie={movie} watched={user.watchlist.includes(movie.id) ? 1 : 0} />
                </div>
              )
            })}
          </Grid>
          {endReached ? (
            <></>
          ) : (
            <div className="progress">
              <CircularProgress />
            </div>
          )}
        </div>
        <Footer />
      </>
    )
  }
}

const mapStateToProps = state => ({
  user: state.user
})

export default connect(mapStateToProps)(Index)
