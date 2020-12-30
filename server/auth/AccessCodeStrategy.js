import { Strategy } from 'passport'

export default class AccessCodeStrategy extends Strategy {
  constructor(verify) {
    super(verify)
    this.name = 'access_code'
    this.verify = verify
  }

  authenticate(req) {
    const accessCode = req.params.accessCode
    const id = req.params.id
    if (!accessCode || !id) {
      this.fail('access code or id not provided')
    } else {
      this.verify(accessCode, id, (err, info) => err ? this.fail(err) : this.success(info))
    }
  }
}
