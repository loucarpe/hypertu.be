import jwt, { TokenExpiredError, VerifyOptions, SignOptions } from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { Accounts } from '../database/Account'

export default class Token {
  public decoded: any
  public encoded: string

  constructor(decoded: any, encoded: string) {
    this.decoded = decoded
    this.encoded = encoded
  }

  public static extractAccount(fields?: string[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        let query = Accounts.findById(req.token.decoded.id)
        if (fields != undefined) {
          query = query.select(fields.join(' '))
        }
        
        const account = await query.exec()
  
        if (!account) {
          return res.status(404).json({
            error: {
              code: 'ACCOUNT_NOT_FOUND',
              msg: 'account not found, token is probably expired'
            }
          })
        }

        req.account = account
  
        next()
      } catch (ex) {
        return res.status(500).end()
      }
    }
  }

  public static verify(encoded: string, type: TokenType, options?: VerifyOptions): Token {
    try {
      let decoded = jwt.verify(encoded, process.env.JWT_SECRET as string, options) as any

      if (decoded.type !== type) {
        throw new InvalidTokenError()
      }

      return new Token(decoded, encoded)
    } catch (err) {
      if (err instanceof TokenExpiredError) throw new ExpiredTokenError()
      else throw new InvalidTokenError()
    }
  }

  public static sign(decoded: any, type: TokenType, options?: SignOptions): Token {
    try {
      let encoded = jwt.sign(
        {
          ...decoded,
          type
        },
        process.env.JWT_SECRET as string,
        options
      )

      return new Token(decoded, encoded)
    } catch (err) {
      throw new InvalidTokenError()
    }
  }

  private static required(location: string, field: string, type: TokenType) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        req.token = Token.verify((req as any)[location][field], type)

        next()
      } catch (ex) {
        return res.status(401).json({
          error:
            ex instanceof ExpiredTokenError
              ? {
                  code: 'TOKEN_EXPIRED',
                  msg: 'your token as expired'
                }
              : {
                  code: 'TOKEN_INVALID',
                  msg: 'your token is invalid'
                }
        })
      }
    }
  }

  public static body(field: string, type: TokenType) {
    return this.required('body', field, type)
  }

  public static query(field: string, type: TokenType) {
    return this.required('query', field, type)
  }

  public static param(field: string, type: TokenType) {
    return this.required('params', field, type)
  }

  public static header(type: TokenType) {
    return (req: Request, res: Response, next: NextFunction) => {
      const header = req.header('Authorization')

      if (header == undefined) {
        return res.status(401).json({
          error: {
            code: 'TOKEN_MISSING',
            msg: "a 'Bearer' token is required in 'Authorization' header"
          }
        })
      }

      try {
        const struct = header.split(' ')

        const htype = struct[0]
        const encoded = struct[1]

        if (htype == null || encoded == null || htype.toLowerCase() !== 'bearer') {
          return res.status(401).json({
            error: {
              code: 'TOKEN_INVALID',
              msg: "your token in 'Authorization' header must be 'Bearer'"
            }
          })
        }

        req.token = Token.verify(encoded, type)

        next()
      } catch (ex) {
        return res.status(401).json({
          error:
            ex instanceof ExpiredTokenError
              ? {
                  code: 'TOKEN_EXPIRED',
                  msg: "your token in 'Authorization' header as expired"
                }
              : {
                  code: 'TOKEN_INVALID',
                  msg: "your token in 'Authorization' header is invalid"
                }
        })
      }
    }
  }
}
export enum TokenType {
  SESSION,
  ACTIVATE_ACCOUNT,
  RESET_PASSWORD
}
export class InvalidTokenError extends Error {
  constructor() {
    super('invalid token')
  }
}
export class ExpiredTokenError extends Error {
  constructor() {
    super('expired token')
  }
}
