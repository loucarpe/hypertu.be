const frFR = require('../../assets/lang/fr-FR.json')
const enUS = require('../../assets/lang/en-US.json')

const languages = {
  'fr-FR': frFR,
  'en-US': enUS
}

const change = lang => {
  return languages[lang]
}

const lang = (state = {}, action) => {
  switch (action.type) {
    case 'CHANGE':
      return change(action.lang)
    default:
      return state
  }
}

export default lang
