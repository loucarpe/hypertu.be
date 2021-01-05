const OS = require('opensubtitles-api')

export let OpenSubtitles: any

export async function init() {
  try {
    OpenSubtitles = new OS({
      useragent: process.env.OPENSUBTITLES_USERAGENT,
      username: process.env.OPENSUBTITLES_USERNAME,
      password: process.env.OPENSUBTITLES_PASSWORD,
      ssl: true
    })
  
    await OpenSubtitles.login()
  } catch (ex) {}
}
