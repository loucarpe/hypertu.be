import React from 'react'
import {
  Container,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Typography,
  Avatar
} from '@material-ui/core'
import { Visibility, VisibilityOff } from '@material-ui/icons'
import { ThemeProvider } from '@material-ui/styles'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import axios from 'axios'

import { lightTheme } from '../../utils'

import logo from '../../assets/images/logo.png'
import './style.scss'

class SignIn extends React.Component {
  constructor(props) {
    super(props)

    this.sendResult = this.props.onResult

    this.state = {
      login: {
        value: ''
      },
      password: {
        value: '',
        shown: false
      }
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

    const { login, password } = this.state

    try {
      const { token } = (
        await axios.post(`${global.API_URL}/auth/signin`, {
          login: login.value,
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
      this.sendResult({
        status: 'error',
        message: ex.response.data.error.msg
      })
    }
  }

  render() {
    const lang = this.props.lang

    return (
      <ThemeProvider theme={lightTheme}>
        <div id="signin">
          <Container component="main" maxWidth="xs">
            <div id="content">
              <Avatar src={logo} alt="" />
              <Typography id="title" component="h1" variant="h5">
                {lang['signin']}
              </Typography>
              <form style={{ textAlign: 'center' }} onSubmit={this.handleSubmit.bind(this)} noValidate>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      id="login"
                      name="login"
                      autoComplete="login"
                      label={lang['login']}
                      variant="outlined"
                      value={this.state.login.value}
                      onChange={this.handleInput.bind(this)}
                      fullWidth
                      autoFocus
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl variant="outlined" fullWidth>
                      <InputLabel htmlFor="password">{lang['password']}</InputLabel>
                      <OutlinedInput
                        id="password"
                        name="password"
                        autoComplete="password"
                        label={lang['password']}
                        variant="outlined"
                        type={this.state.password.shown ? 'text' : 'password'}
                        value={this.state.password.value}
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
                              {this.state.password.shown ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                    </FormControl>
                  </Grid>
                </Grid>
                <Button id="submit" type="submit" variant="contained" color="primary" fullWidth>
                  {lang['signin']}
                </Button>
                <Link className="link" to="/forgotpwd">
                  {lang['forgot_password']}
                </Link>
              </form>
            </div>
          </Container>
        </div>
      </ThemeProvider>
    )
  }
}

const mapStateToProps = state => ({
  lang: state.lang
})

export default connect(mapStateToProps)(SignIn)
