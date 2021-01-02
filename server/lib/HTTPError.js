export default class HTTPError extends Error {
  constructor(code, message) {
    super(message)
    this.code = code
  }
}
