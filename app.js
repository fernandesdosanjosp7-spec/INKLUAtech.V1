const activityTitle = document.getElementById("activityTitle");
const activityPanel = document.getElementById("activityPanel");
const completeActivity = document.getElementById("completeActivity");
const progressCount = document.getElementById("progressCount");
const gameCards = document.querySelectorAll("[data-activity]");

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
    formas: {
        title: "Cores e Formas",
        text: "Observe o padr&atilde;o: azul, verde, azul, verde. Qual cor vem agora?",
        choices: ["Amarelo", "Azul", "Rosa", "Roxo"]
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

    button?.addEventListener("click", () => {
        renderActivity(card.dataset.activity);
    });
});

const initialActivity = new URLSearchParams(window.location.search).get("start");

if (initialActivity && activityContent[initialActivity]) {
    renderActivity(initialActivity);
    document.querySelector(".activity-board")?.scrollIntoView({ behavior: "smooth", block: "start" });
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

activityPanel?.addEventListener("click", (event) => {
    if (!(event.target instanceof HTMLButtonElement)) {
        return;
    }

    const letter = event.target.dataset.letter;

    if (letter) {
        const display = document.getElementById("alphabetDisplay");

        activityPanel.querySelectorAll(".alphabet-letter").forEach((button) => {
            button.classList.remove("is-selected");
        });
        event.target.classList.add("is-selected");

        if (display) {
            display.textContent = letter;
        }

        speakLetter(letter);
        return;
    }

    const number = event.target.dataset.number;

    if (number) {
        const display = document.getElementById("numberDisplay");

        activityPanel.querySelectorAll(".number-button").forEach((button) => {
            button.classList.remove("is-selected");
        });
        event.target.classList.add("is-selected");

        if (display) {
            display.textContent = number;
        }

        speakNumber(number);
        return;
    }

    activityPanel.querySelectorAll("button").forEach((button) => {
        button.classList.remove("is-selected");
    });
    event.target.classList.add("is-selected");
});

completeActivity?.addEventListener("click", () => {
    completed += 1;

    if (progressCount) {
        progressCount.textContent = String(completed);
    }

    completeActivity.disabled = true;
    activityPanel.innerHTML = "<p>Atividade conclu&iacute;da. Escolha outro jogo para continuar aprendendo.</p>";
});
