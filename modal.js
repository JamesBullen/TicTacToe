// Requires JQuery dependency

function showModal(title, content, inputs=null, buttons=null, forced=false) {
    const modal = document.createElement(`div`);

    modal.classList.add(`modal`);
    modal.innerHTML =
        `<div class="modalInner">
            <div class="modalTop">
                <div class="modalTitle">${title}</div>
            </div>
            <div class="modalContent">${content}</div>
            <div class="modalBottom"></div>
        </div>`;

    // Checks if we want to have the close button available, or force to pick an option
    if (!forced) {
        const closeButton = document.createElement(`button`);

        closeButton.classList.add(`modalClose`);
        closeButton.innerHTML = `<span class="material-symbols-outlined">close</span>`;

        modal.querySelector(`.modalTop`).appendChild(closeButton);
        modal.querySelector(`.modalClose`).addEventListener("click", () => {
            document.body.removeChild(modal)
        });
    };

    if (inputs) {
        addInputs(inputs, modal);
    };
    if (buttons) {
        addButtons(buttons, modal);
    };

    document.body.appendChild(modal);
};

// Adds button options to modal
function addButtons(buttons, modal) {
    for (const button of buttons) {
        const element = document.createElement(`button`);

        element.classList.add(`modalButton`);
        element.textContent = button.label;
        element.addEventListener("click", () => {
            if (button.triggerClose) {
                document.body.removeChild(modal);
            };
            button.onclick(modal);
        });

        modal.querySelector(`.modalBottom`).appendChild(element);
    };
};

function addInputs(inputs, modal) {
    for (const input of inputs) {
        const element = document.createElement('input');

        element.classList.add('modalInput');
        element.textContent = input.label;
        element.name = input.label;
        element.id = input.label;
        element.type = 'text';
        element.placeholder = input.text;

        modal.querySelector('.modalContent').appendChild(element)
    };
};

function showMessage(content) {
    const message = document.createElement(`div`);

    message.classList.add(`message`);
    message.innerHTML = `<div class="messageInner">${content}</div>`;

    document.body.appendChild(message)

    setTimeout(() => {
        $(`.message`).fadeOut("slow","swing")
    }, 1000);
    setTimeout(() => {
        document.body.removeChild(message)
    }, 2000);
};

/* Example/Template
showMessage("test message");

showModal("Title Here", "Lorum ipsum",
    [{
        label: "test",
        text: 'test'
    }],
    [{
        label: "close",
        onclick: modal => {
            console.log(`Pressed`);
        },
        triggerClose: true
    }]
); */