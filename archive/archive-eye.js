/* Archivist's eye: follows mouse, stylus and touches.
 * Visual only. It does not inspect the recovery key or control authorization.
 * Access is validated by the server, and only success closes the eyelids.
 */
(() => {
  "use strict";
  const eye = document.querySelector("#archive-eye");
  const gaze = document.querySelector("#eye-gaze");
  if (!eye || !gaze) return;

  let animationFrame = 0;
  let targetX = 0;
  let targetY = 0;
  let activeTouchId = null;

  const update = () => {
    animationFrame = 0;
    if (eye.classList.contains("is-closed")) return;
    const bounds = eye.getBoundingClientRect();
    const dx = targetX - (bounds.left + bounds.width / 2);
    const dy = targetY - (bounds.top + bounds.height / 2);
    const distance = Math.hypot(dx, dy) || 1;
    const travel = Math.min(13, distance * .055);
    gaze.style.transform = `translate(${dx / distance * travel}px, ${dy / distance * travel}px)`;
  };

  const lookAt = (clientX, clientY) => {
    if (eye.classList.contains("is-closed")) return;
    targetX = clientX;
    targetY = clientY;
    if (!animationFrame) animationFrame = requestAnimationFrame(update);
  };

  document.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch") activeTouchId = event.pointerId;
    lookAt(event.clientX, event.clientY);
  }, { passive: true });

  document.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch" && event.pointerId !== activeTouchId) return;
    lookAt(event.clientX, event.clientY);
  }, { passive: true });

  const endTouch = (event) => {
    if (event.pointerType === "touch" && event.pointerId === activeTouchId) {
      activeTouchId = null;
    }
  };
  document.addEventListener("pointerup", endTouch, { passive: true });
  document.addEventListener("pointercancel", endTouch, { passive: true });

  document.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "mouse" && !eye.classList.contains("is-closed")) {
      gaze.style.transform = "translate(0, 0)";
    }
  }, { passive: true });
})();
