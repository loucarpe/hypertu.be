export const connectUser = (account, token) => ({
  type: 'CONNECT_USER',
  account,
  token
})

export const loadUser = account => ({
  type: 'LOAD_USER',
  account
})

export const disconnectUser = () => ({
  type: 'DISCONNECT_USER'
})

export const updateUser = fields => ({
  type: 'UPDATE_USER',
  fields
})

export const changeLang = lang => ({
  type: 'CHANGE',
  lang
})
