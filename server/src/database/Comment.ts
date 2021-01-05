import { Document, Schema, model } from 'mongoose'

export interface IComment extends Document {
  userId: string
  movieId: number
  message: string
  date: Date
}

export const CommentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    movieId: { type: Number, required: true },
    message: { type: String, required: true },
    date: { type: Date, default: Date.now }
  },
  { versionKey: false }
)

export const Comments = model<IComment>('Comment', CommentSchema)
