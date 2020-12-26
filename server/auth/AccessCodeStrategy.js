import { Strategy } from 'passport'

export default class AccessCodeStrategy extends Strategy {
  constructor(verify) {
    super(verify)
    this.name = 'access_code'
    this.verify = verify
  }

  authenticate(req) {
    const accessCode = req.params.accessCode || req.cookies.accessCode
    if (!accessCode) {
      this.fail('no access code provided')
    } else {
      this.verify(accessCode, (err, info) => err ? this.fail(err) : this.success(info))
    }
  }
}
