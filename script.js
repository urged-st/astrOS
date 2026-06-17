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
    e.preventDefault();
    x2 = e.clientX; y2 = e.clientY;
    document.onmouseup = stopDrag;
    document.onmousemove = doDrag;
  }
  function doDrag(e) {
    x1 = x2 - e.clientX; y1 = y2 - e.clientY;
    x2 = e.clientX; y2 = e.clientY;
    el.style.top = (el.offsetTop - y1) + 'px';
    el.style.left = (el.offsetLeft - x1) + 'px';
  }
  function stopDrag() {
    document.onmouseup = null;
    document.onmousemove = null;
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
  btn.textContent = el.dataset.title || el.id;
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
}



function initSkyMap() {
  // read comments pls i barely got through this
  const status = document.getElementById('skymapStatus');
  const toggle = document.getElementById('coordsToggle');
  const loc = window._userLocation;

  // rip no location
  if (!loc) { status.textContent = 'location unavailable'; toggle.style.display = 'none'; return; }

  // coords hidden by default — privacy thing in case ppl screenshot
  let shown = false;
  status.textContent = 'coords hidden';

  toggle.onclick = () => {
    shown = !shown;
    status.textContent = shown ? `${loc.lat.toFixed(2)}°, ${loc.lon.toFixed(2)}°` : 'coords hidden';
    toggle.textContent = shown ? 'hide' : 'show';
  };

  // ... rest of the canvas/star drawing logic stays the same

  const container = document.getElementById('skymap');
  container.innerHTML = '';
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 500;
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  // stars — [ra in hours, declination in degrees, magnitude, name]
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
  // local sidereal time — basically what slice of the sky is overhead right now
  function getLST() {
    const jd = 2440587.5 + Date.now() / 86400000; // julian date, just a big day counter since 4713 BC lol
    return (100.4606184 + 36000.770004 * (jd - 2451545) / 36525 + 360.985647 * (jd - 2451545) + loc.lon) % 360;
  }

  // converts star coords (ra/dec) to altitude + compass direction for your location
  function toAltAz(ra_h, dec_deg, lst) {
    const ra  = ra_h * 15; // hours to degrees
    const dec = dec_deg * Math.PI / 180;
    const ha  = ((lst - ra + 360) % 360) * Math.PI / 180; // hour angle — how far the star has moved since it was due south
    const lat = loc.lat * Math.PI / 180;
    const sinAlt = Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(ha);
    const alt = Math.asin(sinAlt); // how high above horizon
    const az  = Math.atan2(
      -Math.cos(dec) * Math.sin(ha),
      Math.cos(lat) * Math.sin(dec) - Math.sin(lat) * Math.cos(dec) * Math.cos(ha)
    ); // compass bearing
    return { alt: alt * 180 / Math.PI, az: az * 180 / Math.PI };
  }

  // maps altitude + azimuth onto the circular canvas — centre is straight up, edge is horizon
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

  // rotate the whole sky around the centre — this is what dragging does
  ctx.translate(300, 250);
  ctx.rotate(rotation);
  ctx.translate(-300, -250);

  // milky way — just a soft glow blob, not scientifically accurate but looks nice
  const mw = ctx.createRadialGradient(320, 200, 0, 320, 200, 160);
  mw.addColorStop(0, 'rgba(26,32,68,0.7)');
  mw.addColorStop(1, 'rgba(26,32,68,0)');
  ctx.fillStyle = mw;
  ctx.fillRect(0, 0, 600, 500);

  // tiny background stars — seeded so they dont flicker every redraw
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

  // the actual named stars — dots only here, labels drawn later unrotated
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

  ctx.restore(); // undo the clip + rotation — text drawn from here on stays upright

  // star name labels — drawn after restore so they never tilt with the sky
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

  // cardinal directions — fixed orientation now, always upright, but rotate position with sky
  ctx.font = '11px Space Mono, monospace';
  ctx.fillStyle = '#7B8CFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  [['N', 0], ['E', 90], ['S', 180], ['W', 270]].forEach(([label, az]) => {
    const theta = (az - 90) * Math.PI / 180 + rotation;
    ctx.fillText(label, 300 + 228 * Math.cos(theta), 250 + 228 * Math.sin(theta));
  });

  // horizon ring — drawn outside the rotation so it stays still
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