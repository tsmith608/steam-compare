// WeBothPlay brag composition — every frame is a pure function of t (seconds).
// Real UI fragments (captured from the running app) are re-hosted on a
// 360×640 stage and animated; window.seek(t) renders one frame.
(async () => {
  const f = await (await fetch("fragments.json")).json();
  document.documentElement.className = f.htmlClass;
  await new Promise((res) => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = f.css[0];
    l.onload = res;
    l.onerror = res;
    document.head.prepend(l);
  });

  // ------------------------------------------------------------- helpers
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const eo = (p) => 1 - Math.pow(1 - p, 3);
  const eio = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  const back = (p) => {
    const c1 = 1.6, c3 = c1 + 1;
    return p <= 0 ? 0 : 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
  };
  const W = 360, SX = 22, SW = 292; // TikTok-safe column (x 21–313 at 360 px)
  const stage = document.getElementById("stage");
  const glow = document.createElement("div");
  glow.className = "glow";
  stage.appendChild(glow);
  const html = (s) => {
    const t = document.createElement("template");
    t.innerHTML = s.trim().replace(/\sloading="lazy"/g, "");
    return t.content.firstElementChild;
  };
  const place = (node, { x = SX, y, w = SW, h, parent }) => {
    node.classList.add("abs");
    Object.assign(node.style, { left: `${x}px`, top: `${y}px`, width: w ? `${w}px` : "", height: h ? `${h}px` : "" });
    (parent || stage).appendChild(node);
    return node;
  };
  const scene = () => {
    const s = document.createElement("div");
    s.className = "scene";
    stage.appendChild(s);
    return s;
  };
  const show = (node, p, dy = 12, scale = 1) => {
    const e = eo(clamp(p));
    node.style.opacity = String(e);
    node.style.transform = `translateY(${((1 - e) * dy).toFixed(2)}px)${scale !== 1 ? ` scale(${scale})` : ""}`;
  };
  const pop = (node, p) => {
    const b = back(clamp(p));
    node.style.opacity = String(clamp(p * 2.2));
    node.style.transform = `scale(${(0.55 + 0.45 * b).toFixed(4)})`;
  };
  const out = (node, p, dy = -14) => {
    const e = eio(clamp(p));
    node.style.opacity = String(1 - e);
    node.style.transform = `translateY(${(e * dy).toFixed(2)}px)`;
  };
  const tap = (parent, x, y) => {
    const d = document.createElement("div");
    d.className = "tap";
    d.style.left = `${x}px`;
    d.style.top = `${y}px`;
    parent.appendChild(d);
    return (t, t0, k = 1) => { // k fades the ripple out with what it tapped
      const p = seg(t, t0, t0 + 0.42);
      d.style.opacity = p > 0 && p < 1 ? String((1 - p) * 0.9 * k) : "0";
      d.style.transform = `scale(${(0.35 + 1.15 * eo(p)).toFixed(3)})`;
    };
  };
  const rel = (node, parent) => {
    const a = node.getBoundingClientRect(), b = (parent || stage).getBoundingClientRect();
    return { x: a.left - b.left + a.width / 2, y: a.top - b.top + a.height / 2, w: a.width, h: a.height };
  };
  const coverTile = (name) => `<div class="grid place-items-center bg-gradient-to-br from-surface-3 to-surface-1 p-3 text-center"><span class="display line-clamp-2 text-sm text-ink-2">${name}</span></div>`;
  const P = (i) => `var(--p${i + 1})`;
  // The site's own profile pictures (public/pfp/): the demo players' avatars,
  // as in src/lib/steam-fixtures.js, plus Mae (the extra friend in the picker).
  const PFP = { Nova: "/pfp/pfp3.jpg", Bram: "/pfp/pfp2.jpg", Kit: "/pfp/pfp4.jpg", Juno: "/pfp/pfp7.jpg", Mae: "/pfp/pfp8.jpg" };
  const scenes = [];

  // ------------------------------------------------- 1 · Hook (0.0–2.5)
  {
    const s = scene();
    const people = ["Nova", "Bram", "Kit", "Juno"];
    const chat = place(html(`<div class="chat"><div class="chat-head"><div class="chat-avs">${people.map((p) => `<img src="${PFP[p]}" alt="">`).join("")}</div><div><p class="chat-title">game night</p><p class="chat-meta">4 friends · Fri 9:12 PM</p></div></div></div>`), { y: 128, parent: s });
    const lines = [
      { who: 0, text: "what are we playing tonight?", t0: 0.1, big: true },
      { who: 1, text: "idk", t0: 0.62 },
      { who: 2, text: "idk either lol", t0: 1.08 },
      { who: 3, typing: true, t0: 1.52 },
    ];
    const msgs = lines.map((m) => {
      const n = html(`<div class="msg"><img class="av" src="${PFP[people[m.who]]}" alt=""><div><p class="msg-name">${people[m.who]}</p>${m.typing ? `<span class="dots"><i></i><i></i><i></i></span>` : `<p class="msg-bubble${m.big ? " big" : ""}">${m.text}</p>`}</div></div>`);
      chat.appendChild(n);
      return n;
    });
    scenes.push({
      start: 0, end: 2.5, node: s, fadeIn: false,
      update(t) {
        show(chat, seg(t, -0.2, 0.25), 18);
        lines.forEach((m, i) => {
          pop(msgs[i], seg(t, m.t0, m.t0 + 0.32));
          if (m.typing) msgs[i].querySelectorAll(".dots i").forEach((d, k) => (d.style.opacity = String(0.35 + 0.65 * Math.max(0, Math.sin((t * 5 - k * 0.7) * Math.PI)))));
        });
        if (t > 2.22) out(chat, seg(t, 2.22, 2.5), -24);
      },
    });
  }

  // ------------------------------------- 2 · Sign in + pick friends (2.5–6.0)
  {
    const s = scene();
    const clean = (h) => h.replace(/Demo · /g, "").replace(/Steam user/g, "Nova");
    const mae = [...html(`<div>${clean(f.picker[0])}</div>`).querySelectorAll("ul > li")].find((li) => li.querySelector('button[aria-pressed="false"]')).cloneNode(true);
    mae.querySelector(".block.truncate").textContent = "Mae";
    mae.querySelector("img").setAttribute("src", PFP.Mae);
    // Signed-out form: the "Sign in to pick friends" link is the way in.
    const hl = place(html(`<h2 class="hl" style="font-size:27px">Sign in with<br><span style="color:var(--accent-hi)">Steam.</span></h2>`), { y: 62, parent: s });
    const formOut = place(html(`<div class="frag-form">${clean(f.formSignedOut)}</div>`), { y: 140, parent: s });
    const signIn = [...formOut.querySelectorAll("a")].find((a) => /Sign in to pick friends/.test(a.textContent));
    const si = rel(signIn, s);
    const tapSignIn = tap(s, si.x, si.y);
    // Back from Steam: the picker opens over the signed-in form.
    const formIn = place(html(`<div class="frag-form">${clean(f.formSignedIn)}</div>`), { y: 62, parent: s });
    const rowsIn = [...formIn.querySelectorAll("ol > li")];
    const counter = [...formIn.querySelectorAll("span")].find((x) => /\/8 players/.test(x.textContent));
    const compareBtn = [...formIn.querySelectorAll("button")].find((b) => /Compare libraries/.test(b.textContent));
    const cb = rel(compareBtn, s);
    const tapCompare = tap(s, cb.x, cb.y);
    const compareText = compareBtn.innerHTML;
    const shade = place(html(`<div style="background:rgba(3,4,6,0.72)"></div>`), { x: 0, y: 0, w: W, h: 640, parent: s });
    const states = f.picker.map((h) => {
      const d = place(html(`<div class="pick">${clean(h)}</div>`), { y: 112, parent: s });
      // One more (unticked) friend so the list reads like a real friends list.
      d.querySelector("ul").appendChild(mae.cloneNode(true));
      return d;
    });
    const rowBtn = (name) => [...states[0].querySelectorAll("button[aria-pressed]")].find((b) => b.textContent.includes(name));
    const pickTaps = ["Bram", "Kit", "Juno"].map((name, k) => {
      const r = rel(rowBtn(name), s);
      return { t0: 3.85 + k * 0.35, fx: tap(s, r.x, r.y) };
    });
    const addBtn = [...states[3].querySelectorAll("button")].find((b) => /Add 3 to group/.test(b.textContent));
    const ab = rel(addBtn, s);
    const tapAdd = tap(s, ab.x, ab.y);
    scenes.push({
      start: 2.5, end: 6.0, node: s,
      update(t) {
        // Part 1: sign in
        const p1 = t < 3.3;
        hl.style.visibility = formOut.style.visibility = p1 ? "visible" : "hidden";
        show(hl, seg(t, 2.5, 2.82));
        show(formOut, seg(t, 2.56, 2.9), 18);
        tapSignIn(t, 2.98, 1 - seg(t, 3.14, 3.3));
        // Focus ring (the app's accent) to lead the eye to the sign-in link.
        const ring = seg(t, 2.72, 2.9) * (1 - seg(t, 3.14, 3.3));
        signIn.style.boxShadow = ring ? `0 0 0 2px rgba(96, 165, 250, ${(0.9 * ring).toFixed(3)}), 0 0 18px rgba(96, 165, 250, ${(0.35 * ring).toFixed(3)})` : "none";
        signIn.style.transform = `scale(${(1 - 0.04 * (seg(t, 2.98, 3.06) - seg(t, 3.08, 3.2))).toFixed(4)})`;
        if (t > 3.14 && p1) {
          out(hl, seg(t, 3.14, 3.3));
          out(formOut, seg(t, 3.14, 3.3), -18);
        }
        // Part 2: picker over the signed-in form
        formIn.style.visibility = t >= 3.3 ? "visible" : "hidden";
        const added = t >= 5.1;
        rowsIn.forEach((li, i) => {
          if (i === 0) return show(li, seg(t, 3.3, 3.5), 0);
          li.style.display = added ? "" : "none";
          show(li, seg(t, 5.12 + (i - 1) * 0.07, 5.38 + (i - 1) * 0.07), 10);
        });
        if (counter) counter.textContent = added ? "4/8 players" : "1/8 players";
        show(formIn, seg(t, 3.3, 3.5), 0);
        const shadeOn = seg(t, 3.3, 3.4) - seg(t, 5.04, 5.18);
        shade.style.opacity = String(shadeOn);
        // The dialog stays opaque (no see-through frames): it pops in with a
        // small scale + rise, and is dismissed by sliding down off the stage.
        const open = eo(seg(t, 3.32, 3.56)), close = Math.pow(seg(t, 5.0, 5.2), 2);
        const stateIdx = t < 3.9 ? 0 : t < 4.25 ? 1 : t < 4.6 ? 2 : 3;
        states.forEach((d, k) => {
          const on = k === stateIdx && t >= 3.32 && t < 5.2;
          d.style.visibility = on ? "visible" : "hidden";
          d.style.opacity = on ? "1" : "0";
          d.style.transform = `translateY(${((1 - open) * 36 + close * 560).toFixed(2)}px) scale(${(0.96 + 0.04 * open).toFixed(4)})`;
        });
        pickTaps.forEach(({ t0, fx }) => fx(t, t0));
        tapAdd(t, 4.95, 1 - seg(t, 5.0, 5.06));
        addBtn.style.transform = `scale(${(1 - 0.04 * (seg(t, 4.95, 5.03) - seg(t, 5.05, 5.15))).toFixed(4)})`;
        // Part 3: compare
        tapCompare(t, 5.6);
        compareBtn.style.transform = `scale(${(1 - 0.035 * (seg(t, 5.6, 5.68) - seg(t, 5.7, 5.82))).toFixed(4)})`;
        compareBtn.innerHTML = t >= 5.72 ? "Opening results…" : compareText;
        if (t > 5.8) out(formIn, seg(t, 5.8, 6.0), -20);
      },
    });
  }

  // ------------------------------------------------- 3 · Reveal (5.0–8.5)
  const ringsSvg = (id) => `<svg viewBox="0 0 292 200" width="292" height="200" style="overflow:visible"><defs><clipPath id="${id}-a"><circle class="ca" cx="100" cy="100" r="82"/></clipPath><radialGradient id="${id}-g"><stop offset="0" stop-color="rgba(96,165,250,0.55)"/><stop offset="1" stop-color="rgba(59,130,246,0.12)"/></radialGradient></defs><g clip-path="url(#${id}-a)"><circle class="cb-fill" cx="192" cy="100" r="82" fill="url(#${id}-g)"/></g><circle class="ra" cx="100" cy="100" r="82" fill="none" stroke="var(--line-strong)" stroke-width="1.5"/><circle class="rb" cx="192" cy="100" r="82" fill="none" stroke="var(--line-strong)" stroke-width="1.5"/></svg>`;
  const setRings = (svg, sep, lensAlpha) => {
    const cxA = 146 - sep / 2, cxB = 146 + sep / 2;
    svg.querySelector(".ca").setAttribute("cx", cxA);
    svg.querySelector(".ra").setAttribute("cx", cxA);
    svg.querySelector(".rb").setAttribute("cx", cxB);
    svg.querySelector(".cb-fill").setAttribute("cx", cxB);
    svg.querySelector(".cb-fill").style.opacity = String(lensAlpha);
  };
  {
    const s = scene();
    const pill = place(html(`<div>${f.results.pill}</div>`), { y: 56, parent: s });
    pill.firstElementChild.style.margin = "0";
    const avatars = place(html(`<div class="center-x">${f.results.avatars}</div>`), { x: 0, w: W, y: 108, parent: s });
    const rings = place(html(`<div>${ringsSvg("r3")}</div>`), { y: 152, parent: s });
    const svg = rings.querySelector("svg");
    const num = place(html(`<p class="hl" style="font-size:92px;text-align:center;color:var(--accent-hi);letter-spacing:-0.04em">0</p>`), { y: 198, parent: s });
    const cap = place(html(`<p class="hl" style="font-size:25px;text-align:center">games you all own</p>`), { y: 342, parent: s });
    const meta = place(html(`<p class="sub" style="text-align:center">4 friends · 70 games between them</p>`), { y: 377, parent: s });
    const factLi = [...html(`<ul>${f.results.facts.replace(/^<ul[^>]*>|<\/ul>$/g, "")}</ul>`).children].find((li) => /launched/.test(li.textContent));
    const fact = place(html(`<div class="fact"></div>`), { y: 408, parent: s });
    fact.innerHTML = factLi ? factLi.innerHTML : "Everyone owns it, nobody's launched it: <strong>Bloons TD 6</strong>";
    scenes.push({
      start: 6.0, end: 9.5, offset: 1.0, node: s,
      update(t) {
        show(pill, seg(t, 5.0, 5.3), 8);
        show(avatars, seg(t, 5.05, 5.4), 10);
        const m = eio(seg(t, 5.0, 5.75));
        setRings(svg, 150 - 102 * m, 0.25 + 0.75 * m);
        rings.style.opacity = String(eo(seg(t, 5.0, 5.25)));
        const c = Math.round(39 * eo(seg(t, 5.15, 6.05)));
        num.textContent = String(c);
        show(num, seg(t, 5.12, 5.35), 0, 0.85 + 0.15 * back(seg(t, 5.12, 5.5)));
        show(cap, seg(t, 5.55, 5.9));
        show(meta, seg(t, 5.7, 6.05), 8);
        show(fact, seg(t, 5.95, 6.35), 16);
        if (t > 8.28) [pill, avatars, rings, num, cap, meta, fact].forEach((n, i) => out(n, seg(t, 8.28 + i * 0.015, 8.5)));
      },
    });
  }

  // ------------------------------------------------- 4 · Narrow (8.5–11.0)
  {
    const s = scene();
    const build = (src) => {
      const wrap = html(`<div class="fade-bottom" style="height:${640 - 56}px;overflow:hidden"></div>`);
      const tb = html(`<div class="frag-toolbar">${src.toolbar}</div>`);
      const count = html(`<div style="margin:2px 0 10px">${src.count}</div>`);
      const grid = html(`<ul class="grid grid-cols-2 gap-3" style="margin:0;padding:0"></ul>`);
      src.cards.slice(0, 8).forEach((c) => grid.appendChild(html(c.html)));
      wrap.append(tb, count, grid);
      return { wrap, tb, count, grid };
    };
    const A = build(f.results);
    const B = build(f.coop);
    place(A.wrap, { y: 56, parent: s });
    place(B.wrap, { y: 56, parent: s });
    const chip = [...A.tb.querySelectorAll("button.chip")].find((b) => /^Co-op/.test(b.textContent.trim()));
    const c = rel(chip, s);
    const tapChip = tap(s, c.x, c.y);
    const TAP = 9.25;
    scenes.push({
      start: 9.5, end: 12.0, offset: 1.0, node: s,
      update(t) {
        const drift = -46 * eio(seg(t, 9.75, 11.0));
        // Before the tap: everything (A). After: B's toolbar/count, cards re-flow.
        A.wrap.style.opacity = t < TAP + 0.1 ? "1" : "0";
        B.wrap.style.opacity = t < TAP + 0.1 ? "0" : "1";
        [A.tb, A.count].forEach((n, i) => show(n, seg(t, 8.5 + i * 0.06, 8.85 + i * 0.06), 10));
        [...A.grid.children].forEach((li, i) => show(li, seg(t, 8.62 + i * 0.05, 8.98 + i * 0.05), 16));
        B.tb.style.opacity = "1";
        B.count.style.opacity = "1";
        B.count.style.transform = `scale(${(1 + 0.06 * (seg(t, TAP + 0.1, TAP + 0.25) - seg(t, TAP + 0.25, TAP + 0.5))).toFixed(4)})`;
        B.count.style.transformOrigin = "0 50%";
        [...B.grid.children].forEach((li, i) => show(li, seg(t, TAP + 0.12 + i * 0.045, TAP + 0.42 + i * 0.045), 14));
        B.grid.style.transform = `translateY(${drift.toFixed(2)}px)`;
        tapChip(t, TAP);
        if (t > 10.8) out(B.wrap, seg(t, 10.8, 11.0), -16);
      },
    });
  }

  // ------------------------------------------------- 5 · Spin (11.0–14.5)
  {
    const s = scene();
    const hl = place(html(`<h2 class="hl" style="font-size:27px">Can't decide?<br><span style="color:var(--accent-hi)">Spin for it.</span></h2>`), { y: 62, parent: s });
    const reel = place(html(`<div class="reel"></div>`), { y: 142, h: 84, parent: s });
    const names = f.coop.cards.map((c) => c.name).filter((n) => n !== "Deep Rock Galactic");
    const seq = [];
    for (let i = 0; seq.length < 22; i++) seq.push(names[i % names.length]);
    seq.push("Deep Rock Galactic", names[3], names[5]);
    const LAND = 22, TW = 140, GAP = 8;
    const strip = html(`<div class="reel-strip">${seq.map((n) => `<div class="reel-tile">${coverTile(n)}</div>`).join("")}</div>`);
    reel.appendChild(strip);
    const mark = html(`<div class="reel-mark"></div>`);
    mark.style.left = `${SW / 2}px`;
    reel.appendChild(mark);
    const xFor = (idx) => SW / 2 - (idx * (TW + GAP) + TW / 2);
    const x0 = xFor(1), x1 = xFor(LAND);
    const landTile = strip.children[LAND];
    const pick = place(html(`<div class="pick">${f.roulette}</div>`), { y: 240, parent: s });
    const launch = [...pick.querySelectorAll("a.btn")].find((a) => /Launch in Steam/.test(a.textContent));
    const SPIN0 = 11.25, SPIN1 = 12.85;
    const lr = launch ? rel(launch, s) : null;
    const tapLaunch = lr ? tap(s, lr.x, lr.y) : null;
    scenes.push({
      start: 12.0, end: 15.5, offset: 1.0, node: s,
      update(t) {
        show(hl, seg(t, 11.0, 11.35));
        show(reel, seg(t, 11.05, 11.35), 14);
        const p = eo(seg(t, SPIN0, SPIN1));
        strip.style.transform = `translateX(${(x0 + (x1 - x0) * p).toFixed(2)}px)`;
        const landed = seg(t, SPIN1, SPIN1 + 0.25);
        landTile.style.borderColor = landed > 0 ? "var(--accent-hi)" : "";
        landTile.style.boxShadow = landed > 0 ? `0 0 0 ${(2 * landed).toFixed(2)}px rgba(96,165,250,0.9), 0 0 24px rgba(96,165,250,${(0.55 * landed).toFixed(2)})` : "";
        show(pick, seg(t, SPIN1 + 0.12, SPIN1 + 0.5), 24);
        if (tapLaunch) tapLaunch(t, 13.75);
        if (launch) launch.style.transform = `scale(${(1 - 0.035 * (seg(t, 13.75, 13.85) - seg(t, 13.88, 14.02))).toFixed(4)})`;
        if (t > 14.3) [hl, reel, pick].forEach((n) => out(n, seg(t, 14.3, 14.5)));
      },
    });
  }

  // ------------------------------------------------- 6 · Vote (14.5–17.0)
  {
    const s = scene();
    const label = place(html(`<p class="label !text-accent-hi" style="margin:0">Group vote · one veto each</p>`), { y: 58, parent: s });
    const hl = place(html(`<h2 class="hl" style="font-size:27px">Can't agree?<br><span style="color:var(--accent-hi)">Vote.</span></h2>`), { y: 80, parent: s });
    const lisA = f.pollVote.match(/<li[\s\S]*?<\/li>/g) || [];
    const lisB = f.pollVoteTapped.match(/<li[\s\S]*?<\/li>/g) || [];
    const rows = lisA.map((liA, i) => {
      const a = html(liA), b = html(lisB[i] || liA);
      const name = a.querySelector("p").textContent;
      const btnsA = a.querySelector(".flex.gap-2").innerHTML;
      const btnsB = b.querySelector(".flex.gap-2").innerHTML;
      const row = html(`<div class="vote-row"><div class="tile">${coverTile(name)}</div><div class="col"><p class="name">${name}</p><div class="btns">${btnsA}</div></div></div>`);
      const changed = btnsA !== btnsB;
      const vetoed = /Vetoed/.test(btnsB);
      return { row, name, btnsA, btnsB, changed, vetoed };
    });
    const shown = rows.filter((r) => r.changed);
    rows.filter((r) => !r.changed).forEach((r) => (r.row.style.display = "none"));
    shown.forEach((r, i) => place(r.row, { y: 156 + i * 74, parent: s }));
    // Taps in capture order: I'd play on the first changed rows, then the veto.
    const order = rows.map((r, i) => ({ r, i })).filter((x) => x.r.changed).sort((a, b) => Number(a.r.vetoed) - Number(b.r.vetoed));
    const tapTimes = [14.95, 15.3, 15.68];
    const taps = order.map(({ r }, k) => {
      const btn = r.vetoed ? [...r.row.querySelectorAll("button")].pop() : r.row.querySelector("button");
      const p = rel(btn, s);
      return { r, t0: tapTimes[k] ?? 15.9, fx: tap(s, p.x, p.y) };
    });
    const lead = place(html(`<div>${(f.pollResults.match(/<div class="mt-6 rounded-lg border border-accent[\s\S]*?<\/div>/) || [""])[0].replace("mt-6 ", "")}</div>`), { y: 392, parent: s });
    scenes.push({
      start: 15.5, end: 18.0, offset: 1.0, node: s,
      update(t) {
        show(label, seg(t, 14.5, 14.8), 8);
        show(hl, seg(t, 14.55, 14.88));
        shown.forEach((r, i) => show(r.row, seg(t, 14.62 + i * 0.07, 14.95 + i * 0.07), 14));
        taps.forEach(({ r, t0, fx }) => {
          const on = t >= t0 + 0.05;
          const box = r.row.querySelector(".btns");
          const want = on ? r.btnsB : r.btnsA;
          if (box.innerHTML !== want) box.innerHTML = want;
          r.row.style.borderColor = on ? (r.vetoed ? "rgba(248,113,113,0.6)" : "var(--accent)") : "";
          r.row.style.opacity = on && r.vetoed ? "0.62" : r.row.style.opacity;
          fx(t, t0);
        });
        show(lead, seg(t, 16.05, 16.4), 16);
        if (t > 16.8) [label, hl, lead, ...shown.map((r) => r.row)].forEach((n) => out(n, seg(t, 16.8, 17.0)));
      },
    });
  }

  // ------------------------------------------------- 7 · Outro (17.0–20.0)
  {
    const s = scene();
    const rings = place(html(`<div>${ringsSvg("r7")}</div>`), { y: 96, parent: s });
    const svg = rings.querySelector("svg");
    const mark = place(html(`<div class="center-x">${f.wordmark}</div>`), { x: 0, w: W, y: 182, parent: s });
    const a = mark.querySelector("a");
    a.style.transform = "scale(1.6)";
    const tag = place(html(`<p class="hl" style="font-size:25px;text-align:center">Find what your group<br>can play <span style="color:var(--accent-hi)">tonight.</span></p>`), { y: 318, parent: s });
    const cta = place(html(`<div class="center-x"><span class="btn btn-primary btn-lg" style="pointer-events:none">webothplay.com</span></div>`), { x: 0, w: W, y: 396, parent: s });
    const fine = place(html(`<p class="sub" style="text-align:center">Free for groups of up to 8 · Powered by Steam</p>`), { x: 0, w: W, y: 452, parent: s });
    scenes.push({
      start: 18.0, end: 21.0, offset: 1.0, node: s, fadeOut: false,
      update(t) {
        const m = eio(seg(t, 17.0, 17.7));
        setRings(svg, 150 - 102 * m, 0.25 + 0.6 * m + 0.15 * Math.sin((t - 17) * 2.2));
        rings.style.opacity = String(eo(seg(t, 17.0, 17.3)));
        show(mark, seg(t, 17.1, 17.45), 10);
        show(tag, seg(t, 17.35, 17.75));
        show(cta, seg(t, 17.65, 18.0), 12);
        show(fine, seg(t, 17.85, 18.2), 8);
        const breathe = 1 + 0.012 * Math.sin((t - 17.6) * 3.1) * seg(t, 18, 18.5);
        cta.firstElementChild.style.transform = `scale(${breathe.toFixed(4)})`;
      },
    });
  }

  // --------------------------------------------------------------- seek
  window.seek = (t) => {
    glow.style.transform = `translate(${(Math.sin(t * 0.35) * 18).toFixed(1)}px, ${(Math.cos(t * 0.27) * 14 - 120).toFixed(1)}px)`;
    for (const sc of scenes) {
      const fin = sc.fadeIn === false ? 1 : eo(seg(t, sc.start, sc.start + 0.2));
      const fout = sc.fadeOut === false ? 1 : 1 - seg(t, sc.end - 0.04, sc.end);
      const visible = t >= sc.start - 0.001 && t < sc.end + 0.001;
      const o = visible ? Math.min(fin, fout) : 0;
      sc.node.style.opacity = String(o);
      sc.node.style.visibility = o > 0 ? "visible" : "hidden";
      if (o > 0) sc.update(t - (sc.offset || 0));
    }
  };

  await document.fonts.ready;
  await Promise.all([...document.images].map((img) => (img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; }))));
  await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
  window.seek(0);
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  window.__ready = true;
})();
