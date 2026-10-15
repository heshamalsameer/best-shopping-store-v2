export function flyToCart(from: HTMLElement | null) {
  if (typeof window === "undefined" || !from) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const target = document.querySelector<HTMLElement>("[data-cart-icon]");
  if (!target || target.offsetParent === null) return;

  const a = from.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const dot = document.createElement("span");
  dot.className = "fly-dot";
  dot.style.left = `${a.left + a.width / 2 - 9}px`;
  dot.style.top = `${a.top + a.height / 2 - 9}px`;
  document.body.appendChild(dot);

  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  dot
    .animate(
      [
        { transform: "translate(0,0) scale(1)", opacity: 1 },
        { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 60}px) scale(1.1)`, opacity: 1, offset: 0.5 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.4)`, opacity: 0.6 },
      ],
      { duration: 700, easing: "cubic-bezier(.5,0,.4,1)" }
    )
    .finished.finally(() => dot.remove());
}
