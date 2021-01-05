import React from 'react'
import {
  Container,
  Button,
  Grid,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Typography,
  Avatar,
  Card,
  CardContent,
  createMuiTheme
} from '@material-ui/core'
import Snackbar from '@material-ui/core/Snackbar'
import MuiAlert from '@material-ui/lab/Alert'
import { ThemeProvider } from '@material-ui/styles'
import { LockOutlined, Visibility, VisibilityOff } from '@material-ui/icons'
import { connect } from 'react-redux'
import axios from 'axios'

import './style.scss'

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />
}

const theme = createMuiTheme({
  palette: {
    type: 'light',
    primary: {
      light: '#ef4c40',
      main: '#b50717',
      dark: '#7d0000'
    }
  }
})

class SignIn extends React.Component {
  constructor(props) {
    super(props)

    this.dispatch = props.dispatch

    this.state = {
      newPassword: {
        value: '',
        shown: false
      },
      confirm: {
        value: '',
        shown: false
      },
      snackbarOpened: false,
      alerteMessage: ''
    }
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

  handleInput(event) {
    const { name, value } = event.target

    this.setState(state => {
      return {
        [name]: {
          ...state[name],
          value
        }
      }
    })
  }

  async handleSubmit(event) {
    event.preventDefault()

    const { newPassword, confirm } = this.state

    if (newPassword.value === confirm.value) {
      const url = new URL(window.location.href)

      try {
        const res = await axios.post(`${global.API_URL}/auth/resetpwd`, {
          token: url.searchParams.get('token'),
          new_password: this.state.newPassword.value
        })
        if (res.status === 200) {
          this.props.history.push('/login')
        }
      } catch (error) {
        if (error.response.status === 401) {
          this.setState({
            snackbarOpened: true,
            alerteMessage: 'Your token is false or expired'
          })
        } else if (error.response.status === 400) {
          this.setState({
            snackbarOpened: true,
            alerteMessage: 'Incorrect Password'
          })
        }
      }
    } else {
      this.setState({
        snackbarOpened: true,
        alerteMessage: "Passwords don't match"
      })
    }
  }

  closeSnackbar() {
    this.setState({
      snackbarOpened: false
    })
  }

  render() {
    const { newPassword, confirm } = this.state

    return (
      <ThemeProvider theme={theme}>
        <div id="reset" className="fullscreen-page">
          <Card id="card">
            <CardContent>
              <Container component="main" maxWidth="xs">
                <div id="content">
                  <Avatar id="avatar">
                    <LockOutlined />
                  </Avatar>
                  <Typography id="title" component="h1" variant="h5">
                    Reset Your Password
                  </Typography>
                  <form onSubmit={event => this.handleSubmit(event)} noValidate>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControl variant="outlined" fullWidth>
                          <InputLabel htmlFor="password">New Password</InputLabel>
                          <OutlinedInput
                            id="new-password"
                            name="newPassword"
                            autoComplete="password"
                            label="New Password"
                            variant="outlined"
                            type={newPassword.shown ? 'text' : 'password'}
                            value={newPassword.value}
                            onChange={event => this.handleInput(event)}
                            required
                            endAdornment={
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="toggle password visibility"
                                  onClick={event => this.togglePasswordVisibility('newPassword')}
                                  onMouseDown={event => event.preventDefault()}
                                  tabIndex="-1"
                                  edge="end"
                                >
                                  {newPassword.shown ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                              </InputAdornment>
                            }
                            labelWidth={70}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl variant="outlined" fullWidth>
                          <InputLabel htmlFor="password">Confirmation</InputLabel>
                          <OutlinedInput
                            id="confirm"
                            name="confirm"
                            autoComplete="password"
                            label="Confirmation"
                            variant="outlined"
                            type={confirm.shown ? 'text' : 'password'}
                            value={confirm.value}
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
                                  {confirm.shown ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                              </InputAdornment>
                            }
                            labelWidth={70}
                          />
                        </FormControl>
                      </Grid>
                    </Grid>
                    <Button id="button" type="submit" fullWidth variant="contained" color="primary">
                      Reset Password
                    </Button>
                  </form>
                </div>
              </Container>
            </CardContent>
          </Card>

          <Snackbar open={this.state.snackbarOpened} autoHideDuration={3000} onClose={this.closeSnackbar.bind(this)}>
            <Alert severity="error">{this.state.alerteMessage}</Alert>
          </Snackbar>
        </div>
      </ThemeProvider>
    )
  }
}

const mapStateToProps = state => ({
  user: state.user
})

export default connect(mapStateToProps)(SignIn)
