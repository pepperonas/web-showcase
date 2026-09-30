/** HTML-Escaping für Werte, die in Demo-Zusammenfassungen eingesetzt werden. */
export const esc = (value: unknown): string =>
  String(value ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );

/** Definitionsliste aus Schlüssel/Wert-Paaren (sicher escaped). */
export const dl = (rows: [string, unknown][]): string =>
  `<dl>${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>`;
