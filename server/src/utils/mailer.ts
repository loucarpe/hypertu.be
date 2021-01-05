import fs from 'fs'

import mailer, { SendMailOptions } from 'nodemailer'
import Transporter from 'nodemailer/lib/mailer'

import logger from './logger'

export class Mail {
  private static transporter: Transporter

  private mail: string
  private to: string
  private subject: string

  constructor(mail: string, to: string, subject: string) {
    this.mail = mail
    this.to = to
    this.subject = subject
  }

  public send(vars: { [key: string]: string }) {
    vars['base_url'] = process.env.BASE_URL as string

    fs.readFile(`./templates/${this.mail}.html`, (err, data) => {
      if (err != null) return

      let content = data.toString()

      for (let key in vars) {
        const regex = new RegExp(`{{${key}}}`, 'gi')

        if (regex.test(content)) {
          content = content.replace(regex, vars[key])
        }
      }

      const options: SendMailOptions = {
        from: 'Hypertube <noreply@hypertu.be>',
        to: this.to,
        subject: this.subject,
        html: content
      }

      Mail.transporter.sendMail(options, err => (err != null ? logger.error(`[Mailer] ${err}`) : null))
    })
  }

  public static init() {
    Mail.transporter = mailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'noreply@hypertu.be',
        pass: process.env.MAIL_PWD
      }
    })
  }
}
