/* =========================================================
   assignments.js — student-side real-time view of teacher
   assignments (index.html only). Marking a task complete
   awards coins/XP both in Firestore and in the local
   goalsState so the shop/gacha see it immediately.
   ========================================================= */

const ASSIGN_REWARD_COINS = 8;
const ASSIGN_REWARD_XP = 15;

let myUid = null, myClassroomId = null, myStudentId = null, myStudentName = null;

auth.onAuthStateChanged(user => {
    if(!user) return; // cloud-auth.js already redirects to login
    db.collection("users").doc(user.uid).get().then(doc => {
        if(!doc.exists || doc.data().role !== "student" || !doc.data().classroomId) return; // not a student in a class, keep panel hidden
        let profile = doc.data();
        myUid = user.uid;
        myClassroomId = profile.classroomId;
        myStudentId = profile.studentId;
        myStudentName = profile.name;
        document.getElementById("assignPanel").style.display = "block";
        listenTeacherAssignments();
    });
});

function listenTeacherAssignments(){
    db.collection("classrooms").doc(myClassroomId).collection("assignments")
      .orderBy("createdAt","desc")
      .onSnapshot(snap => {
          let list = document.getElementById("assignFromTeacher");
          let empty = document.getElementById("assignFromTeacherEmpty");
          if(snap.empty){ list.innerHTML = ""; empty.style.display = "block"; return; }
          empty.style.display = "none";
          list.innerHTML = "";
          snap.forEach(doc => renderAssignmentCard(doc.id, doc.data(), list));
      });
}

function renderAssignmentCard(id, a, list){
    let pcolor = a.priority === "สูง" ? "#fb7185" : a.priority === "ต่ำ" ? "#34d399" : "#fbbf24";
    let div = document.createElement("div");
    div.className = "teacher-assign-card";
    div.innerHTML = `
        <div class="ta-top">
            <span class="ta-dot" style="background:${pcolor}"></span>
            <span class="ta-title">${a.title}</span>
        </div>
        ${a.description ? `<div class="ta-desc">${a.description}</div>` : ""}
        <div class="ta-meta">
            <span>${a.dueDate ? `📅 กำหนดส่ง ${a.dueDate}` : "📅 ไม่กำหนดวันส่ง"}</span>
            <button class="ta-done-btn" id="taBtn-${id}" onclick="markAssignmentDone('${id}', this)">กำลังตรวจสอบ...</button>
        </div>
    `;
    list.appendChild(div);

    // check whether this student already completed it
    db.collection("classrooms").doc(myClassroomId).collection("assignments").doc(id)
      .collection("completions").doc(myUid).get().then(cDoc => {
          let btn = document.getElementById("taBtn-" + id);
          if(!btn) return;
          if(cDoc.exists){ btn.textContent = "✅ ทำเสร็จแล้ว"; btn.classList.add("done"); }
          else { btn.textContent = "ทำเสร็จแล้ว"; }
      });
}

function markAssignmentDone(id, btnEl){
    if(btnEl.classList.contains("done")) return;
    btnEl.disabled = true;
    let completionRef = db.collection("classrooms").doc(myClassroomId)
        .collection("assignments").doc(id).collection("completions").doc(myUid);
    let assignRef = db.collection("classrooms").doc(myClassroomId).collection("assignments").doc(id);
    let userRef = db.collection("users").doc(myUid);

    completionRef.set({
        completedAt: firebase.firestore.FieldValue.serverTimestamp(),
        studentName: myStudentName, studentId: myStudentId
    }).then(()=> Promise.all([
        assignRef.update({ completedCount: firebase.firestore.FieldValue.increment(1) }),
        userRef.update({
            coins: firebase.firestore.FieldValue.increment(ASSIGN_REWARD_COINS),
            xp: firebase.firestore.FieldValue.increment(ASSIGN_REWARD_XP)
        })
    ])).then(()=>{
        // mirror the reward into localStorage so shop/gacha update immediately
        let gs = JSON.parse(localStorage.getItem("goalsState")) || {};
        gs.coins = (gs.coins || 0) + ASSIGN_REWARD_COINS;
        gs.xp = (gs.xp || 0) + ASSIGN_REWARD_XP;
        localStorage.setItem("goalsState", JSON.stringify(gs));

        btnEl.textContent = "✅ ทำเสร็จแล้ว";
        btnEl.classList.add("done");
        btnEl.disabled = false;
        if(typeof playSound === "function") playSound("coin");
        if(typeof fireConfetti === "function") fireConfetti();
        showAuthToast(`🎉 ได้รับ 🪙 ${ASSIGN_REWARD_COINS} และ ⚡ ${ASSIGN_REWARD_XP} XP!`);
    }).catch(err => {
        btnEl.disabled = false;
        showAuthToast("❌ " + err.message);
    });
}
