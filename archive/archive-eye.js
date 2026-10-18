/* The Archivist's eye: visual-only pointer tracking.
 * Never reads the password and never grants access to records.
 * The recovery script closes the eye only after a successful server response.
 */
(() => {
  "use strict";
  const eye = document.querySelector("#archive-eye");
  const gaze = document.querySelector("#eye-gaze");
  if (!eye || !gaze || !window.matchMedia("(pointer: fine)").matches) return;

  let frame = 0;
  let targetX = 0, targetY = 0;
  const update = () => {
    frame = 0;
    if (eye.classList.contains("is-closed")) return;
    const rect = eye.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = targetX - centerX;
    const dy = targetY - centerY;
    const distance = Math.hypot(dx, dy) || 1;
    const travel = Math.min(13, distance * .055);
    gaze.style.transform = `translate(${dx / distance * travel}px, ${dy / distance * travel}px)`;
  };
  document.addEventListener("pointermove", (event) => {
    if (event.pointerType && event.pointerType !== "mouse" && event.pointerType !== "pen") return;
    if (eye.classList.contains("is-closed")) return;
    targetX = event.clientX;
    targetY = event.clientY;
    if (!frame) frame = requestAnimationFrame(update);
  }, {passive: true});
  document.addEventListener("pointerleave", () => {
    if (!eye.classList.contains("is-closed")) gaze.style.transform = "translate(0, 0)";
  });
})();
