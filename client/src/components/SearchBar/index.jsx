import React from 'react'
import {
  IconButton,
  InputBase,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  Input,
  MenuItem,
  Button,
  createMuiTheme
} from '@material-ui/core'
import { ThemeProvider } from '@material-ui/core/styles'
import { Search, TuneRounded } from '@material-ui/icons'
import { connect } from 'react-redux'

import { darkTheme, lightTheme } from '../../utils'

import './style.scss'
import axios from 'axios'

class SearchBar extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      focus: false,
      dialogOpened: false,
      genre: '',
      genres: [],
      year: ''
    }
  }

  componentDidMount() {
    this.fetchGenres()
  }

  async fetchGenres() {
    try {
      const res = await axios.get(`${global.API_URL}/movies/genres`)
      this.setState({
        genres: res.data
      })
    } catch (ex) {}
  }

  handleOpening() {
    this.setState({
      dialogOpened: true
    })
  }

  handleInput(event) {
    this.props.onChange(event.target.value)
  }

  handleChange(event) {
    const { name, value } = event.target

    this.setState({
      [name]: value
    })
  }

  handleClose() {
    const { year, genre } = this.state

    this.props.onFilter({
      year: year === '' ? null : year,
      genre: genre === '' ? null : genre
    })

    this.setState({
      dialogOpened: false
    })
  }

  render() {
    const { dialogOpened, genre, genres, year } = this.state
    const { lang } = this.props
    
    return (
      <div id="search-bar">
        <ThemeProvider theme={this.state.focus ? lightTheme : darkTheme}>
          <div id="search">
            <Paper component="form" onSubmit={event => event.preventDefault()}>
              <IconButton disableRipple>
                <Search />
              </IconButton>
              <InputBase
                placeholder={lang['search']}
                onFocus={_ =>
                  this.setState({
                    focus: true
                  })
                }
                onBlur={_ =>
                  this.setState({
                    focus: false
                  })
                }
                onChange={this.handleInput.bind(this)}
              />
              <IconButton onClick={this.handleOpening.bind(this)}>
                <TuneRounded />
              </IconButton>
            </Paper>
          </div>
          <ThemeProvider
            theme={createMuiTheme({
              palette: {
                type: 'dark',
                primary: {
                  light: '#ef4c40',
                  main: '#ef4c40',
                  dark: '#ef4c40'
                }
              }
            })}
          >
            <Dialog open={dialogOpened} onClose={this.handleClose.bind(this)}>
              <DialogTitle>{lang['filters']}</DialogTitle>
              <DialogContent>
                <form>
                  <FormControl id="year-form">
                    <InputLabel id="year">{lang['year']}</InputLabel>
                    <Select
                      labelId={lang['year']}
                      name="year"
                      value={year}
                      onChange={this.handleChange.bind(this)}
                      input={<Input />}
                    >
                      <MenuItem value="">
                        <em>{lang['none']}</em>
                      </MenuItem>
                      {this.yearItems()}
                    </Select>
                  </FormControl>
                  <FormControl id="genre-form">
                    <InputLabel id="genre">{lang['category']}</InputLabel>
                    <Select
                      labelId="genre"
                      name="genre"
                      value={genre}
                      onChange={this.handleChange.bind(this)}
                      input={<Input />}
                    >
                      <MenuItem value="">
                        <em>{lang['none']}</em>
                      </MenuItem>
                      {this.genresItems(genres)}
                    </Select>
                  </FormControl>
                </form>
              </DialogContent>
              <DialogActions>
                <Button onClick={this.handleClose.bind(this)} color="primary">
                  {lang['filter']}
                </Button>
              </DialogActions>
            </Dialog>
          </ThemeProvider>
        </ThemeProvider>
      </div>
    )
  }

  yearItems() {
    let result = []

    const from = 1960
    const to = 2020

    for (let i = to; i > from - 1; i--) {
      result.push(
        <MenuItem key={i} value={i}>
          {i}
        </MenuItem>
      )
    }

    return result
  }

  genresItems(genres) {
    return genres.map(genre => (
      <MenuItem key={genre.id} value={genre.id}>
        {genre.name}
      </MenuItem>
    ))
  }
}

const mapStateToProps = state => ({
  user: state.user,
  lang: state.lang
})

export default connect(mapStateToProps)(SearchBar)
