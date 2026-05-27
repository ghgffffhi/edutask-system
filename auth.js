function register(){

    let username =
        document.getElementById("registerUsername").value;

    let password =
        document.getElementById("registerPassword").value;

    if(username === "" || password === ""){
        alert("กรุณากรอกข้อมูล");
        return;
    }

    let user = {
        username: username,
        password: password
    };

    localStorage.setItem("user",
        JSON.stringify(user));

    alert("สมัครสมาชิกสำเร็จ");

    window.location.href = "login.html";
}

function login(){

    let username =
        document.getElementById("loginUsername").value;

    let password =
        document.getElementById("loginPassword").value;

    let savedUser =
        JSON.parse(localStorage.getItem("user"));

    if(
        savedUser &&
        username === savedUser.username &&
        password === savedUser.password
    ){

        alert("เข้าสู่ระบบสำเร็จ");

        localStorage.setItem("loggedIn","true");

        window.location.href = "index.html";
    }

    else{
        alert("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    }
}