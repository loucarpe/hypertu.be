"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = __importDefault(require("./logger"));
class Mail {
    constructor(mail, to, subject) {
        this.mail = mail;
        this.to = to;
        this.subject = subject;
    }
    send(vars) {
        vars['base_url'] = process.env.BASE_URL;
        fs_1.default.readFile(`./templates/${this.mail}.html`, (err, data) => {
            if (err != null)
                return;
            let content = data.toString();
            for (let key in vars) {
                const regex = new RegExp(`{{${key}}}`, 'gi');
                if (regex.test(content)) {
                    content = content.replace(regex, vars[key]);
                }
            }
            const options = {
                from: 'Hypertube <noreply@hypertu.be>',
                to: this.to,
                subject: this.subject,
                html: content
            };
            Mail.transporter.sendMail(options, err => (err != null ? logger_1.default.error(`[Mailer] ${err}`) : null));
        });
    }
    static init() {
        Mail.transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                user: 'noreply@hypertu.be',
                pass: process.env.MAIL_PWD
            }
        });
    }
}
exports.Mail = Mail;
