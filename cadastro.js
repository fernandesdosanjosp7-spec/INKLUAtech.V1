const formStorageKey = "inklua_formulario_adaptacao";
const registerForm = document.querySelector(".entry-register-form");

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

registerForm?.addEventListener("submit", () => {
    localStorage.setItem(formStorageKey, JSON.stringify(collectRegisterAnswers(registerForm)));
});
