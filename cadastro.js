const formStorageKey = "inklua_formulario_adaptacao";
const registerForm = document.querySelector(".entry-register-form");
const entryLoginForm = document.querySelector(".entry-login-form");
const entryLoginCpf = entryLoginForm?.querySelector('input[name="cpf"]');
const entryLoginPassword = entryLoginForm?.querySelector('input[name="password"]');
const entryLoginError = document.getElementById("entryLoginError");
const loginErrorMessages = {
    cpf: "CPF n\u00e3o cadastrado.",
    senha: "Senha incorreta.",
    required: "Preencha o CPF e a senha para continuar."
};

const canUsePhpBackend = () => {
    const staticServerPorts = new Set(["5500", "5501"]);
    return window.location.protocol !== "file:" && !staticServerPorts.has(window.location.port);
};

const collectRegisterAnswers = (form) => {
    const formData = new FormData(form);
    const answers = {};

    formData.forEach((value, key) => {
        const normalizedKey = key.replace("[]", "");

        if (key.endsWith("[]")) {
            answers[normalizedKey] = answers[normalizedKey] || [];
            answers[normalizedKey].push(value);
            return;
        }

        answers[normalizedKey] = value;
    });

    return answers;
};

const setupAgeInput = (input) => {
    if (input.dataset.ageStepperReady === "true") {
        return;
    }

    const min = Number(input.min) || 1;
    const max = Number(input.max) || 99;

    input.dataset.ageStepperReady = "true";
    input.type = "text";
    input.step = "1";
    input.inputMode = "numeric";
    input.autocomplete = "off";

    const clampAge = (value) => {
        const number = Number.parseInt(String(value || "").replace(/\D/g, ""), 10);

        if (Number.isNaN(number)) {
            return "";
        }

        return String(Math.min(Math.max(number, min), max));
    };

    const setAge = (value) => {
        input.value = clampAge(value);
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
    };

    const stepAge = (direction) => {
        const currentAge = Number.parseInt(clampAge(input.value), 10);
        const baseAge = Number.isNaN(currentAge) ? min : currentAge;
        setAge(baseAge + direction);
        input.focus();
    };

    const wrapper = document.createElement("div");
    const decreaseButton = document.createElement("button");
    const increaseButton = document.createElement("button");

    wrapper.className = "age-stepper";
    decreaseButton.className = "age-stepper__button";
    increaseButton.className = "age-stepper__button";
    decreaseButton.type = "button";
    increaseButton.type = "button";
    decreaseButton.textContent = "-";
    increaseButton.textContent = "+";
    decreaseButton.setAttribute("aria-label", "Diminuir idade");
    increaseButton.setAttribute("aria-label", "Aumentar idade");

    input.classList.add("age-stepper__input");
    input.parentNode?.insertBefore(wrapper, input);
    wrapper.append(decreaseButton, input, increaseButton);

    decreaseButton.addEventListener("click", () => stepAge(-1));
    increaseButton.addEventListener("click", () => stepAge(1));

    input.addEventListener("input", () => {
        const normalizedAge = clampAge(input.value);

        if (input.value !== normalizedAge) {
            input.value = normalizedAge;
        }
    });

    input.addEventListener("blur", () => {
        input.value = clampAge(input.value);
    });

    input.addEventListener("keydown", (event) => {
        if (["e", "E", "+", "-", ".", ","].includes(event.key)) {
            event.preventDefault();
            return;
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();
            stepAge(1);
            return;
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();
            stepAge(-1);
        }
    });

    input.addEventListener("wheel", (event) => {
        if (document.activeElement === input) {
            event.preventDefault();
        }
    }, { passive: false });
};

const showEntryLoginError = (message, fields = []) => {
    if (!entryLoginError) {
        return;
    }

    entryLoginError.textContent = message;
    fields.forEach((field) => field?.classList.add("is-invalid"));
    fields[0]?.focus();
};

const clearEntryLoginError = () => {
    if (entryLoginError) {
        entryLoginError.textContent = "";
    }

    entryLoginCpf?.classList.remove("is-invalid");
    entryLoginPassword?.classList.remove("is-invalid");
};

const showBackendLoginError = () => {
    const params = new URLSearchParams(window.location.search);
    const errorCode = params.get("login_error");

    if (!errorCode || !loginErrorMessages[errorCode]) {
        return;
    }

    if (errorCode === "cpf") {
        showEntryLoginError(loginErrorMessages[errorCode], [entryLoginCpf]);
        return;
    }

    if (errorCode === "senha") {
        showEntryLoginError(loginErrorMessages[errorCode], [entryLoginPassword]);
        return;
    }

    showEntryLoginError(loginErrorMessages[errorCode], [entryLoginCpf, entryLoginPassword]);
};

registerForm?.addEventListener("submit", (event) => {
    localStorage.setItem(formStorageKey, JSON.stringify(collectRegisterAnswers(registerForm)));

    if (!canUsePhpBackend()) {
        event.preventDefault();
        window.location.href = "home.html#formulario";
    }
});

entryLoginForm?.addEventListener("submit", (event) => {
    clearEntryLoginError();
    localStorage.setItem(formStorageKey, localStorage.getItem(formStorageKey) || "{}");

    const emptyFields = [entryLoginCpf, entryLoginPassword].filter((field) => !field?.value.trim());

    if (emptyFields.length > 0) {
        event.preventDefault();
        showEntryLoginError(loginErrorMessages.required, emptyFields);
    }
});

document.querySelectorAll('input[name="aluno_idade"]').forEach(setupAgeInput);
showBackendLoginError();
