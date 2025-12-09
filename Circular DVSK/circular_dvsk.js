const text = document.querySelector(".button__text");
const button = document.querySelector(".button");

let rotation = 0;
let speed = 0.05; // normal speed
let lastTime = null;

function animate(time) {
  if (lastTime != null) {
    const delta = time - lastTime;
    rotation += speed * delta;
    text.style.transform = `rotate(${rotation}deg)`;
  }
  lastTime = time;
  requestAnimationFrame(animate);
}

button.addEventListener("mouseenter", () => {
  speed = 0.10; // faster rotation on hover
});

button.addEventListener("mouseleave", () => {
  speed = 0.05; // return to normal speed
});

requestAnimationFrame(animate);

const circle = document.querySelector(".button__circle");

circle.addEventListener("click", () => {
  location.reload(); // refreshes the page
});

