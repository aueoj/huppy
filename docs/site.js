(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const S = n => `sprites/${n}.png`;

  // 미리 불러와서 프레임이 바뀔 때 깜빡이지 않게
  ["idle", "alert", "hold", "happy", "whip", "stretch", "rest"].forEach(n => ["a", "b"].forEach(f => { new Image().src = S(`${n}-${f}`); }));

  // 히어로: 경고 → 유지 → 칭찬 → 스트레칭 → … → 무시 → 채찍
  // cam 은 카메라 창 상태: [상태, 표시, 거리]
  const scenes = [
    { pose: "alert", say: "거북목 나왔어요!\n턱 당기고 목은 뒤로", ms: 2600, cam: ["fwd", "거북목 감지", "44cm"] },
    { pose: "hold", say: "그대로 5초만!", ms: 900, cam: ["ok", "바른 자세", "57cm"] },
    { pose: "hold", say: "그대로 3초만!", ms: 900, cam: ["ok", "바른 자세", "57cm"] },
    { pose: "hold", say: "그대로 1초만!", ms: 900, cam: ["ok", "바른 자세", "57cm"] },
    { pose: "happy", say: "그거예요!", ms: 2200, xp: "+10 XP", cam: ["ok", "바른 자세", "57cm"] },
    { pose: "idle", say: null, ms: 1800, cam: ["off", "카메라 꺼짐\n90초 뒤 다시 볼게요"] },
    { pose: "stretch", say: "스트레칭할 시간!\n두 팔 머리 위로 쭉", ms: 2600, cam: ["arms", "기지개 인식"] },
    { pose: "happy", say: "시원하죠?", ms: 1800, cam: ["arms", "기지개 인식"] },
    { pose: "idle", say: null, ms: 1400, cam: ["off", "카메라 꺼짐\n90초 뒤 다시 볼게요"] },
    { pose: "stretch", say: "스트레칭할 시간!\n두 팔 머리 위로 쭉", ms: 2200, cam: ["look", "손을 찾는 중"] },
    { pose: "whip", say: "건너뛰면 몸 굳어요\n다음엔 꼭 해요", ms: 2400, xp: "-12 XP", cam: ["miss", "기지개 안 함"] },
    { pose: "rest", say: "30분 쉴게요", ms: 2400, cam: ["off", "카메라 꺼짐\n쉬는 중"] },
  ];
  const img = document.querySelector("[data-hero-img]");
  const bubble = document.querySelector("[data-hero-bubble]");
  const xp = document.querySelector("[data-hero-xp]");
  const cam = document.querySelector("[data-cam]");
  let scene = 0, frame = 0, until = 0;
  function show(i) {
    const s = scenes[i];
    const [state, label, dist = ""] = s.cam;
    cam.dataset.state = state;
    document.querySelector(state === "off" ? "[data-cam-off]" : "[data-cam-tag]").textContent = label;
    document.querySelector("[data-cam-dist]").textContent = dist;
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
    5:  ["천사", "+5단계", "\"사랑해!\"", "바른 자세 왕! 여기까지 도달할 수 있을까요?"],
    4:  ["왕관", "+4단계", "\"뽀뽀~\"", "사랑 가득한 허피예요. 잔뜩 쓰다듬어 주세요."],
    3:  ["반짝", "+3단계", "\"나 안아\"", "애정표현이 점점 늘어요."],
    2:  ["새싹", "+2단계", "\"완벽해요!\"", "칭찬이 후해지고 밝은 성격으로 대해요."],
    1:  ["초롱", "+1단계", "\"헤헤 간지러워요\"", "조금씩 귀여워지기 시작해요."],
    0:  ["기본", "시작 단계", "\"턱 당기고 어깨 펴요!\"", "모두 여기서부터 시작해요."],
    "-1": ["삐짐", "-1단계", "\"자세 좀 바로잡아줄래?\"", "친절함은 사라지지만 아직 바로잡을 수 있어요."],
    "-2": ["투덜", "-2단계", "\"좋은 말 할 때 허리펴\"", "슬슬 말투가 차가워져요."],
    "-3": ["꼬질", "-3단계", "\"건들지 마!\"", "꼬질꼬질해지고 잔소리가 늘어요."],
    "-4": ["뿔난", "-4단계", "\"거북이랑 너랑 같이 두면 차이를 모르겠다\"", "성질머리가 좋지 않아요."],
    "-5": ["마왕", "-5단계", "\"갈 데까지 갔구나?\"", "여기까지 왔다면 당신은 거북이 등딱지를 달 자격이 있습니다. 여러모로 대단한 성취일 수 있어요."],
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
