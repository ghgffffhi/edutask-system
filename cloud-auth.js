/* =========================================================
   cloud-auth.js — Firebase-backed auth for EduTask Live
   Roles: teacher (owns one classroom) / student (joins one
   classroom via a join code). Bridges to the old localStorage
   "loggedIn" flag so every existing page's guard clause keeps
   working unchanged.
   ========================================================= */

function showAuthToast(msg){
  let t = document.getElementById("toast");
  if(!t) { alert(msg); return; }
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(()=> t.classList.remove("show"), 3000);
}

/* ---------- REGISTER: teacher ---------- */
function cloudRegisterTeacher(){
  let name = (document.getElementById("regNameT")||{}).value?.trim();
  let user = (document.getElementById("regUserT")||{}).value?.trim();
  let pass = (document.getElementById("regPassT")||{}).value;

  if(!name || !user || !pass){ showAuthToast("กรุณากรอกข้อมูลให้ครบ"); return; }
  if(pass.length < 6){ showAuthToast("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"); return; }

  auth.createUserWithEmailAndPassword(toAuthEmail(user), pass)
    .then(cred => {
      let uid = cred.user.uid;
      let joinCode = randomJoinCode();
      return db.collection("classrooms").add({
        teacherUid: uid, name: name + " — ห้องเรียน", joinCode,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }).then(clsRef =>
        db.collection("users").doc(uid).set({
          role: "teacher", name, classroomId: clsRef.id,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
      );
    })
    .then(()=>{
      showAuthToast("✅ สมัครครูสำเร็จ! กำลังเข้าสู่ระบบ...");
      setTimeout(()=> window.location.href = "login.html", 1000);
    })
    .catch(err => showAuthToast("❌ " + friendlyAuthError(err)));
}

/* ---------- REGISTER: student ---------- */
function cloudRegisterStudent(){
  let name = (document.getElementById("regNameS")||{}).value?.trim();
  let sid = (document.getElementById("regStudentId")||{}).value?.trim();
  let code = (document.getElementById("regJoinCode")||{}).value?.trim().toUpperCase();
  let user = (document.getElementById("regUserS")||{}).value?.trim();
  let pass = (document.getElementById("regPassS")||{}).value;

  if(!name || !sid || !code || !user || !pass){ showAuthToast("กรุณากรอกข้อมูลให้ครบ"); return; }
  if(pass.length < 6){ showAuthToast("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"); return; }

  db.collection("classrooms").where("joinCode","==",code).limit(1).get()
    .then(snap => {
      if(snap.empty) throw new Error("CODE_NOT_FOUND");
      let clsDoc = snap.docs[0];
      let clsId = clsDoc.id;
      return auth.createUserWithEmailAndPassword(toAuthEmail(user), pass).then(cred => {
        let uid = cred.user.uid;
        return Promise.all([
          db.collection("users").doc(uid).set({
            role: "student", name, studentId: sid, classroomId: clsId,
            coins: 0, xp: 0, createdAt: firebase.firestore.FieldValue.serverTimestamp()
          }),
          db.collection("classrooms").doc(clsId).collection("students").doc(uid).set({
            name, studentId: sid, joinedAt: firebase.firestore.FieldValue.serverTimestamp()
          })
        ]);
      });
    })
    .then(()=>{
      showAuthToast("✅ เข้าร่วมห้องเรียนสำเร็จ! กำลังเข้าสู่ระบบ...");
      setTimeout(()=> window.location.href = "login.html", 1000);
    })
    .catch(err => {
      if(err && err.message === "CODE_NOT_FOUND") showAuthToast("❌ ไม่พบรหัสห้องเรียนนี้ ตรวจสอบกับครูอีกครั้ง");
      else showAuthToast("❌ " + friendlyAuthError(err));
    });
}

/* ---------- LOGIN (both roles) ---------- */
function cloudLogin(){
  let user = (document.getElementById("loginUsername")||{}).value?.trim();
  let pass = (document.getElementById("loginPassword")||{}).value;
  if(!user || !pass){ showAuthToast("กรุณากรอกข้อมูลให้ครบ"); return; }

  auth.signInWithEmailAndPassword(toAuthEmail(user), pass)
    .then(cred => fetchAndCacheProfile(cred.user.uid))
    .then(profile => {
      localStorage.setItem("loggedIn", "true");
      window.location.href = profile.role === "teacher" ? "teacher.html" : "index.html";
    })
    .catch(err => showAuthToast("❌ " + friendlyAuthError(err)));
}

/* ---------- fetch + cache the signed-in user's profile ---------- */
function fetchAndCacheProfile(uid){
  return db.collection("users").doc(uid).get().then(doc => {
    if(!doc.exists) throw new Error("NO_PROFILE");
    let profile = doc.data();
    localStorage.setItem("user", JSON.stringify({ username: profile.name }));
    localStorage.setItem("userRole", profile.role);
    localStorage.setItem("userUid", uid);
    localStorage.setItem("userName", profile.name || "");
    if(profile.role === "student"){
      localStorage.setItem("classroomId", profile.classroomId || "");
      localStorage.setItem("studentId", profile.studentId || "");
      // mirror cloud coins/xp into the local goalsState so the shop/gacha
      // (which still read localStorage) reflect what the student earned
      let gs = JSON.parse(localStorage.getItem("goalsState")) || {};
      if((profile.coins||0) > (gs.coins||0)) gs.coins = profile.coins;
      if((profile.xp||0) > (gs.xp||0)) gs.xp = profile.xp;
      localStorage.setItem("goalsState", JSON.stringify(gs));
    }
    return profile;
  });
}

/* ---------- LOGOUT (overrides every page's older localStorage-only version) ---------- */
function logout(){
  auth.signOut().finally(()=>{
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userUid");
    window.location.href = "login.html";
  });
}

/* ---------- keep localStorage in sync with real Firebase session ---------- */
function friendlyAuthError(err){
  let code = err && err.code;
  if(code === "auth/email-already-in-use") return "ชื่อผู้ใช้นี้ถูกใช้แล้ว ลองชื่ออื่น";
  if(code === "auth/invalid-email") return "ชื่อผู้ใช้ไม่ถูกต้อง";
  if(code === "auth/wrong-password" || code === "auth/user-not-found" || code === "auth/invalid-credential") return "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
  if(code === "auth/weak-password") return "รหัสผ่านสั้นเกินไป";
  return (err && err.message) || "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง";
}

const PUBLIC_PAGES = ["login.html","register.html",""];
auth.onAuthStateChanged(user => {
  let page = location.pathname.split("/").pop();
  if(user){
    localStorage.setItem("loggedIn","true");
    // refresh cached profile in the background (covers page refresh / new tab)
    fetchAndCacheProfile(user.uid).catch(()=>{});
  } else {
    localStorage.removeItem("loggedIn");
    if(!PUBLIC_PAGES.includes(page)) window.location.href = "login.html";
  }
});
