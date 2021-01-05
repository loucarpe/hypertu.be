import { Document, Schema, model } from 'mongoose'

export interface IAccount extends Document {
  email: string
  username: string
  firstname: string
  lastname: string
  avatar: string
  authProvider: string
  verified: boolean
  watchlist: number[]
  language: string

  password?: string
  authID?: string
}

export const AccountSchema = new Schema(
  {
    email: { type: String, required: true },
    username: { type: String, required: true },
    firstname: { type: String, required: true },
    lastname: { type: String, default: '' },
    avatar: { type: String, required: true },
    authProvider: { type: String, default: 'local' },
    verified: { type: Boolean, default: false },
    watchlist: { type: [Number], required: true },
    language: { type: String, default: 'en-US' },
    
    password: String,
    authID: String
  },
  { versionKey: false }
)

AccountSchema.index(
  { email: 1, authProvider: 1 },
  {
    unique: true,
    partialFilterExpression: {
      email: { $type: 'string' },
      authProvider: { $type: 'string' }
    }
  }
)
AccountSchema.index(
  { username: 1, authProvider: 1 },
  {
    unique: true,
    partialFilterExpression: {
      username: { $type: 'string' },
      authProvider: { $type: 'string' }
    }
  }
)
AccountSchema.index(
  { authID: 1, authProvider: 1 },
  {
    unique: true,
    partialFilterExpression: {
      authID: { $type: 'string' },
      authProvider: { $type: 'string' }
    }
  }
)

export const Accounts = model<IAccount>('Account', AccountSchema)
