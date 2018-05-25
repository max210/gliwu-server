import nodemailer from 'nodemailer'
import smtpTransport from 'nodemailer-smtp-transport'

import config from '../config'

const sendEmail = (name, email, token) => {
  return new Promise((resolve, reject) => {
    const transport = nodemailer.createTransport(smtpTransport({
      host: 'smtpdm.aliyun.com',
      port: 25,
      secureConnection: true,
      auth: {
        user: 'postmaster@gliwu.cn',
        pass: 'SMTPmima123'
      }
    }))

    const mailOptions = {
      from: 'G礼物 <postmaster@gliwu.cn>',
      to: email,
      subject: '这是一封激活邮件',
      html:
        `<p>您好：${name}</p>` +
        `<p>我们收到您在G礼物网站的注册信息，请点击下面的链接来激活帐户：</p>` +
        `<a href  = \"${config.emailHost}/active?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&token=${token}\">激活链接</a>` +
        `<p>若您没有在G礼物网站填写过注册信息，说明有人滥用了您的电子邮箱，请删除此邮件，我们对给您造成的打扰感到抱歉。</p>` +
        `<p>G礼物 谨上。</p>`
    }

    transport.sendMail(mailOptions, function(err, info) {
      if (err) {
        reject(err)
      } else {
        console.log('Message sent: ' + info.response)
        resolve()
      }
    })
  })
}

export default sendEmail
