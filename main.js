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
