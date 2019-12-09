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

    fetch(process.env.CONFIG_URL)
        .then((resp) => resp.json())
        .then(data => {
            const allowedRecipients = data.send_email.allowed_recipients;
            if (!allowedRecipients.includes(email)) {
                throw TypeError(`${email} is not a valid recipient`)
            }
        })
        .catch(function (error) {
            console.error(JSON.stringify(error));
        });
}
