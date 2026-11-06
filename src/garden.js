class Garden {
  constructor() {
    this.DEF = { flora: 'meadow', font: 'playfair', density: 1, speed: 1, recoil: 20, breeze: 0.6, boil: true, pollen: true, visitors: true, sound: false, palette: 0, season: 'off', weather: 'auto', wxAmt: 1, seasonLen: 40 };
    this.SEAS = ['spring', 'summer', 'autumn', 'winter'];
    this.SEASONS = [['off', 'Off'], ['spring', 'Spring'], ['summer', 'Summer'], ['autumn', 'Autumn'], ['winter', 'Winter'], ['cycle', 'Cycle']];
    this.WEATHERS = [['auto', 'Auto'], ['clear', 'Clear'], ['rain', 'Rain'], ['storm', 'Storm'], ['snow', 'Snow'], ['leaves', 'Leaves']];
    // how each season nudges a palette: [target hue, strength, saturation x, lightness shift]
    this.GRADE = {
      spring: { red: [340, 0.35, 1.0, 0.04], blue: [135, 0.55, 1.05, 0.03], bg: [130, 0.28, 1, 0], line: [340, 0.2, 1, 0] },
      summer: { red: [18, 0.15, 1.12, 0], blue: [150, 0.35, 1.1, 0], bg: [48, 0.22, 1, 0], line: [40, 0.2, 1, 0] },
      autumn: { red: [22, 0.55, 1.05, -0.02], blue: [42, 0.6, 0.95, -0.03], bg: [24, 0.32, 1, 0], line: [34, 0.3, 1, 0] },
      winter: { red: [205, 0.18, 0.55, 0.08], blue: [205, 0.6, 0.6, 0.06], bg: [215, 0.4, 0.9, 0], line: [210, 0.4, 0.5, 0] }
    };
    // what each season brings when weather is on Auto: spring showers, still summer, falling leaves, snow
    this.AUTO = [{ rain: 0.55, snow: 0, leaves: 0 }, { rain: 0, snow: 0, leaves: 0 }, { rain: 0.15, snow: 0, leaves: 0.9 }, { rain: 0, snow: 0.9, leaves: 0 }];
    this.LEAFCOL = ['#C8431E', '#E38B1B', '#B5651D', '#8C3B13', '#D9A21B', '#A83A12'];
    this.cfg = Object.assign({}, this.DEF);
    let stored = null;
    try { stored = localStorage.getItem('tg-cfg'); Object.assign(this.cfg, JSON.parse(stored || '{}')); } catch (e) {}
    if (!stored && window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) { this.cfg.boil = false; this.cfg.breeze = 0.15; this.cfg.wxAmt = 0.6; }
    this.props = this.cfg;
    this.SENT = String.fromCharCode(0x200b);
    this.SPECIES = ['rose', 'tulip', 'daisy', 'poppy', 'blossom', 'bell'];
    this.FLORA = [['meadow', 'Meadow'], ['wild', 'Wild'], ['rose', 'Rose'], ['tulip', 'Tulip'], ['daisy', 'Daisy'], ['poppy', 'Poppy'], ['blossom', 'Blossom'], ['bell', 'Bluebell']];
    this.FONTS = [
      { id: 'playfair', name: 'Playfair Display', css: '"Playfair Display"', w: 700 },
      { id: 'dmserif', name: 'DM Serif Display', css: '"DM Serif Display"', w: 400 },
      { id: 'fraunces', name: 'Fraunces', css: '"Fraunces"', w: 800 },
      { id: 'bodoni', name: 'Bodoni Moda', css: '"Bodoni Moda"', w: 800 },
      { id: 'abril', name: 'Abril Fatface', css: '"Abril Fatface"', w: 400 },
      { id: 'instrument', name: 'Instrument Serif', css: '"Instrument Serif"', w: 400 },
      { id: 'bricolage', name: 'Bricolage', css: '"Bricolage Grotesque"', w: 800 },
      { id: 'caveat', name: 'Caveat', css: '"Caveat"', w: 700 }
    ];
    this.PRESETS = [
      { id: 'breathe', label: 'Breathe', sub: 'Slow sway · 3s', T: 3000 },
      { id: 'grow', label: 'Grow & wither', sub: 'Bloom, then back · 6s', T: 6000 },
      { id: 'typed', label: 'Typed', sub: 'Type, cut, repeat · 5s', T: 5000 },
      { id: 'wind', label: 'Gust', sub: 'Wind sweeps through · 4s', T: 4000 },
      { id: 'reach', label: 'Reach', sub: 'Stems follow a light · 6s', T: 6000 },
      { id: 'scatter', label: 'Scatter', sub: 'Random bloom, fade · 6s', T: 6000 },
      { id: 'visit', label: 'Visitor', sub: 'Butterfly drops by · 7s', T: 7000 }
    ];
    // name, background, flower, stem & leaf, flower line, type
    this.PAL = [
      ['Rose noir', '#000000', '#FF1400', '#3257FF', '#FFB4A8', '#FFFFFF'],
      ['Paper', '#F3EEE4', '#FF3B1F', '#1C2B8F', '#FFD2C4', '#111111'],
      ['Midnight', '#0D1B4C', '#FF5A4E', '#9FB4FF', '#FFD6CF', '#FFFFFF'],
      ['Citrus', '#0E1A12', '#FF8A00', '#1FA463', '#FFE2B8', '#FFF6E8'],
      ['Orchid', '#140A1F', '#E63CFF', '#2FB8A6', '#F9D1FF', '#FFFFFF'],
      ['Moss', '#133A2A', '#FFB7C5', '#7FD18B', '#FFFFFF', '#F6F1E7'],
      ['Tomato', '#FF1400', '#FFF1E0', '#0B0B0B', '#FF1400', '#000000'],
      ['Butter', '#FFE9A8', '#E4002B', '#0F5132', '#FFC2C2', '#1A1A1A'],
      ['Blush', '#FAD4D8', '#C8102E', '#274690', '#FFE3E6', '#1A1A1A'],
      ['Mono', '#000000', '#F2F2F2', '#6E6E6E', '#000000', '#FFFFFF'],
      ['Sakura', '#FFF4F1', '#F27C9B', '#3F6E4E', '#FFFFFF', '#2E1F24'],
      ['Lavender', '#211A36', '#B497FF', '#86C79A', '#F1E8FF', '#FFFFFF'],
      ['Sunset', '#2A0F14', '#FF6A3D', '#F2B84B', '#FFE0C2', '#FFE9DC'],
      ['Ink', '#F7F5F0', '#111111', '#111111', '#F7F5F0', '#111111']
    ];
    this.state = { mode: 'type', preset: 'breathe', palette: Math.min(this.PAL.length - 1, this.cfg.palette | 0), text: 'in bloom', seed: 7, status: '', busy: false };
    this.applyFont();
    this.$ = id => document.getElementById(id);
    this.cv = this.$('cv'); this.inp = this.$('inp'); this.pcv = this.$('pcv');
    this.vmime = typeof MediaRecorder !== 'undefined' ? ['video/mp4;codecs=avc1.42E01E', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm'].find(m => MediaRecorder.isTypeSupported(m)) : null;
    this.mount();
  }
  set(patch, cb) { Object.assign(this.state, patch); this.ui(); if (cb) cb(); }
  upd(patch) { this.set(patch, () => this.buildPoster()); }
  save() { this.cfg.palette = this.state.palette; try { localStorage.setItem('tg-cfg', JSON.stringify(this.cfg)); } catch (e) {} }
  fontDef() { return this.FONTS.find(f => f.id === this.cfg.font) || this.FONTS[0]; }
  applyFont() { const f = this.fontDef(); this.F = `${f.css},Georgia,serif`; this.FW = f.w; }

  mount() {
    this.letters = []; this.uid = 1; this.cache = {}; this.Sd = 0; this.St = 0; this.wrapped = false;
    this.t0 = performance.now(); this.lastKey = 0; this.rand = Math.random;
    this.fa = {}; this.mx = null; this.flies = []; this.perch = []; this.gifts = [];
    this.parts = []; this.pollen = []; this.wind = 0; this.gust = 0;
    this.readHash();
    this.isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent || '');
    this.hist = ['']; this.hp = 0; this.cmdOpen = false; this.keysOpen = false; this.cmdHits = []; this.cmdSel = 0;
    // seasons & weather state: sp is the season phase (0 spring … 3 winter), sAmt fades the season grade in and out
    const si = this.SEAS.indexOf(this.cfg.season);
    this.sp = si < 0 ? 0 : si; this.sAmt = this.cfg.season === 'off' ? 0 : 1;
    this.wx = { rain: 0, snow: 0, leaves: 0 }; this.drops = []; this.splashes = []; this.flakes = []; this.leafs = [];
    this.drift = null; this.cap = 0; this.polMul = 1; this.flyMul = 1; this._racc = 0; this._sacc = 0; this._lacc = 0; this._blow = 0; this._pk = null;
    this.g = this.cv.getContext('2d');
    window.addEventListener('resize', () => this.resize());
    this.resize();
    window.addEventListener('keydown', e => this.key(e));
    window.addEventListener('pointermove', e => {
      const now = performance.now(), pm = this._pm;
      if (pm && this.state.mode === 'type') {
        const dt = Math.max(8, now - pm.t), v = (e.clientX - pm.x) / dt;
        this.gust = Math.max(-1.6, Math.min(1.6, this.gust + v * 0.05 * (0.35 + this.cfg.breeze)));
      }
      this._pm = { x: e.clientX, y: e.clientY, t: now };
      this.mx = e.clientX; this.my = e.clientY;
    });
    document.addEventListener('pointerleave', () => { this.mx = null; });
    document.addEventListener('mouseout', e => { if (!e.relatedTarget) this.mx = null; });
    this.touch = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);
    if (this.touch) document.documentElement.setAttribute('data-touch', '');
    this.ptype = 'mouse';
    window.addEventListener('pointerdown', e => { this.ptype = e.pointerType || 'mouse'; }, true);
    const up = e => { if (e.pointerType && e.pointerType !== 'mouse') this.mx = null; };
    window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    const fld = this.inp;
    this.iv = this.SENT; fld.value = this.SENT;
    fld.addEventListener('compositionstart', () => { this.composing = true; });
    fld.addEventListener('compositionend', () => { this.composing = false; setTimeout(() => { if (!this.composing) this.inputDiff(fld); }, 0); });
    fld.addEventListener('input', () => this.inputDiff(fld));
    this.vv = window.visualViewport || null; this.vvMax = 0;
    if (this.vv && this.touch) { this.vv.addEventListener('resize', () => this.syncVV()); this.vv.addEventListener('scroll', () => this.syncVV()); this.syncVV(); }
    const app = this.$('app');
    app.addEventListener('pointerdown', ev => {
      if (this.state.mode !== 'type') return;
      if (ev.target.closest && ev.target.closest('#tune,#cmd,#keys')) return;
      const touch = ev.pointerType && ev.pointerType !== 'mouse', onCanvas = ev.target === this.cv;
      if (touch) { if (ev.cancelable && (onCanvas || (ev.target.closest && ev.target.closest('button')))) ev.preventDefault(); }
      else this.inp.focus({ preventScroll: true });
      if (onCanvas) { this.spawnFly(ev.clientX, ev.clientY); this.plant(ev); if (this.tuneOpen) this.toggleTune(false); }
    });
    app.addEventListener('click', ev => { if (this.state.mode === 'type' && this.ptype !== 'mouse' && ev.target === this.cv) this.inp.focus({ preventScroll: true }); });
    this.$('bpng').onclick = () => { this.savePNG(); this.refocus(); };
    this.$('bsvg').onclick = () => { this.saveSVG(); this.refocus(); };
    this.$('bpal').onclick = () => { this.setPalette((this.state.palette + 1) % this.PAL.length); this.refocus(); };
    this.$('btune').onclick = () => this.toggleTune();
    this.$('tclose').onclick = () => this.toggleTune(false);
    this.$('bsnd').onclick = () => { this.cfg.sound = !this.cfg.sound; this.save(); if (this.cfg.sound) { this.audio(); this.sfx('space'); } this.ui(); this.syncTune(); this.refocus(); };
    this.$('blink').onclick = () => { this.share(); this.refocus(); };
    this.$('bcmd').onclick = () => this.toggleCmd(true);
    this.$('cmdk').textContent = this.isMac ? '\u2318K' : 'Ctrl K';
    this.$('kclose').onclick = () => this.toggleKeys(false);
    this.$('cmdi').addEventListener('input', () => { this.cmdSel = 0; this.renderCmds(); });
    this.$('cmd').addEventListener('pointerdown', ev => { if (ev.target === this.$('cmd')) this.toggleCmd(false); });
    this.$('keys').addEventListener('pointerdown', ev => { if (ev.target === this.$('keys')) this.toggleKeys(false); });
    this.buildKeys();
    this.$('treset').onclick = () => { const pal = this.DEF.palette; Object.assign(this.cfg, this.DEF); this.state.palette = pal; this.save(); this.changeFont(); this.ui(); this.syncTune(); };
    this.$('ptext').onchange = e => this.upd({ text: e.target.value });
    this.$('reshuffle').onclick = () => this.upd({ seed: Math.floor(Math.random() * 1e6) });
    this.$('vid').onclick = () => this.exportVideo();
    this.$('frm').onclick = () => this.exportFrames();
    this.buildTune();
    this.ui();
    this.buildPoster();
    const fontsReady = () => { this.cache = {}; this.layout(); this.buildPoster(); this.drawPreviews(); };
    if (document.fonts) document.fonts.load(`${this.FW} 100px ${this.F}`).then(fontsReady).catch(() => {});
    if (document.fonts) document.fonts.ready.then(() => this.syncTune());
    const loop = () => { requestAnimationFrame(loop); this.frame(); };
    loop();
    if (!this.touch) setTimeout(() => this.inp.focus({ preventScroll: true }), 50);
    if (this.introText) setTimeout(() => this.typeOut(this.introText), 700);
    else {
      let last = null; try { last = localStorage.getItem('tg-last'); } catch (e) {}
      if (last && last.trim()) setTimeout(() => {
        this.setText(last); this.hist = ['', last]; this.hp = 1;
        this.toast('Your garden is back \u2014 Enter clears it');
      }, 500);
    }
  }

  // ---------- share links ----------
  readHash() {
    if (!location.hash) return;
    const q = new URLSearchParams(location.hash.slice(1));
    if (q.has('p')) this.state.palette = Math.min(this.PAL.length - 1, Math.max(0, +q.get('p') | 0));
    if (q.has('f') && this.FLORA.some(f => f[0] === q.get('f'))) this.cfg.flora = q.get('f');
    if (q.has('ff') && this.FONTS.some(f => f.id === q.get('ff'))) { this.cfg.font = q.get('ff'); this.applyFont(); }
    if (q.has('s') && this.SEASONS.some(s => s[0] === q.get('s'))) this.cfg.season = q.get('s');
    if (q.has('w') && this.WEATHERS.some(w => w[0] === q.get('w'))) this.cfg.weather = q.get('w');
    if (q.get('t')) this.introText = q.get('t').slice(0, 60);
  }
  share() {
    const q = new URLSearchParams({ t: this.liveText() || 'in bloom', p: this.state.palette, f: this.cfg.flora, ff: this.cfg.font, s: this.cfg.season, w: this.cfg.weather });
    const url = location.href.split('#')[0] + '#' + q.toString();
    try { history.replaceState(null, '', url); } catch (e) {}
    const ok = () => this.toast('Link copied — it regrows your words'), no = () => this.toast('Link is in the address bar');
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(ok, no); else no();
  }
  typeOut(text) {
    let i = 0;
    const step = () => {
      if (i >= text.length || this.state.mode !== 'type') return;
      const ch = text[i++], now = performance.now(); this.lastKey = now; this.add(ch, now);
      setTimeout(step, ch === ' ' ? 260 : 110 + Math.random() * 60);
    };
    step();
  }
  toast(msg) { const t = this.$('toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(this._tt); this._tt = setTimeout(() => t.classList.remove('on'), 1800); }

  // ---------- history: undo / redo over the words ----------
  pushHist(now) {
    if (this._restoring) return;
    clearTimeout(this._ht);
    const commit = () => {
      const t = this.liveText();
      if (this.hist[this.hp] === t) return;
      this.hist = this.hist.slice(0, this.hp + 1);
      this.hist.push(t);
      if (this.hist.length > 120) this.hist.shift();
      this.hp = this.hist.length - 1;
      this.autosave();
    };
    if (now) commit(); else this._ht = setTimeout(commit, 500);
  }
  // rebuild the garden for a string, fully grown, with no sound
  setText(t) {
    this._restoring = true; this._silent = true;
    clearTimeout(this._ht);
    const now = performance.now() - 2600;
    this.letters = []; this.uid = 1; this.fa = {}; this.parts = []; this.pollen = []; this.flies = []; this.perch = []; this.gifts = [];
    for (const ch of (t || '').slice(0, 60)) this.add(ch, now);
    this.layout(true);
    this._restoring = false; this._silent = false;
    this.autosave();
  }
  undo() {
    clearTimeout(this._ht);
    if (this.hp <= 0) { this.toast('Nothing to undo'); return; }
    this.hp--; this.setText(this.hist[this.hp]); this.toast('Undo');
  }
  redo() {
    if (this.hp >= this.hist.length - 1) { this.toast('Nothing to redo'); return; }
    this.hp++; this.setText(this.hist[this.hp]); this.toast('Redo');
  }
  autosave() { try { localStorage.setItem('tg-last', this.liveText()); } catch (e) {} }

  copyImage() {
    this.paint(performance.now(), false, 0);
    if (!navigator.clipboard || typeof ClipboardItem === 'undefined') { this.toast('Clipboard unavailable \u2014 saving PNG'); this.savePNG(); return; }
    this.cv.toBlob(b => {
      if (!b) return;
      navigator.clipboard.write([new ClipboardItem({ 'image/png': b })])
        .then(() => this.toast('Garden copied to clipboard'), () => this.toast('Copy blocked \u2014 use PNG'));
    });
  }

  // ---------- command palette ----------
  mod(k) { return (this.isMac ? '\u2318' : 'Ctrl ') + k; }
  buildCmds() {
    const C = [];
    const add = (group, label, run, hint, dot) => C.push({ group, label, run, hint: hint || '', dot });
    add('Action', 'Undo', () => this.undo(), this.mod('Z'));
    add('Action', 'Redo', () => this.redo(), this.mod('\u21e7Z'));
    add('Action', 'Clear the garden', () => { this.mark(); this.clearAll(performance.now()); }, 'Enter');
    add('Action', 'Copy image to clipboard', () => this.copyImage(), this.mod('C'));
    add('Action', 'Save PNG', () => this.savePNG(), this.mod('S'));
    add('Action', 'Save SVG', () => this.saveSVG(), this.mod('\u21e7S'));
    add('Action', 'Copy share link', () => this.share());
    add('Action', 'Open Tune panel', () => this.toggleTune(true));
    add('Action', 'Keyboard shortcuts', () => this.toggleKeys(true), '?');
    add('Action', 'Poster mode', () => { this.$('ptext').value = this.liveText() || this.state.text; this.upd({ mode: 'poster', text: this.liveText() || this.state.text }); });
    add('Action', 'Type mode', () => this.set({ mode: 'type' }, () => { this.resize(); this.refocus(); }));
    add('Action', 'Reset all settings', () => this.$('treset').click());
    this.PAL.forEach((pp, i) => add('Palette', pp[0], () => this.setPalette(i), '', pp[2]));
    this.SEASONS.forEach(([id, name]) => add('Season', name, () => this.setSeason(id)));
    this.WEATHERS.forEach(([id, name]) => add('Weather', name, () => { this.cfg.weather = id; this.save(); this.syncTune(); this.toast(name === 'Auto' ? 'Weather follows the season' : name); }));
    this.FLORA.forEach(([id, name]) => add('Flora', name, () => { this.cfg.flora = id; this.save(); this.syncTune(); this.regrowAll(); }));
    this.FONTS.forEach(f => add('Typeface', f.name, () => { this.cfg.font = f.id; this.save(); this.changeFont(); this.syncTune(); }));
    [['boil', 'Hand-drawn boil'], ['pollen', 'Pollen'], ['visitors', 'Butterflies'], ['sound', 'Sound']].forEach(([k, name]) =>
      add('Toggle', name, () => { this.cfg[k] = !this.cfg[k]; this.save(); if (k === 'sound' && this.cfg.sound) { this.audio(); this.sfx('space'); } this.syncTune(); this.ui(); this.toast(name + (this.cfg[k] ? ' on' : ' off')); }));
    return C;
  }
  fz(q, s) {
    if (!q) return 1;
    s = s.toLowerCase();
    if (s.startsWith(q)) return 1000;
    const i = s.indexOf(q); if (i >= 0) return 600 - i;
    let qi = 0, sc = 0;
    for (let si = 0; si < s.length && qi < q.length; si++) if (s[si] === q[qi]) { qi++; sc++; }
    return qi === q.length ? sc : 0;
  }
  renderCmds() {
    const q = (this.$('cmdi').value || '').trim().toLowerCase(), list = this.$('cmdl');
    const hit = this.cmds.map(c => ({ c, s: Math.max(this.fz(q, c.label), this.fz(q, c.group + ' ' + c.label) * 0.7) }))
      .filter(h => h.s > 0).sort((a, b) => b.s - a.s).slice(0, 40).map(h => h.c);
    this.cmdHits = hit;
    if (this.cmdSel >= hit.length) this.cmdSel = 0;
    if (!hit.length) { list.innerHTML = '<div class="cmdempty">No command matches that</div>'; return; }
    list.innerHTML = '';
    hit.forEach((c, i) => {
      const d = document.createElement('div');
      d.className = 'ci' + (i === this.cmdSel ? ' on' : ''); d.setAttribute('role', 'option');
      d.innerHTML = (c.dot ? `<i class="sw2" style="background:${c.dot}"></i>` : '') +
        `<span class="nm">${c.label}</span>` + (c.hint ? `<span class="g">${c.hint}</span>` : `<span class="g">${c.group}</span>`);
      d.onmousemove = () => { if (this.cmdSel !== i) { this.cmdSel = i; this.renderCmds(); } };
      d.onclick = () => this.runCmd(i);
      list.appendChild(d);
    });
    const on = list.querySelector('.ci.on'); if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest' });
  }
  runCmd(i) {
    const c = this.cmdHits[i == null ? this.cmdSel : i]; if (!c) return;
    this.toggleCmd(false);
    try { c.run(); } catch (e) {}
  }
  toggleCmd(on) {
    this.cmdOpen = on == null ? !this.cmdOpen : on;
    this.$('cmd').classList.toggle('open', this.cmdOpen);
    if (this.cmdOpen) {
      this.cmds = this.buildCmds(); this.cmdSel = 0;
      const inp = this.$('cmdi'); inp.value = ''; this.renderCmds();
      setTimeout(() => inp.focus({ preventScroll: true }), 20);
    } else this.refocus();
  }
  toggleKeys(on) {
    this.keysOpen = on == null ? !this.keysOpen : on;
    this.$('keys').classList.toggle('open', this.keysOpen);
    if (!this.keysOpen) this.refocus();
  }
  buildKeys() {
    const rows = [
      ['h', 'Growing'], ['Grow a letter', 'any key'], ['Cut the stem, add a bloom', 'Space'],
      ['Shed the last letter', 'Backspace'], ['Blow the garden away', 'Enter'],
      ['Undo / redo', this.mod('Z') + ' / ' + this.mod('\u21e7Z')],
      ['h', 'Looking'], ['Commands', this.mod('K')], ['Next palette', 'Tab'], ['Previous palette', '\u21e7Tab'],
      ['Close a panel', 'Esc'], ['This sheet', '?'],
      ['h', 'Keeping'], ['Save PNG', this.mod('S')], ['Save SVG', this.mod('\u21e7S')], ['Copy image', this.mod('C')],
      ['h', 'Pointer'], ['Send a gust', 'sweep the cursor'], ['Call a butterfly', 'click'], ['Plant a flower', 'double-click']
    ];
    this.$('keysl').innerHTML = rows.map(([a, b]) => a === 'h'
      ? `<div class="kh">${b}</div>`
      : `<div class="kr"><span>${a}</span><b>${b}</b></div>`).join('');
  }

  plant(e) {
    const now = performance.now(), lp = this.lastTap;
    this.lastTap = { t: now, x: e.clientX, y: e.clientY };
    if (lp && now - lp.t < 340 && Math.hypot(e.clientX - lp.x, e.clientY - lp.y) < 40 && now - (this.lastPlant || 0) > 900) {
      this.lastPlant = now; this.lastTap = null;
      this.liveRose({ x: e.clientX / this.W, y: e.clientY / this.H, s: Math.floor(Math.random() * 1e6) });
      this.sfx('bloom', 'x', 0.05);
    }
  }
  liveRose(g) {
    const r = this.rng((g.s | 0) || 1), fl = this.cfg.flora;
    const sp = this.SPECIES.includes(fl) ? fl : this.SPECIES[Math.floor(r() * this.SPECIES.length)];
    this.gifts.push({ x: Math.min(1, Math.max(0, g.x)), y: Math.min(1, Math.max(0, g.y)), t0: performance.now(), rot: (r() - 0.5) * 0.8,
      e: { sp, ph1: r() * 6.283, ph2: r() * 6.283, turns: 1.4 + r() * 0.5, ang: -Math.PI / 2 } });
    if (this.gifts.length > 14) this.gifts.shift();
  }
  refocus() { if (this.ptype === 'mouse' && this.state.mode === 'type') this.inp.focus({ preventScroll: true }); }
  setPalette(i) { this.state.palette = i; this.save(); this.ui(); this.syncTune(); this.drawPreviews(); }

  // ---------- tune panel ----------
  toggleTune(on) {
    this.tuneOpen = on == null ? !this.tuneOpen : on;
    this.$('tune').classList.toggle('open', this.tuneOpen);
    this.$('btune').classList.toggle('on', this.tuneOpen);
    if (this.tuneOpen) this.drawPreviews(); else this.refocus();
  }
  buildTune() {
    const $ = this.$;
    this.FLORA.forEach(([id, name]) => {
      const b = document.createElement('button'); b.className = 'fl'; b.dataset.id = id;
      b.innerHTML = `<canvas width="92" height="92"></canvas><span>${name}</span>`;
      b.onclick = () => { this.cfg.flora = id; this.save(); this.syncTune(); this.regrowAll(); };
      $('tflora').appendChild(b);
    });
    this.FONTS.forEach(f => {
      const b = document.createElement('button'); b.className = 'ft'; b.dataset.id = f.id;
      b.innerHTML = `<b style="font-family:${f.css.replace(/"/g, "'")},serif;font-weight:${f.w}">Ag</b><span>${f.name}</span>`;
      b.onclick = () => { this.cfg.font = f.id; this.save(); this.changeFont(); this.syncTune(); };
      $('tfont').appendChild(b);
    });
    this.PAL.forEach((p, i) => {
      const b = document.createElement('button'); b.className = 'sw'; b.title = p[0]; b.dataset.id = i;
      b.style.background = p[1]; b.innerHTML = `<i style="background:${p[2]};--st:${p[3]}"></i>`;
      b.onclick = () => this.setPalette(i);
      $('tpal').appendChild(b);
    });
    this.SLIDERS = [
      ['density', 'Density', 0.4, 1.8, 0.1, v => v.toFixed(1) + '×'],
      ['speed', 'Growth speed', 0.4, 2.5, 0.1, v => v.toFixed(1) + '×'],
      ['recoil', 'Cut recoil', 0, 80, 1, v => v + 'px'],
      ['breeze', 'Breeze', 0, 1.5, 0.05, v => v === 0 ? 'still' : v.toFixed(2)]
    ];
    this.SEASONS.forEach(([id, name]) => {
      const b = document.createElement('button'); b.className = 'sg'; b.dataset.id = id; b.textContent = name;
      b.onclick = () => this.setSeason(id);
      $('tseason').appendChild(b);
    });
    this.WEATHERS.forEach(([id, name]) => {
      const b = document.createElement('button'); b.className = 'sg'; b.dataset.id = id; b.textContent = name;
      b.onclick = () => { this.cfg.weather = id; this.save(); this.syncTune(); };
      $('tweather').appendChild(b);
    });
    this.WSLIDERS = [
      ['wxAmt', 'Weather intensity', 0.3, 1.6, 0.1, v => v.toFixed(1) + '×'],
      ['seasonLen', 'Season length (Cycle)', 10, 120, 5, v => v + 's']
    ];
    const mkSliders = (list, parent) => list.forEach(([k, label, mn, mx, st, fmt]) => {
      const d = document.createElement('label'); d.className = 'sl';
      d.innerHTML = `<span>${label}</span><span></span><input type="range" min="${mn}" max="${mx}" step="${st}">`;
      const inp = d.querySelector('input'), out = d.querySelectorAll('span')[1];
      inp.oninput = () => { this.cfg[k] = +inp.value; out.textContent = fmt(+inp.value); this.save(); };
      if (k === 'density') inp.onchange = () => this.regrowAll();
      d._sync = () => { if (document.activeElement !== inp) inp.value = this.cfg[k]; out.textContent = fmt(+this.cfg[k]); };
      parent.appendChild(d);
    });
    mkSliders(this.SLIDERS, $('tsl'));
    mkSliders(this.WSLIDERS, $('twx'));
    [['boil', 'Hand-drawn boil'], ['pollen', 'Pollen'], ['visitors', 'Butterflies'], ['sound', 'Sound']].forEach(([k, label]) => {
      const b = document.createElement('button'); b.dataset.k = k; b.textContent = label;
      b.onclick = () => { this.cfg[k] = !this.cfg[k]; this.save(); if (k === 'sound' && this.cfg.sound) { this.audio(); this.sfx('space'); } this.syncTune(); this.ui(); };
      $('ttog').appendChild(b);
    });
    this.syncTune();
  }
  syncTune() {
    const $ = this.$;
    $('tflora').querySelectorAll('.fl').forEach(b => b.classList.toggle('on', b.dataset.id === this.cfg.flora));
    $('tfont').querySelectorAll('.ft').forEach(b => b.classList.toggle('on', b.dataset.id === this.cfg.font));
    $('tpal').querySelectorAll('.sw').forEach(b => b.classList.toggle('on', +b.dataset.id === this.state.palette));
    $('tsl').querySelectorAll('.sl').forEach(d => d._sync());
    $('twx').querySelectorAll('.sl').forEach(d => d._sync());
    $('tseason').querySelectorAll('.sg').forEach(b => b.classList.toggle('on', b.dataset.id === this.cfg.season));
    $('tweather').querySelectorAll('.sg').forEach(b => b.classList.toggle('on', b.dataset.id === this.cfg.weather));
    $('ttog').querySelectorAll('button').forEach(b => b.classList.toggle('on', !!this.cfg[b.dataset.k]));
  }
  drawPreviews() {
    const pc = this.pal();
    this.$('tflora').querySelectorAll('.fl').forEach((b, i) => {
      const c = b.querySelector('canvas'), g = c.getContext('2d'), B = this.backend(g), id = this.FLORA[i][0];
      g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = pc.bg; g.fillRect(0, 0, 92, 92);
      this.cc = pc.C;
      const one = (sp, x, y, R, ph) => {
        B.stroke([[x, y + R * 0.4], [x - 4, y + R * 1.6], [x + 2, 96]], pc.C.blue, 2.2);
        this.flower(B, x, y, R, sp === 'tulip' || sp === 'bell' ? 0 : 0.2, { sp, ph1: ph, ph2: ph * 1.7, turns: 1.9, ang: -Math.PI / 2 }, 4000, null);
      };
      if (id === 'meadow') { one('tulip', 28, 40, 17, 1.1); one('daisy', 62, 52, 19, 2.4); }
      else if (id === 'wild') { one('poppy', 24, 56, 15, 0.7); one('blossom', 50, 30, 14, 2.2); one('rose', 70, 60, 14, 4.1); }
      else one(id, 46, 42, id === 'bell' ? 30 : 27, id === 'bell' ? 1 : 1.9);
    });
  }
  changeFont() {
    this.applyFont();
    const go = () => { this.cache = {}; this.layout(); this.regrowAll(); this.buildPoster(); };
    if (document.fonts) document.fonts.load(`${this.FW} 100px ${this.F}`).then(go, go); else go();
  }
  // a fresh garden for the words already on screen: old blooms drop their petals, new ones grow
  regrowAll() {
    const A = this.letters.filter(l => !l.dead), now = performance.now();
    let prev = null;
    A.forEach(l => this.shed(l, 0.5));
    A.forEach((l, i) => {
      if (l.ch === ' ') { prev = l; return; }
      const same = prev && prev.ch !== ' ';
      l.ws = same ? prev.ws : Math.floor(this.rand() * 1e9); l.wi = same ? prev.wi + 1 : 0; l.prev = same ? prev : null;
      l.birth = now + i * 45; l.tb = l.birth; l.cut = null;
      this.gen(l); prev = l;
    });
    A.forEach((l, i) => { const nx = A[i + 1]; if (l.ch !== ' ' && nx && nx.ch === ' ') { l.cut = l.birth + 200; this.genEnd(l, 200); } });
    this.fa = {};
    this.buildPoster();
  }

  // ---------- DOM state ----------
  ui() {
    const s = this.state, isType = s.mode === 'type', pc = this.pal(), pr = this.preset(), $ = this.$;
    $('app').style.background = pc.bg; this._tk = this._pk;
    this.cv.style.display = isType ? 'block' : 'none';
    $('modes').innerHTML = '';
    for (const [id, label] of [['type', 'Type'], ['poster', 'Poster']]) {
      const b = document.createElement('button'), on = s.mode === id;
      b.textContent = label; b.style.background = on ? '#FFFFFF' : 'transparent'; b.style.color = on ? '#000' : '#BDBDBD';
      b.onclick = () => {
        if (id === 'poster' && s.mode !== 'poster') { this.toggleTune(false); $('ptext').value = this.liveText() || s.text; this.upd({ mode: 'poster', text: this.liveText() || s.text }); }
        else if (id === 'type') this.set({ mode: 'type' }, () => { this.resize(); this.inp.focus({ preventScroll: true }); });
      };
      $('modes').appendChild(b);
    }
    const bar = $('bar'); bar.style.display = isType ? 'flex' : 'none'; bar.style.color = pc.C.text;
    const dot = $('bpal').querySelector('.dot'); dot.style.background = pc.C.red; $('bpal').title = `${this.PAL[s.palette][0]} — next palette (Tab)`;
    $('bsnd').textContent = this.cfg.sound ? '♪ on' : '♪ off'; $('bsnd').classList.toggle('on', this.cfg.sound);
    if (!isType) this.toggleTune(false);
    $('poster').style.display = isType ? 'none' : 'grid';
    $('poster').classList.toggle('on', !isType);
    if (!isType) {
      $('info').textContent = `1:1 · ${pr.T / 1000}s loop · 30 fps`;
      $('presets').innerHTML = '';
      this.PRESETS.forEach(p => {
        const b = document.createElement('button'), sel = s.preset === p.id; b.className = 'pre';
        b.style.background = sel ? '#161616' : 'transparent'; b.style.border = `1px solid ${sel ? '#fff' : '#2A2A2A'}`;
        b.innerHTML = `<span>${p.label}</span><span>${p.sub}</span>`;
        b.onclick = () => this.upd({ preset: p.id });
        $('presets').appendChild(b);
      });
      $('vid').disabled = $('frm').disabled = s.busy;
      $('vid').textContent = this.vmime ? (s.busy ? 'Exporting…' : `Export ${this.vmime.includes('mp4') ? 'MP4' : 'WebM'} loop`) : 'Video export unavailable';
      $('status').textContent = s.status;
      if (document.activeElement !== $('ptext')) $('ptext').value = s.text;
    }
  }

  // ---------- sound ----------
  audio() {
    if (!this.ac) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
      const ac = new AC(), out = ac.createGain(), dl = ac.createDelay(1), fb = ac.createGain(), lp = ac.createBiquadFilter();
      out.gain.value = 0.5; dl.delayTime.value = 0.29; fb.gain.value = 0.34; lp.type = 'lowpass'; lp.frequency.value = 2200;
      out.connect(ac.destination); out.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(ac.destination);
      this.ac = ac; this.out = out;
    }
    if (this.ac.state === 'suspended') this.ac.resume();
    return this.ac;
  }
  tone(f, when, dur, vol, type) {
    const ac = this.ac, o = ac.createOscillator(), g = ac.createGain();
    o.type = type || 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(vol, when + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.connect(g); g.connect(this.out); o.start(when); o.stop(when + dur + 0.05);
    return o;
  }
  note(ch) { const P = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21], c = (ch || 'a').toLowerCase().charCodeAt(0); return 293.66 * Math.pow(2, P[c % 10] / 12); }
  sfx(kind, ch, delay) {
    if (!this.cfg.sound || this._silent) return;
    const ac = this.audio(); if (!ac) return;
    const t = ac.currentTime + (delay || 0);
    if (kind === 'letter') { const f = this.note(ch); this.tone(f, t, 0.9, 0.11); this.tone(f * 2, t, 0.3, 0.025, 'triangle'); }
    else if (kind === 'bloom') { const f = this.note(ch) * 4; this.tone(f, t, 1.6, 0.028); this.tone(f * 1.5, t + 0.07, 1.2, 0.015); }
    else if (kind === 'space') { this.tone(146.83, t, 1.8, 0.07); this.tone(220, t + 0.03, 1.5, 0.045); }
    else if (kind === 'back') { const o = this.tone(520, t, 0.25, 0.05, 'triangle'); o.frequency.exponentialRampToValueAtTime(240, t + 0.22); }
    else if (kind === 'clear') {
      const n = ac.sampleRate * 0.9, buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 1.5);
      const src = ac.createBufferSource(), bp = ac.createBiquadFilter(), g = ac.createGain();
      src.buffer = buf; bp.type = 'bandpass'; bp.Q.value = 0.9; bp.frequency.setValueAtTime(300, t); bp.frequency.exponentialRampToValueAtTime(2400, t + 0.6);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.22, t + 0.12); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);
      src.connect(bp); bp.connect(g); g.connect(this.out); src.start(t);
    }
  }

  // ---------- butterflies ----------
  spawnFly(cx, cy) {
    if (this.flies.length >= 6) { const o = this.flies.find(f => f.st !== 'leave'); if (o) this.flyOff(o); }
    const taken = new Set(this.flies.filter(f => f.st !== 'leave').map(f => f.pid));
    let best = null, bd = 1e9;
    for (const p of this.perch) { if (taken.has(p.id)) continue; const d = Math.hypot(p.x - cx, p.y - cy); if (d < bd) { bd = d; best = p; } }
    const left = cx < this.W / 2, sz = Math.max(9, this.Sd * 0.09);
    this.flies.push({ x: left ? -40 : this.W + 40, y: cy + (Math.random() - 0.5) * this.H * 0.4, vx: 0, vy: 0,
      st: best ? 'fly' : 'wander', pid: best ? best.id : null, hx: cx, hy: cy, t0: performance.now(), ph: Math.random() * 6, sz, seed: Math.random() * 100, ang: 0 });
  }
  flyOff(f) { f.st = 'leave'; f.pid = null; f.ex = f.x < this.W / 2 ? -80 : this.W + 80; f.ey = f.y - this.H * 0.3; }
  drawFlies(B, now, C) {
    const dt = Math.min(48, now - (this._fl || now)); this._fl = now;
    const byId = {}; for (const p of this.perch) byId[p.id] = p;
    this.flies = this.flies.filter(f => {
      const t = (now - f.t0) / 1000;
      let tx, ty;
      if (f.st === 'sit' || f.st === 'fly') {
        const p = byId[f.pid];
        if (!p) { this.flyOff(f); }
        else { tx = p.x + p.R * 0.05; ty = p.y - p.R * 0.55; }
      }
      if (f.st === 'sit' && f.stay && now > f.stay) this.flyOff(f);
      if (f.st === 'wander') {
        tx = f.hx + Math.sin(t * 1.3 + f.seed) * 70; ty = f.hy + Math.sin(t * 2.1 + f.seed) * 40;
        if (t > 3.5) this.flyOff(f);
      }
      if (f.st === 'leave') { tx = f.ex; ty = f.ey; }
      if (f.st === 'sit') {
        f.x += (tx - f.x) * 0.35; f.y += (ty - f.y) * 0.35; f.ang *= 0.85;
        f.ph += dt * 0.004;
        const burst = Math.sin(now / 1000 * 0.9 + f.seed) > 0.75;
        f.open = burst ? 0.2 + 0.8 * Math.abs(Math.cos(now / 1000 * 9 + f.seed)) : 0.25 + 0.15 * Math.sin(f.ph);
      } else {
        const dx = tx - f.x, dy = ty - f.y, d = Math.hypot(dx, dy) || 1, sp = f.st === 'leave' ? 0.42 : Math.min(0.34, 0.06 + d * 0.0016);
        const flut = Math.sin(t * 7 + f.seed) * 0.12, wob = Math.cos(t * 4.3 + f.seed) * 0.1;
        const ax = (dx / d * sp + wob + this.wind * 0.04) - f.vx, ay = (dy / d * sp + flut) - f.vy;
        f.vx += ax * 0.06 * dt / 16; f.vy += ay * 0.06 * dt / 16;
        f.x += f.vx * dt; f.y += f.vy * dt + Math.sin(t * 13 + f.seed) * 0.6;
        f.ang += (Math.max(-0.5, Math.min(0.5, f.vx * 1.4)) - f.ang) * 0.1;
        f.open = Math.abs(Math.cos(t * 17 + f.seed));
        if (f.st === 'fly' && d < 5) { f.st = 'sit'; f.ph = 0; if (f.auto) f.stay = now + 5000 + Math.random() * 6000; }
        if (f.st === 'leave' && (f.x < -60 || f.x > this.W + 60 || f.y < -60)) return false;
      }
      this.butterfly(B, f.x, f.y, f.sz, f.ang, f.open, C);
      return true;
    });
  }
  butterfly(B, x, y, s, ang, o, C) {
    const ca = Math.cos(ang), sa = Math.sin(ang), T = (px, py) => [x + (px * ca - py * sa) * s, y + (px * sa + py * ca) * s];
    const wing = (cx, cy, rx, ry, a, side) => {
      const pts = [], c = Math.cos(a), sn = Math.sin(a);
      for (let k = 0; k < 22; k++) { const th = k / 22 * Math.PI * 2, r = 1 + 0.08 * Math.sin(th * 3), lx = Math.cos(th) * rx * r, ly = Math.sin(th) * ry * r; pts.push(T(side * (cx + lx * c - ly * sn) * (0.12 + 0.88 * o), cy + lx * sn + ly * c)); }
      return pts;
    };
    for (const sd of [-1, 1]) {
      B.fill(wing(0.46, 0.28, 0.36, 0.3, 0.5 * sd * sd, sd), C.text);
      B.fill(wing(0.55, -0.32, 0.55, 0.36, -0.55, sd), C.text);
      if (o > 0.35) B.fill(wing(0.66, -0.4, 0.13, 0.11, 0, sd), C.red);
    }
    const body = []; for (let k = 0; k < 18; k++) { const th = k / 18 * Math.PI * 2; body.push(T(Math.cos(th) * 0.08, Math.sin(th) * 0.48)); }
    B.fill(body, C.blue);
    const lw = Math.max(0.8, s * 0.05);
    B.stroke([T(0, -0.42), T(-0.14, -0.72), T(-0.24, -0.86)], C.blue, lw);
    B.stroke([T(0, -0.42), T(0.14, -0.72), T(0.24, -0.86)], C.blue, lw);
  }
  faceTurn(e, x, y) {
    let wx = 0, wy = 0;
    const A = this.near(x, y);
    if (A) {
      const dx = A[0] - x, dy = A[1] - y, d = Math.hypot(dx, dy), reach = 300;
      if (d < reach && d > 0.001) {
        const w = 1 - d / reach, s = w * w * (3 - 2 * w) * Math.min(1, d / 40);
        wx = dx / d * s; wy = dy / d * s;
      }
    }
    const c = this.fa[e.id] || [0, 0];
    c[0] += (wx - c[0]) * 0.09; c[1] += (wy - c[1]) * 0.09;
    this.fa[e.id] = c;
    return c;
  }
  near(x, y) { return this.mx != null ? [this.mx, this.my] : null; }

  // ---------- petals, pollen, wind ----------
  shed(l, amt = 1, push = 0) {
    const all = [...(l.els || []), ...(l.endEls || [])], C = this.pal().C;
    for (const e of all) {
      if (e._x == null || (l.birth != null && performance.now() - l.birth < e.d0)) continue;
      if (e.t === 'rose') {
        const n = Math.round(Math.min(9, 3 + e._R / 7) * amt);
        for (let i = 0; i < n; i++) this.petal(e._x + (Math.random() - 0.5) * e._R, e._y + (Math.random() - 0.5) * e._R * 0.8, e._R * (0.22 + Math.random() * 0.16), C.red, push);
      } else if (e.t === 'leaf' && e._R > 4 && Math.random() < 0.3 * amt) this.petal(e._x, e._y, e._R * 0.35, C.blue, push, true);
    }
  }
  petal(x, y, s, col, push, leaf) {
    if (this.parts.length > 420) this.parts.shift();
    this.parts.push({ x, y, s: Math.max(2, s), col, leaf, t0: performance.now(), vx: (Math.random() - 0.5) * 0.16 + push * (0.25 + Math.random() * 0.35) + this.wind * 0.1,
      vy: -0.04 - Math.random() * 0.1, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.008, fl: Math.random() * 6.28, fs: 0.004 + Math.random() * 0.006, sw: Math.random() * 6.28 });
  }
  stepAir(g, now, dt, C) {
    // petals and leaves tumbling down
    const H = this.H, W = this.W;
    this.parts = this.parts.filter(p => {
      const age = now - p.t0;
      p.vy += (0.06 - p.vy) * 0.0025 * dt;
      p.vx += (this.wind * 0.22 + Math.sin(age * 0.0021 + p.sw) * 0.04 - p.vx) * 0.0025 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt + p.vx * 0.01; p.fl += p.fs * dt;
      const a = Math.min(1, (7000 - age) / 900);
      if (a <= 0 || p.y > H + 30 || p.x < -60 || p.x > W + 60) return false;
      const fx = Math.cos(p.fl), c = Math.cos(p.rot), s = Math.sin(p.rot);
      g.globalAlpha = a; g.fillStyle = p.col; g.beginPath();
      const rx = p.s * (0.25 + 0.75 * Math.abs(fx)), ry = p.s * (p.leaf ? 0.38 : 0.62);
      g.ellipse(p.x, p.y, rx, ry, p.rot, 0, Math.PI * 2);
      g.fill();
      if (!p.leaf && p.s > 5 && fx > 0) { g.strokeStyle = C.line; g.lineWidth = Math.max(0.6, p.s * 0.08); g.beginPath(); g.moveTo(p.x - c * rx * 0.5, p.y - s * rx * 0.5); g.quadraticCurveTo(p.x - s * ry * 0.4, p.y + c * ry * 0.4, p.x + c * rx * 0.5, p.y + s * rx * 0.5); g.stroke(); }
      return true;
    });
    // pollen rising off open flowers
    if (this.cfg.pollen && this.perch.length && this.pollen.length < 140 && Math.random() < Math.min(14, this.perch.length * 0.9) * dt / 1000 * this.polMul) {
      const p = this.perch[Math.floor(Math.random() * this.perch.length)];
      this.pollen.push({ x: p.x + (Math.random() - 0.5) * p.R, y: p.y - p.R * 0.2, vx: (Math.random() - 0.5) * 0.012, vy: -(0.008 + Math.random() * 0.02), t0: now, life: 2600 + Math.random() * 3200, r: Math.max(0.8, (0.6 + Math.random() * 1.4) * this.Sd / 200), ph: Math.random() * 6.28 });
    }
    g.fillStyle = C.line;
    this.pollen = this.pollen.filter(p => {
      const age = now - p.t0; if (age > p.life) return false;
      p.x += (p.vx + this.wind * 0.03 + Math.sin(age * 0.003 + p.ph) * 0.01) * dt; p.y += p.vy * dt;
      g.globalAlpha = Math.sin(Math.PI * age / p.life) * 0.85;
      g.beginPath(); g.arc(p.x, p.y, p.r, 0, Math.PI * 2); g.fill();
      return true;
    });
    g.globalAlpha = 1;
  }

  // ---------- math ----------
  h(n) { const x = Math.sin(n) * 43758.5453; return x - Math.floor(x); }
  spr(t, k = 7, w = 16) { if (t <= 0) return 0; return 1 - Math.exp(-t * k) * Math.cos(t * w); }
  eo(t) { if (t <= 0) return 0; if (t >= 1) return 1; return 1 - Math.pow(1 - t, 3); }
  rng(seed) {
    let s = seed | 0;
    return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  bez(a, b, c, d, n) {
    const P = [];
    for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t;
      P.push([u*u*u*a[0] + 3*u*u*t*b[0] + 3*u*t*t*c[0] + t*t*t*d[0], u*u*u*a[1] + 3*u*u*t*b[1] + 3*u*t*t*c[1] + t*t*t*d[1]]); }
    return P;
  }
  at(P, u) {
    const n = P.length; const i = Math.min(n - 2, Math.max(1, Math.round(u * (n - 1))));
    return [P[i], Math.atan2(P[i+1][1] - P[i-1][1], P[i+1][0] - P[i-1][0])];
  }
  jit(id, f, amp) {
    if (!amp) return [0, 0, 0];
    return [(this.h(id*1.37 + f*7.13)*2 - 1)*amp, (this.h(id*2.71 + f*3.11)*2 - 1)*amp, (this.h(id*5.3 + f*1.7)*2 - 1)*0.035];
  }
  path(c, p, closed) {
    const n = p.length; if (n < 2) return;
    const m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    if (closed) {
      const s = m(p[n-1], p[0]); c.moveTo(s[0], s[1]);
      for (let i = 0; i < n; i++) { const q = m(p[i], p[(i+1) % n]); c.quadraticCurveTo(p[i][0], p[i][1], q[0], q[1]); }
      c.closePath();
    } else {
      c.moveTo(p[0][0], p[0][1]);
      for (let i = 1; i < n - 1; i++) { const q = m(p[i], p[i+1]); c.quadraticCurveTo(p[i][0], p[i][1], q[0], q[1]); }
      c.lineTo(p[n-1][0], p[n-1][1]);
    }
  }
  backend(g) {
    return {
      fill: (p, col) => { g.beginPath(); this.path(g, p, true); g.fillStyle = col; g.fill(); },
      stroke: (p, col, w) => { g.beginPath(); this.path(g, p, false); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); },
      rect: (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); },
      text: (ch, x, y, S, col) => { g.font = `${this.FW} ${S}px ${this.F}`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillStyle = col; g.fillText(ch, x, y); }
    };
  }
  vine(base, dir, len, amp, waves, ph, bend, n) {
    n = n || 40; const P = [[base[0], base[1]]], step = len / n; let x = base[0], y = base[1];
    for (let i = 1; i <= n; i++) {
      const u = i / n, a = dir + bend * u + amp * Math.sin(u * Math.PI * waves + ph) * Math.min(1, u * 3);
      x += Math.cos(a) * step; y += Math.sin(a) * step; P.push([x, y]);
    }
    return P;
  }
  curl(P, sign, rad) {
    const n = P.length, e = P[n - 1], a = Math.atan2(e[1] - P[n - 2][1], e[0] - P[n - 2][0]);
    const c = [e[0] - Math.sin(a) * sign * rad, e[1] + Math.cos(a) * sign * rad];
    const a0 = Math.atan2(e[1] - c[1], e[0] - c[0]);
    for (let i = 1; i <= 14; i++) { const u = i / 14, t = a0 + sign * u * Math.PI * 1.6, rr = rad * (1 - 0.5 * u); P.push([c[0] + Math.cos(t) * rr, c[1] + Math.sin(t) * rr]); }
    return P;
  }
  weave(r, startLayer) {
    const cuts = []; const nc = 1 + Math.floor(r() * 3);
    for (let i = 0; i < nc; i++) cuts.push(0.15 + r() * 0.7);
    cuts.sort((a, b) => a - b);
    const segs = []; let u0 = 0, layer = startLayer;
    for (const c of cuts) {
      if (c <= u0) continue;
      segs.push({ u0, u1: c, layer });
      if (r() < 0.3) { const g = 0.02 + r() * 0.03; u0 = Math.min(0.98, c + g); } else u0 = c;
      layer = 1 - layer;
    }
    segs.push({ u0, u1: 1, layer });
    return segs;
  }
  layerAt(segs, u) { for (const s of segs) if (u >= s.u0 && u <= s.u1) return s.layer; return segs[segs.length - 1].layer; }

  // ---------- layout ----------
  resize() {
    const c = this.cv, r = c.getBoundingClientRect(), d = window.devicePixelRatio || 1;
    if (!r.width) return;
    this.W = r.width; this.H = r.height; this.dpr = d;
    c.width = Math.round(r.width * d); c.height = Math.round(r.height * d);
    this.layout(true);
  }
  syncVV() {
    const vv = this.vv; if (!vv) return;
    const w = Math.round(vv.width);
    if (this.vvW !== w) { this.vvW = w; this.vvMax = 0; }
    this.vvMax = Math.max(this.vvMax, vv.height);
    const kb = this.vvMax - vv.height > 120, de = document.documentElement;
    de.style.setProperty('--tg-top', vv.offsetTop + 'px');
    de.style.setProperty('--tg-h', vv.height + 'px');
    if (!kb && this.kbWas && document.activeElement === this.inp) this.inp.blur();
    this.kbWas = kb;
    this.resize();
  }
  mw(ch) {
    if (this.cache[ch] != null) return this.cache[ch];
    this.g.font = `${this.FW} 100px ${this.F}`;
    let w = this.g.measureText(ch).width / 100;
    if (ch === ' ') w *= 1.4;
    return (this.cache[ch] = w);
  }
  layoutCore(A, W, H, prevWrapped) {
    const maxW = W * 0.8, S0 = H * 0.28, LH = 2.1;
    const ws = A.map(l => this.mw(l.ch));
    const words = []; let cur = null;
    A.forEach((l, i) => {
      if (l.ch === ' ') { if (cur) { words.push(cur); cur = null; } words.push({ sp: true, idx: [i] }); }
      else { if (!cur) cur = { idx: [] }; cur.idx.push(i); }
    });
    if (cur) words.push(cur);
    const lineW = (li, S) => { let e = li.length; while (e > 0 && A[li[e-1]].ch === ' ') e--; let w = 0; for (let k = 0; k < e; k++) w += ws[li[k]]; return w * S; };
    const wrap = S => {
      const lines = [[]]; let lw = 0;
      for (const w of words) {
        const ww = w.idx.reduce((s, i) => s + ws[i], 0) * S;
        if (!w.sp && lw > 0 && lw + ww > maxW) { lines.push([]); lw = 0; }
        lines[lines.length - 1].push(...w.idx); lw += ww;
      }
      return lines;
    };
    let lines = [A.map((_, i) => i)];
    const unit = lineW(lines[0], 1);
    let S = unit > 0 ? Math.min(S0, maxW / unit) : S0;
    const multi = words.filter(w => !w.sp).length > 1;
    let wrapped = multi && (S < H * 0.1 || (prevWrapped && S < H * 0.14));
    if (wrapped) {
      let lo = H * 0.03, hi = H * 0.15;
      for (let k = 0; k < 22; k++) {
        const mid = (lo + hi) / 2, ls = wrap(mid);
        const ok = ls.every(li => lineW(li, mid) <= maxW) && ls.length * LH * mid <= H * 0.82;
        if (ok) lo = mid; else hi = mid;
      }
      S = lo; lines = wrap(S);
      if (lines.length < 2) wrapped = false;
    }
    const n = lines.length, lh = LH * S;
    lines.forEach((li, k) => {
      let x = W / 2 - lineW(li, S) / 2;
      const y = H / 2 + (k - (n - 1) / 2) * lh + 0.33 * S;
      li.forEach(i => { const l = A[i], w = ws[i] * S; l.tx = x + w / 2; l.ty = y; l.tw = w; l.line = k; x += w; });
    });
    return { S, wrapped, n };
  }
  layout(snap) {
    if (!this.W) return;
    const A = this.letters.filter(l => !l.dead);
    const res = this.layoutCore(A, this.W, this.H, this.wrapped);
    this.wrapped = res.wrapped;
    A.forEach(l => { if (l.x == null) { l.x = l.tx; l.y = l.ty; } });
    const S = res.S, last = A[A.length - 1];
    this.St = S;
    this.ctx_ = last ? last.tx + last.tw / 2 + 0.07 * S : this.W / 2;
    this.cty = last ? last.ty - 0.33 * S : this.H / 2;
    if (snap || !this.Sd) { this.Sd = S; this.cx = this.ctx_; this.cy = this.cty; A.forEach(l => { l.x = l.tx; l.y = l.ty; }); }
  }

  // ---------- input ----------
  liveText() { return (this.letters || []).filter(l => !l.dead).map(l => l.ch).join('').trim(); }
  wither(now) {
    const A = this.letters.filter(l => !l.dead), last = A[A.length - 1];
    if (!last) return;
    last.dead = now;
    this.shed(last, 1);
    this.sfx('back');
    const pv = A[A.length - 2];
    if (pv && pv.ch !== ' ') { pv.cut = null; pv.endEls = null; pv.tb = now; }
    this.layout();
  }
  // enter: a gust blows the whole garden off the page
  clearAll(now) {
    const A = this.letters.filter(l => !l.dead);
    if (!A.length) return;
    const dir = (this.mx != null && this.mx > this.W / 2) ? -1 : 1;
    this.gust = dir * 1.8; this._blow = 1800;
    A.forEach((l, i) => { this.shed(l, 1.3, dir); l.dead = now + (dir > 0 ? i : A.length - 1 - i) * 22; });
    this.sfx('clear');
    this.layout();
  }
  // phone keyboards often write into the field instead of firing key events: mirror it and apply the difference
  inputDiff(el) {
    const S = this.SENT;
    if (this.state.mode !== 'type' || this._kd) { this.iv = this.composing ? el.value : S; if (!this.composing) el.value = S; return; }
    const old = this.iv == null ? S : this.iv, cur = el.value;
    let p = 0; while (p < old.length && p < cur.length && old[p] === cur[p]) p++;
    let dels = old.length - p;
    if (p === 0 && old[0] === S && old.length > 1) dels -= 1;
    const now = performance.now(); this.lastKey = now;
    for (let i = 0; i < dels; i++) this.wither(now);
    for (const ch of cur.slice(p)) {
      if (ch === S) continue;
      if (ch.charCodeAt(0) === 10) this.clearAll(now); else this.add(ch, now);
    }
    if (this.composing) this.iv = cur; else { el.value = S; this.iv = S; }
    this.pushHist();
  }
  key(e) {
    const cm = e.metaKey || e.ctrlKey, k = (e.key || '').toLowerCase();
    // the command palette owns the keyboard while it is open
    if (this.cmdOpen) {
      if (k === 'escape') { e.preventDefault(); this.toggleCmd(false); }
      else if (k === 'arrowdown' || (cm && k === 'n')) { e.preventDefault(); this.cmdSel = Math.min(this.cmdHits.length - 1, this.cmdSel + 1); this.renderCmds(); }
      else if (k === 'arrowup' || (cm && k === 'p')) { e.preventDefault(); this.cmdSel = Math.max(0, this.cmdSel - 1); this.renderCmds(); }
      else if (k === 'enter') { e.preventDefault(); this.runCmd(); }
      else if (cm && k === 'k') { e.preventDefault(); this.toggleCmd(false); }
      return;
    }
    if (this.keysOpen) { if (k === 'escape' || k === '?' || k === 'enter') { e.preventDefault(); this.toggleKeys(false); } return; }
    if (cm && k === 'k') { e.preventDefault(); this.toggleCmd(true); return; }
    if (this.state.mode !== 'type') return;
    if (e.key === 'Escape' && this.tuneOpen) { this.toggleTune(false); return; }
    if (cm || e.altKey) {
      if (cm && k === 's') { e.preventDefault(); e.shiftKey ? this.saveSVG() : this.savePNG(); }
      else if (cm && k === 'z') { e.preventDefault(); e.shiftKey ? this.redo() : this.undo(); }
      else if (cm && k === 'y') { e.preventDefault(); this.redo(); }
      else if (cm && k === 'c' && !(window.getSelection && String(window.getSelection()))) { e.preventDefault(); this.copyImage(); }
      return;
    }
    // the hidden capture field is always focused, so only a real visible field blocks '?'
    const tg = e.target, inField = tg && (tg.tagName === 'TEXTAREA' || (tg.tagName === 'INPUT' && tg.id !== 'inp'));
    if (e.key === '?' && !inField) { e.preventDefault(); this.toggleKeys(true); return; }
    if (e.target && e.target.tagName === 'BUTTON' && (e.key === 'Enter' || e.key === ' ')) return;
    if (e.target && e.target.tagName === 'INPUT' && e.target.type === 'range') return;
    if (e.key === 'Tab') { e.preventDefault(); this.setPalette((this.state.palette + (e.shiftKey ? this.PAL.length - 1 : 1)) % this.PAL.length); return; }
    const now = performance.now();
    if (e.key === 'Backspace') { e.preventDefault(); this.mark(); this.wither(now); this.pushHist(true); return; }
    if (e.key === 'Enter') { e.preventDefault(); this.mark(); this.clearAll(now); this.pushHist(true); return; }
    if (e.key.length !== 1) return;
    e.preventDefault(); this.mark();
    this.add(e.key, now);
  }
  mark() { this.lastKey = performance.now(); this._kd = true; setTimeout(() => { this._kd = false; }, 0); }
  add(ch, now) {
    const A = this.letters.filter(l => !l.dead), last = A[A.length - 1];
    if (ch === ' ') {
      if (last && last.ch !== ' ') { last.cut = now; this.genEnd(last, now - last.birth); this.sfx('space'); }
      this.letters.push({ ch: ' ', id: this.uid++, birth: now, els: [] });
      this.layout(); this.pushHist(true); return;
    }
    const same = last && last.ch !== ' ';
    const l = { ch, id: this.uid++, birth: now, tb: now, ws: same ? last.ws : Math.floor(this.rand() * 1e9), wi: same ? last.wi + 1 : 0, prev: same ? last : null };
    this.gen(l);
    this.letters.push(l);
    this.layout();
    this.sfx('letter', ch);
    const fl = l.els.filter(e => e.t === 'rose');
    if (fl.length) this.sfx('bloom', ch, (Math.min(...fl.map(e => e.d0)) + 380) / this.cfg.speed / 1000);
    this.pushHist();
  }

  // ---------- growth ----------
  wordParams(ws) {
    const r = this.rng(ws * 7 + 13), dens = this.props.density ?? 1;
    const p = { roseP: 0.3 + r() * 0.3, leafy: (0.6 + r() * 0.8) * dens, dens, lean: (r() - 0.5) * 0.6, big: 0.85 + r() * 0.45, curvy: 0.8 + r() * 0.6, bridgeP: Math.min(0.95, (0.45 + r() * 0.35) * dens), w: 0.5 };
    const fl = this.cfg.flora, pick = r() < 0.34 ? 'rose' : this.SPECIES[1 + Math.floor(r() * (this.SPECIES.length - 1))];
    p.species = fl === 'meadow' ? pick : fl === 'wild' ? null : fl;
    return p;
  }
  grow(r, E, nid, p, o) {
    const tip = o.tip || (r() < p.roseP ? 'rose' : r() < 0.45 ? 'fan' : r() < 0.6 ? 'leaf' : 'curl');
    let P = o.pts || this.vine(o.base, o.dir, o.len, (0.35 + r() * 0.45) * p.curvy, 1 + r() * 1.6, r() * 6.28, (r() - 0.5) * 1.2, 40);
    if (tip === 'curl') P = this.curl(P, r() < 0.5 ? -1 : 1, 0.05 + r() * 0.05);
    const segs = this.weave(r, o.layer0 != null ? o.layer0 : (r() < 0.5 ? 0 : 1));
    const dur = Math.max(320, (o.len || 0.8) * 620);
    const thorns = []; const nt = Math.floor(r() * 2.5);
    for (let i = 0; i < nt; i++) thorns.push({ u: 0.15 + r() * 0.65, s: r() < 0.5 ? -1 : 1 });
    E.push({ t: 'stem', id: nid(), pts: P, segs, d0: o.d0, dur, w: o.depth ? 0.82 : 1, thorns });
    const nl = Math.floor(r() * 2.8 * p.leafy);
    let sd = r() < 0.5 ? -1 : 1;
    for (let i = 0; i < nl; i++) {
      const u = 0.25 + r() * 0.6, [q, a] = this.at(P, u); sd = -sd;
      E.push({ t: 'leaf', id: nid(), x: q[0], y: q[1], a: a + sd * (0.55 + r() * 0.5), L: (0.14 + r() * 0.2) * (o.depth ? 0.8 : 1), bend: (r() - 0.5) * 1.2, layer: this.layerAt(segs, u), d0: o.d0 + dur * u });
    }
    const [tp, ta] = this.at(P, 1), td = o.d0 + dur * 0.8, tl = this.layerAt(segs, 1);
    if (tip === 'rose') {
      const sp = p.species || this.SPECIES[Math.floor(r() * this.SPECIES.length)];
      const sz = { rose: 1, tulip: 1.05, daisy: 1.05, poppy: 1.12, blossom: 0.82, bell: 1.15 }[sp];
      const R = (0.13 + r() * 0.15) * p.big * (o.depth ? 0.75 : 1) * sz;
      // legibility: a bloom sitting over the letter body mostly goes behind it
      const over = tp[1] > -0.78 && tp[1] < 0.05 && Math.abs(tp[0]) < p.w * 0.5;
      const layer = over ? (r() < 0.22 ? 1 : 0) : (r() < 0.6 ? 1 : tl);
      E.push({ t: 'rose', sp, ang: ta, id: nid(), x: tp[0], y: tp[1], R, rot: (r() - 0.5) * 1.0, ph1: r() * 6.28, ph2: r() * 6.28, turns: 1.8 + r() * 1, layer, d0: td });
      if (r() < 0.2) { const oo = ta + (r() < 0.5 ? 1 : -1) * 1.3; E.push({ t: 'rose', sp, ang: oo, id: nid(), x: tp[0] + Math.cos(oo) * R * 1.4, y: tp[1] + Math.sin(oo) * R * 1.4, R: R * (0.6 + r() * 0.3), rot: (r() - 0.5) * 1.2, ph1: r() * 6.28, ph2: r() * 6.28, turns: 1.8 + r(), layer, d0: td + 120 }); }
    } else if (tip === 'fan') {
      const spread = 0.6 + r() * 0.3;
      for (let j = 0; j < 2; j++) E.push({ t: 'leaf', id: nid(), x: tp[0], y: tp[1], a: ta + (j - 0.5) * spread, L: 0.2 + r() * 0.2, bend: (j - 0.5) * 0.8, layer: tl, d0: td + j * 60 });
    } else if (tip === 'leaf') {
      E.push({ t: 'leaf', id: nid(), x: tp[0], y: tp[1], a: ta + (r() - 0.5) * 0.3, L: 0.16 + r() * 0.16, bend: (r() - 0.5), layer: tl, d0: td });
    }
    if (!o.depth && r() < 0.3) {
      const u = 0.35 + r() * 0.35, [q, a] = this.at(P, u);
      this.grow(r, E, nid, p, { base: q, dir: a + (r() < 0.5 ? -1 : 1) * (0.7 + r() * 0.4), len: (o.len || 0.8) * (0.35 + r() * 0.2), d0: o.d0 + dur * u, depth: 1, layer0: this.layerAt(segs, u) });
    }
    return P;
  }
  gen(l) {
    const r = this.rng((l.ws ^ Math.imul(l.wi + 1, 2654435761)) + Math.floor(this.rand() * 1e6));
    const p = this.wordParams(l.ws), E = []; let k0 = 0; const nid = () => l.id * 100 + (k0++);
    const w = this.mw(l.ch), inX = () => (r() - 0.5) * w * 0.7; p.w = w;
    const nUp = 1 + (r() < 0.45 * p.dens ? 1 : 0);
    for (let i = 0; i < nUp; i++) {
      this.grow(r, E, nid, p, { base: [inX(), -r() * 0.3], dir: -Math.PI / 2 + p.lean * 0.5 + (r() - 0.5) * 0.7, len: 0.6 + r() * 0.5, d0: 40 + i * 130, tip: l.wi === 0 && i === 0 ? 'rose' : null });
    }
    if (r() < 0.4 * p.dens) this.grow(r, E, nid, p, { base: [inX(), -0.1 - r() * 0.35], dir: Math.PI / 2 + (r() - 0.5) * 0.8, len: 0.35 + r() * 0.35, d0: 160 });
    if (l.prev && r() < p.bridgeP) {
      const px = -(this.mw(l.prev.ch) + w) / 2;
      const a = [inX(), -0.05 - r() * 0.55], b = [px + (r() - 0.5) * 0.25, -0.05 - r() * 0.55];
      const bulge = (r() < 0.55 ? -1 : 1) * (0.4 + r() * 0.4), dx = b[0] - a[0];
      let P = this.bez(a, [a[0] + dx * 0.15, a[1] + bulge], [b[0] - dx * 0.15, b[1] + bulge * 0.9], b, 40);
      if (r() < 0.45) P = P.slice(0, Math.floor(P.length * (0.7 + r() * 0.2)));
      this.grow(r, E, nid, p, { pts: P, len: Math.abs(dx) + Math.abs(bulge), d0: 90, tip: r() < 0.5 ? 'curl' : r() < 0.5 ? 'leaf' : 'rose' });
    }
    if (l.wi === 0) this.grow(r, E, nid, p, { base: [-w * 0.3, -0.15 - r() * 0.4], dir: Math.PI + (r() - 0.5) * 1.2, len: 0.45 + r() * 0.3, d0: 120, tip: 'curl' });
    l.els = E;
    l.endEls = null;
    const T = [], tr = this.rng(l.id * 977 + Math.floor(this.rand() * 1e6));
    this.grow(tr, T, () => l.id * 100 + 90 + T.length, p, { base: [w * 0.25, -0.1 - tr() * 0.45], dir: (tr() - 0.5) * 1.4, len: 0.45 + tr() * 0.25, d0: 0, tip: 'curl', depth: 1 });
    l.tend = T.filter(e => e.t === 'stem').slice(0, 1);
  }
  genEnd(l, rel) {
    const r = this.rng(l.ws + l.wi * 31 + Math.floor(this.rand() * 1e6)), p = this.wordParams(l.ws), E = [];
    let k0 = 50; const nid = () => l.id * 100 + (k0++);
    const w = this.mw(l.ch), n = 1 + Math.floor(r() * 2.5); p.w = w;
    for (let i = 0; i < n; i++) {
      const dir = -Math.PI / 2 + 0.6 + (i - (n - 1) / 2) * 0.9 + (r() - 0.5) * 0.4;
      this.grow(r, E, nid, p, { base: [(r() - 0.2) * w * 0.6, -r() * 0.5], dir, len: 0.4 + r() * 0.45, d0: rel + 40 + i * 90, depth: 1, tip: i === 0 || r() < 0.5 ? 'rose' : 'fan' });
    }
    l.endEls = E;
  }

  // ---------- drawing ----------
  strokeRange(B, P, a, b, col, w) {
    const n = P.length - 1, ia = a * n, ib = b * n;
    const lerp = t => { const i = Math.min(n - 1, Math.floor(t)), f = t - i; return [P[i][0] + (P[i+1][0] - P[i][0]) * f, P[i][1] + (P[i+1][1] - P[i][1]) * f]; };
    const pts = [lerp(ia)];
    for (let i = Math.floor(ia) + 1; i < ib; i++) pts.push(P[i]);
    pts.push(lerp(ib));
    if (pts.length >= 2) B.stroke(pts, col, w);
  }
  thorn(B, P, u, s, S) {
    const [p, a] = this.at(P, u), d = a + s * 2.3, L = S * 0.045;
    B.stroke([p, [p[0] + Math.cos(d) * L, p[1] + Math.sin(d) * L]], this.cc.blue, S * 0.022);
  }
  leaf(B, bx, by, a, L, bend) {
    if (L < 0.5) return;
    const ca = Math.cos(a), sa = Math.sin(a), px = -sa, py = ca;
    const ax = u => { const b = Math.sin(Math.PI * u) * bend * 0.15 * L; return [bx + ca * u * L + px * b, by + sa * u * L + py * b]; };
    const hw = u => L * 0.18 * Math.sin(Math.PI * Math.pow(u, 0.8));
    const N = 12, s1 = [], s2 = [];
    for (let i = 0; i <= N; i++) { const u = i / N, c = ax(u), w = hw(u); s1.push([c[0] + px * w, c[1] + py * w]); s2.push([c[0] - px * w, c[1] - py * w]); }
    const tip = ax(1), base = ax(0);
    B.fill([base, ...s1.slice(1, N), tip, tip, ...s2.slice(1, N).reverse(), base], this.cc.blue);
    if (L > 6) { const v = []; for (let i = 0; i <= 8; i++) v.push(ax(0.08 + 0.72 * i / 8)); B.stroke(v, this.cc.vein, Math.max(0.8, L * 0.03)); }
  }
  // shared transform for every bloom: rotation plus the lean towards the cursor (tl)
  tf(cx, cy, R, rot, tl) {
    const cr = Math.cos(rot), sr = Math.sin(rot);
    const tm = tl ? Math.hypot(tl[0], tl[1]) : 0, ux = tm ? tl[0] / tm : 0, uy = tm ? tl[1] / tm : 0, sq = -0.28 * tm;
    return (x, y, z = 0) => {
      let dx = x * cr - y * sr, dy = x * sr + y * cr;
      if (tm) { const k = (dx * ux + dy * uy) * sq; dx += k * ux + tl[0] * R * z; dy += k * uy + tl[1] * R * z; }
      return [cx + dx, cy + dy];
    };
  }
  // a pointed petal from base to tip in unit space; returns outline and both edges
  blade(bx, by, tx, ty, w, bulge = 0, N = 12, pw = 0.75) {
    const dx = tx - bx, dy = ty - by, L = Math.hypot(dx, dy) || 1e-6, px = -dy / L, py = dx / L, s1 = [], s2 = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N, hw = w * L * Math.sin(Math.PI * Math.pow(u, pw)), b = Math.sin(Math.PI * u) * bulge * L;
      const cx = bx + dx * u + px * b, cy = by + dy * u + py * b;
      s1.push([cx + px * hw, cy + py * hw]); s2.push([cx - px * hw, cy - py * hw]);
    }
    return { pts: [s1[0], s1[0], ...s1.slice(1, N), s1[N], s1[N], ...s2.slice(1, N).reverse()], s1, s2 };
  }
  circ(B, T, x, y, r, col, z = 0, n = 10) { const pts = []; for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2; pts.push(T(x + Math.cos(a) * r, y + Math.sin(a) * r, z)); } B.fill(pts, col); }
  flower(B, cx, cy, R, rot, e, a, tl) {
    switch (e.sp) {
      case 'tulip': return this.tulip(B, cx, cy, R, rot, e, a, tl);
      case 'daisy': return this.daisy(B, cx, cy, R, rot, e, a, tl);
      case 'poppy': return this.poppy(B, cx, cy, R, rot, e, a, tl);
      case 'blossom': return this.blossom(B, cx, cy, R, rot, e, a, tl);
      case 'bell': return this.bell(B, cx, cy, R, rot, e, a, tl);
      default: return this.rose(B, cx, cy, R, rot, e, a, tl);
    }
  }
  rose(B, cx, cy, R, rot, e, a, tl) {
    const T = this.tf(cx, cy, R, rot, tl);
    // petals, back to front: [cx, cy, rx, ry, angle, depth, edge]
    const P = [
      [0, -0.36, 0.56, 0.54, 0, 0, 0],
      [-0.5, -0.06, 0.6, 0.6, -0.35, 0, 0],
      [0.52, -0.06, 0.6, 0.6, 0.35, 0, 0],
      [-0.42, 0.3, 0.62, 0.48, 0.2, 0.12, 1],
      [0.47, 0.3, 0.62, 0.48, -0.2, 0.12, 1],
      [0.05, 0.42, 0.56, 0.38, 0, 0.14, 0]
    ];
    const ax0 = 0, ay0 = 0.5, lw = Math.max(0.8, R * 0.045), st = 85;
    P.forEach((q, i) => {
      const s = this.spr((a - i * st) / 1000, 8, 14); if (s <= 0.001) return;
      const open = (1 - Math.min(1, s)) * (q[0] < 0 ? 0.5 : -0.5), ang = q[4] + open, ca = Math.cos(ang), sa = Math.sin(ang);
      const pt = th => {
        const rr = 1 + 0.08 * Math.sin(3 * th + e.ph1 + i) + 0.04 * Math.sin(5 * th + e.ph2);
        const lx = Math.cos(th) * q[2] * rr, ly = Math.sin(th) * q[3] * rr;
        const px = q[0] + lx * ca - ly * sa, py = q[1] + lx * sa + ly * ca;
        return T((ax0 + (px - ax0) * s) * R, (ay0 + (py - ay0) * s) * R, q[5]);
      };
      const pts = []; for (let k = 0; k < 26; k++) pts.push(pt(k / 26 * Math.PI * 2));
      B.fill(pts, this.cc.red);
      if (q[6] && R >= 12 && s > 0.4) {
        const arc = []; for (let k = 0; k <= 14; k++) arc.push(pt(Math.PI * (1.18 + 0.64 * k / 14)));
        this.strokeRange(B, arc, 0, Math.min(1, (s - 0.4) / 0.5), this.cc.line, lw * 0.8);
      }
    });
    const fr = this.eo((a - P.length * st - 80) / 520);
    if (fr > 0 && R > 3) {
      const sp = [], scl = [];
      const turns = R < 20 ? Math.min(e.turns, 1.3) : R < 32 ? e.turns * 0.8 : e.turns;
      for (let i = 0; i <= 70; i++) { const u = i / 70, th = e.ph1 + u * turns * Math.PI * 2, rr = R * (0.08 + 0.57 * u); sp.push(T(Math.cos(th) * rr * 1.05, Math.sin(th) * rr * 0.72 - 0.12 * R, 0.34 - 0.24 * u)); }
      this.strokeRange(B, sp, 0, fr, this.cc.line, lw);
      if (R >= 14) {
        for (let i = 0; i <= 36; i++) { const u = i / 36; scl.push(T((-0.72 + 1.5 * u) * R, 0.36 * R + 0.16 * R * Math.abs(Math.sin(u * Math.PI * 3)), 0.18)); }
        this.strokeRange(B, scl, 0, fr, this.cc.line, lw);
      }
    }
  }
  // a cup of three petals with a fourth in front, opening along the stem
  tulip(B, cx, cy, R, rot, e, a, tl) {
    const up = (e.ang != null ? e.ang + Math.PI / 2 : 0) * 0.85 + rot * 0.3;
    const T = this.tf(cx, cy, R, up, tl), C = this.cc, lw = Math.max(0.8, R * 0.045);
    const open = 0.15 + 0.25 * (0.5 + 0.5 * Math.sin(e.ph1));
    const s0 = this.spr(a / 1000, 6, 11); if (s0 <= 0.001) return;
    const M = pts => pts.map(([x, y]) => [(x * s0) * R, (0.5 + (y - 0.5) * s0) * R]);
    const draw = (bl, z, edges) => {
      const pts = M(bl.pts).map(([x, y]) => T(x, y, z)); B.fill(pts, C.red);
      if (R >= 10 && edges) for (const ed of edges) this.strokeRange(B, M(bl[ed]).map(([x, y]) => T(x, y, z)), 0.18, Math.min(0.92, 0.18 + s0 * 0.74), C.line, lw * 0.85);
    };
    const sO = i => Math.min(1.15, this.spr((a - 120 - i * 90) / 1000, 6, 11));
    draw(this.blade(0, 0.45, 0, -0.78, 0.36, 0, 14, 0.6), 0, null);
    const o1 = sO(0), o2 = sO(1);
    draw(this.blade(-0.06, 0.5, -0.16 - (0.1 + open * 0.6) * o1, -0.66 + open * 0.2 * o1, 0.36, -0.16, 14, 0.6), 0.08, ['s1']);
    draw(this.blade(0.06, 0.5, 0.16 + (0.1 + open * 0.6) * o2, -0.66 + open * 0.2 * o2, 0.36, 0.16, 14, 0.6), 0.08, ['s2']);
    draw(this.blade(0, 0.55, 0, -0.32 - 0.08 * sO(2), 0.4, 0, 14, 0.55), 0.16, ['s1', 's2']);
  }
  daisy(B, cx, cy, R, rot, e, a, tl) {
    const T = this.tf(cx, cy, R, rot * 0.5, tl), C = this.cc, lw = Math.max(0.7, R * 0.035);
    const n = 12 + Math.floor((e.ph2 / 6.283) * 6), tilt = 0.74 + 0.16 * Math.sin(e.ph1), r0 = 0.16;
    for (let i = 0; i < n; i++) {
      const th = e.ph1 + i / n * Math.PI * 2 + 0.06 * Math.sin(i * 3.1);
      const s = Math.min(1.1, this.spr((a - (i % 2) * 70 - i * 12) / 1000, 7, 13)); if (s <= 0.001) continue;
      const len = (0.74 + 0.14 * Math.sin(i * 2.3 + e.ph2)) * s, c = Math.cos(th), sn = Math.sin(th) * tilt;
      // a rounded strap petal: an ellipse from the disc outwards, foreshortened by the tilt
      const mx = r0 + len / 2, hw = (0.085 + 0.015 * Math.sin(i * 1.7)) * Math.min(1, s * 1.4), pts = [];
      for (let k = 0; k < 16; k++) {
        const t = k / 16 * Math.PI * 2, lx = mx + Math.cos(t) * len / 2, ly = Math.sin(t) * hw;
        pts.push(T((lx * Math.cos(th) - ly * Math.sin(th)) * R, (lx * Math.sin(th) + ly * Math.cos(th)) * tilt * R, 0.05));
      }
      B.fill(pts, C.red);
      if (R >= 16 && s > 0.6) {
        const mid = []; for (let k = 0; k <= 6; k++) { const u = 0.2 + 0.55 * k / 6; mid.push(T(c * (r0 + len * u) * R, sn * (r0 + len * u) * R, 0.05)); }
        B.stroke(mid, C.line, lw * 0.7);
      }
    }
    const cs = this.eo((a - 160) / 520); if (cs <= 0) return;
    const pts = []; for (let k = 0; k < 18; k++) { const t = k / 18 * Math.PI * 2; pts.push(T(Math.cos(t) * 0.27 * cs * R, Math.sin(t) * 0.27 * tilt * cs * R, 0.25)); }
    B.fill(pts, C.line);
    if (R >= 12) for (let k = 0; k < 13; k++) {
      const rr = 0.2 * Math.sqrt((k + 0.5) / 13) * cs, t = k * 2.39996 + e.ph2;
      this.circ(B, T, Math.cos(t) * rr * R, Math.sin(t) * rr * tilt * R, Math.max(0.6, R * 0.022), C.red, 0.28, 6);
    }
  }
  poppy(B, cx, cy, R, rot, e, a, tl) {
    const T = this.tf(cx, cy, R, rot + e.ph1 * 0.2, tl), C = this.cc, lw = Math.max(0.8, R * 0.045);
    const angs = [-2.3, -0.85, 2.35, 0.8];
    angs.forEach((ang, i) => {
      const s = Math.min(1.08, this.spr((a - i * 110) / 1000, 6, 11)); if (s <= 0.001) return;
      const front = i >= 2, d = 0.34 * s, ca = Math.cos(ang), sa = Math.sin(ang), z = front ? 0.12 : 0;
      const pt = th => {
        const rr = 1 + 0.07 * Math.sin(4 * th + e.ph1 + i) + 0.05 * Math.sin(7 * th + e.ph2);
        const lx = Math.cos(th) * 0.58 * rr * s, ly = Math.sin(th) * 0.5 * rr * s;
        return T((ca * d + lx * ca - ly * sa) * R, (sa * d + lx * sa + ly * ca) * R, z);
      };
      const pts = []; for (let k = 0; k < 28; k++) pts.push(pt(k / 28 * Math.PI * 2));
      B.fill(pts, C.red);
      if (front && R >= 12 && s > 0.4) { const arc = []; for (let k = 0; k <= 14; k++) arc.push(pt(Math.PI * (0.62 + 0.76 * k / 14))); this.strokeRange(B, arc, 0, Math.min(1, (s - 0.4) / 0.5), C.line, lw * 0.85); }
    });
    const cs = this.eo((a - 420) / 480); if (cs <= 0) return;
    this.circ(B, T, 0, 0, 0.2 * cs * R, C.vein, 0.22, 14);
    if (R >= 10) for (let k = 0; k < 11; k++) {
      const t = k / 11 * Math.PI * 2 + e.ph2, r1 = 0.2 * cs, r2 = (0.3 + 0.04 * Math.sin(k * 2.7)) * cs;
      B.stroke([T(Math.cos(t) * r1 * R, Math.sin(t) * r1 * R, 0.22), T(Math.cos(t) * r2 * R, Math.sin(t) * r2 * R, 0.22)], C.line, lw * 0.8);
    }
    this.circ(B, T, 0, 0, 0.09 * cs * R, C.line, 0.24, 10);
  }
  blossom(B, cx, cy, R, rot, e, a, tl) {
    const T = this.tf(cx, cy, R, rot + e.ph1, tl), C = this.cc, lw = Math.max(0.7, R * 0.04);
    for (let i = 0; i < 5; i++) {
      const th = i / 5 * Math.PI * 2, s = Math.min(1.08, this.spr((a - i * 55) / 1000, 7, 13)); if (s <= 0.001) continue;
      const pc = [Math.cos(th) * 0.44 * s, Math.sin(th) * 0.44 * s], pts = [];
      for (let k = 0; k < 26; k++) {
        const phi = k / 26 * Math.PI * 2; let df = Math.atan2(Math.sin(phi - th), Math.cos(phi - th));
        const rr = 0.42 * s * (1 - 0.3 * Math.exp(-df * df / 0.03)) * (1 + 0.04 * Math.sin(3 * phi + e.ph2));
        pts.push(T((pc[0] + Math.cos(phi) * rr) * R, (pc[1] + Math.sin(phi) * rr * 0.92) * R, 0.06));
      }
      B.fill(pts, C.red);
    }
    const cs = this.eo((a - 300) / 450); if (cs <= 0 || R < 5) return;
    for (let k = 0; k < 8; k++) {
      const t = k / 8 * Math.PI * 2 + e.ph2, r2 = (0.3 + 0.07 * Math.sin(k * 1.9)) * cs;
      const tip = [Math.cos(t) * r2 * R, Math.sin(t) * r2 * R];
      B.stroke([T(0, 0, 0.2), T(tip[0], tip[1], 0.2)], C.line, lw * 0.75);
      this.circ(B, T, tip[0], tip[1], Math.max(0.8, R * 0.045), C.line, 0.2, 6);
    }
    this.circ(B, T, 0, 0, 0.08 * R * cs, C.line, 0.22, 8);
  }
  // an arching sprig with bells that hang (and swing) under gravity
  bell(B, cx, cy, R, rot, e, a, tl) {
    const T = this.tf(cx, cy, R, rot * 0.25, tl), C = this.cc, side = e.ph1 > Math.PI ? 1 : -1, lw = Math.max(0.8, R * 0.08);
    const arch = u => [side * u * 0.95 * R, (-0.38 * Math.sin(Math.PI * u * 0.85) + 0.18 * u) * R];
    const A = []; for (let i = 0; i <= 20; i++) A.push(T(...arch(i / 20)));
    const fr = this.eo(a / 520); if (fr <= 0) return;
    this.strokeRange(B, A, 0, fr, C.blue, lw);
    for (let k = 0; k < 3; k++) {
      const u = 0.3 + 0.3 * k; if (fr < u) continue;
      const s = Math.min(1.1, this.spr((a - 220 - k * 150) / 1000, 6, 11)) * (1 - 0.16 * k); if (s <= 0.001) continue;
      const [ax, ay] = arch(u), sw = Math.sin(a / 700 + k * 1.7 + e.ph2) * 0.08 + (this.wind || 0) * 0.12, cw = Math.cos(sw), sn = Math.sin(sw);
      const L = 0.58 * s, wt = 0.15 * s, wb = 0.27 * s, y0 = 0.14 * s;
      const loc = (x, y) => T((ax + (x * cw - y * sn)) , (ay + (x * sn + y * cw)));
      B.stroke([loc(0, 0), loc(0, y0 * R)], C.blue, lw * 0.8);
      const shape = [[0, y0 - 0.03 * s], [wt, y0], [wt * 1.15, y0 + L * 0.45], [wb * 0.95, y0 + L * 0.85], [wb * 1.35, y0 + L * 1.05], [wb * 0.55, y0 + L * 0.93], [0, y0 + L * 1.04], [-wb * 0.55, y0 + L * 0.93], [-wb * 1.35, y0 + L * 1.05], [-wb * 0.95, y0 + L * 0.85], [-wt * 1.15, y0 + L * 0.45], [-wt, y0]];
      B.fill(shape.map(([x, y]) => loc(x * R, y * R)), C.red);
      if (R >= 14 && s > 0.5) B.stroke([loc(0, (y0 + L * 0.15) * R), loc(0.02 * R, (y0 + L * 0.85) * R)], C.line, lw * 0.5);
    }
  }

  // ---------- render (shared by typing view + poster) ----------
  frame() {
    const now = performance.now(), dt = Math.min(64, now - (this.lt || now)); this.lt = now;
    if (this.state.mode === 'poster') {
      if (!this.state.busy) this.posterDraw(this.pcv.getContext('2d'), now - (this.pt0 || 0));
      return;
    }
    const k = 1 - Math.exp(-dt / 80);
    this.Sd += (this.St - this.Sd) * k;
    this.cx += (this.ctx_ - this.cx) * k; this.cy += (this.cty - this.cy) * k;
    for (const l of this.letters) if (!l.dead && l.tx != null) { l.x += (l.tx - l.x) * k; l.y += (l.ty - l.y) * k; }
    this.letters = this.letters.filter(l => !(l.dead && now - l.dead > 300));
    // wind: a slow breeze plus whatever the cursor stirs up
    this.seasonTick(dt); this.weatherTick(dt, now);
    if (this._tk !== this._pk) { this._tk = this._pk; this.theme(); }
    if (this.tuneOpen && this._pvK !== this._pk && now - (this._pvT || 0) > 1500) { this._pvT = now; this._pvK = this._pk; this.drawPreviews(); }
    const wx = this.wx, br = this.cfg.breeze, amb = br * (1 + 0.7 * Math.min(1.5, wx.rain) + 0.35 * wx.leaves - 0.3 * Math.min(1, wx.snow)) * (Math.sin(now / 2300) * 0.22 + Math.sin(now / 870 + 1) * 0.08 + 0.06);
    this.gust *= Math.exp(-dt / 650);
    this.wind += (amb + this.gust - this.wind) * (1 - Math.exp(-dt / 160));
    // butterflies drop by on their own while you think (fewer in autumn, none in winter or bad weather)
    if (this.cfg.visitors && now - this.lastKey > 4000 && this.perch.length > 1 && this.flies.filter(f => f.st !== 'leave').length < 2 && Math.random() < dt / 7000 * this.flyMul) {
      const p = this.perch[Math.floor(Math.random() * this.perch.length)];
      this.spawnFly(p.x, p.y); this.flies[this.flies.length - 1].auto = true;
    }
    this.$('hints').classList.toggle('quiet', this.letters.length > 0);
    this.paint(now, true, dt);
  }
  // ---------- seasons ----------
  rgbOf(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
  hexOf(r) { return '#' + r.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join(''); }
  lum(c) { const [r, g, b] = this.rgbOf(c); return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; }
  toHsl(c) {
    const [r, g, b] = this.rgbOf(c).map(v => v / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
    let h = 0, s = 0;
    if (d) { s = d / (1 - Math.abs(2 * l - 1)); h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) h += 360; }
    return [h, s, l];
  }
  fromHsl(h, s, l) {
    const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
    let v;
    if (h < 60) v = [c, x, 0]; else if (h < 120) v = [x, c, 0]; else if (h < 180) v = [0, c, x]; else if (h < 240) v = [0, x, c]; else if (h < 300) v = [x, 0, c]; else v = [c, 0, x];
    return this.hexOf(v.map(n => (n + m) * 255));
  }
  mixHex(a, b, t) { const A = this.rgbOf(a), B = this.rgbOf(b); return this.hexOf(A.map((v, i) => v + (B[i] - v) * t)); }
  // nudge one palette colour toward a season; am (0..1) scales the whole effect
  grade(col, role, season, am, mono) {
    const g = this.GRADE[season][role];
    if (!g || am <= 0 || (mono && role !== 'bg')) return col;
    const [, sat, l] = this.toHsl(col);
    let amt = g[1] * am, ts, tl;
    if (role === 'bg') {
      if (mono) return col;
      ts = 0.5; tl = l;
      if (l < 0.2) { tl = 0.09; amt = Math.min(0.85, amt * 1.9); }
      else if (l < 0.8) { ts = Math.max(0.3, sat); amt *= 1 - sat * 0.6; }
    } else { ts = Math.max(sat, 0.55); tl = Math.min(0.92, Math.max(0.08, l + g[3])); }
    let out = this.mixHex(col, this.fromHsl(g[0], ts, tl), amt);
    if (g[2] !== 1) { const [h2, s2, l2] = this.toHsl(out); out = this.fromHsl(h2, Math.min(1, s2 * (1 + (g[2] - 1) * am)), l2); }
    return out;
  }
  // where the year is: season a blending into season b, with each season holding for a while before it turns
  sMix() {
    const p = this.sp, fl = Math.floor(p), x = Math.min(1, Math.max(0, (p - fl - 0.55) / 0.45));
    return { a: ((fl % 4) + 4) % 4, b: (((fl + 1) % 4) + 4) % 4, t: x * x * (3 - 2 * x) };
  }
  pal() {
    const idx = this.state.palette, m = this.sMix(), q = Math.round(m.t * 24), qa = Math.round((this.sAmt || 0) * 20);
    const key = idx + '|' + (qa ? m.a + ',' + m.b + ',' + q + ',' + qa : 0);
    if (this._pk === key) return this._pv;
    const p = this.PAL[idx] || this.PAL[0];
    let bg = p[1], red = p[2], blue = p[3], line = p[4];
    if (qa) {
      const am = qa / 20, mono = this.toHsl(p[2])[1] < 0.12, t = q / 24;
      const one = s => ({ bg: this.grade(p[1], 'bg', this.SEAS[s], am, mono), red: this.grade(p[2], 'red', this.SEAS[s], am, mono), blue: this.grade(p[3], 'blue', this.SEAS[s], am, mono), line: this.grade(p[4], 'line', this.SEAS[s], am, mono) });
      let o = one(m.a);
      if (t > 0 && m.b !== m.a) { const n = one(m.b); o = { bg: this.mixHex(o.bg, n.bg, t), red: this.mixHex(o.red, n.red, t), blue: this.mixHex(o.blue, n.blue, t), line: this.mixHex(o.line, n.line, t) }; }
      bg = o.bg; red = o.red; blue = o.blue; line = o.line;
    }
    this._pk = key;
    return (this._pv = { bg, C: { red, blue, line, text: p[5], vein: bg } });
  }
  theme() {
    const pc = this.pal(), $ = this.$;
    $('app').style.background = pc.bg; $('bar').style.color = pc.C.text;
    const dot = $('bpal').querySelector('.dot'); if (dot) dot.style.background = pc.C.red;
  }
  setSeason(id) {
    const prev = this.cfg.season; this.cfg.season = id; this.save(); this.syncTune();
    if (id === 'cycle' && prev !== 'cycle') this.sp = Math.max(0, this.sp);
    if (id !== 'off' && id !== 'cycle' && prev !== id) this.letters.forEach(l => { if (!l.dead) this.shed(l, 0.25); });
    this.toast(id === 'off' ? 'Seasons off' : id === 'cycle' ? 'The year turns slowly' : id[0].toUpperCase() + id.slice(1));
    setTimeout(() => this.drawPreviews(), 1400);
  }
  seasonTick(dt) {
    const c = this.cfg.season, on = c !== 'off' ? 1 : 0;
    this.sAmt += (on - this.sAmt) * (1 - Math.exp(-dt / 900));
    if (Math.abs(on - this.sAmt) < 0.003) this.sAmt = on;
    if (c === 'cycle') this.sp = (this.sp + dt / (Math.max(5, this.cfg.seasonLen) * 1000)) % 4;
    else if (on) {
      const tg = this.SEAS.indexOf(c); let d = (((tg - this.sp) % 4) + 4) % 4; if (d > 2) d -= 4;
      if (Math.abs(d) < 0.004) this.sp = tg; else this.sp = (((this.sp + d * (1 - Math.exp(-dt / 650))) % 4) + 4) % 4;
    }
  }
  // a number that depends on the season, e.g. how many butterflies are about (1 when seasons are off)
  seasonMul(arr) { const m = this.sMix(), v = arr[m.a] * (1 - m.t) + arr[m.b] * m.t; return 1 + (v - 1) * this.sAmt; }

  // ---------- weather ----------
  wxTarget() {
    const w = this.cfg.weather, amt = this.cfg.wxAmt, T = { rain: 0, snow: 0, leaves: 0 };
    if (w === 'auto') { const m = this.sMix(), A = this.AUTO[m.a], B = this.AUTO[m.b]; for (const k in T) T[k] = (A[k] * (1 - m.t) + B[k] * m.t) * this.sAmt * amt; }
    else if (w === 'rain') T.rain = amt; else if (w === 'storm') T.rain = amt * 1.4; else if (w === 'snow') T.snow = amt; else if (w === 'leaves') T.leaves = amt;
    return T;
  }
  weatherTick(dt, now) {
    const T = this.wxTarget(), wx = this.wx, k = 1 - Math.exp(-dt / 1800);
    for (const n in wx) { wx[n] += (T[n] - wx[n]) * k; if (Math.abs(T[n] - wx[n]) < 0.002) wx[n] = T[n]; }
    // weather stirs the wind; a storm gusts hard
    const storm = this.cfg.weather === 'storm' ? 2.2 : 1;
    if (wx.rain > 0.25 && Math.random() < dt / 5500 * Math.min(1.6, wx.rain) * storm) this.gust = Math.max(-1.6, Math.min(1.6, this.gust + (Math.random() - 0.5) * 1.1 * Math.sqrt(storm)));
    if (wx.leaves > 0.2 && Math.random() < dt / 5000 * wx.leaves) this.gust = Math.max(-1.6, Math.min(1.6, this.gust + (Math.random() - 0.35) * 0.9));
    // pollen and butterflies sit out the rain, the snow and the winter
    const calm = Math.max(0, 1 - Math.min(1, wx.rain * 1.3 + wx.snow * 2));
    this.polMul = this.seasonMul([1.3, 1, 0.45, 0]) * calm;
    this.flyMul = this.seasonMul([1.2, 1.8, 0.5, 0]) * calm;
    this.ambience(now);
  }
  ambience() {
    const ac = this.ac; if (!ac) return;
    try {
      if (!this._amb) {
        const n = ac.sampleRate * 2, buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
        for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
        const mk = (type, f, Q) => { const s = ac.createBufferSource(), fl = ac.createBiquadFilter(), gn = ac.createGain(); s.buffer = buf; s.loop = true; fl.type = type; fl.frequency.value = f; fl.Q.value = Q; gn.gain.value = 0; s.connect(fl); fl.connect(gn); gn.connect(ac.destination); s.start(); return gn; };
        this._amb = { rain: mk('bandpass', 1700, 0.45), air: mk('lowpass', 520, 0.7) };
      }
      const on = this.cfg.sound, wx = this.wx, t = ac.currentTime;
      this._amb.rain.gain.setTargetAtTime(on ? Math.min(0.075, wx.rain * 0.045) : 0, t, 0.4);
      this._amb.air.gain.setTargetAtTime(on ? Math.min(0.05, (wx.snow * 0.018 + wx.leaves * 0.02 + wx.rain * 0.012) * (0.6 + Math.abs(this.wind))) : 0, t, 0.5);
    } catch (e) {}
  }
  weatherBack(g) {
    const wx = this.wx, W = this.W, H = this.H, dark = this.lum(this.pal().bg) < 0.5;
    if (wx.rain > 0.02) { g.fillStyle = dark ? `rgba(90,120,170,${Math.min(0.14, wx.rain * 0.09).toFixed(3)})` : `rgba(60,80,110,${Math.min(0.16, wx.rain * 0.1).toFixed(3)})`; g.fillRect(0, 0, W, H); }
    if (wx.snow > 0.02) {
      const a = Math.min(0.12, wx.snow * 0.08).toFixed(3), gr = g.createLinearGradient(0, H, 0, H * 0.5);
      gr.addColorStop(0, dark ? `rgba(220,235,255,${a})` : `rgba(120,150,190,${a})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(0, H * 0.5, W, H * 0.5);
    }
  }
  weatherFront(g, now, dt) {
    const wx = this.wx, W = this.W, H = this.H, bg = this.pal().bg, dark = this.lum(bg) < 0.5;
    const area = Math.min(2.2, Math.max(0.5, Math.pow(W * H / 1024000, 0.6))), sc = Math.max(0.7, Math.min(1.8, (this.Sd || 140) / 200));
    // rain: slanted streaks that follow the wind, rings where they land, little splashes on the blooms
    if (wx.rain > 0.01 || this.drops.length) {
      this._racc += Math.min(2, wx.rain) * 220 * area / 650 * dt;
      let n = Math.min(40, Math.floor(this._racc)); this._racc -= Math.floor(this._racc);
      if (wx.rain <= 0.01) n = 0;
      while (n-- > 0) this.drops.push({ x: -0.15 * W + Math.random() * 1.3 * W, y: -30 - Math.random() * 40, vy: 0.95 + Math.random() * 0.55, z: 0.35 + Math.random() * 0.65, len: 9 + Math.random() * 14, gy: H * (0.86 + Math.random() * 0.13) });
      const sl = this.wind * 0.28 + 0.06, near = [], far = [];
      this.drops = this.drops.filter(p => {
        p.y += p.vy * dt; p.x += sl * p.vy * dt;
        if (p.y >= p.gy) { if ((p.z > 0.55 || Math.random() < 0.3) && this.splashes.length < 80) { this.splashes.push({ x: p.x, y: p.gy, t0: now, sm: 1 }); this.plink(); } return false; }
        (p.z > 0.7 ? near : far).push(p); return p.x > -80 && p.x < W + 80;
      });
      g.lineCap = 'round';
      for (const [arr, al, lw] of [[far, 0.26, 0.9], [near, 0.55, 1.3]]) {
        if (!arr.length) continue;
        g.strokeStyle = dark ? `rgba(200,222,255,${al})` : `rgba(60,90,140,${al})`; g.lineWidth = lw * Math.sqrt(sc);
        g.beginPath(); for (const p of arr) { g.moveTo(p.x - sl * p.len, p.y - p.len); g.lineTo(p.x, p.y); } g.stroke();
      }
      if (wx.rain > 0.05 && this.perch.length && Math.random() < wx.rain * this.perch.length * 0.18 * dt / 1000) {
        const p = this.perch[Math.floor(Math.random() * this.perch.length)];
        this.splashes.push({ x: p.x + (Math.random() - 0.5) * p.R * 1.1, y: p.y - p.R * (0.2 + Math.random() * 0.5), t0: now, sm: 0.55 }); this.plink();
      }
      g.lineWidth = 1; g.strokeStyle = dark ? 'rgb(200,222,255)' : 'rgb(60,90,140)';
      this.splashes = this.splashes.filter(s => {
        const a = (now - s.t0) / 520; if (a >= 1) return false;
        const rx = (3 + 15 * a) * s.sm * Math.sqrt(sc); g.globalAlpha = (1 - a) * 0.45;
        g.beginPath(); g.ellipse(s.x, s.y, rx, rx * 0.32, 0, 0, Math.PI * 2); g.stroke(); return true;
      });
      g.globalAlpha = 1;
    }
    // snow: flakes at different depths, a drift that builds along the bottom, caps on the flowers
    const snowCol = dark ? '#F2F7FF' : '#C3D3E6', cols = Math.ceil(W / 10) + 1, cw = W / (cols - 1);
    if (!this.drift || this.drift.length !== cols) this.drift = new Float32Array(cols);
    if (wx.snow > 0.01 || this.flakes.length) {
      const N = Math.max(wx.snow, this.wxTarget().snow) * 170 * area, hmax = H * 0.045 * (0.6 + 0.4 * this.cfg.wxAmt);
      const mk = prime => this.flakes.push({ x: -0.1 * W + Math.random() * 1.2 * W, y: prime ? Math.random() * H : -10, z: Math.random(), ph: Math.random() * 6.28 });
      if (N > 6 && !this._primed) { this._primed = true; for (let i = 0; i < N * 0.55; i++) mk(true); }
      if (N < 1 && !this.flakes.length) this._primed = false;
      if (N > 1) { this._sacc += N / 11000 * dt; let n = Math.min(8, Math.floor(this._sacc)); this._sacc -= Math.floor(this._sacc); while (n-- > 0) mk(false); }
      const hi = [], lo = [], D = this.drift;
      this.flakes = this.flakes.filter(f => {
        const k = 0.4 + f.z, r = (0.9 + f.z * 2.4) * Math.sqrt(sc);
        f.y += (0.028 + f.z * 0.075) * dt; f.x += (this.wind * 0.16 * k + Math.sin(now * 0.0011 + f.ph) * 0.018 * k) * dt;
        const i = Math.max(0, Math.min(cols - 1, Math.round(f.x / cw)));
        if (f.y + r * 0.5 >= H - D[i]) {
          if (wx.snow > 0.05) for (let j = -2; j <= 2; j++) { const c = i + j; if (c >= 0 && c < cols) D[c] = Math.min(hmax, D[c] + 3.4 * [0.1, 0.2, 0.4, 0.2, 0.1][j + 2]); }
          return false;
        }
        (f.z > 0.5 ? hi : lo).push([f.x, f.y, r]); return f.x > -40 && f.x < W + 40;
      });
      g.fillStyle = snowCol;
      for (const [arr, al] of [[lo, 0.55], [hi, 0.92]]) { if (!arr.length) continue; g.globalAlpha = al; g.beginPath(); for (const [x, y, r] of arr) { g.moveTo(x + r, y); g.arc(x, y, r, 0, 6.2832); } g.fill(); }
      g.globalAlpha = 1;
    }
    // the drift settles, melts when the snow stops, and gets blown clear by Enter
    {
      const D = this.drift; let mx = 0;
      if (dt > 0) {
        for (let i = 1; i < cols - 1; i++) { const a = (D[i - 1] + D[i + 1]) / 2; D[i] += (a - D[i]) * 0.02; }
        const decay = this._blow > 0 ? Math.exp(-dt / 600) : wx.snow < 0.15 ? Math.exp(-dt / (wx.rain > 0.2 ? 6000 : 25000)) : 1;
        for (let i = 0; i < cols; i++) { D[i] *= decay; if (D[i] < 0.02) D[i] = 0; }
        if (this._blow > 0) this._blow -= dt;
        this.cap += ((wx.snow > 0.25 ? 1 : 0) - this.cap) * (1 - Math.exp(-dt / (wx.snow > 0.25 ? 9000 : 5000)));
      }
      for (let i = 0; i < cols; i++) mx = Math.max(mx, D[i]);
      if (mx > 0.4) {
        g.fillStyle = snowCol; g.globalAlpha = 0.96; g.beginPath(); g.moveTo(0, H);
        for (let i = 0; i < cols; i++) g.lineTo(i * cw, H - D[i]);
        g.lineTo(W, H); g.closePath(); g.fill(); g.globalAlpha = 1;
      }
      if (this.cap > 0.04) {
        g.fillStyle = snowCol; g.globalAlpha = Math.min(0.95, this.cap * 1.2);
        for (const p of this.perch) { if (p.R < 6) continue; g.beginPath(); g.ellipse(p.x, p.y - p.R * 0.72, p.R * 0.72 * this.cap, p.R * 0.26 * this.cap, 0, 0, Math.PI * 2); g.fill(); }
        g.globalAlpha = 1;
      }
    }
    // leaves: tumbling and swaying on the wind
    if (wx.leaves > 0.01 || this.leafs.length) {
      if (wx.leaves > 0.01 && this.leafs.length < 110) {
        this._lacc += wx.leaves * 3 * area * dt / 1000; let n = Math.min(3, Math.floor(this._lacc)); this._lacc -= Math.floor(this._lacc);
        while (n-- > 0) this.leafs.push({ x: -0.15 * W + Math.random() * 1.3 * W, y: -20, vx: 0, vy: 0.04 + Math.random() * 0.05, s: (this.Sd || 140) * (0.04 + Math.random() * 0.035), rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.006, fl: Math.random() * 6.28, fs: 0.004 + Math.random() * 0.006, sw: Math.random() * 6.28, t0: now, col: this.LEAFCOL[Math.floor(Math.random() * this.LEAFCOL.length)] });
      }
      this.leafs = this.leafs.filter(p => {
        const age = now - p.t0;
        p.vy += (0.07 - p.vy) * 0.0025 * dt; p.vx += (this.wind * 0.3 + Math.sin(age * 0.0018 + p.sw) * 0.06 - p.vx) * 0.003 * dt;
        p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt + p.vx * 0.012; p.fl += p.fs * dt;
        if (p.y > H + 30 || p.x < -80 || p.x > W + 80) return false;
        const f = Math.cos(p.fl), L = p.s, Wd = L * 0.55 * (0.2 + 0.8 * Math.abs(f));
        g.save(); g.translate(p.x, p.y); g.rotate(p.rot);
        g.fillStyle = p.col; g.beginPath(); g.moveTo(-L, 0); g.quadraticCurveTo(0, -Wd * 1.6, L, 0); g.quadraticCurveTo(0, Wd * 1.6, -L, 0); g.fill();
        g.strokeStyle = 'rgba(0,0,0,0.28)'; g.lineWidth = Math.max(0.6, L * 0.07); g.beginPath(); g.moveTo(-L, 0); g.lineTo(L * 0.8, 0); g.stroke();
        g.restore(); return true;
      });
    }
  }
  plink() {
    if (!this.cfg.sound || !this.ac || Math.random() > 0.1) return;
    const t = performance.now(); if (t - (this._pt || 0) < 140) return; this._pt = t;
    try { this.tone(1100 + Math.random() * 1700, this.ac.currentTime, 0.28, 0.01); } catch (e) {}
  }
  mainState() {
    const w = this.wind;
    return { letters: this.letters, S: this.Sd, C: this.pal().C, boil: this.cfg.boil, recoil: this.cfg.recoil, speed: this.cfg.speed, wither: 260, face: true, wind: w, rotw: e => w * (e.t === 'leaf' ? 0.25 : 0.12) };
  }
  paint(now, caret, dt = 16) {
    const g = this.g, d = this.dpr;
    g.setTransform(d, 0, 0, d, 0, 0); g.fillStyle = this.pal().bg; g.fillRect(0, 0, this.W, this.H);
    this.weatherBack(g);
    const B = this.backend(g), st = this.mainState();
    this.render(B, now, st);
    if (this.gifts.length) {
      const LIFE = 60000; this.gifts = this.gifts.filter(gf => now - gf.t0 < LIFE);
      for (const gf of this.gifts) {
        const age = now - gf.t0, w = 1 - this.eo((age - (LIFE - 2200)) / 2200);
        g.globalAlpha = Math.max(0, w);
        const x = gf.x * this.W + this.wind * this.Sd * 0.03, y = gf.y * this.H + (1 - w) * this.Sd * 0.3, R = this.Sd * 0.24 * (0.65 + 0.35 * w);
        this.flower(B, x, y, R, gf.rot + (1 - w) * 0.6 + this.wind * 0.1, gf.e, age, null);
        if (age > 700) this.perch.push({ id: 'g' + gf.t0, x, y, R });
      }
      g.globalAlpha = 1;
    }
    this.stepAir(g, now, dt, st.C);
    this.drawFlies(B, now, st.C);
    this.weatherFront(g, now, dt);
    if (caret) {
      const S = this.Sd, on = now - this.lastKey < 500 || Math.floor(now / 530) % 2 === 0, hf = this.eo((now - this.t0) / 600);
      if (on && hf > 0) { const h = 0.8 * S * hf, w = Math.max(2, S * 0.03); B.rect(this.cx - w / 2, this.cy - h / 2, w, h, st.C.text); }
    }
  }
  render(B, now, st) {
    const S = st.S, L = st.letters, act = L.filter(l => !l.dead), sp = st.speed || 1;
    this.cc = st.C; this._now = now; if (st.face) this.perch = [];
    if (st.face) for (const l of L) {
      let tx = 0, ty = 0;
      const A = !l.dead && l.ch !== ' ' ? this.near(l.x, l.y - S * 0.6) : null;
      if (A) {
        const dx = A[0] - l.x, dy = A[1] - (l.y - S * 0.6), d = Math.hypot(dx, dy), reach = Math.max(260, S * 3.2);
        if (d < reach && d > 1) { const w = 1 - d / reach, s = w * w * (3 - 2 * w); tx = dx / d * s; ty = dy / d * s; }
      }
      const c = l.lean || (l.lean = [0, 0]);
      c[0] += (tx - c[0]) * 0.07; c[1] += (ty - c[1]) * 0.07;
    }
    const f = st.boil ? Math.floor(now / 120) : 0, amp = st.boil ? Math.max(0.8, S * 0.01) : 0;
    const kd = l => l.dead ? 1 - this.eo((now - l.dead) / st.wither) : 1;
    const draw = layer => {
      for (const l of L) {
        if (l.ch === ' ' || !l.els) continue;
        const age = (now - l.birth) * sp, kk = kd(l);
        const each = e => { if (e.t === 'stem') this.drawStem(B, e, l, age, kk, st, f, amp, layer); else if (e.layer === layer) this.drawEl(B, e, l, age, kk, st, f, amp); };
        l.els.forEach(each);
        if (l.endEls) l.endEls.forEach(each);
        const i = act.indexOf(l), nx = i >= 0 ? act[i + 1] : null;
        if (l.tend && (l.dead || !nx || nx.ch === ' ')) {
          let fr = this.eo(((now - l.tb) * sp - 150) / 450);
          if (l.cut != null) fr *= 1 - this.eo((now - l.cut) * sp / 150) * Math.min(0.85, st.recoil / (0.6 * S));
          for (const e of l.tend) this.drawStem(B, e, l, age, kk, st, f, amp, layer, fr * kk);
        }
      }
    };
    draw(0);
    for (const l of L) if (l.ch !== ' ' && (st.textAll || !l.dead || now < l.dead)) B.text(l.ch, l.x, l.y, S, st.C.text);
    draw(1);
  }
  wpt(st, l, x, y) {
    if (l.birth != null && this._now != null) {
      const t = (this._now - l.birth) * (st.speed || 1) / 1000;
      if (t > 0 && t < 2.5) {
        const hh = Math.max(0, (l.y - y) / st.S), dmp = Math.exp(-t * 3.2), dir = (l.id % 2 ? 1 : -1);
        x += st.S * 0.07 * hh * dmp * Math.sin(t * 11) * dir;
        y += st.S * 0.035 * hh * dmp * Math.sin(t * 11 + 1.2);
      }
    }
    if (st.face && l.lean) {
      const hh = Math.min(2.5, Math.max(0, (l.y - y) / st.S)), f = hh * hh * 0.5 + hh * 0.5;
      x += l.lean[0] * st.S * 0.1 * f;
      y += l.lean[1] * st.S * 0.05 * f;
    }
    if (st.wind) {
      const hh = Math.min(2.5, Math.max(0, (l.y - y) / st.S)), f = hh * hh * 0.5 + hh * 0.5;
      x += st.wind * st.S * 0.05 * f;
      y += Math.abs(st.wind) * st.S * 0.012 * hh * hh;
    }
    return st.warp ? st.warp(x, y, l) : [x, y];
  }
  drawStem(B, e, l, age, kk, st, f, amp, layer, frO) {
    const S = st.S, fr = frO != null ? frO : this.eo((age - e.d0) / e.dur) * kk; if (fr <= 0) return;
    const j = this.jit(e.id, f, amp);
    const P = e.pts.map(p => this.wpt(st, l, l.x + p[0] * S + j[0], l.y + p[1] * S + j[1]));
    for (const sg of e.segs) {
      if (sg.layer !== layer) continue;
      const b = Math.min(sg.u1, fr); if (b <= sg.u0) continue;
      this.strokeRange(B, P, sg.u0, b, st.C.blue, S * 0.022 * (e.w || 1));
    }
    for (const th of e.thorns) if (fr > th.u && this.layerAt(e.segs, th.u) === layer) this.thorn(B, P, th.u, th.s, S);
  }
  drawEl(B, e, l, age, kk, st, f, amp) {
    const S = st.S, j = this.jit(e.id, f, amp), wx = (x, y) => this.wpt(st, l, l.x + x * S + j[0], l.y + y * S + j[1]);
    const rw = st.rotw ? st.rotw(e) : 0;
    if (e.t === 'leaf') {
      const sc = this.spr((age - e.d0) / 1000, 7, 15) * kk; if (sc <= 0) return;
      const p = wx(e.x, e.y); e._x = p[0]; e._y = p[1]; e._R = e.L * S * sc;
      this.leaf(B, p[0], p[1], e.a + j[2] + rw, e.L * S * sc, e.bend);
    } else if (e.t === 'rose') {
      const a = age - e.d0; if (a < 0) return;
      if (kk <= 0.001) return;
      const p = wx(e.x, e.y), tl = st.face ? this.faceTurn(e, p[0], p[1]) : null;
      e._x = p[0]; e._y = p[1]; e._R = e.R * S * kk;
      if ((st.face || st.perchOn) && !l.dead && a > 700) this.perch.push({ id: e.id, x: p[0], y: p[1], R: e.R * S * kk });
      this.flower(B, p[0], p[1], e.R * S * kk, e.rot + j[2] + rw + (tl ? tl[0] * 0.22 : 0), e, a, tl);
    }
  }

  // ---------- poster ----------
  preset() { return this.PRESETS.find(p => p.id === this.state.preset) || this.PRESETS[0]; }
  buildPoster() {
    if (!this.g) return;
    const s = this.state, pr = this.preset(), text = (s.text || '').slice(0, 40) || ' ';
    this.rand = this.rng(s.seed * 7919 + 1);
    const L = []; let prev = null, uid = 1;
    for (const ch of text) {
      if (ch === ' ') { const sp = { ch: ' ', id: 9000 + uid++, els: [] }; L.push(sp); prev = sp; continue; }
      const same = prev && prev.ch !== ' ';
      const l = { ch, id: 9000 + uid++, ws: same ? prev.ws : Math.floor(this.rand() * 1e9), wi: same ? prev.wi + 1 : 0, prev: same ? prev : null };
      this.gen(l); L.push(l); prev = l;
    }
    const n = L.length;
    const step = pr.id === 'grow' ? Math.min(110, 3000 / n) : pr.id === 'typed' ? Math.min(85, 3600 / n) : 0;
    const off = pr.id === 'grow' ? 200 : pr.id === 'typed' ? 300 : 0;
    L.forEach((l, i) => { l.b = off + i * step; });
    if (pr.id === 'scatter') { const r = this.rng(s.seed * 31 + 5); L.forEach(l => { l.b = 150 + r() * 2400; }); }
    const wd = Math.min(60, 900 / n);
    L.forEach((l, i) => {
      l.d = pr.id === 'scatter' ? 4700 + i * 8 : 4200 + (n - 1 - i) * wd;
      const nx = L[i + 1];
      l.cutRel = null;
      if (pr.id !== 'scatter' && l.ch !== ' ' && nx && nx.ch === ' ') { l.cutRel = Math.max(30, nx.b - l.b); this.genEnd(l, l.cutRel); }
    });
    this.rand = Math.random;
    const res = this.layoutCore(L, 1080, 1080, false);
    let S = res.S, x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    const addP = (l, x, y, r) => { const X = l.tx + x * S, Y = l.ty + y * S, R = (r || 0) * S; x0 = Math.min(x0, X - R); x1 = Math.max(x1, X + R); y0 = Math.min(y0, Y - R); y1 = Math.max(y1, Y + R); };
    for (const l of L) {
      if (l.ch === ' ') continue;
      addP(l, -l.tw / S / 2, -0.75); addP(l, l.tw / S / 2, 0.1);
      const all = [...l.els, ...(l.endEls || [])];
      for (const e of all) {
        if (e.t === 'stem') e.pts.forEach(q => addP(l, q[0], q[1], 0.02));
        else if (e.t === 'leaf') addP(l, e.x, e.y, e.L);
        else addP(l, e.x, e.y, e.R * (e.sp === 'bell' ? 1.5 : 1.15));
      }
    }
    let tx0 = 1e9, tx1 = -1e9, ty0 = 1e9, ty1 = -1e9;
    for (const l of L) if (l.ch !== ' ') { tx0 = Math.min(tx0, l.tx - l.tw / 2); tx1 = Math.max(tx1, l.tx + l.tw / 2); ty0 = Math.min(ty0, l.ty - 0.72 * S); ty1 = Math.max(ty1, l.ty); }
    const Z = 1080, half = Z * 0.44, bcx = (tx0 + tx1) / 2, bcy = (ty0 + ty1) / 2;
    const k = Math.min(1.25, half / Math.max(1, bcx - x0, x1 - bcx), half / Math.max(1, bcy - y0, y1 - bcy));
    L.forEach(l => { l.tx = Z / 2 + (l.tx - bcx) * k; l.ty = Z / 2 + (l.ty - bcy) * k; l.tw *= k; l.x = l.tx; l.y = l.ty; });
    this.P = { letters: L, S: S * k, T: pr.T, preset: pr.id };
    this.pt0 = performance.now();
  }
  posterFly(B, tt, P, C) {
    const ps = this.perch.slice().sort((a, b) => a.x - b.x);
    if (!ps.length) return;
    const p1 = ps[Math.floor(ps.length * 0.25)], p2 = ps[Math.min(ps.length - 1, Math.floor(ps.length * 0.75))];
    const A = [-80, 300], s1 = [p1.x, p1.y - p1.R * 0.55], s2 = [p2.x, p2.y - p2.R * 0.55], E = [1160, 260];
    const sz = Math.max(12, P.S * 0.09), t = tt / 1000, eo = v => this.eo(Math.max(0, Math.min(1, v)));
    const leg = (a, b, u, lift) => { const e = eo(u); return [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e - Math.sin(e * Math.PI) * lift]; };
    let p, flying = true, vx = 0;
    if (t < 1.8) { p = leg(A, s1, t / 1.8, 160); vx = 1; }
    else if (t < 3.4) { p = s1; flying = false; }
    else if (t < 4.6) { p = leg(s1, s2, (t - 3.4) / 1.2, 140); vx = s2[0] > s1[0] ? 1 : -1; }
    else if (t < 5.8) { p = s2; flying = false; }
    else { p = leg(s2, E, (t - 5.8) / 1.2, 60); vx = 1; }
    let o, ang;
    if (flying) { o = Math.abs(Math.cos(t * 17)); p = [p[0] + Math.sin(t * 7) * 6, p[1] + Math.sin(t * 13) * 4]; ang = vx * 0.3; }
    else { const burst = (t > 2.4 && t < 2.8) || (t > 5 && t < 5.3); o = burst ? 0.2 + 0.8 * Math.abs(Math.cos(t * 9)) : 0.3 + 0.1 * Math.sin(t * 3); ang = 0; }
    this.butterfly(B, p[0], p[1], sz, ang, o, C);
  }
  posterDraw(g, t) {
    const P = this.P; if (!P) return;
    const Z = 1080, pc = this.pal();
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = pc.bg; g.fillRect(0, 0, Z, Z);
    const tt = ((t % P.T) + P.T) % P.T, L = P.letters, B = this.backend(g);
    const st = { letters: L, S: P.S, C: pc.C, boil: this.cfg.boil, recoil: this.cfg.recoil, speed: 1, wither: 600, textAll: true };
    L.forEach(l => { l.x = l.tx; l.y = l.ty; l.dead = null; });
    const set = base => L.forEach(l => { l.birth = base + l.b; l.tb = l.birth; l.cut = l.cutRel != null ? l.birth + l.cutRel : null; });
    if (P.preset === 'breathe') {
      set(-1e5);
      const ph = tt / P.T * Math.PI * 2, S = P.S;
      st.warp = (x, y, l) => { const h = Math.max(0, (l.y - y) / S); return [x + Math.sin(ph + l.x * 0.004 + h * 1.1) * S * 0.03 * h, y + Math.cos(ph + x * 0.003) * S * 0.008 * h]; };
      st.rotw = e => Math.sin(ph + e.id * 0.7) * 0.12;
    } else if (P.preset === 'grow' || P.preset === 'scatter') {
      set(0);
      L.forEach(l => { if (tt >= l.d) l.dead = l.d; });
    } else if (P.preset === 'wind') {
      set(-1e5);
      const S = P.S, u = tt / P.T, front = -0.35 + u * 1.9;
      st.warp = (x, y, l) => {
        const hh = Math.max(0, (l.y - y) / S), d = l.x / 1080 - front;
        const g = d < 0 ? Math.exp(d * 2.2) * Math.cos(-d * 9) : Math.exp(-d * d * 30);
        const idle = Math.sin(tt / 1000 * 1.6 + l.x * 0.01) * 0.012;
        return [x + (g * 0.13 + idle) * S * hh * hh * 0.6 + (g * 0.13 + idle) * S * hh * 0.4, y + Math.abs(g) * 0.02 * S * hh];
      };
      st.rotw = e => { const d = e.x / 1080 - front; return (d < 0 ? Math.exp(d * 2.2) * Math.cos(-d * 9) : Math.exp(-d * d * 30)) * 0.35; };
    } else if (P.preset === 'reach') {
      set(-1e5);
      const S = P.S, ph = tt / P.T * Math.PI * 2, lx = 540 + Math.sin(ph) * 430, ly = 540 + Math.sin(ph * 2) * 260;
      this._light = [lx, ly];
      st.warp = (x, y, l) => {
        const dx = lx - l.x, dy = ly - (l.y - S * 0.6), d = Math.hypot(dx, dy) || 1, w = Math.max(0, 1 - d / 560), s = w * w * (3 - 2 * w);
        const hh = Math.min(2.5, Math.max(0, (l.y - y) / S)), f = hh * hh * 0.5 + hh * 0.5;
        return [x + dx / d * s * S * 0.12 * f, y + dy / d * s * S * 0.06 * f];
      };
      st.rotw = e => { const a = Math.atan2(ly - e.y, lx - e.x); return Math.sin(a) * 0.15; };
    } else if (P.preset === 'visit') {
      set(-1e5);
      st.perchOn = true; this.perch = [];
      const ph = tt / P.T * Math.PI * 2;
      st.warp = (x, y, l) => { const hh = Math.max(0, (l.y - y) / P.S); return [x + Math.sin(ph + l.x * 0.004 + hh) * P.S * 0.015 * hh, y]; };
    } else {
      if (tt >= 4400) return;
      set(0);
      st.letters = L.filter(l => tt >= l.birth);
      st.textAll = false;
    }
    this.render(B, tt, st);
    if (P.preset === 'reach') {
      const [lx, ly] = this._light, r = P.S * 0.09, pts = [];
      for (let k = 0; k < 20; k++) { const a = k / 20 * Math.PI * 2; pts.push([lx + Math.cos(a) * r, ly + Math.sin(a) * r]); }
      B.fill(pts, st.C.line);
    }
    if (P.preset === 'visit') this.posterFly(B, tt, P, st.C);
    if (P.preset === 'typed') {
      const born = st.letters, last = born[born.length - 1], S = P.S;
      if (Math.floor(tt / 400) % 2 === 0 || (last && tt - last.birth < 300)) {
        const x = last ? last.tx + last.tw / 2 + 0.07 * S : 540, y = last ? last.ty - 0.33 * S : 540, w = Math.max(2, S * 0.03), h = 0.8 * S;
        B.rect(x - w / 2, y - h / 2, w, h, st.C.text);
      }
    }
  }

  // ---------- export ----------
  dl(blob, name) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  savePNG() {
    this.paint(performance.now(), false, 0);
    this.cv.toBlob(b => b && this.dl(b, 'garden.png'));
    this.toast('Saved garden.png');
  }
  saveSVG() {
    const parts = [], n = v => Math.round(v * 100) / 100, fd = this.fontDef();
    const pb = () => ({ d: '', moveTo(x, y) { this.d += `M${n(x)} ${n(y)}`; }, lineTo(x, y) { this.d += `L${n(x)} ${n(y)}`; }, quadraticCurveTo(a, b, x, y) { this.d += `Q${n(a)} ${n(b)} ${n(x)} ${n(y)}`; }, closePath() { this.d += 'Z'; } });
    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const B = {
      fill: (p, col) => { const b = pb(); this.path(b, p, true); parts.push(`<path d="${b.d}" fill="${col}"/>`); },
      stroke: (p, col, w) => { const b = pb(); this.path(b, p, false); parts.push(`<path d="${b.d}" fill="none" stroke="${col}" stroke-width="${n(w)}" stroke-linecap="round" stroke-linejoin="round"/>`); },
      rect: () => {},
      text: (ch, x, y, S, col) => parts.push(`<text x="${n(x)}" y="${n(y)}" text-anchor="middle" font-family="${fd.name}, Georgia, serif" font-weight="${fd.w}" font-size="${n(S)}" fill="${col}">${esc(ch)}</text>`)
    };
    this.render(B, performance.now(), this.mainState());
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${n(this.W)}" height="${n(this.H)}" viewBox="0 0 ${n(this.W)} ${n(this.H)}"><rect width="100%" height="100%" fill="${this.pal().bg}"/>${parts.join('')}</svg>`;
    this.dl(new Blob([svg], { type: 'image/svg+xml' }), 'garden.svg');
    this.toast('Saved garden.svg');
  }
  fname() { return 'garden-' + (this.state.text || 'loop').trim().replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 24) + '-' + this.state.preset; }
  async exportVideo() {
    if (!this.vmime || this.state.busy) { this.set({ status: 'Video export isn’t supported in this browser — use PNG frames.' }); return; }
    const P = this.P, c = document.createElement('canvas'); c.width = c.height = 1080;
    const g = c.getContext('2d'), stream = c.captureStream(0), track = stream.getVideoTracks()[0];
    const rec = new MediaRecorder(stream, { mimeType: this.vmime, videoBitsPerSecond: 14e6 }), chunks = [];
    rec.ondataavailable = e => e.data && e.data.size && chunks.push(e.data);
    const done = new Promise(r => { rec.onstop = r; });
    this.set({ busy: true, status: 'Recording…' });
    this.posterDraw(g, 0); rec.start();
    const N = Math.round(P.T / 1000 * 30), wait = ms => new Promise(r => setTimeout(r, ms));
    const t0 = performance.now();
    for (let i = 0; i < N; i++) {
      this.posterDraw(g, i * 1000 / 30);
      if (track.requestFrame) track.requestFrame();
      if (i % 15 === 0) this.set({ status: `Recording ${Math.round(i / N * 100)}%` });
      const target = t0 + (i + 1) * 1000 / 30; await wait(Math.max(0, target - performance.now()));
    }
    rec.stop(); await done;
    const ext = this.vmime.includes('mp4') ? 'mp4' : 'webm';
    this.dl(new Blob(chunks, { type: this.vmime.split(';')[0] }), `${this.fname()}.${ext}`);
    this.set({ busy: false, status: `Saved ${ext.toUpperCase()} · ${N} frames` });
  }
  async exportFrames() {
    if (this.state.busy) return;
    const P = this.P, c = document.createElement('canvas'); c.width = c.height = 1080;
    const g = c.getContext('2d'), N = Math.round(P.T / 1000 * 30), files = [];
    this.set({ busy: true, status: 'Rendering frames…' });
    for (let i = 0; i < N; i++) {
      this.posterDraw(g, i * 1000 / 30);
      const b = await new Promise(r => c.toBlob(r, 'image/png'));
      files.push({ name: `frame_${String(i + 1).padStart(4, '0')}.png`, data: new Uint8Array(await b.arrayBuffer()) });
      if (i % 10 === 0) this.set({ status: `Rendering ${Math.round(i / N * 100)}%` });
    }
    this.dl(this.zip(files), `${this.fname()}-frames.zip`);
    this.set({ busy: false, status: `Saved ${N} PNG frames · 30 fps` });
  }
  zip(files) {
    const crcT = this._crcT || (this._crcT = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })());
    const crc = d => { let c = 0xFFFFFFFF; for (let i = 0; i < d.length; i++) c = crcT[(c ^ d[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
    const enc = new TextEncoder(), parts = [], cen = []; let off = 0;
    for (const f of files) {
      const nm = enc.encode(f.name), cr = crc(f.data), sz = f.data.length;
      const h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(8, 0, true); h.setUint16(12, 33, true);
      h.setUint32(14, cr, true); h.setUint32(18, sz, true); h.setUint32(22, sz, true); h.setUint16(26, nm.length, true);
      parts.push(h.buffer, nm, f.data);
      const c = new DataView(new ArrayBuffer(46));
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(14, 33, true);
      c.setUint32(16, cr, true); c.setUint32(20, sz, true); c.setUint32(24, sz, true); c.setUint16(28, nm.length, true); c.setUint32(42, off, true);
      cen.push(c.buffer, nm);
      off += 30 + nm.length + sz;
    }
    const cs = cen.reduce((s, b) => s + (b.byteLength || b.length), 0);
    const e = new DataView(new ArrayBuffer(22));
    e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, cs, true); e.setUint32(16, off, true);
    return new Blob([...parts, ...cen, e.buffer], { type: 'application/zip' });
  }
}
window.garden = new Garden();
