// ===== Sound Effects (Web Audio API, no files) =====
let soundEnabled = localStorage.getItem("soundEnabled") !== "false";
let audioCtx = null;

function getCtx(){
    if(!audioCtx){
        try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
        catch(e){ return null; }
    }
    return audioCtx;
}

function playTone(freq, start, dur, type, vol){
    let ctx = getCtx();
    if(!ctx) return;
    let osc = ctx.createOscillator();
    let gain = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(ctx.destination);
    let t = ctx.currentTime + start;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol || 0.15, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.start(t);
    osc.stop(t + dur);
}

function playSound(type){
    if(!soundEnabled) return;
    if(getCtx() && audioCtx.state === "suspended") audioCtx.resume();

    switch(type){
        case "complete":   // happy two-note
            playTone(660, 0, 0.12, "sine", 0.16);
            playTone(880, 0.08, 0.18, "sine", 0.16);
            break;
        case "click":
            playTone(440, 0, 0.06, "triangle", 0.1);
            break;
        case "levelup":    // rising arpeggio
            playTone(523, 0,    0.14, "sine", 0.16);
            playTone(659, 0.12, 0.14, "sine", 0.16);
            playTone(784, 0.24, 0.14, "sine", 0.16);
            playTone(1047,0.36, 0.30, "sine", 0.18);
            break;
        case "coin":
            playTone(988, 0, 0.08, "square", 0.08);
            playTone(1319,0.06, 0.14, "square", 0.08);
            break;
        case "error":
            playTone(180, 0, 0.2, "sawtooth", 0.1);
            break;
    }
}

function setSoundEnabled(on){
    soundEnabled = on;
    localStorage.setItem("soundEnabled", on ? "true" : "false");
}
