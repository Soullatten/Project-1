const wrapper = document.querySelector(".wrapper");
const printBtn = document.querySelector(".print-button");

printBtn.addEventListener("click", () => {
  wrapper.classList.add("printing");

  // Reset after animation ends (optional)
  setTimeout(() => {
    wrapper.classList.remove("printing");
  }, 1500);
});
