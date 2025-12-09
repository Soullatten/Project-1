/* ===============================
   CONFIG
================================ */
const marqueeText = " ★ DVSK — LIMITED DROP — EXCLUSIVE — ";
const speed = 1.5;          // auto movement speed
const interactive = true;   // drag to slide
const curveAmount = 400;    // adjust arc curve

/* ===============================
   ELEMENTS
================================ */
const measure = document.getElementById("measureText");
const textPath = document.getElementById("textPath");
const container = document.getElementById("loop-container");

/* ===============================
   CREATE THE CURVE PATH
================================ */
const curvePath = document.getElementById("curvePath");
curvePath.setAttribute("d", `M-100,60 Q500,${60 + curveAmount} 1540,60`);

/* ===============================
   MEASURE TEXT LENGTH
================================ */
measure.textContent = marqueeText;
let spacing = 0;
let offset = 0;

function updateSpacing() {
  spacing = measure.getComputedTextLength();
}

/* Create long repeated string */
function generateLoopText() {
  if (spacing === 0) return marqueeText;
  const repeatCount = Math.ceil(1800 / spacing) + 3;
  return marqueeText.repeat(repeatCount);
}

/* ===============================
   INFINITE LOOP MOVEMENT
================================ */
function animate() {
  offset -= speed;
  if (offset <= -spacing) offset += spacing;
  textPath.setAttribute("startOffset", offset + "px");
  requestAnimationFrame(animate);
}

/* ===============================
   DRAG INTERACTION
================================ */
let dragging = false;
let lastX = 0;

container.addEventListener("pointerdown", (e) => {
  if (!interactive) return;
  dragging = true;
  lastX = e.clientX;
  container.style.cursor = "grabbing";
});

container.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  const dx = e.clientX - lastX;
  lastX = e.clientX;

  offset += dx;
  if (offset <= -spacing) offset += spacing;
  if (offset >= spacing) offset -= spacing;

  textPath.setAttribute("startOffset", offset + "px");
});

container.addEventListener("pointerup", () => {
  dragging = false;
  container.style.cursor = "grab";
});

container.addEventListener("pointerleave", () => {
  dragging = false;
  container.style.cursor = "grab";
});

/* ===============================
   INIT
================================ */
updateSpacing();
const finalText = generateLoopText();
textPath.textContent = finalText;

requestAnimationFrame(animate);
