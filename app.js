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
    }
};

let completed = 0;

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

    const utterance = new SpeechSynthesisUtterance(`Letra ${letter}`);
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
