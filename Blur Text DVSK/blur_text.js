window.addEventListener("load", () => {
  const letters = document.querySelectorAll(".letter");
  const star = document.querySelector(".star");
  const letterK = letters[3];
  const container = document.querySelector(".container");

  
  letters.forEach((letter, index) => {
    setTimeout(() => {
      letter.style.opacity = "1";
      letter.style.transform = "translateY(0px)";
      letter.style.filter = "blur(1px)";
    }, index * 650);
  });


  setTimeout(() => {
    star.style.animation = "starFlySmooth 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards";


setTimeout(() => {
  const kRect = letterK.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  const finalX = kRect.right - containerRect.left + 10;
  const finalY = kRect.top - containerRect.top - 2;

  
  star.style.transition =
    " opacity 0.2s ease-out, filter 0.2s ease-out";

  star.style.animation = "none";
  star.style.left = finalX + "px";
  star.style.top = finalY + "px";


  star.style.opacity = "1";
  star.style.filter = "blur(3px)";
  star.style.transform = "scale(1)";
}, 1000);


  }, letters.length * 850 + 200);

});
