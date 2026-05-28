const formStorageKey = "inklua_formulario_adaptacao";
const registerForm = document.querySelector(".entry-register-form");
const entryLoginForm = document.querySelector(".entry-login-form");
const entryRecoveryForm = document.querySelector(".entry-recovery-form");
const entryLoginCpf = entryLoginForm?.querySelector('input[name="cpf"]');
const entryLoginPassword = entryLoginForm?.querySelector('input[name="password"]');
const entryLoginError = document.getElementById("entryLoginError");
const entryRecoveryEmail = entryRecoveryForm?.querySelector('input[name="email"]');
const entryRecoveryMessage = document.getElementById("entryRecoveryMessage");
const entryRecoveryCodePanel = document.getElementById("entryRecoveryCodePanel");
const entryRecoveryCodePreview = document.getElementById("entryRecoveryCodePreview");
const entryRecoveryCodeInput = document.getElementById("entryRecoveryCodeInput");
const entryRecoveryCodeMessage = document.getElementById("entryRecoveryCodeMessage");
const entryVerifyRecoveryCode = document.getElementById("entryVerifyRecoveryCode");
const entryNewPasswordForm = document.getElementById("entryNewPasswordForm");
const entryNewPassword = document.getElementById("entryNewPassword");
const entryConfirmNewPassword = document.getElementById("entryConfirmNewPassword");
const entryNewPasswordMessage = document.getElementById("entryNewPasswordMessage");
const entrySaveNewPasswordButton = document.getElementById("entrySaveNewPasswordButton");
const loginErrorMessages = {
    cpf: "CPF n\u00e3o cadastrado.",
    senha: "Senha incorreta.",
    required: "Preencha o CPF e a senha para continuar."
};
const recoveryMessages = {
    sent: "C\u00f3digo enviado. Digite o c\u00f3digo abaixo para confirmar a recupera\u00e7\u00e3o.",
    email: "E-mail n\u00e3o cadastrado.",
    invalid: "Digite um e-mail v\u00e1lido para recuperar a senha.",
    codeInvalid: "C\u00f3digo incorreto. Confira os n\u00fameros e tente novamente.",
    codeValid: "C\u00f3digo confirmado. Agora crie uma nova senha.",
    passwordInvalid: "Digite uma nova senha com pelo menos 4 caracteres.",
    passwordMismatch: "As senhas n\u00e3o conferem.",
    passwordSaved: "Senha alterada com sucesso. Volte ao login para entrar."
};
const recoveryCodeStorageKey = "inklua_recovery_code";

const canUsePhpBackend = () => {
    const port = Number(window.location.port);
    const isLiveServer = port >= 5500 && port <= 5599;
    return window.location.protocol !== "file:" && !isLiveServer;
};

const normalizeCpfValue = (value) => String(value || "").replace(/\D/g, "");
const normalizeEmailValue = (value) => String(value || "").trim().toLowerCase();
const normalizeCodeValue = (value) => String(value || "").replace(/\D/g, "").slice(0, 6);
const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());

const generateRecoveryCode = () => {
    if (window.crypto?.getRandomValues) {
        const values = new Uint32Array(1);
        window.crypto.getRandomValues(values);
        return String(100000 + (values[0] % 900000));
    }

    return String(Math.floor(100000 + Math.random() * 900000));
};

const getStoredRegisterAnswers = () => {
    try {
        return JSON.parse(localStorage.getItem(formStorageKey) || "{}");
    } catch {
        return {};
    }
};

const validateStoredLogin = () => {
    const storedAnswers = getStoredRegisterAnswers();
    const storedCpf = normalizeCpfValue(storedAnswers.cpf);
    const typedCpf = normalizeCpfValue(entryLoginCpf?.value);
    const storedPassword = String(storedAnswers.senha || storedAnswers.password || "");
    const typedPassword = String(entryLoginPassword?.value || "");

    if (!storedCpf || storedCpf !== typedCpf) {
        showEntryLoginError(loginErrorMessages.cpf, [entryLoginCpf]);
        return false;
    }

    if (!storedPassword || storedPassword !== typedPassword) {
        showEntryLoginError(loginErrorMessages.senha, [entryLoginPassword]);
        return false;
    }

    window.location.href = "home.html";
    return true;
};

const showEntryRecoveryMessage = (message, type = "error") => {
    if (!entryRecoveryMessage) {
        return;
    }

    entryRecoveryMessage.textContent = message;
    entryRecoveryMessage.classList.toggle("is-success", type === "success");
    entryRecoveryMessage.classList.toggle("is-error", type !== "success");
};

const clearEntryRecoveryMessage = () => {
    if (!entryRecoveryMessage) {
        return;
    }

    entryRecoveryMessage.textContent = "";
    entryRecoveryMessage.classList.remove("is-success", "is-error");
    entryRecoveryEmail?.classList.remove("is-invalid");
};

const showEntryNewPasswordMessage = (message, type = "error") => {
    if (!entryNewPasswordMessage) {
        return;
    }

    entryNewPasswordMessage.textContent = message;
    entryNewPasswordMessage.classList.toggle("is-success", type === "success");
    entryNewPasswordMessage.classList.toggle("is-error", type !== "success");
};

const showEntryNewPasswordForm = () => {
    if (entryNewPasswordForm) {
        entryNewPasswordForm.hidden = false;
    }

    entryNewPassword?.focus();
};

const saveStoredPassword = () => {
    const newPassword = String(entryNewPassword?.value || "");
    const confirmPassword = String(entryConfirmNewPassword?.value || "");

    entryNewPassword?.classList.remove("is-invalid");
    entryConfirmNewPassword?.classList.remove("is-invalid");

    if (newPassword.trim().length < 4) {
        entryNewPassword?.classList.add("is-invalid");
        showEntryNewPasswordMessage(recoveryMessages.passwordInvalid);
        entryNewPassword?.focus();
        return false;
    }

    if (newPassword !== confirmPassword) {
        entryConfirmNewPassword?.classList.add("is-invalid");
        showEntryNewPasswordMessage(recoveryMessages.passwordMismatch);
        entryConfirmNewPassword?.focus();
        return false;
    }

    const storedAnswers = getStoredRegisterAnswers();
    storedAnswers.senha = newPassword;
    storedAnswers.password = newPassword;
    localStorage.setItem(formStorageKey, JSON.stringify(storedAnswers));
    localStorage.removeItem(recoveryCodeStorageKey);
    showEntryNewPasswordMessage(recoveryMessages.passwordSaved, "success");
    return true;
};

const showEntryRecoveryCode = (code) => {
    localStorage.setItem(recoveryCodeStorageKey, code);

    if (entryRecoveryCodePreview) {
        entryRecoveryCodePreview.textContent = code;
    }

    if (entryRecoveryCodePanel) {
        entryRecoveryCodePanel.hidden = false;
    }

    if (entryRecoveryCodeInput) {
        entryRecoveryCodeInput.value = "";
        entryRecoveryCodeInput.focus();
    }

    if (entryRecoveryCodeMessage) {
        entryRecoveryCodeMessage.textContent = "";
        entryRecoveryCodeMessage.classList.remove("is-success", "is-error");
    }
};

const verifyEntryRecoveryCode = () => {
    const expectedCode = localStorage.getItem(recoveryCodeStorageKey) || "";
    const typedCode = normalizeCodeValue(entryRecoveryCodeInput?.value);

    if (!expectedCode || typedCode !== expectedCode) {
        entryRecoveryCodeInput?.classList.add("is-invalid");

        if (entryRecoveryCodeMessage) {
            entryRecoveryCodeMessage.textContent = recoveryMessages.codeInvalid;
            entryRecoveryCodeMessage.classList.add("is-error");
            entryRecoveryCodeMessage.classList.remove("is-success");
        }

        entryRecoveryCodeInput?.focus();
        return;
    }

    entryRecoveryCodeInput?.classList.remove("is-invalid");

    if (entryRecoveryCodeMessage) {
        entryRecoveryCodeMessage.textContent = recoveryMessages.codeValid;
        entryRecoveryCodeMessage.classList.add("is-success");
        entryRecoveryCodeMessage.classList.remove("is-error");
    }

    showEntryNewPasswordForm();
};

const validateStoredRecovery = () => {
    const typedEmail = normalizeEmailValue(entryRecoveryEmail?.value);

    if (!isValidEmail(typedEmail)) {
        entryRecoveryEmail?.classList.add("is-invalid");
        showEntryRecoveryMessage(recoveryMessages.invalid);
        entryRecoveryEmail?.focus();
        return false;
    }

    showEntryRecoveryMessage(recoveryMessages.sent, "success");
    showEntryRecoveryCode(generateRecoveryCode());
    return true;
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

const showBackendRecoveryStatus = () => {
    const params = new URLSearchParams(window.location.search);
    const statusCode = params.get("recovery_status");

    if (!statusCode || !recoveryMessages[statusCode]) {
        return;
    }

    showEntryRecoveryMessage(recoveryMessages[statusCode], statusCode === "sent" ? "success" : "error");

    if (statusCode === "sent") {
        showEntryRecoveryCode(normalizeCodeValue(params.get("recovery_code")) || generateRecoveryCode());
    }

    if (statusCode !== "sent") {
        entryRecoveryEmail?.classList.add("is-invalid");
    }
};

const showBackendResetStatus = () => {
    const params = new URLSearchParams(window.location.search);
    const statusCode = params.get("reset_status");

    if (!statusCode) {
        return;
    }

    showEntryNewPasswordForm();

    if (statusCode === "saved") {
        showEntryNewPasswordMessage(recoveryMessages.passwordSaved, "success");
        return;
    }

    if (statusCode === "expired") {
        showEntryNewPasswordMessage("O c\u00f3digo expirou. Pe\u00e7a uma nova recupera\u00e7\u00e3o.");
        return;
    }

    showEntryNewPasswordMessage(recoveryMessages.passwordInvalid);
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
        return;
    }

    if (!canUsePhpBackend()) {
        event.preventDefault();
        validateStoredLogin();
    }
});

entryRecoveryForm?.addEventListener("submit", (event) => {
    clearEntryRecoveryMessage();

    if (!isValidEmail(entryRecoveryEmail?.value)) {
        event.preventDefault();
        entryRecoveryEmail?.classList.add("is-invalid");
        showEntryRecoveryMessage(recoveryMessages.invalid);
        entryRecoveryEmail?.focus();
        return;
    }

    if (!canUsePhpBackend()) {
        event.preventDefault();
        validateStoredRecovery();
    }
});

entryRecoveryCodeInput?.addEventListener("input", () => {
    entryRecoveryCodeInput.value = normalizeCodeValue(entryRecoveryCodeInput.value);
    entryRecoveryCodeInput.classList.remove("is-invalid");

    if (entryRecoveryCodeMessage) {
        entryRecoveryCodeMessage.textContent = "";
        entryRecoveryCodeMessage.classList.remove("is-success", "is-error");
    }
});

entryVerifyRecoveryCode?.addEventListener("click", verifyEntryRecoveryCode);

entryNewPasswordForm?.addEventListener("submit", (event) => {
    if (!canUsePhpBackend()) {
        event.preventDefault();
        saveStoredPassword();
        return;
    }

    const newPassword = String(entryNewPassword?.value || "");
    const confirmPassword = String(entryConfirmNewPassword?.value || "");

    if (newPassword.trim().length < 4 || newPassword !== confirmPassword) {
        event.preventDefault();
        saveStoredPassword();
    }
});

entrySaveNewPasswordButton?.addEventListener("click", () => {
    if (!canUsePhpBackend()) {
        saveStoredPassword();
    }
});

[entryNewPassword, entryConfirmNewPassword].forEach((field) => {
    field?.addEventListener("input", () => {
        field.classList.remove("is-invalid");
        showEntryNewPasswordMessage("");
    });
});

document.querySelectorAll('input[name="aluno_idade"]').forEach(setupAgeInput);
showBackendLoginError();
showBackendRecoveryStatus();
showBackendResetStatus();
