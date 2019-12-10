const fetch = require("node-fetch")
const Recaptcha = require('google-recaptcha')

exports.validateEmail = (ctx, str) => {
    if (typeof str !== 'string' && !(str instanceof String)) {
        throw TypeError(`${ctx} must be a string`)
    }

    exports.validateLength(ctx, str, 5, 30)

    if (!/^[\w.-]+@[\w.-]+\.\w+$/.test(str)) {
        throw TypeError(`${ctx} is not an email address`)
    }
}

exports.validateLength = (ctx, str, ...args) => {
    let min, max

    if (args.length === 1) {
        min = 0
        max = args[0]
    } else {
        min = args[0]
        max = args[1]
    }

    if (typeof str !== 'string' && !(str instanceof String)) {
        throw TypeError(`${ctx} must be a string`)
    }

    if (str.length < min) {
        throw TypeError(`${ctx} must be at least ${min} chars long`)
    }

    if (str.length > max) {
        throw TypeError(`${ctx} must contain ${max} chars at most`)
    }
}

exports.validateContactEmail = (email) => {
    if (!process.env.CONFIG_URL) {
        throw TypeError("process.env.CONFIG_URL must be defined")
    }
    
    const allowedRecipients = [];

    fetch(process.env.CONFIG_URL)
        .then((resp) => resp.json())
        .then(data => {
            allowedRecipients = data.send_email.allowed_recipients; 
        }).catch(function (error) {
            console.log(JSON.stringify(error))
        });
    
    if (allowedRecipients && !allowedRecipients.includes(email)) {
        console.error(`${email} is not a valid recipient`)
        throw TypeError(`${email} is not a valid recipient`)
    }
}

exports.validateCaptcha = (response) => {
    if (!process.env.RECAPTCHA_KEY) {
        throw TypeError("process.env.RECAPTCHA_KEY must be defined")
    }
    
    const recaptcha = new Recaptcha({secret: process.env.RECAPTCHA_KEY})
    recaptcha.verify({response: response}, (error) => {
      if (error) {
        throw TypeError("invalid captcha response")
      }
    })
}
