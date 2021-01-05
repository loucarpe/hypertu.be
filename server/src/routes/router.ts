import { Router } from 'express'

import account from './account'
import account_update from './account/update'

import account_activate from './account/activate'
import account_activate_send from './account/activate/send'

import account_delete from './account/delete'

import account_watchlist_details from './account/watchlist/details'
import account_watchlist_put from './account/watchlist/put'
import account_watchlist_delete from './account/watchlist/delete'

import auth_42 from './auth/42'
import auth_google from './auth/google'
import auth_twitter from './auth/twitter'
import auth_signup from './auth/signup'
import auth_signin from './auth/signin'
import auth_forgotpwd from './auth/forgotpwd'
import auth_resetpwd from './auth/resetpwd'

import movies from './movies'
import movies_search from './movies/search'
import movies_details from './movies/details'
import movies_credits from './movies/credits'
import movies_torrents from './movies/torrents'

import movies_comments_get from './movies/comments/get'
import movies_comments_put from './movies/comments/put'
import movies_comments_delete from './movies/comments/delete'

import movies_subtitles from './movies/subtitles'

import movies_genres from './movies/genres'

import profile from './profile'

import storage_upload from './storage/upload'

import watch from './watch'

export default (): Router => {
  const router = Router()

  /***********/
  /* Account */
  /***********/

  router.get('/account', ...account)
  router.post('/account/update', ...account_update)

  // Activate

  router.post('/account/activate', ...account_activate)
  router.post('/account/activate/send', ...account_activate_send)

  // Delete

  router.delete('/account/delete', ...account_delete)

  // Watchlist

  router.get('/account/watchlist/details', ...account_watchlist_details)
  router.put('/account/watchlist/:id', ...account_watchlist_put)
  router.delete('/account/watchlist/:id', ...account_watchlist_delete)

  /********/
  /* Auth */
  /********/

  router.get('/auth/42', ...auth_42)
  router.get('/auth/google', ...auth_google)
  router.get('/auth/twitter', ...auth_twitter)
  router.post('/auth/signup', ...auth_signup)
  router.post('/auth/signin', ...auth_signin)
  router.post('/auth/forgotpwd', ...auth_forgotpwd)
  router.post('/auth/resetpwd', ...auth_resetpwd)

  /**********/
  /* Movies */
  /**********/

  router.get('/movies', ...movies)
  router.get('/movies/search', ...movies_search)
  router.get('/movies/details/:id', ...movies_details)
  router.get('/movies/credits/:id', ...movies_credits)
  router.get('/movies/torrents/:imdb_id', ...movies_torrents)
  router.get('/movies/subtitles/:imdb_id', ...movies_subtitles)
  router.get('/movies/genres', ...movies_genres)

  // Comments

  router.get('/movies/:movieId/comments', ...movies_comments_get)
  router.put('/movies/comments', ...movies_comments_put)
  router.delete('/movies/:movieId/comments/:commentId', ...movies_comments_delete)

  /***********/
  /* Profile */
  /***********/

  router.get('/profile/:username', ...profile)

  /***********/
  /* Storage */
  /***********/

  router.put('/storage/upload', ...storage_upload)

  /*********/
  /* Watch */
  /*********/

  router.get('/watch/:id/:magnet', ...watch)

  return router
}
