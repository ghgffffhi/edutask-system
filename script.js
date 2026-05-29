if(localStorage.getItem("loggedIn") !== "true"){
    window.location.href = "login.html";
}

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// ===== Add Task =====
function addTask(){
    let taskInput       = document.getElementById("taskInput");
    let dateInput       = document.getElementById("dateInput");
    let descInput       = document.getElementById("descriptionInput");
    let task            = taskInput.value.trim();
    let date            = dateInput.value;
    let description     = descInput.value.trim();
    let subject         = document.getElementById("subjectInput").value;
    let priority        = document.getElementById("priorityInput").value;

    if(task === ""){
        alert("กรุณากรอกชื่องาน");
        return;
    }

    tasks.push({
        text: task,
        date: date,
        completed: false,
        subject: subject,
        priority: priority,
        createdAt: new Date().toLocaleString("th-TH"),
        description: description,
        pinned: false
    });

    showToast("✅ เพิ่มงานสำเร็จ");
    saveTasks();
    refresh();

    taskInput.value    = "";
    dateInput.value    = "";
    descInput.value    = "";
}

// ===== Display Tasks =====
function displayTasks(){
    let taskList    = document.getElementById("taskList");
    let search      = (document.getElementById("searchInput")?.value || "").toLowerCase();
    let filter      = document.getElementById("filterInput")?.value || "all";

    taskList.innerHTML = "";

    tasks.forEach((task, index) => {
        let matchSearch = task.text.toLowerCase().includes(search);
        let matchFilter =
            filter === "all" ||
            (filter === "completed" && task.completed) ||
            (filter === "pending" && !task.completed);

        if(!matchSearch || !matchFilter) return;

        let li = document.createElement("li");
        if(task.pinned)             li.classList.add("pinned");
        if(task.priority === "สูง") li.classList.add("high");
        else if(task.priority === "กลาง") li.classList.add("medium");
        else                        li.classList.add("low");

        // Deadline badge
        let warn = getDeadlineWarning(task.date);
        let warnBadge = "";
        if(warn === "soon")    warnBadge = `<span class="badge badge-warn">🚨 ใกล้ครบกำหนด</span>`;
        else if(warn === "late") warnBadge = `<span class="badge badge-late">❌ เลยกำหนดแล้ว</span>`;

        let dateBadge = task.date
            ? `<span class="badge badge-date">📅 ${task.date}</span>` : "";

        let descHtml = task.description
            ? `<p class="task-desc">📝 ${task.description}</p>` : "";

        let pinLabel = task.pinned ? "📌 เลิกปักหมุด" : "📌 ปักหมุด";
        let doneLabel = task.completed ? "↩ ยกเลิก" : "✓ เสร็จแล้ว";
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
                <button class="btn-done" onclick="toggleTask(${index})">${doneLabel}</button>
                <button class="btn-edit" onclick="editTask(${index})">✏️ แก้ไข</button>
                <button class="btn-pin"  onclick="pinTask(${index})">${pinLabel}</button>
                <button class="btn-del"  onclick="deleteTask(${index})">🗑️ ลบ</button>
            </div>
        `;

        taskList.appendChild(li);
    });
}

// ===== Toggle / Delete / Edit / Pin =====
function toggleTask(index){
    tasks[index].completed = !tasks[index].completed;
    showToast("🎉 อัปเดตสถานะแล้ว");
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
function saveTasks(){
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function refresh(){
    displayTasks();
    updateCalendar();
    updateDashboard();
    updateProgress();
}

// ===== Dashboard =====
function updateDashboard(){
    let total       = tasks.length;
    let completed   = tasks.filter(t => t.completed).length;
    let pending     = total - completed;
    document.getElementById("totalTasks").textContent      = total;
    document.getElementById("completedTasks").textContent  = completed;
    document.getElementById("pendingTasks").textContent    = pending;
}

// ===== Progress =====
function updateProgress(){
    let total     = tasks.length;
    let completed = tasks.filter(t => t.completed).length;
    let percent   = total === 0 ? 0 : Math.round((completed / total) * 100);
    document.getElementById("progressBar").style.width = percent + "%";
    document.getElementById("progressText").textContent = percent + "% เสร็จแล้ว";
}

// ===== Calendar =====
function updateCalendar(){
    let cal = document.getElementById("calendarPreview");
    cal.innerHTML = "";

    let upcoming = [...tasks]
        .filter(t => t.date && !t.completed)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);

    if(upcoming.length === 0){
        cal.innerHTML = `<p style="color:var(--text2);font-size:12px;text-align:center;padding:8px 0">ยังไม่มีงานที่รอส่ง 🎉</p>`;
        return;
    }

    upcoming.forEach(task => {
        let div = document.createElement("div");
        div.classList.add("calendar-item");
        div.innerHTML = `
            <strong style="font-size:13px">${task.text}</strong><br>
            <span style="color:var(--text2);font-size:12px">📅 ${task.date} · ${task.subject}</span>
        `;
        cal.appendChild(div);
    });
}

// ===== Deadline Warning =====
function getDeadlineWarning(date){
    if(!date) return "";
    let today   = new Date();
    let due     = new Date(date);
    let diff    = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    if(diff < 0)  return "late";
    if(diff <= 1) return "soon";
    return "";
}

// ===== Toast =====
function showToast(msg){
    let t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 3000);
}

// ===== Theme =====
function toggleTheme(){
    document.body.classList.toggle("light-mode");
    let btn = document.getElementById("themeToggle");
    btn.innerHTML = document.body.classList.contains("light-mode") ? "☀️" : "🌙";
}

// ===== Logout =====
function logout(){
    localStorage.removeItem("loggedIn");
    window.location.href = "login.html";
}

// ===== Notifications =====
function showNotifications(){
    let soon = tasks.filter(t => getDeadlineWarning(t.date) === "soon");
    if(soon.length > 0) showToast(`⚠️ มีงานใกล้ส่ง ${soon.length} งาน`);
}

// ===== AI Assistant =====
async function askAI(){
    let input       = document.getElementById("aiInput").value.trim();
    let responseDiv = document.getElementById("aiResponse");

    if(input === ""){
        responseDiv.className = "show";
        responseDiv.innerHTML = "⚠️ พิมพ์คำถามก่อนนะ";
        return;
    }

    responseDiv.className = "show";
    responseDiv.innerHTML = `<span style="color:var(--text2)">🤔 AI กำลังคิด...</span>`;

    // *** ใส่ API Key ของเธอตรงนี้ ***
    const API_KEY = "AQ.Ab8RN6ImPrMrUJK2aeJcUPFmf3XLuXZClBvRCA6crJcd6YKGCw";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    const body = {
        contents: [{
            parts: [{
                text: `คุณเป็น AI ผู้ช่วยการเรียนสำหรับนักเรียนไทย ตอบเป็นภาษาไทย กระชับ ชัดเจน และเป็นมิตร\n\nคำถาม: ${input}`
            }]
        }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024
        }
    };

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const result = await res.json();

        // ถ้า API ตอบ error
        if(!res.ok){
            let errMsg = result?.error?.message || "ไม่ทราบสาเหตุ";
            console.error("Gemini API Error:", result);
            responseDiv.innerHTML = `❌ <strong>API Error ${res.status}:</strong> ${errMsg}<br><br>
                <small style="color:var(--text2)">💡 ลองเช็ค: API Key ถูกต้องมั้ย / quota หมดหรือเปล่า</small>`;
            return;
        }

        if(!result.candidates || !result.candidates[0]){
            console.error("No candidates:", result);
            // อาจโดน safety filter
            let reason = result.promptFeedback?.blockReason || "ไม่ทราบสาเหตุ";
            responseDiv.innerHTML = `❌ AI ไม่ตอบกลับ (${reason}) ลองถามใหม่อีกครั้งนะ`;
            return;
        }

        let text = result.candidates[0].content.parts[0].text;

        // แปลง Markdown พื้นฐาน → HTML
        text = text
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.*?)\*/g, "<em>$1</em>")
            .replace(/^#{1,3}\s(.+)$/gm, "<strong>$1</strong>")
            .replace(/\n/g, "<br>");

        responseDiv.innerHTML = text;

    } catch(err){
        console.error("Fetch Error:", err);
        responseDiv.innerHTML = `❌ เชื่อมต่อ AI ไม่ได้<br>
            <small style="color:var(--text2)">💡 ถ้า deploy บน GitHub Pages ควรใช้งานได้ปกติ / ถ้าเปิด file:// อยู่อาจถูก block CORS</small>`;
    }
}

// ===== Init =====
refresh();
showNotifications();
