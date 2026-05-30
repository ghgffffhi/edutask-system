if(localStorage.getItem("loggedIn") !== "true"){
    window.location.href = "login.html";
}

const PET_STAGES_P = [
    { emoji:'🥚', name:'ไข่ปริศนา' }, { emoji:'🐣', name:'ลูกไก่น้อย' },
    { emoji:'🐱', name:'แมวน้อยจอมซน' }, { emoji:'🦊', name:'จิ้งจอกจอมเก่ง' },
    { emoji:'🐉', name:'มังกรในตำนาน' }
];

// keys we back up
const BACKUP_KEYS = ["user","tasks","taskHistory","goalsState","focusStats","schedule","theme","soundEnabled"];

function init(){
    renderProfile();
    renderStats();
    syncToggles();
}

// ===== Profile Hero =====
function renderProfile(){
    let user = JSON.parse(localStorage.getItem("user")) || {};
    let gs = JSON.parse(localStorage.getItem("goalsState")) || { petStage:0, streak:0, xp:0 };
    let stage = PET_STAGES_P[gs.petStage || 0];

    let equipped = gs.equipped;
    let accMap = { bow:'🎀', glasses:'🕶️', flower:'🌸', hat:'🎩', crown:'👑', halo:'😇' };

    document.getElementById("profileAvatar").innerHTML =
        stage.emoji + (equipped && accMap[equipped] ? `<span class="avatar-acc">${accMap[equipped]}</span>` : "");
    document.getElementById("profileName").textContent = user.username || "ผู้ใช้";
    document.getElementById("profileRank").textContent = `${stage.name} · Lv.${gs.petStage || 0}`;

    // member since (first time we record)
    let since = localStorage.getItem("memberSince");
    if(!since){ since = new Date().toLocaleDateString("th-TH", {year:'numeric',month:'long',day:'numeric'}); localStorage.setItem("memberSince", since); }
    document.getElementById("profileSince").textContent = `🗓️ เริ่มใช้งานเมื่อ ${since}`;
}

// ===== Stats =====
function renderStats(){
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let gs = JSON.parse(localStorage.getItem("goalsState")) || {};
    let focus = JSON.parse(localStorage.getItem("focusStats")) || {};
    let sched = JSON.parse(localStorage.getItem("schedule")) || {};

    let tasksDone = tasks.filter(t => t.completed).length;
    let totalClasses = Object.values(sched).reduce((sum, arr) => sum + arr.length, 0);

    // achievements unlocked count (mirror goals.js logic)
    let achCount = 0;
    let s = gs;
    if((s.totalGoalsDone||0) >= 1) achCount++;
    if((s.streak||0) >= 3) achCount++;
    if((s.streak||0) >= 7) achCount++;
    if((s.streak||0) >= 14) achCount++;
    if((s.streak||0) >= 30) achCount++;
    if((s.petStage||0) >= 4) achCount++;
    if((s.totalGoalsDone||0) >= 50) achCount++;
    if((s.xp||0) >= 500) achCount++;

    let stats = [
        { icon:"✅", num: tasksDone,            lbl:"งานที่ทำเสร็จ",    color:"var(--green)" },
        { icon:"🔥", num: gs.streak || 0,       lbl:"streak สูงสุด",    color:"var(--rose)" },
        { icon:"⚡", num: gs.xp || 0,           lbl:"XP สะสม",          color:"var(--indigo)" },
        { icon:"🪙", num: gs.coins || 0,        lbl:"เหรียญ",           color:"var(--amber)" },
        { icon:"🎯", num: gs.totalGoalsDone||0, lbl:"เป้าหมายสำเร็จ",   color:"var(--violet)" },
        { icon:"🍅", num: focus.minutes || 0,   lbl:"นาทีโฟกัสวันนี้",  color:"var(--mint)" },
        { icon:"📅", num: totalClasses,         lbl:"คาบเรียน",         color:"var(--blue2)" },
        { icon:"🏅", num: achCount + "/8",      lbl:"ความสำเร็จ",       color:"var(--amber)" }
    ];

    let grid = document.getElementById("profileStats");
    grid.innerHTML = "";
    stats.forEach(st => {
        let div = document.createElement("div");
        div.className = "pstat-card";
        div.innerHTML = `
            <div class="pstat-icon">${st.icon}</div>
            <div class="pstat-num" style="color:${st.color}">${st.num}</div>
            <div class="pstat-lbl">${st.lbl}</div>
        `;
        grid.appendChild(div);
    });
}

// ===== Settings Toggles =====
function syncToggles(){
    document.getElementById("soundToggle").checked = localStorage.getItem("soundEnabled") !== "false";
    document.getElementById("themeToggleSwitch").checked = document.body.classList.contains("light-mode");
}

function toggleSound(){
    let on = document.getElementById("soundToggle").checked;
    if(typeof setSoundEnabled === "function") setSoundEnabled(on);
    if(on && typeof playSound === "function") playSound("click");
    showToast(on ? "🔊 เปิดเสียงแล้ว" : "🔇 ปิดเสียงแล้ว");
}

function toggleThemeSwitch(){
    let light = document.getElementById("themeToggleSwitch").checked;
    document.body.classList.toggle("light-mode", light);
    localStorage.setItem("theme", light ? "light" : "dark");
    document.getElementById("themeToggle").innerHTML = light ? "☀️" : "🌙";
}

// ===== Data Export =====
function exportData(){
    let data = {};
    BACKUP_KEYS.forEach(k => {
        let v = localStorage.getItem(k);
        if(v !== null) data[k] = v;
    });
    data._exportedAt = new Date().toISOString();
    data._app = "EduTask";

    let blob = new Blob([JSON.stringify(data, null, 2)], { type:"application/json" });
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href = url;
    a.download = `edutask-backup-${todayStr()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    if(typeof playSound === "function") playSound("complete");
    showToast("⬇️ ดาวน์โหลดไฟล์สำรองแล้ว!");
}

// ===== Data Import =====
function importData(event){
    let file = event.target.files[0];
    if(!file) return;
    let reader = new FileReader();
    reader.onload = e => {
        try {
            let data = JSON.parse(e.target.result);
            if(data._app !== "EduTask"){
                if(!confirm("ไฟล์นี้อาจไม่ใช่ไฟล์สำรองของ EduTask ต้องการกู้คืนต่อไหม?")){ return; }
            }
            BACKUP_KEYS.forEach(k => {
                if(data[k] !== undefined) localStorage.setItem(k, data[k]);
            });
            if(typeof playSound === "function") playSound("levelup");
            showToast("✅ กู้คืนข้อมูลสำเร็จ! กำลังรีโหลด...");
            setTimeout(() => location.reload(), 1200);
        } catch(err){
            if(typeof playSound === "function") playSound("error");
            showToast("❌ ไฟล์ไม่ถูกต้อง");
        }
    };
    reader.readAsText(file);
    event.target.value = "";
}

// ===== Reset =====
function resetData(){
    if(!confirm("⚠️ ล้างข้อมูลทั้งหมด? (งาน, เป้าหมาย, สัตว์เลี้ยง, ตารางเรียน)\nบัญชีจะยังอยู่ แต่ข้อมูลจะหายถาวร ลบไม่ได้กู้คืน!")) return;
    if(!confirm("แน่ใจจริงๆ นะ? กดยกเลิกได้ถ้าไม่แน่ใจ")) return;
    ["tasks","taskHistory","goalsState","focusStats","schedule"].forEach(k => localStorage.removeItem(k));
    if(typeof playSound === "function") playSound("error");
    showToast("🗑️ ล้างข้อมูลแล้ว กำลังรีโหลด...");
    setTimeout(() => location.reload(), 1200);
}

// ===== Helpers =====
function todayStr(){
    let d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
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
    syncToggles();
}
function logout(){
    localStorage.removeItem("loggedIn");
    window.location.href = "login.html";
}

// ===== Start =====
if(localStorage.getItem("theme") === "light"){
    document.body.classList.add("light-mode");
    document.getElementById("themeToggle").innerHTML = "☀️";
}
init();
