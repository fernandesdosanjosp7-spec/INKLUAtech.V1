(function () {
    let speechQueue = [];
    let activeUtterance = null;
    let isSpeaking = false;
    let speechGeneration = 0;
    let lastPositivePhrase = "";
    let lastEncouragementPhrase = "";
    let successStreak = 0;

    const positivePhrases = {
        short: [
            "Muito bem!",
            "Voce acertou!",
            "Incrivel!",
            "Isso mesmo!",
            "Fantastico!",
            "Mandou bem!",
            "Perfeito!",
            "Que legal!",
            "Boa resposta!",
            "Certinho!",
            "Uau!",
            "Excelente!",
            "Muito bom!",
            "Show!",
            "Voce conseguiu!",
            "Belo trabalho!",
            "Que acerto bonito!",
            "Arrasou!",
            "Legal demais!",
            "Resposta certa!"
        ],
        medium: [
            "Parabens, continue assim!",
            "Voce esta indo muito bem!",
            "Excelente trabalho!",
            "Uau, voce conseguiu!",
            "Voce aprendeu rapidinho!",
            "Que orgulho!",
            "Voce brilhou nessa resposta!",
            "Voce pensou com calma e acertou!",
            "Seu esforco apareceu nessa resposta!",
            "Voce esta cada vez melhor!",
            "Gostei muito da sua atencao!",
            "Voce resolveu direitinho!",
            "Essa foi uma resposta muito boa!",
            "Continue com esse cuidado!",
            "Voce esta aprendendo com carinho!",
            "Sua concentracao ajudou muito!",
            "Voce fez uma otima escolha!",
            "Que bom ver voce acertando!",
            "Voce esta construindo seu aprendizado!",
            "Parabens pelo capricho!"
        ],
        excited: [
            "Seu raciocinio esta ficando cada vez melhor!",
            "Voce foi corajoso e conseguiu!",
            "Que resposta linda, voce esta evoluindo!",
            "Voce prestou atencao e brilhou!",
            "Olha so como voce esta aprendendo bem!",
            "Cada acerto mostra o quanto voce esta crescendo!",
            "Voce esta ficando craque nessa atividade!",
            "Que alegria, voce acertou mais uma!",
            "Voce esta avancando com muita dedicacao!",
            "Essa resposta mostrou muita inteligencia!",
            "Voce usou seu pensamento de um jeito especial!",
            "Parabens, sua aprendizagem esta florescendo!",
            "Voce esta superando desafios com calma!",
            "Que conquista boa, continue nesse caminho!",
            "Voce merece um grande parabens por essa resposta!"
        ]
    };

    const encouragementPhrases = [
        "Boa tentativa, vamos continuar!",
        "Continue tentando, voce consegue!",
        "Cada tentativa ajuda voce a aprender!",
        "Vamos juntos, voce esta evoluindo!",
        "Tudo bem, tente de novo com calma.",
        "Quase la, observe mais uma vez.",
        "Voce esta aprendendo, vamos tentar outra vez.",
        "Respire com calma, voce consegue.",
        "Errar tambem faz parte de aprender.",
        "Boa coragem, vamos seguir juntos.",
        "Tente olhar com bastante atencao.",
        "Voce pode tentar de novo.",
        "Estou com voce nessa tentativa.",
        "Vamos descobrir juntos a resposta.",
        "Seu esforco e muito importante.",
        "Continue, cada passo conta.",
        "Muito bem por tentar.",
        "Com calma, voce vai conseguir.",
        "Vamos praticar mais um pouquinho.",
        "Essa tentativa tambem ajudou voce."
    ];

    const normalizeVoiceText = (value) => String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    const scoreFemaleVoice = (voice) => {
        const text = normalizeVoiceText(`${voice.name} ${voice.voiceURI}`);
        const femaleNames = ["ana", "beatriz", "bruna", "camila", "carolina", "claudia", "francisca", "fernanda", "gabriela", "helena", "heloisa", "ines", "joana", "juliana", "leticia", "livia", "luciana", "maria", "manuela", "patricia", "raquel", "sandra", "teresa", "vitoria", "yara"];
        const maleNames = ["antonio", "bruno", "carlos", "daniel", "felipe", "joaquim", "jorge", "paulo", "ricardo", "thiago", "tiago"];
        let score = 0;

        if (voice.lang?.toLowerCase() === "pt-br") score += 60;
        if (voice.lang?.toLowerCase().startsWith("pt")) score += 35;
        if (femaleNames.some((name) => text.includes(name))) score += 500;
        if (maleNames.some((name) => text.includes(name))) score -= 1000;
        if (text.includes("female") || text.includes("feminina") || text.includes("mulher") || text.includes("woman")) score += 450;
        if (text.includes("male") || text.includes("masculina") || text.includes("homem") || text.includes("man")) score -= 1000;
        if (text.includes("suave") || text.includes("soft") || text.includes("doce")) score += 120;
        if (text.includes("natural") || text.includes("neural")) score += 80;

        return score;
    };

    const getFemaleVoice = () => {
        if (!("speechSynthesis" in window)) return null;

        const voices = window.speechSynthesis.getVoices();
        const portugueseVoices = voices.filter((voice) => voice.lang?.toLowerCase().startsWith("pt"));

        const knownFemaleVoice = [...portugueseVoices, ...voices]
            .filter((voice) => scoreFemaleVoice(voice) > 450)
            .sort((first, second) => scoreFemaleVoice(second) - scoreFemaleVoice(first))[0];

        if (knownFemaleVoice) {
            return knownFemaleVoice;
        }

        return [...portugueseVoices, ...voices]
            .sort((first, second) => scoreFemaleVoice(second) - scoreFemaleVoice(first))[0] || null;
    };

    const createUtterance = (text, options = {}) => {
        const utterance = new SpeechSynthesisUtterance(text);
        const voice = getFemaleVoice();

        utterance.lang = voice?.lang || "pt-BR";
        utterance.rate = options.rate ?? 0.82;
        utterance.pitch = options.pitch ?? 1.16;
        utterance.volume = options.volume ?? 1;

        if (voice) {
            utterance.voice = voice;
        }

        return utterance;
    };

    const finishActiveSpeech = () => {
        activeUtterance = null;
        isSpeaking = false;
        runSpeechQueue();
    };

    function runSpeechQueue() {
        if (isSpeaking || !speechQueue.length || !("speechSynthesis" in window)) {
            return;
        }

        const item = speechQueue.shift();
        const currentGeneration = speechGeneration;
        const utterance = createUtterance(item.text, item.options);

        activeUtterance = utterance;
        isSpeaking = true;

        utterance.onend = () => {
            if (currentGeneration !== speechGeneration) {
                return;
            }

            item.options.onEnd?.();
            finishActiveSpeech();
        };
        utterance.onerror = () => {
            if (currentGeneration !== speechGeneration) {
                return;
            }

            item.options.onEnd?.();
            finishActiveSpeech();
        };

        window.speechSynthesis.resume?.();
        window.speechSynthesis.speak(utterance);
    }

    const waitForVoices = (callback) => {
        if (!("speechSynthesis" in window) || window.speechSynthesis.getVoices().length > 0) {
            callback();
            return;
        }

        let didRun = false;
        const runOnce = () => {
            if (didRun) {
                return;
            }

            didRun = true;
            window.speechSynthesis.removeEventListener?.("voiceschanged", runOnce);
            callback();
        };

        window.speechSynthesis.addEventListener?.("voiceschanged", runOnce);
        window.setTimeout(runOnce, 600);
    };

    const stop = () => {
        speechGeneration += 1;
        speechQueue = [];
        activeUtterance = null;
        isSpeaking = false;

        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }
    };

    const speak = (text, options = {}) => {
        if (!("speechSynthesis" in window)) {
            window.setTimeout(() => options.onEnd?.(), 300);
            return;
        }

        if (options.interrupt) {
            stop();
        }

        const requestGeneration = speechGeneration;

        waitForVoices(() => {
            if (requestGeneration !== speechGeneration) {
                return;
            }

            speechQueue.push({ text, options });
            runSpeechQueue();
        });
    };

    const pickWithoutRepeat = (phrases, lastPhrase) => {
        const available = phrases.filter((phrase) => phrase !== lastPhrase);
        const source = available.length ? available : phrases;

        return source[Math.floor(Math.random() * source.length)] || phrases[0] || "";
    };

    const getPositivePhrase = () => {
        successStreak += 1;
        const pool = successStreak >= 4
            ? [...positivePhrases.medium, ...positivePhrases.excited]
            : successStreak >= 2
                ? [...positivePhrases.short, ...positivePhrases.medium]
                : [...positivePhrases.short, ...positivePhrases.medium.slice(0, 8)];
        const phrase = pickWithoutRepeat(pool, lastPositivePhrase);

        lastPositivePhrase = phrase;
        return phrase;
    };

    const getEncouragementPhrase = () => {
        successStreak = 0;
        const phrase = pickWithoutRepeat(encouragementPhrases, lastEncouragementPhrase);

        lastEncouragementPhrase = phrase;
        return phrase;
    };

    const respond = (isCorrect, options = {}) => {
        const phrase = isCorrect ? getPositivePhrase() : getEncouragementPhrase();
        const parts = [phrase, options.detail].filter(Boolean);
        const text = parts.join(" ");

        speak(text, {
            rate: options.rate ?? 0.86,
            pitch: options.pitch ?? 1.16,
            interrupt: options.interrupt,
            onEnd: options.onEnd
        });

        return phrase;
    };

    window.InkluaSpeech = {
        createUtterance,
        getFemaleVoice,
        speak,
        stop
    };

    window.InkluaFeedback = {
        getPositivePhrase,
        getEncouragementPhrase,
        respond,
        resetStreak: () => {
            successStreak = 0;
        }
    };
}());
