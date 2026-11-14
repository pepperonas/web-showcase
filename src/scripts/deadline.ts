/**
 * Rechnerisches Fristende für die Kanzlei-Demo: Zugangsdatum + Frist in Tagen.
 * Fällt das Ende auf Samstag oder Sonntag, verschiebt es sich auf den Montag
 * (§ 193 BGB). Feiertage bleiben bewusst unberücksichtigt – die Demo nennt das
 * Ergebnis ausdrücklich „rechnerisch“.
 *
 * @param isoDate Datum im Format JJJJ-MM-TT (Wert eines <input type="date">)
 * @returns Fristende oder `null` bei fehlendem/ungültigem Datum
 */
export const deadlineEnd = (isoDate: string, days: number): Date | null => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return null;
  // 12 Uhr Ortszeit: Sommer-/Winterzeitwechsel kann den Tag nicht verschieben.
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  d.setDate(d.getDate() + days);
  if (d.getDay() === 6) d.setDate(d.getDate() + 2);
  if (d.getDay() === 0) d.setDate(d.getDate() + 1);
  return d;
};
