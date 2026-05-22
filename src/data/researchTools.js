/**
 * Curated research tools for life-sciences PhDs.
 * Each tool has a key matching `compass.research.tools.<key>` in the locale files.
 */

export const researchTools = [
  // ─── Search engines ─────────────────────────
  { key: 'pubmed', category: 'search', name: 'PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov', free: true },
  { key: 'scholar', category: 'search', name: 'Google Scholar', url: 'https://scholar.google.com', free: true },
  { key: 'europe_pmc', category: 'search', name: 'Europe PMC', url: 'https://europepmc.org', free: true },
  { key: 'biorxiv', category: 'search', name: 'bioRxiv', url: 'https://www.biorxiv.org', free: true },
  { key: 'medrxiv', category: 'search', name: 'medRxiv', url: 'https://www.medrxiv.org', free: true },

  // ─── Literature management ──────────────────
  { key: 'zotero', category: 'literature', name: 'Zotero', url: 'https://www.zotero.org', free: true },
  { key: 'mendeley', category: 'literature', name: 'Mendeley', url: 'https://www.mendeley.com', free: true },

  // ─── Citation graphs ────────────────────────
  { key: 'connected_papers', category: 'graph', name: 'Connected Papers', url: 'https://www.connectedpapers.com', free: 'limited' },
  { key: 'research_rabbit', category: 'graph', name: 'Research Rabbit', url: 'https://www.researchrabbit.ai', free: true },
  { key: 'scite', category: 'graph', name: 'Scite.ai', url: 'https://scite.ai', free: 'limited' },

  // ─── Writing ────────────────────────────────
  { key: 'overleaf', category: 'writing', name: 'Overleaf', url: 'https://www.overleaf.com', free: true },
  { key: 'obsidian', category: 'writing', name: 'Obsidian', url: 'https://obsidian.md', free: true },

  // ─── Data & methods ─────────────────────────
  { key: 'geneontology', category: 'data', name: 'Gene Ontology', url: 'https://geneontology.org', free: true },
  { key: 'uniprot', category: 'data', name: 'UniProt', url: 'https://www.uniprot.org', free: true },
  { key: 'gtex', category: 'data', name: 'GTEx Portal', url: 'https://gtexportal.org', free: true },
  { key: 'tcga', category: 'data', name: 'TCGA / GDC', url: 'https://portal.gdc.cancer.gov', free: true },
];

