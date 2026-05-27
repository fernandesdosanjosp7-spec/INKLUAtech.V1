const formStorageKey = "inklua_formulario_adaptacao";
const registerForm = document.querySelector(".entry-register-form");
const entryLoginForm = document.querySelector(".entry-login-form");

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

registerForm?.addEventListener("submit", (event) => {
    localStorage.setItem(formStorageKey, JSON.stringify(collectRegisterAnswers(registerForm)));

    if (!canUsePhpBackend()) {
        event.preventDefault();
        window.location.href = "home.html#formulario";
    }
});

entryLoginForm?.addEventListener("submit", (event) => {
    localStorage.setItem(formStorageKey, localStorage.getItem(formStorageKey) || "{}");

    if (!canUsePhpBackend()) {
        event.preventDefault();
        window.location.href = "home.html";
    }
});
