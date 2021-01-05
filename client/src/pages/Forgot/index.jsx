import React from 'react'
import {
  Container,
  Button,
  TextField,
  Grid,
  Typography,
  Avatar,
  Card,
  CardContent,
  createMuiTheme
} from '@material-ui/core'
import Snackbar from '@material-ui/core/Snackbar'
import MuiAlert from '@material-ui/lab/Alert'
import { ThemeProvider } from '@material-ui/styles'
import { LockOutlined } from '@material-ui/icons'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import axios from 'axios'

import { lightTheme } from '../../utils'

import './style.scss'

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />
}

class Form extends React.Component {
  constructor(props) {
    super(props)

    this.dispatch = props.dispatch

    this.state = {
      login: {
        value: ''
      },
      password: {
        value: '',
        shown: false
      },
      snackbarOpened: false
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

    const { login } = this.state

    try {
      const res = await axios.post(`${global.API_URL}/auth/forgotpwd`, {
        login: login.value
      })

      this.openSnackbar(res.status)
    } catch (ex) {
    }
  }

  openSnackbar(status) {
    if (status === 202) {
      this.setState({
        snackbarOpened: true
      })
    } else {
      this.setState({
        snackbarOpened: false
      })
    }
  }

  closeSnackbar() {
    this.setState({
      snackbarOpened: false
    })
  }

  render() {
    return (
      <ThemeProvider theme={lightTheme}>
        <div id="forgot" className="fullscreen-page">
          <Card id="card">
            <CardContent>
              <Container component="main" maxWidth="xs">
                <div id="content">
                  <Avatar id="avatar">
                    <LockOutlined />
                  </Avatar>
                  <Typography id="title" component="h1" variant="h5">
                    Forgotten Password
                  </Typography>
                  <form onSubmit={event => this.handleSubmit(event)} noValidate>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          id="login"
                          name="login"
                          autoComplete="login"
                          label="Email or Username"
                          variant="outlined"
                          value={this.state.login.value}
                          onChange={event => this.handleInput(event)}
                          required
                          fullWidth
                          autoFocus
                        />
                      </Grid>
                    </Grid>
                    <Button id="button" type="submit" fullWidth variant="contained" color="primary">
                      Send Email
                    </Button>
                    <Grid container>
                      <Grid item>
                        <Link className="link" to="/login">
                          Don't have an account? Sign Up
                        </Link>
                      </Grid>
                    </Grid>
                  </form>
                </div>
              </Container>
            </CardContent>
          </Card>

          <Snackbar open={this.state.snackbarOpened} autoHideDuration={3000} onClose={this.closeSnackbar.bind(this)}>
            <Alert severity="success">Votre mail de réinitialisation a été envoyé.</Alert>
          </Snackbar>
        </div>
      </ThemeProvider>
    )
  }
}

const mapStateToProps = state => ({
  user: state.user
})

export default connect(mapStateToProps)(Form)
