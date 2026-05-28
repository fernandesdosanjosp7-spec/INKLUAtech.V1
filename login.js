const loginForm = document.getElementById("loginForm");
const passwordRecoveryForm = document.getElementById("passwordRecoveryForm");
const recoverPasswordLink = document.getElementById("recoverPasswordLink");
const backToLoginLink = document.getElementById("backToLoginLink");
const cpfInput = document.getElementById("cpf");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("loginError");
const recoveryEmailInput = document.getElementById("recoveryEmail");
const recoveryMessage = document.getElementById("recoveryMessage");
const passwordRecoveryCodePanel = document.getElementById("passwordRecoveryCodePanel");
const passwordRecoveryCodePreview = document.getElementById("passwordRecoveryCodePreview");
const passwordRecoveryCodeInput = document.getElementById("passwordRecoveryCodeInput");
const passwordRecoveryCodeMessage = document.getElementById("passwordRecoveryCodeMessage");
const verifyPasswordRecoveryCode = document.getElementById("verifyPasswordRecoveryCode");
const newPasswordForm = document.getElementById("newPasswordForm");
const newPasswordInput = document.getElementById("newPassword");
const confirmNewPasswordInput = document.getElementById("confirmNewPassword");
const newPasswordMessage = document.getElementById("newPasswordMessage");
const saveNewPasswordButton = document.getElementById("saveNewPasswordButton");
const formStorageKey = "inklua_formulario_adaptacao";
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

const canUsePhpBackend = () => {
    const port = Number(window.location.port);
    const isLiveServer = port >= 5500 && port <= 5599;

    return window.location.protocol !== "file:" && !isLiveServer;
};

const showError = (message, fields) => {
    loginError.textContent = message;
    fields.forEach((field) => field.classList.add("is-invalid"));
    fields[0]?.focus();
};

const clearErrorState = () => {
    loginError.textContent = "";
    cpfInput.classList.remove("is-invalid");
    passwordInput.classList.remove("is-invalid");
};

const showRecoveryMessage = (message, type = "error") => {
    if (!recoveryMessage) {
        return;
    }

    recoveryMessage.textContent = message;
    recoveryMessage.classList.toggle("is-success", type === "success");
    recoveryMessage.classList.toggle("is-error", type !== "success");
};

const clearRecoveryMessage = () => {
    if (recoveryMessage) {
        recoveryMessage.textContent = "";
        recoveryMessage.classList.remove("is-success", "is-error");
    }

    recoveryEmailInput?.classList.remove("is-invalid");
};

const showRecoveryForm = () => {
    passwordRecoveryForm.hidden = false;
    recoveryEmailInput?.focus();
};

const hideRecoveryForm = () => {
    passwordRecoveryForm.hidden = true;
    clearRecoveryMessage();
};

const showNewPasswordMessage = (message, type = "error") => {
    if (!newPasswordMessage) {
        return;
    }

    newPasswordMessage.textContent = message;
    newPasswordMessage.classList.toggle("is-success", type === "success");
    newPasswordMessage.classList.toggle("is-error", type !== "success");
};

const showNewPasswordForm = () => {
    if (newPasswordForm) {
        newPasswordForm.hidden = false;
    }

    newPasswordInput?.focus();
};

const saveStoredPassword = () => {
    const newPassword = String(newPasswordInput?.value || "");
    const confirmPassword = String(confirmNewPasswordInput?.value || "");

    newPasswordInput?.classList.remove("is-invalid");
    confirmNewPasswordInput?.classList.remove("is-invalid");

    if (newPassword.trim().length < 4) {
        newPasswordInput?.classList.add("is-invalid");
        showNewPasswordMessage(recoveryMessages.passwordInvalid);
        newPasswordInput?.focus();
        return false;
    }

    if (newPassword !== confirmPassword) {
        confirmNewPasswordInput?.classList.add("is-invalid");
        showNewPasswordMessage(recoveryMessages.passwordMismatch);
        confirmNewPasswordInput?.focus();
        return false;
    }

    const storedAnswers = getStoredRegisterAnswers();
    storedAnswers.senha = newPassword;
    storedAnswers.password = newPassword;
    localStorage.setItem(formStorageKey, JSON.stringify(storedAnswers));
    localStorage.removeItem(recoveryCodeStorageKey);
    showNewPasswordMessage(recoveryMessages.passwordSaved, "success");
    return true;
};

const showRecoveryCode = (code) => {
    localStorage.setItem(recoveryCodeStorageKey, code);

    if (passwordRecoveryCodePreview) {
        passwordRecoveryCodePreview.textContent = code;
    }

    if (passwordRecoveryCodePanel) {
        passwordRecoveryCodePanel.hidden = false;
    }

    if (passwordRecoveryCodeInput) {
        passwordRecoveryCodeInput.value = "";
        passwordRecoveryCodeInput.focus();
    }

    if (passwordRecoveryCodeMessage) {
        passwordRecoveryCodeMessage.textContent = "";
        passwordRecoveryCodeMessage.classList.remove("is-success", "is-error");
    }
};

const verifyRecoveryCode = () => {
    const expectedCode = localStorage.getItem(recoveryCodeStorageKey) || "";
    const typedCode = normalizeCodeValue(passwordRecoveryCodeInput?.value);

    if (!expectedCode || typedCode !== expectedCode) {
        passwordRecoveryCodeInput?.classList.add("is-invalid");

        if (passwordRecoveryCodeMessage) {
            passwordRecoveryCodeMessage.textContent = recoveryMessages.codeInvalid;
            passwordRecoveryCodeMessage.classList.add("is-error");
            passwordRecoveryCodeMessage.classList.remove("is-success");
        }

        passwordRecoveryCodeInput?.focus();
        return;
    }

    passwordRecoveryCodeInput?.classList.remove("is-invalid");

    if (passwordRecoveryCodeMessage) {
        passwordRecoveryCodeMessage.textContent = recoveryMessages.codeValid;
        passwordRecoveryCodeMessage.classList.add("is-success");
        passwordRecoveryCodeMessage.classList.remove("is-error");
    }

    showNewPasswordForm();
};

const showBackendError = () => {
    const params = new URLSearchParams(window.location.search);
    const errorCode = params.get("login_error");

    if (!errorCode || !loginErrorMessages[errorCode]) {
        return;
    }

    if (errorCode === "cpf") {
        showError(loginErrorMessages[errorCode], [cpfInput]);
        return;
    }

    if (errorCode === "senha") {
        showError(loginErrorMessages[errorCode], [passwordInput]);
        return;
    }

    showError(loginErrorMessages[errorCode], [cpfInput, passwordInput]);
};

showBackendError();

const showBackendRecoveryStatus = () => {
    const params = new URLSearchParams(window.location.search);
    const statusCode = params.get("recovery_status");

    if (!statusCode || !recoveryMessages[statusCode]) {
        return;
    }

    showRecoveryForm();
    showRecoveryMessage(recoveryMessages[statusCode], statusCode === "sent" ? "success" : "error");

    if (statusCode === "sent") {
        showRecoveryCode(normalizeCodeValue(params.get("recovery_code")) || generateRecoveryCode());
    }

    if (statusCode !== "sent") {
        recoveryEmailInput?.classList.add("is-invalid");
    }
};

const showBackendResetStatus = () => {
    const params = new URLSearchParams(window.location.search);
    const statusCode = params.get("reset_status");

    if (!statusCode) {
        return;
    }

    showRecoveryForm();
    showNewPasswordForm();

    if (statusCode === "saved") {
        showNewPasswordMessage(recoveryMessages.passwordSaved, "success");
        return;
    }

    if (statusCode === "expired") {
        showNewPasswordMessage("O c\u00f3digo expirou. Pe\u00e7a uma nova recupera\u00e7\u00e3o.");
        return;
    }

    showNewPasswordMessage(recoveryMessages.passwordInvalid);
};

const validateStoredLogin = () => {
    const storedAnswers = getStoredRegisterAnswers();
    const storedCpf = normalizeCpfValue(storedAnswers.cpf);
    const typedCpf = normalizeCpfValue(cpfInput.value);
    const storedPassword = String(storedAnswers.senha || storedAnswers.password || "");
    const typedPassword = String(passwordInput.value || "");

    if (!storedCpf || storedCpf !== typedCpf) {
        showError(loginErrorMessages.cpf, [cpfInput]);
        return false;
    }

    if (!storedPassword || storedPassword !== typedPassword) {
        showError(loginErrorMessages.senha, [passwordInput]);
        return false;
    }

    window.location.href = "home.html";
    return true;
};

const validateStoredRecovery = () => {
    const typedEmail = normalizeEmailValue(recoveryEmailInput?.value);

    if (!isValidEmail(typedEmail)) {
        recoveryEmailInput?.classList.add("is-invalid");
        showRecoveryMessage(recoveryMessages.invalid);
        recoveryEmailInput?.focus();
        return false;
    }

    showRecoveryMessage(recoveryMessages.sent, "success");
    showRecoveryCode(generateRecoveryCode());
    return true;
};

loginForm.addEventListener("submit", (event) => {
    clearErrorState();

    const emptyFields = [cpfInput, passwordInput].filter((field) => !field.value.trim());

    if (emptyFields.length > 0) {
        event.preventDefault();
        showError("Preencha o CPF e a senha para continuar.", emptyFields);
        return;
    }

    if (canUsePhpBackend() && loginForm.method.toLowerCase() === "post" && loginForm.action.includes("auth.php")) {
        return;
    }

    event.preventDefault();
    validateStoredLogin();
});

[cpfInput, passwordInput].forEach((field) => {
    field.addEventListener("input", () => {
        field.classList.remove("is-invalid");

        if (cpfInput.value.trim() && passwordInput.value.trim()) {
            loginError.textContent = "";
        }
    });
});

recoverPasswordLink?.addEventListener("click", () => {
    showRecoveryForm();
});

backToLoginLink?.addEventListener("click", () => {
    hideRecoveryForm();
    recoverPasswordLink?.focus();
});

passwordRecoveryForm?.addEventListener("submit", (event) => {
    clearRecoveryMessage();

    if (!isValidEmail(recoveryEmailInput?.value)) {
        event.preventDefault();
        recoveryEmailInput?.classList.add("is-invalid");
        showRecoveryMessage(recoveryMessages.invalid);
        recoveryEmailInput?.focus();
        return;
    }

    if (!canUsePhpBackend()) {
        event.preventDefault();
        validateStoredRecovery();
    }
});

passwordRecoveryCodeInput?.addEventListener("input", () => {
    passwordRecoveryCodeInput.value = normalizeCodeValue(passwordRecoveryCodeInput.value);
    passwordRecoveryCodeInput.classList.remove("is-invalid");

    if (passwordRecoveryCodeMessage) {
        passwordRecoveryCodeMessage.textContent = "";
        passwordRecoveryCodeMessage.classList.remove("is-success", "is-error");
    }
});

verifyPasswordRecoveryCode?.addEventListener("click", verifyRecoveryCode);

newPasswordForm?.addEventListener("submit", (event) => {
    if (!canUsePhpBackend()) {
        event.preventDefault();
        saveStoredPassword();
        return;
    }

    const newPassword = String(newPasswordInput?.value || "");
    const confirmPassword = String(confirmNewPasswordInput?.value || "");

    if (newPassword.trim().length < 4 || newPassword !== confirmPassword) {
        event.preventDefault();
        saveStoredPassword();
    }
});

saveNewPasswordButton?.addEventListener("click", saveStoredPassword);

[newPasswordInput, confirmNewPasswordInput].forEach((field) => {
    field?.addEventListener("input", () => {
        field.classList.remove("is-invalid");
        showNewPasswordMessage("");
    });
});

if (window.location.hash === "#recover-password") {
    showRecoveryForm();
}

showBackendRecoveryStatus();
showBackendResetStatus();
