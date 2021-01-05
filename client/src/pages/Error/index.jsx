import React from 'react'
import { Container, Button, Typography, Card, CardContent, createMuiTheme } from '@material-ui/core'

import { ThemeProvider } from '@material-ui/styles'
import { Link } from 'react-router-dom'
import ReportTwoToneIcon from '@material-ui/icons/Report'

import { lightTheme } from '../../utils'

import './style.scss'

export default function Error() {
  return (
    <ThemeProvider theme={lightTheme}>
      <div id="error" className="fullscreen-page">
        <Card id="card">
          <CardContent>
            <Container component="main" maxWidth="xs">
              <div id="content">
                <ReportTwoToneIcon fontSize="large" color="primary" />
                <Typography id="title" component="h1" variant="h5">
                  Oups, we fucked up
                </Typography>
                <a href="/">
                  <Button id="button" type="submit" fullWidth variant="contained" color="primary">
                    Home
                  </Button>
                </a>
              </div>
            </Container>
          </CardContent>
        </Card>
      </div>
    </ThemeProvider>
  )
}
