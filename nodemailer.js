const nodemailer = require('nodemailer')
const {
  EMAIL,
  ID,
  SECRET,
  REFRESH
} = process.env

const smtpTransport = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  auth: {
    user: EMAIL,
    type: 'oauth2',
    clientId: ID,
    clientSecret: SECRET,
    refreshToken: REFRESH
  }
})

/**
 * nodemailer sendMail params
 * @param {Object} mailOptions
 * @param {string} mailOptions.to
 * @param {string} mailOptions.subject
 * @param {string} mailOptions.html
 */
exports.sendEmail = function (mailOptions) {
  return new Promise((resolve, reject) => {
    smtpTransport.sendMail({
      from: EMAIL,
      ...mailOptions,
      dsn: {
        id: `${new Date().toISOString()}:${mailOptions.to}:${mailOptions.subject}`,
        return: 'headers',
        notify: ['success', 'failure', 'delay'],
        recipient: EMAIL
      }
    }, (error, response) => {
      if (error || response.rejected[0]) return reject(error || response)
      return resolve(response)
    })
  })
}

/**
 * nodemailer sendMail params
 * @param {Object} textOptions
 * @param {string} textOptions.to
 * @param {string} textOptions.text
 * @param {string} textOptions.subject
 */
exports.sendText = function (textOptions) {
  return new Promise((resolve, reject) => {
    smtpTransport.sendMail({
      from: EMAIL,
      ...textOptions,
      subject: textOptions.subject
        ? textOptions.subject.substring(0, 140 - 6 - EMAIL.length - textOptions.text.length)
        : 'BEEBEE',
      dsn: {
        id: `${new Date().toISOString()}:${textOptions.to}`,
        return: 'headers',
        notify: ['success', 'failure', 'delay'],
        recipient: EMAIL
      }
    }, (error, response) => {
      if (error || response.rejected[0]) return reject(error || response)
      return resolve(response)
    })
  })
}
