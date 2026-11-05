const slides = [...document.querySelectorAll('.deck-slide')];
const viewport = document.querySelector('#deck-viewport');
const count = document.querySelector('#slide-count');
const progress = document.querySelector('#deck-progress');
const dots = document.querySelector('#slide-dots');
const previous = document.querySelector('[data-action="previous"]');
const next = document.querySelector('.nav-next');
let activeIndex = Math.max(0, Math.min(slides.length - 1, Number(location.hash.match(/slide-(\d+)/)?.[1] || 1) - 1));

function renderSlide(index, updateHash = true) {
  activeIndex = Math.max(0, Math.min(slides.length - 1, index));
  slides.forEach((slide, i) => {
    const active = i === activeIndex;
    slide.classList.toggle('is-active', active);
    slide.setAttribute('aria-hidden', String(!active));
    slide.setAttribute('aria-label', `Slide ${i + 1} of ${slides.length}: ${slide.dataset.title}`);
  });
  count.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  progress.style.width = `${((activeIndex + 1) / slides.length) * 100}%`;
  previous.disabled = activeIndex === 0;
  next.disabled = activeIndex === slides.length - 1;
  [...dots.children].forEach((dot, i) => dot.setAttribute('aria-current', String(i === activeIndex)));
  viewport.scrollTop = 0;
  // Local file decks can run under opaque origins where History API URL
  // updates are rejected. Navigation works without a hash in that case.
  if (updateHash && location.protocol !== 'file:') history.replaceState(null, '', `#slide-${activeIndex + 1}`);
}

slides.forEach((slide, index) => {
  const dot = document.createElement('button');
  dot.type = 'button';
  dot.className = 'slide-dot';
  dot.setAttribute('aria-label', `Go to slide ${index + 1}: ${slide.dataset.title}`);
  dot.addEventListener('click', () => renderSlide(index));
  dots.append(dot);
});

document.addEventListener('click', event => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'next') renderSlide(activeIndex + 1);
  if (action === 'previous') renderSlide(activeIndex - 1);
  if (action === 'restart') renderSlide(0);
});

document.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input,textarea,select,[contenteditable="true"]')) return;
  if (event.key === ' ' && event.target.closest('a,button')) return;
  if (['ArrowRight', 'PageDown', ' '].includes(event.key)) {
    event.preventDefault();
    renderSlide(activeIndex + 1);
  } else if (['ArrowLeft', 'PageUp'].includes(event.key)) {
    event.preventDefault();
    renderSlide(activeIndex - 1);
  } else if (event.key === 'Home') {
    renderSlide(0);
  } else if (event.key === 'End') {
    renderSlide(slides.length - 1);
  }
});

window.addEventListener('hashchange', () => {
  const requested = Number(location.hash.match(/slide-(\d+)/)?.[1] || 1) - 1;
  if (requested !== activeIndex) renderSlide(requested, false);
});

renderSlide(activeIndex, false);
