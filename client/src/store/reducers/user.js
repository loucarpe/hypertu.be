const connect = (account, token) => {
  localStorage.setItem('session-token', token)
  return account
}
const load = account => {
  return account
}
const disconnect = () => {
  localStorage.removeItem('session-token')
  return null
}

const update = (state, fields) => {
  return {
    ...state,
    ...fields
  }
}

const user = (state = null, action) => {
  switch (action.type) {
    case 'CONNECT_USER':
      return connect(action.account, action.token)
    case 'LOAD_USER':
      return load(action.account)
    case 'DISCONNECT_USER':
      return disconnect()
    case 'UPDATE_USER':
      return update(state, action.fields)
    default:
      return state
  }
}

export default user
