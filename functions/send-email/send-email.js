const sgMail = require('@sendgrid/mail')
const Recaptcha = require('google-recaptcha')
const {
    validateEmail,
    validateLength
} = require('./validations')


exports.handler = (event, context, callback) => {
    if (!process.env.SENDGRID_KEY) {
        return callback(null, {
            statusCode: 500,
            body: 'process.env.SENDGRID_KEY must be defined'
        })
    }
    if (!process.env.RECAPTCHA_KEY) {
        return callback(null, {
            statusCode: 500,
            body: 'process.env.RECAPTCHA_KEY must be defined'
        })
    }

    // User data
    const body = JSON.parse(event.body)
    try {
        validateLength('body.g-recaptcha-response', body["g-recaptcha-response"], 256, 1024)
    } catch (e) {
        return callback(null, {
            statusCode: 403,
            body: e.message
        })
    }
    try {
        validateLength('body.name', body.name, 3, 50)
    } catch (e) {
        return callback(null, {
            statusCode: 403,
            body: e.message
        })
    }
    try {
        validateEmail('body.email', body.email)
    } catch (e) {
        return callback(null, {
            statusCode: 403,
            body: e.message
        })
    }
    try {
        validateLength('body.message', body.message, 3, 1000)
    } catch (e) {
        return callback(null, {
            statusCode: 403,
            body: e.message
        })
    }

    // Email settings
    try {
        validateLength('body.contact_email', body.contact_email, 16, 256)
    } catch (e) {
        return callback(null, {
            statusCode: 403,
            body: e.message
        })
    }
    try {
        validateContactEmail(body.contact_email)
    } catch (e) {
        return callback(null, {
            statusCode: 403,
            body: e.message
        })
    }
    try {
        validateLength('body.template_id', body.template_id, 30, 35)
    } catch (e) {
        return callback(null, {
            statusCode: 403,
            body: e.message
        })
    }

    // Compile additional data
    var additional = [];
    for (var key in body) {
        if (body.hasOwnProperty(key) && key !== "name" && key !== "email" && key !== "message" && key !== "g-recaptcha-response") {
            additional.push(key + ' = ' + body[key]);
        }
    };

    // Create message
    const msg = {
        to: body.contact_email,
        from: 'no-reply@lucacastelnuovo.nl',
        templateId: body.template_id,
        dynamic_template_data: {
            name: body.name,
            email: body.email,
            details: body.message,
            additional: additional.join('\n')
        },
    };

    // Validate Captcha
    const recaptcha = new Recaptcha({secret: process.env.RECAPTCHA_KEY})
    recaptcha.verify({response: body["g-recaptcha-response"]}, (error) => {
      if (error) {
        callback(null, {
          statusCode: 500,
          body: error
        })
      }
    })

    // Send email
    sgMail.setApiKey(process.env.SENDGRID_KEY);
    sgMail
        .send(msg)
        .then(() => callback(null, {
            statusCode: 200,
            body: ''
        }))
        .catch(error => callback(null, {
            statusCode: 500,
            body: error.message
        }));
}
