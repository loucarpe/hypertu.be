export const USERNAME_REGEX: RegExp = /^[a-zA-Z0-9_]{4,16}$/
export const PWD_REGEX: RegExp = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&_\-+^()`~]{8,512}$/
export const NAME_REGEX: RegExp = /^[a-zA-ZÀ-ž \-]{4,64}$/
export const IMDB_ID_REGEX: RegExp = /^tt[0-9]+$/
export const OBJECT_ID_REGEX: RegExp = /^[0-9a-fA-F]{24}$/

export const MIME_TYPE: { [key: string]: string } = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
}

export const MOVIE_FILE_TYPES: string[] = ['.mp4', '.ogg', '.webm', '.mkv', '.avi']

export const AVAILABLE_LANGUAGES: { iso: string; osid: string; name: string }[] = [
  {
    iso: 'en-US',
    osid: 'eng',
    name: 'English'
  },
  {
    iso: 'fr-FR',
    osid: 'fre',
    name: 'Français'
  }
]
