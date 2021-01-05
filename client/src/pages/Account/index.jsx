import React from 'react'
import {
  TextField,
  FormControl,
  FormHelperText,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Grid,
  Button,
  Select,
  MenuItem,
  Card,
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ThemeProvider,
  Snackbar
} from '@material-ui/core'
import { Visibility, VisibilityOff } from '@material-ui/icons'
import AvatarUploader from 'react-avatar-edit'
import { Alert } from '@material-ui/lab'
import { connect } from 'react-redux'
import axios from 'axios'

import MovieThumbnail from '../../components/MovieThumbnail'
import { updateUser, changeLang } from '../../store/actions'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { darkTheme } from '../../utils'

import './style.scss'

class Account extends React.Component {
  constructor(props) {
    super(props)

    this.dispatch = props.dispatch
    this.file = null

    this.state = {
      firstname: {
        value: '',
        error: false,
        message: ''
      },
      lastname: {
        value: '',
        error: false,
        message: ''
      },
      username: {
        value: '',
        error: false,
        message: ''
      },
      email: {
        value: '',
        error: false,
        message: ''
      },
      password: {
        value: '',
        error: false,
        shown: false
      },
      confirm: {
        value: '',
        error: false,
        shown: false
      },
      language: {
        value: '',
        error: false
      },
      avatar: {
        value: null,
        error: false,
        message: ''
      },
      account: undefined,
      detailedWatchlist: {},
      dialogOpened: false,
      snackbarOpened: false,
      snackbarSeverity: 'success',
      snackbarMessage: ''
    }
  }

  componentDidMount() {
    const {
      match: { params }
    } = this.props

    if (params != null && params.username != null) {
      this.fetchAccount(params.username).catch(() => (window.location.href = '/error'))
    } else {
      this.setState({
        account: null
      })
      this.fetchWatchlistDetails()
    }
  }

  async fetchAccount(username) {
    const res = await axios.get(`${global.API_URL}/profile/${username}`)

    this.setState({
      account: res.data
    })
  }

  async fetchWatchlistDetails(username) {
    const res = await axios.get(`${global.API_URL}/account/watchlist/details`)

    this.setState({
      detailedWatchlist: res.data.results
    })
  }

  handleInput(event) {
    const { name, value } = event.target

    this.setState(state => {
      return {
        [name]: {
          ...state[name],
          value,
          error: false,
          message: ''
        }
      }
    })
  }

  togglePasswordVisibility(name) {
    this.setState(state => {
      return {
        [name]: {
          ...state[name],
          shown: !state[name].shown
        }
      }
    })
  }

  handlePreviewClose() {
    this.setState({
      avatar: {
        value: null,
        error: false,
        message: ''
      }
    })
  }

  handlePreviewCrop(preview) {
    this.setState({
      avatar: {
        value: preview,
        error: false,
        message: ''
      }
    })
  }

  handlePreviewLoad(file) {
    this.file = file
  }

  handleDialogClose() {
    this.setState({
      dialogOpened: false
    })
  }

  setError(field, message) {
    this.setState(state => ({
      [field]: {
        ...state[field],
        error: true,
        message
      }
    }))
  }

  dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString
    if (dataURI.split(',')[0].indexOf('base64') >= 0) byteString = atob(dataURI.split(',')[1])
    else byteString = unescape(dataURI.split(',')[1])

    // separate out the mime component
    var mimeString = dataURI
      .split(',')[0]
      .split(':')[1]
      .split(';')[0]

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length)
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i)
    }

    return new Blob([ia], { type: mimeString })
  }

  handleSnackbarClosing() {
    this.setState({
      snackbarOpened: false
    })
  }

  async handleSubmit(event) {
    event.preventDefault()

    const { lang } = this.props

    try {
      if (this.state.password.value !== this.state.confirm.value) {
        this.setError('password', lang['err_confirm'])
        this.setError('confirm', lang['err_confirm'])
        return
      }

      let data = {}

      for (let field in this.state) {
        if (
          field === 'detailedWatchlist' ||
          field === 'dialogOpened' ||
          field === 'confirm' ||
          field === 'avatar' ||
          field === 'account' ||
          field.includes('snackbar')
        )
          continue

        const value = this.state[field].value
        if (value !== '' && value != null) data[field] = value
      }

      if (this.state.avatar.value != null) {
        try {
          const upload = new FormData()
          upload.append('file', this.dataURItoBlob(this.state.avatar.value))
          upload.append('type', 'avatar')

          const { link } = (await axios.put(`${global.API_URL}/storage/upload`, upload)).data

          data.avatar = link
        } catch (ex) {
          this.setError('avatar', lang['err_avatar_too_large'])
          return
        }
      }

      if (Object.keys(data).length <= 0) return

      const res = await axios.post(`${global.API_URL}/account/update`, data)

      if (this.state.language.value !== '') this.dispatch(changeLang(this.state.language.value))
      this.dispatch(updateUser(data))

      this.setState({
        firstname: {
          value: '',
          error: false,
          message: ''
        },
        lastname: {
          value: '',
          error: false,
          message: ''
        },
        username: {
          value: '',
          error: false,
          message: ''
        },
        email: {
          value: '',
          error: false,
          message: ''
        },
        password: {
          value: '',
          error: false,
          message: ''
        },
        confirm: {
          value: '',
          error: false,
          message: ''
        },
        language: {
          value: '',
          error: false,
          message: ''
        },
        avatar: {
          value: null,
          error: false,
          message: ''
        }
      })

      this.setState({
        snackbarOpened: true,
        snackbarSeverity: 'success',
        snackbarMessage: lang['account_updated']
      })
    } catch (ex) {
      const res = ex.response

      if (res == null)
        return

      if (res.status === 400) {
        for (let err of res.data.errors) {
          this.setError(err.param, lang[`err_${err.param}`])
        }
      } else if (res.status === 409) {
        const { key } = res.data
        this.setError(key, lang[`err_${key}_already_used`])
      } else {
        this.setState({
          snackbarOpened: true,
          snackbarSeverity: 'error',
          snackbarMessage: lang['err_404']
        })
      }
    }
  }

  render() {
    const lang = this.props.lang
    const { account, detailedWatchlist, dialogOpened, snackbarMessage, snackbarOpened, snackbarSeverity } = this.state

    const user = this.props.user

    const username = account === null ? user.username : account !== undefined ? account.username : ''
    const firstname = account === null ? user.firstname : account !== undefined ? account.firstname : ''
    const lastname = account === null ? user.lastname : account !== undefined ? account.lastname : ''
    const language = account === null ? user.language : account !== undefined ? account.language : ''
    const avatar = account === null ? user.avatar : account !== undefined ? account.avatar : ''
    const email = account === null ? user.email : ''

    return (
      <>
        <Header />
        <div id="account" className="page">
          <ThemeProvider theme={darkTheme}>
            <div className="account-page-container">
              <div className="account-page-header">
                <h1 className="account-page-title">
                  {account === null
                    ? lang['account']
                    : account !== undefined
                    ? lang['account_of'].replace('$1', `@${account.username}`)
                    : ''}
                </h1>
              </div>
              <div className="account-page-information-container">
                <div className="information-side">
                  <Card className="information-card">
                    <div className="profile-picture-container">
                      <img src={avatar} alt="" />
                    </div>
                    <div className="information-user-container">
                      <p id="name">
                        {firstname} {lastname}
                      </p>
                      <p id="username">@{username}</p>
                      {account === null ? <p id="email">{email}</p> : <></>}
                    </div>
                  </Card>
                </div>
                <div className="information-main">
                  {account === null ? (
                    <Card className="modify-personal-data-container">
                      <h2 id="modify-data">{lang['modify_data']}</h2>
                      <form onSubmit={event => this.handleSubmit(event)} noValidate>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              id="firstname"
                              name="firstname"
                              autoComplete="firstname"
                              label={lang['firstname']}
                              variant="outlined"
                              value={this.state.firstname.value}
                              error={this.state.firstname.error}
                              helperText={this.state.firstname.message}
                              onChange={event => this.handleInput(event)}
                              fullWidth
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              id="lastname"
                              name="lastname"
                              autoComplete="lastname"
                              label={lang['lastname']}
                              variant="outlined"
                              value={this.state.lastname.value}
                              error={this.state.lastname.error}
                              helperText={this.state.lastname.message}
                              onChange={event => this.handleInput(event)}
                              fullWidth
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              id="username"
                              name="username"
                              autoComplete="username"
                              label={lang['username']}
                              variant="outlined"
                              value={this.state.username.value}
                              error={this.state.username.error}
                              helperText={this.state.username.message}
                              onChange={event => this.handleInput(event)}
                              fullWidth
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              id="email"
                              name="email"
                              autoComplete="email"
                              label={lang['email']}
                              variant="outlined"
                              value={this.state.email.value}
                              error={this.state.email.error}
                              helperText={this.state.email.message}
                              onChange={event => this.handleInput(event)}
                              fullWidth
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <FormControl variant="outlined" error={this.state.password.error} fullWidth>
                              <InputLabel htmlFor="password">{lang['password']}</InputLabel>
                              <OutlinedInput
                                id="password"
                                name="password"
                                autoComplete="password"
                                label={lang['password']}
                                variant="outlined"
                                type={this.state.password.shown ? 'text' : 'password'}
                                value={this.state.password.value}
                                onChange={event => this.handleInput(event)}
                                endAdornment={
                                  <InputAdornment position="end">
                                    <IconButton
                                      aria-label="toggle password visibility"
                                      onClick={event => this.togglePasswordVisibility('password')}
                                      onMouseDown={event => event.preventDefault()}
                                      tabIndex="-1"
                                      edge="end"
                                    >
                                      {this.state.password.shown ? <Visibility /> : <VisibilityOff />}
                                    </IconButton>
                                  </InputAdornment>
                                }
                              />
                              {this.state.password.error ? (
                                <FormHelperText>{lang['err_password']}</FormHelperText>
                              ) : (
                                <></>
                              )}
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <FormControl variant="outlined" error={this.state.confirm.error} fullWidth>
                              <InputLabel htmlFor="confirm">{lang['confirm']}</InputLabel>
                              <OutlinedInput
                                id="confirm"
                                name="confirm"
                                autoComplete="password"
                                label={lang['confirm']}
                                variant="outlined"
                                type={this.state.confirm.shown ? 'text' : 'password'}
                                value={this.state.confirm.value}
                                onChange={event => this.handleInput(event)}
                                required
                                endAdornment={
                                  <InputAdornment position="end">
                                    <IconButton
                                      aria-label="toggle password visibility"
                                      onClick={event => this.togglePasswordVisibility('confirm')}
                                      onMouseDown={event => event.preventDefault()}
                                      tabIndex="-1"
                                      edge="end"
                                    >
                                      {this.state.confirm.shown ? <Visibility /> : <VisibilityOff />}
                                    </IconButton>
                                  </InputAdornment>
                                }
                              />
                              {this.state.confirm.error ? (
                                <FormHelperText>{lang['err_confirm']}</FormHelperText>
                              ) : (
                                <></>
                              )}
                            </FormControl>
                          </Grid>
                          <Grid item sm={12} md={6}>
                            <div className="avatar-container">
                              <div className="avatar-wrapper">
                                <Avatar id="avatar" src={this.state.avatar.value} alt="" />
                                {this.state.avatar.error ? (
                                  <FormHelperText id="avatar-error">{this.state.avatar.message}</FormHelperText>
                                ) : (
                                  <></>
                                )}
                              </div>
                              <Button
                                id="upload"
                                variant="contained"
                                color="primary"
                                onClick={_ => this.setState({ dialogOpened: true })}
                              >
                                Upload
                              </Button>
                            </div>
                          </Grid>
                          <Grid className="language-container" item xs={12} sm={12} md={6}>
                            <FormControl variant="outlined" fullWidth>
                              <InputLabel id="language">{lang['language']}</InputLabel>
                              <Select
                                id="language"
                                name="language"
                                label={lang['language']}
                                value={this.state.language.value}
                                onChange={this.handleInput.bind(this)}
                              >
                                <MenuItem value={'en-US'}>
                                  <span role="img" aria-label="">
                                    🇺🇸
                                  </span>{' '}
                                  English
                                </MenuItem>
                                <MenuItem value={'fr-FR'}>
                                  <span role="img" aria-label="">
                                    🇫🇷
                                  </span>{' '}
                                  Français
                                </MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Button id="submit" type="submit" fullWidth variant="contained" color="primary">
                            {lang['send']}
                          </Button>
                        </Grid>
                      </form>
                    </Card>
                  ) : (
                    <></>
                  )}
                  <Card className="user-watchlist-container">
                    <h2 id="watchlist">{lang['watchlist']}</h2>
                    <Grid
                      className="watchlist-informations"
                      container
                      direction="row"
                      justify="space-around"
                      alignItems="flex-start"
                    >
                      {Object.keys(account == null ? detailedWatchlist : account.watchlist).map((i, key) => (
                        <div className="watched-movie-information" key={key}>
                          <MovieThumbnail
                            movie={(account == null ? detailedWatchlist : account.watchlist)[i]}
                            watched={1}
                          />
                        </div>
                      ))}
                    </Grid>
                  </Card>
                </div>
              </div>
            </div>
            <Dialog
              disableEscapeKeyDown
              disableBackdropClick
              open={dialogOpened}
              onClose={this.handleDialogClose.bind(this)}
            >
              <DialogTitle>Avatar</DialogTitle>
              <DialogContent>
                <AvatarUploader
                  width={390}
                  height={300}
                  onClose={this.handlePreviewClose.bind(this)}
                  onCrop={this.handlePreviewCrop.bind(this)}
                  onFileLoad={this.handlePreviewLoad.bind(this)}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={this.handleDialogClose.bind(this)} color="primary">
                  Ok
                </Button>
              </DialogActions>
            </Dialog>
            <Snackbar open={snackbarOpened} autoHideDuration={5000} onClose={this.handleSnackbarClosing.bind(this)}>
              <Alert onClose={this.handleSnackbarClosing.bind(this)} severity={snackbarSeverity} variant="filled">
                {snackbarMessage}
              </Alert>
            </Snackbar>
          </ThemeProvider>
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

export default connect(mapStateToProps)(Account)
