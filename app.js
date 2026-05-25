const activityTitle = document.getElementById("activityTitle");
const activityPanel = document.getElementById("activityPanel");
const completeActivity = document.getElementById("completeActivity");
const progressCount = document.getElementById("progressCount");
const gameCards = document.querySelectorAll("[data-activity]");
const platformViews = document.querySelectorAll("[data-view]");
const navLinks = document.querySelectorAll(".nav-menu a[href^='#']");

const availableViews = ["inicio", "formulario", "jogos", "aprendizado", "rotina", "apoio"];

const showPlatformView = (viewName = "inicio") => {
    const nextView = availableViews.includes(viewName) ? viewName : "inicio";

    platformViews.forEach((view) => {
        const isCurrentView = view.dataset.view === nextView;
        view.hidden = !isCurrentView;
        view.classList.toggle("is-active-view", isCurrentView);
    });

    navLinks.forEach((link) => {
        const isCurrentLink = link.getAttribute("href") === `#${nextView}`;
        link.classList.toggle("is-active", isCurrentLink);

        if (isCurrentLink) {
            link.setAttribute("aria-current", "page");
            return;
        }

        link.removeAttribute("aria-current");
    });
};

const getViewFromHash = () => window.location.hash.replace("#", "") || "inicio";

navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        const href = link.getAttribute("href") || "#inicio";
        const viewName = href.replace("#", "") || "inicio";

        if (!availableViews.includes(viewName)) {
            return;
        }

        event.preventDefault();
        showPlatformView(viewName);
        window.location.hash = viewName;
    });
});

showPlatformView(getViewFromHash());

window.addEventListener("hashchange", () => {
    showPlatformView(getViewFromHash());
});

window.addEventListener("popstate", () => {
    showPlatformView(getViewFromHash());
});

const activityContent = {
    emocoes: {
        title: "Jogo das Emo&ccedil;&otilde;es",
        text: "Escolha como a pessoa pode estar se sentindo nesta situa&ccedil;&atilde;o: chegou em um lugar com muito barulho.",
        choices: ["Feliz", "Assustado", "Com sono", "Com fome"]
    },
    rotina: {
        title: "Sequ&ecirc;ncia da Rotina",
        text: "Organize mentalmente a rotina de hoje. Qual etapa vem depois da chegada?",
        choices: ["Pausa", "Atividade", "Ir embora", "Dormir"]
    },
    cores: {
        title: "Jogo das Cores",
        text: "Toque em uma cor para ouvir seu nome em voz alta.",
        colors: [
            { name: "amarela", value: "#ffe066" },
            { name: "azul", value: "#2f80ed" },
            { name: "branco", value: "#ffffff" },
            { name: "laranja", value: "#f2994a" },
            { name: "preto", value: "#111827" },
            { name: "roxo", value: "#7b43f0" },
            { name: "verde", value: "#27ae60" },
            { name: "vermelho", value: "#eb5757" }
        ]
    },
    alfabeto: {
        title: "Alfabeto Falado",
        text: "Toque em uma letra para ouvir seu nome.",
        letters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
    },
    numeros: {
        title: "N&uacute;meros Falados",
        text: "Toque em um n&uacute;mero para ouvir qual n&uacute;mero &eacute;.",
        numbers: Array.from({ length: 11 }, (_, index) => index)
    }
};

let completed = 0;

const letterNames = {
    A: "a",
    B: "b\u00ea",
    C: "c\u00ea",
    D: "d\u00ea",
    E: "\u00e9",
    F: "\u00e9fe",
    G: "g\u00ea",
    H: "ag\u00e1",
    I: "i",
    J: "jota",
    K: "c\u00e1",
    L: "\u00e9le",
    M: "\u00eame",
    N: "\u00eane",
    O: "\u00f3",
    P: "p\u00ea",
    Q: "qu\u00ea",
    R: "\u00e9rre",
    S: "\u00e9sse",
    T: "t\u00ea",
    U: "u",
    V: "v\u00ea",
    W: "d\u00e1blio",
    X: "xis",
    Y: "\u00edpsilon",
    Z: "z\u00ea"
};

const renderActivity = (activityName) => {
    const activity = activityContent[activityName];

    if (!activityTitle || !activityPanel || !completeActivity || !activity) {
        return;
    }

    activityTitle.innerHTML = activity.title;

    if (activity.letters) {
        activityPanel.innerHTML = `
            <div class="alphabet-game">
                <p>${activity.text}</p>
                <div class="alphabet-display" id="alphabetDisplay" aria-live="polite">A</div>
                <div class="alphabet-grid" aria-label="Letras do alfabeto">
                    ${activity.letters.map((letter) => `<button class="alphabet-letter" type="button" data-letter="${letter}">${letter}</button>`).join("")}
                </div>
            </div>
        `;
        completeActivity.disabled = false;
        return;
    }

    if (activity.numbers) {
        activityPanel.innerHTML = `
            <div class="number-game">
                <p>${activity.text}</p>
                <div class="number-display" id="numberDisplay" aria-live="polite">0</div>
                <div class="number-grid" aria-label="N&uacute;meros de 0 a 10">
                    ${activity.numbers.map((number) => `<button class="number-button" type="button" data-number="${number}">${number}</button>`).join("")}
                </div>
            </div>
        `;
        completeActivity.disabled = false;
        return;
    }

    if (activity.colors) {
        activityPanel.innerHTML = `
            <div class="color-game">
                <p>${activity.text}</p>
                <div class="color-display" id="colorDisplay" aria-live="polite">
                    <span class="color-display__swatch" style="--color-swatch: ${activity.colors[0].value}"></span>
                    <strong>${activity.colors[0].name}</strong>
                </div>
                <div class="color-grid" aria-label="Cores">
                    ${activity.colors.map((color) => `
                        <button class="color-button" type="button" data-color-name="${color.name}" data-color-value="${color.value}" style="--color-swatch: ${color.value}">
                            <span class="color-button__swatch"></span>
                            <span>${color.name}</span>
                        </button>
                    `).join("")}
                </div>
            </div>
        `;
        completeActivity.disabled = false;
        return;
    }

    activityPanel.innerHTML = `
        <p>${activity.text}</p>
        <div class="choice-row">
            ${activity.choices.map((choice) => `<button type="button">${choice}</button>`).join("")}
        </div>
    `;
    completeActivity.disabled = false;
};

gameCards.forEach((card) => {
    const button = card.querySelector("button");

    if (!button) {
        return;
    }

    button.addEventListener("click", () => {
        if (window.location.hash !== "#jogos") {
            window.location.hash = "jogos";
        }

        showPlatformView("jogos");
        renderActivity(card.dataset.activity);
    });
});

const initialActivity = new URLSearchParams(window.location.search).get("start");

if (initialActivity && activityContent[initialActivity]) {
    showPlatformView("jogos");
    renderActivity(initialActivity);
    const activityBoard = document.querySelector(".activity-board");

    if (activityBoard) {
        activityBoard.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

const speakLetter = (letter) => {
    if (!("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();

    const letterName = letterNames[letter] || letter;
    const utterance = new SpeechSynthesisUtterance(`Letra ${letterName}.`);
    utterance.lang = "pt-BR";
    utterance.rate = 0.82;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
};

const speakNumber = (number) => {
    if (!("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(`N\u00famero ${number}`);
    utterance.lang = "pt-BR";
    utterance.rate = 0.82;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
};

const speakColor = (colorName) => {
    if (!("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(`Cor ${colorName}.`);
    utterance.lang = "pt-BR";
    utterance.rate = 0.82;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
};

if (activityPanel) {
    activityPanel.addEventListener("click", (event) => {
    const clickedButton = event.target instanceof Element ? event.target.closest("button") : null;

    if (!(clickedButton instanceof HTMLButtonElement)) {
        return;
    }

    const letter = clickedButton.dataset.letter;

    if (letter) {
        const display = document.getElementById("alphabetDisplay");

        activityPanel.querySelectorAll(".alphabet-letter").forEach((button) => {
            button.classList.remove("is-selected");
        });
        clickedButton.classList.add("is-selected");

        if (display) {
            display.textContent = letter;
        }

        speakLetter(letter);
        return;
    }

    const number = clickedButton.dataset.number;

    if (number !== undefined) {
        const display = document.getElementById("numberDisplay");

        activityPanel.querySelectorAll(".number-button").forEach((button) => {
            button.classList.remove("is-selected");
        });
        clickedButton.classList.add("is-selected");

        if (display) {
            display.textContent = number;
        }

        speakNumber(number);
        return;
    }

    const colorName = clickedButton.dataset.colorName;

    if (colorName) {
        const display = document.getElementById("colorDisplay");
        const colorValue = clickedButton.dataset.colorValue || "#ffffff";

        activityPanel.querySelectorAll(".color-button").forEach((button) => {
            button.classList.remove("is-selected");
        });
        clickedButton.classList.add("is-selected");

        if (display) {
            display.innerHTML = `
                <span class="color-display__swatch" style="--color-swatch: ${colorValue}"></span>
                <strong>${colorName}</strong>
            `;
        }

        speakColor(colorName);
        return;
    }

    activityPanel.querySelectorAll("button").forEach((button) => {
        button.classList.remove("is-selected");
    });
    clickedButton.classList.add("is-selected");
    });
}

if (completeActivity && activityPanel) {
    completeActivity.addEventListener("click", () => {
    completed += 1;

    if (progressCount) {
        progressCount.textContent = String(completed);
    }

    completeActivity.disabled = true;
    activityPanel.innerHTML = "<p>Atividade conclu&iacute;da. Escolha outro jogo para continuar aprendendo.</p>";
    });
}

const formStorageKey = "inklua_formulario_adaptacao";

const collectFormAnswers = (form) => {
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

const getSavedFormAnswers = () => {
    try {
        return JSON.parse(localStorage.getItem(formStorageKey)) || {};
    } catch (error) {
        return {};
    }
};

const fillFormWithSavedAnswers = (form, answers) => {
    form.querySelectorAll("[name]").forEach((field) => {
        const key = field.name.replace("[]", "");
        const value = answers[key];

        if (value === undefined) {
            return;
        }

        if (field instanceof HTMLInputElement && field.type === "checkbox") {
            const values = Array.isArray(value) ? value : String(value).split(", ");
            field.checked = values.includes(field.value);
            return;
        }

        if (field instanceof HTMLInputElement && field.type === "radio") {
            field.checked = field.value === value;
            return;
        }

        if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) {
            field.value = value;
        }
    });
};

document.querySelectorAll(".platform-form").forEach((form) => {
    if (form.hasAttribute("data-local-form")) {
        fillFormWithSavedAnswers(form, getSavedFormAnswers());
    }

    form.addEventListener("submit", (event) => {
        const shouldSubmitToServer = form.method.toLowerCase() === "post" && form.action.includes("auth.php");

        localStorage.setItem(formStorageKey, JSON.stringify(collectFormAnswers(form)));

        if (shouldSubmitToServer) {
            return;
        }

        event.preventDefault();

        const status = form.querySelector(".form-status");

        if (status) {
            status.textContent = "Respostas salvas nesta plataforma.";
        }
    });
});
