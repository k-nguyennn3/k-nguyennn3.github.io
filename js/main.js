// Small progressive enhancements. Every page still works with JavaScript off.

// ---- Email link ----------------------------------------------------------
// The address is assembled here instead of written in the HTML, so simple
// scrapers that read the page source don't pick it up.
function initEmailLinks() {
  document.querySelectorAll("[data-email-user]").forEach((el) => {
    const address = `${el.dataset.emailUser}@${el.dataset.emailDomain}`;
    el.href = `mailto:${address}`;
    el.hidden = false;
  });
}

// ---- YouTube slots ---------------------------------------------------------
// A slot looks like: <div class="video-slot" data-youtube="" hidden>.
// Leave data-youtube empty and the slot stays hidden (no box, no requests).
// Paste a YouTube link or video ID into data-youtube and it appears as a
// thumbnail that loads the privacy-enhanced player only when clicked.
function youTubeId(value) {
  const v = (value || "").trim();
  if (!v) return null;
  if (/^[\w-]{11}$/.test(v)) return v;
  try {
    const url = new URL(v);
    if (url.hostname.endsWith("youtu.be")) return url.pathname.slice(1, 12) || null;
    if (url.searchParams.get("v")) return url.searchParams.get("v");
    const m = url.pathname.match(/\/(?:embed|shorts|live)\/([\w-]{11})/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

function initVideoSlots() {
  document.querySelectorAll(".video-slot[data-youtube]").forEach((slot) => {
    const id = youTubeId(slot.dataset.youtube);
    if (!id) return; // stays hidden
    const title = slot.dataset.title || "Video";
    const frame = document.createElement("div");
    frame.className = "video-frame";
    const thumb = document.createElement("img");
    thumb.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    thumb.alt = "";
    thumb.loading = "lazy";
    const play = document.createElement("button");
    play.type = "button";
    play.className = "video-play";
    play.setAttribute("aria-label", `Play: ${title}`);
    play.addEventListener("click", () => {
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
      iframe.title = title;
      iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      iframe.allowFullscreen = true;
      frame.replaceChildren(iframe);
    });
    frame.append(thumb, play);
    slot.prepend(frame);
    slot.hidden = false;
  });
}

// ---- Lightbox --------------------------------------------------------------
// Any <a class="zoom" href="large.jpg"><img alt="..."></a> opens full size.
function initLightbox() {
  const links = document.querySelectorAll("a.zoom");
  if (!links.length || typeof HTMLDialogElement !== "function") return;
  const dialog = document.createElement("dialog");
  dialog.className = "lightbox";
  dialog.innerHTML = '<button class="lightbox-close" type="button" aria-label="Close">×</button><img alt=""><p></p>';
  document.body.append(dialog);
  const img = dialog.querySelector("img");
  const caption = dialog.querySelector("p");
  links.forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const inner = a.querySelector("img");
      img.src = a.href;
      img.alt = inner ? inner.alt : "";
      const fig = a.closest("figure");
      const cap = fig && fig.querySelector("figcaption");
      caption.textContent = cap ? cap.textContent : img.alt;
      dialog.showModal();
    });
  });
  // Close on the button, on a backdrop click, or with Esc (built into <dialog>).
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog || e.target.classList.contains("lightbox-close") || e.target === img) dialog.close();
  });
}

// ---- Chart tooltips --------------------------------------------------------
// Any element with data-tip inside a .chart shows a tooltip on hover or focus.
function initChartTips() {
  document.querySelectorAll(".chart").forEach((chart) => {
    const tip = document.createElement("div");
    tip.className = "chart-tip";
    tip.hidden = true;
    tip.setAttribute("role", "status");
    chart.append(tip);
    const show = (el) => {
      const box = chart.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      tip.textContent = el.dataset.tip;
      tip.style.left = `${r.left + r.width / 2 - box.left}px`;
      tip.style.top = `${r.top - box.top}px`;
      tip.hidden = false;
    };
    const hide = () => { tip.hidden = true; };
    chart.querySelectorAll("[data-tip]").forEach((el) => {
      el.addEventListener("pointerenter", () => show(el));
      el.addEventListener("pointerleave", hide);
      el.addEventListener("focus", () => show(el));
      el.addEventListener("blur", hide);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initEmailLinks();
  initVideoSlots();
  initLightbox();
  initChartTips();
});
