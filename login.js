const loginForm = document.getElementById("loginForm");
const cpfInput = document.getElementById("cpf");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("loginError");
const loginErrorMessages = {
    cpf: "CPF n\u00e3o cadastrado.",
    senha: "Senha incorreta.",
    required: "Preencha o CPF e a senha para continuar."
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

loginForm.addEventListener("submit", (event) => {
    clearErrorState();

    const emptyFields = [cpfInput, passwordInput].filter((field) => !field.value.trim());

    if (emptyFields.length > 0) {
        event.preventDefault();
        showError("Preencha o CPF e a senha para continuar.", emptyFields);
        return;
    }
});

[cpfInput, passwordInput].forEach((field) => {
    field.addEventListener("input", () => {
        field.classList.remove("is-invalid");

        if (cpfInput.value.trim() && passwordInput.value.trim()) {
            loginError.textContent = "";
        }
    });
});
