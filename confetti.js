// ===== Lightweight Confetti (no library) =====
function fireConfetti(){
    let canvas = document.getElementById("confettiCanvas");
    if(!canvas){
        canvas = document.createElement("canvas");
        canvas.id = "confettiCanvas";
        document.body.appendChild(canvas);
    }
    let ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#2dd4bf", "#818cf8", "#a78bfa", "#fbbf24", "#fb7185", "#34d399", "#f0abfc"];
    let pieces = [];
    for(let i = 0; i < 130; i++){
        pieces.push({
            x: canvas.width / 2 + (Math.random() - 0.5) * 200,
            y: canvas.height / 2 - 60,
            vx: (Math.random() - 0.5) * 14,
            vy: Math.random() * -16 - 4,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            rot: Math.random() * 360,
            vr: (Math.random() - 0.5) * 20,
            shape: Math.random() > 0.5 ? "rect" : "circle"
        });
    }

    let frame = 0;
    function draw(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pieces.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.5;       // gravity
            p.vx *= 0.99;
            p.rot += p.vr;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot * Math.PI / 180);
            ctx.fillStyle = p.color;
            if(p.shape === "rect"){
                ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size * 0.6);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, p.size/2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        });
        frame++;
        if(frame < 140) requestAnimationFrame(draw);
        else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    draw();
}
