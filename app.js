const activityTitle = document.getElementById("activityTitle");
const activityPanel = document.getElementById("activityPanel");
const completeActivity = document.getElementById("completeActivity");
const progressCount = document.getElementById("progressCount");
const welcomeGreeting = document.getElementById("welcomeGreeting");
const welcomeName = document.getElementById("welcomeName");
const gameCards = document.querySelectorAll("[data-activity]");
const platformViews = document.querySelectorAll("[data-view]");
const navLinks = document.querySelectorAll(".nav-menu a[data-view-link]");

const routeToView = {
    "/": "inicio",
    "/inicio": "inicio",
    "/formularios": "formulario",
    "/formulario": "formulario",
    "/relatorios": "relatorio",
    "/relatorio": "relatorio",
    "/jogos": "jogos",
    "/atividades": "atividades",
    "/perfil": "perfil"
};
const viewToRoute = {
    inicio: "/",
    formulario: "/formularios",
    relatorio: "/relatorios",
    jogos: "/jogos",
    atividades: "/atividades",
    perfil: "/perfil"
};
const availableViews = Object.keys(viewToRoute);

const normalizeRoutePath = (path) => {
    const cleanPath = String(path || "/").replace(/\/+$/, "") || "/";
    const fileName = cleanPath.split("/").pop();

    if (fileName === "home.html" || fileName === "home.php") {
        return "/";
    }

    return cleanPath;
};

const getViewFromLocation = () => {
    const legacyHashView = window.location.hash.replace("#", "");

    if (availableViews.includes(legacyHashView)) {
        return legacyHashView;
    }

    return routeToView[normalizeRoutePath(window.location.pathname)] || "inicio";
};

const buildViewUrl = (viewName) => {
    const route = viewToRoute[viewName] || "/";

    if (window.location.protocol === "file:") {
        return viewName === "inicio" ? window.location.pathname : `#${viewName}`;
    }

    return route;
};

const showPlatformView = (viewName = "inicio") => {
    const nextView = availableViews.includes(viewName) ? viewName : "inicio";

    platformViews.forEach((view) => {
        const isCurrentView = view.dataset.view === nextView;
        view.hidden = !isCurrentView;
        view.classList.toggle("is-active-view", isCurrentView);
    });

    navLinks.forEach((link) => {
        const isCurrentLink = link.dataset.viewLink === nextView;
        link.classList.toggle("is-active", isCurrentLink);

        if (isCurrentLink) {
            link.setAttribute("aria-current", "page");
            return;
        }

        link.removeAttribute("aria-current");
    });
};

const goToPlatformView = (viewName) => {
    if (!availableViews.includes(viewName)) {
        return;
    }

    showPlatformView(viewName);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    const nextUrl = buildViewUrl(viewName);

    if (window.location.pathname + window.location.hash !== nextUrl) {
        window.history.pushState({ viewName }, "", nextUrl);
    }
};

navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        const viewName = link.dataset.viewLink || "inicio";

        if (!availableViews.includes(viewName)) {
            return;
        }

        event.preventDefault();
        goToPlatformView(viewName);
    });
});

showPlatformView(getViewFromLocation());

window.addEventListener("popstate", () => {
    showPlatformView(getViewFromLocation());
});

const moodStorageKey = "inklua_daily_mood_v1";
const moodFeedback = document.getElementById("moodFeedback");
const moodButtons = document.querySelectorAll("[data-mood]");

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const saveMood = (button) => {
    const payload = {
        date: getTodayKey(),
        mood: button.dataset.mood || "",
        label: button.dataset.moodLabel || "",
        feedback: button.dataset.moodFeedback || ""
    };

    localStorage.setItem(moodStorageKey, JSON.stringify(payload));
    renderMood(payload);
};

const readMood = () => {
    try {
        const savedMood = JSON.parse(localStorage.getItem(moodStorageKey)) || {};
        return savedMood.date === getTodayKey() ? savedMood : null;
    } catch (error) {
        return null;
    }
};

const renderMood = (mood) => {
    moodButtons.forEach((button) => {
        const isSelected = mood?.mood && button.dataset.mood === mood.mood;
        button.classList.toggle("is-selected", Boolean(isSelected));
        button.setAttribute("aria-pressed", isSelected ? "true" : "false");
    });

    if (moodFeedback && mood?.feedback) {
        moodFeedback.textContent = mood.feedback;
        moodFeedback.classList.remove("visually-hidden");
    }
};

moodButtons.forEach((button) => {
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => saveMood(button));
});

renderMood(readMood());

const clampNumber = (value, min, max) => Math.min(Math.max(value, min), max);

const activityContent = {
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
        goToPlatformView("jogos");
        renderActivity(card.dataset.activity);
    });
});

const initialActivity = new URLSearchParams(window.location.search).get("start");

if (initialActivity && activityContent[initialActivity]) {
    goToPlatformView("jogos");
    renderActivity(initialActivity);
}

const scoreSpeechVoice = (voice) => {
    const name = voice.name.toLowerCase();
    const uri = String(voice.voiceURI || "").toLowerCase();
    const normalizeText = (value) => String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    const text = normalizeText(`${name} ${uri}`);
    let score = 0;
    const femaleNames = [
        "ana",
        "beatriz",
        "bruna",
        "camila",
        "carolina",
        "claudia",
        "francisca",
        "fernanda",
        "gabriela",
        "helena",
        "heloisa",
        "ines",
        "juliana",
        "leticia",
        "livia",
        "luciana",
        "maria",
        "manuela",
        "joana",
        "patricia",
        "sandra",
        "thalita",
        "yara",
        "raquel",
        "teresa",
        "catarina",
        "amalia",
        "vitoria"
    ];
    const maleNames = [
        "antonio",
        "daniel",
        "felipe",
        "joaquim",
        "ricardo",
        "paulo",
        "thiago",
        "tiago",
        "bruno",
        "carlos",
        "jorge"
    ];

    if (voice.lang?.toLowerCase() === "pt-br") score += 40;
    if (voice.lang?.toLowerCase().startsWith("pt")) score += 25;
    if (femaleNames.some((femaleName) => text.includes(femaleName))) score += 500;
    if (maleNames.some((maleName) => text.includes(maleName))) score -= 1000;
    if (text.includes("female") || text.includes("feminina") || text.includes("mulher") || text.includes("woman")) score += 400;
    if (text.includes("male") || text.includes("masculina") || text.includes("homem")) score -= 1000;
    if (text.includes("doce") || text.includes("suave") || text.includes("soft")) score += 100;
    if (text.includes("natural")) score += 80;
    if (text.includes("neural")) score += 70;
    if (text.includes("online")) score += 55;
    if (voice.localService === false) score += 45;
    if (text.includes("microsoft")) score += 24;
    if (text.includes("google")) score += 22;
    if (text.includes("francisca") || text.includes("maria") || text.includes("luciana") || text.includes("helena")) score += 35;
    if (text.includes("female") || text.includes("feminina")) score += 10;
    if (voice.localService === true && !text.includes("natural")) score -= 30;

    return score;
};

const getPreferredSpeechVoice = () => {
    if (!("speechSynthesis" in window)) {
        return null;
    }

    const sharedFemaleVoice = window.InkluaSpeech?.getFemaleVoice?.();

    if (sharedFemaleVoice) {
        return sharedFemaleVoice;
    }

    const voices = window.speechSynthesis.getVoices();
    const portugueseVoices = voices.filter((voice) => voice.lang?.toLowerCase().startsWith("pt"));
    const femaleVoice = portugueseVoices
        .filter((voice) => scoreSpeechVoice(voice) > 450)
        .sort((first, second) => scoreSpeechVoice(second) - scoreSpeechVoice(first))[0];

    if (femaleVoice) {
        return femaleVoice;
    }

    const anyFemaleVoice = voices
        .filter((voice) => scoreSpeechVoice(voice) > 450)
        .sort((first, second) => scoreSpeechVoice(second) - scoreSpeechVoice(first))[0];

    if (anyFemaleVoice) {
        return anyFemaleVoice;
    }

    return portugueseVoices
        .sort((first, second) => scoreSpeechVoice(second) - scoreSpeechVoice(first))[0] || null;
};

const createSoftSpeech = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getPreferredSpeechVoice();

    utterance.lang = voice?.lang || "pt-BR";
    utterance.rate = 0.86;
    utterance.pitch = 1.16;
    utterance.volume = 1;

    if (voice) {
        utterance.voice = voice;
    }

    return utterance;
};

if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = () => getPreferredSpeechVoice();
}

const speakLetter = (letter) => {
    if (!("speechSynthesis" in window)) {
        return;
    }

    const letterName = letterNames[letter] || letter;

    if (window.InkluaSpeech?.speak) {
        window.InkluaSpeech.speak(`${letterName}.`, { interrupt: true });
        return;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(createSoftSpeech(`${letterName}.`));
};

const speakNumber = (number) => {
    if (!("speechSynthesis" in window)) {
        return;
    }

    if (window.InkluaSpeech?.speak) {
        window.InkluaSpeech.speak(String(number), { interrupt: true });
        return;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(createSoftSpeech(String(number)));
};

const speakColor = (colorName) => {
    if (!("speechSynthesis" in window)) {
        return;
    }

    if (window.InkluaSpeech?.speak) {
        window.InkluaSpeech.speak(`${colorName}.`, { interrupt: true });
        return;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(createSoftSpeech(`${colorName}.`));
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

const savedFormAnswers = getSavedFormAnswers();

const hasVisibleProfileAnswers = (form) => Array.from(form.querySelectorAll("[name]")).some((field) => {
    if (!(field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement)) {
        return false;
    }

    if (field.type === "hidden") {
        return false;
    }

    if (field instanceof HTMLInputElement && (field.type === "checkbox" || field.type === "radio")) {
        return field.checked;
    }

    return String(field.value || "").trim() !== "";
});

const setFilteredFormView = (form, shouldFilter) => {
    form.classList.toggle("is-filtered", shouldFilter);

    form.querySelectorAll(".check-grid").forEach((grid) => {
        const options = Array.from(grid.querySelectorAll("label"));
        const hasCheckedOption = options.some((label) => {
            const input = label.querySelector("input");
            return input instanceof HTMLInputElement && input.checked;
        });

        options.forEach((label) => {
            const input = label.querySelector("input");
            const shouldHide = shouldFilter && hasCheckedOption && input instanceof HTMLInputElement && !input.checked;
            label.classList.toggle("is-unselected-option", shouldHide);
        });
    });

    form.querySelectorAll(".form-group").forEach((group) => {
        if (group.querySelector(".check-grid")) {
            const hasCheckedOption = Array.from(group.querySelectorAll("input[type='checkbox'], input[type='radio']")).some((input) => input.checked);
            group.classList.toggle("is-empty-answer", shouldFilter && !hasCheckedOption);
            return;
        }

        const field = group.querySelector("input:not([type='hidden']), select, textarea");
        const isEmpty = field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement
            ? String(field.value || "").trim() === ""
            : false;

        group.classList.toggle("is-empty-answer", shouldFilter && isEmpty);
    });
};

const addFormFilterToggle = (form) => {
    if (!hasVisibleProfileAnswers(form) || form.querySelector(".form-filter-toggle")) {
        return;
    }

    const submitButton = form.querySelector(".form-submit");
    const toggleButton = document.createElement("button");
    toggleButton.className = "form-filter-toggle";
    toggleButton.type = "button";
    toggleButton.textContent = "Mostrar todas as opcoes";
    toggleButton.setAttribute("aria-pressed", "false");

    toggleButton.addEventListener("click", () => {
        const shouldShowAll = toggleButton.getAttribute("aria-pressed") === "false";
        toggleButton.setAttribute("aria-pressed", String(shouldShowAll));
        toggleButton.textContent = shouldShowAll ? "Mostrar apenas respostas" : "Mostrar todas as opcoes";
        setFilteredFormView(form, !shouldShowAll);
    });

    if (submitButton) {
        form.insertBefore(toggleButton, submitButton);
        return;
    }

    form.appendChild(toggleButton);
};

const applySavedAnswerView = (form) => {
    if (!hasVisibleProfileAnswers(form)) {
        return;
    }

    setFilteredFormView(form, true);
    addFormFilterToggle(form);
};

if (welcomeName && savedFormAnswers.aluno_nome) {
    welcomeName.textContent = savedFormAnswers.aluno_nome;
}

if (welcomeGreeting) {
    const currentHour = new Date().getHours();

    if (currentHour < 12) {
        welcomeGreeting.textContent = "Bom dia";
    } else if (currentHour < 18) {
        welcomeGreeting.textContent = "Boa tarde";
    } else {
        welcomeGreeting.textContent = "Boa noite";
    }
}

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

const formatReportValue = (value) => {
    const values = Array.isArray(value) ? value : String(value || "").split(",");
    const cleanValues = values
        .map((item) => item.trim().replace(/-/g, " "))
        .filter(Boolean);

    return cleanValues.length ? cleanValues.join(", ") : "";
};

const updateReportFields = (answers) => {
    document.querySelectorAll("[data-report-field]").forEach((field) => {
        const key = field.dataset.reportField;
        const savedValue = key ? formatReportValue(answers[key]) : "";

        if (savedValue) {
            field.textContent = savedValue;
        }
    });
};

const includesAny = (value, options) => {
    const normalized = Array.isArray(value) ? value : String(value || "").split(",");
    return normalized.some((item) => options.includes(item.trim()));
};

const renderReportRecommendations = (answers) => {
    const container = document.getElementById("reportRecommendations");

    if (!container) {
        return;
    }

    const recommendations = [];

    if (includesAny(answers.prioridades, ["fala", "leitura", "socializacao"]) || includesAny(answers.comunicacao_melhor, ["fala", "gestos", "imagens", "comunicacao-alternativa"])) {
        recommendations.push({
            title: "Comunica\u00e7\u00e3o e express\u00e3o",
            text: "Priorize vogais, s\u00edlabas e alfabeto para trabalhar escolhas, escuta, fala e comunica\u00e7\u00e3o alternativa.",
            href: "/jogos",
            action: "Ver jogos"
        });
    }

    if (includesAny(answers.conteudos_reconhecidos, ["cores", "numeros"]) || includesAny(answers.atividade_funciona, ["associacao-imagens", "jogos"])) {
        recommendations.push({
            title: "Percep\u00e7\u00e3o visual e matem\u00e1tica",
            text: "Use cores, n\u00fameros e matem\u00e1tica visual para refor\u00e7ar reconhecimento, associa\u00e7\u00e3o, contagem e compara\u00e7\u00e3o.",
            href: "/jogos",
            action: "Praticar percep\u00e7\u00e3o"
        });
    }

    if (answers.adaptacao_rotina === "nao" || answers.adaptacao_rotina === "as-vezes" || includesAny(answers.recursos_uteis, ["rotina-visual", "reforco-positivo"])) {
        recommendations.push({
            title: "Rotina e autonomia",
            text: "Registre no perfil quais combinados, pausas e recursos ajudam previsibilidade, transi\u00e7\u00f5es e participa\u00e7\u00e3o.",
            href: "/formularios",
            action: "Atualizar perfil"
        });
    }

    if (includesAny(answers.sensibilidades_importantes, ["sons-altos", "luz-forte", "muitas-cores", "ambientes-agitados"])) {
        recommendations.push({
            title: "Ajustes sensoriais",
            text: "Use o formulario para registrar sinais de desconforto e adaptar a escolha dos jogos.",
            href: "/formularios",
            action: "Atualizar perfil"
        });
    }

    const cards = recommendations.length ? recommendations : [{
        title: "Complete o perfil",
        text: "Preencha comunica\u00e7\u00e3o, aprendizagem, sensibilidades e prioridades para gerar recomenda\u00e7\u00f5es personalizadas.",
        href: "/formularios",
        action: "Ir para o formul\u00e1rio"
    }];

    container.innerHTML = cards.slice(0, 4).map((item) => `
        <article class="report-action-card">
            <strong>${item.title}</strong>
            <p>${item.text}</p>
            <a href="${item.href}">${item.action}</a>
        </article>
    `).join("");
};

const readGameProgress = () => {
    try {
        return JSON.parse(localStorage.getItem("inklua_game_progress_v1")) || { games: {}, sessions: [] };
    } catch (error) {
        return { games: {}, sessions: [] };
    }
};

const readPlatformTime = () => {
    window.InkluaPlatformTime?.commit?.();

    try {
        return JSON.parse(localStorage.getItem("inklua_platform_time_v1")) || { totalMs: 0, visits: 0 };
    } catch (error) {
        return { totalMs: 0, visits: 0 };
    }
};

const formatDuration = (milliseconds = 0) => {
    const totalSeconds = Math.max(Math.round((Number(milliseconds) || 0) / 1000), 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}h ${String(minutes).padStart(2, "0")}min`;
    }

    if (minutes > 0) {
        return `${minutes}min ${String(seconds).padStart(2, "0")}s`;
    }

    return `${seconds}s`;
};

const hiddenGameIds = ["emocoes", "checkin-emocional", "rotina", "formas"];
const isVisibleGame = (game) => !hiddenGameIds.includes(game.id || game.gameId || "");

const developmentAreas = {
    percepcao: ["cores"],
    linguagem: ["alfabeto", "vogais", "silabas"],
    matematica: ["numeros", "matematica-visual"]
};

const getDaysBetween = (dateString) => {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    return Math.floor((todayStart - dateStart) / 86400000);
};

const getUsageLabel = (activeDays, sessionsLastSevenDays) => {
    if (!sessionsLastSevenDays) {
        return "Sem uso recente";
    }

    if (activeDays >= 5) {
        return "Uso frequente";
    }

    if (activeDays >= 3) {
        return "Uso regular";
    }

    return "Uso inicial";
};

const getQualitativeDevelopment = ({ games, completedGames, accuracy, activeDays, mostUsedSkill }) => {
    if (!games.length) {
        return "Ainda nao ha dados suficientes dos jogos. Conforme o aluno utilizar a plataforma, o relatorio vai indicar constancia, progresso e habilidades mais trabalhadas.";
    }

    const completionText = completedGames >= 4
        ? "O aluno apresenta boa continuidade nas atividades propostas"
        : completedGames >= 1
            ? "O aluno iniciou uma trajetoria de participacao nas atividades"
            : "O aluno esta explorando as atividades, ainda sem conclusoes registradas";

    const accuracyText = accuracy >= 80
        ? "com alta taxa de acertos, indicando reconhecimento consistente e maior autonomia."
        : accuracy >= 55
            ? "com respostas em desenvolvimento, sugerindo necessidade de reforco e repeticao planejada."
            : "com muitos momentos de tentativa, o que indica oportunidade de apoio mais proximo e atividades mais curtas.";

    const frequencyText = activeDays >= 3
        ? "A frequencia recente ajuda a observar evolucao ao longo da semana."
        : "Aumentar a regularidade de uso pode tornar o acompanhamento mais fiel ao progresso real.";

    const skillText = mostUsedSkill
        ? `A area mais trabalhada foi ${mostUsedSkill.replace(/-/g, " ")}.`
        : "As areas trabalhadas ainda estao se formando conforme o uso.";

    return `${completionText}, ${accuracyText} ${frequencyText} ${skillText}`;
};

const getDevelopmentSummary = ({ games, completedGames, accuracy, activeDays }) => {
    if (!games.length) {
        return {
            label: "Aguardando dados",
            text: "Leitura geral do progresso do aluno."
        };
    }

    if (completedGames >= 4 && accuracy >= 70 && activeDays >= 3) {
        return {
            label: "Evolucao consistente",
            text: "Boa continuidade, frequencia recente e respostas mais autonomas."
        };
    }

    if (completedGames >= 1 || activeDays >= 2) {
        return {
            label: "Em desenvolvimento",
            text: "Ha participacao registrada; manter repeticao e reforco positivo."
        };
    }

    return {
        label: "Uso inicial",
        text: "Ainda e preciso mais constancia para avaliar impacto ao longo do tempo."
    };
};

const getGameLevelFromProgress = (game) => {
    const correct = Math.max(Number(game?.correct) || 0, 0);
    return Number(game?.level) || Math.floor(correct / 5) + 1;
};

const getLevelSummary = (games) => {
    const levels = games.map(getGameLevelFromProgress);
    const highestLevel = levels.length ? Math.max(...levels) : 1;
    const advancedGames = levels.filter((level) => level > 1).length;

    return { highestLevel, advancedGames };
};

const updateProgressCountFromGames = (completedGames) => {
    if (progressCount) {
        progressCount.textContent = String(completedGames);
    }
};

const getGameDevelopmentScore = (game) => {
    if (!game) {
        return 0;
    }

    const answered = Number(game.attempts) || (game.correct || 0) + (game.wrong || 0);
    const totalItems = Math.max(Number(game.totalItems) || answered || 1, 1);
    const exploredItems = Math.min(answered, totalItems);
    const itemProgress = exploredItems / totalItems;
    const accuracy = answered ? (game.correct || 0) / answered : itemProgress;
    const completion = game.completed ? 1 : 0;
    const score = Math.round((itemProgress * 44) + (accuracy * 36) + (Math.min(Number(game.level) || 1, 4) * 5) + (completion * 10));

    return Math.min(Math.max(score, 0), 100);
};

const getAreaDevelopmentScore = (gameMap, gameIds) => {
    const scores = gameIds.map((gameId) => getGameDevelopmentScore(gameMap.get(gameId)));
    const total = scores.reduce((sum, score) => sum + score, 0);

    return Math.round(total / Math.max(scores.length, 1));
};

const renderDevelopmentAreas = (games) => {
    const gameMap = new Map(games.map((game) => [game.id, game]));

    document.querySelectorAll("[data-development-area]").forEach((area) => {
        const areaName = area.dataset.developmentArea || "";
        const score = getAreaDevelopmentScore(gameMap, developmentAreas[areaName] || []);
        const value = area.querySelector("[data-development-value]");
        const bar = area.querySelector("[data-development-bar]");

        value?.replaceChildren(document.createTextNode(`${score}%`));

        if (bar instanceof HTMLElement) {
            bar.style.width = `${score}%`;
        }
    });
};

const renderConsolidatedReport = () => {
    const progress = readGameProgress();
    const platformTime = readPlatformTime();
    const games = Object.values(progress.games || {}).filter(isVisibleGame);
    const sessions = (progress.sessions || []).filter(isVisibleGame);
    const completedGames = games.filter((game) => game.completed).length;
    const totalGames = Math.max(games.length, 6);
    const answeredSessions = sessions.filter((session) => typeof session.correct === "boolean");
    const correctTotal = games.reduce((sum, game) => sum + Math.max(Number(game.correct) || 0, 0), 0);
    const wrongTotal = games.reduce((sum, game) => sum + Math.max(Number(game.wrong) || 0, 0), 0);
    const attemptsTotal = games.reduce((sum, game) => {
        const correct = Math.max(Number(game.correct) || 0, 0);
        const wrong = Math.max(Number(game.wrong) || 0, 0);

        return sum + Math.max(Number(game.attempts) || 0, correct + wrong);
    }, 0);
    const accuracy = attemptsTotal ? Math.round((correctTotal / attemptsTotal) * 100) : 0;
    const maxLevel = games.reduce((level, game) => Math.max(level, Number(game.level) || 0), 0);
    const gameTimeMs = sessions.reduce((sum, session) => sum + Math.max(Number(session.responseTimeMs) || 0, 0), 0);
    const averageResponseMs = answeredSessions.length ? Math.round(gameTimeMs / answeredSessions.length) : 0;
    const platformTimeMs = Math.max(Number(platformTime.totalMs) || 0, gameTimeMs);
    const recentSessions = sessions.filter((session) => {
        const daysBetween = getDaysBetween(session.createdAt);
        return daysBetween !== null && daysBetween >= 0 && daysBetween <= 6;
    });
    const activeDays = new Set(recentSessions.map((session) => String(session.createdAt || "").slice(0, 10)).filter(Boolean)).size;
    const skillCount = games.reduce((counts, game) => {
        const skill = game.skill || "";

        if (skill) {
            counts[skill] = (counts[skill] || 0) + (game.interactions || 0);
        }

        return counts;
    }, {});
    const mostUsedSkill = Object.entries(skillCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
    const usageLabel = getUsageLabel(activeDays, recentSessions.length);
    const developmentSummary = getDevelopmentSummary({ games, completedGames, accuracy, activeDays });

    document.getElementById("attemptsMetric")?.replaceChildren(document.createTextNode(String(attemptsTotal)));
    document.getElementById("attemptsMetricText")?.replaceChildren(document.createTextNode(`${games.length} jogo(s) com registro de uso.`));
    document.getElementById("correctMetric")?.replaceChildren(document.createTextNode(String(correctTotal)));
    document.getElementById("wrongMetric")?.replaceChildren(document.createTextNode(String(wrongTotal)));
    document.getElementById("accuracyMetric")?.replaceChildren(document.createTextNode(`${accuracy}%`));
    document.getElementById("accuracyMetricText")?.replaceChildren(document.createTextNode(`Maior nivel: ${maxLevel || "aguardando"}.`));
    document.getElementById("platformTimeMetric")?.replaceChildren(document.createTextNode(formatDuration(platformTimeMs)));
    document.getElementById("platformTimeText")?.replaceChildren(document.createTextNode(`${Number(platformTime.visits) || 0} acesso(s) registrados.`));
    document.getElementById("answerTimeMetric")?.replaceChildren(document.createTextNode(formatDuration(gameTimeMs)));
    document.getElementById("answerTimeText")?.replaceChildren(document.createTextNode(`Media por resposta: ${formatDuration(averageResponseMs)}.`));
    document.getElementById("completedActivitiesMetric")?.replaceChildren(document.createTextNode(`${completedGames} de ${totalGames}`));
    document.getElementById("completedActivitiesText")?.replaceChildren(document.createTextNode(`${games.length} jogos com registro de uso.`));
    document.getElementById("usageFrequencyMetric")?.replaceChildren(document.createTextNode(usageLabel));
    document.getElementById("usageFrequencyText")?.replaceChildren(document.createTextNode(`${activeDays} dia(s) de uso recente.`));
    document.getElementById("developmentMetric")?.replaceChildren(document.createTextNode(developmentSummary.label));
    document.getElementById("developmentMetricText")?.replaceChildren(document.createTextNode(developmentSummary.text));
    document.getElementById("qualitativeDevelopmentText")?.replaceChildren(document.createTextNode(getQualitativeDevelopment({
        games,
        completedGames,
        accuracy,
        activeDays,
        mostUsedSkill
    })));

    renderDevelopmentAreas(games);
    updateProgressCountFromGames(completedGames);
};

updateReportFields(savedFormAnswers);
renderReportRecommendations(savedFormAnswers);
renderConsolidatedReport();

document.addEventListener("click", (event) => {
    const link = event.target instanceof Element ? event.target.closest("a[href]") : null;

    if (!(link instanceof HTMLAnchorElement)) {
        return;
    }

    const href = link.getAttribute("href") || "";
    const url = new URL(href, window.location.href);
    const hashView = url.hash.replace("#", "");
    const pathView = routeToView[normalizeRoutePath(url.pathname)];
    const viewName = availableViews.includes(hashView) ? hashView : pathView;

    if (!availableViews.includes(viewName)) {
        return;
    }

    event.preventDefault();
    goToPlatformView(viewName);
});

document.querySelectorAll('input[name="aluno_idade"]').forEach(setupAgeInput);

document.querySelectorAll(".platform-form").forEach((form) => {
    if (form.hasAttribute("data-local-form")) {
        fillFormWithSavedAnswers(form, savedFormAnswers);
    }

    applySavedAnswerView(form);

    form.addEventListener("submit", (event) => {
        const shouldSubmitToServer = form.method.toLowerCase() === "post" && form.action.includes("auth.php");

        localStorage.setItem(formStorageKey, JSON.stringify(collectFormAnswers(form)));

        if (shouldSubmitToServer) {
            return;
        }

        event.preventDefault();
        const currentAnswers = collectFormAnswers(form);
        updateReportFields(currentAnswers);
        renderReportRecommendations(currentAnswers);
        applySavedAnswerView(form);

        const status = form.querySelector(".form-status");

        if (status) {
            status.textContent = "Respostas salvas nesta plataforma.";
        }
    });
});
