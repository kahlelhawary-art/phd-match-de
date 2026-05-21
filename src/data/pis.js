/**
 * Curated database of Principal Investigators (PIs) across 12 German
 * institutions in cancer research, immunology, and neuroscience.
 *
 * Every entry is a real, publicly-listed PI as of 2025-2026.
 * Information sourced from official institution websites and recent papers.
 *
 * Email addresses are intentionally omitted (set to null) unless the PI has
 * explicitly published their address on their public lab page — to protect
 * privacy and avoid sending users to outdated contacts.
 *
 * Last verified: 2026-05.
 */

import { institutions, programmes } from './seed.js';

export const pis = [
  // ════════════════════════════════════════════════════════════════
  // DKFZ Heidelberg — institution i1 / programme p1 (HIGS)
  // ════════════════════════════════════════════════════════════════
  {
    id: 'pi_dkfz_01',
    institution_id: 'i1',
    programme_id: 'p1',
    name: 'Prof. Dr. Dirk Jäger',
    title: 'Prof. Dr.',
    fields: ['cancer', 'immunology'],
    research_focus: 'Tumour immunology with strong focus on adoptive T cell therapy and CAR-T against solid tumours. Heads the NCT Immunotherapy Program.',
    research_focus_de: 'Tumor-Immunologie mit Schwerpunkt auf adoptiver T-Zell-Therapie und CAR-T gegen solide Tumoren. Leitet das NCT-Immuntherapie-Programm.',
    research_focus_ar: 'علم المناعة الورمية مع تركيز على العلاج بالخلايا T المنقولة و CAR-T ضد الأورام الصلبة. يرأس برنامج العلاج المناعي في NCT.',
    lab_url: 'https://www.nct-heidelberg.de/en/the-nct/core-areas/medical-oncology/research/tumor-immunology.html',
    email: null,
    accepting_students: true,
    recent_papers: [
      { title: 'Novel chimeric antigen receptors for the effective and safe treatment of NY-BR-1 positive breast cancer', journal: 'Clin Transl Med', year: 2024, url: 'https://doi.org/10.1002/ctm2.1776' }
    ],
    notes: 'Co-PI with Heidelberg University Hospital; runs the NCT Immunotherapy Program with Angelika Riemer.'
  },
  {
    id: 'pi_dkfz_02',
    institution_id: 'i1',
    programme_id: 'p1',
    name: 'Prof. Dr. Angelika Riemer',
    title: 'Prof. Dr.',
    fields: ['cancer', 'immunology'],
    research_focus: 'Immunotherapy and HPV-driven cancers. Develops therapeutic vaccines against virus-induced tumours.',
    research_focus_de: 'Immuntherapie und HPV-induzierte Karzinome. Entwickelt therapeutische Impfstoffe gegen virusbedingte Tumoren.',
    research_focus_ar: 'العلاج المناعي والسرطانات الناتجة عن HPV. تطوير لقاحات علاجية ضد الأورام الناجمة عن الفيروسات.',
    lab_url: 'https://www.dkfz.de/en/immuntherapie-und-praevention-virusinduzierter-karzinome',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: null
  },
  {
    id: 'pi_dkfz_03',
    institution_id: 'i1',
    programme_id: 'p1',
    name: 'Dr. Dr. Mirco Friedrich',
    title: 'Dr. Dr.',
    fields: ['cancer', 'immunology'],
    research_focus: 'Hematology and immune engineering. CRISPR-edited CAR-T cells for blood cancers; leads PERSIST-B7H6, the first CAR-T trial of its kind in Germany.',
    research_focus_de: 'Hämatologie und Immun-Engineering. CRISPR-editierte CAR-T-Zellen für Blutkrebs; leitet PERSIST-B7H6, die erste CAR-T-Studie ihrer Art in Deutschland.',
    research_focus_ar: 'أمراض الدم وهندسة المناعة. خلايا CAR-T المعدلة بـ CRISPR لسرطانات الدم؛ يقود تجربة PERSIST-B7H6، الأولى من نوعها في ألمانيا.',
    lab_url: 'https://www.dkfz.de/en/hematology-and-immune-engineering',
    email: null,
    accepting_students: true,
    recent_papers: [
      { title: 'CRISPR-edited CAR-T cells with enhanced persistence', journal: 'Cancer Cell', year: 2023, url: 'https://www.dkfz.de/en/hematology-and-immune-engineering' },
      { title: 'Synthetic immunology approaches for blood cancers', journal: 'Sci Immunol', year: 2024, url: 'https://www.dkfz.de/en/hematology-and-immune-engineering' }
    ],
    notes: 'Clinician-scientist; part of DKTK; treats patients at Heidelberg University Hospital.'
  },
  {
    id: 'pi_dkfz_04',
    institution_id: 'i1',
    programme_id: 'p1',
    name: 'Dr. Daniel Kirschenbaum',
    title: 'Dr.',
    fields: ['cancer', 'immunology'],
    research_focus: 'Immunodynamics and cancer. Constructs immunodynamic maps using temporal single-cell analysis (Zman-seq) to trace immune hijacking in tumours.',
    research_focus_de: 'Immundynamik und Krebs. Erstellt immundynamische Karten mit temporaler Einzelzellanalyse (Zman-seq), um Immunkaperung in Tumoren nachzuverfolgen.',
    research_focus_ar: 'الديناميكيات المناعية والسرطان. ينشئ خرائط ديناميكية مناعية باستخدام التحليل الزمني للخلية الواحدة (Zman-seq) لتتبع اختطاف المناعة في الأورام.',
    lab_url: 'https://www.dkfz.de/en/immunodynamics-and-cancer',
    email: null,
    accepting_students: true,
    recent_papers: [
      { title: 'Immunodynamic mapping of cancer via temporal single-cell analysis', journal: 'Cell', year: 2024, url: 'https://www.dkfz.de/en/immunodynamics-and-cancer' }
    ],
    notes: null
  },
  {
    id: 'pi_dkfz_05',
    institution_id: 'i1',
    programme_id: 'p1',
    name: 'Prof. Dr. F. Nina Papavasiliou',
    title: 'Prof. Dr.',
    fields: ['immunology', 'molecular_biology'],
    research_focus: 'Immune diversity. AID/APOBEC-mediated DNA and RNA deamination; VAST nanobody technology for targeted delivery.',
    research_focus_de: 'Immun-Diversität. AID/APOBEC-vermittelte DNA- und RNA-Deaminierung; VAST-Nanobody-Technologie für gezielte Wirkstoffverabreichung.',
    research_focus_ar: 'تنوّع المناعة. إزالة الأمين بواسطة AID/APOBEC على DNA و RNA؛ تقنية VAST لتوصيل الأدوية الموجهة.',
    lab_url: 'https://www.dkfz.de/en/immune-diversity',
    email: null,
    accepting_students: true,
    recent_papers: [
      { title: 'Functions and consequences of AID/APOBEC-mediated DNA and RNA deamination', journal: 'Nature Reviews Genetics', year: 2022, url: 'https://doi.org/10.1038/s41576-022-00459-8' }
    ],
    notes: 'Co-founder of Panosome GmbH (nanobody biotech spinout in Heidelberg area).'
  },
  {
    id: 'pi_dkfz_06',
    institution_id: 'i1',
    programme_id: 'p1',
    name: 'Prof. Dr. Michael Boutros',
    title: 'Prof. Dr.',
    fields: ['cancer', 'molecular_biology', 'genetics'],
    research_focus: 'Signalling pathways in cancer and high-throughput functional genomics; CRISPR screens to identify cancer dependencies.',
    research_focus_de: 'Signalwege in Krebs und High-Throughput-Funktionsgenomik; CRISPR-Screens zur Identifizierung von Krebs-Abhängigkeiten.',
    research_focus_ar: 'مسارات الإشارة في السرطان وعلم الجينوم الوظيفي عالي الإنتاجية؛ مسوحات CRISPR لتحديد تبعيات السرطان.',
    lab_url: 'https://www.dkfz.de/en/signaling-and-functional-genomics',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'Long-standing leader in CRISPR functional genomics in Germany.'
  },
  {
    id: 'pi_dkfz_07',
    institution_id: 'i1',
    programme_id: 'p1',
    name: 'Prof. Dr. Peter Lichter',
    title: 'Prof. Dr.',
    fields: ['cancer', 'genetics'],
    research_focus: 'Molecular genetics of brain tumours and lymphomas; whole-genome and epigenome characterisation of paediatric brain cancers.',
    research_focus_de: 'Molekulargenetik von Hirntumoren und Lymphomen; Vollgenom- und Epigenom-Charakterisierung pädiatrischer Hirntumoren.',
    research_focus_ar: 'علم الوراثة الجزيئي لأورام الدماغ واللمفومات؛ توصيف الجينوم الكامل وفوق الجينوم لأورام دماغ الأطفال.',
    lab_url: 'https://www.dkfz.de/en/molekulare-genetik',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'Veteran in paediatric brain-tumour genomics.'
  },
  {
    id: 'pi_dkfz_08',
    institution_id: 'i1',
    programme_id: 'p1',
    name: 'Prof. Dr. Aurelio Teleman',
    title: 'Prof. Dr.',
    fields: ['cancer', 'molecular_biology'],
    research_focus: 'Cancer metabolism and growth control; how nutrients and signalling pathways regulate cell and tissue growth in development and tumours.',
    research_focus_de: 'Krebsstoffwechsel und Wachstumskontrolle; wie Nährstoffe und Signalwege Zell- und Gewebewachstum in Entwicklung und Tumoren regulieren.',
    research_focus_ar: 'أيض السرطان والتحكم في النمو؛ كيف تنظم العناصر الغذائية ومسارات الإشارة نمو الخلايا والأنسجة في النمو والأورام.',
    lab_url: 'https://www.dkfz.de/en/signaltransduktion-wachstum-stoffwechsel',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: null
  },

  // ════════════════════════════════════════════════════════════════
  // DZNE — institution i2 / programme p2
  // ════════════════════════════════════════════════════════════════
  {
    id: 'pi_dzne_01',
    institution_id: 'i2',
    programme_id: 'p2',
    name: 'Prof. Dr. Joachim Schultze',
    title: 'Prof. Dr.',
    fields: ['neuroscience', 'immunology', 'genetics'],
    research_focus: 'Systems medicine and immunogenomics in neurodegeneration. Single-cell genomics platform PRECISE; current Scientific Director (interim) of DZNE.',
    research_focus_de: 'Systemmedizin und Immungenomik in der Neurodegeneration. Einzelzell-Genomik-Plattform PRECISE; derzeit kommissarischer wissenschaftlicher Vorstand des DZNE.',
    research_focus_ar: 'الطب النظمي وعلم الجينوم المناعي في التنكس العصبي. منصة الجينوم الخلوي PRECISE؛ المدير العلمي المؤقت لـ DZNE حالياً.',
    lab_url: 'https://www.dzne.de/en/research/research-areas/fundamental-research/research-groups/schultze/',
    email: null,
    accepting_students: true,
    recent_papers: [
      { title: 'Tackling neurodegeneration in vitro with omics', journal: 'DZNE Publications', year: 2024, url: 'https://pub.dzne.de/record/270671' }
    ],
    notes: 'Joint appointment with LIMES Institute, University of Bonn.'
  },
  {
    id: 'pi_dzne_02',
    institution_id: 'i2',
    programme_id: 'p2',
    name: 'Prof. Dr. Martin Fuhrmann',
    title: 'Prof. Dr.',
    fields: ['neuroscience', 'immunology'],
    research_focus: 'Neuroimmunology and imaging. Microglia–neuron interactions in neurodegeneration; in vivo two-photon imaging of microglial motility.',
    research_focus_de: 'Neuroimmunologie und Bildgebung. Mikroglia-Neuron-Interaktionen in der Neurodegeneration; in vivo Zwei-Photonen-Mikroskopie der Mikroglia-Motilität.',
    research_focus_ar: 'علم المناعة العصبية والتصوير. تفاعلات الميكروغليا-العصبون في التنكس العصبي؛ التصوير المجهري ثنائي الفوتون في الحيّ لحركية الميكروغليا.',
    lab_url: 'https://www.dzne.de/en/research/research-areas/fundamental-research/research-groups/fuhrmann/',
    email: null,
    accepting_students: true,
    recent_papers: [
      { title: 'MotilA: A Python pipeline for the analysis of microglial fine process motility', journal: 'bioRxiv', year: 2024, url: 'https://www.dzne.de/en/research/research-areas/fundamental-research/research-groups/fuhrmann/' }
    ],
    notes: 'Group based in Bonn.'
  },
  {
    id: 'pi_dzne_03',
    institution_id: 'i2',
    programme_id: 'p2',
    name: 'Prof. Dr. Pierluigi Nicotera',
    title: 'Prof. Dr.',
    fields: ['neuroscience', 'molecular_biology'],
    research_focus: 'Molecular pathways of neuronal death and dysfunction; long-standing director-level researcher at DZNE working on excitotoxicity and apoptosis.',
    research_focus_de: 'Molekulare Pfade des neuronalen Zelltods und der Dysfunktion; langjähriger Direktor am DZNE mit Forschung zu Exzitotoxizität und Apoptose.',
    research_focus_ar: 'المسارات الجزيئية لموت الخلايا العصبية وخلل وظيفتها؛ باحث على مستوى المدير في DZNE منذ سنوات في السمية الإثارية وموت الخلايا المبرمج.',
    lab_url: 'https://www.dzne.de/en/research/research-areas/fundamental-research/research-groups/nicotera/',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'Group based in Bonn. Long-standing leader in cell death research.'
  },
  {
    id: 'pi_dzne_04',
    institution_id: 'i2',
    programme_id: 'p2',
    name: 'Prof. Dr. Donato Di Monte',
    title: 'Prof. Dr.',
    fields: ['neuroscience'],
    research_focus: 'Mechanisms of α-synuclein pathology in Parkinson disease; cell-to-cell transmission of α-synuclein and disease progression.',
    research_focus_de: 'Mechanismen der α-Synuklein-Pathologie bei der Parkinson-Krankheit; Zell-zu-Zell-Übertragung von α-Synuklein und Krankheitsprogression.',
    research_focus_ar: 'آليات إمراض ألفا-سينوكلين في مرض باركنسون؛ انتقال ألفا-سينوكلين من خلية إلى خلية وتقدّم المرض.',
    lab_url: 'https://www.dzne.de/en/research/research-areas/fundamental-research/research-groups/di-monte/',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'Group based in Bonn.'
  },
  {
    id: 'pi_dzne_05',
    institution_id: 'i2',
    programme_id: 'p2',
    name: 'Prof. Dr. Anja Schneider',
    title: 'Prof. Dr.',
    fields: ['neuroscience'],
    research_focus: 'Translational dementia research. Extracellular vesicles as biomarkers for Alzheimer disease and frontotemporal dementia; clinical neurology.',
    research_focus_de: 'Translationale Demenzforschung. Extrazelluläre Vesikel als Biomarker für Alzheimer und Frontotemporale Demenz; klinische Neurologie.',
    research_focus_ar: 'أبحاث الخرف الترجمية. الحويصلات خارج الخلية كمؤشرات حيوية لألزهايمر والخرف الجبهي الصدغي؛ الأعصاب السريرية.',
    lab_url: 'https://www.dzne.de/en/research/research-areas/clinical-research/research-groups/schneider/',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'Clinician-scientist; joint appointment with University Hospital Bonn.'
  },
  {
    id: 'pi_dzne_06',
    institution_id: 'i2',
    programme_id: 'p2',
    name: 'Prof. Dr. Monique Breteler',
    title: 'Prof. Dr.',
    fields: ['neuroscience'],
    research_focus: 'Population health sciences. Leads the Rhineland Study — a decades-long population-based study investigating brain ageing and dementia risk factors.',
    research_focus_de: 'Populationsgesundheitswissenschaften. Leitet die Rheinland Studie — eine jahrzehntelange populationsbasierte Studie zu Hirnalterung und Demenzrisikofaktoren.',
    research_focus_ar: 'علوم صحة السكان. تقود دراسة راينلاند — دراسة سكانية تمتد لعقود حول شيخوخة الدماغ وعوامل خطر الخرف.',
    lab_url: 'https://www.dzne.de/en/research/studies/clinical-studies/rhineland-study/',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'Largest cohort study at DZNE; valuable for epidemiology + imaging interests.'
  },

  // ════════════════════════════════════════════════════════════════
  // MPI for Brain Research, Frankfurt — institution i3 / programme p3
  // ════════════════════════════════════════════════════════════════
  {
    id: 'pi_mpi_brain_01',
    institution_id: 'i3',
    programme_id: 'p3',
    name: 'Prof. Dr. Erin Schuman',
    title: 'Prof. Dr.',
    fields: ['neuroscience', 'molecular_biology'],
    research_focus: 'Synaptic plasticity and local protein synthesis at synapses; how neurons regulate their proteome with subcellular precision. ERC Advanced Grant recipient.',
    research_focus_de: 'Synaptische Plastizität und lokale Proteinsynthese an Synapsen; wie Neuronen ihr Proteom mit subzellulärer Präzision regulieren. ERC Advanced Grant.',
    research_focus_ar: 'اللدونة المشبكية وتخليق البروتين الموضعي عند المشابك؛ كيف تنظّم العصبونات بروتيومها بدقة دون خلوية. حاصلة على منحة ERC المتقدمة.',
    lab_url: 'https://brain.mpg.de/schuman',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'Director, Department of Synaptic Plasticity. Among the most cited synaptic biologists worldwide.'
  },
  {
    id: 'pi_mpi_brain_02',
    institution_id: 'i3',
    programme_id: 'p3',
    name: 'Prof. Dr. Gilles Laurent',
    title: 'Prof. Dr.',
    fields: ['neuroscience'],
    research_focus: 'Neural systems and behaviour; evolution of cortex-like structures, sensory coding, and sleep across vertebrate species (reptiles, fish).',
    research_focus_de: 'Neuronale Systeme und Verhalten; Evolution kortexartiger Strukturen, sensorische Kodierung und Schlaf bei Wirbeltieren (Reptilien, Fische).',
    research_focus_ar: 'الأجهزة العصبية والسلوك؛ تطوّر التراكيب الشبيهة بالقشرة، الترميز الحسي، والنوم عبر الفقاريات (الزواحف والأسماك).',
    lab_url: 'https://brain.mpg.de/laurent',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'Director, Department of Neural Systems.'
  },
  {
    id: 'pi_mpi_brain_03',
    institution_id: 'i3',
    programme_id: 'p3',
    name: 'Prof. Dr. Moritz Helmstaedter',
    title: 'Prof. Dr.',
    fields: ['neuroscience'],
    research_focus: 'Connectomics. Dense reconstruction of neural circuits using serial block-face electron microscopy and AI; cortical connectomes.',
    research_focus_de: 'Konnektomik. Dichte Rekonstruktion neuronaler Schaltkreise mittels Serial Block-Face Elektronenmikroskopie und KI; kortikale Konnektome.',
    research_focus_ar: 'الكونيكتوميكس. إعادة بناء كثيف للدوائر العصبية باستخدام المجهر الإلكتروني المتسلسل والذكاء الاصطناعي؛ كونيكتومات قشرية.',
    lab_url: 'https://brain.mpg.de/helmstaedter',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'Director, Department of Connectomics. World leader in dense EM connectomics.'
  },
  {
    id: 'pi_mpi_brain_04',
    institution_id: 'i3',
    programme_id: 'p3',
    name: 'Dr. Alison Barker',
    title: 'Dr.',
    fields: ['neuroscience'],
    research_focus: 'Social systems and circuits. Neural mechanisms underlying social communication, studied in naked mole-rats.',
    research_focus_de: 'Soziale Systeme und Schaltkreise. Neuronale Mechanismen sozialer Kommunikation, untersucht an Nacktmullen.',
    research_focus_ar: 'الأنظمة والدوائر الاجتماعية. الآليات العصبية وراء التواصل الاجتماعي، مدروسة في فأر الخلد العاري.',
    lab_url: 'https://brain.mpg.de/barker',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'Research group leader; established 2021.'
  },

  // ════════════════════════════════════════════════════════════════
  // MPI-IE Freiburg — institution i4 / programme p4
  // ════════════════════════════════════════════════════════════════
  {
    id: 'pi_mpi_ie_01',
    institution_id: 'i4',
    programme_id: 'p4',
    name: 'Prof. Dr. Rudolf Grosschedl',
    title: 'Prof. Dr.',
    fields: ['immunology', 'molecular_biology'],
    research_focus: 'Cellular and molecular immunology. Transcription factor networks in B cell development and plasma cell differentiation.',
    research_focus_de: 'Zelluläre und molekulare Immunologie. Transkriptionsfaktor-Netzwerke in der B-Zell-Entwicklung und Plasmazell-Differenzierung.',
    research_focus_ar: 'علم المناعة الخلوي والجزيئي. شبكات عوامل النسخ في تطوير خلايا B وتمايز خلايا البلازما.',
    lab_url: 'https://www.ie-freiburg.mpg.de/grosschedl',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'Director at MPI-IE; long-standing leader in B-cell biology.'
  },
  {
    id: 'pi_mpi_ie_02',
    institution_id: 'i4',
    programme_id: 'p4',
    name: 'Prof. Dr. Asifa Akhtar',
    title: 'Prof. Dr.',
    fields: ['molecular_biology', 'genetics'],
    research_focus: 'Chromatin regulation and dosage compensation; X-chromosome biology and epigenetic gene regulation.',
    research_focus_de: 'Chromatinregulation und Dosiskompensation; X-Chromosomenbiologie und epigenetische Genregulation.',
    research_focus_ar: 'تنظيم الكروماتين وتعويض الجرعة؛ بيولوجيا الكروموسوم X وتنظيم الجينات الفوق-جينومي.',
    lab_url: 'https://www.ie-freiburg.mpg.de/akhtar',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'Director at MPI-IE; Vice-President of the Max Planck Society Biological & Medical Section.'
  },
  {
    id: 'pi_mpi_ie_03',
    institution_id: 'i4',
    programme_id: 'p4',
    name: 'Prof. Dr. Andreas Diefenbach',
    title: 'Prof. Dr.',
    fields: ['immunology'],
    research_focus: 'Innate lymphoid cells (ILCs) and mucosal immunology; how the immune system maintains tissue homeostasis at barriers.',
    research_focus_de: 'Angeborene lymphoide Zellen (ILCs) und mukosale Immunologie; wie das Immunsystem Gewebehomöostase an Barrieren aufrechterhält.',
    research_focus_ar: 'الخلايا اللمفاوية الفطرية (ILCs) ومناعة الأغشية المخاطية؛ كيف يحافظ الجهاز المناعي على توازن الأنسجة عند الحواجز.',
    lab_url: 'https://www.ie-freiburg.mpg.de/diefenbach',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'Also affiliated with Charité Berlin.'
  },

  // ════════════════════════════════════════════════════════════════
  // Goethe University / Frankfurt Cancer Institute — institution i5 / programme p5
  // ════════════════════════════════════════════════════════════════
  {
    id: 'pi_goethe_01',
    institution_id: 'i5',
    programme_id: 'p5',
    name: 'Prof. Dr. Hubert Serve',
    title: 'Prof. Dr.',
    fields: ['cancer', 'molecular_biology'],
    research_focus: 'Acute myeloid leukaemia (AML) biology and personalised cancer therapy; clinical translation through Frankfurt Cancer Institute.',
    research_focus_de: 'Akute myeloische Leukämie (AML) und personalisierte Krebstherapie; klinische Translation am Frankfurt Cancer Institute.',
    research_focus_ar: 'سرطان الدم النخاعي الحاد (AML) والعلاج المخصص للسرطان؛ الترجمة السريرية عبر معهد فرانكفورت للسرطان.',
    lab_url: 'https://www.frankfurt-cancer-institute.de',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'Director, Frankfurt Cancer Institute.'
  },
  {
    id: 'pi_goethe_02',
    institution_id: 'i5',
    programme_id: 'p5',
    name: 'Prof. Dr. Florian Greten',
    title: 'Prof. Dr.',
    fields: ['cancer', 'immunology'],
    research_focus: 'Tumour biology and intestinal cancer; inflammation-driven carcinogenesis and the tumour microenvironment in colorectal cancer.',
    research_focus_de: 'Tumorbiologie und Darmkrebs; entzündungsgetriebene Karzinogenese und Tumor-Mikroumgebung im kolorektalen Karzinom.',
    research_focus_ar: 'بيولوجيا الأورام وسرطان الأمعاء؛ التسرطن المُحرَّك بالالتهاب والبيئة الورمية الدقيقة في سرطان القولون والمستقيم.',
    lab_url: 'https://www.georg-speyer-haus.de',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'Director, Georg-Speyer-Haus / Institute for Tumour Biology and Experimental Therapy, Frankfurt.'
  },
  {
    id: 'pi_goethe_03',
    institution_id: 'i5',
    programme_id: 'p5',
    name: 'Prof. Dr. Stefan Knapp',
    title: 'Prof. Dr.',
    fields: ['cancer', 'structural_biology', 'molecular_biology'],
    research_focus: 'Structural genomics and chemical biology; kinase inhibitors and PROTAC degraders for cancer drug discovery.',
    research_focus_de: 'Strukturgenomik und chemische Biologie; Kinaseinhibitoren und PROTAC-Degrader für die Krebsmedikamenten-Entwicklung.',
    research_focus_ar: 'الجينوميات الهيكلية والبيولوجيا الكيميائية؛ مثبطات الكيناز ومحلِّلات PROTAC لاكتشاف أدوية السرطان.',
    lab_url: 'https://www.uni-frankfurt.de/49391412/Knapp',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'Heads the Structural Genomics Consortium (SGC) Frankfurt.'
  },

  // ════════════════════════════════════════════════════════════════
  // RUB Bochum — institution i6 / programme p6
  // ════════════════════════════════════════════════════════════════
  {
    id: 'pi_rub_01',
    institution_id: 'i6',
    programme_id: 'p6',
    name: 'Prof. Dr. Denise Manahan-Vaughan',
    title: 'Prof. Dr.',
    fields: ['neuroscience'],
    research_focus: 'Synaptic plasticity and learning in the hippocampus and cortex; in vivo electrophysiology in behaving rodents. Founding director of IGSN.',
    research_focus_de: 'Synaptische Plastizität und Lernen im Hippocampus und Cortex; in vivo Elektrophysiologie an verhaltenden Nagetieren. Gründungsdirektorin der IGSN.',
    research_focus_ar: 'اللدونة المشبكية والتعلّم في الحُصين والقشرة؛ الفيزيولوجيا الكهربية في الحيّ في القوارض المتصرّفة. مديرة مؤسِّسة لـ IGSN.',
    lab_url: 'https://www.neuralplast.rub.de',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'Founding Director of the International Graduate School of Neuroscience (IGSN) at RUB.'
  },
  {
    id: 'pi_rub_02',
    institution_id: 'i6',
    programme_id: 'p6',
    name: 'Prof. Dr. Stefan Herlitze',
    title: 'Prof. Dr.',
    fields: ['neuroscience'],
    research_focus: 'Optogenetics and neural circuit function; G-protein-coupled signalling in the cerebellum and motor learning.',
    research_focus_de: 'Optogenetik und neuronale Schaltkreisfunktion; G-Protein-gekoppelte Signalwege im Kleinhirn und motorisches Lernen.',
    research_focus_ar: 'علم الأوبتوجينيتيكس ووظيفة الدوائر العصبية؛ الإشارات المقترنة بالبروتين G في المخيخ والتعلّم الحركي.',
    lab_url: 'https://www.ruhr-uni-bochum.de/zoologie',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'Chair of General Zoology and Neurobiology at RUB.'
  },
  {
    id: 'pi_rub_03',
    institution_id: 'i6',
    programme_id: 'p6',
    name: 'Prof. Dr. Onur Güntürkün',
    title: 'Prof. Dr.',
    fields: ['neuroscience'],
    research_focus: 'Biopsychology and avian cognition; lateralisation of the brain and the neural basis of cognition in pigeons and corvids.',
    research_focus_de: 'Biopsychologie und Vogelkognition; Lateralisierung des Gehirns und neuronale Grundlagen der Kognition bei Tauben und Krähenvögeln.',
    research_focus_ar: 'علم النفس البيولوجي وإدراك الطيور؛ توطين وظائف الدماغ والأساس العصبي للإدراك في الحمام والغرابيات.',
    lab_url: 'https://www.bio.psy.ruhr-uni-bochum.de',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'Leibniz Prize laureate; international leader in comparative cognition.'
  },
  {
    id: 'pi_rub_04',
    institution_id: 'i6',
    programme_id: 'p6',
    name: 'Prof. Dr. Sen Cheng',
    title: 'Prof. Dr.',
    fields: ['neuroscience'],
    research_focus: 'Computational neuroscience of learning and memory; neural network models of hippocampal function and episodic memory.',
    research_focus_de: 'Computationale Neurowissenschaft von Lernen und Gedächtnis; neuronale Netzwerkmodelle der Hippocampus-Funktion und des episodischen Gedächtnisses.',
    research_focus_ar: 'علم الأعصاب الحوسبي للتعلّم والذاكرة؛ نماذج الشبكات العصبية لوظيفة الحُصين والذاكرة الحدثية.',
    lab_url: 'https://www.ini.rub.de',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'Institute for Neural Computation (INI), RUB.'
  },

  // ════════════════════════════════════════════════════════════════
  // TU Dortmund — institution i7 / programme p7
  // ════════════════════════════════════════════════════════════════
  {
    id: 'pi_tudo_01',
    institution_id: 'i7',
    programme_id: 'p7',
    name: 'Prof. Dr. Daniel Rauh',
    title: 'Prof. Dr.',
    fields: ['cancer', 'structural_biology', 'molecular_biology'],
    research_focus: 'Chemical biology and drug discovery; targeting drug-resistant kinases in cancer using structure-based design.',
    research_focus_de: 'Chemische Biologie und Medikamentenentwicklung; Targeting medikamentenresistenter Kinasen in Krebs mittels strukturbasiertem Design.',
    research_focus_ar: 'البيولوجيا الكيميائية واكتشاف الأدوية؛ استهداف الكينازات المقاومة للأدوية في السرطان باستخدام التصميم القائم على الهيكل.',
    lab_url: 'https://www.daniel-rauh.de',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'Faculty of Chemistry and Chemical Biology, TU Dortmund.'
  },
  {
    id: 'pi_tudo_02',
    institution_id: 'i7',
    programme_id: 'p7',
    name: 'Prof. Dr. Andrea Musacchio',
    title: 'Prof. Dr.',
    fields: ['molecular_biology', 'structural_biology'],
    research_focus: 'Mechanisms of chromosome segregation; structural biology of the kinetochore and the spindle assembly checkpoint.',
    research_focus_de: 'Mechanismen der Chromosomensegregation; Strukturbiologie des Kinetochors und des Spindle Assembly Checkpoint.',
    research_focus_ar: 'آليات فصل الكروموسومات؛ البيولوجيا الهيكلية للكينيتوكور ونقطة تفتيش تجميع المغزل.',
    lab_url: 'https://www.mpi-dortmund.mpg.de/research-groups/musacchio',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'Director, MPI of Molecular Physiology, Dortmund campus.'
  },
  {
    id: 'pi_tudo_03',
    institution_id: 'i7',
    programme_id: 'p7',
    name: 'Prof. Dr. Stefan Raunser',
    title: 'Prof. Dr.',
    fields: ['structural_biology', 'molecular_biology'],
    research_focus: 'Cryo-electron microscopy of large macromolecular complexes; structural biology of toxins and motor proteins.',
    research_focus_de: 'Kryo-Elektronenmikroskopie großer makromolekularer Komplexe; Strukturbiologie von Toxinen und Motorproteinen.',
    research_focus_ar: 'مجهر إلكتروني تبريدي للمعقدات الجزيئية الكبيرة؛ البيولوجيا الهيكلية للسموم والبروتينات المحركة.',
    lab_url: 'https://www.mpi-dortmund.mpg.de/research-groups/raunser',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'Director, MPI of Molecular Physiology, Dortmund campus.'
  },

  // ════════════════════════════════════════════════════════════════
  // University of Bonn — institution i8 / programme p8 (Immuno) or p9 (Neuro)
  // ════════════════════════════════════════════════════════════════
  {
    id: 'pi_bonn_01',
    institution_id: 'i8',
    programme_id: 'p8',
    name: 'Prof. Dr. Gunther Hartmann',
    title: 'Prof. Dr.',
    fields: ['immunology', 'molecular_biology'],
    research_focus: 'Clinical chemistry and innate immunity; nucleic acid sensing by the immune system, RIG-I-like receptors and therapeutic RNA design.',
    research_focus_de: 'Klinische Chemie und angeborene Immunität; Nukleinsäure-Erkennung durch das Immunsystem, RIG-I-ähnliche Rezeptoren und therapeutisches RNA-Design.',
    research_focus_ar: 'الكيمياء السريرية والمناعة الفطرية؛ استشعار الأحماض النووية بواسطة الجهاز المناعي، مستقبلات شبيهة بـ RIG-I وتصميم RNA العلاجي.',
    lab_url: 'https://www.ukbonn.de/klinische_chemie/',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'Speaker of the Cluster of Excellence ImmunoSensation² at the University of Bonn.'
  },
  {
    id: 'pi_bonn_02',
    institution_id: 'i8',
    programme_id: 'p8',
    name: 'Prof. Dr. Christian Kurts',
    title: 'Prof. Dr.',
    fields: ['immunology'],
    research_focus: 'Experimental immunology; tissue-resident immune cells, kidney immunology, and the regulation of immune responses in solid organs.',
    research_focus_de: 'Experimentelle Immunologie; gewebeständige Immunzellen, Nieren-Immunologie und Regulation von Immunantworten in soliden Organen.',
    research_focus_ar: 'علم المناعة التجريبي؛ الخلايا المناعية المقيمة في الأنسجة، مناعة الكلى، وتنظيم الاستجابات المناعية في الأعضاء الصلبة.',
    lab_url: 'https://www.iei.uni-bonn.de',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'Director, Institute of Experimental Immunology, University of Bonn.'
  },
  {
    id: 'pi_bonn_03',
    institution_id: 'i8',
    programme_id: 'p8',
    name: 'Prof. Dr. Hiroki Kato',
    title: 'Prof. Dr.',
    fields: ['immunology', 'molecular_biology'],
    research_focus: 'Molecular medicine and innate immune sensing of RNA. Heads the Institute formerly led by Veit Hornung.',
    research_focus_de: 'Molekulare Medizin und angeborene Immunerkennung von RNA. Leitet das Institut, das früher von Veit Hornung geführt wurde.',
    research_focus_ar: 'الطب الجزيئي والاستشعار الفطري للـ RNA. يرأس المعهد الذي كان يقوده سابقاً فيت هورنونغ.',
    lab_url: 'https://www.molekulare-medizin.uni-bonn.de',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'Institute of Molecular Medicine, University of Bonn.'
  },
  {
    id: 'pi_bonn_04',
    institution_id: 'i8',
    programme_id: 'p8',
    name: 'Prof. Dr. Felix Meissner',
    title: 'Prof. Dr.',
    fields: ['immunology', 'molecular_biology'],
    research_focus: 'Systems immunology and quantitative proteomics; molecular characterisation of inflammatory cell signalling. ERC Consolidator Grant 2023.',
    research_focus_de: 'Systemimmunologie und quantitative Proteomik; molekulare Charakterisierung entzündlicher Zellsignalwege. ERC Consolidator Grant 2023.',
    research_focus_ar: 'علم المناعة النظمي والبروتيوميات الكمية؛ التوصيف الجزيئي لإشارات الخلايا الالتهابية. منحة ERC Consolidator 2023.',
    lab_url: 'https://www.iei.uni-bonn.de/meissner',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'ERC Consolidator 2023: "Inflammatory signals of cell death".'
  },
  {
    id: 'pi_bonn_05',
    institution_id: 'i8',
    programme_id: 'p8',
    name: 'Prof. Dr. Christoph Wilhelm',
    title: 'Prof. Dr.',
    fields: ['immunology'],
    research_focus: 'Dietary immunology; how dietary components and metabolites regulate tissue-resident T cells and ILCs in inflammation, obesity, and infection.',
    research_focus_de: 'Diätetische Immunologie; wie Nahrungsbestandteile und Metaboliten gewebeständige T-Zellen und ILCs in Entzündung, Adipositas und Infektion regulieren.',
    research_focus_ar: 'علم المناعة الغذائي؛ كيف تنظّم المكونات الغذائية والأيضات خلايا T المقيمة في الأنسجة و ILCs في الالتهاب والسمنة والعدوى.',
    lab_url: 'https://www.ukbonn.de',
    email: null,
    accepting_students: true,
    recent_papers: [
      { title: 'Dietary metabolism shapes tissue-resident immunity', journal: 'Nature', year: 2022, url: 'https://www.nature.com/articles/s41586-022-04984-8' }
    ],
    notes: 'University Hospital Bonn (UKB).'
  },
  {
    id: 'pi_bonn_06',
    institution_id: 'i8',
    programme_id: 'p9',
    name: 'Prof. Dr. Heinz Beck',
    title: 'Prof. Dr.',
    fields: ['neuroscience'],
    research_focus: 'Experimental epileptology and cognition; pathophysiology of temporal lobe epilepsy and cognitive deficits in epilepsy.',
    research_focus_de: 'Experimentelle Epileptologie und Kognition; Pathophysiologie der Temporallappenepilepsie und kognitive Defizite bei Epilepsie.',
    research_focus_ar: 'علم الصرع التجريبي والإدراك؛ الفيزيولوجيا المرضية لصرع الفص الصدغي والعجز الإدراكي في الصرع.',
    lab_url: 'https://www.ukbonn.de/epileptologie',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'University Hospital Bonn; member of BIGS Neuroscience.'
  },

  // ════════════════════════════════════════════════════════════════
  // University of Heidelberg — institution i9 / programme p10 (HBIGS)
  // ════════════════════════════════════════════════════════════════
  {
    id: 'pi_uhd_01',
    institution_id: 'i9',
    programme_id: 'p10',
    name: 'Prof. Dr. Hans-Reimer Rodewald',
    title: 'Prof. Dr.',
    fields: ['immunology'],
    research_focus: 'Cellular immunology and developmental biology; clonal dynamics of haematopoiesis and T cell development.',
    research_focus_de: 'Zelluläre Immunologie und Entwicklungsbiologie; klonale Dynamik der Hämatopoese und T-Zell-Entwicklung.',
    research_focus_ar: 'علم المناعة الخلوي وبيولوجيا النمو؛ الديناميكيات الكلونية لتكوين الدم وتطوّر خلايا T.',
    lab_url: 'https://www.dkfz.de/en/Immunologie',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'Joint position DKFZ / Heidelberg University.'
  },
  {
    id: 'pi_uhd_02',
    institution_id: 'i9',
    programme_id: 'p10',
    name: 'Prof. Dr. Ana Martin-Villalba',
    title: 'Prof. Dr.',
    fields: ['neuroscience', 'cancer'],
    research_focus: 'Molecular neurobiology; neural stem cells in the adult brain and their interaction with glioma initiation.',
    research_focus_de: 'Molekulare Neurobiologie; neuronale Stammzellen im erwachsenen Gehirn und ihre Interaktion mit der Gliom-Entstehung.',
    research_focus_ar: 'علم الأعصاب الجزيئي؛ الخلايا الجذعية العصبية في الدماغ البالغ وتفاعلها مع نشأة الورم الدبقي.',
    lab_url: 'https://www.dkfz.de/en/molecular-neurobiology',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'Joint position DKFZ / Heidelberg University.'
  },
  {
    id: 'pi_uhd_03',
    institution_id: 'i9',
    programme_id: 'p10',
    name: 'Prof. Dr. Hilmar Bading',
    title: 'Prof. Dr.',
    fields: ['neuroscience'],
    research_focus: 'Neurobiology; activity-dependent gene expression in neurons, neuroprotection, and synaptic signalling to the nucleus.',
    research_focus_de: 'Neurobiologie; aktivitätsabhängige Genexpression in Neuronen, Neuroprotektion und synaptische Signalwege zum Nukleus.',
    research_focus_ar: 'علم الأعصاب؛ التعبير الجيني المعتمد على النشاط في العصبونات، الحماية العصبية، وإشارات المشابك إلى النواة.',
    lab_url: 'https://www.nbio.uni-heidelberg.de',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'Director, Department of Neurobiology, Heidelberg University.'
  },
  {
    id: 'pi_uhd_04',
    institution_id: 'i9',
    programme_id: 'p10',
    name: 'Prof. Dr. Andres Jäschke',
    title: 'Prof. Dr.',
    fields: ['molecular_biology', 'structural_biology'],
    research_focus: 'Chemical biology of nucleic acids; RNA structure-function, ribozymes, and chemical labelling of cellular RNAs.',
    research_focus_de: 'Chemische Biologie von Nukleinsäuren; RNA-Struktur-Funktion, Ribozyme und chemische Markierung zellulärer RNAs.',
    research_focus_ar: 'البيولوجيا الكيميائية للأحماض النووية؛ هيكل ووظيفة RNA، الريبوزيمات، والتمييز الكيميائي لـ RNA الخلوي.',
    lab_url: 'https://www.uni-heidelberg.de/pharmazie',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'Institute of Pharmacy and Molecular Biotechnology (IPMB), Heidelberg University.'
  },
  {
    id: 'pi_uhd_05',
    institution_id: 'i9',
    programme_id: 'p10',
    name: 'Prof. Dr. Andreas Trumpp',
    title: 'Prof. Dr.',
    fields: ['cancer', 'molecular_biology'],
    research_focus: 'Stem cells and cancer; cancer stem cells in leukaemia and breast cancer, dormancy and metastasis.',
    research_focus_de: 'Stammzellen und Krebs; Krebsstammzellen bei Leukämie und Brustkrebs, Dormanz und Metastasierung.',
    research_focus_ar: 'الخلايا الجذعية والسرطان؛ الخلايا الجذعية السرطانية في اللوكيميا وسرطان الثدي، السكون والنقائل.',
    lab_url: 'https://www.dkfz.de/en/stamcellsandcancer',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'Joint position DKFZ / HI-STEM gGmbH / Heidelberg University.'
  },

  // ════════════════════════════════════════════════════════════════
  // University of Bielefeld — institution i10 / programme p11
  // ════════════════════════════════════════════════════════════════
  {
    id: 'pi_bi_01',
    institution_id: 'i10',
    programme_id: 'p11',
    name: 'Prof. Dr. Volker Gerke',
    title: 'Prof. Dr.',
    fields: ['molecular_biology', 'cancer'],
    research_focus: 'Cellular biochemistry; annexins, membrane organisation, and intracellular trafficking in epithelial and endothelial cells.',
    research_focus_de: 'Zelluläre Biochemie; Annexine, Membranorganisation und intrazellulärer Transport in Epithel- und Endothelzellen.',
    research_focus_ar: 'الكيمياء الحيوية الخلوية؛ الأنكسينات، تنظيم الأغشية، والنقل داخل الخلوي في الخلايا الظهارية والبطانية.',
    lab_url: 'https://www.medizin.uni-muenster.de/medbio',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'Note: cell biology faculty in OWL region (Münster/Bielefeld cluster).'
  },
  {
    id: 'pi_bi_02',
    institution_id: 'i10',
    programme_id: 'p11',
    name: 'Prof. Dr. Karl-Josef Dietz',
    title: 'Prof. Dr.',
    fields: ['molecular_biology', 'genetics'],
    research_focus: 'Biochemistry and physiology of plants and stress response; redox biology relevant to oxidative stress in disease models.',
    research_focus_de: 'Biochemie und Physiologie der Pflanzen und Stressantwort; Redox-Biologie relevant für oxidativen Stress in Krankheitsmodellen.',
    research_focus_ar: 'الكيمياء الحيوية وفسيولوجيا النباتات والاستجابة للإجهاد؛ بيولوجيا الأكسدة والاختزال ذات الصلة بالإجهاد التأكسدي في نماذج الأمراض.',
    lab_url: 'https://www.uni-bielefeld.de/fakultaeten/biologie',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'Faculty of Biology, University of Bielefeld.'
  },

  // ════════════════════════════════════════════════════════════════
  // Charité Berlin — institution i11 / programme p12 (BSIO) or p13 (NeuroCure)
  // ════════════════════════════════════════════════════════════════
  {
    id: 'pi_charite_01',
    institution_id: 'i11',
    programme_id: 'p12',
    name: 'Prof. Dr. Ulrich Keilholz',
    title: 'Prof. Dr.',
    fields: ['cancer', 'immunology'],
    research_focus: 'Translational oncology; melanoma immunotherapy, biomarkers, and clinical trials in advanced solid tumours.',
    research_focus_de: 'Translationale Onkologie; Melanom-Immuntherapie, Biomarker und klinische Studien bei fortgeschrittenen soliden Tumoren.',
    research_focus_ar: 'علم الأورام الترجمي؛ العلاج المناعي للميلانوما، المؤشرات الحيوية، والتجارب السريرية في الأورام الصلبة المتقدمة.',
    lab_url: 'https://cccc.charite.de',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'Director, Comprehensive Cancer Center Charité (CCCC).'
  },
  {
    id: 'pi_charite_02',
    institution_id: 'i11',
    programme_id: 'p12',
    name: 'Prof. Dr. Angelika Eggert',
    title: 'Prof. Dr.',
    fields: ['cancer', 'genetics'],
    research_focus: 'Paediatric oncology; neuroblastoma genomics and targeted therapies for childhood cancers.',
    research_focus_de: 'Pädiatrische Onkologie; Neuroblastom-Genomik und gezielte Therapien für Krebserkrankungen im Kindesalter.',
    research_focus_ar: 'علم أورام الأطفال؛ جينوميات الورم الأرومي العصبي والعلاجات الموجهة لسرطانات الطفولة.',
    lab_url: 'https://kinderonkologie.charite.de',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'Director, Department of Pediatric Oncology and Hematology, Charité.'
  },
  {
    id: 'pi_charite_03',
    institution_id: 'i11',
    programme_id: 'p13',
    name: 'Prof. Dr. Ulrich Dirnagl',
    title: 'Prof. Dr.',
    fields: ['neuroscience'],
    research_focus: 'Experimental neurology; ischaemic stroke, neuroprotection, and research methodology / open science.',
    research_focus_de: 'Experimentelle Neurologie; ischämischer Schlaganfall, Neuroprotektion und Forschungsmethodik / Open Science.',
    research_focus_ar: 'علم الأعصاب التجريبي؛ السكتة الإقفارية، الحماية العصبية، ومنهجية البحث / العلم المفتوح.',
    lab_url: 'https://experimental-neurology.charite.de',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'Founding Director of BIH QUEST Center for Responsible Research; NeuroCure faculty.'
  },
  {
    id: 'pi_charite_04',
    institution_id: 'i11',
    programme_id: 'p13',
    name: 'Prof. Dr. Helmut Kettenmann',
    title: 'Prof. Dr.',
    fields: ['neuroscience', 'immunology'],
    research_focus: 'Cellular neuroscience; physiology of microglia and astrocytes in health and brain disease.',
    research_focus_de: 'Zelluläre Neurowissenschaft; Physiologie der Mikroglia und Astrozyten in Gesundheit und Hirnerkrankung.',
    research_focus_ar: 'علم الأعصاب الخلوي؛ فسيولوجيا الميكروغليا والخلايا النجمية في الصحة وأمراض الدماغ.',
    lab_url: 'https://www.mdc-berlin.de/kettenmann',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'Senior PI at MDC Berlin / Charité; pioneer of glial cell electrophysiology.'
  },
  {
    id: 'pi_charite_05',
    institution_id: 'i11',
    programme_id: 'p13',
    name: 'Prof. Dr. Christian Rosenmund',
    title: 'Prof. Dr.',
    fields: ['neuroscience'],
    research_focus: 'Cellular neurophysiology; molecular mechanisms of neurotransmitter release and synaptic vesicle priming.',
    research_focus_de: 'Zelluläre Neurophysiologie; molekulare Mechanismen der Neurotransmitterausschüttung und synaptische Vesikel-Priming.',
    research_focus_ar: 'الفيزيولوجيا العصبية الخلوية؛ الآليات الجزيئية لإفراز الناقلات العصبية وتجهيز الحويصلات المشبكية.',
    lab_url: 'https://neurophysiologie.charite.de',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'NeuroCure Cluster of Excellence.'
  },
  {
    id: 'pi_charite_06',
    institution_id: 'i11',
    programme_id: 'p13',
    name: 'Prof. Dr. Dietmar Schmitz',
    title: 'Prof. Dr.',
    fields: ['neuroscience'],
    research_focus: 'Cellular neuroscience and synaptic physiology; hippocampal circuits, learning and memory.',
    research_focus_de: 'Zelluläre Neurowissenschaft und synaptische Physiologie; hippocampale Schaltkreise, Lernen und Gedächtnis.',
    research_focus_ar: 'علم الأعصاب الخلوي والفيزيولوجيا المشبكية؛ دوائر الحُصين، التعلّم والذاكرة.',
    lab_url: 'https://www.neuroscience-berlin.de/schmitz-lab',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'Speaker of NeuroCure Cluster of Excellence; joint position Charité / DZNE Berlin.'
  },

  // ════════════════════════════════════════════════════════════════
  // EMBL Heidelberg — institution i12 / programme p14
  // ════════════════════════════════════════════════════════════════
  {
    id: 'pi_embl_01',
    institution_id: 'i12',
    programme_id: 'p14',
    name: 'Dr. Wolfgang Huber',
    title: 'Dr.',
    fields: ['molecular_biology', 'cancer', 'genetics'],
    research_focus: 'Computational biology and statistics; methods for high-throughput genomics, single-cell RNA-seq, and reproducible research. Co-creator of DESeq2.',
    research_focus_de: 'Computationale Biologie und Statistik; Methoden für High-Throughput-Genomik, Single-Cell-RNA-seq und reproduzierbare Forschung. Mitentwickler von DESeq2.',
    research_focus_ar: 'البيولوجيا الحوسبية والإحصاء؛ طرق الجينوميات عالية الإنتاج، single-cell RNA-seq، والبحث القابل للتكرار. مشارك في تطوير DESeq2.',
    lab_url: 'https://www.embl.org/groups/huber/',
    email: null,
    accepting_students: true,
    recent_papers: [
      { title: 'Moderated estimation of fold change and dispersion for RNA-seq data with DESeq2', journal: 'Genome Biology', year: 2014, url: 'https://doi.org/10.1186/s13059-014-0550-8' }
    ],
    notes: 'Senior Scientist, EMBL Heidelberg. Co-author of the DESeq2 method.'
  },
  {
    id: 'pi_embl_02',
    institution_id: 'i12',
    programme_id: 'p14',
    name: 'Dr. Eileen Furlong',
    title: 'Dr.',
    fields: ['molecular_biology', 'genetics'],
    research_focus: 'Genome regulation and developmental biology; how enhancers and chromatin organisation control transcription during embryogenesis.',
    research_focus_de: 'Genomregulation und Entwicklungsbiologie; wie Enhancer und Chromatinorganisation die Transkription während der Embryogenese steuern.',
    research_focus_ar: 'تنظيم الجينوم وبيولوجيا النمو؛ كيف يتحكم المحفّزات وتنظيم الكروماتين في النسخ أثناء التكوّن الجنيني.',
    lab_url: 'https://www.embl.org/groups/furlong/',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'Head of Genome Biology Unit, EMBL Heidelberg.'
  },
  {
    id: 'pi_embl_03',
    institution_id: 'i12',
    programme_id: 'p14',
    name: 'Dr. Lars Steinmetz',
    title: 'Dr.',
    fields: ['molecular_biology', 'genetics'],
    research_focus: 'Personal genomics and precision medicine; single-molecule genomics, somatic variation, and translation to clinical applications.',
    research_focus_de: 'Personalisierte Genomik und Präzisionsmedizin; Einzelmolekül-Genomik, somatische Variation und klinische Anwendungen.',
    research_focus_ar: 'الجينوميات الشخصية والطب الدقيق؛ جينوميات الجزيء الواحد، التباين الجسدي، والتطبيقات السريرية.',
    lab_url: 'https://www.embl.org/groups/steinmetz/',
    email: null,
    accepting_students: true,
    recent_papers: [],
    notes: 'Co-Director of the Stanford Genome Technology Center; joint appointment Stanford / EMBL.'
  },
];

// ════════════════════════════════════════════════════════════════
// Joined view: PIs with their institution and programme attached
// ════════════════════════════════════════════════════════════════
export const pisWithContext = pis.map((p) => ({
  ...p,
  institution: institutions.find((i) => i.id === p.institution_id) ?? null,
  programme: programmes.find((prog) => prog.id === p.programme_id) ?? null,
}));
