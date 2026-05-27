if(localStorage.getItem("loggedIn") !== "true"){

    window.location.href = "login.html";
}
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];


function addTask(){

    let taskInput = document.getElementById("taskInput");
    let dateInput = document.getElementById("dateInput");

    let task = taskInput.value;
    let date = dateInput.value;
    let description = document.getElementById("descriptionInput").value;
    let subject = document.getElementById("subjectInput").value;
    let priority = document.getElementById("priorityInput").value;

    if(task === ""){
        alert("กรุณากรอกงาน");
        return;
    }

    let taskData = {
        text: task,
        date: date,
        completed: false,
        subject: subject,
        priority: priority,
        createdAt: new Date().toLocaleString(),
description: description,
pinned: false
    };

    tasks.push(taskData);
    showToast("✅ เพิ่มงานสำเร็จ");

    saveTasks();

    displayTasks();
    updateCalendar();
    updateDashboard();
    updateProgress();

    taskInput.value = "";
    dateInput.value = "";
}

function displayTasks(){

    let taskList = document.getElementById("taskList");

    taskList.innerHTML = "";

    let searchInput = document.getElementById("searchInput");
    let filterInput = document.getElementById("filterInput");

    let search = searchInput ? searchInput.value.toLowerCase() : "";
    let filter = filterInput ? filterInput.value : "all";

    tasks.forEach((task, index) => {

        let matchSearch =
            task.text.toLowerCase().includes(search);

        let matchFilter =
            filter === "all" ||
            (filter === "completed" && task.completed) ||
            (filter === "pending" && !task.completed);

        if(matchSearch && matchFilter){

            let li = document.createElement("li");

            if(task.pinned){
                li.classList.add("pinned");
            }

            if(task.priority === "สูง"){
                li.classList.add("high");
            }
            else if(task.priority === "กลาง"){
                li.classList.add("medium");
            }
            else{
                li.classList.add("low");
            }

            li.innerHTML = `
                <div class="task-content">

                    <strong style="
                        text-decoration:${task.completed ? "line-through" : "none"};
                        opacity:${task.completed ? "0.5" : "1"};
                    ">
                        ${task.pinned ? "📌 " : ""}${task.text}
                    </strong>

                    <br><br>

                    📝 ${task.description || "ไม่มีรายละเอียด"}

                    <br><br>

                    📚 ${task.subject}

                    <br><br>

                    🚨 ${task.priority}

                    <br><br>

                    📅 ${task.date}

                    <br><br>

                    ${getDeadlineWarning(task.date)}

                    <br><br>

                    🕒 ${task.createdAt}

                    <br><br>

                    <button onclick="toggleTask(${index})">
                        ${task.completed ? "ยกเลิก" : "เสร็จแล้ว"}
                    </button>

                    <button onclick="editTask(${index})">
                        แก้ไข
                    </button>

                    <button onclick="pinTask(${index})">
                        📌 ปักหมุด
                    </button>

                    <button onclick="deleteTask(${index})">
                        ลบ
                    </button>

                </div>
            `;

            taskList.appendChild(li);
        }
    });
}

function toggleTask(index){

    tasks[index].completed = !tasks[index].completed;
    showToast("🎉 อัปเดตสถานะงานแล้ว");

    saveTasks();

    displayTasks();
    updateCalendar();
    updateDashboard();
    updateProgress();
}

function deleteTask(index){

    tasks.splice(index,1);
    showToast("🗑️ ลบงานแล้ว");

    saveTasks();

    displayTasks();
    updateCalendar();
    updateDashboard();
    updateProgress();
}

function saveTasks(){

    localStorage.setItem("tasks", JSON.stringify(tasks));
}
function updateDashboard(){

    let total = tasks.length;

    let completed = tasks.filter(task => task.completed).length;

    let pending = total - completed;

    document.getElementById("totalTasks").textContent = total;

    document.getElementById("completedTasks").textContent = completed;

    document.getElementById("pendingTasks").textContent = pending;
}
function editTask(index){

    let newTask = prompt(
        "แก้ไขชื่องาน",
        tasks[index].text
    );

    if(newTask !== null && newTask !== ""){

        let newDescription = prompt(
            "แก้ไขรายละเอียดงาน",
            tasks[index].description || ""
        );

        let newDate = prompt(
            "แก้ไขวันส่ง",
            tasks[index].date || ""
        );

        tasks[index].text = newTask;

        tasks[index].description = newDescription;

        tasks[index].date = newDate;

        saveTasks();

        displayTasks();
        updateCalendar();
        updateDashboard();
        updateProgress();
    }
}
function toggleTheme(){

    document.body.classList.toggle("light-mode");

    let button = document.getElementById("themeToggle");

    if(document.body.classList.contains("light-mode")){
        button.innerHTML = "☀️ Light Mode";
    }
    else{
        button.innerHTML = "🌙 Dark Mode";
    }
}
function getDeadlineWarning(date){

    let today = new Date();

    let dueDate = new Date(date);

    let diffTime = dueDate - today;

    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if(diffDays <= 1 && diffDays >= 0){
    return "🚨 งานใกล้ถึงกำหนดส่ง";
    }

    else if(diffDays < 0){
    return "❌ เลยกำหนดส่งแล้ว";
    }

    else{
        return "";
    }
}

function pinTask(index){

    tasks[index].pinned = !tasks[index].pinned;

    tasks.sort((a,b) => b.pinned - a.pinned);

    saveTasks();

    displayTasks();

    updateCalendar();

    updateDashboard();

    updateProgress();
}
function showNotifications(){

    let urgentTasks = tasks.filter(task => {

        let dueDate = new Date(task.date);

        let today = new Date();

        let diffTime = dueDate - today;

        let diffDays =
            Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays <= 1 && diffDays >= 0;
    });

    if(urgentTasks.length > 0){

        showToast(
            `⚠️ มีงานใกล้ส่ง ${urgentTasks.length} งาน`
        );
    }
}
displayTasks();
updateCalendar();
updateDashboard();
updateProgress();
showNotifications();

function updateCalendar(){

    let calendar =
        document.getElementById("calendarPreview");

    calendar.innerHTML = "";

    let sortedTasks =
        [...tasks].sort((a,b)=>
            new Date(a.date) - new Date(b.date)
        );

    sortedTasks.slice(0,5).forEach(task=>{

        let div = document.createElement("div");

        div.classList.add("calendar-item");

        div.innerHTML = `
            📚 ${task.text}
            <br>
            📅 ${task.date}
        `;

        calendar.appendChild(div);
    });
}
function showToast(message){

    let toast = document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(()=>{
        toast.classList.remove("show");
    },3000);
}
function updateProgress(){

    let completed =
        tasks.filter(task => task.completed).length;

    let total = tasks.length;

    let percent =
        total === 0 ? 0 :
        Math.round((completed / total) * 100);

    document.getElementById("progressBar")
        .style.width = percent + "%";

    document.getElementById("progressText")
        .textContent = percent + "% เสร็จแล้ว";
}
function logout(){

    localStorage.removeItem("loggedIn");

    window.location.href = "login.html";
}
async function askAI(){

    let input =
        document.getElementById("aiInput").value;

    let response =
        document.getElementById("aiResponse");

    if(input === ""){
        response.innerHTML =
            "⚠️ กรุณาพิมพ์คำถาม";
        return;
    }

    response.innerHTML =
        "🤖 AI กำลังคิด...";

    const API_KEY = "AIzaSyBL30TyJWIYTF0s-_JK6iynqPTc8ByyWHE";

    const url =
`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    const data = {
        contents: [
            {
                parts: [
                    {
                        text: input
                    }
                ]
            }
        ]
    };

    try{

        const res = await fetch(url,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(data)
        });

        const result = await res.json();

        let aiText =
result.candidates[0].content.parts[0].text;

        response.innerHTML = aiText;
    }

    catch(error){

        response.innerHTML =
            "❌ เกิดข้อผิดพลาด";
    }
}