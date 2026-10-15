(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const body = document.body;
  const root = document.documentElement;

  // Restore the visitor's preferred appearance before the page becomes interactive.
  const storedTheme = localStorage.getItem('metrauiThemeMode')
    || localStorage.getItem('metra-landing-theme');
  const initialTheme = storedTheme === 'dark' ? 'dark' : 'light';
  const previewSettings = {
    theme: initialTheme,
    menuSurface: initialTheme === 'dark' ? 'transparent' : 'dark',
    headerSurface: initialTheme === 'dark' ? 'transparent' : 'light'
  };
  let projectFrame = null;
  const applyProjectSettings = () => {
    const frames = [projectFrame, ...$$('.dashboard-live-frame')].filter(Boolean);
    frames.forEach((frame) => {
      try {
        const previewDocument = frame.contentDocument;
        if (!previewDocument) return;
        const html = previewDocument.documentElement;
        const previewStorage = frame.contentWindow.localStorage;
        previewStorage.setItem('metrauiThemeMode', previewSettings.theme);
        if (previewSettings.theme === 'dark') {
          previewStorage.setItem('metrauidarktheme', 'true');
          previewStorage.removeItem('metrauilighttheme');
        } else {
          previewStorage.removeItem('metrauidarktheme');
          previewStorage.setItem('metrauilighttheme', 'true');
        }
        html.setAttribute('data-theme-color', previewSettings.theme);
        html.setAttribute('data-menu-color', previewSettings.menuSurface);
        html.setAttribute('data-header-color', previewSettings.headerSurface);
      } catch {
        // Each live preview may be navigating while a dashboard page loads.
      }
    });
  };
  const settlePreviewTheme = () => {
    [0, 120, 450].forEach((delay) => window.setTimeout(applyProjectSettings, delay));
  };
  body.classList.toggle('dark-mode', initialTheme === 'dark');
  root.classList.toggle('dark-mode', initialTheme === 'dark');
  root.setAttribute('data-theme-color', initialTheme);
  const themeToggle = $('.theme-toggle');
  const themeIcon = $('.theme-icon i');
  const updateThemeControl = () => {
    const dark = body.classList.contains('dark-mode');
    themeIcon.className = dark ? 'ri-sun-line' : 'ri-moon-line';
    themeToggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    themeToggle.title = dark ? 'Switch to light theme' : 'Switch to dark theme';
  };
  updateThemeControl();
  const setTheme = (theme) => {
    const dark = theme === 'dark';
    body.classList.toggle('dark-mode', theme === 'dark');
    root.classList.toggle('dark-mode', dark);
    root.setAttribute('data-theme-color', theme);
    localStorage.setItem('metra-landing-theme', theme);
    // Dashboard pages read these shared preferences before their styles load.
    localStorage.setItem('metrauiThemeMode', theme);
    if (dark) {
      localStorage.setItem('metrauidarktheme', 'true');
      localStorage.removeItem('metrauilighttheme');
    } else {
      localStorage.removeItem('metrauidarktheme');
      localStorage.setItem('metrauilighttheme', 'true');
    }
    previewSettings.theme = theme;
    previewSettings.menuSurface = theme === 'dark' ? 'transparent' : 'dark';
    previewSettings.headerSurface = theme === 'dark' ? 'transparent' : 'light';
    applyProjectSettings();
    requestAnimationFrame(settlePreviewTheme);
    settlePreviewTheme();
    updateThemeControl();
  };
  const toggleTheme = () => setTheme(body.classList.contains('dark-mode') ? 'light' : 'dark');
  themeToggle.addEventListener('click', toggleTheme);
  $('#demo-theme').addEventListener('click', toggleTheme);

  const menuButton = $('.menu-toggle');
  const navigation = $('.main-nav');
  menuButton.addEventListener('click', () => {
    const open = navigation.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  $$('.main-nav a').forEach((link) => link.addEventListener('click', () => {
    navigation.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }));

  const header = $('.site-header');
  const backTop = $('#back-top');
  const updateScrollState = () => {
    header.classList.toggle('scrolled', window.scrollY > 12);
    backTop.classList.toggle('visible', window.scrollY > 500);
  };
  window.addEventListener('scroll', updateScrollState, { passive: true });
  updateScrollState();
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // `#top` is the sticky header, so native fragment navigation may consider it
  // visible even while the page content is scrolled down. Always return to the
  // document origin for the Home, brand, and footer top links.
  $$('a[href="#top"]').forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    history.replaceState(null, '', '#top');
  }));

  // Reveal sections only as they approach the viewport.
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08 });
  $$('.reveal').forEach((element) => revealObserver.observe(element));

  // Keep the gallery light: full dashboards only open from their direct links.
  $$('.dashboard-live-frame').forEach((frame) => {
    const container = frame.closest('.dashboard-live-preview, .app-live-preview');
    const filename = frame.dataset.livePreview.split('/').pop().replace(/\.html$/i, '');
    container?.classList.add('dashboard-screenshot');
    container?.style.setProperty('--dashboard-preview', `url("../assets/images/landing-previews/${filename}.png")`);
  });

  const guidedDemo = $('#guided-demo');
  const demoCopy = [
    'Track the numbers that matter, without losing the bigger picture.',
    'Move from activity to customer context in one focused workspace.',
    'Automate the repeatable work and keep your team moving forward.'
  ];
  let demoStep = 0;
  const showDemoStep = (step) => {
    demoStep = Math.max(0, Math.min(step, demoCopy.length - 1));
    $$('.guided-demo-scene').forEach((scene, index) => {
      const active = index === demoStep;
      scene.hidden = !active;
      scene.classList.toggle('is-active', active);
    });
    $$('.guided-demo-progress span').forEach((item, index) => item.classList.toggle('is-active', index <= demoStep));
    $('#guided-demo-copy').textContent = demoCopy[demoStep];
    $('[data-demo-prev]').disabled = demoStep === 0;
    $('[data-demo-next]').innerHTML = demoStep === demoCopy.length - 1
      ? 'Start again <i class="ri-restart-line"></i>'
      : 'Next <i class="ri-arrow-right-line"></i>';
  };
  $$('[data-demo-open]').forEach((trigger) => trigger.addEventListener('click', () => {
    showDemoStep(0);
    guidedDemo.showModal();
  }));
  $('[data-demo-close]').addEventListener('click', () => guidedDemo.close());
  $('[data-demo-prev]').addEventListener('click', () => showDemoStep(demoStep - 1));
  $('[data-demo-next]').addEventListener('click', () => showDemoStep(demoStep === demoCopy.length - 1 ? 0 : demoStep + 1));
  guidedDemo.addEventListener('click', (event) => {
    if (event.target === guidedDemo) guidedDemo.close();
  });

  const previewPages = {
    sales: { title: 'Sales dashboard', label: 'sales', url: 'sales-dashboard.html', src: '../sales-dashboard.html' },
    ecommerce: { title: 'eCommerce dashboard', label: 'eCommerce', url: 'ecommerce-dashboard.html', src: '../ecommerce-dashboard.html' },
    crm: { title: 'CRM dashboard', label: 'CRM', url: 'crm-dashboard.html', src: '../crm-dashboard.html' },
    projects: { title: 'Projects dashboard', label: 'projects', url: 'projects-dashboard.html', src: '../projects-dashboard.html' },
    finance: { title: 'Finance dashboard', label: 'finance', url: 'finance-dashboard.html', src: '../finance-dashboard.html' },
    ai: { title: 'AI dashboard', label: 'AI', url: 'ai-dashboard.html', src: '../ai-dashboard.html' },
    hrm: { title: 'HRM dashboard', label: 'HRM', url: 'hrm-dashboard.html', src: '../hrm-dashboard.html' },
    logistics: { title: 'Logistics dashboard', label: 'logistics', url: 'logistics-dashboard.html', src: '../logistics-dashboard.html' },
    support: { title: 'Support dashboard', label: 'support', url: 'support-dashboard.html', src: '../support-dashboard.html' }
  };
  projectFrame = $('#project-preview');
  if (projectFrame) {
  const showcaseBrowser = projectFrame.closest('.showcase-browser');
  const syncProjectPreviewScale = () => {
    const referenceWidth = 1600;
    const scale = Math.min(showcaseBrowser.clientWidth / referenceWidth, 1);
    if (!scale) return;
    projectFrame.style.width = `${referenceWidth}px`;
    projectFrame.style.height = `${620 / scale}px`;
    projectFrame.style.transform = `scale(${scale})`;
  };
  const projectPreviewResizeObserver = new ResizeObserver(syncProjectPreviewScale);
  projectPreviewResizeObserver.observe(showcaseBrowser);
  syncProjectPreviewScale();
  projectFrame.addEventListener('load', () => {
    showcaseBrowser.classList.remove('is-loading');
    settlePreviewTheme();
  });
  projectFrame.addEventListener('error', () => showcaseBrowser.classList.remove('is-loading'));
  applyProjectSettings();
  const setPreview = (key) => {
    const page = previewPages[key];
    if (!page) return;
    showcaseBrowser.classList.add('is-loading');
    $('#preview-name').textContent = page.title;
    const previewUrl = $('#preview-url');
    previewUrl.textContent = page.url;
    previewUrl.href = page.src;
    projectFrame.src = page.src;
    projectFrame.title = `Live MetraUI ${page.label} dashboard preview`;
    $$('.preview-tab').forEach((tab) => {
      const active = tab.dataset.preview === key;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    $$('.dashboard-card').forEach((card) => {
      const active = card.querySelector('.dashboard-live-frame')?.dataset.livePreview === page.src;
      card.classList.toggle('preview-active', active);
    });
  };
  $$('.preview-tab').forEach((tab) => tab.addEventListener('click', () => setPreview(tab.dataset.preview)));
  }
  // Keep the navigation indicator in sync with the current section.
  const navLinks = $$('.main-nav a');
  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const target = `#${visible.target.id}`;
    navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === target));
  }, { rootMargin: '-20% 0px -65% 0px', threshold: [0, 0.1, 0.5] });
  ['features', 'dashboards', 'components', 'faq'].forEach((id) => {
    const section = document.getElementById(id);
    if (section) sectionObserver.observe(section);
  });
})();
