if(localStorage.getItem("loggedIn") !== "true"){
    window.location.href = "login.html";
}

const DAYS = { 1:"จันทร์", 2:"อังคาร", 3:"พุธ", 4:"พฤหัสบดี", 5:"ศุกร์" };
const DAY_SHORT = { 1:"จ", 2:"อ", 3:"พ", 4:"พฤ", 5:"ศ" };
const COLORS = ["#818cf8","#2dd4bf","#fb7185","#fbbf24","#a78bfa","#34d399","#60a5fa","#f0abfc"];

let schedule = JSON.parse(localStorage.getItem("schedule")) || {};
let pickedColor = COLORS[0];

// ===== Init =====
function init(){
    renderColorPicker();
    renderTimetable();
    renderNextClass();
    // refresh next class every minute
    setInterval(renderNextClass, 60000);
}

// ===== Color Picker =====
function renderColorPicker(){
    let wrap = document.getElementById("colorPicker");
    wrap.innerHTML = "";
    COLORS.forEach(c => {
        let dot = document.createElement("div");
        dot.className = "color-dot" + (c === pickedColor ? " active" : "");
        dot.style.background = c;
        dot.onclick = () => { pickedColor = c; renderColorPicker(); };
        wrap.appendChild(dot);
    });
}

// ===== Add Class =====
function addClass(){
    let day     = document.getElementById("dayInput").value;
    let subject = document.getElementById("subjectName").value.trim();
    let start   = document.getElementById("startTime").value;
    let end     = document.getElementById("endTime").value;
    let room    = document.getElementById("roomInput").value.trim();
    let teacher = document.getElementById("teacherInput").value.trim();

    if(subject === ""){ alert("กรุณากรอกชื่อวิชา"); return; }
    if(start >= end){ alert("เวลาเริ่มต้องน้อยกว่าเวลาจบ"); return; }

    if(!schedule[day]) schedule[day] = [];
    schedule[day].push({ id: Date.now(), subject, start, end, room, teacher, color: pickedColor });
    schedule[day].sort((a,b) => a.start.localeCompare(b.start));

    save();
    renderTimetable();
    renderNextClass();
    if(typeof playSound === "function") playSound("complete");
    showToast("✅ เพิ่มคาบเรียนแล้ว");

    document.getElementById("subjectName").value = "";
    document.getElementById("roomInput").value = "";
    document.getElementById("teacherInput").value = "";
}

// ===== Delete Class =====
function deleteClass(day, id){
    schedule[day] = schedule[day].filter(c => c.id !== id);
    if(schedule[day].length === 0) delete schedule[day];
    save();
    renderTimetable();
    renderNextClass();
    showToast("🗑️ ลบคาบเรียนแล้ว");
}

// ===== Render Timetable =====
function renderTimetable(){
    let tt = document.getElementById("timetable");
    tt.innerHTML = "";
    let todayDow = new Date().getDay();

    for(let d = 1; d <= 5; d++){
        let col = document.createElement("div");
        col.className = "day-col" + (d === todayDow ? " today-col" : "");

        let classes = schedule[d] || [];
        let classesHtml = "";

        if(classes.length === 0){
            classesHtml = `<div class="day-empty">ว่าง 🌿</div>`;
        } else {
            classes.forEach(c => {
                classesHtml += `
                    <div class="class-card" style="--cc:${c.color}">
                        <div class="class-time">${c.start} - ${c.end}</div>
                        <div class="class-subject">${c.subject}</div>
                        ${c.room || c.teacher ? `<div class="class-meta">
                            ${c.room ? `📍 ${c.room}` : ""} ${c.teacher ? `· 👤 ${c.teacher}` : ""}
                        </div>` : ""}
                        <button class="class-del" onclick="deleteClass(${d}, ${c.id})">✕</button>
                    </div>
                `;
            });
        }

        col.innerHTML = `
            <div class="day-head ${d === todayDow ? 'today-head' : ''}">
                ${DAYS[d]} ${d === todayDow ? '<span class="today-tag">วันนี้</span>' : ''}
            </div>
            <div class="day-classes">${classesHtml}</div>
        `;
        tt.appendChild(col);
    }
}

// ===== Next Class =====
function renderNextClass(){
    let banner = document.getElementById("nextClassBanner");
    let detail = document.getElementById("nextClassDetail");
    let timeEl = document.getElementById("nextClassTime");

    let now = new Date();
    let dow = now.getDay();
    let nowMin = now.getHours() * 60 + now.getMinutes();

    let found = null;

    // check today (later classes)
    if(schedule[dow]){
        for(let c of schedule[dow]){
            let [h,m] = c.start.split(":").map(Number);
            let startMin = h*60+m;
            let [eh,em] = c.end.split(":").map(Number);
            let endMin = eh*60+em;
            if(nowMin >= startMin && nowMin < endMin){
                found = { c, when: "กำลังเรียนอยู่", day: dow };
                break;
            }
            if(startMin > nowMin){
                found = { c, when: "วันนี้", day: dow };
                break;
            }
        }
    }

    // check upcoming days
    if(!found){
        for(let i = 1; i <= 7; i++){
            let d = ((dow + i - 1) % 7) + 1;
            if(d < 1 || d > 5) continue;
            if(schedule[d] && schedule[d].length > 0){
                found = { c: schedule[d][0], when: DAYS[d], day: d };
                break;
            }
        }
    }

    if(!found){
        detail.textContent = "ยังไม่มีตารางเรียน เพิ่มคาบแรกเลย!";
        timeEl.textContent = "";
        banner.classList.remove("live");
        return;
    }

    let c = found.c;
    detail.innerHTML = `<b>${c.subject}</b> · ${found.when}${c.room ? ` · 📍${c.room}` : ""}`;
    timeEl.textContent = `${c.start}`;
    if(found.when === "กำลังเรียนอยู่"){
        banner.classList.add("live");
        timeEl.textContent = "● LIVE";
    } else {
        banner.classList.remove("live");
    }
}

// ===== Helpers =====
function save(){ localStorage.setItem("schedule", JSON.stringify(schedule)); }
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

// ===== Start =====
init();
if(localStorage.getItem("theme") === "light"){
    document.body.classList.add("light-mode");
    document.getElementById("themeToggle").innerHTML = "☀️";
}
