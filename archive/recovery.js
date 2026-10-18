/* Dream Archive client — no recovery keys, secrets, or protected prose belong in this repository.
 * Configure the Cloudflare Worker endpoint via window.DREAM_ARCHIVE_API_BASE before deployment.
 * Example API: POST /recover {record:"047", key:"...."} -> {title, paragraphs:[...], archivistNote:[...]}.
 * The Worker must hold the key and content privately, validate server-side, limit attempts, and set CORS to our origin.
 */
(() => {
  "use strict";
  const form = document.querySelector("#recovery-form");
  const field = document.querySelector("#recovery-key");
  const button = document.querySelector("#recover-button");
  const message = document.querySelector("#message");
  const content = document.querySelector("#record-content");
  const API_BASE = window.DREAM_ARCHIVE_API_BASE || "";
  function status(text, isError = false) { message.textContent = text; message.classList.toggle("error", isError); }
  function paragraphList(parent, paragraphs) {
    for (const line of paragraphs || []) {
      if (typeof line !== "string") continue;
      const p = document.createElement("p");
      p.textContent = line;
      parent.appendChild(p);
    }
  }
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const key = field.value.trim();
    if (!/^\d{4}$/.test(key)) return status("A four-digit key is required.", true);
    if (!API_BASE) return status("Archive retrieval is not available yet.", true);
    button.disabled = true; status("Searching the archive…");
    try {
      const response = await fetch(API_BASE.replace(/\/$/, "") + "/recover", {
        method: "POST", headers: {"Content-Type":"application/json"},
        body: JSON.stringify({record:"047", key}), cache: "no-store"
      });
      if (response.status === 429) throw new Error("Too many attempts. Please return later.");
      if (response.status === 401 || response.status === 403) throw new Error("Access denied. Recovery key not recognized.");
      if (!response.ok) throw new Error("The archive is temporarily unavailable.");
      const data = await response.json();
      if (!data || !Array.isArray(data.paragraphs)) throw new Error("Invalid archive response.");
      content.replaceChildren();
      const heading = document.createElement("h2");
      heading.textContent = data.title || "A Caixa e a Senha";
      content.appendChild(heading);
      paragraphList(content, data.paragraphs);
      if (Array.isArray(data.archivistNote) && data.archivistNote.length) {
        const h = document.createElement("h2"); h.textContent = "Archivist's Note — 047";
        content.appendChild(h); paragraphList(content, data.archivistNote);
      }
      content.classList.add("open"); form.hidden = true;
      document.querySelector("#archive-eye")?.classList.add("is-closed");
      status("ACCESS GRANTED");
      field.value = "";
    } catch (err) {status(err.message || "Unable to retrieve record.", true);}
    finally {button.disabled = false;}
  });
})();