document.addEventListener("DOMContentLoaded", () => {
  const elements = document.querySelectorAll(".shiny-text");

  elements.forEach((el) => {
    const text = el.dataset.text || "";
    const disabled = el.dataset.disabled === "true";
    const speed = Number(el.dataset.speed) || 5;
    const className = el.dataset.class || "";

    // Vue-style text bind
    el.textContent = text;

    // Apply extra className (same as props.className)
    if (className) el.classList.add(...className.split(" "));

    // EXACT SAME: animation only if disabled == false
    if (!disabled) {
      el.classList.add("animate-shine");
      el.style.animationDuration = `${speed}s`;
    }
  });
});
