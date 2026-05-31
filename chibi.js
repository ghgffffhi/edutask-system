/* =========================================================
   Chibi — anime-style focus buddy (SVG, no external assets)
   States: idle / working / resting / success / cheer
   ========================================================= */
(function(){
  const SVG = `
  <svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" class="chibi-svg" id="chibiSvg">
    <defs>
      <linearGradient id="hairGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#6d5bd0"/><stop offset="100%" stop-color="#a78bfa"/>
      </linearGradient>
      <linearGradient id="dressGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2dd4bf"/><stop offset="100%" stop-color="#3b82f6"/>
      </linearGradient>
      <radialGradient id="cheekGrad"><stop offset="0%" stop-color="#fda4af"/><stop offset="100%" stop-color="#fda4af" stop-opacity="0"/></radialGradient>
    </defs>

    <!-- floating shadow -->
    <ellipse id="chibiShadow" cx="100" cy="208" rx="42" ry="7" fill="#000" opacity="0.18"/>

    <g id="chibiBody">
      <!-- back hair -->
      <path d="M55 95 Q44 150 60 185 Q100 200 140 185 Q156 150 145 95 Z" fill="url(#hairGrad)"/>

      <!-- legs -->
      <rect x="86" y="170" width="11" height="26" rx="5" fill="#fcd9b8"/>
      <rect x="103" y="170" width="11" height="26" rx="5" fill="#fcd9b8"/>
      <ellipse cx="91" cy="198" rx="9" ry="6" fill="#5b6470"/>
      <ellipse cx="109" cy="198" rx="9" ry="6" fill="#5b6470"/>

      <!-- dress -->
      <path d="M72 120 Q100 110 128 120 L138 178 Q100 190 62 178 Z" fill="url(#dressGrad)"/>
      <path d="M72 120 Q100 110 128 120 L131 138 Q100 132 69 138 Z" fill="#fff" opacity="0.25"/>

      <!-- arms -->
      <g id="armLeft"><rect x="62" y="122" width="10" height="34" rx="5" fill="#fcd9b8"/></g>
      <g id="armRight"><rect x="128" y="122" width="10" height="34" rx="5" fill="#fcd9b8"/></g>

      <!-- head group -->
      <g id="chibiHead">
        <!-- neck -->
        <rect x="93" y="104" width="14" height="14" rx="6" fill="#fcd9b8"/>
        <!-- face -->
        <circle cx="100" cy="78" r="40" fill="#ffe3c7"/>
        <!-- cheeks -->
        <circle cx="78" cy="86" r="9" fill="url(#cheekGrad)"/>
        <circle cx="122" cy="86" r="9" fill="url(#cheekGrad)"/>
        <!-- front hair / bangs -->
        <path d="M60 78 Q58 38 100 36 Q142 38 140 78 Q138 60 120 56 Q126 70 116 72 Q112 56 100 56 Q88 56 84 72 Q74 70 80 56 Q62 60 60 78 Z" fill="url(#hairGrad)"/>
        <!-- side bangs -->
        <path d="M60 78 Q56 96 62 110 Q68 96 66 80 Z" fill="url(#hairGrad)"/>
        <path d="M140 78 Q144 96 138 110 Q132 96 134 80 Z" fill="url(#hairGrad)"/>

        <!-- eyes -->
        <g id="chibiEyes">
          <ellipse class="eye" cx="84" cy="84" rx="7" ry="9" fill="#3a2e4d"/>
          <ellipse class="eye" cx="116" cy="84" rx="7" ry="9" fill="#3a2e4d"/>
          <circle cx="86" cy="81" r="2.4" fill="#fff"/>
          <circle cx="118" cy="81" r="2.4" fill="#fff"/>
        </g>
        <!-- closed eyes (hidden by default) -->
        <g id="chibiEyesClosed" style="display:none">
          <path d="M77 84 Q84 90 91 84" stroke="#3a2e4d" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <path d="M109 84 Q116 90 123 84" stroke="#3a2e4d" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        </g>
        <!-- mouth -->
        <path id="chibiMouth" d="M94 98 Q100 103 106 98" stroke="#b5566b" stroke-width="2.2" fill="none" stroke-linecap="round"/>

        <!-- hair accessory -->
        <circle cx="64" cy="50" r="6" fill="#fbbf24"/>
        <circle cx="64" cy="50" r="2.5" fill="#fff" opacity="0.7"/>
      </g>
    </g>

    <!-- floating ZzZ for resting -->
    <g id="chibiZzz" style="display:none">
      <text x="146" y="56" font-size="14" fill="#a78bfa" font-weight="700">z</text>
      <text x="156" y="44" font-size="18" fill="#818cf8" font-weight="700">Z</text>
      <text x="168" y="34" font-size="13" fill="#c4b5fd" font-weight="700">z</text>
    </g>
    <!-- sparkles for success -->
    <g id="chibiSparkle" style="display:none">
      <text x="40" y="50" font-size="20">✨</text>
      <text x="148" y="70" font-size="18">⭐</text>
      <text x="150" y="150" font-size="16">✨</text>
    </g>
  </svg>`;

  function mount(){
    let host = document.getElementById("chibiHost");
    if(!host) return;
    host.innerHTML = SVG + `<div class="chibi-speech" id="chibiSpeech">มาตั้งใจกันเถอะ!</div>`;
    setChibiState("idle");
  }

  const LINES = {
    idle:    ["มาตั้งใจกันเถอะ!", "พร้อมลุยรึยัง?", "วันนี้สู้ๆ นะ!"],
    working: ["โฟกัส โฟกัส!", "เธอเก่งที่สุดเลย", "อีกนิดเดียว!", "ตั้งใจมากเลยนะ"],
    resting: ["พักสายตาแป๊บนะ...", "เก่งมากเลย พักก่อน", "Zzz... พักผ่อนนะ"],
    success: ["เย้! สำเร็จแล้ว!", "เก่งมากกก! 🎉", "ภูมิใจในตัวเธอนะ!"]
  };

  let speechTimer = null;
  window.setChibiState = function(state){
    let svg = document.getElementById("chibiSvg");
    let speech = document.getElementById("chibiSpeech");
    if(!svg) return;
    svg.classList.remove("c-idle","c-working","c-resting","c-success");
    svg.classList.add("c-" + state);

    let eyesOpen = document.getElementById("chibiEyes");
    let eyesClosed = document.getElementById("chibiEyesClosed");
    let mouth = document.getElementById("chibiMouth");
    let zzz = document.getElementById("chibiZzz");
    let sparkle = document.getElementById("chibiSparkle");

    zzz.style.display = state === "resting" ? "block" : "none";
    sparkle.style.display = state === "success" ? "block" : "none";

    if(state === "resting"){
      eyesOpen.style.display = "none"; eyesClosed.style.display = "block";
    } else {
      eyesOpen.style.display = "block"; eyesClosed.style.display = "none";
    }
    // mouth shape
    if(state === "success") mouth.setAttribute("d","M92 96 Q100 106 108 96");
    else if(state === "working") mouth.setAttribute("d","M95 99 Q100 102 105 99");
    else mouth.setAttribute("d","M94 98 Q100 103 106 98");

    // speech
    if(speech && LINES[state]){
      let arr = LINES[state];
      speech.textContent = arr[Math.floor(Math.random()*arr.length)];
      speech.classList.add("show");
      clearTimeout(speechTimer);
      if(state !== "working"){
        speechTimer = setTimeout(()=> speech.classList.remove("show"), 3500);
      }
    }
  };

  // rotate encouraging lines while working
  window.chibiEncourage = function(){
    let speech = document.getElementById("chibiSpeech");
    let svg = document.getElementById("chibiSvg");
    if(!speech || !svg || !svg.classList.contains("c-working")) return;
    let arr = LINES.working;
    speech.textContent = arr[Math.floor(Math.random()*arr.length)];
    speech.classList.add("show");
  };

  // event mapper used by the focus timer
  let encourageTimer = null;
  window.chibiReact = function(event){
    if(event === "focusStart"){
      setChibiState("working");
      clearInterval(encourageTimer);
      encourageTimer = setInterval(window.chibiEncourage, 12000);
    } else if(event === "focusPause"){
      clearInterval(encourageTimer);
      setChibiState("idle");
    } else if(event === "focusReset"){
      clearInterval(encourageTimer);
      setChibiState("idle");
    } else if(event === "focusRest"){
      clearInterval(encourageTimer);
      setChibiState("resting");
    } else if(event === "focusDone"){
      clearInterval(encourageTimer);
      setChibiState("success");
      setTimeout(()=>{ setChibiState("idle"); }, 6000);
    }
  };

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
