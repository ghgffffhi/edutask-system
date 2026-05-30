if(localStorage.getItem("loggedIn") !== "true"){
    window.location.href = "login.html";
}

// ===== Pet Stages =====
const PET_STAGES = [
    { emoji: '🥚', name: 'ไข่ปริศนา',      minStreak: 0,  nextAt: 3  },
    { emoji: '🐣', name: 'ลูกไก่น้อย',    minStreak: 3,  nextAt: 7  },
    { emoji: '🐱', name: 'แมวน้อยจอมซน',  minStreak: 7,  nextAt: 14 },
    { emoji: '🦊', name: 'จิ้งจอกจอมเก่ง', minStreak: 14, nextAt: 30 },
    { emoji: '🐉', name: 'มังกรในตำนาน',   minStreak: 30, nextAt: Infinity }
];

// ===== State =====
let state = JSON.parse(localStorage.getItem("goalsState")) || {
    goals: [],           // today's goals [{text, done, id}]
    streak: 0,
    xp: 0,
    lastDate: "",        // last date goals were set
    history: [],         // [{date, success}] last 7 days
    petStage: 0,
    todayXP: 0
};

// ===== Init =====
function init(){
    checkNewDay();
    renderDate();
    renderGoals();
    renderPet();
    renderStats();
    renderHistory();
}

// ===== Check New Day =====
function checkNewDay(){
    let today = getTodayStr();
    if(state.lastDate !== today){
        // It's a new day! Check if yesterday was completed
        if(state.lastDate !== ""){
            let yesterday = state.goals;
            let allDone = yesterday.length > 0 && yesterday.every(g => g.done);

            // Add to history
            state.history.push({ date: state.lastDate, success: allDone });
            if(state.history.length > 7) state.history.shift();

            if(allDone){
                state.streak += 1;
                // Check evolution
                checkEvolution(true);
            } else if(yesterday.length > 0) {
                state.streak = 0;
            }
        }
        // Reset for today
        state.goals = [];
        state.lastDate = today;
        state.todayXP = 0;
        save();
    }
}

// ===== Check Evolution =====
function checkEvolution(notify){
    let newStage = 0;
    for(let i = PET_STAGES.length - 1; i >= 0; i--){
        if(state.streak >= PET_STAGES[i].minStreak){
            newStage = i;
            break;
        }
    }
    if(newStage > state.petStage && notify){
        state.petStage = newStage;
        save();
        showLevelUp(newStage);
    } else {
        state.petStage = newStage;
    }
}

// ===== Add Goal =====
function addGoal(){
    let input = document.getElementById("goalInput");
    let text = input.value.trim();
    if(text === "") return;

    state.goals.push({ text, done: false, id: Date.now() });
    input.value = "";
    save();
    renderGoals();
    renderPet();
    renderStats();
    showToast("🎯 เพิ่มเป้าหมายแล้ว!");
}

// ===== Toggle Goal =====
function toggleGoal(id){
    let goal = state.goals.find(g => g.id === id);
    if(!goal) return;

    goal.done = !goal.done;

    if(goal.done){
        state.xp += 10;
        state.todayXP += 10;
        showToast("⚡ +10 XP!");
    } else {
        state.xp = Math.max(0, state.xp - 10);
        state.todayXP = Math.max(0, state.todayXP - 10);
    }

    save();
    renderGoals();
    renderPet();
    renderStats();
    checkAllDone();
}

// ===== Delete Goal =====
function deleteGoal(id){
    let goal = state.goals.find(g => g.id === id);
    if(goal && goal.done){
        state.xp = Math.max(0, state.xp - 10);
        state.todayXP = Math.max(0, state.todayXP - 10);
    }
    state.goals = state.goals.filter(g => g.id !== id);
    save();
    renderGoals();
    renderPet();
    renderStats();
    showToast("🗑️ ลบเป้าหมายแล้ว");
}

// ===== Check All Done =====
function checkAllDone(){
    let banner = document.getElementById("allDoneBanner");
    if(state.goals.length > 0 && state.goals.every(g => g.done)){
        banner.classList.add("show");
        document.getElementById("allDoneXP").textContent = `+${state.todayXP} XP`;
    } else {
        banner.classList.remove("show");
    }
}

// ===== Render Goals =====
function renderGoals(){
    let list    = document.getElementById("goalsList");
    let empty   = document.getElementById("emptyState");
    let total   = state.goals.length;
    let done    = state.goals.filter(g => g.done).length;
    let pct     = total === 0 ? 0 : Math.round((done / total) * 100);

    document.getElementById("goalsProgressText").textContent = `${done}/${total} เสร็จแล้ว`;
    document.getElementById("goalsProgressBar").style.width = pct + "%";

    list.innerHTML = "";

    if(total === 0){
        empty.classList.add("show");
        return;
    }
    empty.classList.remove("show");

    state.goals.forEach(goal => {
        let li = document.createElement("li");
        li.className = "goal-item" + (goal.done ? " done" : "");
        li.innerHTML = `
            <div class="goal-check ${goal.done ? 'checked' : ''}" onclick="toggleGoal(${goal.id})">
                ${goal.done ? "✓" : ""}
            </div>
            <span class="goal-text ${goal.done ? 'done' : ''}">${goal.text}</span>
            <span class="goal-xp-badge">+10 XP</span>
            <button class="goal-del" onclick="deleteGoal(${goal.id})">✕</button>
        `;
        list.appendChild(li);
    });

    checkAllDone();
}

// ===== Render Pet =====
function renderPet(){
    checkEvolution(false);

    let stage   = PET_STAGES[state.petStage];
    let total   = state.goals.length;
    let done    = state.goals.filter(g => g.done).length;

    let emojiEl = document.getElementById("petEmoji");
    let glowEl  = document.getElementById("petGlow");
    let moodEl  = document.getElementById("petMoodText");
    let labelEl = document.getElementById("petStageLabel");

    // Set emoji
    emojiEl.textContent = stage.emoji;
    labelEl.textContent = stage.name;

    // Mood
    emojiEl.className = "pet-emoji";
    glowEl.className  = "pet-glow";

    if(total === 0){
        emojiEl.classList.add("sleeping");
        moodEl.textContent = "💤 ตั้งเป้าหมายเพื่อปลุกเค้าขึ้นมาสิ!";
    } else if(done === total){
        emojiEl.classList.add("happy");
        glowEl.classList.add("happy");
        moodEl.textContent = "🎉 ทำสำเร็จทุกอย่างแล้ว เก่งมาก!";
        if(state.petStage === 4) glowEl.classList.add("dragon");
    } else if(done > 0){
        moodEl.textContent = `💪 ทำต่อเลย! เหลืออีก ${total - done} อย่าง`;
    } else {
        emojiEl.classList.add("sad");
        moodEl.textContent = "🥺 ยังไม่ได้ทำเลยนะ... สู้ๆ!";
    }

    // Evolution progress bar
    renderEvoProgress();
    renderEvoParts();
}

// ===== Render Evolution =====
function renderEvoProgress(){
    let stage = PET_STAGES[state.petStage];
    let evoFill  = document.getElementById("evoFill");
    let evoLabel = document.getElementById("evoLabel");
    let evoDays  = document.getElementById("evoDays");

    if(state.petStage >= PET_STAGES.length - 1){
        evoFill.style.width = "100%";
        evoLabel.textContent = "🐉 MAX LEVEL!";
        evoDays.textContent  = "เธอสุดยอดมากกก!";
        return;
    }

    let next    = PET_STAGES[state.petStage + 1];
    let from    = stage.minStreak;
    let to      = stage.nextAt;
    let pct     = Math.min(100, ((state.streak - from) / (to - from)) * 100);
    let remain  = to - state.streak;

    evoFill.style.width  = pct + "%";
    evoLabel.textContent = `${stage.emoji} → ${next.emoji}`;
    evoDays.textContent  = remain > 0 ? `อีก ${remain} วัน` : "พร้อมวิวัฒนาการแล้ว! 🌟";
}

function renderEvoParts(){
    for(let i = 0; i < 5; i++){
        let el = document.getElementById("step" + i);
        if(!el) continue;
        el.classList.remove("active", "done");
        if(i === state.petStage)       el.classList.add("active");
        else if(i < state.petStage)    el.classList.add("done");
    }
}

// ===== Render Stats =====
function renderStats(){
    document.getElementById("streakCount").textContent = state.streak;
    document.getElementById("xpCount").textContent     = state.xp;
    document.getElementById("todayXP").textContent     = `+${state.todayXP} XP วันนี้`;
}

// ===== Render Date =====
function renderDate(){
    let now  = new Date();
    let days = ["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัส","ศุกร์","เสาร์"];
    let months = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
    document.getElementById("dateToday").textContent =
        `วัน${days[now.getDay()]}ที่ ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear() + 543}`;
}

// ===== Render History =====
function renderHistory(){
    let row     = document.getElementById("historyRow");
    let today   = getTodayStr();
    let days    = ["อา","จ","อ","พ","พฤ","ศ","ส"];
    row.innerHTML = "";

    // Build last 7 days
    for(let i = 6; i >= 0; i--){
        let d       = new Date();
        d.setDate(d.getDate() - i);
        let dStr    = getTodayStr(d);
        let isToday = dStr === today;
        let hist    = state.history.find(h => h.date === dStr);

        let dotClass = "history-dot";
        let icon     = "○";
        if(isToday)        { dotClass += " today"; icon = "📍"; }
        else if(hist?.success) { dotClass += " success"; icon = "✓"; }
        else if(hist)      { dotClass += " fail";    icon = "✕"; }

        let div = document.createElement("div");
        div.className = "history-day";
        div.innerHTML = `
            <div class="${dotClass}">${icon}</div>
            <div class="history-label">${days[d.getDay()]}</div>
        `;
        row.appendChild(div);
    }
}

// ===== Level Up Modal =====
function showLevelUp(stageIdx){
    let stage = PET_STAGES[stageIdx];
    document.getElementById("levelupPet").textContent  = stage.emoji;
    document.getElementById("levelupSub").textContent  = `กลายเป็น ${stage.name} แล้ว!`;
    document.getElementById("levelupOverlay").classList.add("show");
    showToast(`🌟 วิวัฒนาการ! กลายเป็น ${stage.name}`);
}

function closeLevelUp(){
    document.getElementById("levelupOverlay").classList.remove("show");
}

// ===== Helpers =====
function getTodayStr(date){
    let d = date || new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function save(){
    localStorage.setItem("goalsState", JSON.stringify(state));
}

function showToast(msg){
    let t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 3000);
}

function toggleTheme(){
    document.body.classList.toggle("light-mode");
    document.getElementById("themeToggle").innerHTML =
        document.body.classList.contains("light-mode") ? "☀️" : "🌙";
}

function logout(){
    localStorage.removeItem("loggedIn");
    window.location.href = "login.html";
}

// ===== Start =====
init();
