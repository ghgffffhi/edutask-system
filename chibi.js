/* =========================================================
   chibi.js — Focus Buddy = evolving pet egg (🥚→🐉)
   Mirrors goalsState.petStage. Talks to user as พ่อ/แม่.
   Reacts to focus timer + task/goal events.
   ========================================================= */
(function(){
  // pet evolution chain (same as goals/battle pet line)
  const STAGES = [
    { emoji:'🥚', name:'ไข่น้อย' },
    { emoji:'🐣', name:'ลูกไก่' },
    { emoji:'🐱', name:'เจ้าเหมียว' },
    { emoji:'🦊', name:'จิ้งจอกน้อย' },
    { emoji:'🐉', name:'มังกรน้อย' }
  ];

  function petStage(){
    let gs = JSON.parse(localStorage.getItem("goalsState") || "{}");
    let st = gs.petStage || 0;
    return Math.max(0, Math.min(STAGES.length - 1, st));
  }

  function buildSVG(){
    let s = STAGES[petStage()];
    return `
    <div class="buddy-wrap" id="buddyWrap">
      <div class="buddy-emoji" id="buddyEmoji">${s.emoji}</div>
      <div class="buddy-shadow"></div>
      <div class="buddy-fx" id="buddyFx"></div>
    </div>
    <div class="chibi-speech" id="chibiSpeech"></div>`;
  }

  function mount(){
    let host = document.getElementById("chibiHost");
    if(!host) return;
    host.innerHTML = buildSVG();
    setChibiState("idle");
  }

  // dialogue — buddy calls the user พ่อ/แม่ (parent)
  const LINES = {
    idle:    ["พ่อแม่ พร้อมลุยรึยัง?", "หนูรออยู่นะ!", "วันนี้ตั้งใจไปด้วยกันนะ!", "พ่อแม่เก่งที่สุดเลย!"],
    working: ["พ่อแม่สู้ๆ นะ!", "หนูเชียร์อยู่!", "อีกนิดเดียวพ่อแม่!", "ตั้งใจจัง หนูภูมิใจ!", "หนูโตขึ้นเพราะพ่อแม่เลย!"],
    resting: ["พักก่อนนะพ่อแม่ Zzz", "หนูง่วงแล้ว...พักกัน", "พ่อแม่พักสายตาด้วยนะ"],
    success: ["เย้! พ่อแม่ทำได้!", "หนูดีใจจังเลย!", "พ่อแม่เก่งมากกก!", "หนูโตขึ้นอีกแล้ว ขอบคุณนะ!"]
  };

  let speechTimer = null, encourageTimer = null;

  window.setChibiState = function(state){
    let wrap = document.getElementById("buddyWrap");
    let speech = document.getElementById("chibiSpeech");
    let fx = document.getElementById("buddyFx");
    let emojiEl = document.getElementById("buddyEmoji");
    if(!wrap) return;

    // refresh evolution stage each state change
    if(emojiEl) emojiEl.textContent = STAGES[petStage()].emoji;

    wrap.classList.remove("b-idle","b-working","b-resting","b-success");
    wrap.classList.add("b-" + state);
    if(fx){
      fx.textContent = state === "resting" ? "💤" : (state === "success" ? "✨" : "");
    }

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

  window.chibiEncourage = function(){
    let speech = document.getElementById("chibiSpeech");
    let wrap = document.getElementById("buddyWrap");
    if(!speech || !wrap || !wrap.classList.contains("b-working")) return;
    let arr = LINES.working;
    speech.textContent = arr[Math.floor(Math.random()*arr.length)];
    speech.classList.add("show");
  };

  // event mapper used across the app
  window.chibiReact = function(event){
    let wrap = document.getElementById("buddyWrap");
    // refresh stage on any react (pet may have evolved)
    let emojiEl = document.getElementById("buddyEmoji");
    if(emojiEl) emojiEl.textContent = STAGES[petStage()].emoji;

    if(event === "focusStart"){
      setChibiState("working");
      clearInterval(encourageTimer);
      encourageTimer = setInterval(window.chibiEncourage, 12000);
    } else if(event === "focusPause" || event === "focusReset"){
      clearInterval(encourageTimer);
      setChibiState("idle");
    } else if(event === "focusRest"){
      clearInterval(encourageTimer);
      setChibiState("resting");
    } else if(event === "focusDone" || event === "taskDone" || event === "goal" || event === "levelUp" || event === "win"){
      clearInterval(encourageTimer);
      setChibiState("success");
      setTimeout(()=> setChibiState("idle"), 5000);
    } else if(event === "lose"){
      setChibiState("idle");
    }
  };

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
