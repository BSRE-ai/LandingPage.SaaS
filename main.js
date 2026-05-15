document.addEventListener('DOMContentLoaded', function () {

  // ── Mobile nav ──────────────────────────────────────────
  var hamburger  = document.querySelector('.nav-hamburger');
  var mobileMenu = document.querySelector('.nav-mobile');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // ── Scroll-triggered fade-up ────────────────────────────
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });

    document.querySelectorAll('.fade-up, .ichat-window, .ai-divider, .ai-pullquote, .ai-grid-col').forEach(function (el) {
      io.observe(el);
    });
  } else {
    document.querySelectorAll('.fade-up, .ichat-window, .ai-divider, .ai-pullquote, .ai-grid-col').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  // ── iMessage Chat Cycler + Typewriter ───────────────────
  document.querySelectorAll('[data-ichat]').forEach(function (chat) {
    var slides   = chat.querySelectorAll('.ichat-slide');
    var dotsWrap = chat.parentElement.querySelector('.ichat-dots');
    var dots     = dotsWrap ? dotsWrap.querySelectorAll('.ichat-dot') : [];
    if (slides.length === 0) return;

    var current  = 0;
    var cycleMs  = 15000;
    var cycleId  = null;
    var typeToken = 0;

    function typewrite(el, text, perChar) {
      var myToken = ++typeToken;
      el.textContent = '';
      var caret = document.createElement('span');
      caret.className = 'ichat-caret';
      el.appendChild(caret);
      var i = 0;
      var step = function () {
        if (myToken !== typeToken) return;
        if (i >= text.length) { caret.remove(); return; }
        caret.insertAdjacentText('beforebegin', text.charAt(i));
        i++;
        setTimeout(step, perChar);
      };
      step();
    }

    function showSlide(idx) {
      slides.forEach(function (s, i) { s.classList.toggle('active', i === idx); });
      dots.forEach(function (d, i) { d.classList.toggle('active', i === idx); });

      var slide    = slides[idx];
      var headline = slide.querySelector('.ichat-headline');
      var headlineText = headline ? headline.getAttribute('data-text') || headline.textContent : '';
      if (headline && headlineText) {
        typewrite(headline, headlineText, 16);
      }
    }

    function goTo(idx) {
      current = (idx + slides.length) % slides.length;
      showSlide(current);
    }

    function startCycle() {
      stopCycle();
      cycleId = setInterval(function () {
        goTo(current + 1);
      }, cycleMs);
    }

    function stopCycle() {
      if (cycleId) { clearInterval(cycleId); cycleId = null; }
    }

    dots.forEach(function (d, i) {
      d.addEventListener('click', function () {
        goTo(i);
        startCycle();
      });
    });

    // Init dots state; trigger typewriter + cycle only once chat enters viewport
    slides.forEach(function (s, i) { s.classList.toggle('active', i === 0); });
    dots.forEach(function (d, i) { d.classList.toggle('active', i === 0); });

    if ('IntersectionObserver' in window) {
      var startedOnce = false;
      var visIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && !startedOnce) {
            startedOnce = true;
            showSlide(0);
            startCycle();
          }
        });
      }, { threshold: 0.25 });
      visIo.observe(chat);
    } else {
      showSlide(0);
      startCycle();
    }
  });

  // ── Integrations Spiderweb Diagram ──────────────────────
  var diagram = document.querySelector('.diagram-wrap');
  if (diagram) {
    var tooltip = diagram.querySelector('.diagram-tooltip');
    var nodes   = diagram.querySelectorAll('.diagram-node[data-tip]');

    nodes.forEach(function (node) {
      node.addEventListener('mouseenter', function () {
        if (!tooltip) return;
        tooltip.textContent = node.getAttribute('data-tip');
        var rect    = node.getBoundingClientRect();
        var wrapRct = diagram.getBoundingClientRect();
        var left    = rect.left - wrapRct.left + rect.width / 2;
        var top     = rect.bottom - wrapRct.top + 10;
        tooltip.style.left = left + 'px';
        tooltip.style.top  = top + 'px';
        tooltip.classList.add('show');
      });
      node.addEventListener('mouseleave', function () {
        if (tooltip) tooltip.classList.remove('show');
      });
    });

    // Animate line draw stagger
    var lines = diagram.querySelectorAll('.diagram-line');
    lines.forEach(function (line, i) {
      line.style.animationDelay = (i * 0.2) + 's';
    });
  }

  // ── Early access form ────────────────────────────────────
  var btn = document.getElementById('submit-btn');
  if (!btn) return;

  var first = document.getElementById('first');
  var last  = document.getElementById('last');
  var email = document.getElementById('email');
  var wrap  = document.getElementById('form-container');

  function validate() {
    var ok = true;
    [first, last, email].forEach(function (el) { el.classList.remove('err'); });
    if (!first.value.trim()) { first.classList.add('err'); ok = false; }
    if (!last.value.trim())  { last.classList.add('err');  ok = false; }
    if (!email.value.trim() || !/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email.value.trim())) {
      email.classList.add('err'); ok = false;
    }
    return ok;
  }

  btn.addEventListener('click', async function () {
    if (!validate()) return;

    btn.disabled    = true;
    btn.textContent = 'Submitting...';

    var payload = {
      first_name: first.value.trim(),
      last_name:  last.value.trim(),
      email:      email.value.trim()
    };

    try {
      await Promise.all([
        fetch('https://formspree.io/f/xojryqrd', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body:    JSON.stringify(payload)
        }),
        fetch('https://srnqophqdhkfmtmttwcm.supabase.co/rest/v1/interest_list', {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'apikey':        'sb_publishable_3kMfFVvnsCXNnigHKTW7fA_i4N_62bV',
            'Authorization': 'Bearer sb_publishable_3kMfFVvnsCXNnigHKTW7fA_i4N_62bV',
            'Prefer':        'return=minimal'
          },
          body: JSON.stringify(payload)
        })
      ]);
    } catch (err) {
      console.error('Submission error:', err);
    }

    wrap.innerHTML =
      '<div class="form-success">' +
        '<p class="form-success-h">You are on the list.</p>' +
        '<p class="form-success-sub">We will be in touch when early access opens in your market.</p>' +
      '</div>';
  });

});
