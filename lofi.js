/* =========================================================
   lofi.js — chill lo-fi background music (Web Audio API)
   No external files: generates a soft looping chord + beat.
   Floating player widget, remembers on/off + volume.
   ========================================================= */
(function(){
  let ctx = null, master = null, playing = false, loopTimer = null, step = 0;
  let vol = parseFloat(localStorage.getItem("lofiVol") || "0.35");

  // a gentle lo-fi chord progression (Cmaj7 - Am7 - Fmaj7 - G7), low + mellow
  const PROG = [
    [261.63, 329.63, 392.00, 493.88],  // Cmaj7
    [220.00, 261.63, 329.63, 392.00],  // Am7
    [174.61, 220.00, 261.63, 349.23],  // Fmaj7
    [196.00, 246.94, 293.66, 349.23],  // G7
  ];

  function ensure(){
    if(ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = vol;
    // soft low-pass for that warm lo-fi muffle
    let lp = ctx.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 1800;
    master.connect(lp); lp.connect(ctx.destination);
  }

  function note(freq, t, dur, type, gain){
    let o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || "sine"; o.frequency.value = freq;
    o.connect(g); g.connect(master);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t); o.stop(t + dur);
  }

  // soft kick + hat for a lazy beat
  function drum(t, kick){
    let o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(master);
    if(kick){
      o.frequency.setValueAtTime(140, t);
      o.frequency.exponentialRampToValueAtTime(45, t + 0.14);
      g.gain.setValueAtTime(0.32, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      o.start(t); o.stop(t + 0.2);
    } else {
      // hat = filtered noise burst
      let buf = ctx.createBuffer(1, ctx.sampleRate*0.05, ctx.sampleRate);
      let d = buf.getChannelData(0);
      for(let i=0;i<d.length;i++) d[i] = (Math.random()*2-1)*0.5;
      let src = ctx.createBufferSource(); src.buffer = buf;
      let hp = ctx.createBiquadFilter(); hp.type="highpass"; hp.frequency.value=7000;
      let hg = ctx.createGain(); hg.gain.value = 0.08;
      src.connect(hp); hp.connect(hg); hg.connect(master);
      src.start(t); src.stop(t + 0.05);
    }
  }

  // schedule one bar (~2s) of the current chord
  function bar(){
    if(!playing) return;
    let t = ctx.currentTime + 0.05;
    let chord = PROG[step % PROG.length];
    // pad chord
    chord.forEach((f,i)=> note(f, t, 1.9, "sine", 0.05));
    // soft bass on root
    note(chord[0]/2, t, 1.8, "triangle", 0.09);
    // lazy beat: kick on 1 & 3, hats on offbeats
    drum(t, true);
    drum(t + 1.0, true);
    drum(t + 0.5, false);
    drum(t + 1.5, false);
    // gentle melodic blip
    if(step % 2 === 0){
      let mel = chord[2 + (step%2)] * 2;
      note(mel, t + 0.5, 0.4, "sine", 0.04);
      note(chord[1]*2, t + 1.25, 0.4, "sine", 0.035);
    }
    step++;
    loopTimer = setTimeout(bar, 2000);
  }

  function play(){
    ensure();
    playing = true;
    localStorage.setItem("lofiOn", "true");
    render();
    // AudioContext.resume() is async — wait until it's actually running
    // before scheduling notes, otherwise nothing is audible.
    if(ctx.state === "suspended"){
      ctx.resume().then(()=>{ if(playing) bar(); });
    } else {
      bar();
    }
  }
  function pause(){
    playing = false;
    localStorage.setItem("lofiOn", "false");
    clearTimeout(loopTimer);
    render();
  }
  window.lofiToggle = function(){ playing ? pause() : play(); };
  window.lofiSetVol = function(v){
    vol = parseFloat(v);
    localStorage.setItem("lofiVol", vol);
    if(master) master.gain.value = vol;
  };

  function render(){
    let p = document.getElementById("lofiPlayer");
    let btn = document.getElementById("lofiBtn");
    if(!p) return;
    p.classList.toggle("playing", playing);
    if(btn) btn.textContent = playing ? "⏸" : "▶";
  }

  function mount(){
    if(document.getElementById("lofiPlayer")) return;
    let el = document.createElement("div");
    el.className = "lofi-player";
    el.id = "lofiPlayer";
    el.innerHTML = `
      <button class="lofi-btn" id="lofiBtn" onclick="lofiToggle()" title="เปิด/ปิดเพลง">▶</button>
      <div class="lofi-bars"><span></span><span></span><span></span><span></span></div>
      <div class="lofi-meta">
        <span class="lofi-title">🎧 Lo-fi Study</span>
        <span class="lofi-sub">chill beats เพื่อโฟกัส</span>
      </div>
      <input class="lofi-vol" type="range" min="0" max="0.7" step="0.05" value="${vol}"
             oninput="lofiSetVol(this.value)" title="ระดับเสียง">
    `;
    document.body.appendChild(el);
    playing = false;
    render();

    // If music was on when leaving the previous page, resume it on the very
    // next user interaction anywhere (browsers block autoplay without a gesture).
    if(localStorage.getItem("lofiOn") === "true"){
      // show the "playing" look right away so it feels continuous
      let p = document.getElementById("lofiPlayer");
      if(p) p.classList.add("playing");
      let btn = document.getElementById("lofiBtn");
      if(btn) btn.textContent = "⏸";
      let resumed = false;
      let resume = (ev)=>{
        if(resumed) return;
        // if the user clicked the lofi button itself, let lofiToggle handle it
        if(ev && ev.target && ev.target.closest && ev.target.closest("#lofiPlayer")) return;
        resumed = true;
        if(!playing) play();
        window.removeEventListener("pointerdown", resume);
        window.removeEventListener("keydown", resume);
      };
      window.addEventListener("pointerdown", resume);
      window.addEventListener("keydown", resume);
    }
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
