# celox – Web-Showcase

Showcase-Website von **celox** – *Software. Sicherheit. Automatisierung.*
Zielgruppe: inhabergeführte Unternehmen und KMU. Die Seite zeigt mit sechs bedienbaren Branchen-Demos, einer Ablauf-Demo und einer interaktiven Hero-Vorschau, was eine gute Website, individuelle Software und Automatisierung im Alltag bringen.

Alle Beispielbetriebe, Personen, Preise und Termine sind **fiktiv** und auf der Seite als Demo gekennzeichnet. Es werden keine Daten gesendet, gebucht oder gespeichert.

## Stack

**Astro 7 + TypeScript**, statisch gebaut. Begründung: fertiges HTML ist sofort indexierbar und schnell ausgeliefert; JavaScript wird nur als kleine, pro Komponente gebündelte Inseln für die Demos geladen (≈ 10 KB gzip insgesamt). Keine UI-Frameworks, keine Laufzeit-Abhängigkeiten außer Astro.

## Starten

```bash
npm install
npm run dev          # Entwicklung: http://localhost:4321
npm run build        # Typecheck + Vorschau-Build (noindex)
npm run build:prod   # Typecheck + Produktions-Build (indexierbar)
npm run preview      # gebaute Seite lokal ausliefern
npm run test:ui      # Browserprüfung (nach dem Build, benötigt Chromium)
npm run assets       # Favicons, App-Icons und og.png neu erzeugen
```

Für `test:ui` und `assets` wird ein lokales Chromium verwendet (Pfad per `CHROMIUM_PATH` anpassbar).

## Zentrale Konfiguration

| Was | Wo |
| --- | --- |
| Marke, Titel, Beschreibung, Inhaber | `src/config/site.ts` → `site` |
| E-Mail, Telefon, Formular-Endpunkt | `src/config/site.ts` → `contact` |
| Angaben für Impressum/Datenschutz | `src/config/site.ts` → `legal` |
| Produktionsdomain | Umgebungsvariable `SITE_URL` (Standard `https://celox.io`), siehe `.env.example` |
| Indexierung | `DEPLOY_ENV=production` → `index, follow` + offene `robots.txt`; sonst `noindex` + `Disallow: /` |
| Brancheninhalte (Texte, Vorteile, CTAs) | `src/data/industries.ts` |
| Branchen-Demos | `src/components/demos/*Demo.astro` |
| Farben, Schriften, Abstände, Bewegung | `src/styles/tokens.css` |
| Social-Preview-Motiv | `scripts/assets/og.html` → `npm run assets` |

Direktlinks auf eine Branche: `/?branche=handwerk|immobilien|steuerberatung|kanzlei|werkstatt|restaurant` (nur diese Werte werden akzeptiert).

### Kontaktformular

Solange `contact.formEndpoint` `null` ist, läuft das Formular im **Demo-Modus**: Validierung ja, Versand nein – und die Seite sagt das auch so. Mit gesetztem Endpunkt wird per `POST` (JSON: `name`, `email`, `company`, `industry`, `message`) gesendet; Erfolg und Fehler werden unterschiedlich angezeigt.

## Datenschutz & Vertrauen

Keine Tracker, keine Cookies, keine externen Schriften oder Einbettungen. Die Schriften (Bricolage Grotesque, Instrument Sans – SIL Open Font License, bezogen über Fontsource) liegen in `public/fonts/` samt Lizenztexten. Alle Illustrationen sind eigene SVG- bzw. CSS-Grafiken.

## Offene Punkte vor Veröffentlichung

- Öffentliche E-Mail-Adresse und ggf. Telefonnummer (`contact`)
- Anschrift, ggf. USt-IdNr. (`legal`) – Impressum und Datenschutz sind **Entwürfe** und nicht rechtlich geprüft
- Hosting-Anbieter und Logfile-Angaben für die Datenschutzerklärung
- Formular-Endpunkt (z. B. eigener Mail-Service) – danach Datenschutztext zu Empfänger und Speicherdauer ergänzen
- Produktions-Deployment mit `DEPLOY_ENV=production`

---

© 2026 Martin Pfeffer | celox.io
