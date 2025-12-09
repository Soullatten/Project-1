const items = [
  { text: "DVSK", link: "../Admin_DVSK/DVSK/dvsk.html", image: "https://picsum.photos/300?1" },
  { text: "Tops", link: "#", image: "https://picsum.photos/300?2" },
  { text: "Bottoms", link: "#", image: "https://picsum.photos/300?3" },
  { text: "Jersey", link: "#", image: "https://picsum.photos/300?4" },
];

const menu = document.getElementById("menu");

const itemRefs = [];
const marqueeRefs = [];
const marqueeInnerRefs = [];

items.forEach((item, idx) => {
  // create item wrapper
  const itemDiv = document.createElement("div");
  itemDiv.className = "menu-item";
  itemRefs[idx] = itemDiv;

  // link
  const link = document.createElement("a");
  link.className = "menu-link";
  link.textContent = item.text;
  link.href = item.link;

  // marquee
  const marquee = document.createElement("div");
  marquee.className = "marquee";
  marqueeRefs[idx] = marquee;

  const inner = document.createElement("div");
  inner.className = "marquee-inner";
  marqueeInnerRefs[idx] = inner;

  const track = document.createElement("div");
  track.className = "track";

  // repeat 4 times exactly like Vue
  for (let i = 0; i < 4; i++) {
    const text = document.createElement("span");
    text.textContent = item.text;

    const img = document.createElement("div");
    img.className = "track-img";
    img.style.backgroundImage = `url(${item.image})`;

    track.appendChild(text);
    track.appendChild(img);
  }

  inner.appendChild(track);
  marquee.appendChild(inner);
  itemDiv.appendChild(link);
  itemDiv.appendChild(marquee);
  menu.appendChild(itemDiv);

  /* -------------------------------------
       REPLICA: Mouse Enter Behavior
     ------------------------------------- */
  link.addEventListener("mouseenter", (ev) => {
    const rect = itemDiv.getBoundingClientRect();
    const mouseX = ev.clientX - rect.left;
    const mouseY = ev.clientY - rect.top;

    const edge = findClosestEdge(mouseX, mouseY, rect.width, rect.height);

    gsap.set(marquee, { y: edge === "top" ? "-101%" : "101%" });
    gsap.set(inner, { y: edge === "top" ? "101%" : "-101%" });

    gsap.to([marquee, inner], {
      y: "0%",
      duration: 0.6,
      ease: "expo.out",
    });
  });

  /* -------------------------------------
       REPLICA: Mouse Leave Behavior
     ------------------------------------- */
  link.addEventListener("mouseleave", (ev) => {
    const rect = itemDiv.getBoundingClientRect();
    const mouseX = ev.clientX - rect.left;
    const mouseY = ev.clientY - rect.top;

    const edge = findClosestEdge(mouseX, mouseY, rect.width, rect.height);

    gsap.to(marquee, {
      y: edge === "top" ? "-101%" : "101%",
      duration: 0.6,
      ease: "expo.out",
    });

    gsap.to(inner, {
      y: edge === "top" ? "101%" : "-101%",
      duration: 0.6,
      ease: "expo.out",
    });
  });
});

/* -------- closest edge (EXACT math) -------- */
function findClosestEdge(mouseX, mouseY, width, height) {
  const top = (mouseX - width / 2) ** 2 + mouseY ** 2;
  const bottom = (mouseX - width / 2) ** 2 + (mouseY - height) ** 2;
  return top < bottom ? "top" : "bottom";
}
