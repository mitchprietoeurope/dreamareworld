/* Reveal official album art when available; keep the original graphic
   placeholders until each corresponding image has been uploaded. */
(() => {
  document.querySelectorAll(".album-art .album-cover").forEach((image) => {
    const frame = image.closest(".album-art");
    const loaded = () => {
      if (image.naturalWidth > 0) frame.classList.add("has-cover");
    };
    image.addEventListener("load", loaded);
    image.addEventListener("error", () => frame.classList.remove("has-cover"));
    if (image.complete) loaded();
  });
})();
