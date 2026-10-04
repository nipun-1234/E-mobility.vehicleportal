/**
 * Sri Lankan Vehicle License Plate Auto-Formatter
 * Formats user input automatically by adding standard dashes/slashes.
 * Supports:
 *  - Modern Provincial 3-letter: NW-CAC-1860, WP-CAB-4521, SP-CAC-8734
 *  - Modern Provincial 2-letter: SB-KA-6734, CP-KA-6051, SP-WP-4890
 *  - Series without province: CAB-4521, KA-6734
 *  - Vintage / Numerical series: 301-1234, 65-1234
 */
export const SRI_LANKAN_PROVINCES = new Set([
  'WP', 'CP', 'SP', 'NW', 'NC', 'NP', 'EP', 'SG', 'SB', 'UV', 'NS'
]);

export function formatSriLankanPlate(val) {
  if (!val) return '';
  const raw = String(val).toUpperCase().replace(/[^A-Z0-9\-\/ ]/g, '');
  const clean = raw.replace(/[\-\/ ]/g, '');
  if (!clean) return '';

  // Case 1: Starts with 2-letter province code (e.g. NW-CAC-1860 or SB-KA-6734)
  if (clean.length >= 2 && SRI_LANKAN_PROVINCES.has(clean.substring(0, 2))) {
    const prov = clean.substring(0, 2);
    const rest = clean.substring(2);
    if (rest.length === 0) {
      return prov;
    }
    const match = rest.match(/^([A-Z]{0,3})(.*)$/);
    if (match) {
      const letters = match[1];
      const digits = match[2].replace(/[^0-9]/g, '').substring(0, 4);
      if (!digits) {
        return letters.length > 0 ? `${prov}-${letters}` : prov;
      }
      return `${prov}-${letters}-${digits}`;
    }
  }

  // Case 2: Starts with 2 to 5 letters (e.g. CAB-4521, KA-6734, or arbitrary 2-char province + 2/3-char series)
  const letterPrefixMatch = clean.match(/^([A-Z]{2,5})(.*)$/);
  if (letterPrefixMatch) {
    const letters = letterPrefixMatch[1];
    const rest = letterPrefixMatch[2];
    if (letters.length >= 4) {
      const p1 = letters.substring(0, 2);
      const p2 = letters.substring(2);
      const digits = rest.replace(/[^0-9]/g, '').substring(0, 4);
      return digits ? `${p1}-${p2}-${digits}` : `${p1}-${p2}`;
    }
    const digits = rest.replace(/[^0-9]/g, '').substring(0, 4);
    return digits ? `${letters}-${digits}` : letters;
  }

  // Case 3: Vintage or numeric series (e.g. 301-1234, 65-1234, 14-1234)
  const numMatch = clean.match(/^([0-9]{2,3})([0-9]{0,4})$/);
  if (numMatch) {
    const prefix = numMatch[1];
    const suffix = numMatch[2];
    return suffix ? `${prefix}-${suffix}` : prefix;
  }

  return clean;
}
