import React from 'react'
import { Tabs, Tab, Box, Button, ButtonGroup, Snackbar } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import { connect } from 'react-redux'
import axios from 'axios'

import { connectUser } from '../../store/actions'
import SignIn from '../../components/SignIn'
import SignUp from '../../components/SignUp'

import twitter from '../../assets/svgs/twitter.svg'
import google from '../../assets/svgs/google.svg'
import _42 from '../../assets/svgs/42.svg'
import './style.scss'

function TabPanel(props) {
  const { children, value, index, ...other } = props

  return (
    <div hidden={value !== index} {...other}>
      <Box p={3}>{children}</Box>
    </div>
  )
}

class Login extends React.Component {
  constructor(props) {
    super(props)

    this.openedWindow = null
    this.dispatch = props.dispatch

    this.state = {
      activeTab: 0,
      snackbarOpened: false,
      snackbarSeverity: 'success',
      snackbarMessage: ''
    }
  }

  componentDidMount() {
    window.addEventListener(
      'message',
      message => {
        if (message.origin === global.API_URL) {
          const account = JSON.parse(message.data.account)
          const token = message.data.token

          if (this.openedWindow != null) {
            this.openedWindow.close()
            this.openedWindow = null
          }

          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          this.dispatch(connectUser(account, token))
          this.props.history.push('/')
        }
      },
      false
    )
  }

  handleActiveTab(event, newTab) {
    this.setState({
      activeTab: newTab
    })
  }

  handleOauth(provider) {
    if (this.openedWindow != null && this.openedWindow.closed) this.openedWindow = null
    if (this.openedWindow != null) return

    this.openedWindow = window.open(`${global.API_URL}/auth/${provider}`, '_blank')
  }

  handleResult(result) {
    if (result.status === 'success') {
      const { account, token } = result.data

      this.dispatch(connectUser(account, token))
      this.props.history.push('/')
    } else {
      this.setState({
        snackbarOpened: true,
        snackbarSeverity: 'error',
        snackbarMessage: result.message
      })
    }
  }

  handleSnackbarClosing() {
    this.setState({
      snackbarOpened: false
    })
  }

  render() {
    const { activeTab, snackbarMessage, snackbarSeverity, snackbarOpened } = this.state

    const { lang } = this.props

    return (
      <div id="login" className="fullscreen-page">
        <div className="card">
          <div className="head">
            <Tabs
              value={activeTab}
              onChange={this.handleActiveTab.bind(this)}
              variant="fullWidth"
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label={lang['signin']} />
              <Tab label={lang['signup']} />
            </Tabs>
          </div>
          <div className="content">
            <TabPanel value={activeTab} index={0}>
              <SignIn onResult={this.handleResult.bind(this)} />
            </TabPanel>
            <TabPanel value={activeTab} index={1}>
              <SignUp onResult={this.handleResult.bind(this)} />
            </TabPanel>
          </div>
          <div className="foot">
            <ButtonGroup id="oauth-group" color="secondary" fullWidth>
              <Button style={{ backgroundColor: '#fff' }} onClick={_ => this.handleOauth('google')}>
                <img src={google} alt="" />
              </Button>
              <Button style={{ backgroundColor: '#292d39' }} onClick={_ => this.handleOauth('42')}>
                <img src={_42} alt="" />
              </Button>
              <Button style={{ backgroundColor: '#2bc4ff' }} onClick={_ => this.handleOauth('twitter')}>
                <img src={twitter} alt="" />
              </Button>
            </ButtonGroup>
          </div>
        </div>
        <Snackbar open={snackbarOpened} autoHideDuration={5000} onClose={this.handleSnackbarClosing.bind(this)}>
          <Alert onClose={this.handleSnackbarClosing.bind(this)} severity={snackbarSeverity} variant="filled">
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  lang: state.lang
})

export default connect(mapStateToProps)(Login)
