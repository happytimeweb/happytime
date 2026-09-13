/* ==========================================================================
   Happy-Time — správanie stránky
   Formulár (Netlify) + ďakovná obrazovka, scroll-reveal animácie,
   mobilné menu, cookie lišta (Consent Mode v2) a dataLayer vrstva pre GTM.
   ========================================================================== */

/* ── formulár + reveal + mobilné menu ─────────────────────────────────────── */
(function () {
  // formulár ide cez Netlify Forms (POST na "/" s form-name), aby ostala ďakovná obrazovka
  var leadForm = document.getElementById('lead-form');
  if (leadForm) {
    leadForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var form = this;
      var btn = form.querySelector('button[type="submit"]');
      var err = document.getElementById('form-error');
      err.hidden = true;
      btn.disabled = true;
      btn.textContent = 'Odosielam…';
      var lead = {
        form_name: 'rezervacia_obhliadky',
        program: (form.program.value || '(nevybraté)'),
        vek_dietata: (form.vek_dietata.value || '(nevyplnené)'),
        has_message: !!form.sprava.value.trim()
      };
      window.dataLayer.push(Object.assign({ event: 'form_submit' }, lead));
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString()
      }).then(function (res) {
        if (!res.ok) { throw new Error('HTTP ' + res.status); }
        form.style.display = 'none';
        document.getElementById('form-thanks').style.display = 'block';
        // hlavná konverzia — až po potvrdení od Netlify, nie na kliknutie tlačidla
        window.dataLayer.push(Object.assign({
          event: 'generate_lead',
          // pre Enhanced conversions for leads v Google Ads — GTM si to zahašuje sám
          lead_email: form.email.value.trim().toLowerCase(),
          lead_phone: form.telefon.value.replace(/[^\d+]/g, '')
        }, lead));
      }).catch(function (ex) {
        err.hidden = false;
        btn.disabled = false;
        btn.textContent = 'Odoslať a dohodnúť termín';
        window.dataLayer.push(Object.assign({
          event: 'form_error',
          error_type: 'submit_failed',
          error_message: String(ex && ex.message || ex)
        }, lead));
      });
    });
  }
  // scroll-reveal animácie
  (function () {
    var items = document.querySelectorAll('.section-head, .card, .price-card, .price-note, .two-col > div, .review, .gallery .ph, .faq-grid > div, .faq-list details, .contact-grid > div');
    items.forEach(function (el) { el.classList.add('reveal'); });
    // stagger v rámci spoločného rodiča
    document.querySelectorAll('.grid-3, .gallery, .price-notes, .faq-list').forEach(function (group) {
      Array.prototype.forEach.call(group.children, function (el, i) {
        el.style.setProperty('--d', (i * 0.08) + 's');
      });
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  })();
  // zavrieť mobilné menu po kliknutí na odkaz
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    a.addEventListener('click', function () {
      document.querySelector('.nav-links').classList.remove('open');
    });
  });
})();

/* ── cookie lišta ──────────────────────────────────────────────────────────
   Zobrazí sa len tomu, kto ešte nerozhodol. Voľba sa drží v localStorage
   a obnovuje sa v <head> ešte pred GTM. */
(function () {
  var KEY = 'ht_consent', VERSION = 1;
  var box = document.getElementById('cookie-consent');
  if (!box) return;
  var prefs = document.getElementById('cc-prefs');
  var chkA = document.getElementById('cc-analytics');
  var chkM = document.getElementById('cc-marketing');
  var btnSettings = document.getElementById('cc-settings');

  var saved = null;
  try { saved = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}

  // Uloží voľbu, pošle ju Consent Mode a oznámi ju do dataLayeru.
  function decide(analytics, marketing, source) {
    gtag('consent', 'update', {
      ad_storage:         marketing ? 'granted' : 'denied',
      ad_user_data:       marketing ? 'granted' : 'denied',
      ad_personalization: marketing ? 'granted' : 'denied',
      analytics_storage:  analytics ? 'granted' : 'denied'
    });
    saved = { v: VERSION, analytics: analytics, marketing: marketing, ts: new Date().toISOString() };
    try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {}
    window.dataLayer.push({
      event: 'consent_update',
      consent_analytics: analytics,
      consent_marketing: marketing,
      consent_source: source
    });
    box.hidden = true;
  }

  function openPrefs(open) {
    prefs.hidden = !open;
    btnSettings.setAttribute('aria-expanded', String(open));
  }

  document.getElementById('cc-accept').addEventListener('click', function () { decide(true, true, 'accept_all'); });
  document.getElementById('cc-reject').addEventListener('click', function () { decide(false, false, 'reject_all'); });
  document.getElementById('cc-save').addEventListener('click', function () { decide(chkA.checked, chkM.checked, 'custom'); });
  btnSettings.addEventListener('click', function () { openPrefs(prefs.hidden); });

  // Zmena voľby z pätičky — predvyplní sa tým, čo je uložené.
  document.getElementById('cc-reopen').addEventListener('click', function () {
    chkA.checked = !!(saved && saved.analytics);
    chkM.checked = !!(saved && saved.marketing);
    box.hidden = false;
    openPrefs(true);
    box.focus();
  });

  // Lišta sa ukáže len tomu, kto ešte nerozhodol (alebo po zmene verzie súhlasu).
  if (!saved || saved.v !== VERSION) { box.hidden = false; }
})();

/* ── dataLayer vrstva pre GTM ──────────────────────────────────────────────
   Všetko, čo GTM potrebuje, chodí odtiaľto. Nič sa neposiela priamo do GA4 —
   len push do dataLayeru. */
(function () {
  window.dataLayer = window.dataLayer || [];
  var dl = function (o) { window.dataLayer.push(o); };

  // v ktorej sekcii stránky sa kliklo (jednostránkový web nemá page path)
  function whereIs(el) {
    if (el.closest('.topbar')) return 'topbar';
    if (el.closest('.nav')) return 'nav';
    if (el.closest('.hero')) return 'hero';
    if (el.closest('.pricing')) return 'cennik';
    if (el.closest('.faq')) return 'faq';
    if (el.closest('.contact')) return 'kontakt';
    if (el.closest('.footer')) return 'footer';
    var s = el.closest('section[id]');
    return s ? s.id : 'body';
  }
  function txt(el) { return (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 100); }

  // ── 1. Atribúcia: gclid + utm do skrytých polí formulára ───────────────────
  // Uloží sa aj do sessionStorage, aby prežila scroll/reload v rámci návštevy.
  (function () {
    var KEYS = ['gclid', 'gbraid', 'wbraid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    var q = new URLSearchParams(location.search), store = {};
    try { store = JSON.parse(sessionStorage.getItem('ht_attr') || '{}'); } catch (e) { store = {}; }
    KEYS.forEach(function (k) { if (q.get(k)) { store[k] = q.get(k); } });
    try { sessionStorage.setItem('ht_attr', JSON.stringify(store)); } catch (e) {}
    var form = document.getElementById('lead-form');
    if (!form) return;
    KEYS.forEach(function (k) { if (form[k]) { form[k].value = store[k] || ''; } });
    if (form.referrer) { form.referrer.value = document.referrer || '(direct)'; }
    if (form.landing_page) { form.landing_page.value = location.href; }
    dl({
      event: 'page_ready',
      traffic_source: store.utm_source || (store.gclid ? 'google_ads' : '(none)'),
      traffic_campaign: store.utm_campaign || '(none)',
      has_gclid: !!(store.gclid || store.gbraid || store.wbraid)
    });
  })();

  // ── 2. Kliky na odkazy — telefón, e-mail, PDF, CTA, odchody ────────────────
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var loc = whereIs(a);

    if (href.indexOf('tel:') === 0) {
      dl({ event: 'phone_click', link_url: href, click_text: txt(a), click_location: loc });
    } else if (href.indexOf('mailto:') === 0) {
      dl({ event: 'email_click', link_url: href, click_text: txt(a), click_location: loc });
    } else if (/\.pdf(\?|$)/i.test(href)) {
      dl({
        event: 'file_download', file_extension: 'pdf', click_location: loc,
        file_name: href.split('/').pop().split('?')[0], link_text: txt(a)
      });
    } else if (href.charAt(0) === '#') {
      if (href === '#hore') return;                                            // logo, nie CTA
      if (a.closest('.nav-links') && !a.classList.contains('nav-cta')) return; // navigáciu netrackujeme, je to šum
      var card = a.closest('.price-card');
      dl({
        event: 'cta_click', cta_text: txt(a), cta_location: loc, cta_target: href.slice(1),
        cta_program: card ? txt(card.querySelector('h3')) : '(not set)'
      });
    } else if (/^https?:/i.test(href) && a.hostname !== location.hostname) {
      dl({ event: 'outbound_click', link_url: a.href, link_domain: a.hostname, link_text: txt(a), click_location: loc });
    }
  });

  // ── 3. Formulár: form_start (prvý dotyk poľa, raz za návštevu) ─────────────
  (function () {
    var form = document.getElementById('lead-form'), started = false;
    if (!form) return;
    form.addEventListener('focusin', function () {
      if (started) return;
      started = true;
      dl({ event: 'form_start', form_name: 'rezervacia_obhliadky' });
    });
  })();
  // form_submit / generate_lead / form_error pushuje submit handler vyššie.

  // ── 4. FAQ — ktorú otázku rodičia otvárajú ────────────────────────────────
  document.querySelectorAll('.faq-list details').forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      dl({ event: 'faq_open', faq_question: txt(d.querySelector('summary')) });
    });
  });

  // ── 5. Prejdené sekcie — náhrada za funnel, keďže je to one-pager ─────────
  (function () {
    var seen = {};
    var sections = document.querySelectorAll('section[id], header[id]');
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting || seen[en.target.id]) return;
        seen[en.target.id] = true;
        io.unobserve(en.target);
        dl({ event: 'view_section', section_id: en.target.id });
      });
    }, { threshold: 0, rootMargin: '-45% 0px -45% 0px' });
    sections.forEach(function (s) { io.observe(s); });
  })();
})();
