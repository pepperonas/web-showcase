/**
 * Zentrale Konfiguration: Marke, Kontakt, Umgebung.
 * Fehlende Angaben bleiben bewusst `null` – sie werden nicht erfunden.
 * Wo ein Wert fehlt, blendet die Website das jeweilige Element aus
 * bzw. kennzeichnet es als offen (z. B. im Impressum-Entwurf).
 */

export const site = {
  name: 'celox',
  claim: 'Software. Sicherheit. Automatisierung.',
  title: 'celox – Websites, Software und Automatisierung für KMU',
  description:
    'celox entwickelt Websites, individuelle Software und sichere Automatisierungen für inhabergeführte Unternehmen: vollständige Anfragen, einfachere Abläufe, weniger Verwaltungsaufwand.',
  locale: 'de_DE',
  owner: 'Martin Pfeffer',
  domainLabel: 'celox.io',
  /** Farbe für Browser-UI (Adressleiste mobil) */
  themeColor: '#15171c',
} as const;

export const contact = {
  /** Öffentliche E-Mail-Adresse, z. B. 'hallo@celox.io' – noch nicht festgelegt */
  email: null as string | null,
  /** Telefonnummer im Format '+49 …' – noch nicht festgelegt */
  phone: null as string | null,
  /**
   * Ziel für das Kontaktformular (POST, JSON). Solange `null`,
   * läuft das Formular im gekennzeichneten Demo-Modus und sendet nichts.
   */
  formEndpoint: null as string | null,
} as const;

/** Angaben für Impressum und Datenschutz – offene Punkte bleiben `null`. */
export const legal = {
  responsible: 'Martin Pfeffer',
  street: null as string | null,
  postalCity: null as string | null,
  country: 'Deutschland',
  vatId: null as string | null,
  hosting: null as string | null,
} as const;

/**
 * Indexierung nur, wenn ausdrücklich DEPLOY_ENV=production gesetzt ist.
 * Vorschau- und lokale Builds erhalten automatisch noindex.
 */
export const isProduction =
  (import.meta.env.DEPLOY_ENV ?? process.env.DEPLOY_ENV) === 'production';
