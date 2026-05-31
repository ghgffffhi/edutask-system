if(localStorage.getItem("loggedIn") !== "true"){
    window.location.href = "login.html";
}

/* =========================================================
   ELEMENTS — rock/paper/scissors style
   fire 🔥 > grass 🌿 > water 💧 > fire
   ========================================================= */
const ELEMENTS = {
    fire:  { name:'ไฟ',   icon:'🔥', strong:'grass', color:'#fb7185' },
    water: { name:'น้ำ',  icon:'💧', strong:'fire',  color:'#60a5fa' },
    grass: { name:'ไม้',  icon:'🌿', strong:'water', color:'#34d399' }
};
function elemMult(atkElem, defElem){
    if(!atkElem || !defElem) return 1;
    if(ELEMENTS[atkElem] && ELEMENTS[atkElem].strong === defElem) return 1.5; // super effective
    if(ELEMENTS[defElem] && ELEMENTS[defElem].strong === atkElem) return 0.66; // not very effective
    return 1;
}

/* =========================================================
   FIGHTERS
   ========================================================= */
const FIGHTERS = {
    egg:    { emoji:'🥚', name:'ไข่ปริศนา',     hp:80,  atk:12, skill:'สั่นสะเทือน',  skillMult:1.4, hpG:8,  atkG:2, elem:'grass', chibi:{ hair:'#fcd34d', hair2:'#fde68a', outfit:'#a3e635', outfit2:'#65a30d', style:'short', weapon:null } },
    chick:  { emoji:'🐣', name:'ลูกไก่น้อย',   hp:100, atk:16, skill:'จิกรัว',       skillMult:1.5, hpG:12, atkG:3, elem:'grass', chibi:{ hair:'#fbbf24', hair2:'#fef08a', outfit:'#facc15', outfit2:'#ca8a04', style:'short', weapon:null } },
    cat:    { emoji:'🐱', name:'แมวน้อยจอมซน', hp:130, atk:22, skill:'ฟื้นพลัง',     skillMult:1.3, hpG:16, atkG:4, heal:true, elem:'water', chibi:{ hair:'#93c5fd', hair2:'#dbeafe', outfit:'#38bdf8', outfit2:'#0ea5e9', style:'twin', weapon:'staff' } },
    fox:    { emoji:'🦊', name:'จิ้งจอกจอมเก่ง', hp:150, atk:28, skill:'ตีสองครั้ง',  skillMult:1.8, hpG:18, atkG:5, elem:'fire', chibi:{ hair:'#fb923c', hair2:'#fed7aa', outfit:'#f97316', outfit2:'#c2410c', style:'twin', weapon:'sword' } },
    dragon: { emoji:'🐉', name:'มังกรในตำนาน', hp:200, atk:38, skill:'พ่นไฟ',        skillMult:2.0, hpG:24, atkG:7, elem:'fire', chibi:{ hair:'#f87171', hair2:'#fca5a5', outfit:'#dc2626', outfit2:'#7f1d1d', style:'long', weapon:'spear' } },
    golem:  { emoji:'🗿', name:'โกเลมหิน',      hp:260, atk:30, skill:'กำแพงหิน',     skillMult:1.6, hpG:26, atkG:6, elem:'grass', chibi:{ hair:'#a8a29e', hair2:'#d6d3d1', outfit:'#78716c', outfit2:'#44403c', style:'short', weapon:null } },
    demon:  { emoji:'👹', name:'อสูรแดง',       hp:240, atk:48, skill:'เปลวนรก',      skillMult:2.2, hpG:24, atkG:9, elem:'fire', chibi:{ hair:'#dc2626', hair2:'#f87171', outfit:'#991b1b', outfit2:'#450a0a', style:'long', weapon:'scythe' } },
    reaper: { emoji:'💀', name:'มัจจุราช',      hp:320, atk:60, skill:'เคียวสังหาร',  skillMult:2.5, hpG:34, atkG:12, elem:'water', chibi:{ hair:'#6366f1', hair2:'#a5b4fc', outfit:'#1e1b4b', outfit2:'#020617', style:'long', weapon:'scythe' } },
    // ===== Gacha-only chibi fighters =====
    sakura: { emoji:'🌸', name:'ซากุระจัง',     hp:140, atk:26, skill:'กลีบดาบ',     skillMult:1.7, hpG:17, atkG:5, elem:'grass', rarity:'R',  gacha:true, chibi:{ hair:'#f472b6', hair2:'#fbcfe8', outfit:'#ec4899', outfit2:'#be185d', style:'twin', weapon:'sword' } },
    yuki:   { emoji:'❄️', name:'ยูกิหิมะ',      hp:160, atk:24, skill:'พายุน้ำแข็ง', skillMult:1.8, hpG:18, atkG:5, heal:true, elem:'water', rarity:'SR', gacha:true, chibi:{ hair:'#a5f3fc', hair2:'#ecfeff', outfit:'#06b6d4', outfit2:'#0e7490', style:'long', weapon:'staff' } },
    hana:   { emoji:'🌺', name:'ฮานะดอกไม้',    hp:155, atk:27, skill:'พรพฤกษา',     skillMult:1.7, hpG:18, atkG:5, heal:true, elem:'grass', rarity:'SR', gacha:true, chibi:{ hair:'#4ade80', hair2:'#bbf7d0', outfit:'#16a34a', outfit2:'#14532d', style:'bun', weapon:'staff' } },
    akari:  { emoji:'🔆', name:'อาคาริเปลวไฟ',  hp:165, atk:34, skill:'ระบำเพลิง',   skillMult:2.0, hpG:19, atkG:6, elem:'fire', rarity:'SSR', gacha:true, chibi:{ hair:'#fb7185', hair2:'#fecdd3', outfit:'#e11d48', outfit2:'#881337', style:'twin', weapon:'spear' } },
    luna:   { emoji:'🌙', name:'ลูน่าจันทรา',   hp:180, atk:36, skill:'แสงจันทร์',   skillMult:2.1, hpG:20, atkG:7, heal:true, elem:'water', rarity:'SSR', gacha:true, chibi:{ hair:'#c4b5fd', hair2:'#ede9fe', outfit:'#7c3aed', outfit2:'#4c1d95', style:'long', weapon:'staff' } },
    hoshi:  { emoji:'⭐', name:'โฮชิดารา',       hp:200, atk:42, skill:'ฝนดาวตก',     skillMult:2.3, hpG:22, atkG:8, elem:'grass', rarity:'UR', gacha:true, chibi:{ hair:'#fde047', hair2:'#fef9c3', outfit:'#eab308', outfit2:'#854d0e', style:'twin', weapon:'bow' } }
};

/* rarity weights for gacha (higher = more common) */
const RARITY = {
    R:   { weight: 60, color:'#60a5fa', label:'R' },
    SR:  { weight: 28, color:'#a78bfa', label:'SR' },
    SSR: { weight: 10, color:'#fbbf24', label:'SSR' },
    UR:  { weight: 2,  color:'#fb7185', label:'UR' }
};

/* =========================================================
   ENEMIES — now with elements
   ========================================================= */
const ENEMIES = {
    slime:   { emoji:'🟢', name:'สไลม์',       hp:60,  atk:8,  lvl:1,  tier:'normal',   xp:30,  coins:10,  elem:'grass' },
    bat:     { emoji:'🦇', name:'ค้างคาว',     hp:80,  atk:12, lvl:2,  tier:'normal',   xp:45,  coins:15,  elem:'fire' },
    ghost:   { emoji:'👻', name:'ผีน้อย',      hp:110, atk:16, lvl:3,  tier:'normal',   xp:60,  coins:20,  elem:'water' },
    golem:   { emoji:'🗿', name:'โกเลมหิน',    hp:200, atk:24, lvl:5,  tier:'miniboss', xp:120, coins:50,  reward:'golem',  elem:'grass' },
    demon:   { emoji:'👹', name:'อสูรแดง',     hp:300, atk:36, lvl:8,  tier:'bigboss',  xp:250, coins:120, reward:'demon',  needTasks:5, elem:'fire' },
    reaper:  { emoji:'💀', name:'มัจจุราช',    hp:600, atk:70, lvl:20, tier:'secret',   xp:800, coins:500, reward:'reaper', needLvl:11, skin:'reaper_skin', elem:'water' }
};

/* =========================================================
   ITEMS — equippable gear (weapon / armor / charm)
   ========================================================= */
const ITEMS = {
    // weapons (+ATK)
    dagger:   { emoji:'🗡️', name:'มีดสั้น',      slot:'weapon', atk:6,  hp:0,  price:60,  elem:null },
    sword:    { emoji:'⚔️', name:'ดาบคู่',        slot:'weapon', atk:14, hp:0,  price:160, elem:null },
    fireStaff:{ emoji:'🔥', name:'คทาเพลิง',      slot:'weapon', atk:20, hp:0,  price:280, elem:'fire' },
    iceWand:  { emoji:'❄️', name:'คทาน้ำแข็ง',    slot:'weapon', atk:20, hp:0,  price:280, elem:'water' },
    vineWhip: { emoji:'🌿', name:'แส้พฤกษา',      slot:'weapon', atk:20, hp:0,  price:280, elem:'grass' },
    bow:      { emoji:'🏹', name:'ธนูสายฟ้า',     slot:'weapon', atk:26, hp:0,  price:400, elem:null },
    katana:   { emoji:'🗡️', name:'คาตานะศักดิ์สิทธิ์', slot:'weapon', atk:34, hp:0, price:600, elem:null },
    excalibur:{ emoji:'⚔️', name:'ดาบเอกซ์คาลิเบอร์', slot:'weapon', atk:46, hp:10, price:1000, elem:null },
    // armor (+HP)
    shield:   { emoji:'🛡️', name:'โล่เหล็ก',      slot:'armor',  atk:0,  hp:40,  price:120, elem:null },
    plate:    { emoji:'🥋', name:'เกราะนักรบ',    slot:'armor',  atk:0,  hp:90,  price:260, elem:null },
    aegis:    { emoji:'🛡️', name:'โล่เทพีอีจิส',  slot:'armor',  atk:5,  hp:150, price:520, elem:null },
    dragonArmor:{ emoji:'🐲', name:'เกราะมังกร',  slot:'armor',  atk:12, hp:220, price:900, elem:null },
    // charms (+ATK & +HP)
    ring:     { emoji:'💍', name:'แหวนเวท',       slot:'charm',  atk:8,  hp:30,  price:300, elem:null },
    crystal:  { emoji:'🔮', name:'คริสตัลพลัง',   slot:'charm',  atk:15, hp:60,  price:500, elem:null },
    star:     { emoji:'⭐', name:'ดาวนำโชค',      slot:'charm',  atk:22, hp:100, price:850, elem:null }
};

/* =========================================================
   POTIONS — consumable HP heal in battle
   ========================================================= */
const POTIONS = {
    smallPot: { emoji:'🧪', name:'ยาเล็ก',  heal:60,  price:40 },
    bigPot:   { emoji:'🍶', name:'ยาใหญ่',  heal:150, price:90 }
};

/* =========================================================
   SKINS
   ========================================================= */
const SKINS = {
    reaper_skin: { emoji:'😈', name:'วิญญาณมัจจุราช', from:'ล้มมัจจุราช' }
};

/* =========================================================
   LEADERBOARD — local, with simulated rival climbers
   (no server needed — rivals are generated & nudged daily)
   ========================================================= */
const RIVAL_NAMES = ["มิว","ปลื้ม","ฟ้า","เจได","น้ำหวาน","โบนัส","กาแฟ","ขนมจีน","ไอติม","พีช","มะนาว","ตูน"];
function seedRivals(){
    let board = JSON.parse(localStorage.getItem("towerBoard") || "null");
    let today = todayStr();
    if(!board){
        // create 7 rivals with random best floors
        let picked = [...RIVAL_NAMES].sort(()=>Math.random()-0.5).slice(0,7);
        board = { date: today, rivals: picked.map(n=>({ name:n, floor: 1 + Math.floor(Math.random()*9) })) };
    }
    // each new day, rivals climb a little (1-3 floors) so the board feels alive
    if(board.date !== today){
        board.rivals.forEach(r=> r.floor += 1 + Math.floor(Math.random()*3));
        board.date = today;
    }
    localStorage.setItem("towerBoard", JSON.stringify(board));
    return board;
}

function renderLeaderboard(){
    let el = document.getElementById("leaderboard");
    if(!el) return;
    let board = seedRivals();
    let me = { name:"เธอ (ฉัน)", floor: battle.towerBest || 0, isMe:true };
    let all = [...board.rivals.map(r=>({...r})), me].sort((a,b)=> b.floor - a.floor);
    el.innerHTML = "";
    all.forEach((p,i)=>{
        let medal = i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}`;
        let row = document.createElement("div");
        row.className = "lb-row" + (p.isMe?" lb-me":"");
        row.innerHTML = `
            <div class="lb-rank">${medal}</div>
            <div class="lb-name">${p.name}</div>
            <div class="lb-floor">ชั้น ${p.floor}</div>
        `;
        el.appendChild(row);
    });
}

/* =========================================================
   TOWER — endless climbing floors, scaling difficulty
   ========================================================= */
const TOWER_ENEMIES = ['🟢','🦇','👻','🗿','👺','👹','🐲','👁️','🦂','🐍'];
const TOWER_ELEMS = ['grass','fire','water'];
function towerEnemy(floor){
    // every 5th floor = boss, every 10th = elite boss
    let isBoss = floor % 5 === 0;
    let isElite = floor % 10 === 0;
    let baseHp = 60 + floor * 35 + (isBoss ? 120 : 0) + (isElite ? 250 : 0);
    let baseAtk = 8 + floor * 5 + (isBoss ? 14 : 0) + (isElite ? 30 : 0);
    let emoji = isElite ? '👑' : (isBoss ? '👹' : TOWER_ENEMIES[(floor-1) % TOWER_ENEMIES.length]);
    return {
        emoji,
        name: isElite ? `เจ้าหอคอย ชั้น ${floor}` : (isBoss ? `บอสชั้น ${floor}` : `ผู้พิทักษ์ชั้น ${floor}`),
        hp: baseHp, atk: baseAtk,
        lvl: floor,
        tier: isElite ? 'secret' : (isBoss ? 'bigboss' : 'normal'),
        xp: 40 + floor * 18 + (isBoss ? 100 : 0),
        coins: 15 + floor * 8 + (isBoss ? 60 : 0),
        elem: TOWER_ELEMS[(floor-1) % 3],
        isTower: true, floor
    };
}

/* =========================================================
   DAILY QUESTS — refresh each day
   ========================================================= */
const QUEST_POOL = [
    { id:'win2',     desc:'ชนะการต่อสู้ 2 ครั้ง',      goal:2, type:'win',       reward:60  },
    { id:'win4',     desc:'ชนะการต่อสู้ 4 ครั้ง',      goal:4, type:'win',       reward:120 },
    { id:'tower1',   desc:'ผ่านหอคอย 1 ชั้น',          goal:1, type:'tower',     reward:50  },
    { id:'tower3',   desc:'ผ่านหอคอย 3 ชั้น',          goal:3, type:'tower',     reward:130 },
    { id:'skill3',   desc:'ใช้สกิลพิเศษ 3 ครั้ง',      goal:3, type:'skill',     reward:70  },
    { id:'task2',    desc:'ทำงานให้เสร็จ 2 ชิ้น',      goal:2, type:'taskDone',   reward:80  },
    { id:'boss1',    desc:'ล้มบอส 1 ตัว',              goal:1, type:'bossWin',    reward:100 }
];

/* =========================================================
   STATE
   ========================================================= */
let battle = JSON.parse(localStorage.getItem("battleState")) || {
    level: 1, xp: 0,
    unlocked: ['egg'], active: 'egg',
    defeated: [], skins: [], skin: null,
    items: [],            // owned item ids
    equip: { weapon:null, armor:null, charm:null },
    potions: { smallPot:0, bigPot:0 },
    towerFloor: 1, towerBest: 0,
    quests: null, questDate: "",
    gachaTickets: 1, gachaPity: 0
};
migrateBattle();

function migrateBattle(){
    if(!battle.unlocked) battle.unlocked = ['egg'];
    if(!battle.defeated) battle.defeated = [];
    if(!battle.skins) battle.skins = [];
    if(!battle.items) battle.items = [];
    if(!battle.equip) battle.equip = { weapon:null, armor:null, charm:null };
    if(!battle.potions) battle.potions = { smallPot:0, bigPot:0 };
    if(battle.towerFloor === undefined) battle.towerFloor = 1;
    if(battle.towerBest === undefined) battle.towerBest = 0;
    if(battle.quests === undefined) battle.quests = null;
    if(battle.questDate === undefined) battle.questDate = "";
    if(battle.gachaTickets === undefined) battle.gachaTickets = 1;
    if(battle.gachaPity === undefined) battle.gachaPity = 0;
    rollDailyQuests();
    syncPetUnlocks();
}

/* ===== Daily Quests ===== */
function todayStr(){
    let d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function rollDailyQuests(){
    if(battle.questDate === todayStr() && battle.quests) return;
    let pool = [...QUEST_POOL].sort(() => Math.random() - 0.5).slice(0, 3);
    battle.quests = pool.map(q => ({ ...q, progress: 0, claimed: false }));
    battle.questDate = todayStr();
    save();
}
function questProgress(type, amt){
    if(!battle.quests) return;
    let changed = false;
    battle.quests.forEach(q => {
        if(q.type === type && !q.claimed && q.progress < q.goal){
            q.progress = Math.min(q.goal, q.progress + (amt || 1));
            changed = true;
        }
    });
    if(changed){ save(); if(document.getElementById("questList")) renderQuests(); }
}
function claimQuest(id){
    let q = battle.quests.find(x => x.id === id);
    if(!q || q.claimed || q.progress < q.goal) return;
    q.claimed = true;
    addCoins(q.reward);
    save();
    renderQuests(); renderLobby();
    if(typeof playSound === "function") playSound("levelup");
    if(typeof fireConfetti === "function") fireConfetti();
    showToast(`🎁 รับรางวัล +${q.reward} เหรียญ!`);
}

function syncPetUnlocks(){
    let gs = JSON.parse(localStorage.getItem("goalsState")) || { petStage: 0 };
    let chain = ['egg','chick','cat','fox','dragon'];
    for(let i = 0; i <= (gs.petStage || 0); i++){
        if(!battle.unlocked.includes(chain[i])) battle.unlocked.push(chain[i]);
    }
    save();
}

function xpForLevel(lvl){ return lvl * 100; }

/* =========================================================
   STAT CALC — base + level growth + equipped gear
   ========================================================= */
function gearBonus(){
    let atk = 0, hp = 0;
    Object.values(battle.equip).forEach(id => {
        if(id && ITEMS[id]){ atk += ITEMS[id].atk; hp += ITEMS[id].hp; }
    });
    return { atk, hp };
}

function fighterStats(id, lvl){
    let f = FIGHTERS[id];
    lvl = lvl || battle.level;
    let g = gearBonus();
    return {
        hp:  f.hp + f.hpG * (lvl - 1) + g.hp,
        atk: f.atk + f.atkG * (lvl - 1) + g.atk
    };
}

// active fighter's effective element (weapon element overrides)
function activeElem(){
    let w = battle.equip.weapon;
    if(w && ITEMS[w] && ITEMS[w].elem) return ITEMS[w].elem;
    return FIGHTERS[battle.active].elem;
}

/* =========================================================
   COINS (shared with goals economy)
   ========================================================= */
function getCoins(){ let gs = JSON.parse(localStorage.getItem("goalsState")) || {}; return gs.coins || 0; }
function spendCoins(amt){
    let gs = JSON.parse(localStorage.getItem("goalsState")) || {};
    gs.coins = Math.max(0, (gs.coins || 0) - amt);
    localStorage.setItem("goalsState", JSON.stringify(gs));
}
function addCoins(amt){
    let gs = JSON.parse(localStorage.getItem("goalsState")) || {};
    gs.coins = (gs.coins || 0) + amt;
    localStorage.setItem("goalsState", JSON.stringify(gs));
}

/* =========================================================
   LOBBY RENDER
   ========================================================= */
function renderLobby(){
    syncPetUnlocks();
    let f = FIGHTERS[battle.active];
    let st = fighterStats(battle.active);
    let el = activeElem();

    let emoji = (battle.skin && SKINS[battle.skin]) ? SKINS[battle.skin].emoji : f.emoji;
    document.getElementById("lobbyFighterEmoji").textContent = emoji;
    document.getElementById("lobbyFighterName").textContent = f.name;
    document.getElementById("lobbyFighterLvl").textContent = "Lv." + battle.level;
    document.getElementById("lobbyHP").textContent = st.hp;
    document.getElementById("lobbyATK").textContent = st.atk;
    document.getElementById("lobbySkill").textContent = f.skill;
    document.getElementById("lobbyElem").innerHTML = `${ELEMENTS[el].icon} ${ELEMENTS[el].name}`;

    let need = xpForLevel(battle.level);
    document.getElementById("lobbyXpFill").style.width = Math.min(100, (battle.xp / need) * 100) + "%";
    document.getElementById("lobbyXpText").textContent = `${battle.xp}/${need}`;

    document.getElementById("coinDisplay").textContent = getCoins();

    renderQuests();
    renderTower();
    renderGacha();
    renderEquip();
    renderBag();
    renderEnemies();
    renderShop();
    renderSkins();
}

/* ===== Quests Render ===== */
function renderQuests(){
    rollDailyQuests();
    // auto-sync taskDone quests with today's completed tasks
    let th = JSON.parse(localStorage.getItem("taskHistory")) || {};
    let todayDone = th[todayStr()] || 0;
    battle.quests.forEach(q => {
        if(q.type === "taskDone" && !q.claimed){
            q.progress = Math.min(q.goal, todayDone);
        }
    });
    save();

    let list = document.getElementById("questList");
    if(!list) return;
    list.innerHTML = "";
    battle.quests.forEach(q => {
        let pct = Math.min(100, (q.progress / q.goal) * 100);
        let done = q.progress >= q.goal;
        let div = document.createElement("div");
        div.className = "quest-card" + (q.claimed ? " claimed" : done ? " done" : "");
        div.innerHTML = `
            <div class="quest-info">
                <div class="quest-desc">${q.desc}</div>
                <div class="quest-bar-wrap"><div class="quest-bar" style="width:${pct}%"></div></div>
                <div class="quest-prog">${q.progress}/${q.goal}</div>
            </div>
            <div class="quest-reward">
                ${q.claimed
                    ? '<span class="quest-claimed">✓ รับแล้ว</span>'
                    : done
                        ? `<button class="quest-claim" onclick="claimQuest('${q.id}')">🎁 +${q.reward}</button>`
                        : `<span class="quest-pending">🪙${q.reward}</span>`}
            </div>
        `;
        list.appendChild(div);
    });
}

/* ===== Tower Render ===== */
function renderTower(){
    document.getElementById("towerFloor").textContent = battle.towerFloor;
    document.getElementById("towerBest").textContent = battle.towerBest;
    let next = towerEnemy(battle.towerFloor);
    document.getElementById("towerNext").innerHTML =
        `ชั้นต่อไป: ${next.emoji} ${next.name} <span style="color:${ELEMENTS[next.elem].color}">${ELEMENTS[next.elem].icon}</span> · ❤️${next.hp} ⚔️${next.atk}`;
    renderLeaderboard();
}

function renderEquip(){
    let slots = [
        { slot:'weapon', label:'อาวุธ', icon:'🗡️' },
        { slot:'armor',  label:'เกราะ', icon:'🛡️' },
        { slot:'charm',  label:'เครื่องราง', icon:'🔮' }
    ];
    let wrap = document.getElementById("equipSlots");
    wrap.innerHTML = "";
    slots.forEach(s => {
        let id = battle.equip[s.slot];
        let item = id ? ITEMS[id] : null;
        let div = document.createElement("div");
        div.className = "equip-slot" + (item ? " filled" : "");
        div.onclick = item ? () => unequip(s.slot) : null;
        div.innerHTML = item
            ? `<div class="equip-emoji">${item.emoji}</div><div class="equip-name">${item.name}</div>
               <div class="equip-bonus">${item.atk?`⚔️+${item.atk} `:''}${item.hp?`❤️+${item.hp}`:''}</div>
               <div class="equip-remove">ถอด</div>`
            : `<div class="equip-emoji dim">${s.icon}</div><div class="equip-name dim">ช่อง${s.label}</div>`;
        wrap.appendChild(div);
    });
}

function renderBag(){
    let grid = document.getElementById("bagGrid");
    grid.innerHTML = "";
    battle.unlocked.forEach(id => {
        let f = FIGHTERS[id];
        let st = fighterStats(id);
        let active = id === battle.active;
        let div = document.createElement("div");
        div.className = "bag-card" + (active ? " active" : "");
        div.onclick = () => selectFighter(id);
        let avatar = (f.chibi && typeof chibiFighterSVG === "function")
            ? `<div class="bag-chibi">${chibiFighterSVG(f.chibi, "idle")}</div>`
            : `<div class="bag-emoji">${f.emoji}</div>`;
        let rarityTag = f.rarity ? `<div class="bag-rarity r-${f.rarity}">${f.rarity}</div>` : '';
        div.innerHTML = `
            ${active ? '<div class="bag-active-tag">กำลังใช้</div>' : ''}
            ${rarityTag}
            ${avatar}
            <div class="bag-name">${f.name}</div>
            <div class="bag-elem" style="color:${ELEMENTS[f.elem].color}">${ELEMENTS[f.elem].icon} ${ELEMENTS[f.elem].name}</div>
            <div class="bag-stats">❤️${st.hp} ⚔️${st.atk}</div>
            <div class="bag-skill">✨ ${f.skill}</div>
        `;
        grid.appendChild(div);
    });
}

function renderEnemies(){
    let grid = document.getElementById("enemyGrid");
    grid.innerHTML = "";
    let tasksDone = (JSON.parse(localStorage.getItem("tasks")) || []).filter(t => t.completed).length;

    Object.keys(ENEMIES).forEach(id => {
        let e = ENEMIES[id];
        let locked = false, lockReason = "";
        if(e.needTasks && tasksDone < e.needTasks){ locked = true; lockReason = `ทำงานให้ครบ ${e.needTasks} ชิ้น (${tasksDone}/${e.needTasks})`; }
        if(e.needLvl && battle.level < e.needLvl){ locked = true; lockReason = `ต้องถึง Lv.${e.needLvl} (ตอนนี้ Lv.${battle.level})`; }

        let tierLabel = { normal:'ธรรมดา', miniboss:'บอสเล็ก', bigboss:'บอสใหญ่', secret:'ตัวลับ' }[e.tier];
        let defeated = battle.defeated.includes(id);

        let div = document.createElement("div");
        div.className = `enemy-card tier-${e.tier}` + (locked ? " locked" : "");
        div.onclick = locked ? null : () => startBattle(id);
        div.innerHTML = `
            <div class="enemy-tier">${tierLabel}</div>
            <div class="enemy-emoji">${locked ? '🔒' : e.emoji}</div>
            <div class="enemy-name">${e.name} ${defeated ? '✓' : ''}</div>
            <div class="enemy-elem" style="color:${ELEMENTS[e.elem].color}">${ELEMENTS[e.elem].icon}</div>
            <div class="enemy-stats">Lv.${e.lvl} · ❤️${e.hp} · ⚔️${e.atk}</div>
            <div class="enemy-reward">🏆 ${e.xp}xp · 🪙${e.coins}${e.reward ? ' · 🔓' : ''}</div>
            ${locked ? `<div class="enemy-lock">${lockReason}</div>` : ''}
        `;
        grid.appendChild(div);
    });
}

function renderShop(){
    // items
    let itemGrid = document.getElementById("itemShop");
    itemGrid.innerHTML = "";
    Object.keys(ITEMS).forEach(id => {
        let it = ITEMS[id];
        let owned = battle.items.includes(id);
        let equipped = Object.values(battle.equip).includes(id);
        let div = document.createElement("div");
        div.className = "shopitem-card";
        let btn;
        if(equipped) btn = `<button class="si-btn equipped" disabled>กำลังใส่</button>`;
        else if(owned) btn = `<button class="si-btn equip" onclick="equipItem('${id}')">สวมใส่</button>`;
        else btn = `<button class="si-btn buy" onclick="buyItem('${id}')">🪙${it.price}</button>`;
        div.innerHTML = `
            <div class="si-emoji">${it.emoji}</div>
            <div class="si-name">${it.name}</div>
            <div class="si-bonus">${it.atk?`⚔️+${it.atk} `:''}${it.hp?`❤️+${it.hp} `:''}${it.elem?ELEMENTS[it.elem].icon:''}</div>
            ${btn}
        `;
        itemGrid.appendChild(div);
    });

    // potions
    let potGrid = document.getElementById("potionShop");
    potGrid.innerHTML = "";
    Object.keys(POTIONS).forEach(id => {
        let p = POTIONS[id];
        let have = battle.potions[id] || 0;
        let div = document.createElement("div");
        div.className = "shopitem-card";
        div.innerHTML = `
            <div class="si-emoji">${p.emoji}</div>
            <div class="si-name">${p.name}</div>
            <div class="si-bonus">ฟื้น ❤️${p.heal} · มี ${have}</div>
            <button class="si-btn buy" onclick="buyPotion('${id}')">🪙${p.price}</button>
        `;
        potGrid.appendChild(div);
    });
}

/* =========================================================
   GACHA — summon chibi fighters with coins or tickets
   ========================================================= */
const GACHA_COST_COINS = 200;
const PITY_THRESHOLD = 10; // guaranteed SSR+ within this many pulls

function renderGacha(){
    document.getElementById("gachaTickets").textContent = battle.gachaTickets || 0;
    document.getElementById("gachaCoinCost").textContent = GACHA_COST_COINS;
    let pity = battle.gachaPity || 0;
    document.getElementById("gachaPity").textContent = `${pity}/${PITY_THRESHOLD}`;
    // preview pool
    let pool = Object.keys(FIGHTERS).filter(id=>FIGHTERS[id].gacha);
    let owned = pool.filter(id=>battle.unlocked.includes(id)).length;
    document.getElementById("gachaCollected").textContent = `${owned}/${pool.length}`;
}

function rollRarity(){
    // pity: force SSR/UR if threshold reached
    if((battle.gachaPity || 0) >= PITY_THRESHOLD - 1){
        return Math.random() < 0.7 ? 'SSR' : 'UR';
    }
    let total = Object.values(RARITY).reduce((a,r)=>a+r.weight,0);
    let roll = Math.random() * total;
    for(let key of Object.keys(RARITY)){
        roll -= RARITY[key].weight;
        if(roll <= 0) return key;
    }
    return 'R';
}

function doGacha(payType){
    // check cost
    if(payType === "ticket"){
        if((battle.gachaTickets||0) < 1){ showToast("🎫 ไม่มีตั๋วกาชา!"); return; }
    } else {
        if(getCoins() < GACHA_COST_COINS){ showToast("🪙 เหรียญไม่พอ!"); if(typeof playSound==="function") playSound("error"); return; }
    }

    let pool = Object.keys(FIGHTERS).filter(id=>FIGHTERS[id].gacha);
    let rarity = rollRarity();
    let candidates = pool.filter(id=>FIGHTERS[id].rarity === rarity);
    if(candidates.length === 0) candidates = pool; // fallback
    let win = candidates[Math.floor(Math.random()*candidates.length)];
    let f = FIGHTERS[win];
    let dup = battle.unlocked.includes(win);

    // pay
    if(payType === "ticket") battle.gachaTickets--;
    else spendCoins(GACHA_COST_COINS);

    // pity update
    if(rarity === 'SSR' || rarity === 'UR') battle.gachaPity = 0;
    else battle.gachaPity = (battle.gachaPity || 0) + 1;

    // grant
    let coinBack = 0;
    if(dup){
        coinBack = { R:30, SR:60, SSR:120, UR:250 }[rarity] || 30;
        addCoins(coinBack);
    } else {
        battle.unlocked.push(win);
    }
    save();
    showGachaResult(win, rarity, dup, coinBack, payType);
}

function showGachaResult(winId, rarity, dup, coinBack, payType){
    let f = FIGHTERS[winId];
    let rc = RARITY[rarity];
    let overlay = document.getElementById("gachaOverlay");
    let box = document.getElementById("gachaResultBox");
    box.className = "gacha-result-box reveal r-border-" + rarity;
    let avatar = (f.chibi && typeof chibiFighterSVG === "function") ? chibiFighterSVG(f.chibi,"idle") : `<div style="font-size:80px">${f.emoji}</div>`;
    document.getElementById("gachaResultInner").innerHTML = `
        <div class="gacha-rarity-badge" style="background:${rc.color}">${rc.label}</div>
        <div class="gacha-result-chibi">${avatar}</div>
        <div class="gacha-result-name">${f.name}</div>
        <div class="gacha-result-elem" style="color:${ELEMENTS[f.elem].color}">${ELEMENTS[f.elem].icon} ${ELEMENTS[f.elem].name} · ✨ ${f.skill}</div>
        ${dup ? `<div class="gacha-dup">ได้ซ้ำ! แปลงเป็น 🪙 +${coinBack}</div>` : `<div class="gacha-new">🎉 ตัวละครใหม่!</div>`}
    `;
    overlay.classList.add("show");
    if(rarity === 'SSR' || rarity === 'UR'){ if(typeof fireConfetti==="function") fireConfetti(); }
    if(typeof playSound === "function") playSound(rarity === 'R' ? "click" : "levelup");
}

function closeGacha(){
    document.getElementById("gachaOverlay").classList.remove("show");
    renderLobby();
}

function renderSkins(){
    let grid = document.getElementById("skinGrid");
    grid.innerHTML = "";
    let none = document.createElement("div");
    none.className = "skin-card" + (!battle.skin ? " active" : "");
    none.onclick = () => { battle.skin = null; save(); renderLobby(); };
    none.innerHTML = `<div class="skin-emoji">🚫</div><div class="skin-name">ปกติ</div>`;
    grid.appendChild(none);

    Object.keys(SKINS).forEach(id => {
        let s = SKINS[id];
        let owned = battle.skins.includes(id);
        let div = document.createElement("div");
        div.className = "skin-card" + (battle.skin === id ? " active" : "") + (owned ? "" : " locked");
        div.onclick = owned ? () => { battle.skin = id; save(); renderLobby(); showToast("🎨 เปลี่ยนสกินแล้ว!"); } : null;
        div.innerHTML = `<div class="skin-emoji">${owned ? s.emoji : '🔒'}</div><div class="skin-name">${s.name}</div>${!owned ? `<div class="skin-from">${s.from}</div>` : ''}`;
        grid.appendChild(div);
    });
}

/* ===== Shop actions ===== */
function buyItem(id){
    let it = ITEMS[id];
    if(getCoins() < it.price){ showToast("🪙 เหรียญไม่พอ!"); if(typeof playSound==="function") playSound("error"); return; }
    spendCoins(it.price);
    battle.items.push(id);
    battle.equip[it.slot] = id; // auto-equip
    save(); renderLobby();
    if(typeof playSound==="function") playSound("coin");
    showToast(`✨ ซื้อ ${it.name} แล้ว! สวมให้เลย`);
}
function equipItem(id){
    let it = ITEMS[id];
    battle.equip[it.slot] = id;
    save(); renderLobby();
    showToast(`🗡️ สวม ${it.name} แล้ว`);
}
function unequip(slot){
    battle.equip[slot] = null;
    save(); renderLobby();
}
function buyPotion(id){
    let p = POTIONS[id];
    if(getCoins() < p.price){ showToast("🪙 เหรียญไม่พอ!"); if(typeof playSound==="function") playSound("error"); return; }
    spendCoins(p.price);
    battle.potions[id] = (battle.potions[id] || 0) + 1;
    save(); renderLobby();
    if(typeof playSound==="function") playSound("coin");
    showToast(`🧪 ซื้อ ${p.name} แล้ว!`);
}

function selectFighter(id){
    battle.active = id;
    save(); renderLobby();
    if(typeof playSound === "function") playSound("click");
    showToast(`เลือก ${FIGHTERS[id].name} แล้ว!`);
}

/* =========================================================
   BATTLE ENGINE
   ========================================================= */
let combat = null;

function startTower(){
    let e = towerEnemy(battle.towerFloor);
    startBattleWith(e, true);
}

function resetTower(){
    if(battle.towerFloor <= 1){ showToast("อยู่ชั้น 1 อยู่แล้วนะ"); return; }
    if(!confirm("เริ่มหอคอยใหม่จากชั้น 1? (สถิติสูงสุดยังเก็บไว้)")) return;
    battle.towerFloor = 1;
    save(); renderTower();
    showToast("↺ กลับมาเริ่มชั้น 1 แล้ว");
}

function startBattle(enemyId){
    let e = ENEMIES[enemyId];
    startBattleWith({ ...e, enemyId }, false);
}

function startBattleWith(e, isTower){
    let st = fighterStats(battle.active);
    let f = FIGHTERS[battle.active];

    combat = {
        enemyId: e.enemyId || null,
        isTower: isTower,
        towerFloor: isTower ? battle.towerFloor : null,
        enemy: { ...e, curHp: e.hp, maxHp: e.hp },
        player: { curHp: st.hp, maxHp: st.hp, atk: st.atk, elem: activeElem(), ...f },
        turn: "player", over: false
    };

    document.getElementById("lobbyView").style.display = "none";
    document.getElementById("battleView").style.display = "block";

    let pSprite = document.getElementById("playerSprite");
    if(f.chibi && typeof chibiFighterSVG === "function"){
        pSprite.innerHTML = chibiFighterSVG(f.chibi, "idle");
        pSprite.classList.add("is-chibi");
    } else {
        let pEmoji = (battle.skin && SKINS[battle.skin]) ? SKINS[battle.skin].emoji : f.emoji;
        pSprite.textContent = pEmoji;
        pSprite.classList.remove("is-chibi");
    }
    document.getElementById("playerName").innerHTML = `${f.name} Lv.${battle.level} <span style="color:${ELEMENTS[combat.player.elem].color}">${ELEMENTS[combat.player.elem].icon}</span>`;
    document.getElementById("enemySprite").textContent = e.emoji;
    document.getElementById("enemyName").innerHTML = `${e.name} <span style="color:${ELEMENTS[e.elem].color}">${ELEMENTS[e.elem].icon}</span>`;
    document.getElementById("skillBtn").textContent = "✨ " + f.skill;

    renderPotionButtons();
    document.getElementById("battleLog").innerHTML = "";
    logMsg(`การต่อสู้กับ <b>${e.name}</b> เริ่มขึ้น!`);
    let mult = elemMult(combat.player.elem, e.elem);
    if(mult > 1) logMsg(`🌟 ธาตุของเธอได้เปรียบ! (x1.5)`);
    else if(mult < 1) logMsg(`⚠️ ธาตุของเธอเสียเปรียบ (x0.66)`);
    updateBars();
    enableActions(true);
    if(typeof playSound === "function") playSound("click");
}

function renderPotionButtons(){
    let wrap = document.getElementById("potionBtns");
    wrap.innerHTML = "";
    Object.keys(POTIONS).forEach(id => {
        let count = battle.potions[id] || 0;
        if(count <= 0) return;
        let p = POTIONS[id];
        let btn = document.createElement("button");
        btn.className = "potion-btn";
        btn.innerHTML = `${p.emoji} ${p.name} (${count})`;
        btn.onclick = () => usePotion(id);
        wrap.appendChild(btn);
    });
}

function usePotion(id){
    if(combat.over || combat.turn !== "player") return;
    if((battle.potions[id] || 0) <= 0) return;
    let p = POTIONS[id];
    battle.potions[id]--;
    save();
    let before = combat.player.curHp;
    combat.player.curHp = Math.min(combat.player.maxHp, combat.player.curHp + p.heal);
    let healed = Math.round(combat.player.curHp - before);
    logMsg(`🧪 ใช้ ${p.name} ฟื้น ${healed} HP!`);
    healFx("player");
    if(typeof playSound==="function") playSound("complete");
    updateBars();
    renderPotionButtons();
    // using potion takes the turn
    enableActions(false);
    combat.turn = "enemy";
    setTimeout(enemyTurn, 1000);
}

function updateBars(){
    let p = combat.player, e = combat.enemy;
    document.getElementById("playerHpBar").style.width = Math.max(0, (p.curHp/p.maxHp)*100) + "%";
    document.getElementById("enemyHpBar").style.width = Math.max(0, (e.curHp/e.maxHp)*100) + "%";
    document.getElementById("playerHpText").textContent = `${Math.max(0,Math.round(p.curHp))}/${p.maxHp}`;
    document.getElementById("enemyHpText").textContent = `${Math.max(0,Math.round(e.curHp))}/${e.maxHp}`;
}

function logMsg(msg){
    let log = document.getElementById("battleLog");
    let p = document.createElement("div");
    p.className = "log-line"; p.innerHTML = msg;
    log.appendChild(p); log.scrollTop = log.scrollHeight;
}
function enableActions(on){ document.querySelectorAll(".action-btn, .potion-btn").forEach(b => b.disabled = !on); }
function rand(min, max){ return Math.random() * (max - min) + min; }

function playerAttack(type){
    if(combat.over || combat.turn !== "player") return;
    enableActions(false);
    let p = combat.player, e = combat.enemy;
    let isSkill = type === "skill";
    if(isSkill) questProgress("skill", 1);
    let mult = elemMult(p.elem, e.elem);
    let dmg;

    if(isSkill){
        if(p.heal){
            let healAmt = Math.round(p.maxHp * 0.25);
            p.curHp = Math.min(p.maxHp, p.curHp + healAmt);
            dmg = Math.round(p.atk * rand(0.8,1.0) * mult);
            logMsg(`✨ <b>${p.name}</b> ใช้ ${p.skill} ฟื้น ${healAmt} HP และโจมตี ${dmg}!`);
            healFx("player");
        } else if(p.skill === "ตีสองครั้ง"){
            let d1 = Math.round(p.atk * rand(0.7,0.9) * mult);
            let d2 = Math.round(p.atk * rand(0.7,0.9) * mult);
            dmg = d1 + d2;
            logMsg(`✨ <b>${p.name}</b> ใช้ ${p.skill}! ${d1} + ${d2} = ${dmg}!`);
        } else {
            dmg = Math.round(p.atk * p.skillMult * rand(0.9,1.1) * mult);
            logMsg(`✨ <b>${p.name}</b> ใช้ ${p.skill}! ${dmg} ดาเมจ!`);
        }
    } else {
        dmg = Math.round(p.atk * rand(0.85,1.15) * mult);
        logMsg(`⚔️ <b>${p.name}</b> โจมตี! ${dmg} ดาเมจ`);
    }
    if(mult > 1) logMsg(`&nbsp;&nbsp;🌟 ได้เปรียบธาตุ!`);

    attackFx("player", isSkill);
    setTimeout(()=>{
        e.curHp -= dmg;
        hitFx("enemy"); showDamage("enemy", dmg, isSkill || mult > 1);
        slashFx("enemy", isSkill ? p.elem : null);
        if(typeof playSound === "function") playSound(isSkill ? "levelup" : "click");
        updateBars();
        if(e.curHp <= 0){ setTimeout(() => endBattle(true), 700); return; }
        combat.turn = "enemy";
        setTimeout(enemyTurn, 1000);
    }, 280);
}

function enemyTurn(){
    if(combat.over) return;
    let p = combat.player, e = combat.enemy;
    let mult = elemMult(e.elem, p.elem);
    let dmg = Math.round(e.atk * rand(0.85,1.15) * mult);
    attackFx("enemy", false);
    setTimeout(()=>{
        p.curHp -= dmg;
        logMsg(`💢 <b>${e.name}</b> โจมตีกลับ! ${dmg} ดาเมจ`);
        hitFx("player"); showDamage("player", dmg, mult > 1);
        slashFx("player", null);
        if(typeof playSound === "function") playSound("error");
        updateBars();
        if(p.curHp <= 0){ setTimeout(() => endBattle(false), 700); return; }
        combat.turn = "player";
        enableActions(true);
    }, 280);
}

/* ===== FX ===== */
function attackFx(who, isSkill){
    let s = document.getElementById(who==="enemy"?"enemySprite":"playerSprite");
    let cls = who === "player" ? "lunge-right" : "lunge-left";
    s.classList.remove("lunge-right","lunge-left"); void s.offsetWidth;
    s.classList.add(cls);
    if(isSkill){ s.classList.add("skill-glow"); setTimeout(()=>s.classList.remove("skill-glow"), 600); }
    setTimeout(()=> s.classList.remove(cls), 450);
}
function slashFx(targetWho, elem){
    let side = document.querySelector(targetWho==="enemy"?".enemy-side":".player-side");
    if(!side) return;
    let slash = document.createElement("div");
    slash.className = "slash-fx" + (elem ? " elem-"+elem : "");
    slash.textContent = elem ? ({fire:"🔥",water:"💧",grass:"🍃"}[elem]||"✦") : "";
    side.appendChild(slash);
    setTimeout(()=> slash.remove(), 500);
}
function hitFx(who){ let s = document.getElementById(who==="enemy"?"enemySprite":"playerSprite"); s.classList.remove("shake"); void s.offsetWidth; s.classList.add("shake"); }
function healFx(who){ let s = document.getElementById(who==="enemy"?"enemySprite":"playerSprite"); s.classList.remove("heal"); void s.offsetWidth; s.classList.add("heal"); }
function showDamage(who, dmg, crit){
    let side = document.querySelector(who==="enemy"?".enemy-side":".player-side");
    let pop = document.createElement("div");
    pop.className = "dmg-pop" + (crit?" crit":"");
    pop.textContent = "-" + dmg;
    side.appendChild(pop);
    setTimeout(() => pop.remove(), 900);
}

/* ===== END ===== */
function endBattle(win){
    combat.over = true; enableActions(false);
    let e = combat.enemy;
    let overlay = document.getElementById("resultOverlay");
    let rewardsEl = document.getElementById("resultRewards");

    if(win){
        document.getElementById("resultEmoji").textContent = "🏆";
        document.getElementById("resultTitle").textContent = "ชนะแล้ว!";
        document.getElementById("resultBox").className = "result-box win";
        let html = `<div class="reward-line">⚡ +${e.xp} XP</div><div class="reward-line">🪙 +${e.coins} เหรียญ</div>`;
        addXP(e.xp); addCoins(e.coins);

        // quest tracking
        questProgress("win", 1);
        if(e.tier === "bigboss" || e.tier === "miniboss" || e.tier === "secret") questProgress("bossWin", 1);

        // gacha ticket rewards: bosses give tickets
        let ticketGain = 0;
        if(e.tier === "secret") ticketGain = 3;
        else if(e.tier === "bigboss") ticketGain = 2;
        else if(e.tier === "miniboss") ticketGain = 1;

        if(combat.isTower){
            // advance floor
            questProgress("tower", 1);
            battle.towerFloor += 1;
            if(battle.towerFloor - 1 > battle.towerBest) battle.towerBest = battle.towerFloor - 1;
            html += `<div class="reward-line unlock">🗼 ผ่านชั้น ${combat.towerFloor}! ไปต่อชั้น ${battle.towerFloor}</div>`;
            // every 5th tower floor grants a ticket
            if(combat.towerFloor % 5 === 0) ticketGain += 1;
        } else {
            // normal enemy unlock rewards
            if(!battle.defeated.includes(combat.enemyId)){
                battle.defeated.push(combat.enemyId);
                let en = ENEMIES[combat.enemyId];
                if(en && en.reward && !battle.unlocked.includes(en.reward)){ battle.unlocked.push(en.reward); html += `<div class="reward-line unlock">🔓 ปลดล็อก ${FIGHTERS[en.reward].name}!</div>`; }
                if(en && en.skin && !battle.skins.includes(en.skin)){ battle.skins.push(en.skin); html += `<div class="reward-line unlock">🎨 ปลดล็อกสกิน ${SKINS[en.skin].name}!</div>`; }
            }
        }
        if(ticketGain > 0){
            battle.gachaTickets = (battle.gachaTickets || 0) + ticketGain;
            html += `<div class="reward-line unlock">🎫 ได้ตั๋วกาชา +${ticketGain}!</div>`;
        }
        rewardsEl.innerHTML = html; save();
        if(typeof fireConfetti === "function") fireConfetti();
        if(typeof playSound === "function") playSound("levelup");
        if(typeof chibiReact === "function") chibiReact("win");
    } else {
        document.getElementById("resultEmoji").textContent = "💔";
        document.getElementById("resultTitle").textContent = "พ่ายแพ้...";
        document.getElementById("resultBox").className = "result-box lose";
        let msg = combat.isTower
            ? `ไปได้ถึงชั้น ${combat.towerFloor}! อัพเลเวล/อาวุธแล้วลองใหม่นะ 💪`
            : `อย่าเพิ่งยอมแพ้! อัพเลเวล ซื้ออาวุธ/ยา แล้วลองใหม่นะ 💪`;
        rewardsEl.innerHTML = `<div class="reward-line">${msg}</div>`;
        if(typeof playSound === "function") playSound("error");
        if(typeof chibiReact === "function") chibiReact("lose");
    }
    overlay.classList.add("show");
}

function closeBattle(){
    document.getElementById("resultOverlay").classList.remove("show");
    document.getElementById("battleView").style.display = "none";
    document.getElementById("lobbyView").style.display = "block";
    combat = null; renderLobby();
}
function fleeBattle(){
    if(combat.over) return;
    showToast("🏃 หนีออกจากการต่อสู้");
    document.getElementById("battleView").style.display = "none";
    document.getElementById("lobbyView").style.display = "block";
    combat = null; renderLobby();
}

function addXP(amt){
    battle.xp += amt;
    let up = false;
    while(battle.xp >= xpForLevel(battle.level)){ battle.xp -= xpForLevel(battle.level); battle.level += 1; up = true; }
    if(up) setTimeout(() => showToast(`🎉 เลเวลอัพ! ตอนนี้ Lv.${battle.level}`), 600);
    save();
}

/* ===== Helpers ===== */
function save(){ localStorage.setItem("battleState", JSON.stringify(battle)); }
function showToast(msg){ let t = document.getElementById("toast"); t.textContent = msg; t.classList.add("show"); setTimeout(() => t.classList.remove("show"), 3000); }
function toggleTheme(){
    document.body.classList.toggle("light-mode");
    let dark = !document.body.classList.contains("light-mode");
    document.getElementById("themeToggle").innerHTML = dark ? "🌙" : "☀️";
    localStorage.setItem("theme", dark ? "dark" : "light");
}
function logout(){ localStorage.removeItem("loggedIn"); window.location.href = "login.html"; }

/* ===== Start ===== */
if(localStorage.getItem("theme") === "light"){
    document.body.classList.add("light-mode");
    document.getElementById("themeToggle").innerHTML = "☀️";
}
renderLobby();
