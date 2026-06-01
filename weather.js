/* =========================================================
   weather.js — ambient rain / snow overlay (canvas)
   Floating toggle button cycles: off → rain → snow → off
   Remembers choice in localStorage ("weatherMode").
   ========================================================= */
(function(){
  let canvas, ctx, particles = [], raf = null, mode = localStorage.getItem("weatherMode") || "off";
  let W = 0, H = 0;

  function makeCanvas(){
    canvas = document.createElement("canvas");
    canvas.id = "weatherCanvas";
    canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:900;";
    document.body.appendChild(canvas);
    ctx = canvas.getContext("2d");
    resize();
    window.addEventListener("resize", resize);
  }
  function resize(){
    if(!canvas) return;
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function spawn(){
    particles = [];
    if(mode === "off") return;
    let count = mode === "rain" ? 140 : 90;
    for(let i=0;i<count;i++) particles.push(newParticle());
  }
  function newParticle(){
    if(mode === "rain"){
      return { x: Math.random()*W, y: Math.random()*H,
        len: 8+Math.random()*12, vy: 9+Math.random()*7, vx: -1.5,
        op: 0.2+Math.random()*0.4 };
    } else { // snow
      return { x: Math.random()*W, y: Math.random()*H,
        r: 1.5+Math.random()*3, vy: 0.7+Math.random()*1.4,
        drift: Math.random()*Math.PI*2, vd: 0.01+Math.random()*0.03,
        op: 0.4+Math.random()*0.5 };
    }
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    if(mode === "rain"){
      ctx.strokeStyle = "rgba(150,190,255,0.5)";
      ctx.lineWidth = 1.4;
      particles.forEach(p=>{
        ctx.globalAlpha = p.op;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.vx*1.5, p.y + p.len);
        ctx.stroke();
        p.y += p.vy; p.x += p.vx;
        if(p.y > H){ p.y = -10; p.x = Math.random()*W; }
      });
      ctx.globalAlpha = 1;
    } else if(mode === "snow"){
      ctx.fillStyle = "#ffffff";
      particles.forEach(p=>{
        ctx.globalAlpha = p.op;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fill();
        p.drift += p.vd;
        p.y += p.vy; p.x += Math.sin(p.drift)*0.6;
        if(p.y > H){ p.y = -10; p.x = Math.random()*W; }
      });
      ctx.globalAlpha = 1;
    }
    raf = requestAnimationFrame(draw);
  }

  function start(){
    if(!canvas) makeCanvas();
    spawn();
    if(!raf && mode !== "off") draw();
    if(mode === "off" && raf){ cancelAnimationFrame(raf); raf = null; ctx.clearRect(0,0,W,H); }
  }

  const LABELS = { off:"🌦️", rain:"🌧️", snow:"❄️" };
  const NAMES  = { off:"ปิด", rain:"ฝนตก", snow:"หิมะตก" };

  window.weatherCycle = function(){
    mode = mode === "off" ? "rain" : mode === "rain" ? "snow" : "off";
    localStorage.setItem("weatherMode", mode);
    start();
    render();
    if(typeof showToast === "function") showToast(`${LABELS[mode]} ${NAMES[mode]}`);
  };

  function render(){
    let btn = document.getElementById("weatherBtn");
    if(btn) btn.textContent = LABELS[mode];
  }

  function mountBtn(){
    if(document.getElementById("weatherBtn")) return;
    let b = document.createElement("button");
    b.id = "weatherBtn";
    b.className = "weather-btn";
    b.title = "เปลี่ยนบรรยากาศ: ปิด / ฝน / หิมะ";
    b.textContent = LABELS[mode];
    b.onclick = window.weatherCycle;
    document.body.appendChild(b);
  }

  function init(){
    mountBtn();
    if(mode !== "off") start();
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
