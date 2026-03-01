// ═══════════════════════════════════════════════════════════════════
//  ADNOVA DASHBOARD — Figma Plugin  (code.js)
//  Recreates the full Reports & Analytics dashboard with exact
//  colors, borders, border-radii, shadows, and folder-tab card depth.
// ═══════════════════════════════════════════════════════════════════

figma.showUI(__html__, { width: 320, height: 480 });

// ─── Color helpers ────────────────────────────────────────────────
function hex(h) {
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h, 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}
function rgba(h, a) { var c = hex(h); return { r: c.r, g: c.g, b: c.b, a: a }; }

// ─── Palette ──────────────────────────────────────────────────────
const C = {
  bgBase:      '#080c14',
  bgSidebar:   '#0c1220',
  bgMain:      '#0c1220',
  bgCardOuter: '#080c14',
  bgCardInner: '#1a2640',
  bgInset:     '#090e1a',
  borderCard:  '#141f35',
  borderInner: '#243356',
  borderFaint: '#0f1829',
  purple:      '#7060f0',
  blue:        '#4a84f4',
  green:       '#00c896',
  red:         '#f03e5f',
  slate:       '#253550',
  textHi:      '#dde6f5',
  textMid:     '#62789e',
  textLo:      '#3a4f6e',
};

// ─── Utilities ────────────────────────────────────────────────────
async function loadFont(family, style) {
  await figma.loadFontAsync({ family, style });
}

async function loadFonts() {
  for (const f of [
    ['Inter', 'Regular'], ['Inter', 'Medium'], ['Inter', 'SemiBold'],
    ['Inter', 'Bold'], ['Inter', 'ExtraBold'],
    ['Manrope', 'Regular'], ['Manrope', 'Medium'], ['Manrope', 'SemiBold'],
    ['Manrope', 'Bold'], ['Manrope', 'ExtraBold'],
  ]) { await loadFont(f[0], f[1]); }
}

// Set fill
function setFill(node, color, opacity = 1) {
  if (typeof color === 'string') {
    node.fills = [{ type: 'SOLID', color: hex(color), opacity }];
  } else {
    node.fills = [color];
  }
}

// Set stroke
function setStroke(node, color, weight = 1, opacity = 1) {
  node.strokes = [{ type: 'SOLID', color: hex(color), opacity }];
  node.strokeWeight = weight;
  node.strokeAlign = 'INSIDE';
}

// Text node helper
async function txt(content, family, size, weight, colorHex, opts = {}) {
  const t = figma.createText();
  await figma.loadFontAsync({ family, style: weight });
  t.fontName = { family, style: weight };
  t.characters = content;
  t.fontSize = size;
  t.fills = [{ type: 'SOLID', color: hex(colorHex) }];
  if (opts.opacity !== undefined) t.opacity = opts.opacity;
  if (opts.letterSpacing !== undefined) t.letterSpacing = { value: opts.letterSpacing, unit: 'PIXELS' };
  if (opts.textCase) t.textCase = opts.textCase;
  return t;
}

// Rectangle helper
function rect(w, h, colorHex, radius = 0, opacity = 1) {
  const r = figma.createRectangle();
  r.resize(w, h);
  r.cornerRadius = radius;
  if (colorHex) setFill(r, colorHex, opacity);
  return r;
}

// Frame helper — auto-layout off by default
function frame(w, h, colorHex, radius = 0, opts = {}) {
  const f = figma.createFrame();
  f.resize(w, h);
  f.cornerRadius = radius;
  if (colorHex) setFill(f, colorHex);
  else f.fills = [];
  if (opts.stroke) setStroke(f, opts.stroke, opts.strokeW || 1, opts.strokeOpacity || 1);
  if (opts.effects) f.effects = opts.effects;
  f.clipsContent = false;
  return f;
}

// Auto-layout frame
function autoFrame(dir, gap, padT, padR, padB, padL, colorHex, radius = 0, opts = {}) {
  const f = figma.createFrame();
  f.layoutMode = dir === 'H' ? 'HORIZONTAL' : 'VERTICAL';
  f.primaryAxisAlignItems = opts.primary || 'MIN';
  f.counterAxisAlignItems = opts.counter || 'MIN';
  f.itemSpacing = gap;
  f.paddingTop = padT; f.paddingRight = padR;
  f.paddingBottom = padB; f.paddingLeft = padL;
  f.cornerRadius = radius;
  if (colorHex) setFill(f, colorHex);
  else f.fills = [];
  if (opts.stroke) setStroke(f, opts.stroke, opts.strokeW || 1, opts.strokeOpacity || 1);
  if (opts.effects) f.effects = opts.effects;
  f.clipsContent = false;
  return f;
}

// Pill/badge
async function badge(label, bgColor, textColor, bgOpacity = 1) {
  const f = autoFrame('H', 0, 2, 5, 2, 5, null, 4);
  setFill(f, bgColor, bgOpacity);
  const t = await txt(label, 'Inter', 9, 'Bold', textColor);
  f.appendChild(t);
  f.layoutSizingHorizontal = 'HUG';
  f.layoutSizingVertical = 'HUG';
  return f;
}

// Icon placeholder circle/square
function iconBox(size, radius = 7) {
  const f = frame(size, size, C.bgInset, radius, { stroke: C.borderCard, strokeOpacity: 0.5 });
  // Dot to represent icon
  const dot = rect(6, 6, C.textLo, 1);
  dot.x = (size - 6) / 2;
  dot.y = (size - 6) / 2;
  f.appendChild(dot);
  return f;
}

// Avatar circle
function avatar(size, label, radius = size / 2) {
  const f = frame(size, size, null, radius);
  // Gradient fill
  f.fills = [{
    type: 'GRADIENT_LINEAR',
    gradientStops: [
      { position: 0, color: { r: hex('#7060f0').r, g: hex('#7060f0').g, b: hex('#7060f0').b, a: 1 } },
      { position: 1, color: { r: hex('#4a84f4').r, g: hex('#4a84f4').g, b: hex('#4a84f4').b, a: 1 } },
    ],
    gradientTransform: [[0.7071, -0.7071, 0.5], [0.7071, 0.7071, -0.0711]]
  }];
  return f;
}

// Gradient fill helper for frames
function gradientFill(c1, c2, angle = 90) {
  const rad = (angle * Math.PI) / 180;
  return {
    type: 'GRADIENT_LINEAR',
    gradientStops: [
      { position: 0, color: { r: hex(c1).r, g: hex(c1).g, b: hex(c1).b, a: 1 } },
      { position: 1, color: { r: hex(c2).r, g: hex(c2).g, b: hex(c2).b, a: 1 } },
    ],
    gradientTransform: [
      [Math.cos(rad), -Math.sin(rad), 0.5 - 0.5 * Math.cos(rad) + 0.5 * Math.sin(rad)],
      [Math.sin(rad),  Math.cos(rad), 0.5 - 0.5 * Math.sin(rad) - 0.5 * Math.cos(rad)]
    ]
  };
}

// ─── Drop shadow effect ───────────────────────────────────────────
function dropShadow(colorHex, opacity, offsetX, offsetY, blur, spread) {
  if (spread === undefined) { spread = 0; }
  const c = hex(colorHex);
  return {
    type: 'DROP_SHADOW',
    color: { r: c.r, g: c.g, b: c.b, a: opacity },
    offset: { x: offsetX, y: offsetY },
    radius: blur,
    spread,
    visible: true,
    blendMode: 'NORMAL',
  };
}

// Inset shadow
function innerShadow(colorHex, opacity, offsetX, offsetY, blur) {
  const c = hex(colorHex);
  return {
    type: 'INNER_SHADOW',
    color: { r: c.r, g: c.g, b: c.b, a: opacity },
    offset: { x: offsetX, y: offsetY },
    radius: blur,
    spread: 0,
    visible: true,
    blendMode: 'NORMAL',
  };
}

// ─── Sparkline (simplified polyline as rectangle bar chart) ───────
function sparkline(w, h, color) {
  const f = frame(w, h, null, 0);
  const bars = [42, 36, 46, 31, 50, 43, 39, 54, 47, 53, 46, 61, 55, 59];
  const bw = Math.floor(w / bars.length) - 1;
  var mx = bars.reduce(function(a, b) { return a > b ? a : b; }, 0);
  bars.forEach((v, i) => {
    const bh = Math.max(2, Math.round((v / mx) * h));
    const b = rect(Math.max(1, bw), bh, color, 1, 0.6);
    b.x = i * (bw + 1);
    b.y = h - bh;
    f.appendChild(b);
  });
  return f;
}

// ─── Divider line ─────────────────────────────────────────────────
function divider(w, colorHex = C.borderInner, opacity = 1) {
  const r = rect(w, 1, colorHex, 0, opacity);
  return r;
}

// ══════════════════════════════════════════════════════════════════
//  BUILD FUNCTIONS
// ══════════════════════════════════════════════════════════════════

// ── Sidebar ──────────────────────────────────────────────────────
async function buildSidebar() {
  const sb = autoFrame('V', 0, 0, 0, 0, 0, C.bgSidebar, 12, {
    stroke: C.borderFaint, strokeW: 1
  });
  sb.resize(210, 900);
  sb.primaryAxisAlignItems = 'MIN';
  sb.counterAxisAlignItems = 'STRETCH';
  sb.layoutSizingVertical = 'FIXED';
  sb.layoutSizingHorizontal = 'FIXED';

  // ── Logo row ──
  const logoRow = autoFrame('H', 9, 16, 14, 12, 14, null, 0, { counter: 'CENTER' });
  logoRow.layoutSizingHorizontal = 'FILL';
  logoRow.layoutSizingVertical = 'HUG';

  const logoIcon = frame(28, 28, null, 7);
  logoIcon.fills = [gradientFill('#7060f0', '#4a84f4', 135)];
  logoIcon.layoutSizingHorizontal = 'FIXED';
  logoIcon.layoutSizingVertical = 'FIXED';

  const logoLbl = await txt('Adnova', 'Inter', 18, 'Bold', C.textHi);
  logoRow.appendChild(logoIcon);
  logoRow.appendChild(logoLbl);
  sb.appendChild(logoRow);

  // ── Workspace badge ──
  const ws = autoFrame('H', 7, 7, 9, 7, 9, C.bgInset, 8, {
    stroke: C.borderFaint, strokeW: 1, counter: 'CENTER'
  });
  ws.layoutSizingHorizontal = 'FILL';
  ws.layoutSizingVertical = 'HUG';
  // small left margin
  const wsWrap = autoFrame('H', 0, 0, 10, 0, 10, null, 0);
  wsWrap.layoutSizingHorizontal = 'FILL';
  wsWrap.layoutSizingVertical = 'HUG';

  const wsAv = avatar(22, 'M', 5);
  wsAv.layoutSizingHorizontal = 'FIXED';
  wsAv.layoutSizingVertical = 'FIXED';
  ws.appendChild(wsAv);

  const wsInfo = autoFrame('V', 1, 0, 0, 0, 0, null, 0);
  wsInfo.layoutSizingHorizontal = 'FILL';
  wsInfo.layoutSizingVertical = 'HUG';
  const wsLbl = await txt('WORKSPACE', 'Manrope', 9, 'SemiBold', C.textLo, { letterSpacing: 0.7, textCase: 'UPPER' });
  const wsName = await txt('Marketing-bnks534', 'Manrope', 11, 'Regular', C.textMid);
  wsInfo.appendChild(wsLbl);
  wsInfo.appendChild(wsName);
  ws.appendChild(wsInfo);

  wsWrap.appendChild(ws);
  sb.appendChild(wsWrap);

  // ── Nav items ──
  const navItems = [
    { icon: '⊞', label: 'Dashboard', active: false },
    { icon: '📢', label: 'Campaigns', active: false },
    { icon: '👥', label: 'User Quality', active: false },
    { icon: '📊', label: 'Reports & Analytics', active: true },
    { icon: '🤖', label: 'AI Advisor', active: false },
    { icon: '⚙', label: 'Prompt Builder', active: false },
  ];
  const navSection1 = autoFrame('V', 1, 4, 8, 4, 8, null, 0);
  navSection1.layoutSizingHorizontal = 'FILL';
  navSection1.layoutSizingVertical = 'HUG';

  for (const item of navItems) {
    const ni = autoFrame('H', 8, 8, 10, 8, 10, null, 8, { counter: 'CENTER' });
    ni.layoutSizingHorizontal = 'FILL';
    ni.layoutSizingVertical = 'HUG';
    ni.strokes = [{ type: 'SOLID', color: hex(item.active ? C.purple : C.borderCard), opacity: item.active ? 0.18 : 0 }];
    ni.strokeWeight = 1;
    ni.strokeAlign = 'INSIDE';
    if (item.active) {
      setFill(ni, C.purple, 0.12);
    }
    const iconDot = rect(4, 4, item.active ? C.purple : C.textLo, 2, item.active ? 1 : 0.6);
    ni.appendChild(iconDot);
    const niLabel = await txt(item.label, 'Manrope', 12.5, 'Regular', item.active ? '#b8adff' : C.textMid);
    ni.appendChild(niLabel);
    navSection1.appendChild(ni);
  }

  // Divider
  const sbDiv = divider(194, C.borderFaint);

  const navSection2 = autoFrame('V', 1, 4, 8, 4, 8, null, 0);
  navSection2.layoutSizingHorizontal = 'FILL';
  navSection2.layoutSizingVertical = 'HUG';

  for (const label of ['Integrations', 'Settings']) {
    const ni = autoFrame('H', 8, 8, 10, 8, 10, null, 8, { counter: 'CENTER' });
    ni.layoutSizingHorizontal = 'FILL';
    ni.layoutSizingVertical = 'HUG';
    const dot = rect(4, 4, C.textLo, 2, 0.5);
    ni.appendChild(dot);
    const niLabel = await txt(label, 'Manrope', 12.5, 'Regular', C.textMid);
    ni.appendChild(niLabel);
    navSection2.appendChild(ni);
  }

  const navWrap = autoFrame('V', 6, 4, 8, 4, 8, null, 0);
  navWrap.layoutSizingHorizontal = 'FILL';
  navWrap.layoutSizingVertical = 'HUG';
  navWrap.appendChild(navSection1);
  navWrap.appendChild(sbDiv);
  navWrap.appendChild(navSection2);
  sb.appendChild(navWrap);

  // ── Spacer ──
  const spacer = frame(1, 1, null, 0);
  spacer.layoutSizingVertical = 'FILL';
  spacer.layoutSizingHorizontal = 'FIXED';
  sb.appendChild(spacer);

  // ── Upgrade card ──
  const upg = autoFrame('V', 0, 12, 12, 12, 12, C.bgInset, 10, {
    stroke: C.borderFaint, strokeW: 1
  });
  upg.layoutSizingHorizontal = 'FILL';
  upg.layoutSizingVertical = 'HUG';

  const upgTitle = await txt('Upgrade to Pro!', 'Inter', 11, 'Bold', C.textHi);
  const upgDesc = await txt('Unlock Premium Features and Manage Unlimited projects', 'Manrope', 10, 'Regular', C.textMid);
  upgDesc.layoutSizingHorizontal = 'FILL';

  const upgBtn = autoFrame('H', 0, 7, 0, 7, 0, null, 7, { primary: 'CENTER', counter: 'CENTER' });
  upgBtn.layoutSizingHorizontal = 'FILL';
  upgBtn.layoutSizingVertical = 'HUG';
  upgBtn.fills = [gradientFill('#7060f0', '#4a84f4', 90)];
  const upgBtnTxt = await txt('Upgrade Now', 'Inter', 11, 'SemiBold', '#ffffff');
  upgBtn.appendChild(upgBtnTxt);

  upg.appendChild(upgTitle);
  upg.appendChild(upgDesc);
  upg.appendChild(upgBtn);

  const upgWrap = autoFrame('H', 0, 0, 10, 10, 10, null, 0);
  upgWrap.layoutSizingHorizontal = 'FILL';
  upgWrap.layoutSizingVertical = 'HUG';
  upgWrap.appendChild(upg);
  sb.appendChild(upgWrap);

  // ── User row ──
  const usr = autoFrame('H', 8, 10, 12, 10, 12, null, 0, { counter: 'CENTER' });
  usr.layoutSizingHorizontal = 'FILL';
  usr.layoutSizingVertical = 'HUG';
  usr.strokes = [{ type: 'SOLID', color: hex(C.borderFaint), opacity: 1 }];
  usr.strokeWeight = 1;
  usr.strokeAlign = 'INSIDE';
  // only top border
  usr.strokeTopWeight = 1;
  usr.strokeBottomWeight = 0;
  usr.strokeLeftWeight = 0;
  usr.strokeRightWeight = 0;

  const usrAv = avatar(27, 'E', 14);
  usrAv.layoutSizingHorizontal = 'FIXED';
  usrAv.layoutSizingVertical = 'FIXED';
  usr.appendChild(usrAv);

  const usrInfo = autoFrame('V', 1, 0, 0, 0, 0, null, 0);
  usrInfo.layoutSizingHorizontal = 'FILL';
  usrInfo.layoutSizingVertical = 'HUG';
  const usrName = await txt('Edwin T.', 'Manrope', 12, 'SemiBold', C.textHi);
  const usrEmail = await txt('Edwin.admin@dev.com', 'Manrope', 10, 'Regular', C.textLo);
  usrInfo.appendChild(usrName);
  usrInfo.appendChild(usrEmail);
  usr.appendChild(usrInfo);

  sb.appendChild(usr);

  return sb;
}

// ── Topbar ────────────────────────────────────────────────────────
async function buildTopbar(w) {
  const tb = autoFrame('H', 10, 10, 16, 10, 16, C.bgMain, 12, {
    stroke: C.borderFaint, strokeW: 1, counter: 'CENTER'
  });
  tb.layoutSizingHorizontal = 'FILL';
  tb.layoutSizingVertical = 'HUG';

  // Expand button
  const exp = frame(25, 25, C.bgInset, 6, {
    stroke: C.textLo, strokeOpacity: 0.25
  });
  exp.layoutSizingHorizontal = 'FIXED';
  exp.layoutSizingVertical = 'FIXED';

  const title = await txt('Reports & Analytics', 'Inter', 18, 'Bold', C.textHi);
  title.layoutSizingHorizontal = 'FILL';

  // Action buttons
  const actions = autoFrame('H', 6, 0, 0, 0, 0, null, 0, { counter: 'CENTER' });
  actions.layoutSizingHorizontal = 'HUG';
  actions.layoutSizingVertical = 'HUG';

  const btnData = [
    { active: false },
    { active: false },
    { active: true },
  ];
  for (const btn of btnData) {
    const b = frame(30, 30, btn.active ? C.purple : C.bgInset, 8, {
      stroke: btn.active ? C.purple : C.textLo,
      strokeOpacity: 0.3
    });
    b.layoutSizingHorizontal = 'FIXED';
    b.layoutSizingVertical = 'FIXED';
    const dot = rect(6, 6, btn.active ? '#ffffff' : C.textMid, 3);
    dot.x = 12; dot.y = 12;
    b.appendChild(dot);
    actions.appendChild(b);
  }

  tb.appendChild(exp);
  tb.appendChild(title);
  tb.appendChild(actions);
  return tb;
}

// ── Stat cell ─────────────────────────────────────────────────────
async function buildStatCell(label, value, badgeLabel, badgeType) {
  const cell = autoFrame('H', 9, 10, 12, 10, 12, null, 0, { counter: 'CENTER' });
  cell.layoutSizingVertical = 'HUG';
  cell.layoutSizingHorizontal = 'FILL';

  const ico = frame(32, 32, C.bgInset, 7, {
    stroke: C.borderCard, strokeOpacity: 0.3
  });
  ico.layoutSizingHorizontal = 'FIXED';
  ico.layoutSizingVertical = 'FIXED';
  const dot = rect(8, 8, C.textLo, 2);
  dot.x = 12; dot.y = 12;
  ico.appendChild(dot);

  const info = autoFrame('V', 3, 0, 0, 0, 0, null, 0);
  info.layoutSizingHorizontal = 'FILL';
  info.layoutSizingVertical = 'HUG';

  const lbl = await txt(label, 'Manrope', 16, 'Regular', C.textLo);
  const valRow = autoFrame('H', 5, 0, 0, 0, 0, null, 0, { counter: 'CENTER' });
  valRow.layoutSizingHorizontal = 'HUG';
  valRow.layoutSizingVertical = 'HUG';

  const val = await txt(value, 'Manrope', 16, 'Bold', C.textHi);
  valRow.appendChild(val);

  if (badgeLabel) {
    let bgCol, txtCol, bgOp;
    if (badgeType === 'green') { bgCol = C.green; txtCol = C.green; bgOp = 0.15; }
    else if (badgeType === 'red') { bgCol = C.red; txtCol = C.red; bgOp = 0.15; }
    else { bgCol = C.blue; txtCol = C.blue; bgOp = 0.15; }

    const bdg = await badge(badgeLabel, bgCol, txtCol, bgOp);
    valRow.appendChild(bdg);
  }

  info.appendChild(lbl);
  info.appendChild(valRow);
  cell.appendChild(ico);
  cell.appendChild(info);
  return cell;
}

// ── Revenue card ──────────────────────────────────────────────────
async function buildRevenueCard(w) {
  const card = frame(w, 330, C.bgCardOuter, 12, {
    stroke: C.borderCard, strokeW: 1
  });

  // Tab header
  const head = autoFrame('H', 0, 0, 7, 12, 3, null, 0, { counter: 'CENTER', primary: 'SPACE_BETWEEN' });
  head.layoutSizingHorizontal = 'FILL';
  head.layoutSizingVertical = 'HUG';
  head.y = 0;
  head.x = 0;

  const headTitle = await txt("Retained Users' Revenue", 'Inter', 18, 'SemiBold', C.textHi);
  const pill = autoFrame('H', 5, 5, 10, 5, 10, C.bgInset, 6, {
    stroke: C.borderCard, strokeOpacity: 0.4, counter: 'CENTER'
  });
  pill.layoutSizingHorizontal = 'HUG';
  pill.layoutSizingVertical = 'HUG';
  const pillTxt = await txt('Last Month', 'Manrope', 11, 'Regular', C.textMid);
  pill.appendChild(pillTxt);
  head.appendChild(headTitle);
  head.appendChild(pill);

  // Inner body panel
  const body = frame(w - 14, 267, C.bgCardInner, 10, {
    stroke: C.borderInner, strokeW: 1,
    effects: [innerShadow('#000000', 0.4, 0, 1, 3)]
  });
  body.x = 7;
  body.y = 46;

  // Stats row
  const statsRow = autoFrame('H', 0, 10, 0, 10, 0, null, 0, { counter: 'CENTER' });
  statsRow.resize(w - 14, 60);
  statsRow.x = 0; statsRow.y = 0;
  statsRow.layoutSizingHorizontal = 'FILL';

  const statData = [
    { label: 'Total Revenue', val: '$96,000.00', badge: '+5%', type: 'green' },
    { label: 'Total Clicks',  val: '$24,000.00', badge: '-3%', type: 'red' },
    { label: 'Total Payouts', val: '$14,000.00', badge: null,  type: null },
  ];

  for (let i = 0; i < statData.length; i++) {
    const sd = statData[i];
    const cell = await buildStatCell(sd.label, sd.val, sd.badge, sd.type);
    cell.layoutSizingHorizontal = 'FILL';
    statsRow.appendChild(cell);
    // Right border divider between cells
    if (i < statData.length - 1) {
      const sep = frame(1, 44, C.borderInner, 0);
      sep.layoutSizingVertical = 'FILL';
      sep.layoutSizingHorizontal = 'FIXED';
      statsRow.appendChild(sep);
    }
  }
  body.appendChild(statsRow);

  // Divider
  const div = rect(body.width - 24, 1, C.borderInner);
  div.x = 12; div.y = 60;
  body.appendChild(div);

  // Chart area placeholder
  const chartArea = frame(body.width - 24, 160, null, 0);
  chartArea.x = 12; chartArea.y = 74;
  chartArea.fills = [];

  // Draw a simple line chart representation
  const chartBg = rect(body.width - 24, 150, C.bgInset, 4, 0.3);
  chartArea.appendChild(chartBg);

  // Revenue line (purple)
  const revPoints = [10200,11800,9400,10800,13200,14800,12600,11200,12832,13800,12900,15200];
  const cw = chartArea.width;
  const ch = 150;
  const minV = 0; const maxV = 20000;
  const pointCount = revPoints.length;

  // Purple area fill
  const purpleFill = rect(cw, Math.round(((maxV - 9000) / maxV) * ch * 0.9), C.purple, 0, 0.15);
  purpleFill.x = 0; purpleFill.y = 20;
  chartArea.appendChild(purpleFill);

  // Simple line segments for revenue
  for (let i = 0; i < pointCount - 1; i++) {
    const x1 = Math.round((i / (pointCount - 1)) * cw);
    const y1 = Math.round(ch - ((revPoints[i] - minV) / (maxV - minV)) * ch * 0.85) - 10;
    const x2 = Math.round(((i + 1) / (pointCount - 1)) * cw);
    const y2 = Math.round(ch - ((revPoints[i + 1] - minV) / (maxV - minV)) * ch * 0.85) - 10;
    const segW = Math.max(1, Math.abs(x2 - x1));
    const segH = Math.max(1, Math.abs(y2 - y1));
    const seg = rect(segW, 2, C.purple, 1, 0.9);
    seg.x = x1;
    seg.y = Math.min(y1, y2);
    chartArea.appendChild(seg);
  }

  // Target dashed line (blue) — simplified as low-opacity rectangle
  const tgtLine = rect(cw, 1, C.blue, 0, 0.4);
  tgtLine.x = 0;
  tgtLine.y = Math.round(ch - (10100 / maxV) * ch * 0.85) - 10;
  chartArea.appendChild(tgtLine);

  // Sep 2024 highlight dot
  const dotX = Math.round((8 / (pointCount - 1)) * cw);
  const dotY = Math.round(ch - ((12832 - minV) / (maxV - minV)) * ch * 0.85) - 10;
  const highlightDot = rect(10, 10, C.purple, 5);
  highlightDot.x = dotX - 5; highlightDot.y = dotY - 5;
  highlightDot.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.8 }];
  highlightDot.strokeWeight = 1.5;
  highlightDot.strokeAlign = 'OUTSIDE';
  chartArea.appendChild(highlightDot);

  // Tooltip box near Sep dot
  const tooltip = frame(110, 55, '#131d30', 8, {
    stroke: C.borderInner, strokeW: 1
  });
  tooltip.x = dotX - 10;
  tooltip.y = dotY - 65;
  const ttDate = await txt('Sep 2024', 'Manrope', 10, 'Regular', C.textMid);
  ttDate.x = 10; ttDate.y = 8;
  const ttRev = await txt('● Revenue: $12,832', 'Manrope', 10, 'Regular', C.textHi);
  ttRev.x = 10; ttRev.y = 22;
  const ttTgt = await txt('● Target: $10,100', 'Manrope', 10, 'Regular', C.blue);
  ttTgt.x = 10; ttTgt.y = 36;
  tooltip.appendChild(ttDate);
  tooltip.appendChild(ttRev);
  tooltip.appendChild(ttTgt);
  chartArea.appendChild(tooltip);

  body.appendChild(chartArea);
  card.appendChild(head);
  card.appendChild(body);
  return card;
}

// ── Retention card ────────────────────────────────────────────────
async function buildRetentionCard(w) {
  const card = frame(w, 330, C.bgCardOuter, 12, {
    stroke: C.borderCard, strokeW: 1
  });

  const titleTxt = await txt('Retention Performance Breakdown', 'Inter', 18, 'SemiBold', C.textHi);
  titleTxt.x = 3; titleTxt.y = 0;

  const body = frame(w - 14, 284, C.bgCardInner, 10, {
    stroke: C.borderInner, strokeW: 1,
    effects: [innerShadow('#000000', 0.4, 0, 1, 3)]
  });
  body.x = 7; body.y = 34;

  // Legend
  const legendData = [
    { label: 'Returning Users', val: '900.00', color: C.purple },
    { label: 'Dropped Users',   val: '600.00', color: C.slate },
    { label: 'High-LTV Users',  val: '200.00', color: C.blue },
  ];

  const legend = autoFrame('V', 8, 12, 12, 12, 12, null, 0);
  legend.layoutSizingHorizontal = 'FILL';
  legend.layoutSizingVertical = 'HUG';

  for (const item of legendData) {
    const row = autoFrame('H', 5, 0, 0, 0, 0, null, 0, { counter: 'CENTER' });
    row.layoutSizingHorizontal = 'HUG';
    row.layoutSizingVertical = 'HUG';

    const dot = rect(7, 7, item.color, 2);
    dot.layoutSizingHorizontal = 'FIXED';
    dot.layoutSizingVertical = 'FIXED';
    row.appendChild(dot);

    const rowLabel = await txt(item.label, 'Manrope', 16, 'Regular', C.textMid);
    row.appendChild(rowLabel);

    const rowVal = await txt(item.val, 'Manrope', 16, 'Bold', C.textHi);
    row.appendChild(rowVal);

    legend.appendChild(row);
  }
  body.appendChild(legend);

  // Gauge semicircle (doughnut half) — represented as a layered arc shape
  // We'll approximate it with concentric partial rectangles
  const gaugeArea = frame(body.width - 24, 150, null, 0);
  gaugeArea.x = 12; gaugeArea.y = 120;
  gaugeArea.fills = [];

  const gw = gaugeArea.width;
  // Outer arc segments as colored rectangles approximating a half-doughnut
  const segColors = [C.purple, C.slate, C.blue, C.borderFaint];
  const segWidths = [
    Math.round(gw * 0.5),
    Math.round(gw * 0.33),
    Math.round(gw * 0.11),
    Math.round(gw * 0.06),
  ];

  let xOff = 0;
  for (let i = 0; i < segColors.length; i++) {
    const seg = rect(segWidths[i], 18, segColors[i], 3, i === 3 ? 0.25 : 0.85);
    seg.x = xOff; seg.y = 0;
    gaugeArea.appendChild(seg);
    xOff += segWidths[i] + 2;
  }

  // Centered labels
  const progLabel = await txt('Performance\nProgress', 'Manrope', 16, 'Regular', C.textLo);
  progLabel.textAlignHorizontal = 'CENTER';
  progLabel.x = Math.round(gw / 2) - 50; progLabel.y = 30;

  const numLabel = await txt('1,800', 'Manrope', 22, 'ExtraBold', C.textHi);
  numLabel.x = Math.round(gw / 2) - 22; numLabel.y = 70;

  gaugeArea.appendChild(progLabel);
  gaugeArea.appendChild(numLabel);

  const footTxt = await txt('Your weekly campaign limit is 20.', 'Manrope', 16, 'Regular', C.textLo);
  footTxt.textAlignHorizontal = 'CENTER';
  footTxt.x = 0; footTxt.y = 130;

  gaugeArea.appendChild(footTxt);
  body.appendChild(gaugeArea);
  card.appendChild(titleTxt);
  card.appendChild(body);
  return card;
}

// ── Reports table card ────────────────────────────────────────────
async function buildReportsCard(w) {
  const card = frame(w, 240, C.bgCardOuter, 12, {
    stroke: C.borderCard, strokeW: 1
  });

  // Toolbar (acts as dark tab header)
  const toolbar = autoFrame('H', 8, 0, 7, 12, 3, null, 0, { counter: 'CENTER' });
  toolbar.layoutSizingHorizontal = 'FILL';
  toolbar.layoutSizingVertical = 'HUG';

  // Search box
  const srch = autoFrame('H', 7, 6, 11, 6, 11, C.bgInset, 7, {
    stroke: C.textLo, strokeOpacity: 0.2, counter: 'CENTER'
  });
  srch.resize(165, 30);
  const srchTxt = await txt('Search', 'Manrope', 11.5, 'Regular', C.textLo);
  srch.appendChild(srchTxt);

  // Sort button
  const sortBtn = autoFrame('H', 5, 6, 11, 6, 11, C.bgInset, 7, {
    stroke: C.textLo, strokeOpacity: 0.2, counter: 'CENTER'
  });
  sortBtn.layoutSizingHorizontal = 'HUG';
  sortBtn.layoutSizingVertical = 'HUG';
  const sortTxt = await txt('Sort by', 'Manrope', 11.5, 'Regular', C.textMid);
  sortBtn.appendChild(sortTxt);

  // Export button
  const expBtn = autoFrame('H', 6, 6, 13, 6, 13, null, 7, {
    stroke: C.blue, strokeOpacity: 0.45, counter: 'CENTER'
  });
  expBtn.fills = [];
  expBtn.layoutSizingHorizontal = 'HUG';
  expBtn.layoutSizingVertical = 'HUG';
  const expTxt = await txt('Export CSV', 'Manrope', 11.5, 'Medium', C.blue);
  expBtn.appendChild(expTxt);

  // Spacer between sort and export
  const spacer = frame(1, 1, null, 0);
  spacer.layoutSizingHorizontal = 'FILL';

  toolbar.appendChild(srch);
  toolbar.appendChild(sortBtn);
  toolbar.appendChild(spacer);
  toolbar.appendChild(expBtn);
  toolbar.x = 0; toolbar.y = 0;

  // Manually place toolbar
  const toolbarFixed = autoFrame('H', 8, 0, 7, 12, 3, null, 0, { counter: 'CENTER' });
  toolbarFixed.resize(w, 42);
  toolbarFixed.fills = [];
  srch.y = 6; srch.x = 3;

  card.appendChild(toolbar);

  // Inner body
  const body = frame(w - 14, 182, C.bgCardInner, 10, {
    stroke: C.borderInner, strokeW: 1,
    effects: [innerShadow('#000000', 0.4, 0, 1, 3)]
  });
  body.x = 7; body.y = 46;

  // Table headers
  const headers = ['Report Name', 'Last Run', 'Filters Applied', 'Format', 'Actions'];
  const colWidths = [120, 90, 110, 70, 60];
  const thRow = frame(body.width, 32, null, 0);
  thRow.fills = [];
  let cx = 10;
  for (let i = 0; i < headers.length; i++) {
    const th = await txt(headers[i], 'Manrope', 16, 'SemiBold', C.textLo);
    th.textCase = 'UPPER';
    th.letterSpacing = { value: 0.5, unit: 'PIXELS' };
    th.x = cx; th.y = 8;
    thRow.appendChild(th);
    cx += colWidths[i];
  }
  const thDivider = rect(body.width - 20, 1, C.borderInner);
  thDivider.x = 10; thDivider.y = 31;
  body.appendChild(thRow);
  body.appendChild(thDivider);

  // Table rows
  const rows = [
    { name: 'LTV by Country', sub: 'Last 30d', date: 'July 1, 2025', filters: 'Geo: All, Metric…', fmt: 'PDF/CSV' },
    { name: 'LTV by Country', sub: 'Last 30d', date: 'July 1, 2025', filters: 'Geo: All, Metric…', fmt: 'PDF/CSV' },
    { name: 'Retention Cohort', sub: 'Last 7d', date: 'June 28, 2025', filters: 'Platform: iOS, An…', fmt: 'PDF/CSV' },
  ];

  for (let ri = 0; ri < rows.length; ri++) {
    const row = rows[ri];
    const rowY = 42 + ri * 44;
    let rcx = 10;

    const nameCol = autoFrame('V', 2, 0, 0, 0, 0, null, 0);
    nameCol.x = rcx; nameCol.y = rowY;
    const rn = await txt(row.name, 'Manrope', 16, 'SemiBold', C.textHi);
    const rs = await txt(row.sub, 'Manrope', 16, 'Regular', C.textLo);
    nameCol.appendChild(rn);
    nameCol.appendChild(rs);
    nameCol.layoutSizingHorizontal = 'HUG';
    nameCol.layoutSizingVertical = 'HUG';
    body.appendChild(nameCol);
    rcx += colWidths[0];

    const dateTxt = await txt(row.date, 'Manrope', 16, 'Regular', C.textMid);
    dateTxt.x = rcx; dateTxt.y = rowY + 8;
    body.appendChild(dateTxt);
    rcx += colWidths[1];

    const filtTxt = await txt(row.filters, 'Manrope', 16, 'Regular', C.textLo);
    filtTxt.x = rcx; filtTxt.y = rowY + 8;
    body.appendChild(filtTxt);
    rcx += colWidths[2];

    const fmtBadge = autoFrame('H', 0, 3, 7, 3, 7, C.blue, 4, {
      stroke: C.blue, strokeOpacity: 0.2
    });
    fmtBadge.fills = [{ type: 'SOLID', color: hex(C.blue), opacity: 0.1 }];
    fmtBadge.x = rcx; fmtBadge.y = rowY + 5;
    fmtBadge.layoutSizingHorizontal = 'HUG';
    fmtBadge.layoutSizingVertical = 'HUG';
    const fmtTxt = await txt(row.fmt, 'Inter', 10, 'SemiBold', C.blue);
    fmtBadge.appendChild(fmtTxt);
    body.appendChild(fmtBadge);
    rcx += colWidths[3];

    // Dots menu
    const dmenu = frame(26, 26, null, 6, {
      stroke: C.textLo, strokeOpacity: 0.25
    });
    dmenu.fills = [];
    dmenu.x = rcx; dmenu.y = rowY + 5;
    const dmDot = rect(3, 14, C.textLo, 1, 0.6);
    dmDot.x = 11; dmDot.y = 6;
    dmenu.appendChild(dmDot);
    body.appendChild(dmenu);

    if (ri < rows.length - 1) {
      const rowDiv = rect(body.width - 20, 1, C.borderInner, 0, 0.5);
      rowDiv.x = 10; rowDiv.y = rowY + 40;
      body.appendChild(rowDiv);
    }
  }

  card.appendChild(body);
  return card;
}

// ── Metric card ───────────────────────────────────────────────────
async function buildMetricCard(w, h, label, value, badgeLabel, badgeType, sparkColor) {
  const card = frame(w, h, C.bgCardOuter, 12, {
    stroke: C.borderCard, strokeW: 1
  });

  // Tab header
  const top = autoFrame('H', 0, 0, 7, 0, 3, null, 0, {
    counter: 'MIN', primary: 'SPACE_BETWEEN'
  });
  top.resize(w, 34);
  top.fills = [];
  const mcLbl = await txt(label, 'Inter', 18, 'SemiBold', C.textMid);
  mcLbl.x = 3; mcLbl.y = 0;
  const mcIco = frame(28, 28, C.bgInset, 7, { stroke: C.textLo, strokeOpacity: 0.25 });
  mcIco.x = w - 35; mcIco.y = 0;
  const icoDot = rect(6, 6, C.textLo, 2);
  icoDot.x = 11; icoDot.y = 11;
  mcIco.appendChild(icoDot);
  card.appendChild(mcLbl);
  card.appendChild(mcIco);

  // Inner body
  const body = frame(w - 14, h - 48, C.bgCardInner, 10, {
    stroke: C.borderInner, strokeW: 1,
    effects: [innerShadow('#000000', 0.4, 0, 1, 3)]
  });
  body.x = 7; body.y = 41;

  // Value row
  const valRow = autoFrame('H', 7, 12, 0, 0, 12, null, 0, { counter: 'CENTER' });
  valRow.layoutSizingHorizontal = 'FILL';
  valRow.layoutSizingVertical = 'HUG';

  const valTxt = await txt(value, 'Manrope', 22, 'ExtraBold', C.textHi);
  valRow.appendChild(valTxt);

  let bgCol, txtCol, bgOp;
  if (badgeType === 'green') { bgCol = C.green; txtCol = C.green; bgOp = 0.15; }
  else { bgCol = C.red; txtCol = C.red; bgOp = 0.15; }
  const valBdg = await badge(badgeLabel, bgCol, txtCol, bgOp);
  valRow.appendChild(valBdg);
  body.appendChild(valRow);

  // Sparkline
  const spark = sparkline(body.width - 24, 30, sparkColor);
  spark.x = 12; spark.y = 50;
  body.appendChild(spark);

  // Footer
  const footer = autoFrame('H', 4, 8, 0, 8, 0, null, 0, { counter: 'CENTER', primary: 'SPACE_BETWEEN' });
  footer.resize(body.width, 26);
  footer.fills = [];
  footer.x = 0; footer.y = body.height - 34;

  const trendRow = autoFrame('H', 4, 0, 0, 0, 12, null, 0, { counter: 'CENTER' });
  trendRow.layoutSizingHorizontal = 'HUG';
  trendRow.layoutSizingVertical = 'HUG';
  const trendIco = rect(6, 6, C.green, 1);
  trendIco.layoutSizingHorizontal = 'FIXED';
  trendIco.layoutSizingVertical = 'FIXED';
  const trendStrong = await txt('+5%', 'Manrope', 16, 'Bold', C.green);
  const trendFrom = await txt('From last month', 'Manrope', 16, 'Regular', C.textLo);
  trendRow.appendChild(trendIco);
  trendRow.appendChild(trendStrong);
  trendRow.appendChild(trendFrom);
  footer.appendChild(trendRow);

  const arr = frame(26, 26, C.bgInset, 7, { stroke: C.textLo, strokeOpacity: 0.25 });
  const arrDot = rect(6, 6, C.textMid, 1);
  arrDot.x = 10; arrDot.y = 10;
  arr.appendChild(arrDot);
  arr.x = body.width - 34; arr.y = 0;
  footer.appendChild(arr);

  body.appendChild(footer);
  card.appendChild(body);
  return card;
}

// ── Main builder ──────────────────────────────────────────────────
async function buildDashboard() {
  await loadFonts();

  figma.ui.postMessage({ type: 'progress', message: 'Loading fonts…' });

  // Root frame — the dark base
  const root = frame(1440, 900, C.bgBase, 0);
  root.name = 'Adnova – Reports & Analytics';

  // Shell (inner padding 6px, gap 6px)
  const shell = frame(1440 - 0, 900 - 0, C.bgBase, 0);
  shell.x = 0; shell.y = 0;
  root.appendChild(shell);

  figma.ui.postMessage({ type: 'progress', message: 'Building sidebar…' });

  // ── SIDEBAR ──
  const sb = await buildSidebar();
  sb.x = 6; sb.y = 6;
  sb.resize(210, 900 - 12);
  shell.appendChild(sb);

  // ── MAIN COLUMN (x = 6+210+6 = 222) ──
  const mainX = 6 + 210 + 6;
  const mainW = 1440 - mainX - 6;
  const mainH = 900 - 12;

  figma.ui.postMessage({ type: 'progress', message: 'Building topbar…' });

  // Topbar
  const tb = await buildTopbar(mainW);
  tb.x = mainX; tb.y = 6;
  shell.appendChild(tb);

  // Content panel (y = 6 + ~54 + 6 = 66)
  const contentY = 6 + 54 + 6;
  const contentH = mainH - 54 - 6;
  const content = frame(mainW, contentH, C.bgMain, 12, {
    stroke: C.borderFaint, strokeW: 1
  });
  content.x = mainX; content.y = contentY;
  shell.appendChild(content);

  figma.ui.postMessage({ type: 'progress', message: 'Building revenue card…' });

  // Grid inside content: padding 14 7 7 7
  // Left col width = mainW - 296 - 12 - 14 = mainW - 322
  const gridPadL = 7; const gridPadT = 14;
  const gridGap = 12;
  const rightColW = 296;
  const leftColW = mainW - rightColW - gridGap - gridPadL * 2;

  // ── Revenue card ──
  const revCard = await buildRevenueCard(leftColW);
  revCard.name = "Retained Users' Revenue";
  revCard.x = gridPadL; revCard.y = gridPadT;
  content.appendChild(revCard);

  figma.ui.postMessage({ type: 'progress', message: 'Building retention card…' });

  // ── Retention card ──
  const retCard = await buildRetentionCard(rightColW);
  retCard.name = 'Retention Performance Breakdown';
  retCard.x = gridPadL + leftColW + gridGap; retCard.y = gridPadT;
  content.appendChild(retCard);

  figma.ui.postMessage({ type: 'progress', message: 'Building reports table…' });

  // ── Reports table ──
  const repH = contentH - revCard.height - gridPadT - gridGap - 7;
  const repCard = await buildReportsCard(leftColW);
  repCard.name = 'Reports Table';
  repCard.x = gridPadL; repCard.y = gridPadT + revCard.height + gridGap;
  content.appendChild(repCard);

  figma.ui.postMessage({ type: 'progress', message: 'Building metric cards…' });

  // ── Metric cards (right lower) ──
  const mCardH = Math.floor((repCard.height - gridGap) / 2);
  const mc1 = await buildMetricCard(rightColW, mCardH, 'Cost per Retained User', '$62,302', '-15%', 'red', C.green);
  mc1.name = 'Cost per Retained User';
  mc1.x = gridPadL + leftColW + gridGap; mc1.y = gridPadT + retCard.height + gridGap;
  content.appendChild(mc1);

  const mc2 = await buildMetricCard(rightColW, mCardH, 'D7 Retention Rate', '$62,302', '+5%', 'green', C.blue);
  mc2.name = 'D7 Retention Rate';
  mc2.x = gridPadL + leftColW + gridGap; mc2.y = gridPadT + retCard.height + gridGap + mCardH + gridGap;
  content.appendChild(mc2);

  // Place root on canvas
  figma.currentPage.appendChild(root);
  figma.viewport.scrollAndZoomIntoView([root]);

  figma.ui.postMessage({ type: 'done' });
}

// ─── Message handler ──────────────────────────────────────────────
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'generate') {
    try {
      await buildDashboard();
    } catch (err) {
      figma.ui.postMessage({ type: 'error', message: String(err) });
    }
  } else if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};
