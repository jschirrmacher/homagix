import { Request } from 'express'
import { Strategy } from 'passport'
import { DoneFunction } from './auth'

type VerifyFunction = (email: string, username: string, password: string, done: DoneFunction) => void 

export default class LoginStrategy extends Strategy {
  verify: VerifyFunction

  constructor(verify: VerifyFunction) {
    super()
    this.name = 'login'
    this.verify = verify
  }

  authenticate(req: Request): void {
    const body = req.body
    if (!(body.email || body.username) && !body.password) {
      this.fail('no credentials provided')
    } else {
      this.verify(body.email, body.username, body.password, (err, info) =>
        err ? this.fail(err) : this.success(info)
      )
    }
  }
}
