const loginForm = document.getElementById("loginForm");
const cpfInput = document.getElementById("cpf");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("loginError");

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

loginForm.addEventListener("submit", (event) => {
    clearErrorState();

    const emptyFields = [cpfInput, passwordInput].filter((field) => !field.value.trim());

    if (emptyFields.length > 0) {
        event.preventDefault();
        showError("Preencha o CPF e a senha para continuar.", emptyFields);
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
