function register(){
    let username = document.getElementById("registerUsername").value.trim();
    let password = document.getElementById("registerPassword").value;

    if(username === "" || password === ""){
        alert("กรุณากรอกข้อมูลให้ครบ");
        return;
    }

    if(password.length < 4){
        alert("รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร");
        return;
    }

    localStorage.setItem("user", JSON.stringify({ username, password }));
    alert("✅ สมัครสมาชิกสำเร็จ!");
    window.location.href = "login.html";
}

function login(){
    let username  = document.getElementById("loginUsername").value.trim();
    let password  = document.getElementById("loginPassword").value;
    let savedUser = JSON.parse(localStorage.getItem("user"));

    if(savedUser && username === savedUser.username && password === savedUser.password){
        localStorage.setItem("loggedIn", "true");
        window.location.href = "index.html";
    } else {
        alert("❌ ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    }
}
