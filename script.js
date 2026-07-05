// el clock
function updateClock() {
  const now = new Date();
  document.getElementById('clock').textContent = now.toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit'
  });
}
updateClock();
setInterval(updateClock, 1000);

// context menu
const contextMenu = document.getElementById('contextMenu');
  
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  contextMenu.style.display = 'block';
  contextMenu.style.left = e.clientX + 'px';
  contextMenu.style.top = e.clientY + 'px';
});

document.addEventListener('click', () => {
  contextMenu.style.display = 'none';
});

function contextAction(action) {
  contextMenu.style.display = 'none';
  if (action === 'github') window.open('https://github.com/urged-st', '_blank');
  if (action === 'about') {
    const w = document.getElementById('aboutWindow');
    w.classList.remove('hidden');
    w.style.display = 'flex';
    openWindow(w);
  }
}

// dragger
function dragElement(el) {
  let x1 = 0, y1 = 0, x2 = 0, y2 = 0;
  const header = document.getElementById(el.id + 'header');
  (header || el).onmousedown = startDrag;

  function startDrag(e) {
    // don't start a drag if the resize handle was clicked
    if (e.target.classList && e.target.classList.contains('resize-handle')) return;
    e.preventDefault();
    x2 = e.clientX; y2 = e.clientY;
    document.onmouseup = stopDrag;
    document.onmousemove = doDrag;
  }
  function doDrag(e) {
    x1 = x2 - e.clientX; y1 = y2 - e.clientY;
    x2 = e.clientX; y2 = e.clientY;
    const newTop = el.offsetTop - y1;
    const newLeft = el.offsetLeft - x1;
    el.style.top = newTop + 'px';
    el.style.left = newLeft + 'px';
    trySnap(el, newLeft, newTop);
  }
  function stopDrag() {
    document.onmouseup = null;
    document.onmousemove = null;
    clearSnapPreview();
    applySnap(el);
  }
}

// win management
let topZ = 10;

function openWindow(el) {
  el.style.display = 'flex';
  el.style.zIndex = ++topZ;
  document.getElementById('topbar').style.zIndex = topZ + 1;
  document.getElementById('taskbar').style.zIndex = topZ + 1;
}

function closeWindow(el) {
  el.style.display = 'none';
  removeFromTaskbar(el.id);
}

function minimiseWindow(el) {
  el.classList.add('minimising');
  setTimeout(() => {
    el.style.display = 'none';
    el.classList.remove('minimising');
    el.style.transform = '';
    el.style.opacity = '';
    addToTaskbar(el);
  }, 250);
}

// tb
function addToTaskbar(el) {
  if (document.getElementById('tb-' + el.id)) return;
  const btn = document.createElement('button');
  btn.className = 'taskbar-btn';
  btn.id = 'tb-' + el.id;
  btn.innerHTML = `<span class="tb-icon">${el.dataset.icon || '✦'}</span>`;
  btn.onclick = () => {
    openWindow(el);
    removeFromTaskbar(el.id);
  };
  document.getElementById('taskbar').appendChild(btn);
}

function removeFromTaskbar(id) {
  const btn = document.getElementById('tb-' + id);
  if (btn) btn.remove();
}

// init win
function initWindow(id) {
  const el = document.getElementById(id);
  dragElement(el);
  el.addEventListener('mousedown', () => {
    el.style.zIndex = ++topZ;
    document.getElementById('topbar').style.zIndex = topZ + 1;
    document.getElementById('taskbar').style.zIndex = topZ + 1;
  });
  makeResizable(el);
}



function initSkyMap() {
  // read comments pls i barely got through this
  const status = document.getElementById('skymapStatus');
  const toggle = document.getElementById('coordsToggle');
  const loc = window._userLocation;

  // rip no location
  if (!loc) { status.textContent = 'location unavailable'; toggle.style.display = 'none'; return; }

  // coords hidden by default, privacy thing in case ppl screenshot
  let shown = false;
  status.textContent = 'coords hidden';

  toggle.onclick = () => {
    shown = !shown;
    status.textContent = shown ? `${loc.lat.toFixed(2)}°, ${loc.lon.toFixed(2)}°` : 'coords hidden';
    toggle.textContent = shown ? 'hide' : 'show';
  };

  // rest of the canvas and star drawing logic stays the same

  const container = document.getElementById('skymap');
  container.innerHTML = '';
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 500;
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  // stars, [ra in hours, declination in degrees, magnitude, name]
  // pulled from the Yale Bright Star Catalogue, just the ones you can actually see
  const stars = [
    [6.75, -16.7,  1.0,  'Sirius'],
    [5.24, 45.9,   0.08, 'Capella'],
    [5.92, 7.4,    0.45, 'Rigel'],
    [7.65, 5.2,    0.37, 'Procyon'],
    [5.60, -1.2,   0.50, 'Betelgeuse'],
    [18.6, 38.8,   0.03, 'Vega'],
    [19.8, 8.9,    0.77, 'Altair'],
    [20.7, 45.3,   1.25, 'Deneb'],
    [4.60, 16.5,   0.85, 'Aldebaran'],
    [22.9, -29.6,  1.16, 'Fomalhaut'],
    [6.40, -52.7, -0.72, 'Canopus'],
    [10.1, 11.9,   1.35, 'Regulus'],
    [13.4, -11.2,  0.98, 'Spica'],
    [14.2, 19.2,  -0.05, 'Arcturus'],
    [7.75, 28.0,   1.93, 'Castor'],
    [7.76, 31.9,   1.16, 'Pollux'],
    [12.9, 55.9,   1.86, 'Alioth'],
    [11.1, 61.7,   1.77, 'Dubhe'],
    [2.53, 89.3,   2.02, 'Polaris'],
    [16.5, -26.4,  1.63, 'Antares'],
    [6.04, 44.9,   1.90, 'El Nath'],
    [12.5, -57.1,  1.94, 'Mimosa'],
    [18.4, -26.3,  1.85, 'Kaus Australis'],
    [14.3, -60.4, -0.01, 'α Centauri'],
  ];

  // how much the user has rotated the map by dragging
  let rotation = 0;

  function getAngle(e) {
    const rect = canvas.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - cx;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - cy;
    return Math.atan2(y, x);
  }

  let dragging = false;
  let lastAngle = 0;

  canvas.addEventListener('mousedown',  e => { dragging = true; lastAngle = getAngle(e); });
  canvas.addEventListener('mousemove',  e => {
    if (!dragging) return;
    const angle = getAngle(e);
    rotation += angle - lastAngle;
    lastAngle = angle;
    draw();
  });
  canvas.addEventListener('mouseup',    () => dragging = false);
  canvas.addEventListener('mouseleave', () => dragging = false);

  canvas.addEventListener('touchstart', e => { dragging = true; lastAngle = getAngle(e); });
  canvas.addEventListener('touchmove',  e => {
    if (!dragging) return;
    const angle = getAngle(e);
    rotation += angle - lastAngle;
    lastAngle = angle;
    draw();
  });
  
  canvas.addEventListener('touchend', () => dragging = false);
  // local sidereal time, basically what slice of the sky is overhead right now
  function getLST() {
    const jd = 2440587.5 + Date.now() / 86400000; // julian date, just a big day counter since 4713 BC lol
    return (100.4606184 + 36000.770004 * (jd - 2451545) / 36525 + 360.985647 * (jd - 2451545) + loc.lon) % 360;
  }

  // converts star coords (ra/dec) to altitude w compass direction for your location
  function toAltAz(ra_h, dec_deg, lst) {
    const ra  = ra_h * 15; // hours to degrees
    const dec = dec_deg * Math.PI / 180;
    const ha  = ((lst - ra + 360) % 360) * Math.PI / 180; // hour angle, how far the star has moved since it was due south
    const lat = loc.lat * Math.PI / 180;
    const sinAlt = Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(ha);
    const alt = Math.asin(sinAlt); // how high above horizon
    const az  = Math.atan2(
      -Math.cos(dec) * Math.sin(ha),
      Math.cos(lat) * Math.sin(dec) - Math.sin(lat) * Math.cos(dec) * Math.cos(ha)
    ); // compass bearing
    return { alt: alt * 180 / Math.PI, az: az * 180 / Math.PI };
  }

  // maps altitude w azimuth onto the circular canvas, centre is straight up, edge is horizon
  function project(alt, az) {
    const r     = 240 * (90 - alt) / 90; // further from centre = closer to horizon
    const theta = (az - 90) * Math.PI / 180;
    return { x: 300 + r * Math.cos(theta), y: 250 + r * Math.sin(theta) };
  }

function draw() {
  ctx.clearRect(0, 0, 600, 500);

  // dark sky background
  const bg = ctx.createRadialGradient(300, 250, 0, 300, 250, 300);
  bg.addColorStop(0, '#0d1229');
  bg.addColorStop(1, '#050810');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 600, 500);

  ctx.save();

  // clip everything to a circle so stars dont spill outside the horizon ring
  ctx.beginPath();
  ctx.arc(300, 250, 240, 0, Math.PI * 2);
  ctx.clip();

  // rotate the whole sky around the centre, this is what dragging does
  ctx.translate(300, 250);
  ctx.rotate(rotation);
  ctx.translate(-300, -250);

  // milky way, just a soft glow blob, not scientifically accurate but looks nice
  const mw = ctx.createRadialGradient(320, 200, 0, 320, 200, 160);
  mw.addColorStop(0, 'rgba(26,32,68,0.7)');
  mw.addColorStop(1, 'rgba(26,32,68,0)');
  ctx.fillStyle = mw;
  ctx.fillRect(0, 0, 600, 500);

  // tiny background stars, seeded so they dont flicker every redraw
  const seed = Math.floor(2440587.5 + Date.now() / 86400000);
  for (let i = 0; i < 300; i++) {
    const sx = Math.abs((seed * 1234 + i * 5678) % 600);
    const sy = Math.abs((seed * 8765 + i * 4321) % 500);
    const dx = sx - 300, dy = sy - 250;
    if (dx * dx + dy * dy > 240 * 240) continue; // skip if outside circle
    ctx.beginPath();
    ctx.arc(sx, sy, (i % 3) * 0.3 + 0.2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200,210,255,${(i % 5) * 0.08 + 0.1})`;
    ctx.fill();
  }

  // the actual named stars, dots only here, labels drawn later unrotated
  const lst = getLST();
  const labelPositions = []; // stash label info to draw after we un-rotate

  stars.forEach(([ra, dec, mag, name]) => {
    const { alt, az } = toAltAz(ra, dec, lst);
    if (alt < 0) return; // below horizon, skip it

    const { x, y } = project(alt, az);
    const size = Math.max(0.8, 3.5 - mag * 0.8); // brighter = bigger dot
    const brightness = Math.min(1, 0.4 + (6 - mag) * 0.12);

    // glow effect for the bright ones
    if (mag < 1.5) {
      const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 5);
      glow.addColorStop(0, 'rgba(180,200,255,0.35)');
      glow.addColorStop(1, 'rgba(180,200,255,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, size * 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // the dot
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(220,225,255,${brightness})`;
    ctx.fill();

    // stash the screen position (post-rotation) for the label, drawn later unrotated
    labelPositions.push({ x, y, size, name });
  });

  ctx.restore(); // undo the clip and rotation, text drawn from here on stays upright

  // star name labels, drawn after restore so they never tilt with the sky
  labelPositions.forEach(({ x, y, size, name }) => {
    // rotate just this point around centre to find where it landed on screen
    const dx = x - 300, dy = y - 250;
    const sx = 300 + dx * Math.cos(rotation) - dy * Math.sin(rotation);
    const sy = 250 + dx * Math.sin(rotation) + dy * Math.cos(rotation);

    ctx.font = '10px Space Mono, monospace';
    ctx.fillStyle = 'rgba(180,190,255,0.75)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, sx + size + 4, sy);
  });

  // cardinal directions, fixed orientation now, always upright, but rotate position with sky
  ctx.font = '11px Space Mono, monospace';
  ctx.fillStyle = '#7B8CFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  [['N', 0], ['E', 90], ['S', 180], ['W', 270]].forEach(([label, az]) => {
    const theta = (az - 90) * Math.PI / 180 + rotation;
    ctx.fillText(label, 300 + 228 * Math.cos(theta), 250 + 228 * Math.sin(theta));
  });

  // horizon ring, drawn outside the rotation so it stays still
  ctx.beginPath();
  ctx.arc(300, 250, 240, 0, Math.PI * 2);
  ctx.strokeStyle = '#7B8CFF';
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.5;
  ctx.stroke();
  ctx.globalAlpha = 1;
}

  draw(); // initial render
}

// window resize

function makeResizable(el) {
  const handle = document.createElement('div');
  handle.className = 'resize-handle';
  el.appendChild(handle);

  const MIN_W = 260;
  const MIN_H = 160;

  let startX, startY, startW, startH;

  handle.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation(); // don't let this bubble into the drag handler
    startX = e.clientX;
    startY = e.clientY;
    startW = el.offsetWidth;
    startH = el.offsetHeight;
    el.style.zIndex = ++topZ;

    document.onmousemove = doResize;
    document.onmouseup = stopResize;
  });

  function doResize(e) {
    const newW = Math.max(MIN_W, startW + (e.clientX - startX));
    const newH = Math.max(MIN_H, startH + (e.clientY - startY));
    el.style.width = newW + 'px';
    el.style.height = newH + 'px';

    // give inner scrollable areas a chance to fill the new space
    const skymap = el.querySelector('#skymap');
    if (skymap) skymap.style.height = (newH - 90) + 'px';
    const ngcBody = el.querySelector('.ngc-body');
    if (ngcBody) ngcBody.style.height = (newH - 130) + 'px';
  }

  function stopResize() {
    document.onmousemove = null;
    document.onmouseup = null;
  }
}


// window snap to edge

let snapPreviewEl = null;
const SNAP_MARGIN = 24; // px from edge that triggers a snap zone

function getSnapZone(left, top) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (left <= SNAP_MARGIN && top <= SNAP_MARGIN) return 'top-left';
  if (left + 1 >= vw - SNAP_MARGIN - 300 && top <= SNAP_MARGIN) return 'top-right'; // rough width guess ok since only used for preview edge-snap
  if (top <= SNAP_MARGIN) return 'top';
  if (left <= SNAP_MARGIN) return 'left';
  if (left + 300 >= vw - SNAP_MARGIN) return 'right';
  return null;
}

function trySnap(el, left, top) {
  const zone = getSnapZone(left, top);
  if (!zone) { clearSnapPreview(); el.dataset.snapZone = ''; return; }
  el.dataset.snapZone = zone;
  showSnapPreview(zone);
}

function showSnapPreview(zone) {
  if (!snapPreviewEl) {
    snapPreviewEl = document.createElement('div');
    snapPreviewEl.className = 'snap-preview';
    document.getElementById('desktop').appendChild(snapPreviewEl);
  }
  const vw = window.innerWidth;
  const vh = window.innerHeight - 40 - 48; // minus topbar and taskbar
  const rects = {
    'left':  { left: 0, top: 40, width: vw / 2, height: vh },
    'right': { left: vw / 2, top: 40, width: vw / 2, height: vh },
    'top':   { left: 0, top: 40, width: vw, height: vh },
  };
  const r = rects[zone] || rects['top'];
  snapPreviewEl.style.left = r.left + 'px';
  snapPreviewEl.style.top = r.top + 'px';
  snapPreviewEl.style.width = r.width + 'px';
  snapPreviewEl.style.height = r.height + 'px';
  snapPreviewEl.classList.add('show');
}

function clearSnapPreview() {
  if (snapPreviewEl) snapPreviewEl.classList.remove('show');
}

// window snapping
function applySnap(el) {
  const zone = el.dataset.snapZone;
  clearSnapPreview();
  if (!zone) return;

  const vw = window.innerWidth;
  const vh = window.innerHeight - 40 - 48; // minus topbar and taskbar
  const rects = {
    'left':  { left: 0, top: 40, width: vw / 2, height: vh },
    'right': { left: vw / 2, top: 40, width: vw / 2, height: vh },
    'top':   { left: 0, top: 40, width: vw, height: vh },
  };
  const r = rects[zone];
  if (r) {
    el.style.left = r.left + 'px';
    el.style.top = r.top + 'px';
    el.style.width = r.width + 'px';
    el.style.height = r.height + 'px';
    el.style.transform = 'none'; // was translate(-50%,-50%) by default, kill that once positioned manually

    // give inner scrollable areas a chance to fill the new space
    const skymap = el.querySelector('#skymap');
    if (skymap) skymap.style.height = (r.height - 90) + 'px';
    const ngcBody = el.querySelector('.ngc-body');
    if (ngcBody) ngcBody.style.height = (r.height - 130) + 'px';
  }
  el.dataset.snapZone = '';
}

// wallpaper changer

const WALLPAPER_KEY = 'astros_wallpaper';

const WALLPAPERS = {
  default:    "var(--bg) url('assets/bg.jpg') center/cover no-repeat",
  nebula:     'radial-gradient(ellipse at 30% 20%, #3a1f5d 0%, #14082a 45%, #050810 100%)',
  deepblue:   'radial-gradient(ellipse at 70% 30%, #10275c 0%, #060b1c 55%, #030509 100%)',
  solarflare: 'radial-gradient(ellipse at 50% 15%, #5c2a10 0%, #2a0f14 45%, #050810 100%)',
  aurora:     'radial-gradient(ellipse at 40% 25%, #0f4d3a 0%, #0a1a2e 45%, #050810 100%)',
  mono:       '#05060a',
};

function applyWallpaper(key) {
  const bg = WALLPAPERS[key] || WALLPAPERS.default;
  document.getElementById('desktop').style.background = bg;
  try { localStorage.setItem(WALLPAPER_KEY, key); } catch (e) { /* storage unavailable, just skip persisting */ }
}

function markActiveWallpaperSwatch() {
  let saved = 'default';
  try { saved = localStorage.getItem(WALLPAPER_KEY) || 'default'; } catch (e) {}
  document.querySelectorAll('.wallpaper-swatch').forEach((s) => {
    s.classList.toggle('active', s.dataset.bg === saved);
  });
}

document.querySelectorAll('.wallpaper-swatch').forEach((swatch) => {
  swatch.addEventListener('click', () => {
    applyWallpaper(swatch.dataset.bg);
    markActiveWallpaperSwatch();
  });
});

// apply saved wallpaper as soon as the script loads so it's correct the instant the desktop appears
(function loadSavedWallpaper() {
  let saved = null;
  try { saved = localStorage.getItem(WALLPAPER_KEY); } catch (e) {}
  if (saved) applyWallpaper(saved);
})();

// did you know notification pings

const SPACE_FACTS = [
  'A day on Venus is longer than its year.',
  'Neutron stars can spin at over 600 rotations per second.',
  'There are more stars in the universe than grains of sand on every beach on Earth.',
  'The footprints on the Moon will likely last millions of years, there is no wind to erase them.',
  'Jupiter has at least 95 known moons.',
  'One teaspoon of a neutron star would weigh about a billion tons.',
  'The Sun accounts for over 99.8% of the mass in the solar system.',
  'Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.',
  'Saturn would float in water if you could find a tub big enough.',
  "Space is completely silent, there's no medium for sound to travel through.",
  'The largest known star, UY Scuti, could fit roughly 5 billion Suns inside it.',
  'A year on Mercury is just 88 Earth days.',
  'The Milky Way and Andromeda galaxies are on a collision course, arriving in about 4.5 billion years.',
  "Black holes aren't actually holes, they're incredibly dense concentrations of mass.",
  'Olympus Mons on Mars is nearly three times the height of Mount Everest.',
  'Some exoplanets rain glass, sideways, in 4,500 mph winds.',
  'The International Space Station travels at roughly 17,500 mph.',
  'Uranus rotates almost completely on its side.',
];

let notifTimer = null;
let notifStarted = false;

function showNotification(text) {
  const container = document.getElementById('notificationContainer');
  if (!container) return;

  const note = document.createElement('div');
  note.className = 'notification';
  note.innerHTML = `
    <div class="notification-head">
      <span class="notification-title">DID YOU KNOW</span>
      <span class="notification-close">&times;</span>
    </div>
    <div class="notification-body">${text}</div>
  `;
  container.appendChild(note);

  requestAnimationFrame(() => note.classList.add('show'));

  const dismiss = () => {
    note.classList.remove('show');
    setTimeout(() => note.remove(), 350);
  };

  note.querySelector('.notification-close').addEventListener('click', (e) => {
    e.stopPropagation();
    dismiss();
  });

  setTimeout(dismiss, 8000);
}

function pingRandomFact() {
  const fact = SPACE_FACTS[Math.floor(Math.random() * SPACE_FACTS.length)];
  showNotification(fact);
}

function scheduleNotifications() {
  if (notifStarted) return; // don't stack multiple loops if called twice bro
  notifStarted = true;

  // first ping shortly after landing on the desktop to keep engagement lol
  setTimeout(pingRandomFact, 4000);

  function loop() {
    const delay = 60000 + Math.random() * 60000; // somewhere between 60s and 120s
    notifTimer = setTimeout(() => {
      pingRandomFact();
      loop();
    }, delay);
  }
  loop();
}

// NGC catalogue browser, live data
// pulls from Datastro's public deep-sky-objects dataset (~220k NGC/IC/Messier
// entries, built on the Opendatasoft Explore API v2.1). no key needed, CORS-open.
// docs: https://www.datastro.eu/explore/dataset/deep-sky-objects/api/

const NGC_API_BASE = 'https://www.datastro.eu/api/explore/v2.1/catalog/datasets/deep-sky-objects/records';
const NGC_PAGE_SIZE = 40;

// small hand-picked set used only if the live API can't be reached (offline, network blocked, etc)
const NGC_OFFLINE_FALLBACK = [
  { id1: 'M31',  cat1: 'M', id2: '224',  cat2: 'NGC', name: 'Andromeda Galaxy', type: 'G',   const: 'Andromeda',      mag: 3.4 },
  { id1: 'M42',  cat1: 'M', id2: '1976', cat2: 'NGC', name: 'Orion Nebula',     type: 'Neb', const: 'Orion',          mag: 4.0 },
  { id1: 'M45',  cat1: 'M', id2: null,   cat2: null,  name: 'Pleiades',         type: 'OCl', const: 'Taurus',         mag: 1.6 },
  { id1: 'M13',  cat1: 'M', id2: '6205', cat2: 'NGC', name: 'Hercules Cluster', type: 'GCl', const: 'Hercules',       mag: 5.8 },
  { id1: 'M57',  cat1: 'M', id2: '6720', cat2: 'NGC', name: 'Ring Nebula',      type: 'PN',  const: 'Lyra',           mag: 8.8 },
  { id1: 'M51',  cat1: 'M', id2: '5194', cat2: 'NGC', name: 'Whirlpool Galaxy', type: 'G',   const: 'Canes Venatici', mag: 8.4 },
  { id1: 'M1',   cat1: 'M', id2: '1952', cat2: 'NGC', name: 'Crab Nebula',      type: 'SNR', const: 'Taurus',         mag: 8.4 },
  { id1: 'M27',  cat1: 'M', id2: '6853', cat2: 'NGC', name: 'Dumbbell Nebula',  type: 'PN',  const: 'Vulpecula',      mag: 7.5 },
];

let ngcInitialised = false;
let ngcActiveKey = null;
let ngcSearchDebounce = null;
let ngcCurrentResults = [];
let ngcUsingFallback = false;

// the live dataset's type field follows the Historically Corrected NGC scheme
// (G, GPair, GCl, OCl, PN, Neb, SNR, *, etc), bucket it down to something the
// filter dropdown can use
function classifyNgcType(rawType) {
  if (!rawType) return 'other';
  const t = String(rawType).toLowerCase();
  if (t.includes('cl')) return 'cluster';               // OCl, GCl, Cl+N
  if (t.startsWith('g') && !t.includes('cl')) return 'galaxy'; // G, GPair, GTrpl, GGroup
  if (t.includes('neb') || t.includes('pn') || t.includes('snr') || t === 'n') return 'nebula';
  return 'other';
}

function ngcTypeIcon(type) {
  if (type === 'galaxy') return '🌀';
  if (type === 'nebula') return '☁️';
  if (type === 'cluster') return '✨';
  return '✦';
}

// normalises either a live API record or a fallback entry into one shape the UI understands
function normaliseNgcRecord(rec) {
  const cat1 = rec.cat1 || '';
  const id1 = rec.id1 != null ? String(rec.id1) : '';
  const cat2 = rec.cat2 || '';
  const id2 = rec.id2 != null ? String(rec.id2) : '';
  const primary = cat1 && id1 ? `${cat1} ${id1}` : '';
  const secondary = cat2 && id2 ? `${cat2} ${id2}` : '';
  const displayName = rec.name || primary || secondary || 'Unnamed object';

  return {
    key: `${primary}|${secondary}|${displayName}`,
    primary: primary || '—',
    secondary: secondary || '—',
    name: displayName,
    type: classifyNgcType(rec.type),
    rawType: rec.type || 'unknown',
    con: rec.const || rec.con || '—',
    mag: (rec.mag !== undefined && rec.mag !== null) ? rec.mag : '—',
    ra: rec.ra,
    dec: rec.dec,
  };
}

function ngcSetStatus(msg) {
  const listEl = document.getElementById('ngcList');
  listEl.innerHTML = `<li><span class="ngc-item-name" style="color: var(--subtext);">${msg}</span></li>`;
}

// builds the query URL for either a free-text search or the default brightest known objects browse
function buildNgcUrl(query) {
  const params = new URLSearchParams();
  params.set('limit', String(NGC_PAGE_SIZE));
  if (query) {
    params.set('q', query);
    params.set('order_by', 'mag asc');
  } else {
    params.set('where', 'cat1="NGC" or cat1="IC" or cat1="M"');
    params.set('order_by', 'mag asc');
  }
  return `${NGC_API_BASE}?${params.toString()}`;
}

async function fetchNgcResults(query) {
  const res = await fetch(buildNgcUrl(query));
  if (!res.ok) throw new Error(`API returned ${res.status}`);
  const data = await res.json();
  const rows = data.results || data.records || [];
  return rows.map((row) => normaliseNgcRecord(row.record ? row.record.fields : row));
}

async function loadNgcResults(query) {
  ngcSetStatus(query ? `searching for "${query}"…` : 'loading brightest objects…');

  try {
    const results = await fetchNgcResults(query);
    ngcUsingFallback = false;
    ngcCurrentResults = results;
  } catch (err) {
    console.warn('NGC live API unavailable, using offline fallback:', err);
    ngcUsingFallback = true;
    const term = (query || '').toLowerCase();
    ngcCurrentResults = NGC_OFFLINE_FALLBACK
      .map(normaliseNgcRecord)
      .filter((obj) => !term || `${obj.primary} ${obj.secondary} ${obj.name}`.toLowerCase().includes(term));
  }

  renderNgcList();
}

function renderNgcList() {
  const listEl = document.getElementById('ngcList');
  const filter = document.getElementById('ngcFilter').value;

  const filtered = ngcCurrentResults.filter((obj) => filter === 'all' || obj.type === filter);

  listEl.innerHTML = '';

  if (ngcUsingFallback) {
    const note = document.createElement('li');
    note.style.cursor = 'default';
    note.innerHTML = `<span class="ngc-item-name" style="color: var(--subtext); font-size: 10px;">⚠ offline, showing a small local sample</span>`;
    listEl.appendChild(note);
  }

  if (filtered.length === 0) {
    const li = document.createElement('li');
    li.innerHTML = `<span class="ngc-item-name" style="color: var(--subtext);">no matches</span>`;
    listEl.appendChild(li);
    return;
  }

  filtered.forEach((obj) => {
    const li = document.createElement('li');
    li.className = obj.key === ngcActiveKey ? 'active' : '';
    li.innerHTML = `
      <span class="ngc-item-id">${ngcTypeIcon(obj.type)} ${obj.secondary !== '—' ? obj.secondary : obj.primary}</span>
      <span class="ngc-item-name">${obj.name}</span>
    `;
    li.addEventListener('click', () => {
      ngcActiveKey = obj.key;
      renderNgcDetail(obj);
      listEl.querySelectorAll('li').forEach((n) => n.classList.remove('active'));
      li.classList.add('active');
    });
    listEl.appendChild(li);
  });
}

function renderNgcDetail(obj) {
  const detail = document.getElementById('ngcDetail');
  const coords = (typeof obj.ra === 'number' && typeof obj.dec === 'number')
    ? `RA ${obj.ra.toFixed(2)}° · Dec ${obj.dec.toFixed(2)}°`
    : null;

  detail.innerHTML = `
    <div class="ngc-detail-id">${obj.secondary !== '—' ? obj.secondary : ''} ${obj.primary !== '—' ? '· ' + obj.primary : ''}</div>
    <div class="ngc-detail-name">${obj.name}</div>
    <div class="ngc-detail-row"><span>Type</span><span>${obj.type} (${obj.rawType})</span></div>
    <div class="ngc-detail-row"><span>Constellation</span><span>${obj.con}</span></div>
    <div class="ngc-detail-row"><span>Apparent magnitude</span><span>${obj.mag}</span></div>
    ${coords ? `<div class="ngc-detail-row"><span>Coordinates</span><span>${coords}</span></div>` : ''}
    <p class="ngc-detail-desc" style="color: var(--subtext); font-size: 11px; font-family: var(--font-mono);">data via datastro.eu</p>
  `;
}

function initNgcBrowser() {
  if (ngcInitialised) return;
  ngcInitialised = true;

  document.getElementById('ngcSearch').addEventListener('input', (e) => {
    clearTimeout(ngcSearchDebounce);
    const value = e.target.value.trim();
    ngcSearchDebounce = setTimeout(() => loadNgcResults(value), 350);
  });
  document.getElementById('ngcFilter').addEventListener('change', renderNgcList);

  loadNgcResults('');
}