import React from 'react'
import { connect } from 'react-redux'
import {
  Container,
  Button,
  TextField,
  FormControl,
  FormHelperText,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Grid,
  Typography,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@material-ui/core'
import { Visibility, VisibilityOff } from '@material-ui/icons'
import { ThemeProvider } from '@material-ui/styles'
import AvatarUploader from 'react-avatar-edit'
import axios from 'axios'

import { connectUser } from '../../store/actions'
import { lightTheme } from '../../utils'

import logo from '../../assets/images/logo.png'
import './style.scss'

class SignUp extends React.Component {
  constructor(props) {
    super(props)

    this.sendResult = this.props.onResult

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
        shown: false,
        message: ''
      },
      confirm: {
        value: '',
        error: false,
        shown: false,
        message: ''
      },
      avatar: {
        value: null,
        error: false,
        message: ''
      },
      dialogOpened: false
    }
  }

  togglePasswordVisibility(name) {
    this.setState(state => ({
      [name]: {
        ...state[name],
        shown: !state[name].shown
      }
    }))
  }

  handleInput(event) {
    const { name, value } = event.target

    this.setState(state => ({
      [name]: {
        ...state[name],
        error: false,
        message: '',
        value
      }
    }))
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

  async handleSubmit(event) {
    event.preventDefault()

    const { lang } = this.props
    const { firstname, lastname, username, email, password, confirm, avatar } = this.state

    try {
      if (password.value !== confirm.value) {
        this.setError('password', lang['err_confirm'])
        this.setError('confirm', lang['err_confirm'])
        return
      }
      if (avatar.value == null) {
        this.setError('avatar', lang['err_avatar'])
        return
      }

      let avatarLink
      try {
        const upload = new FormData()
        upload.append('file', this.dataURItoBlob(avatar.value))
        upload.append('type', 'avatar')
  
        const { link } = (await axios.put(`${global.API_URL}/storage/upload`, upload)).data
        avatarLink = link
      } catch (ex) {
        this.setError('avatar', lang['err_avatar_too_large'])
        return
      }

      const res = await axios.post(`${global.API_URL}/auth/signup`, {
        firstname: firstname.value !== '' ? firstname.value : undefined,
        lastname: lastname.value !== '' ? lastname.value : undefined,
        username: username.value !== '' ? username.value : undefined,
        email: email.value !== '' ? email.value : undefined,
        password: password.value !== '' ? password.value : undefined,
        avatar: avatarLink
      })

      const { token } = (
        await axios.post(`${global.API_URL}/auth/signin`, {
          login: username.value,
          password: password.value
        })
      ).data

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

      const account = (await axios.get(`${global.API_URL}/account`)).data

      this.sendResult({
        status: 'success',
        data: {
          account,
          token
        }
      })
    } catch (ex) {
      const res = ex.response

      if (res.status === 400) {
        for (let err of res.data.errors) {
          this.setError(err.param, lang[`err_${err.param}`])
        }
      } else if (res.status === 409) {
        const { key } = res.data
        this.setError(key, lang[`err_${key}_already_used`])
      } else {
        this.sendResult({
          status: 'error',
          message: lang['err_404']
        })
      }
    }
  }

  render() {
    const { firstname, lastname, username, email, password, confirm, avatar, dialogOpened } = this.state
    const lang = this.props.lang

    return (
      <ThemeProvider theme={lightTheme}>
        <div id="signup">
          <Container component="main" maxWidth="sm">
            <div id="content">
              <Avatar src={logo} alt="" />
              <Typography id="title" component="h1" variant="h5">
                {lang['signup']}
              </Typography>
              <form onSubmit={this.handleSubmit.bind(this)} noValidate>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      id="firstname"
                      name="firstname"
                      autoComplete="firstname"
                      label={lang['firstname']}
                      variant="outlined"
                      value={firstname.value}
                      error={firstname.error}
                      helperText={firstname.message}
                      onChange={this.handleInput.bind(this)}
                      fullWidth
                      autoFocus
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      id="lastname"
                      name="lastname"
                      autoComplete="lastname"
                      label={lang['lastname']}
                      variant="outlined"
                      value={lastname.value}
                      error={lastname.error}
                      helperText={lastname.message}
                      onChange={this.handleInput.bind(this)}
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
                      value={username.value}
                      error={username.error}
                      helperText={username.message}
                      onChange={this.handleInput.bind(this)}
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
                      value={email.value}
                      error={email.error}
                      helperText={email.message}
                      onChange={this.handleInput.bind(this)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl variant="outlined" error={password.error} fullWidth>
                      <InputLabel htmlFor="password">{lang['password']}</InputLabel>
                      <OutlinedInput
                        id="password"
                        name="password"
                        autoComplete="password"
                        label={lang['password']}
                        variant="outlined"
                        type={password.shown ? 'text' : 'password'}
                        value={password.value}
                        onChange={this.handleInput.bind(this)}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={event => this.togglePasswordVisibility('password')}
                              onMouseDown={event => event.preventDefault()}
                              tabIndex="-1"
                              edge="end"
                            >
                              {password.shown ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                      {password.error ? <FormHelperText>{password.message}</FormHelperText> : <></>}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl variant="outlined" error={confirm.error} fullWidth>
                      <InputLabel htmlFor="confirm">{lang['confirm']}</InputLabel>
                      <OutlinedInput
                        id="confirm"
                        name="confirm"
                        autoComplete="password"
                        label={lang['confirm']}
                        variant="outlined"
                        type={confirm.shown ? 'text' : 'password'}
                        value={confirm.value}
                        onChange={this.handleInput.bind(this)}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={event => this.togglePasswordVisibility('confirm')}
                              onMouseDown={event => event.preventDefault()}
                              tabIndex="-1"
                              edge="end"
                            >
                              {confirm.shown ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                      {confirm.error ? <FormHelperText>{confirm.message}</FormHelperText> : <></>}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <div className="avatar-container">
                      <div className="avatar-wrapper">
                        <Avatar id="avatar" src={avatar.value} alt="" />
                        {avatar.error ? <FormHelperText id="avatar-error">{avatar.message}</FormHelperText> : <></>}
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
                </Grid>
                <Button id="submit" type="submit" variant="contained" color="primary" fullWidth>
                  {lang['signup']}
                </Button>
              </form>
            </div>
          </Container>
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
        </div>
      </ThemeProvider>
    )
  }
}

const mapStateToProps = state => ({
  lang: state.lang
})

export default connect(mapStateToProps)(SignUp)
