/**
 * Live job-board sources for PhD positions in German life sciences.
 *
 * Why links, not scraping?
 * These portals (Nature Careers, academics, EURAXESS, ...) have no open API
 * and block cross-origin fetches. But each exposes a *search URL* whose query
 * parameters we can pre-fill. These search links never go stale — they always
 * return the portal's current results — unlike links to a single posting.
 *
 * Each board has a `buildUrl(field, query)` that returns a pre-filtered,
 * always-current results page for the chosen research field.
 *
 * Fields map to the same six used across the app:
 *   cancer · immunology · neuroscience · molecular_biology · genetics · structural_biology
 */

// Human search terms per field, reused across boards.
export const FIELD_TERMS = {
  cancer: { en: 'cancer', de: 'Krebs Onkologie' },
  immunology: { en: 'immunology', de: 'Immunologie' },
  neuroscience: { en: 'neuroscience', de: 'Neurowissenschaft' },
  molecular_biology: { en: 'molecular biology', de: 'Molekularbiologie' },
  genetics: { en: 'genetics', de: 'Genetik' },
  structural_biology: { en: 'structural biology', de: 'Strukturbiologie' },
};

export const boards = [
  {
    id: 'nature',
    name: 'Nature Careers',
    tagline: { en: 'High-quality academic & research jobs, updated daily.', de: 'Hochwertige akademische Stellen, täglich aktualisiert.', ar: 'وظائف أكاديمية وبحثية عالية الجودة، تُحدَّث يومياً.' },
    accent: 'navy',
    // Nature Careers free-text keyword search + position filter
    buildUrl: (field) => {
      const term = FIELD_TERMS[field]?.en ?? 'life science';
      return `https://www.nature.com/naturecareers/jobs/life-science/phd-position/germany/?query=${encodeURIComponent(term)}`;
    },
    browseUrl: 'https://www.nature.com/naturecareers/jobs/life-science/phd-position/germany/',
  },
  {
    id: 'academics',
    name: 'academics.com',
    tagline: { en: "Germany's largest academic job portal.", de: 'Deutschlands größtes Hochschul-Stellenportal.', ar: 'أكبر بوابة وظائف أكاديمية في ألمانيا.' },
    accent: 'sienna',
    buildUrl: (field) => {
      const term = FIELD_TERMS[field]?.en ?? 'life sciences';
      return `https://www.academics.com/search?q=${encodeURIComponent(term + ' PhD')}`;
    },
    browseUrl: 'https://www.academics.com/jobs/phd-doctorate',
  },
  {
    id: 'euraxess',
    name: 'EURAXESS',
    tagline: { en: 'EU Commission portal for researchers — funded positions.', de: 'EU-Kommissionsportal für Forschende — geförderte Stellen.', ar: 'بوابة المفوضية الأوروبية للباحثين — وظائف ممولة.' },
    accent: 'sage',
    buildUrl: (field) => {
      const term = FIELD_TERMS[field]?.en ?? 'life sciences';
      return `https://euraxess.ec.europa.eu/jobs/search?keywords=${encodeURIComponent(term)}&country=Germany&f%5B0%5D=research_profile%3AFirst%20Stage%20Researcher%20%28R1%29`;
    },
    browseUrl: 'https://euraxess.ec.europa.eu/jobs/search?country=Germany',
  },
  {
    id: 'jobvector',
    name: 'jobvector',
    tagline: { en: 'Science & engineering jobs across the DACH region.', de: 'Stellen in Wissenschaft & Technik im DACH-Raum.', ar: 'وظائف العلوم والهندسة في منطقة DACH.' },
    accent: 'ochre',
    buildUrl: (field) => {
      const term = FIELD_TERMS[field]?.en ?? 'life sciences';
      return `https://www.jobvector.com/en/jobs/?q=${encodeURIComponent(term + ' PhD')}`;
    },
    browseUrl: 'https://www.jobvector.com/en/jobs-phd/',
  },
  {
    id: 'daad',
    name: 'DAAD PhDGermany',
    tagline: { en: 'Official DAAD database of PhD openings in Germany.', de: 'Offizielle DAAD-Datenbank für Promotionsstellen.', ar: 'قاعدة بيانات DAAD الرسمية لفرص الدكتوراه في ألمانيا.' },
    accent: 'navy',
    buildUrl: (field) => {
      const term = FIELD_TERMS[field]?.en ?? 'life sciences';
      return `https://www.phdgermany.de/en/phd-search/?tx_solr%5Bq%5D=${encodeURIComponent(term)}`;
    },
    browseUrl: 'https://www.phdgermany.de/en/phd-search/',
  },
  {
    id: 'academicpositions',
    name: 'Academic Positions',
    tagline: { en: 'Pan-European academic vacancies with clean filters.', de: 'Europaweite akademische Stellen mit klaren Filtern.', ar: 'وظائف أكاديمية أوروبية بمرشحات واضحة.' },
    accent: 'sienna',
    buildUrl: (field) => {
      const term = FIELD_TERMS[field]?.en ?? 'life sciences';
      return `https://academicpositions.com/find-jobs/position/phd/country/germany?query=${encodeURIComponent(term)}`;
    },
    browseUrl: 'https://academicpositions.com/find-jobs/position/phd/country/germany',
  },
];
