/* =========================================================
   teacher.js — Teacher dashboard: classroom code, post
   assignments, real-time roster + completion counts.
   ========================================================= */

let myClassroomId = null;

auth.onAuthStateChanged(user => {
    if(!user){ window.location.href = "login.html"; return; }
    db.collection("users").doc(user.uid).get().then(doc => {
        if(!doc.exists || doc.data().role !== "teacher"){
            document.getElementById("notTeacherMsg").style.display = "block";
            return;
        }
        myClassroomId = doc.data().classroomId;
        document.getElementById("teacherWrap").style.display = "flex";
        loadClassroomCode();
        listenAssignments();
        listenRoster();
    });
});

function loadClassroomCode(){
    if(!myClassroomId) return;
    db.collection("classrooms").doc(myClassroomId).get().then(doc => {
        if(doc.exists) document.getElementById("joinCodeDisplay").textContent = doc.data().joinCode;
    });
}

/* ---------- post a new assignment ---------- */
function postAssignment(){
    let title = document.getElementById("aTitle").value.trim();
    let desc = document.getElementById("aDesc").value.trim();
    let due = document.getElementById("aDue").value;
    let priority = document.getElementById("aPriority").value;

    if(!title){ showAuthToast("กรุณาใส่ชื่องาน"); return; }
    if(!myClassroomId) return;

    db.collection("classrooms").doc(myClassroomId).collection("assignments").add({
        title, description: desc, dueDate: due || null, priority,
        completedCount: 0,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(()=>{
        document.getElementById("aTitle").value = "";
        document.getElementById("aDesc").value = "";
        document.getElementById("aDue").value = "";
        if(typeof playSound === "function") playSound("complete");
        showAuthToast("📮 มอบหมายงานแล้ว! นักเรียนจะเห็นทันที");
    }).catch(err => showAuthToast("❌ " + err.message));
}

function deleteAssignment(id){
    if(!confirm("ลบงานนี้? นักเรียนจะไม่เห็นงานนี้อีกต่อไป")) return;
    db.collection("classrooms").doc(myClassroomId).collection("assignments").doc(id).delete();
}

/* ---------- real-time assignment list ---------- */
function listenAssignments(){
    db.collection("classrooms").doc(myClassroomId).collection("assignments")
      .orderBy("createdAt","desc")
      .onSnapshot(snap => {
          let list = document.getElementById("assignmentList");
          let empty = document.getElementById("assignEmpty");
          if(snap.empty){ list.innerHTML = ""; empty.style.display = "block"; return; }
          empty.style.display = "none";
          list.innerHTML = "";
          snap.forEach(doc => {
              let a = doc.data();
              let pcolor = a.priority === "สูง" ? "#fb7185" : a.priority === "ต่ำ" ? "#34d399" : "#fbbf24";
              let div = document.createElement("div");
              div.className = "teacher-assign-card";
              div.innerHTML = `
                  <div class="ta-top">
                      <span class="ta-dot" style="background:${pcolor}"></span>
                      <span class="ta-title">${a.title}</span>
                      <button class="ta-del" onclick="deleteAssignment('${doc.id}')">✕</button>
                  </div>
                  ${a.description ? `<div class="ta-desc">${a.description}</div>` : ""}
                  <div class="ta-meta">
                      ${a.dueDate ? `📅 กำหนดส่ง ${a.dueDate}` : "📅 ไม่กำหนดวันส่ง"}
                      &nbsp;·&nbsp; ✅ ทำแล้ว ${a.completedCount || 0} คน
                  </div>
              `;
              list.appendChild(div);
          });
      });
}

/* ---------- real-time roster ---------- */
function listenRoster(){
    db.collection("classrooms").doc(myClassroomId).collection("students")
      .orderBy("joinedAt","asc")
      .onSnapshot(snap => {
          let list = document.getElementById("rosterList");
          let empty = document.getElementById("rosterEmpty");
          document.getElementById("studentCount").textContent = snap.size + " คน";
          if(snap.empty){ list.innerHTML = ""; empty.style.display = "block"; return; }
          empty.style.display = "none";
          list.innerHTML = "";
          snap.forEach(doc => {
              let s = doc.data();
              let div = document.createElement("div");
              div.className = "roster-card";
              div.innerHTML = `
                  <div class="roster-avatar">🧑‍🎓</div>
                  <div>
                      <div class="roster-name">${s.name}</div>
                      <div class="roster-id">รหัส ${s.studentId}</div>
                  </div>
              `;
              list.appendChild(div);
          });
      });
}

function toggleTheme(){
    document.body.classList.toggle("light-mode");
    let dark = !document.body.classList.contains("light-mode");
    document.getElementById("themeToggle").innerHTML = dark ? "🌙" : "☀️";
    localStorage.setItem("theme", dark ? "dark" : "light");
}
if(localStorage.getItem("theme") === "light"){
    document.body.classList.add("light-mode");
    document.getElementById("themeToggle").innerHTML = "☀️";
}
