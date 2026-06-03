// Lista priorizada para FlowRun: Latam + EEUU + Europa. Agrupada por región
// para usar con <optgroup> en el form. Flag emoji incluido. Default AR.
// Código ISO 3166-1 alpha-2.

export type Country = { code: string; name: string; flag: string }
export type CountryRegion = 'sudamerica' | 'centroamerica' | 'norteamerica' | 'europa'

export const COUNTRIES_BY_REGION: Record<CountryRegion, { label: string; items: Country[] }> = {
  sudamerica: {
    label: 'Sudamérica',
    items: [
      { code: 'AR', name: 'Argentina',  flag: '🇦🇷' },
      { code: 'BO', name: 'Bolivia',    flag: '🇧🇴' },
      { code: 'BR', name: 'Brasil',     flag: '🇧🇷' },
      { code: 'CL', name: 'Chile',      flag: '🇨🇱' },
      { code: 'CO', name: 'Colombia',   flag: '🇨🇴' },
      { code: 'EC', name: 'Ecuador',    flag: '🇪🇨' },
      { code: 'PY', name: 'Paraguay',   flag: '🇵🇾' },
      { code: 'PE', name: 'Perú',       flag: '🇵🇪' },
      { code: 'UY', name: 'Uruguay',    flag: '🇺🇾' },
      { code: 'VE', name: 'Venezuela',  flag: '🇻🇪' },
    ],
  },
  centroamerica: {
    label: 'Centroamérica y Caribe',
    items: [
      { code: 'CR', name: 'Costa Rica',             flag: '🇨🇷' },
      { code: 'CU', name: 'Cuba',                   flag: '🇨🇺' },
      { code: 'DO', name: 'República Dominicana',   flag: '🇩🇴' },
      { code: 'SV', name: 'El Salvador',            flag: '🇸🇻' },
      { code: 'GT', name: 'Guatemala',              flag: '🇬🇹' },
      { code: 'HN', name: 'Honduras',               flag: '🇭🇳' },
      { code: 'MX', name: 'México',                 flag: '🇲🇽' },
      { code: 'NI', name: 'Nicaragua',              flag: '🇳🇮' },
      { code: 'PA', name: 'Panamá',                 flag: '🇵🇦' },
      { code: 'PR', name: 'Puerto Rico',            flag: '🇵🇷' },
    ],
  },
  norteamerica: {
    label: 'Norteamérica',
    items: [
      { code: 'US', name: 'Estados Unidos',  flag: '🇺🇸' },
      { code: 'CA', name: 'Canadá',          flag: '🇨🇦' },
    ],
  },
  europa: {
    label: 'Europa',
    items: [
      { code: 'ES', name: 'España',           flag: '🇪🇸' },
      { code: 'IT', name: 'Italia',           flag: '🇮🇹' },
      { code: 'FR', name: 'Francia',          flag: '🇫🇷' },
      { code: 'DE', name: 'Alemania',         flag: '🇩🇪' },
      { code: 'PT', name: 'Portugal',         flag: '🇵🇹' },
      { code: 'GB', name: 'Reino Unido',      flag: '🇬🇧' },
      { code: 'IE', name: 'Irlanda',          flag: '🇮🇪' },
      { code: 'NL', name: 'Países Bajos',     flag: '🇳🇱' },
      { code: 'BE', name: 'Bélgica',          flag: '🇧🇪' },
      { code: 'CH', name: 'Suiza',            flag: '🇨🇭' },
      { code: 'AT', name: 'Austria',          flag: '🇦🇹' },
      { code: 'SE', name: 'Suecia',           flag: '🇸🇪' },
      { code: 'NO', name: 'Noruega',          flag: '🇳🇴' },
      { code: 'DK', name: 'Dinamarca',        flag: '🇩🇰' },
      { code: 'FI', name: 'Finlandia',        flag: '🇫🇮' },
      { code: 'IS', name: 'Islandia',         flag: '🇮🇸' },
      { code: 'PL', name: 'Polonia',          flag: '🇵🇱' },
      { code: 'CZ', name: 'República Checa',  flag: '🇨🇿' },
      { code: 'GR', name: 'Grecia',           flag: '🇬🇷' },
    ],
  },
}

// Lista plana para resolución por código (lookup, validación).
export const COUNTRIES: Country[] = Object.values(COUNTRIES_BY_REGION).flatMap(r => r.items)

export const DEFAULT_COUNTRY = 'AR'
