import { IAccount } from './database/Account';
import Token from './utils/token'

declare global {
    namespace Express {
        interface Request {
            token: Token,
            account: IAccount
        }
    }
}
