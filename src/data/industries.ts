/**
 * Brancheninhalte für den interaktiven Showcase.
 * Alle Betriebe sind fiktiv und werden auf der Seite als Demo gekennzeichnet.
 */

export const industryIds = [
  'handwerk',
  'immobilien',
  'steuerberatung',
  'kanzlei',
  'werkstatt',
  'restaurant',
] as const;

export type IndustryId = (typeof industryIds)[number];

export const isIndustryId = (value: unknown): value is IndustryId =>
  typeof value === 'string' && (industryIds as readonly string[]).includes(value);

export interface Industry {
  id: IndustryId;
  /** Kurzname für die Auswahl */
  label: string;
  /** Fiktiver Beispielbetrieb */
  demoName: string;
  demoDomain: string;
  headline: string;
  problem: string;
  solution: string[];
  benefits: [string, string, string];
  cta: string;
}

export const industries: Industry[] = [
  {
    id: 'handwerk',
    label: 'Handwerk',
    demoName: 'Holzbau Brenner',
    demoDomain: 'holzbau-brenner.example',
    headline: 'Anfragen, mit denen Sie direkt kalkulieren können.',
    problem:
      '„Was kostet eine Treppe?“ – ohne Maße, Material oder Fotos. Jede zweite Anfrage bedeutet erst einmal Rückrufe und Nachfragen, oft abends nach der Baustelle.',
    solution: [
      'Referenzprojekte zeigen, was Ihr Betrieb kann – sortiert nach Gewerk.',
      'Eine geführte Anfrage fragt Maße, Zeitraum und Fotos gezielt ab.',
      'Die Angaben landen strukturiert im Postfach oder direkt in Ihrer Auftragsverwaltung.',
    ],
    benefits: [
      'Weniger Rückfragen vor dem ersten Termin',
      'Aufmaß-Termine nur für passende Aufträge',
      'Ein Auftritt, der Ihre Arbeit zeigt statt beschreibt',
    ],
    cta: 'Ähnliches Projekt für Ihren Betrieb besprechen',
  },
  {
    id: 'immobilien',
    label: 'Immobilien',
    demoName: 'Kranich Immobilien',
    demoDomain: 'kranich-immobilien.example',
    headline: 'Exposés, die vorsortieren – bevor das Telefon klingelt.',
    problem:
      'Für eine Dreizimmerwohnung kommen Dutzende Anfragen über mehrere Portale. Viele passen nicht zum Objekt, trotzdem will jede beantwortet und jeder Besichtigungstermin koordiniert werden.',
    solution: [
      'Eigene Objektseiten mit Filtern nach Vermarktungsart, Zimmern und Budget.',
      'Besichtigungsanfragen mit festen Zeitfenstern statt E-Mail-Pingpong.',
      'Optional: Übergabe der Anfragen an Ihre Maklersoftware.',
    ],
    benefits: [
      'Interessenten finden passende Objekte selbst',
      'Termine ohne mehrfaches Hin und Her',
      'Eigene Reichweite unabhängig von Portalen',
    ],
    cta: 'Ähnliches Projekt für Ihr Büro besprechen',
  },
  {
    id: 'steuerberatung',
    label: 'Steuerberatung',
    demoName: 'Ostwald Steuerberatung',
    demoDomain: 'ostwald-steuer.example',
    headline: 'Neue Mandate – mit vollständigen Unterlagen ab Tag eins.',
    problem:
      'Neue Mandantinnen und Mandanten wissen oft nicht, welche Unterlagen gebraucht werden. Die Kanzlei fordert nach, wartet und fordert erneut nach.',
    solution: [
      'Eine verständliche Mandatsanfrage in Alltagssprache.',
      'Eine Checkliste, die sich an die tatsächliche Situation anpasst.',
      'Optional: sicherer Upload statt Unterlagen per unverschlüsselter E-Mail.',
    ],
    benefits: [
      'Weniger Nachforderungen im Erstgespräch',
      'Klare Erwartungen für neue Mandate',
      'Entlastung für Empfang und Sachbearbeitung',
    ],
    cta: 'Ähnliches Projekt für Ihre Kanzlei besprechen',
  },
  {
    id: 'kanzlei',
    label: 'Rechtsanwälte',
    demoName: 'Hartmann & Vogt Rechtsanwälte',
    demoDomain: 'hartmann-vogt.example',
    headline: 'Klare Rechtsgebiete. Strukturierte Erstanfragen.',
    problem:
      'Anfragen kommen unsortiert: ein langer Text, keine Frist, kein Rechtsgebiet. Wichtige Angaben fehlen, und dringende Fälle sind nicht auf den ersten Blick erkennbar.',
    solution: [
      'Rechtsgebiete, die Laien auf Anhieb verstehen.',
      'Je Rechtsgebiet die passenden Fragen – zum Beispiel nach Fristen.',
      'Zuordnung an die richtige Anwältin oder den richtigen Anwalt.',
    ],
    benefits: [
      'Fristsachen fallen sofort auf',
      'Vollständige Angaben für die Ersteinschätzung',
      'Ein seriöser, ruhiger Auftritt',
    ],
    cta: 'Ähnliches Projekt für Ihre Kanzlei besprechen',
  },
  {
    id: 'werkstatt',
    label: 'Kfz-Werkstatt',
    demoName: 'Kfz-Technik Albers',
    demoDomain: 'kfz-albers.example',
    headline: 'Termine, die zur Hebebühne passen.',
    problem:
      'Das Telefon klingelt, während Sie unter dem Auto liegen. Zurückrufen, Kennzeichen notieren, Leistung klären, Termin suchen – alles zwischen zwei Aufträgen.',
    solution: [
      'Leistungen zum Anklicken, mit realistischem Zeitbedarf.',
      'Freie Zeitfenster aus Ihrer Werkstattplanung.',
      'Die Anfrage kommt vollständig an – mit Fahrzeug und Wunschleistung.',
    ],
    benefits: [
      'Weniger Telefonunterbrechungen',
      'Bessere Auslastung durch passende Zeitfenster',
      'Kundschaft bucht auch nach Feierabend',
    ],
    cta: 'Ähnliches Projekt für Ihre Werkstatt besprechen',
  },
  {
    id: 'restaurant',
    label: 'Gastronomie',
    demoName: 'Trattoria Lume',
    demoDomain: 'trattoria-lume.example',
    headline: 'Speisekarte und Reservierung – ohne PDF und Warteschleife.',
    problem:
      'Die Speisekarte liegt als unscharfes PDF auf der Website, Reservierungen kommen per Telefon mitten im Service – und Allergiefragen erst am Tisch.',
    solution: [
      'Eine Speisekarte, die auf dem Handy gut lesbar und filterbar ist.',
      'Reservierung mit Personenzahl, Datum und freien Uhrzeiten.',
      'Hinweise zu Unverträglichkeiten schon vor dem Besuch.',
    ],
    benefits: [
      'Weniger Anrufe während des Service',
      'Karte in Minuten selbst aktualisiert',
      'Gäste wissen vorab, was sie erwartet',
    ],
    cta: 'Ähnliches Projekt für Ihr Restaurant besprechen',
  },
];
