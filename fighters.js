/* =========================================================
   fighters.js — moe anime half-body portrait generator (SVG)
   Sweet big-eyes style, fluffy spiky hair, black line art.
   Bust-up (chest & head). Highly parameterized for variety.
   Exposes: window.animeFighterSVG(spec, pose)
   alias: window.chibiFighterSVG (backward compat)
   ========================================================= */
(function(){
  const LINE = "#2b2336";       // line-art color
  const LW = 2.4;

  function v(spec){
    return Object.assign({
      skin:'#ffe6cf', skinShade:'#f3c9a6',
      hair:'#7c5cd0', hair2:'#a78bfa',
      eye:'#7c3aed', eye2:'#c4b5fd',
      outfit:'#2dd4bf', outfit2:'#0d9488', trim:'#fbbf24',
      hairStyle:'long', elem:'grass'
    }, spec||{});
  }

  /* ---- fluffy spiky hair, drawn in layered tufts ---- */
  function hairBack(s){
    switch(s.hairStyle){
      case 'long': return `<path d="M40 96 Q30 175 52 210 L70 205 Q56 150 60 96 Z M160 96 Q170 175 148 210 L130 205 Q144 150 140 96 Z" fill="${s.hair}" stroke="${LINE}" stroke-width="${LW}"/>`;
      case 'twin': return `<g stroke="${LINE}" stroke-width="${LW}">
          <path d="M46 92 Q22 130 30 178 Q44 186 58 178 Q48 140 64 100 Z" fill="${s.hair}"/>
          <path d="M154 92 Q178 130 170 178 Q156 186 142 178 Q152 140 136 100 Z" fill="${s.hair}"/>
          <path d="M30 178 q14 14 28 0" fill="${s.hair2}"/><path d="M142 178 q14 14 28 0" fill="${s.hair2}"/></g>`;
      case 'ponytail': return `<path d="M120 74 Q176 96 168 168 Q176 196 150 200 Q166 150 112 96 Z" fill="${s.hair}" stroke="${LINE}" stroke-width="${LW}"/>`;
      case 'short': return `<path d="M44 104 Q40 80 60 70 L140 70 Q160 80 156 104 Q150 88 100 86 Q50 88 44 104 Z" fill="${s.hair}" stroke="${LINE}" stroke-width="${LW}"/>`;
      case 'wavy': return `<path d="M42 96 Q26 140 44 162 Q34 188 56 204 Q52 160 62 104 Z M158 96 Q174 140 156 162 Q166 188 144 204 Q148 160 138 104 Z" fill="${s.hair}" stroke="${LINE}" stroke-width="${LW}"/>`;
      case 'hime': return `<path d="M44 100 Q36 170 56 206 L74 200 Q60 150 60 100 Z M156 100 Q164 170 144 206 L126 200 Q140 150 140 100 Z" fill="${s.hair}" stroke="${LINE}" stroke-width="${LW}"/>`;
      default: return '';
    }
  }

  /* ---- spiky fluffy bangs (front) with tufts ---- */
  function hairFront(s){
    // layered zig-zag fringe for "fluffy spikes"
    let bangs = `<path d="M40 104
        Q36 50 100 42 Q164 50 160 104
        Q150 78 138 96 Q140 66 122 60 Q126 84 110 78
        Q112 58 100 56 Q88 58 90 78 Q74 84 78 60
        Q60 66 62 96 Q50 78 40 104 Z"
        fill="url(#hgF)" stroke="${LINE}" stroke-width="${LW}" stroke-linejoin="round"/>`;
    // side locks framing the face
    let locks = `<path d="M40 104 Q34 140 46 158 Q52 132 50 108 Z" fill="${s.hair}" stroke="${LINE}" stroke-width="${LW}"/>
                 <path d="M160 104 Q166 140 154 158 Q148 132 150 108 Z" fill="${s.hair}" stroke="${LINE}" stroke-width="${LW}"/>`;
    let acc = '';
    if(s.hairStyle==='twin') acc = `<circle cx="44" cy="96" r="9" fill="${s.trim}" stroke="${LINE}" stroke-width="${LW}"/><circle cx="156" cy="96" r="9" fill="${s.trim}" stroke="${LINE}" stroke-width="${LW}"/>`;
    if(s.hairStyle==='ponytail') acc = `<circle cx="120" cy="74" r="8" fill="${s.trim}" stroke="${LINE}" stroke-width="${LW}"/>`;
    if(s.hairStyle==='hime') acc = `<path d="M70 50 Q100 44 130 50 L128 60 Q100 54 72 60 Z" fill="${s.trim}" stroke="${LINE}" stroke-width="${LW}"/>`;
    return locks + bangs + acc;
  }

  /* ---- big moe eye ---- */
  function eye(cx, cy, s, flip){
    let dir = flip ? -1 : 1;
    return `<g>
      <ellipse cx="${cx}" cy="${cy}" rx="13" ry="16" fill="#fff" stroke="${LINE}" stroke-width="${LW}"/>
      <clipPath id="ec${cx}"><ellipse cx="${cx}" cy="${cy}" rx="13" ry="16"/></clipPath>
      <g clip-path="url(#ec${cx})">
        <rect x="${cx-14}" y="${cy-17}" width="28" height="34" fill="${s.eye}"/>
        <ellipse cx="${cx}" cy="${cy+6}" rx="13" ry="11" fill="${s.eye2}"/>
        <circle cx="${cx}" cy="${cy+2}" r="7" fill="${s.eye}"/>
        <circle cx="${cx}" cy="${cy+4}" r="4.5" fill="#1a1426"/>
        <ellipse cx="${cx+dir*4}" cy="${cy-6}" rx="4.5" ry="6" fill="#fff" opacity="0.95"/>
        <circle cx="${cx-dir*4}" cy="${cy+8}" r="2.6" fill="#fff" opacity="0.8"/>
        <rect x="${cx-14}" y="${cy-17}" width="28" height="6" fill="${LINE}" opacity="0.55"/>
      </g>
      <path d="M${cx-13} ${cy-12} Q${cx} ${cy-20} ${cx+13} ${cy-12}" fill="none" stroke="${LINE}" stroke-width="3" stroke-linecap="round"/>
    </g>`;
  }

  function animeFighterSVG(spec, pose){
    const s = v(spec); pose = pose||'idle';
    const auraColor = { fire:'#fb7185', water:'#60a5fa', grass:'#34d399' }[s.elem] || '#a78bfa';
    return `
    <svg viewBox="0 0 200 210" xmlns="http://www.w3.org/2000/svg" class="anime-fighter pose-${pose}">
      <defs>
        <linearGradient id="hgF" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${s.hair2}"/><stop offset="100%" stop-color="${s.hair}"/></linearGradient>
        <linearGradient id="ofG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${s.outfit}"/><stop offset="100%" stop-color="${s.outfit2}"/></linearGradient>
        <radialGradient id="ckG"><stop offset="0%" stop-color="#fb7185" stop-opacity="0.6"/><stop offset="100%" stop-color="#fb7185" stop-opacity="0"/></radialGradient>
        <radialGradient id="auraG"><stop offset="0%" stop-color="${auraColor}" stop-opacity="0.4"/><stop offset="100%" stop-color="${auraColor}" stop-opacity="0"/></radialGradient>
      </defs>

      <ellipse class="af-aura" cx="100" cy="120" rx="78" ry="78" fill="url(#auraG)"/>

      <g class="af-body">
        ${hairBack(s)}

        <!-- shoulders / outfit (bust) -->
        <path d="M52 210 Q56 168 86 156 L114 156 Q144 168 148 210 Z" fill="url(#ofG)" stroke="${LINE}" stroke-width="${LW}"/>
        <path d="M86 156 Q100 176 114 156 L110 196 L90 196 Z" fill="${s.skin}" stroke="${LINE}" stroke-width="${LW}"/>
        <path d="M86 156 Q100 170 114 156" fill="none" stroke="${LINE}" stroke-width="${LW}"/>
        <path d="M70 178 Q100 188 130 178" fill="none" stroke="${s.trim}" stroke-width="4" stroke-linecap="round"/>
        <circle cx="100" cy="186" r="4" fill="${s.trim}" stroke="${LINE}" stroke-width="1.6"/>

        <!-- neck -->
        <path d="M90 150 L90 138 Q100 144 110 138 L110 150 Z" fill="${s.skinShade}" stroke="${LINE}" stroke-width="${LW}"/>

        <g class="af-head">
          <!-- face -->
          <path d="M58 88 Q58 140 100 150 Q142 140 142 88 Q142 50 100 48 Q58 50 58 88 Z" fill="${s.skin}" stroke="${LINE}" stroke-width="${LW}"/>
          <!-- cheeks blush -->
          <ellipse cx="74" cy="108" rx="11" ry="7" fill="url(#ckG)"/>
          <ellipse cx="126" cy="108" rx="11" ry="7" fill="url(#ckG)"/>
          <!-- eyes -->
          <g class="af-eyes">
            ${eye(78, 100, s, false)}
            ${eye(122, 100, s, true)}
          </g>
          <!-- nose + mouth -->
          <path d="M100 110 l-2 5 h4 Z" fill="${s.skinShade}"/>
          <path d="M92 124 Q100 132 108 124" fill="none" stroke="${LINE}" stroke-width="2.2" stroke-linecap="round"/>
          <!-- front hair over forehead -->
          ${hairFront(s)}
        </g>
      </g>
    </svg>`;
  }

  window.animeFighterSVG = animeFighterSVG;
  window.chibiFighterSVG = animeFighterSVG;
})();
