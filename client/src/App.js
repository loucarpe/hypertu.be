import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { ParallaxProvider  } from 'react-scroll-parallax'
import { ThemeProvider } from '@material-ui/styles'
import ScrollToTop from 'react-router-scroll-top'
import { connect } from 'react-redux'
import axios from 'axios'

import { loadUser, disconnectUser, changeLang } from './store/actions'
import PrivateRoute from './components/PrivateRoute'
import { darkTheme } from './utils'

import Login from './pages/Login'
import Index from './pages/Index/index'
import Forgot from './pages/Forgot'
import Reset from './pages/Reset'
import Account from './pages/Account'
import Movie from './pages/Movie'
import Watch from './pages/Watch'
import Error from './pages/Error'

import './assets/scss/global.scss'

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      loaded: false
    }
  }

  componentDidMount() {
    if (localStorage.getItem('session-token') !== null) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('session-token')}`
      this.getUserAccount().then(() => {
        this.setState({ loaded: true })
      })
    } else {
      this.changeLangWithNavigator()
      this.setState({ loaded: true })
    }
  }

  changeLangWithNavigator() {
    let lang = navigator.language === 'fr' ? 'fr-FR' : 'en-US'
    this.props.dispatch(changeLang(lang))
  }

  async getUserAccount() {
    try {
      const account = (await axios.get(`${global.API_URL}/account`)).data
      this.props.dispatch(changeLang(account.language))
      this.props.dispatch(loadUser(account))
    } catch (ex) {
      this.changeLangWithNavigator()
      this.props.dispatch(disconnectUser())
    }
  }

  render() {
    return this.state.loaded ? (
      <ThemeProvider theme={darkTheme}>
        <ParallaxProvider>
          <Router>
            <ScrollToTop>
              <Switch>
                <Route path="/login" exact component={Login} />
                <Route path="/forgotpwd" exact component={Forgot} />
                <Route path="/resetpwd" exact component={Reset} />
                <PrivateRoute path="/" exact component={Index} />
                <PrivateRoute path="/account" exact component={Account} />
                <PrivateRoute path="/account/:username" exact component={Account} />
                <PrivateRoute path="/movie/:id" exact component={Movie} />
                <PrivateRoute path="/watch/:movieId/:imdb_id/:magnet" exact component={Watch} />
                <Route component={Error} />
              </Switch>
            </ScrollToTop>
          </Router>
        </ParallaxProvider>
      </ThemeProvider>
    ) : (
      <div className="loading-screen">{this.icon()}</div>
    )
  }

  icon() {
    return (
      <svg width="682.667" height="682.667" version="1.1" viewBox="0 0 682.667 682.667">
        <defs>
          <clipPath id="a" clipPathUnits="userSpaceOnUse">
            <path d="M0 512h512V0H0z"></path>
          </clipPath>
        </defs>
        <g clipPath="url(#a)" transform="matrix(1.33333 0 0 -1.33333 0 682.667)">
          <path
            fill="#ececec"
            fillOpacity="1"
            fillRule="nonzero"
            stroke="none"
            d="M0 0h.001C141.385 0 256-114.615 256-256S141.385-512 .001-512H0c-141.385 0-256 114.615-256 256S-141.384 0 0 0"
            transform="translate(256 512)"
          ></path>
          <path
            fill="#1d1d1d"
            fillOpacity="1"
            fillRule="nonzero"
            stroke="none"
            d="M0 0l96.961 167.242v.109H-.049L-97.039 0h3.087z"
            transform="translate(318.56 239.99)"
          ></path>
          <path
            fill="#b50717"
            fillOpacity="1"
            fillRule="nonzero"
            stroke="none"
            d="M0 0h97.003l107.039-167.331L97.003-334.662H0l107.039 167.331z"
            transform="translate(114.479 407.322)"
          ></path>
        </g>
      </svg>
    )
  }
}

export default connect()(App)
