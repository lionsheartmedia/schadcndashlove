import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

app.use('/static/*', serveStatic({ root: './' }))

app.get('/', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Adnova - Reports & Analytics</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/regular/style.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
      /* ── depth layers ── */
      --bg-base:       #080c14;   /* outermost shell — shows as gap between elements */
      --bg-sidebar:    #0c1220;   /* sidebar surface */
      --bg-main:       #0c1220;   /* main col / content panel surface */

      /* card OUTER = same as --bg-main so the header/tab is invisible
         against the content panel — only the lighter inner panel shows depth */
      --bg-card-outer: #080c14;   /* MATCHES bg-base exactly — tab blends with body */
      /* card INNER = lighter raised panel inside the card */
      --bg-card-inner: #1a2640;   /* lighter inner body panel */

      --bg-inset:      #090e1a;   /* icon slots, inputs, dropdowns */

      /* ── borders ── */
      --border-card:   #141f35;   /* card outer border — subtle, matches bg */
      --border-inner:  #243356;   /* inner panel border */
      --border-faint:  #0f1829;   /* very faint dividers */

      /* ── outer dark ring (depth halo) ── */
      --ring:          #060a11;

      /* ── text ── */
      --text-hi:    #dde6f5;
      --text-mid:   #62789e;
      --text-lo:    #3a4f6e;

      /* ── accents ── */
      --purple:  #7060f0;
      --blue:    #4a84f4;
      --green:   #00c896;
      --red:     #f03e5f;
    }

    html, body {
      height: 100%;
      font-family: 'Manrope', -apple-system, sans-serif;
      background: var(--bg-base);
      color: var(--text-hi);
      font-size: 13px;
      line-height: 1.4;
    }
    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border-ui); border-radius: 3px; }

    /* ═══════════════════════════════════
       SHELL — the dark base that shows
       as gaps/gutters around everything
    ═══════════════════════════════════ */
    .shell {
      display: flex;
      height: 100vh;
      /* small padding so bg-base peeks around sidebar + main column */
      padding: 6px;
      gap: 6px;
    }

    /* ═══════════════════════════════════
       SIDEBAR
    ═══════════════════════════════════ */
    .sidebar {
      width: 210px;
      min-width: 210px;
      background: var(--bg-sidebar);
      border-radius: 12px;
      border: 1px solid var(--border-faint);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      height: 100%;
    }

    .sb-logo {
      display: flex; align-items: center; gap: 9px;
      padding: 16px 14px 12px;
    }
    .sb-logo-icon {
      width: 28px; height: 28px; flex-shrink: 0;
      background: linear-gradient(135deg, #7060f0, #4a84f4);
      border-radius: 7px;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 800; color: #fff; letter-spacing: -0.5px;
    }
    .sb-logo-text { font-size: 18px; font-weight: 700; color: var(--text-hi); font-family: 'Inter', sans-serif; }

    .sb-ws {
      margin: 0 10px 10px;
      background: var(--bg-inset);
      border: 1px solid var(--border-faint);
      border-radius: 8px;
      padding: 7px 9px;
      display: flex; align-items: center; gap: 7px; cursor: pointer;
    }
    .sb-ws-av {
      width: 22px; height: 22px; flex-shrink: 0;
      background: linear-gradient(135deg, #7060f0, #4a84f4);
      border-radius: 5px;
      display: flex; align-items: center; justify-content: center;
      font-size: 9px; font-weight: 800; color: #fff;
    }
    .sb-ws-lbl  { font-size: 9px; color: var(--text-lo); text-transform: uppercase; letter-spacing: 0.7px; }
    .sb-ws-name { font-size: 11px; color: var(--text-mid); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px; }
    .sb-ws-chev { margin-left: auto; font-size: 8px; color: var(--text-lo); }

    /* nav items — with side padding so they don't touch sidebar edges */
    .sb-nav { flex: 1; overflow-y: auto; padding: 4px 8px; }
    .nav-item {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 10px;
      border-radius: 8px;
      font-size: 12.5px; color: var(--text-mid);
      cursor: pointer; margin-bottom: 1px;
      border: 1px solid transparent;
      transition: background 0.12s, color 0.12s;
    }
    .nav-item:hover { background: rgba(255,255,255,0.04); color: var(--text-hi); }
    .nav-item.active {
      background: rgba(112,96,240,0.12);
      border-color: rgba(112,96,240,0.18);
      color: #b8adff;
    }
    .nav-item .ni { width: 15px; text-align: center; font-size: 12px; flex-shrink: 0; opacity: 0.7; }
    .nav-item.active .ni { opacity: 1; color: var(--purple); }
    .nav-item .nc { margin-left: auto; font-size: 8px; color: var(--text-lo); }

    .sb-divider { height: 1px; background: var(--border-faint); margin: 6px 0; }

    /* upgrade card */
    .sb-upgrade {
      margin: auto 10px 10px;
      background: var(--bg-inset);
      border: 1px solid var(--border-faint);
      border-radius: 10px; padding: 12px; position: relative;
    }
    .sb-upgrade-x {
      position: absolute; top: 7px; right: 7px;
      width: 14px; height: 14px; background: var(--border-ui);
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 6.5px; color: var(--text-lo); cursor: pointer;
    }
    .sb-upgrade h4 { font-size: 11px; font-weight: 700; color: var(--text-hi); margin-bottom: 3px; }
    .sb-upgrade p  { font-size: 10px; color: var(--text-mid); line-height: 1.45; margin-bottom: 9px; }
    .sb-upgrade-btn {
      width: 100%; background: linear-gradient(90deg, #7060f0, #4a84f4);
      border: none; border-radius: 7px; padding: 7px;
      color: #fff; font-size: 11px; font-weight: 600; cursor: pointer;
    }

    .sb-user {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 12px; border-top: 1px solid var(--border-faint); cursor: pointer;
    }
    .sb-user-av {
      width: 27px; height: 27px; flex-shrink: 0;
      background: linear-gradient(135deg, #4a84f4, #7060f0);
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: #fff;
    }
    .sb-user-name  { font-size: 12px; font-weight: 600; color: var(--text-hi); }
    .sb-user-email { font-size: 10px; color: var(--text-lo); margin-top: 1px; }
    .sb-user-chev  { margin-left: auto; font-size: 8px; color: var(--text-lo); }

    /* ═══════════════════════════════════
       MAIN COLUMN
    ═══════════════════════════════════ */
    .main-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
      overflow: hidden;
      min-width: 0;
    }

    /* ── TOPBAR: floats with its own rounded container ── */
    .topbar {
      background: var(--bg-main);
      border: 1px solid var(--border-faint);
      border-radius: 12px;
      padding: 10px 16px;
      display: flex; align-items: center; gap: 10px;
      flex-shrink: 0;
    }
    .tb-expand {
      width: 25px; height: 25px;
      background: var(--bg-inset); border: 1px solid var(--border-ui);
      border-radius: 6px; display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: var(--text-mid); font-size: 9px;
    }
    .tb-title { font-size: 18px; font-weight: 700; color: var(--text-hi); flex: 1; font-family: 'Inter', sans-serif; }
    .tb-actions { display: flex; gap: 6px; }
    .tb-btn {
      width: 30px; height: 30px;
      background: var(--bg-inset); border: 1px solid var(--border-ui);
      border-radius: 8px; display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: var(--text-mid); font-size: 12px;
      transition: border-color 0.12s;
    }
    .tb-btn:hover { border-color: var(--purple); color: var(--text-hi); }
    .tb-btn.on { background: var(--purple); border-color: var(--purple); color: #fff; }

    /* ── SCROLL AREA ── */
    .content {
      flex: 1; overflow-y: auto;
      /* bg-main as the panel color; padding reveals it around cards */
      background: var(--bg-main);
      border: 1px solid var(--border-faint);
      border-radius: 12px;
      padding: 14px 7px 7px 7px;
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 296px;
      grid-template-rows: auto auto;
      gap: 12px;
    }

    /* ═══════════════════════════════════════════
       CARD SHELL — dark outer bg = the "tab" area
       The header text sits directly on this dark bg.
       Inside is a lighter raised inner panel.
    ═══════════════════════════════════════════ */
    .card {
      background: var(--bg-card-outer);   /* same as bg-main — tab header blends in */
      border-radius: 12px;
      border: 1px solid var(--border-card);
      padding: 14px 7px 7px 7px;
      overflow: hidden;
    }

    /* ── The lighter inner body panel ──
       Contains: stats strip + chart (revenue card)
       or: legend + gauge (retention card)
       or: toolbar + table (reports card)
       Sits below the dark header, all 4 corners rounded.
    ── */
    .card-body {
      background: var(--bg-card-inner);
      border-radius: 10px;
      border: 1px solid var(--border-inner);
      overflow: hidden;
      /* subtle inner glow to separate from outer dark shell */
      box-shadow: 0 1px 3px rgba(0,0,0,0.4) inset;
    }

    /* ═══════════════════════════════════
       RETAINED USERS REVENUE
    ═══════════════════════════════════ */
    .rev-card { grid-column: 1; grid-row: 1; }

    /* Header sits on dark outer card bg — the "folder tab" area */
    .rev-head {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 0 12px 3px;
    }
    .rev-head-title { font-size: 18px; font-weight: 600; color: var(--text-hi); font-family: 'Inter', sans-serif; }
    .period-pill {
      display: flex; align-items: center; gap: 5px;
      background: var(--bg-inset); border: 1px solid rgba(255,255,255,0.06);
      border-radius: 6px; padding: 5px 10px;
      font-size: 11px; color: var(--text-mid); cursor: pointer;
    }
    .period-pill i { font-size: 8px; color: var(--text-lo); }

    /* Inner body panel content */
    .rev-body-inner { padding: 12px; }

    /* stats row inside the lighter inner panel */
    .stats-row {
      display: grid; grid-template-columns: repeat(3,1fr);
      margin-bottom: 12px;
    }
    .stat-cell {
      display: flex; align-items: center; gap: 9px;
      padding: 10px 12px;
      border-right: 1px solid var(--border-inner);
    }
    .stat-cell:last-child { border-right: none; }
    .stat-ico {
      width: 32px; height: 32px; flex-shrink: 0;
      background: var(--bg-inset); border: 1px solid rgba(255,255,255,0.05);
      border-radius: 7px; display: flex; align-items: center; justify-content: center;
      color: var(--text-lo); font-size: 12px;
    }
    .stat-lbl { font-size: 16px; color: var(--text-lo); margin-bottom: 3px; font-family: 'Manrope', sans-serif; }
    .stat-val-row { display: flex; align-items: center; gap: 5px; }
    .stat-num { font-size: 16px; font-weight: 700; color: var(--text-hi); font-family: 'Manrope', sans-serif; }

    /* divider between stats and chart */
    .stats-chart-divider {
      height: 1px; background: var(--border-inner);
      margin: 0 12px 12px;
    }

    .bdg {
      font-size: 9px; font-weight: 700;
      padding: 2px 5px; border-radius: 4px;
    }
    .bdg-green { background: rgba(0,200,150,0.15); color: var(--green); }
    .bdg-red   { background: rgba(240,62,95,0.15);  color: var(--red);   }
    .bdg-blue  { background: rgba(74,132,244,0.15); color: var(--blue);  }

    .chart-wrap { height: 150px; position: relative; padding: 0 12px 12px; }

    /* ═══════════════════════════════════
       RETENTION PERFORMANCE
    ═══════════════════════════════════ */
    .ret-card { grid-column: 2; grid-row: 1; }
    /* title sits on dark outer card shell */
    .card-ttl { font-size: 18px; font-weight: 600; color: var(--text-hi); padding: 0 0 12px 3px; font-family: 'Inter', sans-serif; }

    /* inner panel content */
    .ret-body-inner { padding: 12px; }

    .ret-legend { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
    .ret-leg-item { display: flex; align-items: center; gap: 5px; font-size: 16px; color: var(--text-mid); font-family: 'Manrope', sans-serif; }
    .ret-dot { width: 7px; height: 7px; border-radius: 2px; flex-shrink: 0; }
    .dot-purple { background: var(--purple); }
    .dot-slate  { background: #253550; }
    .dot-blue   { background: var(--blue); }
    .ret-num { font-size: 16px; font-weight: 700; color: var(--text-hi); margin-left: 1px; font-family: 'Manrope', sans-serif; }

    .gauge-wrap { display: flex; flex-direction: column; align-items: center; }
    .gauge-box { position: relative; width: 195px; height: 108px; }
    #gaugeChart { width: 100% !important; height: 100% !important; }
    .gauge-over {
      position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
      text-align: center; pointer-events: none; white-space: nowrap;
    }
    .gauge-prog { font-size: 16px; color: var(--text-lo); line-height: 1.35; font-family: 'Manrope', sans-serif; }
    .gauge-num  { font-size: 22px; font-weight: 800; color: var(--text-hi); margin-top: 1px; font-family: 'Manrope', sans-serif; }
    .gauge-foot { font-size: 16px; color: var(--text-lo); text-align: center; margin-top: 8px; font-family: 'Manrope', sans-serif; }

    /* ═══════════════════════════════════
       REPORTS TABLE
    ═══════════════════════════════════ */
    .rep-card { grid-column: 1; grid-row: 2; }
    .rep-body-inner { padding: 12px; }

    .toolbar {
      display: flex; align-items: center; gap: 8px;
      padding: 0 0 12px 3px;
    }
    .srch {
      display: flex; align-items: center; gap: 7px;
      background: var(--bg-inset); border: 1px solid var(--border-ui);
      border-radius: 7px; padding: 6px 11px; width: 165px;
    }
    .srch input {
      background: transparent; border: none; outline: none;
      color: var(--text-hi); font-size: 11.5px; width: 100%;
      font-family: inherit;
    }
    .srch input::placeholder { color: var(--text-lo); }
    .srch i { color: var(--text-lo); font-size: 11px; flex-shrink: 0; }

    .sort-btn {
      display: flex; align-items: center; gap: 5px;
      background: var(--bg-inset); border: 1px solid var(--border-ui);
      border-radius: 7px; padding: 6px 11px;
      font-size: 11.5px; color: var(--text-mid); cursor: pointer;
    }
    .sort-btn i { font-size: 8px; color: var(--text-lo); }

    .exp-btn {
      margin-left: auto;
      display: flex; align-items: center; gap: 6px;
      background: transparent; border: 1px solid rgba(74,132,244,0.45);
      border-radius: 7px; padding: 6px 13px;
      font-size: 11.5px; font-weight: 500; color: var(--blue); cursor: pointer;
      transition: background 0.12s; font-family: inherit;
    }
    .exp-btn:hover { background: rgba(74,132,244,0.08); }

    table.rep { width: 100%; border-collapse: collapse; }
    table.rep th {
      font-size: 16px; font-weight: 600; color: var(--text-lo);
      text-transform: uppercase; letter-spacing: 0.5px;
      text-align: left; padding: 7px 10px;
      border-bottom: 1px solid var(--border-inner);
      font-family: 'Manrope', sans-serif;
    }
    table.rep td {
      padding: 11px 10px;
      border-bottom: 1px solid rgba(36,51,86,0.5);
      vertical-align: middle;
    }
    table.rep tr:last-child td { border-bottom: none; }
    table.rep tbody tr:hover td { background: rgba(255,255,255,0.012); }

    .rn  { font-size: 16px; font-weight: 600; color: var(--text-hi); font-family: 'Manrope', sans-serif; }
    .rsb { font-size: 16px; color: var(--text-lo); margin-top: 2px; font-family: 'Manrope', sans-serif; }
    .rd  { font-size: 16px; color: var(--text-mid); font-family: 'Manrope', sans-serif; }
    .rf  { font-size: 16px; color: var(--text-lo); font-family: 'Manrope', sans-serif; }
    .fmt {
      font-size: 10px; font-weight: 600;
      padding: 3px 7px; border-radius: 4px;
      background: rgba(74,132,244,0.1);
      color: var(--blue); border: 1px solid rgba(74,132,244,0.2);
    }
    .dmenu {
      width: 26px; height: 26px;
      background: transparent; border: 1px solid var(--border-ui);
      border-radius: 6px; display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: var(--text-lo); font-size: 11px;
      transition: border-color 0.12s;
    }
    .dmenu:hover { border-color: var(--text-mid); color: var(--text-hi); }

    /* ═══════════════════════════════════
       METRIC CARDS (right lower)
    ═══════════════════════════════════ */
    .right-lower { grid-column: 2; grid-row: 2; display: flex; flex-direction: column; gap: 12px; }

    /* metric cards share same depth treatment as .card */
    .mcard {
      background: var(--bg-card-outer);
      border-radius: 12px;
      border: 1px solid var(--border-card);
      padding: 14px 7px 7px 7px;
      overflow: hidden;
    }
    /* metric card inner panel wraps everything below the label */
    .mcard-body {
      background: var(--bg-card-inner);
      border-radius: 10px;
      border: 1px solid var(--border-inner);
      padding: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.4) inset;
    }
    .mc-top { display: flex; align-items: flex-start; justify-content: space-between; padding: 0 0 10px 3px; }
    .mc-lbl { font-size: 18px; color: var(--text-mid); font-weight: 600; font-family: 'Inter', sans-serif; }
    .mc-ico {
      width: 28px; height: 28px; flex-shrink: 0;
      background: var(--bg-inset); border: 1px solid var(--border-ui);
      border-radius: 7px; display: flex; align-items: center; justify-content: center;
      color: var(--text-lo); font-size: 11px;
    }
    .mc-val-row { display: flex; align-items: center; gap: 7px; margin-bottom: 8px; margin-top: 0; }
    .mc-val { font-size: 22px; font-weight: 800; color: var(--text-hi); font-family: 'Manrope', sans-serif; }
    .spark-wrap { height: 30px; margin-bottom: 8px; }
    .mc-foot { display: flex; align-items: center; justify-content: space-between; }
    .mc-trend { display: flex; align-items: center; gap: 4px; font-size: 16px; font-family: 'Manrope', sans-serif; }
    .mc-trend.up { color: var(--green); }
    .mc-trend strong { font-weight: 700; }
    .mc-trend .from { color: var(--text-lo); font-weight: 400; margin-left: 2px; }
    .mc-arr {
      width: 26px; height: 26px;
      background: var(--bg-inset); border: 1px solid var(--border-ui);
      border-radius: 7px; display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: var(--text-mid); font-size: 10px;
      transition: border-color 0.12s;
    }
    .mc-arr:hover { border-color: var(--purple); color: var(--purple); }

  </style>
</head>
<body>

<div class="shell">

  <!-- ══════════════ SIDEBAR ══════════════ -->
  <aside class="sidebar">

    <div class="sb-logo">
      <div class="sb-logo-icon">Ad</div>
      <span class="sb-logo-text">Adnova</span>
    </div>

    <div class="sb-ws">
      <div class="sb-ws-av">M</div>
      <div style="flex:1;min-width:0;">
        <div class="sb-ws-lbl">Workspace</div>
        <div class="sb-ws-name">Marketing-bnks534</div>
      </div>
      <i class="ph ph-caret-down sb-ws-chev"></i>
    </div>

    <div class="sb-nav">
      <div class="nav-item">
        <i class="ph ph-squares-four ni"></i> Dashboard
      </div>
      <div class="nav-item">
        <i class="ph ph-megaphone ni"></i> Campaigns
      </div>
      <div class="nav-item">
        <i class="ph ph-users ni"></i> User Quality
      </div>
      <div class="nav-item active">
        <i class="ph ph-chart-bar ni"></i> Reports &amp; Analytics
        <i class="ph ph-caret-right nc"></i>
      </div>
      <div class="nav-item">
        <i class="ph ph-robot ni"></i> AI Advisor
      </div>
      <div class="nav-item">
        <i class="ph ph-sliders-horizontal ni"></i> Prompt Builder
      </div>
      <div class="sb-divider"></div>
      <div class="nav-item">
        <i class="ph ph-plug ni"></i> Integrations
      </div>
      <div class="nav-item">
        <i class="ph ph-gear ni"></i> Settings
      </div>
    </div>

    <div class="sb-upgrade">
      <div class="sb-upgrade-x"><i class="ph ph-x"></i></div>
      <h4>Upgrade to Pro!</h4>
      <p>Unlock Premium Features and Manage Unlimited projects</p>
      <button class="sb-upgrade-btn">Upgrade Now</button>
    </div>

    <div class="sb-user">
      <div class="sb-user-av">E</div>
      <div>
        <div class="sb-user-name">Edwin T.</div>
        <div class="sb-user-email">Edwin.admin@dev.com</div>
      </div>
      <i class="ph ph-caret-right sb-user-chev"></i>
    </div>

  </aside>

  <!-- ══════════════ MAIN COLUMN ══════════════ -->
  <div class="main-col">

    <!-- floating topbar -->
    <div class="topbar">
      <div class="tb-expand"><i class="ph ph-caret-right"></i></div>
      <span class="tb-title">Reports &amp; Analytics</span>
      <div class="tb-actions">
        <div class="tb-btn"><i class="ph ph-moon"></i></div>
        <div class="tb-btn"><i class="ph ph-bell"></i></div>
        <div class="tb-btn on"><i class="ph ph-pencil-simple"></i></div>
      </div>
    </div>

    <!-- scrollable content panel -->
    <div class="content">
      <div class="grid">

        <!-- ── Retained Users Revenue ── -->
        <div class="card rev-card">
          <!-- DARK TAB HEADER — sits directly on dark outer card bg -->
          <div class="rev-head">
            <span class="rev-head-title">Retained Users' Revenue</span>
            <div class="period-pill">Last Month <i class="ph ph-caret-down"></i></div>
          </div>

          <!-- LIGHTER INNER BODY PANEL — the "folder body" below the tab -->
          <div class="card-body">
            <div class="stats-row">
              <div class="stat-cell">
                <div class="stat-ico"><i class="ph ph-trend-up"></i></div>
                <div>
                  <div class="stat-lbl">Total Revenue</div>
                  <div class="stat-val-row">
                    <span class="stat-num">$96,000.00</span>
                    <span class="bdg bdg-green">+5%</span>
                  </div>
                </div>
              </div>
              <div class="stat-cell">
                <div class="stat-ico"><i class="ph ph-cursor"></i></div>
                <div>
                  <div class="stat-lbl">Total Clicks</div>
                  <div class="stat-val-row">
                    <span class="stat-num">$24,000.00</span>
                    <span class="bdg bdg-red">-3%</span>
                  </div>
                </div>
              </div>
              <div class="stat-cell">
                <div class="stat-ico"><i class="ph ph-wallet"></i></div>
                <div>
                  <div class="stat-lbl">Total Payouts</div>
                  <div class="stat-val-row">
                    <span class="stat-num">$14,000.00</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="stats-chart-divider"></div>
            <div class="chart-wrap">
              <canvas id="revenueChart"></canvas>
            </div>
          </div>
        </div>

        <!-- ── Retention Performance Breakdown ── -->
        <div class="card ret-card">
          <!-- DARK TAB HEADER -->
          <div class="card-ttl">Retention Performance Breakdown</div>

          <!-- LIGHTER INNER BODY PANEL -->
          <div class="card-body ret-body-inner">
            <div class="ret-legend">
              <div class="ret-leg-item">
                <div class="ret-dot dot-purple"></div>
                <span>Returning Users</span>
                <span class="ret-num">900.00</span>
              </div>
              <div class="ret-leg-item">
                <div class="ret-dot dot-slate"></div>
                <span>Dropped Users</span>
                <span class="ret-num">600.00</span>
              </div>
              <div class="ret-leg-item">
                <div class="ret-dot dot-blue"></div>
                <span>High-LTV Users</span>
                <span class="ret-num">200.00</span>
              </div>
            </div>

            <div class="gauge-wrap">
              <div class="gauge-box">
                <canvas id="gaugeChart"></canvas>
                <div class="gauge-over">
                  <div class="gauge-prog">Performance<br>Progress</div>
                  <div class="gauge-num">1,800</div>
                </div>
              </div>
              <div class="gauge-foot">Your weekly campaign limit is 20.</div>
            </div>
          </div>
        </div>

        <!-- ── Reports Table ── -->
        <div class="card rep-card">
          <!-- DARK HEADER AREA: toolbar acts as the "tab" header -->
          <div class="toolbar">
            <div class="srch">
              <i class="ph ph-magnifying-glass"></i>
              <input type="text" placeholder="Search" />
            </div>
            <div class="sort-btn">Sort by <i class="ph ph-caret-down"></i></div>
            <button class="exp-btn"><i class="ph ph-export"></i> Export CSV</button>
          </div>

          <!-- LIGHTER INNER BODY PANEL: table lives here -->
          <div class="card-body rep-body-inner">
            <table class="rep">
              <thead>
                <tr>
                  <th>Report Name</th>
                  <th>Last Run</th>
                  <th>Filters Applied</th>
                  <th>Format</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><div class="rn">LTV by Country</div><div class="rsb">Last 30d</div></td>
                  <td><div class="rd">July 1, 2025</div></td>
                  <td><div class="rf">Geo: All, Metric…</div></td>
                  <td><span class="fmt">PDF/CSV</span></td>
                  <td><div class="dmenu"><i class="ph ph-dots-three-vertical"></i></div></td>
                </tr>
                <tr>
                  <td><div class="rn">LTV by Country</div><div class="rsb">Last 30d</div></td>
                  <td><div class="rd">July 1, 2025</div></td>
                  <td><div class="rf">Geo: All, Metric…</div></td>
                  <td><span class="fmt">PDF/CSV</span></td>
                  <td><div class="dmenu"><i class="ph ph-dots-three-vertical"></i></div></td>
                </tr>
                <tr>
                  <td><div class="rn">Retention Cohort</div><div class="rsb">Last 7d</div></td>
                  <td><div class="rd">June 28, 2025</div></td>
                  <td><div class="rf">Platform: iOS, An…</div></td>
                  <td><span class="fmt">PDF/CSV</span></td>
                  <td><div class="dmenu"><i class="ph ph-dots-three-vertical"></i></div></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ── Metric Cards ── -->
        <div class="right-lower">
          <!-- Cost per Retained User -->
          <div class="mcard">
            <!-- DARK TAB: label + icon -->
            <div class="mc-top">
              <span class="mc-lbl">Cost per Retained User</span>
              <div class="mc-ico"><i class="ph ph-copy"></i></div>
            </div>
            <!-- LIGHTER INNER BODY -->
            <div class="mcard-body">
              <div class="mc-val-row">
                <span class="mc-val">$62,302</span>
                <span class="bdg bdg-red">-15%</span>
              </div>
              <div class="spark-wrap"><canvas id="spark1"></canvas></div>
              <div class="mc-foot">
                <div class="mc-trend up">
                  <i class="ph ph-trend-up"></i>
                  <strong>+5%</strong>
                  <span class="from">From last month</span>
                </div>
                <div class="mc-arr"><i class="ph ph-arrow-right"></i></div>
              </div>
            </div>
          </div>

          <!-- D7 Retention Rate -->
          <div class="mcard">
            <!-- DARK TAB: label + icon -->
            <div class="mc-top">
              <span class="mc-lbl">D7 Retention Rat</span>
              <div class="mc-ico"><i class="ph ph-bell"></i></div>
            </div>
            <!-- LIGHTER INNER BODY -->
            <div class="mcard-body">
              <div class="mc-val-row">
                <span class="mc-val">$62,302</span>
                <span class="bdg bdg-green">+5%</span>
              </div>
              <div class="spark-wrap"><canvas id="spark2"></canvas></div>
              <div class="mc-foot">
                <div class="mc-trend up">
                  <i class="ph ph-trend-up"></i>
                  <strong>+5%</strong>
                  <span class="from">From last month</span>
                </div>
                <div class="mc-arr"><i class="ph ph-arrow-right"></i></div>
              </div>
            </div>
          </div>
        </div>

      </div><!-- /grid -->
    </div><!-- /content -->

  </div><!-- /main-col -->
</div><!-- /shell -->

<script>
/* ── Revenue Line Chart ── */
(function(){
  const ctx = document.getElementById('revenueChart').getContext('2d');
  const labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const rev = [10200,11800,9400,10800,13200,14800,12600,11200,12832,13800,12900,15200];
  const tgt = [10000,10800,10500,10000,10800,10000,10800,10000,10100,10800,10000,10800];

  const gR = ctx.createLinearGradient(0,0,0,155);
  gR.addColorStop(0,'rgba(112,96,240,0.40)');
  gR.addColorStop(1,'rgba(112,96,240,0.00)');

  const gT = ctx.createLinearGradient(0,0,0,155);
  gT.addColorStop(0,'rgba(74,132,244,0.20)');
  gT.addColorStop(1,'rgba(74,132,244,0.00)');

  new Chart(ctx,{
    type:'line',
    data:{
      labels,
      datasets:[
        { label:'Revenue', data:rev,
          borderColor:'#7060f0', borderWidth:2,
          backgroundColor:gR, fill:true, tension:0.42,
          pointRadius:rev.map((_,i)=>i===8?5:0),
          pointBackgroundColor:'#7060f0', pointBorderColor:'#fff', pointBorderWidth:1.5 },
        { label:'Target', data:tgt,
          borderColor:'#4a84f4', borderWidth:1.5, borderDash:[4,4],
          backgroundColor:gT, fill:true, tension:0.42,
          pointRadius:tgt.map((_,i)=>i===8?4:0),
          pointBackgroundColor:'#4a84f4', pointBorderColor:'#fff', pointBorderWidth:1.5 }
      ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      interaction:{ mode:'index', intersect:false },
      plugins:{
        legend:{ display:false },
        tooltip:{
          backgroundColor:'#131d30', borderColor:'#1c2840', borderWidth:1,
          titleColor:'#62789e', bodyColor:'#dde6f5',
          padding:10, cornerRadius:8,
          callbacks:{
            title:()=>'Sep 2024',
            label:i=>(i.datasetIndex===0?'● Revenue':'● Target')+': $'+i.raw.toLocaleString()
          }
        }
      },
      scales:{
        x:{ grid:{ color:'rgba(26,37,64,0.8)', drawBorder:false },
            ticks:{ color:'#3a4f6e', font:{ size:10 } }, border:{ display:false } },
        y:{ min:0, max:20000,
            grid:{ color:'rgba(26,37,64,0.8)', drawBorder:false },
            ticks:{ color:'#3a4f6e', font:{ size:10 },
              callback:v=>v>=1000?(v/1000)+'k':v, stepSize:5000 },
            border:{ display:false } }
      }
    }
  });
})();

/* ── Gauge ── */
(function(){
  const ctx = document.getElementById('gaugeChart').getContext('2d');
  new Chart(ctx,{
    type:'doughnut',
    data:{
      datasets:[{
        data:[900,600,200,300],
        backgroundColor:['#7060f0','#253550','#4a84f4','rgba(26,37,64,0.25)'],
        borderColor:['#7060f0','#253550','#4a84f4','rgba(0,0,0,0)'],
        borderWidth:0, borderRadius:[5,0,5,0], hoverOffset:0
      }]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      cutout:'74%', rotation:-90, circumference:180,
      plugins:{ legend:{display:false}, tooltip:{enabled:false} },
      animation:{ animateRotate:true, duration:1000 }
    }
  });
})();

/* ── Sparklines ── */
function spark(id, data, color){
  const ctx = document.getElementById(id).getContext('2d');
  const g = ctx.createLinearGradient(0,0,0,30);
  g.addColorStop(0,color.replace('rgb(','rgba(').replace(')',',0.25)'));
  g.addColorStop(1,color.replace('rgb(','rgba(').replace(')',',0)'));
  new Chart(ctx,{
    type:'line',
    data:{
      labels:data.map((_,i)=>i),
      datasets:[{ data, borderColor:color, borderWidth:1.5,
        backgroundColor:g, fill:true, tension:0.4, pointRadius:0 }]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false}, tooltip:{enabled:false} },
      scales:{ x:{display:false}, y:{display:false} }
    }
  });
}
spark('spark1',[42,36,46,31,50,43,39,54,47,53,46,61,55,59],'rgb(0,200,150)');
spark('spark2',[31,39,36,46,41,55,49,43,61,53,59,66,63,69],'rgb(74,132,244)');
</script>
</body>
</html>`)
})

export default app
