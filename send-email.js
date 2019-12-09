function validEmail(email) {
    const re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}

function buttonsState(active, form) {
    const buttons = form.querySelectorAll("button");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].disabled = !active;
    }
}

function getFormData(form) {
    const elements = form.elements;
    const fields = Object.keys(elements)
        .map(function (k) {
            if (elements[k].name !== undefined) {
                return elements[k].name;
            } else if (elements[k].length > 0) {
                return elements[k].item(0).name;
            }
        })
        .filter(function (item, pos, self) {
            return self.indexOf(item) == pos && item;
        });

    const formData = {};
    fields.forEach(function (name) {
        const element = elements[name];
        formData[name] = element.value;

        if (element.length) {
            const data = [];
            for (const i = 0; i < element.length; i++) {
                const item = element.item(i);
                if (item.checked || item.selected) {
                    data.push(item.value);
                }
            }
            formData[name] = data.join(", ");
        }
    });

    console.log('getFormData fields', fields);
    console.log('getFormData formData', formData);

    return formData;
}

function handleFormSubmit() {
    const form = document.querySelector("form");
    const data = getFormData(form);

    if (!validEmail(data.email)) {
        document.querySelector("#email_invalid").style.display = "block";
        return false;
    }

    document.querySelector("#email_invalid").style.display = "none";
    buttonsState(false, form);

    console.log('handleFormSubmit', data);
    return; // disable the actual sending part

    fetch(form.action, {
            method: "post",
            body: JSON.stringify(data)
        })
        .then(() => {
            form.style.display = "none";
            if (
                !document.querySelector("#captcha_invalid").style.display === "block"
            ) {
                document.querySelector("#thankyou_message").style.display = "block";
            }
        })
        .catch(() => {
            document.querySelector("#captcha_invalid").style.display = "block";
            buttonsState(true, form);
        });
}
