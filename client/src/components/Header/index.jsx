import React from 'react'
import { Person, ExitToApp } from '@material-ui/icons'
import { Avatar, Tooltip } from '@material-ui/core'
import { Link, useHistory } from 'react-router-dom'
import { connect } from 'react-redux'

import { disconnectUser } from '../../store/actions'

import logo from '../../assets/svgs/logo.svg'
import './style.scss'

const Header = props => {
  const { user, dispatch, lang } = props
  const history = useHistory()

  return (
    <div id="header">
      <div className="logo">
        <a href="/">
          <img src={logo} alt="Hypertube" />
        </a>
      </div>

      <div className="actions">
        <div className="action">
          <Tooltip title={lang['logout']}>
            <Avatar
              className="avatar"
              alt="Logout"
              onClick={_ => {
                dispatch(disconnectUser())
                history.push('/login')
              }}
            >
              <ExitToApp />
            </Avatar>
          </Tooltip>
        </div>

        <div className="action">
          <Link to="/account">
            <Tooltip title={lang['account']}>
              <Avatar className="avatar" alt="Avatar" src={user ? user.avatar : null}>
                <Person />
              </Avatar>
            </Tooltip>
          </Link>
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = state => ({
  user: state.user,
  lang: state.lang
})

export default connect(mapStateToProps)(Header)
