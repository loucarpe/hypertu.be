function time(): string {
  let iso = new Date().toISOString()

  let day = iso.replace(/-/g, '/').substring(0, iso.indexOf('T'))
  let time = iso.substring(iso.indexOf('T') + 1, iso.length - 5)

  return `${day} ${time}`
}

export default {
  info: (msg: any) => {
    console.info(`[${time()}] [INFO] ${msg}`)
  },

  warn: (msg: any) => {
    console.warn(`[${time()}] [WARNING] ${msg}`)
  },

  error: (msg: any) => {
    console.error(`[${time()}] [ERROR] ${msg}`)
  }
}
