// Browser-Prüfung der gebauten Seite: Layout, Interaktionen, Tastatur, Barrierefreiheit.
// Voraussetzung: `npm run build`, dann `npm run test:ui` (startet selbst `astro preview`).
import { spawn } from 'node:child_process';
import { mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = fileURLToPath(new URL('..', import.meta.url));
const PORT = 4399;
const BASE = `http://localhost:${PORT}`;
const executablePath = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const axeSource = await readFile(`${root}node_modules/axe-core/axe.min.js`, 'utf8');

const results = [];
const record = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? '✔' : '✘'} ${name}${detail ? ` – ${detail}` : ''}`);
};

const astroBin = `${root}node_modules/.bin/astro`;
const server = spawn(astroBin, ['preview', '--port', String(PORT)], { cwd: root, stdio: 'pipe' });
await new Promise((resolve, reject) => {
  const t = setTimeout(() => reject(new Error('Preview-Server startet nicht')), 30000);
  server.stdout.on('data', (d) => {
    if (String(d).includes(String(PORT))) {
      clearTimeout(t);
      resolve();
    }
  });
});

const browser = await chromium.launch({ executablePath });
await mkdir(`${root}screenshots`, { recursive: true });

try {
  // 1) Layout in fünf Breiten
  for (const width of [360, 390, 768, 1024, 1440]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(BASE, { waitUntil: 'networkidle' });
    // Alle Einblendungen auslösen
    await page.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((e) => e.classList.add('is-visible')));
    await page.waitForTimeout(700);
    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      const offenders = [...document.querySelectorAll('body *')]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.right > doc.clientWidth + 1 && getComputedStyle(el).position !== 'fixed';
        })
        .filter((el) => !el.closest('[hidden]'))
        .slice(0, 5)
        .map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`);
      return { scroll: doc.scrollWidth, client: doc.clientWidth, offenders };
    });
    record(
      `Kein horizontales Scrollen @${width}px`,
      overflow.scroll <= overflow.client,
      overflow.scroll > overflow.client ? `${overflow.scroll} > ${overflow.client}: ${overflow.offenders.join(', ')}` : '',
    );
    const small = await page.evaluate(() =>
      [...document.querySelectorAll('a, button, input, select, textarea, summary')]
        .filter((el) => {
          if (el.closest('[hidden]') || el.matches('.visually-hidden, .skip-link')) return false;
          // Links im Fließtext sind nach WCAG 2.5.8 ausgenommen
          if (el.matches('p a, li > a:only-child:not([class])') && el.closest('p')) return false;
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height) return false;
          // Unsichtbare Radios/Checkboxen, deren Label die Fläche bildet, ausnehmen
          if (el.matches('input') && getComputedStyle(el).opacity === '0') return false;
          if (el.matches('input[type=checkbox], input[type=radio]')) return false;
          return r.height < 24 || r.width < 24;
        })
        .map((el) => `${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}"`),
    );
    record(`Touch-Ziele ≥ 24px @${width}px`, small.length === 0, small.slice(0, 5).join('; '));
    await page.screenshot({ path: `${root}screenshots/home-${width}.png`, fullPage: true });
    await page.screenshot({ path: `${root}screenshots/hero-${width}.png` });
    record(`Keine Konsolenfehler @${width}px`, errors.length === 0, errors.join(' | '));
    await ctx.close();
  }

  // 2) Barrierefreiheit (axe-core, WCAG 2.2 AA) inkl. aller Branchen-Panels
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    for (const path of ['/', '/impressum', '/datenschutz']) {
      await page.goto(BASE + path, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((e) => e.classList.add('is-visible')));
      await page.waitForTimeout(800);
      await page.addScriptTag({ content: axeSource });
      const panels = path === '/' ? ['handwerk', 'immobilien', 'steuerberatung', 'kanzlei', 'werkstatt', 'restaurant'] : [null];
      for (const id of panels) {
        if (id) {
          await page.click(`[data-tab="${id}"]`);
          await page.waitForTimeout(700);
        }
        const res = await page.evaluate(() =>
          window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] }),
        );
        const v = res.violations.map((x) => `${x.id} (${x.nodes.length}): ${x.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(', ')}`);
        record(`axe ${path}${id ? ` [${id}]` : ''}`, v.length === 0, v.join(' | '));
      }
    }
    await ctx.close();
  }

  // 3) Interaktionen je Branche
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(BASE, { waitUntil: 'networkidle' });

    // Hero
    await page.click('[data-hero-demo] .pill:has-text("Reparatur")');
    await page.click('[data-hero-demo] .hero-demo__photos');
    const hero = await page.textContent('[data-hero-demo] [data-ticket]');
    const heroStatus = await page.textContent('[data-status-text]');
    record('Hero: Auswahl aktualisiert Eingang', hero.includes('Kundendienst') && heroStatus.includes('Rückfrage'), heroStatus);

    // Handwerk
    const hw = '[data-demo="handwerk"]';
    await page.click(`${hw} [data-cat="treppe"]`);
    const visibleTiles = await page.locator(`${hw} .hw-grid li:visible`).count();
    record('Handwerk: Filter Treppen', visibleTiles === 2, `${visibleTiles} sichtbar`);
    await page.click(`${hw} [data-view-btn="anfrage"]`);
    await page.click(`${hw} [data-hw-next]`);
    await page.click(`${hw} [data-hw-next]`);
    const hwErr = await page.locator(`${hw} #hw-mass-error`).isVisible();
    record('Handwerk: Validierung bei leeren Eckdaten', hwErr);
    await page.fill(`${hw} #hw-mass`, '275');
    await page.selectOption(`${hw} #hw-zeit`, { index: 1 });
    await page.click(`${hw} [data-hw-next]`);
    await page.click(`${hw} [data-hw-next]`);
    const hwRes = await page.textContent(`${hw} [data-hw-result]`);
    record('Handwerk: Simulation nach 3 Schritten', /nichts gesendet/.test(hwRes));

    // Immobilien
    await page.click('[data-tab="immobilien"]');
    const im = '[data-demo="immobilien"]';
    await page.click(`${im} [data-type="miete"]`);
    await page.selectOption(`${im} [data-rooms]`, '2');
    await page.selectOption(`${im} [data-budget]`, '900');
    const imCount = await page.textContent(`${im} [data-im-count]`);
    record('Immobilien: Filter Miete/2 Zi./900 €', imCount.startsWith('1 '), imCount);
    await page.click(`${im} .im-cards li:visible [data-visit]`);
    await page.click(`${im} .d-check:has-text("Do")`);
    await page.click(`${im} [data-im-book]`);
    record('Immobilien: Besichtigung simuliert', /nichts gebucht/.test(await page.textContent(`${im} [data-im-result]`)));

    // Steuer
    await page.click('[data-tab="steuerberatung"]');
    const st = '[data-demo="steuerberatung"]';
    await page.click(`${st} .d-check:has-text("Vermietung")`);
    await page.click(`${st} [data-st-show]`);
    const total = Number(await page.textContent(`${st} [data-st-total]`));
    record('Steuer: Checkliste passt sich an', total === 7, `${total} Unterlagen`);
    for (const box of await page.locator(`${st} [data-st-docs] li:visible input`).all()) await box.check();
    record('Steuer: Vollständig-Hinweis', await page.locator(`${st} [data-st-complete]`).isVisible());

    // Kanzlei
    await page.click('[data-tab="kanzlei"]');
    const kz = '[data-demo="kanzlei"]';
    await page.click(`${kz} [data-area="arbeit"]`);
    await page.click(`${kz} [data-kz-form] [type="submit"]`);
    record('Kanzlei: Datum wird verlangt', await page.locator(`${kz} #kz-date-error`).isVisible());
    const d = new Date();
    d.setDate(d.getDate() - 5);
    await page.fill(`${kz} #kz-date`, d.toISOString().slice(0, 10));
    record('Kanzlei: Fristhinweis erscheint', await page.locator(`${kz} [data-kz-deadline]`).isVisible());
    await page.click(`${kz} [data-kz-form] [type="submit"]`);
    record('Kanzlei: Zuordnung simuliert', /Fristsache/.test(await page.textContent(`${kz} [data-kz-result]`)));

    // Werkstatt
    await page.click('[data-tab="werkstatt"]');
    const ws = '[data-demo="werkstatt"]';
    await page.click(`${ws} label:has-text("Inspektion")`);
    const wsTotal = await page.textContent(`${ws} [data-ws-total]`);
    record('Werkstatt: Zeitbedarf summiert', wsTotal.includes('2 Std. 30 Min.'), wsTotal);
    await page.click(`${ws} [data-ws-next]`);
    const firstFree = page.locator(`${ws} [data-time]:not([disabled])`).first();
    if ((await firstFree.count()) === 0) await page.click(`${ws} [data-day="1"]`);
    await page.locator(`${ws} [data-time]:not([disabled])`).first().click();
    await page.click(`${ws} [data-ws-book]`);
    record('Werkstatt: Termin simuliert', /Nichts wurde gebucht/.test(await page.textContent(`${ws} [data-ws-result]`)));

    // Restaurant
    await page.click('[data-tab="restaurant"]');
    const rs = '[data-demo="restaurant"]';
    await page.click(`${rs} [data-cat="primi"]`);
    await page.click(`${rs} [data-diet="vegan"]`);
    const dishes = await page.locator(`${rs} .rs-list li:visible`).count();
    record('Restaurant: Filter Primi + vegan', dishes === 1, `${dishes} Gericht(e)`);
    await page.click(`${rs} [data-view-btn="tisch"]`);
    await page.click(`${rs} [data-rs-plus]`);
    await page.locator(`${rs} [data-time]:not([disabled])`).first().click();
    await page.click(`${rs} [data-rs-book]`);
    record('Restaurant: Reservierung simuliert', /kein Tisch reserviert/.test(await page.textContent(`${rs} [data-rs-result]`)));

    // Prozessdemo
    await page.click('[data-machine] [data-next]');
    await page.click('[data-machine] [data-next]');
    record('Prozessdemo: Schritt 3', (await page.getAttribute('[data-machine]', 'data-step')) === '3');
    await page.click('[data-machine] [data-goto="4"]');
    record('Prozessdemo: Entwurf sichtbar', /Nichts geht automatisch raus/.test(await page.textContent('[data-saved]').then(() => page.textContent('.out--draft'))));

    // Kontakt: Fehler, dann Demo-Hinweis
    await page.click('[data-prefill="restaurant"]');
    record('Kontakt: Branche vorausgewählt', (await page.inputValue('#k-branche')) === 'restaurant');
    await page.click('.contact__submit');
    const nameErr = await page.textContent('#k-name-error');
    const focused = await page.evaluate(() => document.activeElement?.id);
    record('Kontakt: Pflichtfeldfehler + Fokus', nameErr.length > 0 && focused === 'k-name', `${nameErr} / Fokus: ${focused}`);
    await page.fill('#k-name', 'Erika Muster');
    await page.fill('#k-email', 'erika@');
    await page.click('.contact__submit');
    record('Kontakt: ungültige E-Mail erkannt', (await page.textContent('#k-email-error')).includes('unvollständig'));
    await page.fill('#k-email', 'erika@example.org');
    await page.click('.contact__submit');
    const st2 = await page.textContent('.contact__status');
    record('Kontakt: Demo-Modus behauptet keinen Versand', /nichts gesendet/.test(st2) && !/angekommen\./.test(st2.replace('nicht angekommen', '')), st2.trim().slice(0, 80));
    record('Keine Laufzeitfehler bei Interaktionen', errors.length === 0, errors.join(' | '));
    await page.screenshot({ path: `${root}screenshots/contact-demo.png`, clip: await page.locator('#kontakt').boundingBox() });
    await ctx.close();
  }

  // 4) Tastatur, Direktlink, mobiles Menü
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.keyboard.press('Tab');
    const skip = await page.evaluate(() => document.activeElement?.textContent?.trim());
    record('Tastatur: Skip-Link zuerst', skip === 'Zum Inhalt springen', skip);
    await page.focus('[data-tab="handwerk"]');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    const active = await page.evaluate(() => document.activeElement?.getAttribute('data-tab'));
    record('Tastatur: Pfeiltasten in Branchenauswahl', active === 'steuerberatung', active);
    await page.keyboard.press('End');
    record('Tastatur: End springt zur letzten Branche', (await page.evaluate(() => document.activeElement?.getAttribute('data-tab'))) === 'restaurant');

    await page.goto(`${BASE}/?branche=kanzlei`, { waitUntil: 'networkidle' });
    record('Direktlink ?branche=kanzlei', (await page.getAttribute('[data-tab="kanzlei"]', 'aria-selected')) === 'true');
    await page.goto(`${BASE}/?branche=<script>`, { waitUntil: 'networkidle' });
    record('Direktlink mit ungültigem Wert fällt auf Standard zurück', (await page.getAttribute('[data-tab="handwerk"]', 'aria-selected')) === 'true');
    await ctx.close();

    const m = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const mp = await m.newPage();
    await mp.goto(BASE, { waitUntil: 'networkidle' });
    await mp.click('[data-menu-toggle]');
    const firstLinkFocused = await mp.evaluate(() => document.activeElement?.textContent?.trim());
    record('Mobilmenü: öffnet, Fokus auf erstem Link', firstLinkFocused === 'Branchen', firstLinkFocused);
    await mp.screenshot({ path: `${root}screenshots/menu-390.png` });
    await mp.keyboard.press('Escape');
    const expanded = await mp.getAttribute('[data-menu-toggle]', 'aria-expanded');
    const back = await mp.evaluate(() => document.activeElement?.hasAttribute('data-menu-toggle'));
    record('Mobilmenü: Escape schließt, Fokus zurück', expanded === 'false' && back);
    for (const id of ['handwerk', 'immobilien', 'steuerberatung', 'kanzlei', 'werkstatt', 'restaurant']) {
      await mp.goto(`${BASE}/?branche=${id}`, { waitUntil: 'networkidle' });
      await mp.waitForTimeout(700);
      const box = await mp.evaluate((sel) => {
        const r = document.querySelector(sel).getBoundingClientRect();
        return { y: r.top + window.scrollY, h: r.height };
      }, `#panel-${id}`);
      await mp.screenshot({ path: `${root}screenshots/panel-${id}-390.png`, clip: { x: 0, y: box.y - 20, width: 390, height: Math.min(box.h + 40, 4000) }, fullPage: true });
    }
    await m.close();
  }

  // 5) Reduzierte Bewegung: alle Inhalte sichtbar, ohne Scrollen
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: 'networkidle' });
    const hiddenCount = await page.evaluate(
      () => [...document.querySelectorAll('[data-reveal]')].filter((e) => getComputedStyle(e).opacity !== '1').length,
    );
    record('Reduzierte Bewegung: keine versteckten Inhalte', hiddenCount === 0, `${hiddenCount} unsichtbar`);
    const animated = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length);
    record('Reduzierte Bewegung: keine laufenden Animationen', animated === 0, `${animated} laufend`);
    await page.click('[data-tab="werkstatt"]');
    record('Reduzierte Bewegung: Branchenwechsel funktioniert', await page.locator('#panel-werkstatt').isVisible());
    await ctx.close();
  }

  // 6) Ohne JavaScript: Inhalte lesbar
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto(BASE);
    const h1 = await page.locator('h1').isVisible();
    const panels = await page.locator('[data-panel]:visible').count();
    record('Ohne JavaScript: Hero und alle Branchen sichtbar', h1 && panels === 6, `${panels} Panels`);
    await page.screenshot({ path: `${root}screenshots/nojs-hero.png` });
    await ctx.close();
  }

  // 7) Metadaten, Assets
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(BASE);
    const meta = await page.evaluate(() => ({
      lang: document.documentElement.lang,
      title: document.title,
      desc: document.querySelector('meta[name=description]')?.content,
      canonical: document.querySelector('link[rel=canonical]')?.href,
      robots: document.querySelector('meta[name=robots]')?.content,
      og: document.querySelector('meta[property="og:image"]')?.content,
      tw: document.querySelector('meta[name="twitter:card"]')?.content,
    }));
    record('Meta: lang/Titel/Beschreibung/Canonical/OG/Twitter', meta.lang === 'de' && meta.title && meta.desc && meta.canonical && meta.og && meta.tw, JSON.stringify(meta));
    for (const asset of ['/favicon.svg', '/favicon.ico', '/apple-touch-icon.png', '/icon-192.png', '/icon-512.png', '/og.png', '/site.webmanifest', '/robots.txt', '/sitemap.xml']) {
      const r = await page.request.get(BASE + asset);
      record(`Asset ${asset}`, r.ok(), String(r.status()));
    }
    const robots = await (await page.request.get(`${BASE}/robots.txt`)).text();
    record('Vorschau-Build sperrt Indexierung', meta.robots.includes('noindex') ? robots.includes('Disallow: /') : true, `${meta.robots} / ${robots.trim().split('\n').join(' ')}`);
    await ctx.close();
  }
} finally {
  await browser.close();
  server.kill();
  spawn(astroBin, ['preview', 'stop'], { cwd: root, stdio: 'ignore' });
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} Prüfungen bestanden.`);
process.exit(failed.length ? 1 : 0);
