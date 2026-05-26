const loginForm = document.getElementById("loginForm");
const cpfInput = document.getElementById("cpf");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("loginError");

const canUsePhpBackend = () => {
    const protocol = window.location.protocol;
    const staticServerPorts = new Set(["5500", "5501"]);

    return protocol !== "file:" && !staticServerPorts.has(window.location.port);
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
    window.location.href = "home.html";
});

[cpfInput, passwordInput].forEach((field) => {
    field.addEventListener("input", () => {
        field.classList.remove("is-invalid");

        if (cpfInput.value.trim() && passwordInput.value.trim()) {
            loginError.textContent = "";
        }
    });
});
