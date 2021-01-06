import Mustache from 'mustache'

const baseUrl =
  process.env.BASEURL || 'http://localhost:' + (process.env.PORT || 8200)
const from = process.env.MAIL_FROM || 'me@localhost'

export default ({ nodemailer }) => {
  async function send(to, templateName, variables) {
    const template = (await import('./mailTemplates/' + templateName + '.js'))
      .default
    return new Promise((resolve, reject) => {
      const subject = Mustache.render(template.subject, {
        baseUrl,
        ...variables,
      })
      const html = Mustache.render(template.html, { baseUrl, ...variables })
      transporter.sendMail({ from, to, subject, html }, (err, info) =>
        err ? reject(err) : resolve(info)
      )
    })
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })
  return { send }
}
