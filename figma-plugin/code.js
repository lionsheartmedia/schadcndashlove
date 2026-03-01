// ═══════════════════════════════════════════════════════════════════
//  ADNOVA DASHBOARD — Figma Plugin  (code.js)
//  Recreates the full Reports & Analytics dashboard with exact
//  colors, borders, border-radii, shadows, and folder-tab card depth.
//  v5 — no layoutSizing calls, all explicit resize() dimensions
// ═══════════════════════════════════════════════════════════════════

figma.showUI(__html__, { width: 320, height: 480 });

// ─── Color helpers ────────────────────────────────────────────────
function hex(h) {
  h = h.replace('#', '');
  if (h.length === 3) { h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2]; }
  var n = parseInt(h, 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

// ─── Palette ──────────────────────────────────────────────────────
var C = {
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

// ─── Font loader ──────────────────────────────────────────────────
async function loadFonts() {
  var fonts = [
    { family: 'Inter', style: 'Regular' },
    { family: 'Inter', style: 'Medium' },
    { family: 'Inter', style: 'Bold' },
  ];
  for (var i = 0; i < fonts.length; i++) {
    await figma.loadFontAsync(fonts[i]);
  }
}

// ─── Fill / stroke helpers ────────────────────────────────────────
function solidFill(colorHex, opacity) {
  if (opacity === undefined) { opacity = 1; }
  return [{ type: 'SOLID', color: hex(colorHex), opacity: opacity }];
}

function solidStroke(colorHex, weight, opacity) {
  if (weight === undefined) { weight = 1; }
  if (opacity === undefined) { opacity = 1; }
  return {
    strokes: [{ type: 'SOLID', color: hex(colorHex), opacity: opacity }],
    strokeWeight: weight,
    strokeAlign: 'INSIDE'
  };
}

function applyStroke(node, colorHex, weight, opacity) {
  var s = solidStroke(colorHex, weight, opacity);
  node.strokes = s.strokes;
  node.strokeWeight = s.strokeWeight;
  node.strokeAlign = s.strokeAlign;
}

// ─── Inner shadow ─────────────────────────────────────────────────
function innerShadow() {
  return {
    type: 'INNER_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.4 },
    offset: { x: 0, y: 1 },
    radius: 3,
    spread: 0,
    visible: true,
    blendMode: 'NORMAL'
  };
}

// ─── Gradient fill ────────────────────────────────────────────────
function gradFill(c1, c2) {
  // left-to-right (90 deg)
  return {
    type: 'GRADIENT_LINEAR',
    gradientStops: [
      { position: 0, color: { r: hex(c1).r, g: hex(c1).g, b: hex(c1).b, a: 1 } },
      { position: 1, color: { r: hex(c2).r, g: hex(c2).g, b: hex(c2).b, a: 1 } }
    ],
    gradientTransform: [[0, -1, 1], [1, 0, 0]]
  };
}

// ─── Create plain frame ───────────────────────────────────────────
function mkFrame(w, h, colorHex, radius, opts) {
  if (radius === undefined) { radius = 0; }
  if (opts === undefined) { opts = {}; }
  var f = figma.createFrame();
  f.resize(w, h);
  f.cornerRadius = radius;
  f.fills = colorHex ? solidFill(colorHex, opts.fillOpacity) : [];
  f.clipsContent = false;
  if (opts.stroke) { applyStroke(f, opts.stroke, opts.strokeW, opts.strokeOp); }
  if (opts.effects) { f.effects = opts.effects; }
  return f;
}

// ─── Create rectangle ─────────────────────────────────────────────
function mkRect(w, h, colorHex, radius, opacity) {
  if (radius === undefined) { radius = 0; }
  if (opacity === undefined) { opacity = 1; }
  var r = figma.createRectangle();
  r.resize(w, h);
  r.cornerRadius = radius;
  r.fills = colorHex ? solidFill(colorHex, opacity) : [];
  return r;
}

// ─── Create text ──────────────────────────────────────────────────
async function mkTxt(content, size, weight, colorHex, opts) {
  if (opts === undefined) { opts = {}; }
  var t = figma.createText();
  await figma.loadFontAsync({ family: 'Inter', style: weight });
  t.fontName = { family: 'Inter', style: weight };
  t.characters = content;
  t.fontSize = size;
  t.fills = solidFill(colorHex);
  if (opts.align) { t.textAlignHorizontal = opts.align; }
  if (opts.letterSpacing) { t.letterSpacing = { value: opts.letterSpacing, unit: 'PIXELS' }; }
  if (opts.textCase) { t.textCase = opts.textCase; }
  return t;
}

// ─── Badge ────────────────────────────────────────────────────────
async function mkBadge(label, bgHex, bgOp, txtHex) {
  var f = mkFrame(40, 16, bgHex, 4, { fillOpacity: bgOp });
  var t = await mkTxt(label, 9, 'Bold', txtHex);
  // center the text
  t.x = 4; t.y = 3;
  f.appendChild(t);
  // resize to fit
  f.resize(t.width + 10, 16);
  return f;
}

// ─── Divider ──────────────────────────────────────────────────────
function mkDivider(w, colorHex, opacity) {
  if (opacity === undefined) { opacity = 1; }
  return mkRect(w, 1, colorHex, 0, opacity);
}

// ─── Sparkline ────────────────────────────────────────────────────
function mkSparkline(w, h, colorHex) {
  var f = mkFrame(w, h, null, 0);
  var bars = [42, 36, 46, 31, 50, 43, 39, 54, 47, 53, 46, 61, 55, 59];
  var mx = 0;
  for (var i = 0; i < bars.length; i++) { if (bars[i] > mx) { mx = bars[i]; } }
  var bw = Math.floor(w / bars.length) - 1;
  for (var j = 0; j < bars.length; j++) {
    var bh = Math.max(2, Math.round((bars[j] / mx) * h));
    var b = mkRect(Math.max(1, bw), bh, colorHex, 1, 0.7);
    b.x = j * (bw + 1);
    b.y = h - bh;
    f.appendChild(b);
  }
  return f;
}

// ══════════════════════════════════════════════════════════════════
//  SIDEBAR  (210 × 888)
// ══════════════════════════════════════════════════════════════════
async function buildSidebar(h) {
  var sb = mkFrame(210, h, C.bgSidebar, 12, { stroke: C.borderFaint });

  // Logo
  var logoIcon = mkFrame(28, 28, null, 7);
  logoIcon.fills = [gradFill(C.purple, C.blue)];
  logoIcon.x = 14; logoIcon.y = 16;
  var logoTxt = await mkTxt('Adnova', 18, 'Bold', C.textHi);
  logoTxt.x = 51; logoTxt.y = 19;
  sb.appendChild(logoIcon);
  sb.appendChild(logoTxt);

  // Workspace badge
  var ws = mkFrame(190, 36, C.bgInset, 8, { stroke: C.borderFaint });
  ws.x = 10; ws.y = 56;
  var wsAv = mkFrame(22, 22, null, 5);
  wsAv.fills = [gradFill(C.purple, C.blue)];
  wsAv.x = 9; wsAv.y = 7;
  var wsName = await mkTxt('Marketing-bnks534', 11, 'Regular', C.textMid);
  wsName.x = 37; wsName.y = 11;
  ws.appendChild(wsAv);
  ws.appendChild(wsName);
  sb.appendChild(ws);

  // Nav items
  var navItems = [
    { label: 'Dashboard',           active: false },
    { label: 'Campaigns',           active: false },
    { label: 'User Quality',        active: false },
    { label: 'Reports & Analytics', active: true  },
    { label: 'AI Advisor',          active: false },
    { label: 'Prompt Builder',      active: false },
  ];
  var ny = 104;
  for (var i = 0; i < navItems.length; i++) {
    var item = navItems[i];
    var ni = mkFrame(194, 32, null, 8);
    if (item.active) {
      ni.fills = solidFill(C.purple, 0.12);
      applyStroke(ni, C.purple, 1, 0.18);
    }
    ni.x = 8; ni.y = ny;
    var dot = mkRect(5, 5, item.active ? C.purple : C.textLo, 2, item.active ? 1 : 0.5);
    dot.x = 10; dot.y = 13;
    var nlbl = await mkTxt(item.label, 12, 'Regular', item.active ? '#b8adff' : C.textMid);
    nlbl.x = 24; nlbl.y = 8;
    ni.appendChild(dot);
    ni.appendChild(nlbl);
    sb.appendChild(ni);
    ny += 34;
  }

  // Divider
  var sdiv = mkDivider(194, C.borderFaint);
  sdiv.x = 8; sdiv.y = ny + 4;
  sb.appendChild(sdiv);
  ny += 12;

  // Settings items
  var settingsItems = ['Integrations', 'Settings'];
  for (var s = 0; s < settingsItems.length; s++) {
    var si = mkFrame(194, 32, null, 8);
    si.x = 8; si.y = ny;
    var sdot = mkRect(5, 5, C.textLo, 2, 0.4);
    sdot.x = 10; sdot.y = 13;
    var slbl = await mkTxt(settingsItems[s], 12, 'Regular', C.textMid);
    slbl.x = 24; slbl.y = 8;
    si.appendChild(sdot);
    si.appendChild(slbl);
    sb.appendChild(si);
    ny += 34;
  }

  // Upgrade card
  var upg = mkFrame(190, 88, C.bgInset, 10, { stroke: C.borderFaint });
  upg.x = 10; upg.y = h - 170;
  var upgT = await mkTxt('Upgrade to Pro!', 11, 'Bold', C.textHi);
  upgT.x = 12; upgT.y = 10;
  var upgD = await mkTxt('Unlock Premium Features', 10, 'Regular', C.textMid);
  upgD.x = 12; upgD.y = 26;
  var upgBtn = mkFrame(166, 28, null, 7);
  upgBtn.fills = [gradFill(C.purple, C.blue)];
  upgBtn.x = 12; upgBtn.y = 52;
  var upgBtnTxt = await mkTxt('Upgrade Now', 11, 'Medium', '#ffffff');
  upgBtnTxt.x = 50; upgBtnTxt.y = 7;
  upgBtn.appendChild(upgBtnTxt);
  upg.appendChild(upgT);
  upg.appendChild(upgD);
  upg.appendChild(upgBtn);
  sb.appendChild(upg);

  // User row
  var usr = mkFrame(210, 50, null, 0);
  usr.x = 0; usr.y = h - 50;
  applyStroke(usr, C.borderFaint, 1, 1);
  usr.strokeTopWeight = 1;
  usr.strokeBottomWeight = 0;
  usr.strokeLeftWeight = 0;
  usr.strokeRightWeight = 0;
  var usrAv = mkFrame(27, 27, null, 14);
  usrAv.fills = [gradFill(C.blue, C.purple)];
  usrAv.x = 12; usrAv.y = 11;
  var usrName = await mkTxt('Edwin T.', 12, 'Medium', C.textHi);
  usrName.x = 46; usrName.y = 10;
  var usrEmail = await mkTxt('Edwin.admin@dev.com', 10, 'Regular', C.textLo);
  usrEmail.x = 46; usrEmail.y = 26;
  usr.appendChild(usrAv);
  usr.appendChild(usrName);
  usr.appendChild(usrEmail);
  sb.appendChild(usr);

  return sb;
}

// ══════════════════════════════════════════════════════════════════
//  TOPBAR
// ══════════════════════════════════════════════════════════════════
async function buildTopbar(w) {
  var tb = mkFrame(w, 50, C.bgMain, 12, { stroke: C.borderFaint });

  var expBtn = mkFrame(25, 25, C.bgInset, 6, { stroke: C.textLo, strokeOp: 0.25 });
  expBtn.x = 14; expBtn.y = 12;

  var title = await mkTxt('Reports & Analytics', 18, 'Bold', C.textHi);
  title.x = 48; title.y = 14;

  // Action buttons
  var btnX = w - 14 - 30;
  var btns = [false, false, true];
  for (var i = 0; i < btns.length; i++) {
    var active = btns[i];
    var b = mkFrame(30, 30, active ? C.purple : C.bgInset, 8, {
      stroke: active ? C.purple : C.textLo, strokeOp: 0.3
    });
    b.x = btnX; b.y = 10;
    var dot = mkRect(6, 6, active ? '#ffffff' : C.textMid, 3);
    dot.x = 12; dot.y = 12;
    b.appendChild(dot);
    tb.appendChild(b);
    btnX -= 36;
  }

  tb.appendChild(expBtn);
  tb.appendChild(title);
  return tb;
}

// ══════════════════════════════════════════════════════════════════
//  REVENUE CARD
// ══════════════════════════════════════════════════════════════════
async function buildRevenueCard(w) {
  var card = mkFrame(w, 330, C.bgCardOuter, 12, { stroke: C.borderCard });

  // Tab header
  var headTxt = await mkTxt("Retained Users' Revenue", 18, 'Medium', C.textHi);
  headTxt.x = 3; headTxt.y = 0;

  var pill = mkFrame(96, 26, C.bgInset, 6, { stroke: C.borderCard, strokeOp: 0.4 });
  pill.x = w - 103; pill.y = 0;
  var pillTxt = await mkTxt('Last Month', 11, 'Regular', C.textMid);
  pillTxt.x = 10; pillTxt.y = 6;
  pill.appendChild(pillTxt);

  card.appendChild(headTxt);
  card.appendChild(pill);

  // Inner body
  var bodyW = w - 8;
  var body = mkFrame(bodyW, 294, C.bgCardInner, 10, {
    stroke: C.borderInner,
    effects: [innerShadow()]
  });
  body.x = 4; body.y = 32;

  // Stats row (3 cells)
  var statData = [
    { label: 'Total Revenue', val: '$96,000.00', badge: '+5%', badgeColor: C.green },
    { label: 'Total Clicks',  val: '$24,000.00', badge: '-3%', badgeColor: C.red   },
    { label: 'Total Payouts', val: '$14,000.00', badge: null,  badgeColor: null    },
  ];
  var cellW = Math.floor(bodyW / 3);
  for (var i = 0; i < statData.length; i++) {
    var sd = statData[i];
    var cx = i * cellW;

    // Icon
    var ico = mkFrame(32, 32, C.bgInset, 7, { stroke: C.borderCard, strokeOp: 0.3 });
    ico.x = cx + 12; ico.y = 14;
    var icoDot = mkRect(8, 8, C.textLo, 2);
    icoDot.x = 12; icoDot.y = 12;
    ico.appendChild(icoDot);
    body.appendChild(ico);

    var lbl = await mkTxt(sd.label, 11, 'Regular', C.textLo);
    lbl.x = cx + 52; lbl.y = 16;
    body.appendChild(lbl);

    var val = await mkTxt(sd.val, 13, 'Bold', C.textHi);
    val.x = cx + 52; val.y = 32;
    body.appendChild(val);

    if (sd.badge) {
      var bdg = await mkBadge(sd.badge, sd.badgeColor, 0.15, sd.badgeColor);
      bdg.x = cx + 52 + val.width + 4; bdg.y = 34;
      body.appendChild(bdg);
    }

    // Right border divider
    if (i < 2) {
      var sep = mkRect(1, 50, C.borderInner, 0, 0.8);
      sep.x = cx + cellW - 1; sep.y = 10;
      body.appendChild(sep);
    }
  }

  // Divider
  var div = mkDivider(bodyW - 24, C.borderInner);
  div.x = 12; div.y = 68;
  body.appendChild(div);

  // Chart area
  var cw = bodyW - 24;
  var ch = 180;
  var chartBg = mkRect(cw, ch, C.bgInset, 4, 0.3);
  chartBg.x = 12; chartBg.y = 76;
  body.appendChild(chartBg);

  var revPoints = [10200,11800,9400,10800,13200,14800,12600,11200,12832,13800,12900,15200];
  var maxV = 20000;
  var pc = revPoints.length;

  // Revenue line segments
  for (var ri = 0; ri < pc - 1; ri++) {
    var rx1 = 12 + Math.round((ri / (pc - 1)) * cw);
    var ry1 = 76 + Math.round(ch - (revPoints[ri] / maxV) * ch * 0.85) - 5;
    var rx2 = 12 + Math.round(((ri + 1) / (pc - 1)) * cw);
    var ry2 = 76 + Math.round(ch - (revPoints[ri + 1] / maxV) * ch * 0.85) - 5;
    var segW = Math.max(2, Math.abs(rx2 - rx1));
    var seg = mkRect(segW, 2, C.purple, 1, 0.9);
    seg.x = rx1; seg.y = Math.min(ry1, ry2);
    body.appendChild(seg);
  }

  // Target line
  var tgtY = 76 + Math.round(ch - (10100 / maxV) * ch * 0.85) - 5;
  var tgtLine = mkRect(cw, 1, C.blue, 0, 0.4);
  tgtLine.x = 12; tgtLine.y = tgtY;
  body.appendChild(tgtLine);

  // Highlight dot at Sep
  var hdx = 12 + Math.round((8 / (pc - 1)) * cw);
  var hdy = 76 + Math.round(ch - (12832 / maxV) * ch * 0.85) - 5;
  var hdot = mkRect(10, 10, C.purple, 5);
  hdot.x = hdx - 5; hdot.y = hdy - 5;
  applyStroke(hdot, '#ffffff', 1.5, 0.8);
  body.appendChild(hdot);

  // Tooltip
  var tt = mkFrame(115, 52, '#131d30', 8, { stroke: C.borderInner });
  tt.x = hdx - 10; tt.y = hdy - 62;
  var ttD = await mkTxt('Sep 2024', 10, 'Regular', C.textMid);
  ttD.x = 8; ttD.y = 6;
  var ttR = await mkTxt('● Revenue: $12,832', 10, 'Regular', C.textHi);
  ttR.x = 8; ttR.y = 20;
  var ttT = await mkTxt('● Target: $10,100', 10, 'Regular', C.blue);
  ttT.x = 8; ttT.y = 34;
  tt.appendChild(ttD); tt.appendChild(ttR); tt.appendChild(ttT);
  body.appendChild(tt);

  card.appendChild(body);
  return card;
}

// ══════════════════════════════════════════════════════════════════
//  RETENTION CARD
// ══════════════════════════════════════════════════════════════════
async function buildRetentionCard(w) {
  var card = mkFrame(w, 330, C.bgCardOuter, 12, { stroke: C.borderCard });

  var titleTxt = await mkTxt('Retention Performance', 18, 'Medium', C.textHi);
  titleTxt.x = 3; titleTxt.y = 0;

  var bodyW = w - 8;
  var body = mkFrame(bodyW, 294, C.bgCardInner, 10, {
    stroke: C.borderInner,
    effects: [innerShadow()]
  });
  body.x = 4; body.y = 32;

  // Legend
  var legendItems = [
    { label: 'Returning Users', val: '900', color: C.purple },
    { label: 'Dropped Users',   val: '600', color: C.slate  },
    { label: 'High-LTV Users',  val: '200', color: C.blue   },
  ];
  for (var i = 0; i < legendItems.length; i++) {
    var li = legendItems[i];
    var ly = 12 + i * 26;
    var dot = mkRect(8, 8, li.color, 2);
    dot.x = 12; dot.y = ly + 4;
    var lbl = await mkTxt(li.label, 12, 'Regular', C.textMid);
    lbl.x = 26; lbl.y = ly;
    var val = await mkTxt(li.val, 12, 'Bold', C.textHi);
    val.x = bodyW - 50; val.y = ly;
    body.appendChild(dot);
    body.appendChild(lbl);
    body.appendChild(val);
  }

  // Gauge bar (simplified half-doughnut as colored segments)
  var gx = 12; var gy = 100;
  var gw = bodyW - 24; var gh = 20;
  var segColors = [C.purple, C.slate, C.blue, C.borderFaint];
  var segW = [Math.round(gw*0.5), Math.round(gw*0.33), Math.round(gw*0.11), Math.round(gw*0.06)];
  var ox = gx;
  for (var s = 0; s < segColors.length; s++) {
    var seg = mkRect(segW[s], gh, segColors[s], 4, s === 3 ? 0.25 : 0.85);
    seg.x = ox; seg.y = gy;
    body.appendChild(seg);
    ox += segW[s] + 2;
  }

  // Outer ring (darker border around gauge)
  var gaugeRing = mkFrame(gw, gh + 4, null, 5, { stroke: C.borderInner });
  gaugeRing.x = gx; gaugeRing.y = gy - 2;
  body.appendChild(gaugeRing);

  var progLbl = await mkTxt('Performance Progress', 11, 'Regular', C.textLo);
  progLbl.x = Math.round(gw / 2) - 60; progLbl.y = 130;
  var numLbl = await mkTxt('1,800', 22, 'Bold', C.textHi);
  numLbl.x = Math.round(gw / 2) - 22; numLbl.y = 150;
  var footLbl = await mkTxt('Your weekly campaign limit is 20.', 11, 'Regular', C.textLo);
  footLbl.x = 12; footLbl.y = 186;
  body.appendChild(progLbl);
  body.appendChild(numLbl);
  body.appendChild(footLbl);

  card.appendChild(titleTxt);
  card.appendChild(body);
  return card;
}

// ══════════════════════════════════════════════════════════════════
//  REPORTS TABLE CARD
// ══════════════════════════════════════════════════════════════════
async function buildReportsCard(w) {
  var card = mkFrame(w, 240, C.bgCardOuter, 12, { stroke: C.borderCard });

  // Toolbar header
  var srch = mkFrame(155, 28, C.bgInset, 7, { stroke: C.textLo, strokeOp: 0.2 });
  srch.x = 3; srch.y = 0;
  var srchTxt = await mkTxt('Search', 11, 'Regular', C.textLo);
  srchTxt.x = 10; srchTxt.y = 7;
  srch.appendChild(srchTxt);

  var sortBtn = mkFrame(72, 28, C.bgInset, 7, { stroke: C.textLo, strokeOp: 0.2 });
  sortBtn.x = 165; sortBtn.y = 0;
  var sortTxt = await mkTxt('Sort by', 11, 'Regular', C.textMid);
  sortTxt.x = 8; sortTxt.y = 7;
  sortBtn.appendChild(sortTxt);

  var expBtn = mkFrame(88, 28, null, 7, { stroke: C.blue, strokeOp: 0.45 });
  expBtn.x = w - 95; expBtn.y = 0;
  var expTxt = await mkTxt('Export CSV', 11, 'Medium', C.blue);
  expTxt.x = 10; expTxt.y = 7;
  expBtn.appendChild(expTxt);

  card.appendChild(srch);
  card.appendChild(sortBtn);
  card.appendChild(expBtn);

  // Inner body
  var bodyW = w - 8;
  var body = mkFrame(bodyW, 198, C.bgCardInner, 10, {
    stroke: C.borderInner,
    effects: [innerShadow()]
  });
  body.x = 4; body.y = 36;

  // Table headers
  var headers = ['Report Name', 'Last Run', 'Filters Applied', 'Format', 'Actions'];
  var colW = [130, 90, 110, 65, 55];
  var hx = 10;
  for (var h = 0; h < headers.length; h++) {
    var th = await mkTxt(headers[h], 10, 'Medium', C.textLo, { textCase: 'UPPER', letterSpacing: 0.5 });
    th.x = hx; th.y = 8;
    body.appendChild(th);
    hx += colW[h];
  }
  var thDiv = mkDivider(bodyW - 20, C.borderInner);
  thDiv.x = 10; thDiv.y = 28;
  body.appendChild(thDiv);

  // Table rows
  var rows = [
    { name: 'LTV by Country',   sub: 'Last 30d', date: 'July 1, 2025',  filters: 'Geo: All…',      fmt: 'PDF/CSV' },
    { name: 'LTV by Country',   sub: 'Last 30d', date: 'July 1, 2025',  filters: 'Geo: All…',      fmt: 'PDF/CSV' },
    { name: 'Retention Cohort', sub: 'Last 7d',  date: 'June 28, 2025', filters: 'Platform: iOS…', fmt: 'PDF/CSV' },
  ];

  for (var ri = 0; ri < rows.length; ri++) {
    var row = rows[ri];
    var ry = 36 + ri * 50;
    var rcx = 10;

    var rn = await mkTxt(row.name, 12, 'Medium', C.textHi);
    rn.x = rcx; rn.y = ry;
    body.appendChild(rn);
    var rs = await mkTxt(row.sub, 10, 'Regular', C.textLo);
    rs.x = rcx; rs.y = ry + 17;
    body.appendChild(rs);
    rcx += colW[0];

    var rd = await mkTxt(row.date, 12, 'Regular', C.textMid);
    rd.x = rcx; rd.y = ry + 8;
    body.appendChild(rd);
    rcx += colW[1];

    var rf = await mkTxt(row.filters, 12, 'Regular', C.textLo);
    rf.x = rcx; rf.y = ry + 8;
    body.appendChild(rf);
    rcx += colW[2];

    var fmtBdg = mkFrame(52, 20, C.blue, 4, { stroke: C.blue, strokeOp: 0.2, fillOpacity: 0.1 });
    fmtBdg.x = rcx; fmtBdg.y = ry + 6;
    var fmtTxt = await mkTxt(row.fmt, 10, 'Medium', C.blue);
    fmtTxt.x = 4; fmtTxt.y = 4;
    fmtBdg.appendChild(fmtTxt);
    body.appendChild(fmtBdg);
    rcx += colW[3];

    var dm = mkFrame(24, 24, null, 6, { stroke: C.textLo, strokeOp: 0.25 });
    dm.x = rcx; dm.y = ry + 5;
    var dmDot = mkRect(3, 12, C.textLo, 1, 0.6);
    dmDot.x = 10; dmDot.y = 6;
    dm.appendChild(dmDot);
    body.appendChild(dm);

    if (ri < rows.length - 1) {
      var rdiv = mkDivider(bodyW - 20, C.borderInner, 0.5);
      rdiv.x = 10; rdiv.y = ry + 44;
      body.appendChild(rdiv);
    }
  }

  card.appendChild(body);
  return card;
}

// ══════════════════════════════════════════════════════════════════
//  METRIC CARD
// ══════════════════════════════════════════════════════════════════
async function buildMetricCard(w, h, label, value, badge, badgeType, sparkColor) {
  var card = mkFrame(w, h, C.bgCardOuter, 12, { stroke: C.borderCard });

  // Tab header label
  var lbl = await mkTxt(label, 13, 'Medium', C.textMid);
  lbl.x = 3; lbl.y = 2;

  // Icon
  var ico = mkFrame(28, 28, C.bgInset, 7, { stroke: C.textLo, strokeOp: 0.25 });
  ico.x = w - 35; ico.y = 0;
  var icoDot = mkRect(6, 6, C.textLo, 2);
  icoDot.x = 11; icoDot.y = 11;
  ico.appendChild(icoDot);

  card.appendChild(lbl);
  card.appendChild(ico);

  // Inner body
  var bodyW = w - 8;
  var bodyH = h - 38;
  var body = mkFrame(bodyW, bodyH, C.bgCardInner, 10, {
    stroke: C.borderInner,
    effects: [innerShadow()]
  });
  body.x = 4; body.y = 34;

  // Value
  var val = await mkTxt(value, 22, 'Bold', C.textHi);
  val.x = 12; val.y = 12;

  // Badge
  var bgCol = badgeType === 'green' ? C.green : C.red;
  var bdg = await mkBadge(badge, bgCol, 0.15, bgCol);
  bdg.x = 12 + val.width + 6; bdg.y = 16;

  body.appendChild(val);
  body.appendChild(bdg);

  // Sparkline
  var spark = mkSparkline(bodyW - 24, 30, sparkColor);
  spark.x = 12; spark.y = 48;
  body.appendChild(spark);

  // Footer
  var trendTxt = await mkTxt('+5%  From last month', 11, 'Regular', C.green);
  trendTxt.x = 12; trendTxt.y = bodyH - 26;
  body.appendChild(trendTxt);

  var arr = mkFrame(26, 26, C.bgInset, 7, { stroke: C.textLo, strokeOp: 0.25 });
  arr.x = bodyW - 34; arr.y = bodyH - 30;
  var arrDot = mkRect(6, 6, C.textMid, 1);
  arrDot.x = 10; arrDot.y = 10;
  arr.appendChild(arrDot);
  body.appendChild(arr);

  card.appendChild(body);
  return card;
}

// ══════════════════════════════════════════════════════════════════
//  MAIN BUILDER
// ══════════════════════════════════════════════════════════════════
async function buildDashboard() {
  await loadFonts();
  figma.ui.postMessage({ type: 'progress', message: 'Fonts loaded, building layout…' });

  var ROOT_W = 1440;
  var ROOT_H = 900;
  var PAD = 6;
  var SB_W = 210;
  var MAIN_X = PAD + SB_W + PAD;
  var MAIN_W = ROOT_W - MAIN_X - PAD;
  var TB_H = 50;
  var CONTENT_Y = PAD + TB_H + PAD;
  var CONTENT_H = ROOT_H - CONTENT_Y - PAD;
  var GRID_PAD_T = 14;
  var GRID_PAD_S = 4;
  var GRID_GAP = 12;
  var RIGHT_COL_W = 296;
  var LEFT_COL_W = MAIN_W - RIGHT_COL_W - GRID_GAP - GRID_PAD_S * 2;

  // Root frame
  var root = mkFrame(ROOT_W, ROOT_H, C.bgBase, 0);
  root.name = 'Adnova – Reports & Analytics';

  // Sidebar
  figma.ui.postMessage({ type: 'progress', message: 'Building sidebar…' });
  var sb = await buildSidebar(ROOT_H - PAD * 2);
  sb.x = PAD; sb.y = PAD;
  root.appendChild(sb);

  // Topbar
  figma.ui.postMessage({ type: 'progress', message: 'Building topbar…' });
  var tb = await buildTopbar(MAIN_W);
  tb.x = MAIN_X; tb.y = PAD;
  root.appendChild(tb);

  // Content panel
  var content = mkFrame(MAIN_W, CONTENT_H, C.bgMain, 12, { stroke: C.borderFaint });
  content.x = MAIN_X; content.y = CONTENT_Y;
  root.appendChild(content);

  // Revenue card
  figma.ui.postMessage({ type: 'progress', message: 'Building revenue card…' });
  var revCard = await buildRevenueCard(LEFT_COL_W);
  revCard.name = "Retained Users' Revenue";
  revCard.x = GRID_PAD_S; revCard.y = GRID_PAD_T;
  content.appendChild(revCard);

  // Retention card
  figma.ui.postMessage({ type: 'progress', message: 'Building retention card…' });
  var retCard = await buildRetentionCard(RIGHT_COL_W);
  retCard.name = 'Retention Performance';
  retCard.x = GRID_PAD_S + LEFT_COL_W + GRID_GAP; retCard.y = GRID_PAD_T;
  content.appendChild(retCard);

  // Reports card
  figma.ui.postMessage({ type: 'progress', message: 'Building reports table…' });
  var repCard = await buildReportsCard(LEFT_COL_W);
  repCard.name = 'Reports Table';
  repCard.x = GRID_PAD_S; repCard.y = GRID_PAD_T + revCard.height + GRID_GAP;
  content.appendChild(repCard);

  // Metric cards
  figma.ui.postMessage({ type: 'progress', message: 'Building metric cards…' });
  var mH = Math.floor((repCard.height - GRID_GAP) / 2);
  var mc1 = await buildMetricCard(RIGHT_COL_W, mH, 'Cost per Retained User', '$62,302', '-15%', 'red', C.green);
  mc1.name = 'Cost per Retained User';
  mc1.x = GRID_PAD_S + LEFT_COL_W + GRID_GAP;
  mc1.y = GRID_PAD_T + retCard.height + GRID_GAP;
  content.appendChild(mc1);

  var mc2 = await buildMetricCard(RIGHT_COL_W, mH, 'D7 Retention Rate', '$62,302', '+5%', 'green', C.blue);
  mc2.name = 'D7 Retention Rate';
  mc2.x = GRID_PAD_S + LEFT_COL_W + GRID_GAP;
  mc2.y = GRID_PAD_T + retCard.height + GRID_GAP + mH + GRID_GAP;
  content.appendChild(mc2);

  figma.currentPage.appendChild(root);
  figma.viewport.scrollAndZoomIntoView([root]);
  figma.ui.postMessage({ type: 'done' });
}

// ─── Message handler ──────────────────────────────────────────────
figma.ui.onmessage = async function(msg) {
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
