const menuButton = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const navigation = document.querySelector<HTMLElement>('[data-navigation]');

if (menuButton && navigation) {
  const closeMenu = (restoreFocus = false) => {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', '打开导航菜单');
    document.body.classList.remove('menu-open');
    if (restoreFocus) menuButton.focus();
  };

  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.setAttribute('aria-label', isOpen ? '打开导航菜单' : '关闭导航菜单');
    document.body.classList.toggle('menu-open', !isOpen);
    if (!isOpen) navigation.querySelector<HTMLAnchorElement>('a')?.focus();
  });

  navigation.addEventListener('click', (event) => {
    if ((event.target as HTMLElement).closest('a')) closeMenu(true);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      closeMenu(true);
    }
  });

  document.addEventListener('click', (event) => {
    if (
      menuButton.getAttribute('aria-expanded') === 'true' &&
      !(event.target as Node).isSameNode(menuButton) &&
      !navigation.contains(event.target as Node)
    )
      closeMenu();
  });
}

document.querySelectorAll<HTMLButtonElement>('[data-copy-email]').forEach((button) => {
  button.addEventListener('click', async () => {
    const email = button.dataset.copyEmail ?? '';
    const status = document.querySelector<HTMLElement>('[data-copy-status]');
    try {
      await navigator.clipboard.writeText(email);
      if (status) status.textContent = '邮箱已复制';
    } catch {
      if (status) status.textContent = `复制失败，请手动复制：${email}`;
    }
  });
});

const imageDialog = document.querySelector<HTMLDialogElement>('[data-image-dialog]');
const dialogImage = imageDialog?.querySelector<HTMLImageElement>('[data-dialog-image]');
const dialogCaption = imageDialog?.querySelector<HTMLElement>('[data-dialog-caption]');
let imageTrigger: HTMLButtonElement | null = null;

document.querySelectorAll<HTMLButtonElement>('[data-image-open]').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    if (!imageDialog || !dialogImage) return;
    imageTrigger = trigger;
    dialogImage.src =
      trigger.dataset.src ??
      trigger.querySelector<HTMLImageElement>('[data-image-source]')?.currentSrc ??
      '';
    dialogImage.alt = trigger.dataset.alt ?? '';
    if (dialogCaption) dialogCaption.textContent = trigger.dataset.caption ?? '';
    imageDialog.showModal();
  });
});

const closeDialog = imageDialog?.querySelector<HTMLButtonElement>('[data-dialog-close]');
closeDialog?.addEventListener('click', () => imageDialog?.close());
imageDialog?.addEventListener('click', (event) => {
  if (event.target === imageDialog) imageDialog.close();
});
imageDialog?.addEventListener('close', () => {
  imageTrigger?.focus();
  imageTrigger = null;
});

const revealTargets = document.querySelectorAll<HTMLElement>('[data-reveal]');
if (
  revealTargets.length &&
  'IntersectionObserver' in window &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches
) {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          currentObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );
  revealTargets.forEach((element) => observer.observe(element));
}
