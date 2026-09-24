import "./style.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

gsap.registerPlugin(ScrollTrigger);

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = window.matchMedia("(pointer: fine)").matches;

const notes = {
  concrete: "Board-formed. The mould stays visible.",
  marble: "Honed. Used only where the hand rests.",
  oak: "Quarter-sawn. Oiled, never glossed.",
  travertine: "Vein-cut. Warm, and slow to age.",
  steel: "Brushed. The drawn line, made solid.",
};

function bootScroll() {
  if (reduce) return null;
  const scroll = new Lenis({ lerp: 0.08, smoothWheel: true, wheelMultiplier: 0.9 });
  scroll.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => scroll.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return scroll;
}

function arm(selector) {
  document.querySelectorAll(selector).forEach((path) => {
    if (typeof path.getTotalLength !== "function") return;
    let length = 0;
    try { length = path.getTotalLength(); } catch { return; }
    if (!length) return;
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = reduce ? "0" : `${length}`;
  });
}

function cursor() {
  if (!fine || reduce) return;
  document.body.classList.add("has-cursor");
  const root = document.querySelector("#cursor");
  const ring = root.querySelector(".cursor-ring");
  const label = root.querySelector(".cursor-label");
  const x = gsap.quickTo(ring, "x", { duration: 0.4, ease: "power3.out" });
  const y = gsap.quickTo(ring, "y", { duration: 0.4, ease: "power3.out" });
  window.addEventListener("mousemove", (event) => {
    x(event.clientX);
    y(event.clientY);
  });
  document.querySelectorAll("[data-cursor]").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      label.textContent = el.dataset.cursor;
      root.classList.add("is-hot");
    });
    el.addEventListener("mouseleave", () => root.classList.remove("is-hot"));
  });
}

function closeMenu(scroll) {
  document.querySelector("#menu")?.classList.remove("is-open");
  const btn = document.querySelector("#menu-btn");
  btn?.setAttribute("aria-expanded", "false");
  btn?.setAttribute("aria-label", "Open menu");
  document.body.classList.remove("overflow-hidden");
  scroll?.start();
}

function navigation(scroll) {
  const btn = document.querySelector("#menu-btn");
  const menu = document.querySelector("#menu");
  btn?.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") === "true";
    if (open) closeMenu(scroll);
    else {
      menu.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
      btn.setAttribute("aria-label", "Close menu");
      document.body.classList.add("overflow-hidden");
      scroll?.stop();
    }
  });
  document.querySelectorAll("[data-scroll]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href.length < 2) return;
      event.preventDefault();
      closeMenu(scroll);
      if (scroll) scroll.scrollTo(href, { duration: 1.4 });
      else document.querySelector(href)?.scrollIntoView();
    });
  });
}

function hero() {
  const frame = document.querySelector("#hero-frame");
  const photo = document.querySelector("#hero-photo");
  arm(".hero-line");
  if (!reduce) {
    gsap.to(".hero-line", { strokeDashoffset: 0, duration: 2.2, stagger: 0.08, ease: "power2.inOut", delay: 0.2 });
    gsap.from(".mask > span", { yPercent: 112, duration: 1.25, stagger: 0.07, ease: "power3.out" });
    gsap.from(".fade", { opacity: 0, y: 14, duration: 1, stagger: 0.08, delay: 0.55, ease: "power2.out" });
  }
  if (fine && frame && photo && !reduce) {
    frame.addEventListener("mousemove", (event) => {
      const rect = frame.getBoundingClientRect();
      const dx = (event.clientX - rect.left) / rect.width - 0.5;
      const dy = (event.clientY - rect.top) / rect.height - 0.5;
      gsap.to(photo, { xPercent: dx * -4, yPercent: dy * -3, duration: 0.9, ease: "power2.out" });
    });
    frame.addEventListener("mouseleave", () => {
      gsap.to(photo, { xPercent: 0, yPercent: 0, duration: 1, ease: "power3.out" });
    });
  }
}

function sheet() {
  arm("#drawing .draw");
  const photo = document.querySelector("#drawing-photo");
  if (reduce) {
    if (photo) photo.style.opacity = "1";
    return;
  }
  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: "#drawing",
      start: "top top",
      end: window.innerWidth < 1024 ? "+=90%" : "+=160%",
      pin: window.innerWidth >= 1024,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });
  timeline
    .to("#drawing .draw", { strokeDashoffset: 0, stagger: 0.03, duration: 1, ease: "none" })
    .to("#drawing-photo", { opacity: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "none" }, "-=0.25")
    .to("#drawing svg", { opacity: 0.2, duration: 0.4, ease: "none" }, "<");
}

function gallery() {
  const mm = gsap.matchMedia();
  mm.add("(min-width: 1024px)", () => {
    if (reduce) return;
    const track = document.querySelector("#work-track");
    const distance = () => track.scrollWidth - window.innerWidth;
    gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: "#work",
        start: "top top",
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.7,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
  });
}

function studio() {
  if (reduce) return;
  gsap.from("#rule", {
    scaleY: 0,
    transformOrigin: "top",
    ease: "none",
    scrollTrigger: { trigger: "#studio", start: "top 65%", end: "bottom 70%", scrub: 1 },
  });
  gsap.utils.toArray("[data-rise]").forEach((el) => {
    gsap.from(el, {
      y: 28,
      opacity: 0,
      duration: 1.1,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
    });
  });
}

function materials() {
  const buttons = document.querySelectorAll("[data-mat]");
  const shots = document.querySelectorAll(".mat-shot");
  const note = document.querySelector("#mat-note");
  const choose = (key) => {
    buttons.forEach((btn) => {
      const on = btn.dataset.mat === key;
      btn.classList.toggle("is-on", on);
      btn.classList.toggle("text-ink", on);
      btn.classList.toggle("text-stone", !on);
    });
    shots.forEach((img) => { img.style.opacity = img.dataset.mat === key ? "1" : "0"; });
    if (note) note.textContent = notes[key];
  };
  buttons.forEach((btn) => {
    btn.addEventListener("mouseenter", () => choose(btn.dataset.mat));
    btn.addEventListener("focus", () => choose(btn.dataset.mat));
    btn.addEventListener("click", () => choose(btn.dataset.mat));
  });
}

function process() {
  arm("#process .draw");
  gsap.set("#spine", { scaleY: reduce ? 1 : 0, transformOrigin: "top" });
  if (reduce) return;
  gsap.to("#spine", {
    scaleY: 1,
    ease: "none",
    scrollTrigger: { trigger: "#process", start: "top 55%", end: "bottom 75%", scrub: 1 },
  });
  document.querySelectorAll("#process .stage").forEach((stage) => {
    gsap.to(stage.querySelectorAll(".draw"), {
      strokeDashoffset: 0,
      duration: 1.3,
      stagger: 0.06,
      ease: "power2.out",
      scrollTrigger: { trigger: stage, start: "top 80%" },
    });
  });
}

function year() {
  const node = document.querySelector("#year");
  if (!node) return;
  if (reduce) {
    node.textContent = "2014";
    return;
  }
  const state = { value: 2000 };
  gsap.to(state, {
    value: 2014,
    duration: 1.4,
    ease: "power2.out",
    scrollTrigger: { trigger: "#colophon", start: "top 80%" },
    onUpdate: () => { node.textContent = String(Math.round(state.value)); },
  });
}

const scroll = bootScroll();
cursor();
navigation(scroll);
hero();
sheet();
gallery();
studio();
materials();
process();
year();
ScrollTrigger.refresh();
