/* =========================================================
   fighters.js — anime chibi fighter SVG generator
   Each fighter is drawn procedurally from a small palette spec
   so we get many distinct cute characters with no image assets.
   Exposes: window.chibiFighterSVG(spec, pose)
   ========================================================= */
(function(){
  // pose: 'idle' | 'attack' | 'hit' | 'cast'
  function chibiFighterSVG(spec, pose){
    pose = pose || 'idle';
    const s = Object.assign({
      hair:'#6d5bd0', hair2:'#a78bfa', skin:'#ffe3c7', outfit:'#2dd4bf', outfit2:'#3b82f6',
      eye:'#3a2e4d', accent:'#fbbf24', style:'twin', weapon:null, elem:'grass'
    }, spec||{});

    // hair styles
    let backHair = '', frontHair = '';
    if(s.style === 'twin'){
      backHair = `<ellipse cx="44" cy="92" rx="18" ry="30" fill="${s.hair}"/><ellipse cx="156" cy="92" rx="18" ry="30" fill="${s.hair}"/>
                  <circle cx="44" cy="62" r="13" fill="${s.accent}"/><circle cx="156" cy="62" r="13" fill="${s.accent}"/>`;
      frontHair = `<path d="M58 80 Q56 34 100 32 Q144 34 142 80 Q138 58 118 54 Q124 70 112 72 Q108 54 100 54 Q92 54 88 72 Q76 70 82 54 Q62 58 58 80 Z" fill="url(#hg)"/>`;
    } else if(s.style === 'long'){
      backHair = `<path d="M52 90 Q40 160 58 195 Q100 205 142 195 Q160 160 148 90 Z" fill="${s.hair}"/>`;
      frontHair = `<path d="M58 82 Q54 32 100 30 Q146 32 142 82 Q136 56 116 52 Q120 72 108 70 Q104 52 100 52 Q96 52 92 70 Q80 72 84 52 Q64 56 58 82 Z" fill="url(#hg)"/>`;
    } else if(s.style === 'short'){
      backHair = `<path d="M58 100 Q52 70 100 66 Q148 70 142 100 Q150 80 142 64 Q120 52 100 52 Q80 52 58 64 Q50 80 58 100 Z" fill="${s.hair}"/>`;
      frontHair = `<path d="M58 84 Q52 34 100 32 Q148 34 142 84 Q138 56 100 54 Q62 56 58 84 Z" fill="url(#hg)"/>`;
    } else if(s.style === 'bun'){
      backHair = `<circle cx="100" cy="36" r="16" fill="${s.hair}"/><circle cx="100" cy="36" r="9" fill="${s.hair2}"/>`;
      frontHair = `<path d="M58 80 Q56 38 100 36 Q144 38 142 80 Q136 56 100 54 Q64 56 58 80 Z" fill="url(#hg)"/>`;
    }

    // weapon drawn in right hand
    let weapon = '';
    if(s.weapon === 'sword') weapon = `<g id="wp"><rect x="150" y="96" width="6" height="44" rx="3" fill="#cbd5e1"/><rect x="146" y="136" width="14" height="6" rx="3" fill="${s.accent}"/></g>`;
    else if(s.weapon === 'staff') weapon = `<g id="wp"><rect x="151" y="92" width="5" height="56" rx="2.5" fill="#a16207"/><circle cx="153" cy="88" r="9" fill="${s.outfit}"/><circle cx="153" cy="88" r="4" fill="#fff" opacity="0.7"/></g>`;
    else if(s.weapon === 'bow') weapon = `<g id="wp"><path d="M150 92 Q168 120 150 148" stroke="#a16207" stroke-width="4" fill="none"/><line x1="150" y1="92" x2="150" y2="148" stroke="#e5e7eb" stroke-width="1.5"/></g>`;
    else if(s.weapon === 'spear') weapon = `<g id="wp"><rect x="152" y="86" width="5" height="62" rx="2" fill="#a16207"/><path d="M154 78 L150 90 L159 90 Z" fill="#cbd5e1"/></g>`;
    else if(s.weapon === 'scythe') weapon = `<g id="wp"><rect x="152" y="92" width="5" height="56" rx="2" fill="#3a2e4d"/><path d="M154 92 Q176 92 172 74 Q166 86 154 84 Z" fill="#e11d48"/></g>`;

    // element aura color
    const auraColor = { fire:'#fb7185', water:'#60a5fa', grass:'#34d399' }[s.elem] || '#a78bfa';

    return `
    <svg viewBox="0 0 200 210" xmlns="http://www.w3.org/2000/svg" class="fighter-chibi pose-${pose}">
      <defs>
        <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${s.hair}"/><stop offset="100%" stop-color="${s.hair2}"/></linearGradient>
        <linearGradient id="og" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${s.outfit}"/><stop offset="100%" stop-color="${s.outfit2}"/></linearGradient>
        <radialGradient id="ck"><stop offset="0%" stop-color="#fda4af"/><stop offset="100%" stop-color="#fda4af" stop-opacity="0"/></radialGradient>
        <radialGradient id="aura"><stop offset="0%" stop-color="${auraColor}" stop-opacity="0.5"/><stop offset="100%" stop-color="${auraColor}" stop-opacity="0"/></radialGradient>
      </defs>
      <ellipse class="f-shadow" cx="100" cy="200" rx="40" ry="7" fill="#000" opacity="0.18"/>
      <circle class="f-aura" cx="100" cy="120" r="60" fill="url(#aura)"/>
      <g class="f-body">
        ${backHair}
        <rect x="86" y="162" width="11" height="26" rx="5" fill="${s.skin}"/>
        <rect x="103" y="162" width="11" height="26" rx="5" fill="${s.skin}"/>
        <ellipse cx="91" cy="190" rx="9" ry="6" fill="#5b6470"/>
        <ellipse cx="109" cy="190" rx="9" ry="6" fill="#5b6470"/>
        <path d="M72 116 Q100 106 128 116 L138 172 Q100 184 62 172 Z" fill="url(#og)"/>
        <path d="M72 116 Q100 106 128 116 L131 132 Q100 126 69 132 Z" fill="#fff" opacity="0.22"/>
        <g class="f-arm-left"><rect x="62" y="118" width="10" height="32" rx="5" fill="${s.skin}"/></g>
        <g class="f-arm-right"><rect x="128" y="118" width="10" height="32" rx="5" fill="${s.skin}"/>${weapon}</g>
        <g class="f-head">
          <rect x="93" y="100" width="14" height="13" rx="6" fill="${s.skin}"/>
          <circle cx="100" cy="76" r="38" fill="${s.skin}"/>
          <circle cx="80" cy="84" r="8" fill="url(#ck)"/><circle cx="120" cy="84" r="8" fill="url(#ck)"/>
          ${frontHair}
          <g class="f-eyes">
            <ellipse cx="85" cy="82" rx="6.5" ry="8.5" fill="${s.eye}"/><ellipse cx="115" cy="82" rx="6.5" ry="8.5" fill="${s.eye}"/>
            <circle cx="87" cy="79" r="2.2" fill="#fff"/><circle cx="117" cy="79" r="2.2" fill="#fff"/>
          </g>
          <path d="M94 95 Q100 100 106 95" stroke="#b5566b" stroke-width="2" fill="none" stroke-linecap="round"/>
        </g>
      </g>
    </svg>`;
  }
  window.chibiFighterSVG = chibiFighterSVG;
})();
