const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("loginError");

const showError = (message, fields) => {
    loginError.textContent = message;
    fields.forEach((field) => field.classList.add("is-invalid"));
    fields[0]?.focus();
};

const clearErrorState = () => {
    loginError.textContent = "";
    emailInput.classList.remove("is-invalid");
    passwordInput.classList.remove("is-invalid");
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearErrorState();

    const emptyFields = [emailInput, passwordInput].filter((field) => !field.value.trim());

    if (emptyFields.length > 0) {
        showError("Preencha o email e a senha para continuar.", emptyFields);
        return;
    }

    if (!isValidEmail(emailInput.value.trim())) {
        showError("Digite um email valido para continuar.", [emailInput]);
        return;
    }

    window.location.href = "Index.html";
});

[emailInput, passwordInput].forEach((field) => {
    field.addEventListener("input", () => {
        field.classList.remove("is-invalid");

        if (emailInput.value.trim() && passwordInput.value.trim()) {
            loginError.textContent = "";
        }
    });
});
