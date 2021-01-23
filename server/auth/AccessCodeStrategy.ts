import { Strategy } from 'passport'
import { Request } from 'express'
import { DoneFunction } from './auth'

type VerifyFunction = (accessCode: string, id: string, done: DoneFunction) => void 

export default class AccessCodeStrategy extends Strategy {
  verify: VerifyFunction

  constructor(verify: VerifyFunction) {
    super()
    this.name = 'access_code'
    this.verify = verify
  }

  authenticate(req: Request): void {
    const accessCode = req.params.accessCode
    const id = req.params.id
    if (!accessCode || !id) {
      this.fail('access code or id not provided')
    } else {
      this.verify(accessCode, id, (err, info) =>
        err ? this.fail(err) : this.success(info)
      )
    }
  }
}
