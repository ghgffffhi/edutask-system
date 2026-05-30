if(localStorage.getItem("loggedIn") !== "true"){
    window.location.href = "login.html";
}

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let taskHistory = JSON.parse(localStorage.getItem("taskHistory")) || {};

// ===== Add Task =====
function addTask(){
    let taskInput = document.getElementById("taskInput");
    let dateInput = document.getElementById("dateInput");
    let descInput = document.getElementById("descriptionInput");
    let task = taskInput.value.trim();
    if(task === ""){ alert("กรุณากรอกชื่องาน"); return; }

    tasks.push({
        text: task,
        date: dateInput.value,
        completed: false,
        subject: document.getElementById("subjectInput").value,
        priority: document.getElementById("priorityInput").value,
        createdAt: new Date().toLocaleString("th-TH"),
        description: descInput.value.trim(),
        pinned: false
    });

    showToast("✅ เพิ่มงานสำเร็จ");
    saveTasks();
    refresh();
    taskInput.value = ""; dateInput.value = ""; descInput.value = "";
}

// ===== Display Tasks =====
function displayTasks(){
    let taskList = document.getElementById("taskList");
    let empty    = document.getElementById("taskEmpty");
    let search   = (document.getElementById("searchInput")?.value || "").toLowerCase();
    let filter   = document.getElementById("filterInput")?.value || "all";

    taskList.innerHTML = "";

    let shown = 0;
    tasks.forEach((task, index) => {
        let matchSearch = task.text.toLowerCase().includes(search);
        let matchFilter = filter === "all" ||
            (filter === "completed" && task.completed) ||
            (filter === "pending" && !task.completed);
        if(!matchSearch || !matchFilter) return;
        shown++;

        let li = document.createElement("li");
        if(task.pinned) li.classList.add("pinned");
        if(task.priority === "สูง") li.classList.add("high");
        else if(task.priority === "กลาง") li.classList.add("medium");
        else li.classList.add("low");

        let warn = getDeadlineWarning(task.date);
        let warnBadge = "";
        if(warn === "soon") warnBadge = `<span class="badge badge-warn">🚨 ใกล้ครบกำหนด</span>`;
        else if(warn === "late") warnBadge = `<span class="badge badge-late">❌ เลยกำหนดแล้ว</span>`;

        let dateBadge = task.date ? `<span class="badge badge-date">📅 ${task.date}</span>` : "";
        let descHtml = task.description ? `<p class="task-desc">📝 ${task.description}</p>` : "";
        let pinPrefix = task.pinned ? "📌 " : "";

        li.innerHTML = `
            <p class="task-title ${task.completed ? 'done' : ''}">${pinPrefix}${task.text}</p>
            <div class="task-meta">
                <span class="badge badge-subject">${task.subject}</span>
                ${dateBadge}
                ${warnBadge}
            </div>
            ${descHtml}
            <div class="task-actions">
                <button class="btn-done" onclick="toggleTask(${index})">${task.completed ? "↩ ยกเลิก" : "✓ เสร็จแล้ว"}</button>
                <button class="btn-edit" onclick="editTask(${index})">✏️ แก้ไข</button>
                <button class="btn-pin"  onclick="pinTask(${index})">${task.pinned ? "📌 เลิกปักหมุด" : "📌 ปักหมุด"}</button>
                <button class="btn-del"  onclick="deleteTask(${index})">🗑️ ลบ</button>
            </div>
        `;
        taskList.appendChild(li);
    });

    empty.style.display = (tasks.length === 0) ? "block" : "none";
}

// ===== Toggle / Delete / Edit / Pin =====
function toggleTask(index){
    tasks[index].completed = !tasks[index].completed;
    let today = todayStr();
    if(tasks[index].completed){
        taskHistory[today] = (taskHistory[today] || 0) + 1;
        showToast("🎉 ทำงานเสร็จแล้ว เก่งมาก!");
        fireConfetti();
        if(typeof playSound === "function") playSound("complete");
    } else {
        taskHistory[today] = Math.max(0, (taskHistory[today] || 0) - 1);
        showToast("↩ ยกเลิกสถานะแล้ว");
    }
    localStorage.setItem("taskHistory", JSON.stringify(taskHistory));
    saveTasks(); refresh();
}

function deleteTask(index){
    tasks.splice(index, 1);
    showToast("🗑️ ลบงานแล้ว");
    saveTasks(); refresh();
}

function editTask(index){
    let newTask = prompt("แก้ไขชื่องาน", tasks[index].text);
    if(newTask === null || newTask.trim() === "") return;
    let newDesc = prompt("แก้ไขรายละเอียด", tasks[index].description || "");
    let newDate = prompt("แก้ไขวันส่ง (YYYY-MM-DD)", tasks[index].date || "");
    tasks[index].text = newTask.trim();
    tasks[index].description = newDesc || "";
    tasks[index].date = newDate || "";
    showToast("✏️ แก้ไขสำเร็จ");
    saveTasks(); refresh();
}

function pinTask(index){
    tasks[index].pinned = !tasks[index].pinned;
    tasks.sort((a, b) => b.pinned - a.pinned);
    saveTasks(); refresh();
}

// ===== Save / Refresh =====
function saveTasks(){ localStorage.setItem("tasks", JSON.stringify(tasks)); }

function refresh(){
    displayTasks();
    updateCalendar();
    updateDashboard();
    updateProgress();
    renderWeekChart();
}

// ===== Dashboard =====
function updateDashboard(){
    let total = tasks.length;
    let completed = tasks.filter(t => t.completed).length;
    document.getElementById("totalTasks").textContent = total;
    document.getElementById("completedTasks").textContent = completed;
    document.getElementById("pendingTasks").textContent = total - completed;
}

function updateProgress(){
    let total = tasks.length;
    let completed = tasks.filter(t => t.completed).length;
    let pct = total === 0 ? 0 : Math.round((completed / total) * 100);
    document.getElementById("progressBar").style.width = pct + "%";
    document.getElementById("progressText").textContent = pct + "% เสร็จแล้ว";
}

// ===== Calendar =====
function updateCalendar(){
    let cal = document.getElementById("calendarPreview");
    cal.innerHTML = "";
    let upcoming = [...tasks].filter(t => t.date && !t.completed)
        .sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5);
    if(upcoming.length === 0){
        cal.innerHTML = `<p style="color:var(--text2);font-size:12px;text-align:center;padding:10px 0">ยังไม่มีงานที่รอส่ง 🎉</p>`;
        return;
    }
    upcoming.forEach(task => {
        let div = document.createElement("div");
        div.className = "calendar-item";
        div.innerHTML = `<strong style="font-size:13px">${task.text}</strong><br>
            <span style="color:var(--text2);font-size:12px">📅 ${task.date} · ${task.subject}</span>`;
        cal.appendChild(div);
    });
}

// ===== Weekly Chart =====
function renderWeekChart(){
    let chart = document.getElementById("weekChart");
    if(!chart) return;
    chart.innerHTML = "";
    let days = ["อา","จ","อ","พ","พฤ","ศ","ส"];
    let today = todayStr();

    // find max for scaling
    let vals = [];
    for(let i = 6; i >= 0; i--){
        let d = new Date(); d.setDate(d.getDate() - i);
        vals.push(taskHistory[todayStr(d)] || 0);
    }
    let max = Math.max(...vals, 1);

    for(let i = 6; i >= 0; i--){
        let d = new Date(); d.setDate(d.getDate() - i);
        let ds = todayStr(d);
        let v = taskHistory[ds] || 0;
        let h = v === 0 ? 4 : Math.round((v / max) * 80) + 14;
        let isToday = ds === today;

        let wrap = document.createElement("div");
        wrap.className = "week-bar-wrap";
        wrap.innerHTML = `
            <div class="week-bar-val">${v > 0 ? v : ""}</div>
            <div class="week-bar ${v === 0 ? 'empty' : ''} ${isToday ? 'today-bar' : ''}" style="height:${h}px"></div>
            <div class="week-bar-day">${days[d.getDay()]}</div>
        `;
        chart.appendChild(wrap);
    }
}

// ===== Deadline Warning =====
function getDeadlineWarning(date){
    if(!date) return "";
    let diff = Math.ceil((new Date(date) - new Date()) / (1000*60*60*24));
    if(diff < 0) return "late";
    if(diff <= 1) return "soon";
    return "";
}

// ===== Greeting =====
function renderGreeting(){
    let h = new Date().getHours();
    let user = JSON.parse(localStorage.getItem("user"));
    let name = user?.username || "เพื่อน";
    let greet, emoji;
    if(h < 12){ greet = "อรุณสวัสดิ์"; emoji = "🌅"; }
    else if(h < 17){ greet = "สวัสดีตอนบ่าย"; emoji = "☀️"; }
    else if(h < 21){ greet = "สวัสดีตอนเย็น"; emoji = "🌆"; }
    else { greet = "ราตรีสวัสดิ์"; emoji = "🌙"; }

    document.getElementById("greetingText").innerHTML = `${greet} <span>${name}</span> ${emoji}`;

    let pending = tasks.filter(t => !t.completed).length;
    let sub = pending === 0
        ? "ไม่มีงานค้างเลย เยี่ยมมาก! 🎉"
        : `วันนี้มีงานค้างอยู่ ${pending} ชิ้น สู้ๆ นะ 💪`;
    document.getElementById("greetingSub").textContent = sub;

    const quotes = [
        "ความสำเร็จเล็กๆ ในแต่ละวัน รวมกันเป็นเรื่องที่ยิ่งใหญ่",
        "อย่ารอให้พร้อม เริ่มเลยตอนนี้แหละดีที่สุด",
        "ทำวันนี้ให้ดีที่สุด พรุ่งนี้จะขอบคุณตัวเอง",
        "ก้าวเล็กๆ ดีกว่าหยุดอยู่กับที่",
        "วินัยคือสะพานระหว่างเป้าหมายกับความสำเร็จ",
        "เธอเก่งกว่าที่คิดเสมอ",
        "พักได้ แต่อย่ายอมแพ้"
    ];
    let q = quotes[new Date().getDay() % quotes.length];
    document.getElementById("greetingQuote").textContent = `"${q}"`;

    renderNextClassLine();
}

// ===== Next Class (from schedule data) =====
function renderNextClassLine(){
    let el = document.getElementById("greetingNextClass");
    if(!el) return;
    let schedule = JSON.parse(localStorage.getItem("schedule")) || {};
    let DAYS = { 1:"จันทร์",2:"อังคาร",3:"พุธ",4:"พฤหัสบดี",5:"ศุกร์" };

    let now = new Date();
    let dow = now.getDay();
    let nowMin = now.getHours()*60 + now.getMinutes();
    let found = null;

    if(schedule[dow]){
        for(let c of schedule[dow]){
            let [h,m] = c.start.split(":").map(Number);
            let [eh,em] = c.end.split(":").map(Number);
            if(nowMin >= h*60+m && nowMin < eh*60+em){ found = {c, when:"กำลังเรียน 🔴"}; break; }
            if(h*60+m > nowMin){ found = {c, when:"คาบต่อไปวันนี้"}; break; }
        }
    }
    if(!found){
        for(let i=1;i<=7;i++){
            let d = ((dow+i-1)%7)+1;
            if(d<1||d>5) continue;
            if(schedule[d] && schedule[d].length){ found = {c:schedule[d][0], when:DAYS[d]}; break; }
        }
    }

    if(found){
        el.style.display = "block";
        el.innerHTML = `📅 ${found.when}: <b>${found.c.subject}</b> · ${found.c.start}${found.c.room ? ` · 📍${found.c.room}` : ""}`;
    } else {
        el.style.display = "none";
    }
}

// ===== Focus Timer =====
let focusTotal = 25 * 60;
let focusLeft = focusTotal;
let focusRunning = false;
let focusInterval = null;
const FOCUS_CIRC = 276.46;

let focusStats = JSON.parse(localStorage.getItem("focusStats")) || { date: todayStr(), minutes: 0, sessions: 0 };
if(focusStats.date !== todayStr()){ focusStats = { date: todayStr(), minutes: 0, sessions: 0 }; saveFocus(); }

function setFocusPreset(min, el){
    if(focusRunning) return;
    focusTotal = min * 60;
    focusLeft = focusTotal;
    document.querySelectorAll(".focus-preset").forEach(b => b.classList.remove("active"));
    el.classList.add("active");
    updateFocusDisplay();
}

function toggleFocus(){
    if(focusRunning){
        clearInterval(focusInterval);
        focusRunning = false;
        document.getElementById("focusStartBtn").innerHTML = "▶ เริ่มต่อ";
        document.getElementById("focusState").textContent = "หยุดพัก";
    } else {
        focusRunning = true;
        document.getElementById("focusStartBtn").innerHTML = "⏸ พัก";
        document.getElementById("focusState").textContent = "กำลังโฟกัส";
        focusInterval = setInterval(() => {
            focusLeft--;
            updateFocusDisplay();
            if(focusLeft <= 0){
                clearInterval(focusInterval);
                focusRunning = false;
                focusStats.minutes += Math.round(focusTotal / 60);
                focusStats.sessions += 1;
                saveFocus();
                renderFocusStats();
                document.getElementById("focusStartBtn").innerHTML = "▶ เริ่ม";
                document.getElementById("focusState").textContent = "สำเร็จ! 🎉";
                showToast("🍅 จบ 1 รอบโฟกัสแล้ว เก่งมาก!");
                fireConfetti();
                if(typeof playSound === "function") playSound("levelup");
                focusLeft = focusTotal;
                setTimeout(updateFocusDisplay, 1500);
            }
        }, 1000);
    }
}

function resetFocus(){
    clearInterval(focusInterval);
    focusRunning = false;
    focusLeft = focusTotal;
    document.getElementById("focusStartBtn").innerHTML = "▶ เริ่ม";
    document.getElementById("focusState").textContent = "พร้อมลุย";
    updateFocusDisplay();
}

function updateFocusDisplay(){
    let m = String(Math.floor(focusLeft / 60)).padStart(2, "0");
    let s = String(focusLeft % 60).padStart(2, "0");
    document.getElementById("focusTime").textContent = `${m}:${s}`;
    let pct = focusLeft / focusTotal;
    document.getElementById("focusRingFill").style.strokeDashoffset = FOCUS_CIRC * (1 - pct);
}

function renderFocusStats(){
    document.getElementById("focusTodayMin").textContent = focusStats.minutes;
    document.getElementById("focusSessions").textContent = focusStats.sessions;
}

function saveFocus(){ localStorage.setItem("focusStats", JSON.stringify(focusStats)); }

// ===== Helpers =====
function todayStr(date){
    let d = date || new Date();
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
}

function logout(){
    localStorage.removeItem("loggedIn");
    window.location.href = "login.html";
}

function showNotifications(){
    let soon = tasks.filter(t => getDeadlineWarning(t.date) === "soon");
    if(soon.length > 0) setTimeout(() => showToast(`⚠️ มีงานใกล้ส่ง ${soon.length} งาน`), 800);
}

// ===== Init =====
if(localStorage.getItem("theme") === "light"){
    document.body.classList.add("light-mode");
    document.getElementById("themeToggle").innerHTML = "☀️";
}
refresh();
renderGreeting();
updateFocusDisplay();
renderFocusStats();
showNotifications();
