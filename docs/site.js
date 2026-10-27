(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const S = n => `sprites/${n}.png`;

  // 미리 불러와서 프레임이 바뀔 때 깜빡이지 않게
  ["idle", "alert", "hold", "happy", "whip", "stretch", "rest"].forEach(n => ["a", "b"].forEach(f => { new Image().src = S(`${n}-${f}`); }));

  // 히어로: 경고 → 유지 → 칭찬 → … → 무시 → 채찍
  const scenes = [
    { pose: "alert", say: "거북목 나왔어요!\n턱 당기고 목은 뒤로", ms: 2600 },
    { pose: "hold", say: "그대로 5초만!", ms: 900 },
    { pose: "hold", say: "그대로 3초만!", ms: 900 },
    { pose: "hold", say: "그대로 1초만!", ms: 900 },
    { pose: "happy", say: "그거예요!", ms: 2200, xp: "+10 XP" },
    { pose: "idle", say: null, ms: 1800 },
    { pose: "stretch", say: "스트레칭할 시간\n두 팔 머리 위로 쭉", ms: 2600 },
    { pose: "whip", say: "건너뛰면 몸 굳어요\n다음엔 꼭 해요", ms: 2400, xp: "-12 XP" },
    { pose: "rest", say: "30분 쉴게요", ms: 2400 },
  ];
  const img = document.querySelector("[data-hero-img]");
  const bubble = document.querySelector("[data-hero-bubble]");
  const xp = document.querySelector("[data-hero-xp]");
  let scene = 0, frame = 0, until = 0;
  function show(i) {
    const s = scenes[i];
    bubble.classList.toggle("hide", !s.say);
    if (s.say) bubble.textContent = s.say;
    xp.classList.remove("on", "minus");
    if (s.xp) {
      xp.textContent = s.xp;
      xp.classList.toggle("minus", s.xp.startsWith("-"));
      requestAnimationFrame(() => xp.classList.add("on"));
    }
    until = performance.now() + s.ms;
  }
  show(0);
  if (!reduce) {
    setInterval(() => {
      frame ^= 1;
      img.src = S(`${scenes[scene].pose}-${frame ? "b" : "a"}`);
      if (performance.now() > until) { scene = (scene + 1) % scenes.length; show(scene); }
    }, 250);
  }

  // 진화 · 흑화 슬라이더
  const stages = {
    5:  ["천사", "+5단계", "\"뽀뽀!\"", "끝까지 잘 지킨 사람만 만나요. 이미 반했대요."],
    4:  ["왕관", "+4단계", "\"나 안아\"", "금빛 몸에 왕관. 쓰다듬으면 하트가 떠요."],
    3:  ["반짝", "+3단계", "\"안아줘요\"", "몸이 밝아지고 애정 표현이 시작돼요."],
    2:  ["새싹", "+2단계", "\"저 좋아요?\"", "머리에 새싹이 돋아요."],
    1:  ["초롱", "+1단계", "\"헤헤 간지러워요\"", "눈이 초롱초롱."],
    0:  ["기본", "시작 단계", "\"거북목 나왔어요! 턱 당기고 목은 뒤로\"", "모두 여기서 시작."],
    "-1": ["삐짐", "-1단계", "\"왜 찔러! 참나\"", "눈매가 사나워지고 말투가 딱딱해져요."],
    "-2": ["투덜", "-2단계", "\"거북목 또 나왔어! 바보야\"", "몸이 어두워지고 바보야와 메롱이 나와요."],
    "-3": ["꼬질", "-3단계", "\"거북목 집어넣어라! 으휴\"", "얼룩이 생기고 잔소리가 늘어요."],
    "-4": ["뿔난", "-4단계", "\"건들지 마!\"", "뿔이 나요. 손대면 화내고 한 번만 걸려도 바로 경고."],
    "-5": ["마왕", "-5단계", "\"바보야 미워! 그래서 내가 이 모양이잖아\"", "바른 자세로만 되돌릴 수 있어요."],
  };
  const range = document.querySelector("[data-evo-range]");
  const ticks = document.querySelector("[data-evo-ticks]");
  const file = n => S(`stage${n < 0 ? "m" : "p"}${Math.abs(n)}`);
  for (let n = -5; n <= 5; n++) {
    new Image().src = file(n);
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", `${n > 0 ? "+" + n : n}단계 ${stages[n][0]}`);
    b.innerHTML = `<img class="px" src="${file(n)}" alt=""><span>${n > 0 ? "+" + n : n}</span>`;
    b.addEventListener("click", () => { range.value = n; setStage(n); });
    ticks.appendChild(b);
  }
  function setStage(n) {
    const [name, tag, quote, desc] = stages[n];
    document.querySelector("[data-evo-img]").src = file(n);
    document.querySelector("[data-evo-name]").textContent = `${n > 0 ? "+" + n : n} ${name}`;
    document.querySelector("[data-evo-tag]").textContent = tag;
    document.querySelector("[data-evo-quote]").textContent = quote;
    document.querySelector("[data-evo-desc]").textContent = desc;
    [...ticks.children].forEach((b, i) => b.setAttribute("aria-current", String(i - 5 === n)));
  }
  range.addEventListener("input", () => setStage(Number(range.value)));
  setStage(0);

  // Windows 면 Windows 설치 파일을 앞에, 휴대폰이면 PC에서 받으라고 안내한다
  const ua = navigator.userAgent;
  const base = "https://github.com/aueoj/huppy/releases/latest/download/";
  const isWin = /Windows/.test(ua);
  const os = isWin
    ? { file: "Huppy-windows-setup.exe", label: "Windows용 다운로드", meta: "Windows 10·11 (64비트)" }
    : { file: "Huppy-mac.zip", label: "Mac용 다운로드", meta: "macOS 14 이상 · Apple 실리콘과 인텔" };
  if (isWin) {
    document.querySelectorAll('a[data-dl][href*="/releases/"]').forEach(a => { a.href = base + os.file; });
    const alt = document.querySelector("[data-dl-alt]");
    alt.href = base + "Huppy-mac.zip";
    alt.textContent = "Mac용 다운로드";
  }
  const label = /iPhone|iPad|Android/.test(ua) ? "PC에서 받아주세요" : os.label;
  document.querySelectorAll("[data-dl-label]").forEach(el => { el.textContent = label; });

  // 최신 버전·크기
  fetch("https://api.github.com/repos/aueoj/huppy/releases/latest")
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(rel => {
      const asset = (rel.assets || []).find(a => a.name === os.file);
      document.querySelector("[data-version]").textContent = rel.tag_name;
      if (asset) {
        const mb = (asset.size / 1048576).toFixed(1);
        document.querySelector("[data-meta]").textContent = `${rel.tag_name} · ${mb}MB · ${os.meta} · 무료`;
      }
    })
    .catch(() => {});
})();
