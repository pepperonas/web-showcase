// Unit-Tests für die reine Logik der Seite (ohne Build, ohne Browser).
// Node 22.18+ entfernt die TypeScript-Typen beim Import selbst.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { esc, dl } from '../src/scripts/dom.ts';
import { deadlineEnd } from '../src/scripts/deadline.ts';
import { industries, industryIds, isIndustryId } from '../src/data/industries.ts';

test('esc maskiert alle HTML-Sonderzeichen', () => {
  assert.equal(esc(`<img src=x onerror="alert('x')">&`),
    '&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt;&amp;');
  assert.equal(esc('&amp;'), '&amp;amp;', 'doppelt maskieren ist gewollt');
  assert.equal(esc(null), '');
  assert.equal(esc(undefined), '');
  assert.equal(esc(0), '0');
  assert.equal(esc('Grüße'), 'Grüße');
});

test('dl baut eine Definitionsliste und maskiert Schlüssel UND Werte', () => {
  assert.equal(dl([['Name', 'Ada'], ['Anzahl', 3]]), '<dl><dt>Name</dt><dd>Ada</dd><dt>Anzahl</dt><dd>3</dd></dl>');
  assert.equal(dl([['<b>', '</dd><script>']]), '<dl><dt>&lt;b&gt;</dt><dd>&lt;/dd&gt;&lt;script&gt;</dd></dl>');
  assert.equal(dl([]), '<dl></dl>');
});

test('isIndustryId akzeptiert nur die festen Werte (Direktlink ?branche=)', () => {
  for (const id of industryIds) assert.equal(isIndustryId(id), true, id);
  for (const v of ['HANDWERK', ' handwerk', 'toString', '__proto__', '', null, undefined, 1, ['handwerk']]) {
    assert.equal(isIndustryId(v), false, String(v));
  }
});

test('Brancheninhalte: jede ID genau einmal, Pflichtfelder gefüllt, Demo-Domain fiktiv', () => {
  assert.deepEqual(industries.map((i) => i.id), [...industryIds]);
  for (const i of industries) {
    for (const k of ['label', 'demoName', 'headline', 'problem', 'cta']) assert.ok(i[k].trim(), `${i.id}.${k}`);
    assert.equal(i.benefits.length, 3, `${i.id}: drei Vorteile`);
    assert.ok(i.solution.length >= 1, `${i.id}: Lösung`);
    assert.match(i.demoDomain, /\.example$/, `${i.id}: Demo-Domain muss .example sein (RFC 2606)`);
  }
});

test('Zu jeder Branche gibt es eine Demo-Komponente', () => {
  const demos = readdirSync(new URL('../src/components/demos/', import.meta.url));
  const names = { steuerberatung: 'Steuer' };
  for (const id of industryIds) {
    const base = names[id] ?? id[0].toUpperCase() + id.slice(1);
    assert.ok(demos.includes(`${base}Demo.astro`), `${base}Demo.astro fehlt`);
  }
});

const day = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

test('deadlineEnd: Werktag bleibt, drei Wochen = gleicher Wochentag', () => {
  assert.equal(day(deadlineEnd('2026-03-02', 21)), '2026-03-23');   // Mo -> Mo
  assert.equal(day(deadlineEnd('2026-03-04', 14)), '2026-03-18');   // Mi -> Mi
});

test('deadlineEnd: Samstag und Sonntag verschieben auf Montag (§ 193 BGB)', () => {
  const sat = deadlineEnd('2026-03-07', 0), sun = deadlineEnd('2026-03-08', 0);
  assert.equal(day(sat), '2026-03-09');
  assert.equal(day(sun), '2026-03-09');
  assert.equal(sat.getDay(), 1);
  for (let i = 0; i < 60; i++) {
    const d = deadlineEnd(`2026-01-${String((i % 28) + 1).padStart(2, '0')}`, i);
    assert.ok(d.getDay() !== 0 && d.getDay() !== 6, `Ende nie am Wochenende (${day(d)})`);
  }
});

test('deadlineEnd: Monats-/Jahreswechsel und Zeitumstellung verschieben keinen Tag', () => {
  assert.equal(day(deadlineEnd('2026-12-21', 14)), '2027-01-04');
  assert.equal(day(deadlineEnd('2026-02-16', 14)), '2026-03-02');
  assert.equal(day(deadlineEnd('2026-03-16', 14)), '2026-03-30');   // über die Sommerzeit hinweg
  assert.equal(day(deadlineEnd('2026-10-19', 14)), '2026-11-02');   // über die Winterzeit hinweg
});

test('deadlineEnd: leeres oder ungültiges Datum ergibt null statt "Invalid Date"', () => {
  assert.equal(deadlineEnd('', 21), null);
  assert.equal(deadlineEnd('kaputt', 21), null);
  assert.equal(deadlineEnd('2026-13-45', 21), null);
});
