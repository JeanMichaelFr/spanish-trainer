let verbs = [];
let index = 0;

let started = false;
let testMode = false;
let mode = "PL-ES";
let speaking = false;
let loopActive = false;
let waitingForAnswer = false;

const bottomStrip = document.getElementById("bottomStrip");
const stripLeft = document.getElementById("stripLeft");
const stripCurrent = document.getElementById("stripCurrent");
const stripRight = document.getElementById("stripRight");

const LONG_BREAK = 1500; // pausa más larga entre pronunciaciones

const verbsBtn = document.getElementById("verbsBtn");
const trainer = document.getElementById("trainer");
const modeBtn = document.getElementById("modeBtn");
const testBtn = document.getElementById("testBtn");

const line1 = document.getElementById("line1");
const line2 = document.getElementById("line2");

fetch("verbs.json")
  .then(r => r.json())
  .then(data => verbs = data);

function speak(text, lang) {
  return new Promise(resolve => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.onend = () => setTimeout(resolve, LONG_BREAK);
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  });
}

function updateBottomStrip() {
  if (!started) return;

  bottomStrip.classList.remove("hidden");

  stripLeft.innerHTML = "";
  stripRight.innerHTML = "";

  for (let i = 3; i > 0; i--) {
    const v = verbs[index - i];
    if (v) {
      const span = document.createElement("span");
      span.className = "strip-item";
      span.textContent = v.polish;
      stripLeft.appendChild(span);
    }
  }

  const current = verbs[index];
  stripCurrent.textContent = current ? current.polish : "";

  for (let i = 1; i <= 3; i++) {
    const v = verbs[index + i];
    if (v) {
      const span = document.createElement("span");
      span.className = "strip-item";
      span.textContent = v.polish;
      stripRight.appendChild(span);
    }
  }
}

function updateDisplay(v) {
  if (mode === "PL-ES") {
    line1.textContent = `PL: ${v.polish}`;
    line2.textContent = `ES: ${v.english}`;
  } else {
    line1.textContent = `ES: ${v.english}`;
    line2.textContent = `PL: ${v.polish}`;
  }
  updateBottomStrip();
}

async function endlessLoop() {
  if (loopActive) return;
  loopActive = true;

  while (loopActive && !testMode) {
    const v = verbs[index];
    updateDisplay(v);

    if (mode === "PL-ES") {
      await speak(v.polish, "pl-PL");
      await speak(v.english, "es-ES");
    } else {
      await speak(v.english, "es-ES");
      await speak(v.polish, "pl-PL");
    }

    index = (index + 1) % verbs.length;
  }
}

async function pronounceCurrentTest() {
  const v = verbs[index];
  updateDisplay(v);
  waitingForAnswer = true;

  if (mode === "PL-ES") {
    await speak(v.polish, "pl-PL");
  } else {
    await speak(v.english, "es-ES");
  }
}

async function revealAnswer() {
  if (!waitingForAnswer || !testMode) return;

  const v = verbs[index];
  waitingForAnswer = false;

  if (mode === "PL-ES") {
    await speak(v.english, "es-ES");
  } else {
    await speak(v.polish, "pl-PL");
  }
}

function prevVerb() {
  if (index > 0) index--;
  updateDisplay(verbs[index]);
  if (testMode) {
    pronounceCurrentTest();
  }
}

function nextVerb() {
  if (index < verbs.length - 1) index++;
  updateDisplay(verbs[index]);
  if (testMode) {
    pronounceCurrentTest();
  }
}

verbsBtn.onclick = () => {
  if (started) return;
  started = true;
  verbsBtn.classList.add("hidden");
  trainer.classList.remove("hidden");
  endlessLoop();
};

modeBtn.onclick = () => {
  mode = mode === "PL-ES" ? "ES-PL" : "PL-ES";
  modeBtn.textContent = mode === "PL-ES" ? "PL → ES" : "ES → PL";

  speechSynthesis.cancel();
  waitingForAnswer = false;
  loopActive = false;

  if (testMode) {
    pronounceCurrentTest();
  } else {
    endlessLoop();
  }
};

testBtn.onclick = () => {
  testMode = !testMode;
  testBtn.textContent = testMode ? "Test: ACTIVADO" : "Test: DESACTIVADO";

  speechSynthesis.cancel();
  waitingForAnswer = false;
  loopActive = false;

  if (testMode) {
    pronounceCurrentTest();
  } else {
    endlessLoop();
  }
};

document.addEventListener("click", e => {
  const w = window.innerWidth;
  const x = e.clientX;

  if (x < w * 0.4) {
    prevVerb();
  } else if (x > w * 0.6) {
    nextVerb();
  } else if (testMode && waitingForAnswer) {
    revealAnswer();
  }
});
