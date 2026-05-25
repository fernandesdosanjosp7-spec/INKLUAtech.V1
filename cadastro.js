const formStorageKey = "inklua_formulario_adaptacao";
const registerForm = document.querySelector(".entry-register-form");
const entryLoginForm = document.querySelector(".entry-login-form");

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

registerForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    localStorage.setItem(formStorageKey, JSON.stringify(collectRegisterAnswers(registerForm)));
    window.location.href = "home.html#formulario";
});

entryLoginForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    window.location.href = "home.html";
});
