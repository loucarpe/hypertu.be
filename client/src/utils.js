import { createMuiTheme } from '@material-ui/core'

const primaryColor = {
  light: '#ef4c40',
  main: '#b50717',
  dark: '#7d0000'
}
const secondaryColor = {
  light: '#6f6f6f',
  main: '#444444',
  dark: '#1d1d1d'
}

export const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: primaryColor,
    secondary: secondaryColor
  }
})
export const lightTheme = createMuiTheme({
  palette: {
    type: 'light',
    primary: primaryColor,
    secondary: secondaryColor
  }
})
