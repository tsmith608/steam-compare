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
  // Load every font face before anything is measured.
  await Promise.all([...document.fonts].map((ff) => ff.load().catch(() => {})));

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
  // The site's own profile pictures (public/pfp/): the demo players' avatars,
  // as in src/lib/steam-fixtures.js, plus Mae (the extra friend in the picker).
  const PFP = { Nova: "/pfp/pfp3.jpg", Bram: "/pfp/pfp2.jpg", Kit: "/pfp/pfp4.jpg", Juno: "/pfp/pfp7.jpg", Mae: "/pfp/pfp8.jpg" };
  const scenes = [];
  // Scene timeline and sound cues. The soundtrack is generated from these
  // (frames.mjs --cues → cues.json), so every sound lands on its animation.
  const T = { discord: 0, signin: 8.5, reveal: 12.0, spin: 15.5, vote: 19.0, outro: 21.5, end: 24.5 };
  const CUES = [];
  const cue = (t, kind, extra = {}) => CUES.push({ t: Math.round(t * 1000) / 1000, kind, ...extra });

  // ---------------- 1 · Discord: the hook, adding the bot, /compare (0.0–8.5)
  // A stylized Discord channel (Discord's look, our own markup). The bot's reply
  // is the real one: bot/commands/compare.js run for the demo group
  // (capture-discord.mjs). The camera starts close on the chat, then pulls back.
  {
    const s = scene();
    const VW = 390, VH = 550, HEAD = 48, FOOT = 74, VIS = VH - HEAD - FOOT;
    const esc = (x) => x.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    const md = (x) => esc(x).replace(/\[(.+?)\]\((.+?)\)/g, "<a>$1</a>").replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\n/g, "<br>");
    const emo = (h) => h.replace(/\p{Extended_Pictographic}(‍\p{Extended_Pictographic}|️)*/gu, (e) => (f.emoji[e] ? `<img class="dc-emoji" src="${f.emoji[e]}" alt="">` : e));
    const txt = (x) => emo(md(x));
    const E = f.botCompare.embeds[0];
    const LINK = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>`;
    const buttons = f.botCompare.components.flatMap((r) => r.components)
      .map((c) => `<span class="dc-btn${c.style === 1 ? " primary" : ""}">${txt(c.label)}${c.style === 5 ? LINK : ""}</span>`).join("");
    const fields = E.fields.map((fl) => `<div class="f${fl.inline ? " inline" : ""}"><div class="fn">${txt(fl.name)}</div><div class="fv">${txt(fl.value)}</div></div>`).join("");
    const embed = `<div class="dc-embed" style="--c:#${E.color.toString(16).padStart(6, "0")}"><div class="t">${txt(E.title)}</div><div class="d">${txt(E.description)}</div><div class="fields">${fields}</div><div class="foot">Today at 9:13 PM</div></div><div class="dc-btns">${buttons}</div>`;
    const msg = (who, text) => `<div class="dc-msg"><img class="dc-av" src="${PFP[who]}" alt=""><div class="dc-main"><div><span class="dc-name">${who}</span><span class="dc-time">Today at 9:12 PM</span></div><div class="dc-text">${text}</div></div></div>`;
    const panel = html(`<div class="dc" style="width:${VW}px;height:${VH}px">
      <div class="dc-head"><span class="hash">#</span>game-night</div>
      <div class="dc-body" style="top:${HEAD}px;bottom:${FOOT}px"><div class="dc-scroll">
        <div class="dc-welcome"><div class="ic">#</div><p class="h">Welcome to #game-night!</p><p class="p">This is the start of the #game-night channel.</p></div>
        ${msg("Nova", "what are we playing tonight?")}${msg("Bram", "idk")}${msg("Kit", "idk either lol")}
        <div class="dc-sys"><span class="arrow">→</span><span><b>WeBothPlay</b> joined the party.</span></div>
        <div class="dc-bot">
          <div class="dc-used"><img src="${PFP.Nova}" alt=""><b>Nova</b> used <span class="cmd">/compare</span></div>
          <div class="dc-msg"><span class="dc-av dc-botav"><img src="/logo-mark.png" alt=""></span><div class="dc-main"><div><span class="dc-name">WeBothPlay</span><span class="dc-app">APP</span><span class="dc-time">Today at 9:13 PM</span></div>
            <div class="dc-content"><div class="dc-thinking">WeBothPlay is thinking<span class="dots"><i>.</i><i>.</i><i>.</i></span></div><div class="dc-reply">${embed}</div></div></div></div>
        </div>
      </div></div>
      <div class="dc-compose"><span class="ph">Message #game-night</span><span class="cmdline"><span class="dc-chip cmd">/compare</span>${["Bram", "Kit", "Juno"].map((n) => `<span class="dc-opt"><span class="dc-mention">@${n}</span></span>`).join("")}</span></div>
      <div class="dc-typing"><span class="dots"><i></i><i></i><i></i></span><span><b>Juno</b> is typing…</span></div>
    </div>`);
    s.appendChild(panel);
    const q = (sel) => panel.querySelector(sel);
    const scroll = q(".dc-scroll");
    const chat = [...panel.querySelectorAll(".dc-scroll > .dc-msg")];
    const sys = q(".dc-sys"), bot = q(".dc-bot"), used = q(".dc-used"), thinking = q(".dc-thinking"), reply = q(".dc-reply");
    const ph = q(".ph"), cmdline = q(".cmdline"), cmdChip = q(".dc-chip.cmd"), opts = [...panel.querySelectorAll(".dc-opt")], typing = q(".dc-typing");
    // Layout (unscaled, measured once): where each block ends inside the scroller.
    const y0 = scroll.getBoundingClientRect().top;
    const top = (el) => el.getBoundingClientRect().top - y0, bottom = (el) => el.getBoundingClientRect().bottom - y0;
    const yHook = bottom(chat[2]) + 8, ySys = bottom(sys) + 8, yThink = top(thinking) + thinking.offsetHeight + 12;
    const yUsed = top(used) - 10, yEnd = bottom(q(".dc-btns")) + 14;
    // Content bottom aligned with the visible bottom (short chats sit low, like Discord).
    const target = (t) => {
      if (t < 3.7) return yHook - VIS;
      if (t < 4.65) return ySys - VIS;
      if (t < 5.0) return yThink - VIS;
      const first = Math.min(yUsed, yEnd - VIS), last = Math.max(first, yEnd - VIS);
      return first + (last - first) * eio(seg(t, 6.3, 7.7));
    };
    const glide = [[3.7, 0.3], [4.65, 0.25], [5.0, 0.4]];
    const scrollAt = (t) => {
      for (const [b, d] of glide) if (t >= b && t < b + d) return target(b - 1e-3) + (target(b + d) - target(b - 1e-3)) * eo(seg(t, b, b + d));
      return target(t);
    };
    // "Add to your server": the site's own /discord header and button.
    const shade = place(html(`<div class="dc-shade"></div>`), { x: 0, y: 0, w: W, h: 640, parent: s });
    const card = place(html(`<div class="dc-card surface-raised">${f.discordHero}</div>`), { y: 176, parent: s });
    card.querySelector("header > p.mt-4")?.remove();
    card.querySelectorAll(".btn")[1]?.remove();
    const addBtn = card.querySelector(".btn-discord");
    const ab = rel(addBtn, s);
    const tapAdd = tap(s, ab.x, ab.y);
    cue(0.1, "msg", { n: 0 }); cue(0.62, "msg", { n: 1 }); cue(1.08, "msg", { n: 2 }); cue(1.52, "typing");
    cue(2.55, "card"); cue(3.45, "tap"); cue(3.7, "join");
    cue(3.95, "key"); opts.forEach((_, i) => cue(4.15 + i * 0.15, "mention", { n: i })); cue(4.6, "send"); cue(5.0, "reply");
    scenes.push({
      start: T.discord, end: T.signin, node: s, fadeIn: false,
      update(t) {
        // Camera: close on the chat, then the whole channel (0.78) once the bot arrives.
        const z = eio(seg(t, 2.45, 2.95));
        const sc = 1 - 0.22 * z, x = 18, y = -70 + 122 * z;
        const enter = eo(seg(t, -0.2, 0.25)), exit = eio(seg(t, 8.28, 8.5));
        panel.style.opacity = String(enter * (1 - exit));
        panel.style.transform = `translate(${x}px, ${(y + (1 - enter) * 18 - exit * 20).toFixed(2)}px) scale(${sc.toFixed(4)})`;
        scroll.style.transform = `translateY(${(-scrollAt(t)).toFixed(2)}px)`;
        chat.forEach((m, i) => pop(m, seg(t, [0.1, 0.62, 1.08][i], [0.1, 0.62, 1.08][i] + 0.32)));
        chat.forEach((m) => (m.style.transformOrigin = "0 100%"));
        typing.style.opacity = String(seg(t, 1.52, 1.7) * (1 - seg(t, 2.45, 2.65)));
        typing.querySelectorAll(".dots i").forEach((d, k) => (d.style.opacity = String(0.35 + 0.65 * Math.max(0, Math.sin((t * 5 - k * 0.7) * Math.PI)))));
        // The card: in, tap, away; the bot joins.
        const cardOn = seg(t, 2.55, 2.85), cardOff = eio(seg(t, 3.58, 3.76));
        shade.style.opacity = String(0.9 * cardOn * (1 - cardOff));
        card.style.visibility = t >= 2.55 && t < 3.76 ? "visible" : "hidden";
        card.style.opacity = String(eo(cardOn) * (1 - cardOff));
        card.style.transform = `translateY(${((1 - eo(cardOn)) * 40 + cardOff * 36).toFixed(2)}px)`;
        tapAdd(t, 3.45, 1 - cardOff);
        addBtn.style.transform = `scale(${(1 - 0.04 * (seg(t, 3.45, 3.53) - seg(t, 3.55, 3.66))).toFixed(4)})`;
        sys.style.opacity = String(eo(seg(t, 3.7, 3.95)));
        // Composer: /compare with three mentions, then send.
        const typed = t >= 3.95 && t < 4.6;
        ph.style.opacity = typed ? "0" : "1";
        cmdline.style.opacity = typed ? "1" : "0";
        cmdChip.style.opacity = String(eo(seg(t, 3.95, 4.05)));
        opts.forEach((o, i) => { o.style.opacity = String(eo(seg(t, 4.15 + i * 0.15, 4.25 + i * 0.15))); });
        // The reply: thinking…, then the embed.
        bot.style.opacity = String(eo(seg(t, 4.65, 4.85)));
        thinking.style.opacity = t < 5.0 ? "1" : "0";
        thinking.querySelectorAll(".dots i").forEach((d, k) => (d.style.opacity = String(seg((t * 3 - k * 0.33) % 1, 0, 0.5) > 0 ? 1 : 0.25)));
        reply.style.opacity = String(eo(seg(t, 5.0, 5.25)));
        reply.style.transform = `translateY(${((1 - eo(seg(t, 5.0, 5.3))) * 6).toFixed(2)}px)`;
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
    const lab = place(html(`<p class="label !text-accent-hi" style="margin:0">On the web</p>`), { y: 44, parent: s });
    const hl = place(html(`<h2 class="hl" style="font-size:27px">Sign in with<br><span style="color:var(--accent-hi)">Steam.</span></h2>`), { y: 64, parent: s });
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
    const OFF = T.signin - 2.5;
    cue(T.signin, "scene"); cue(OFF + 2.98, "tap"); cue(OFF + 3.32, "modal", { open: true });
    pickTaps.forEach(({ t0 }, k) => cue(OFF + t0, "pick", { n: k }));
    cue(OFF + 4.95, "tap"); cue(OFF + 5.0, "modal", { open: false }); cue(OFF + 5.12, "rows"); cue(OFF + 5.6, "tap");
    scenes.push({
      start: T.signin, end: T.reveal, offset: OFF, node: s,
      update(t) {
        // Part 1: sign in
        const p1 = t < 3.3;
        lab.style.visibility = hl.style.visibility = formOut.style.visibility = p1 ? "visible" : "hidden";
        show(lab, seg(t, 2.5, 2.8), 8);
        show(hl, seg(t, 2.5, 2.82));
        show(formOut, seg(t, 2.56, 2.9), 18);
        tapSignIn(t, 2.98, 1 - seg(t, 3.14, 3.3));
        // Focus ring (the app's accent) to lead the eye to the sign-in link.
        const ring = seg(t, 2.72, 2.9) * (1 - seg(t, 3.14, 3.3));
        signIn.style.boxShadow = ring ? `0 0 0 2px rgba(96, 165, 250, ${(0.9 * ring).toFixed(3)}), 0 0 18px rgba(96, 165, 250, ${(0.35 * ring).toFixed(3)})` : "none";
        signIn.style.transform = `scale(${(1 - 0.04 * (seg(t, 2.98, 3.06) - seg(t, 3.08, 3.2))).toFixed(4)})`;
        if (t > 3.14 && p1) {
          out(lab, seg(t, 3.14, 3.3));
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
    const OFF = T.reveal - 5.0;
    cue(T.reveal, "reveal");
    for (let k = 1; k <= 9; k++) cue(OFF + 5.15 + 0.9 * (1 - Math.pow(1 - k / 10, 1 / 3)), "count", { n: k });
    cue(OFF + 6.05, "hit");
    scenes.push({
      start: T.reveal, end: T.spin, offset: OFF, node: s,
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
    const OFF = T.spin - 11.0;
    cue(T.spin, "spin");
    for (let t = SPIN0, last = 1; t <= SPIN1; t += 1 / 480) {
      const idx = Math.floor(1 + (LAND - 1) * eo(seg(t, SPIN0, SPIN1)) + 0.5);
      if (idx > last) { last = idx; cue(OFF + t, "tick", { n: idx }); }
    }
    cue(OFF + SPIN1, "land");
    if (launch) cue(OFF + 13.75, "tap");
    scenes.push({
      start: T.spin, end: T.vote, offset: OFF, node: s,
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
    const OFF = T.vote - 14.5;
    cue(T.vote, "scene");
    taps.forEach(({ r, t0 }, k) => cue(OFF + t0, r.vetoed ? "veto" : "vote", { n: k }));
    cue(OFF + 16.05, "lead");
    scenes.push({
      start: T.vote, end: T.outro, offset: OFF, node: s,
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
    const rings = place(html(`<div>${ringsSvg("r7")}</div>`), { y: 76, parent: s });
    const svg = rings.querySelector("svg");
    const mark = place(html(`<div class="center-x">${f.wordmark}</div>`), { x: 0, w: W, y: 162, parent: s });
    const a = mark.querySelector("a");
    a.style.transform = "scale(1.6)";
    const tag = place(html(`<p class="hl" style="font-size:25px;text-align:center">Find what your group<br>can play <span style="color:var(--accent-hi)">tonight.</span></p>`), { y: 290, parent: s });
    const cta = place(html(`<div class="center-x"><span class="btn btn-primary btn-lg" style="pointer-events:none">webothplay.com</span></div>`), { x: 0, w: W, y: 380, parent: s });
    const bot = place(html(`<div class="center-x">${f.discordHero.match(/<a [^>]*btn-discord[\s\S]*?<\/a>/)[0].replace(" btn-lg", "")}</div>`), { x: 0, w: W, y: 438, parent: s });
    const fine = place(html(`<p class="sub" style="text-align:center">Free for groups of up to 8 · Powered by Steam</p>`), { x: 0, w: W, y: 488, parent: s });
    const OFF = T.outro - 17.0;
    cue(T.outro, "outro"); cue(OFF + 17.1, "mark"); cue(OFF + 17.65, "cta"); cue(OFF + 17.85, "cta2");
    scenes.push({
      start: T.outro, end: T.end, offset: OFF, node: s, fadeOut: false,
      update(t) {
        const m = eio(seg(t, 17.0, 17.7));
        setRings(svg, 150 - 102 * m, 0.25 + 0.6 * m + 0.15 * Math.sin((t - 17) * 2.2));
        rings.style.opacity = String(eo(seg(t, 17.0, 17.3)));
        show(mark, seg(t, 17.1, 17.45), 10);
        show(tag, seg(t, 17.35, 17.75));
        show(cta, seg(t, 17.65, 18.0), 12);
        show(bot, seg(t, 17.85, 18.2), 10);
        show(fine, seg(t, 18.0, 18.35), 8);
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
  window.__cues = { timeline: T, cues: CUES.sort((a, b) => a.t - b.t) };
  window.seek(0);
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  window.__ready = true;
})();
