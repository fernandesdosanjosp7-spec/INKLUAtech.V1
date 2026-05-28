(function () {
    const normalizeVoiceText = (value) => String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    const scoreFemaleVoice = (voice) => {
        const text = normalizeVoiceText(`${voice.name} ${voice.voiceURI}`);
        const femaleNames = ["ana", "beatriz", "camila", "carolina", "francisca", "fernanda", "helena", "luciana", "maria", "patricia", "raquel", "vitoria"];
        const maleNames = ["antonio", "bruno", "carlos", "daniel", "felipe", "joaquim", "paulo", "ricardo", "thiago"];
        let score = 0;

        if (voice.lang?.toLowerCase() === "pt-br") score += 60;
        if (voice.lang?.toLowerCase().startsWith("pt")) score += 35;
        if (femaleNames.some((name) => text.includes(name))) score += 500;
        if (maleNames.some((name) => text.includes(name))) score -= 1000;
        if (text.includes("female") || text.includes("feminina") || text.includes("woman")) score += 450;
        if (text.includes("male") || text.includes("masculina") || text.includes("homem")) score -= 1000;
        if (text.includes("suave") || text.includes("soft") || text.includes("doce")) score += 120;
        if (text.includes("natural") || text.includes("neural")) score += 80;

        return score;
    };

    const getFemaleVoice = () => {
        if (!("speechSynthesis" in window)) return null;

        const voices = window.speechSynthesis.getVoices();
        const portugueseVoices = voices.filter((voice) => voice.lang?.toLowerCase().startsWith("pt"));

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

    const speak = (text, options = {}) => {
        if (!("speechSynthesis" in window)) {
            window.setTimeout(() => options.onEnd?.(), 300);
            return;
        }

        const speakNow = () => {
            const utterance = createUtterance(text, options);

            if (typeof options.onEnd === "function") {
                utterance.onend = options.onEnd;
                utterance.onerror = options.onEnd;
            }

            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        };

        if (window.speechSynthesis.getVoices().length > 0) {
            speakNow();
            return;
        }

        const previousVoiceHandler = window.speechSynthesis.onvoiceschanged;

        window.speechSynthesis.onvoiceschanged = () => {
            if (typeof previousVoiceHandler === "function") {
                previousVoiceHandler.call(window.speechSynthesis);
            }

            window.speechSynthesis.onvoiceschanged = previousVoiceHandler;
            speakNow();
        };

        window.setTimeout(speakNow, 450);
    };

    window.InkluaSpeech = {
        createUtterance,
        getFemaleVoice,
        speak
    };
}());
