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

// ===== Difficulty =====
const DIFFICULTY = {
    easy:   { label: '🟢 ง่าย',  xp: 5,  coins: 2,  color: '#22c55e' },
    medium: { label: '🟡 กลาง',  xp: 10, coins: 5,  color: '#f59e0b' },
    hard:   { label: '🔴 ยาก',   xp: 20, coins: 10, color: '#ef4444' }
};

// ===== Shop Items =====
const SHOP = [
    { id: 'bow',     emoji: '🎀', name: 'โบว์น่ารัก',     price: 30,  type: 'accessory' },
    { id: 'glasses', emoji: '🕶️', name: 'แว่นกันแดด',     price: 50,  type: 'accessory' },
    { id: 'flower',  emoji: '🌸', name: 'ดอกซากุระ',      price: 70,  type: 'accessory' },
    { id: 'hat',     emoji: '🎩', name: 'หมวกสุภาพบุรุษ', price: 90,  type: 'accessory' },
    { id: 'crown',   emoji: '👑', name: 'มงกุฎทองคำ',     price: 150, type: 'accessory' },
    { id: 'halo',    emoji: '😇', name: 'รัศมีนางฟ้า',     price: 200, type: 'accessory' },
    { id: 'freeze',  emoji: '❄️', name: 'Streak Freeze',  price: 80,  type: 'freeze' }
];

// ===== State =====
let state = JSON.parse(localStorage.getItem("goalsState")) || {
    goals: [], streak: 0, xp: 0, coins: 0, lastDate: "",
    history: [], petStage: 0, todayXP: 0, todayCoins: 0,
    inventory: [], equipped: null, freezeCount: 0
};

// migrate old saves
if(state.coins === undefined)       state.coins = 0;
if(state.todayCoins === undefined)  state.todayCoins = 0;
if(!state.inventory)                state.inventory = [];
if(state.equipped === undefined)    state.equipped = null;
if(state.freezeCount === undefined) state.freezeCount = 0;
if(state.totalGoalsDone === undefined) state.totalGoalsDone = 0;

// ===== Achievements =====
const ACHIEVEMENTS = [
    { id: 'first',   emoji: '🌱', name: 'ก้าวแรก',      desc: 'ทำเป้าหมายแรกสำเร็จ',  check: s => s.totalGoalsDone >= 1 },
    { id: 'streak3', emoji: '🔥', name: 'ไฟเริ่มติด',    desc: 'streak 3 วัน',         check: s => s.streak >= 3 },
    { id: 'streak7', emoji: '⚡', name: 'ขยันสุดๆ',      desc: 'streak 7 วัน',         check: s => s.streak >= 7 },
    { id: 'streak14',emoji: '💎', name: 'เหล็กกล้า',     desc: 'streak 14 วัน',        check: s => s.streak >= 14 },
    { id: 'streak30',emoji: '👑', name: 'ตำนาน',         desc: 'streak 30 วัน',        check: s => s.streak >= 30 },
    { id: 'dragon',  emoji: '🐉', name: 'ผู้เลี้ยงมังกร', desc: 'ปลดล็อกมังกร',         check: s => s.petStage >= 4 },
    { id: 'hunter',  emoji: '🎯', name: 'นักล่าเป้าหมาย', desc: 'ทำเป้าหมายครบ 50 อัน', check: s => s.totalGoalsDone >= 50 },
    { id: 'rich',    emoji: '✨', name: 'เศรษฐี XP',      desc: 'สะสม 500 XP',          check: s => s.xp >= 500 }
];

let currentDifficulty = "medium";

// ===== Init =====
function init(){
    checkNewDay();
    renderDate();
    renderGoals();
    renderPet();
    renderStats();
    renderHistory();
    renderDifficultyBtns();
    renderAchievements();
}

// ===== New Day Check =====
function checkNewDay(){
    let today = getTodayStr();
    if(state.lastDate !== today){
        if(state.lastDate !== ""){
            let allDone = state.goals.length > 0 && state.goals.every(g => g.done);
            state.history.push({ date: state.lastDate, success: allDone });
            if(state.history.length > 7) state.history.shift();

            if(allDone){
                state.streak += 1;
                checkEvolution(true);
            } else if(state.goals.length > 0){
                if(state.freezeCount > 0){
                    state.freezeCount -= 1;
                    showToast("❄️ ใช้ Streak Freeze! streak ปลอดภัย");
                } else {
                    state.streak = 0;
                }
            }
        }
        state.goals = [];
        state.lastDate = today;
        state.todayXP = 0;
        state.todayCoins = 0;
        save();
    }
}

// ===== Evolution =====
function checkEvolution(notify){
    let newStage = 0;
    for(let i = PET_STAGES.length - 1; i >= 0; i--){
        if(state.streak >= PET_STAGES[i].minStreak){ newStage = i; break; }
    }
    if(newStage > state.petStage && notify){
        state.petStage = newStage;
        save();
        showLevelUp(newStage);
    } else {
        state.petStage = newStage;
    }
}

// ===== Difficulty Buttons =====
function renderDifficultyBtns(){
    let wrap = document.getElementById("difficultyBtns");
    wrap.innerHTML = "";
    Object.keys(DIFFICULTY).forEach(key => {
        let d = DIFFICULTY[key];
        let btn = document.createElement("button");
        btn.className = "diff-btn" + (key === currentDifficulty ? " active" : "");
        btn.style.setProperty("--diff-color", d.color);
        btn.innerHTML = `${d.label} <small>+${d.xp}xp</small>`;
        btn.onclick = () => { currentDifficulty = key; renderDifficultyBtns(); };
        wrap.appendChild(btn);
    });
}

// ===== Add Goal =====
function addGoal(){
    let input = document.getElementById("goalInput");
    let text = input.value.trim();
    if(text === "") return;
    let d = DIFFICULTY[currentDifficulty];
    state.goals.push({
        text, done: false, id: Date.now(),
        difficulty: currentDifficulty, xp: d.xp, coins: d.coins
    });
    input.value = "";
    save();
    renderGoals(); renderPet(); renderStats();
    showToast("🎯 เพิ่มเป้าหมายแล้ว!");
}

// ===== Toggle Goal =====
function toggleGoal(id){
    let goal = state.goals.find(g => g.id === id);
    if(!goal) return;
    goal.done = !goal.done;
    if(goal.done){
        state.xp += goal.xp;        state.todayXP += goal.xp;
        state.coins += goal.coins;  state.todayCoins += goal.coins;
        state.totalGoalsDone += 1;
        showToast(`⚡ +${goal.xp} XP  🪙 +${goal.coins}`);
        if(typeof playSound === "function") playSound("coin");
    } else {
        state.xp = Math.max(0, state.xp - goal.xp);
        state.todayXP = Math.max(0, state.todayXP - goal.xp);
        state.coins = Math.max(0, state.coins - goal.coins);
        state.todayCoins = Math.max(0, state.todayCoins - goal.coins);
    }
    save();
    renderGoals(); renderPet(); renderStats(); checkAllDone();
    renderAchievements();
}

// ===== Delete Goal =====
function deleteGoal(id){
    let goal = state.goals.find(g => g.id === id);
    if(goal && goal.done){
        state.xp = Math.max(0, state.xp - goal.xp);
        state.todayXP = Math.max(0, state.todayXP - goal.xp);
        state.coins = Math.max(0, state.coins - goal.coins);
        state.todayCoins = Math.max(0, state.todayCoins - goal.coins);
    }
    state.goals = state.goals.filter(g => g.id !== id);
    save();
    renderGoals(); renderPet(); renderStats();
    showToast("🗑️ ลบเป้าหมายแล้ว");
}

// ===== All Done =====
function checkAllDone(){
    let banner = document.getElementById("allDoneBanner");
    let allDone = state.goals.length > 0 && state.goals.every(g => g.done);
    if(allDone){
        if(!banner.classList.contains("show") && typeof fireConfetti === "function") fireConfetti();
        banner.classList.add("show");
        document.getElementById("allDoneXP").textContent = `+${state.todayXP} XP`;
    } else {
        banner.classList.remove("show");
    }
}

// ===== Achievements =====
function renderAchievements(){
    let grid = document.getElementById("achievementsGrid");
    if(!grid) return;
    grid.innerHTML = "";
    ACHIEVEMENTS.forEach(a => {
        let unlocked = a.check(state);
        let div = document.createElement("div");
        div.className = "ach-item" + (unlocked ? " unlocked" : "");
        div.innerHTML = `
            <div class="ach-emoji">${unlocked ? a.emoji : "🔒"}</div>
            <div class="ach-name">${a.name}</div>
            <div class="ach-desc">${a.desc}</div>
        `;
        grid.appendChild(div);
    });
}

// ===== Render Goals =====
function renderGoals(){
    let list  = document.getElementById("goalsList");
    let empty = document.getElementById("emptyState");
    let total = state.goals.length;
    let done  = state.goals.filter(g => g.done).length;
    let pct   = total === 0 ? 0 : Math.round((done / total) * 100);

    document.getElementById("goalsProgressText").textContent = `${done}/${total} เสร็จแล้ว`;
    document.getElementById("goalsProgressBar").style.width = pct + "%";

    list.innerHTML = "";
    if(total === 0){ empty.classList.add("show"); return; }
    empty.classList.remove("show");

    state.goals.forEach(goal => {
        let d = DIFFICULTY[goal.difficulty] || DIFFICULTY.medium;
        let li = document.createElement("li");
        li.className = "goal-item" + (goal.done ? " done" : "");
        li.style.setProperty("--diff-color", d.color);
        li.innerHTML = `
            <div class="goal-check ${goal.done ? 'checked' : ''}" onclick="toggleGoal(${goal.id})">
                ${goal.done ? "✓" : ""}
            </div>
            <span class="goal-text ${goal.done ? 'done' : ''}">${goal.text}</span>
            <span class="goal-diff-dot" title="${d.label}"></span>
            <span class="goal-xp-badge">+${goal.xp} XP</span>
            <button class="goal-del" onclick="deleteGoal(${goal.id})">✕</button>
        `;
        list.appendChild(li);
    });
    checkAllDone();
}

// ===== Render Pet =====
function renderPet(){
    checkEvolution(false);
    let stage = PET_STAGES[state.petStage];
    let total = state.goals.length;
    let done  = state.goals.filter(g => g.done).length;

    let emojiEl = document.getElementById("petEmoji");
    let glowEl  = document.getElementById("petGlow");
    let moodEl  = document.getElementById("petMoodText");
    let labelEl = document.getElementById("petStageLabel");
    let accEl   = document.getElementById("petAccessory");

    emojiEl.textContent = stage.emoji;
    labelEl.textContent = stage.name;

    if(state.equipped){
        let item = SHOP.find(s => s.id === state.equipped);
        accEl.textContent = item ? item.emoji : "";
        accEl.style.display = item ? "block" : "none";
    } else {
        accEl.style.display = "none";
    }

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

    renderEvoProgress();
    renderEvoParts();
}

// ===== Evolution UI =====
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
    let next   = PET_STAGES[state.petStage + 1];
    let from   = stage.minStreak;
    let to     = stage.nextAt;
    let pct    = Math.min(100, ((state.streak - from) / (to - from)) * 100);
    let remain = to - state.streak;
    evoFill.style.width  = pct + "%";
    evoLabel.textContent = `${stage.emoji} → ${next.emoji}`;
    evoDays.textContent  = remain > 0 ? `อีก ${remain} วัน` : "พร้อมวิวัฒนาการ! 🌟";
}

function renderEvoParts(){
    for(let i = 0; i < 5; i++){
        let el = document.getElementById("step" + i);
        if(!el) continue;
        el.classList.remove("active", "done");
        if(i === state.petStage)    el.classList.add("active");
        else if(i < state.petStage) el.classList.add("done");
    }
}

// ===== Stats =====
function renderStats(){
    document.getElementById("streakCount").textContent = state.streak;
    document.getElementById("xpCount").textContent     = state.xp;
    document.getElementById("coinCount").textContent   = state.coins;
    document.getElementById("todayXP").textContent     = `+${state.todayXP} XP วันนี้`;
    let fb = document.getElementById("freezeBadge");
    if(fb){
        if(state.freezeCount > 0){
            fb.style.display = "inline-flex";
            fb.textContent = `❄️ ${state.freezeCount}`;
        } else { fb.style.display = "none"; }
    }
}

// ===== Date =====
function renderDate(){
    let now    = new Date();
    let days   = ["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัส","ศุกร์","เสาร์"];
    let months = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
    document.getElementById("dateToday").textContent =
        `วัน${days[now.getDay()]}ที่ ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()+543}`;
}

// ===== History =====
function renderHistory(){
    let row   = document.getElementById("historyRow");
    let today = getTodayStr();
    let days  = ["อา","จ","อ","พ","พฤ","ศ","ส"];
    row.innerHTML = "";
    for(let i = 6; i >= 0; i--){
        let d = new Date(); d.setDate(d.getDate() - i);
        let dStr    = getTodayStr(d);
        let isToday = dStr === today;
        let hist    = state.history.find(h => h.date === dStr);
        let cls = "history-dot", icon = "○";
        if(isToday)            { cls += " today"; icon = "📍"; }
        else if(hist && hist.success) { cls += " success"; icon = "✓"; }
        else if(hist)          { cls += " fail"; icon = "✕"; }
        let div = document.createElement("div");
        div.className = "history-day";
        div.innerHTML = `<div class="${cls}">${icon}</div><div class="history-label">${days[d.getDay()]}</div>`;
        row.appendChild(div);
    }
}

// ===== Shop =====
function openShop(){ renderShop(); document.getElementById("shopOverlay").classList.add("show"); }
function closeShop(){ document.getElementById("shopOverlay").classList.remove("show"); }

function renderShop(){
    document.getElementById("shopCoins").textContent = state.coins;
    let grid = document.getElementById("shopGrid");
    grid.innerHTML = "";
    SHOP.forEach(item => {
        let owned    = state.inventory.includes(item.id);
        let equipped = state.equipped === item.id;
        let isFreeze = item.type === "freeze";
        let card = document.createElement("div");
        card.className = "shop-item" + (equipped ? " equipped" : "");
        let btnHtml;
        if(isFreeze){
            btnHtml = `<button class="shop-btn buy" onclick="buyItem('${item.id}')">ซื้อ 🪙${item.price}</button>`;
        } else if(equipped){
            btnHtml = `<button class="shop-btn unequip" onclick="unequipItem()">ถอดออก</button>`;
        } else if(owned){
            btnHtml = `<button class="shop-btn equip" onclick="equipItem('${item.id}')">ใส่</button>`;
        } else {
            btnHtml = `<button class="shop-btn buy" onclick="buyItem('${item.id}')">ซื้อ 🪙${item.price}</button>`;
        }
        card.innerHTML = `
            <div class="shop-emoji">${item.emoji}</div>
            <div class="shop-name">${item.name}</div>
            ${isFreeze && state.freezeCount > 0 ? `<div class="shop-owned-count">มี ${state.freezeCount} ชิ้น</div>` : ""}
            ${btnHtml}
        `;
        grid.appendChild(card);
    });
}

function buyItem(id){
    let item = SHOP.find(s => s.id === id);
    if(!item) return;
    if(state.coins < item.price){
        showToast("🪙 เหรียญไม่พอ! ทำเป้าหมายเพิ่มก่อนนะ");
        return;
    }
    state.coins -= item.price;
    if(item.type === "freeze"){
        state.freezeCount += 1;
        showToast(`❄️ ซื้อ Streak Freeze แล้ว! (มี ${state.freezeCount} ชิ้น)`);
    } else {
        state.inventory.push(id);
        state.equipped = id;
        showToast(`✨ ซื้อ ${item.name} แล้ว! ใส่ให้เลย`);
    }
    save();
    renderShop(); renderStats(); renderPet();
}

function equipItem(id){
    state.equipped = id;
    save();
    renderShop(); renderPet();
    showToast("✨ เปลี่ยนชุดแล้ว!");
}

function unequipItem(){
    state.equipped = null;
    save();
    renderShop(); renderPet();
}

// ===== Level Up =====
function showLevelUp(idx){
    let stage = PET_STAGES[idx];
    document.getElementById("levelupPet").textContent = stage.emoji;
    document.getElementById("levelupSub").textContent = `กลายเป็น ${stage.name} แล้ว!`;
    document.getElementById("levelupOverlay").classList.add("show");
    showToast(`🌟 วิวัฒนาการ! กลายเป็น ${stage.name}`);
    if(typeof fireConfetti === "function") fireConfetti();
    if(typeof playSound === "function") playSound("levelup");
    if(typeof renderAchievements === "function") renderAchievements();
}
function closeLevelUp(){ document.getElementById("levelupOverlay").classList.remove("show"); }

// ===== Helpers =====
function getTodayStr(date){
    let d = date || new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function save(){ localStorage.setItem("goalsState", JSON.stringify(state)); }
function showToast(msg){
    let t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 3000);
}
function toggleTheme(){
    document.body.classList.toggle("light-mode");
    let dark = !document.body.classList.contains("light-mode");
    document.getElementById("themeToggle").innerHTML = dark ? "🌙" : "☀️";
    localStorage.setItem("theme", dark ? "dark" : "light");
}
function logout(){
    localStorage.removeItem("loggedIn");
    window.location.href = "login.html";
}

init();

// Apply saved theme
if(localStorage.getItem("theme") === "light"){
    document.body.classList.add("light-mode");
    document.getElementById("themeToggle").innerHTML = "☀️";
}
