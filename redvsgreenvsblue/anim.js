import { fillArray, pause, setBet } from "./rockPaperCisors.js";
import { canvas } from "./draw.js";
const winRef = document.getElementById("win");
const loseRef = document.getElementById("lose");
const selectRef = document.getElementById("select");

const restartWinRef = document.getElementById("restartWin");
const restartLoseRef = document.getElementById("restartLose");
const restartRef = document.getElementById("restart");

const redButton = document.getElementById("redButton");
const greenButton = document.getElementById("greenButton");
const blueButton = document.getElementById("blueButton");

restartWinRef.addEventListener("click", select);
restartLoseRef.addEventListener("click", select);
restartRef.addEventListener("click", restart);

redButton.addEventListener("click", () => {
  setBet("red");
  redButton.classList.add("selected");
  greenButton.classList.remove("selected");
  blueButton.classList.remove("selected");
  console.log("red");
});
greenButton.addEventListener("click", () => {
  setBet("green");
  redButton.classList.remove("selected");
  greenButton.classList.add("selected");
  blueButton.classList.remove("selected");
});
blueButton.addEventListener("click", () => {
  setBet("blue");
  redButton.classList.remove("selected");
  greenButton.classList.remove("selected");
  blueButton.classList.add("selected");
});

export function win() {
  gsap.to(winRef, { y: 0, duration: 1, ease: "expo.out" });
}
export function lose() {
  gsap.to(loseRef, { y: 0, duration: 1, ease: "expo.out" });
}
export function select() {
  gsap.to(selectRef, { y: 0, duration: 1, ease: "expo.out" });
  gsap.to(winRef, { y: "-100%", duration: 1, ease: "expo.out" });
  gsap.to(loseRef, { y: "-100%", duration: 1, ease: "expo.out" });
}
export function restart() {
  gsap.to(selectRef, { y: "-100%", duration: 1, ease: "expo.out" });
  redButton.classList.remove("selected");
  greenButton.classList.remove("selected");
  blueButton.classList.remove("selected");
  fillArray();
  pause();
}
select();

gsap.fromTo(
  "#reveal",
  {
    clipPath: "inset(0% 0% 0% 0%)",
  },
  {
    clipPath: "inset(0% 0% 100% 0%)",
    delay: 0.2,
    duration: 0.5,
    ease: "expo.inOut",
    onComplete: () => {
      gsap.set("#reveal", {
        clipPath: "none",
        display: "none",
      });
    },
  }
);
