export type SubjectKey = "matematica" | "fisica" | "quimica";

export interface KnowledgeSubject {
  key: SubjectKey;
  name: string;
  icon: string;
  colorClass: string;
}

export interface KnowledgeUnit {
  id: string;
  subjectKey: SubjectKey;
  title: string;
  description: string;
  gradeRange: [number, number];
  prerequisites: string[];
}

export interface KnowledgeTopic {
  id: string;
  unitId: string;
  title: string;
  description: string;
}

export type PracticeItemType = "true_false" | "multiple_choice" | "short_answer";
export type FocusMode = "N1" | "N2" | "MIXED";

export interface PracticeItemTemplate {
  id: string;
  unitId: string;
  topicId: string;
  type: PracticeItemType;
  mode: FocusMode;
  difficulty: number;
  prompt: string;
  options?: string[];
  correctAnswer: string;
  acceptedKeywords?: string[];
  explanation: string;
  errorTag: "concept" | "calculation";
}

export interface StandardTrackTemplate {
  id: string;
  subjectKey: SubjectKey;
  title: string;
  description: string;
  unitIds: string[];
  defaultFocusMode: FocusMode;
}

export interface KnowledgeInsightTemplate {
  id: string;
  title: string;
  text: string;
  subjectKeys: SubjectKey[];
  unitIds: string[];
}

export const KNOWLEDGE_SUBJECTS: KnowledgeSubject[] = [
  {
    key: "matematica",
    name: "Matematica",
    icon: "M",
    colorClass: "from-blue-500/15 to-cyan-500/15 border-blue-200",
  },
  {
    key: "fisica",
    name: "Fisica",
    icon: "F",
    colorClass: "from-indigo-500/15 to-sky-500/15 border-indigo-200",
  },
  {
    key: "quimica",
    name: "Quimica",
    icon: "Q",
    colorClass: "from-emerald-500/15 to-lime-500/15 border-emerald-200",
  },
];

export const KNOWLEDGE_UNITS: KnowledgeUnit[] = [
  {
    id: "mat-geometria-plana",
    subjectKey: "matematica",
    title: "Geometria plana",
    description: "Area, perimetro e relacoes geometricas basicas.",
    gradeRange: [6, 9],
    prerequisites: [],
  },
  {
    id: "mat-trigonometria",
    subjectKey: "matematica",
    title: "Trigonometria",
    description: "Seno, cosseno, tangente e aplicacoes.",
    gradeRange: [9, 12],
    prerequisites: ["mat-geometria-plana"],
  },
  {
    id: "mat-funcoes",
    subjectKey: "matematica",
    title: "Funcoes",
    description: "Leitura de graficos e comportamento de funcoes.",
    gradeRange: [9, 12],
    prerequisites: ["mat-geometria-plana"],
  },
  {
    id: "mat-geometria-analitica",
    subjectKey: "matematica",
    title: "Geometria analitica",
    description: "Plano cartesiano e distancia entre pontos.",
    gradeRange: [10, 12],
    prerequisites: ["mat-funcoes"],
  },
  {
    id: "fis-cinematica",
    subjectKey: "fisica",
    title: "Cinematica",
    description: "Movimento, velocidade media e graficos.",
    gradeRange: [9, 12],
    prerequisites: [],
  },
  {
    id: "fis-dinamica",
    subjectKey: "fisica",
    title: "Dinamica",
    description: "Leis de Newton e forca resultante.",
    gradeRange: [9, 12],
    prerequisites: ["fis-cinematica"],
  },
  {
    id: "fis-energia",
    subjectKey: "fisica",
    title: "Energia e trabalho",
    description: "Conservacao de energia e potencia.",
    gradeRange: [10, 12],
    prerequisites: ["fis-dinamica"],
  },
  {
    id: "qui-atomistica",
    subjectKey: "quimica",
    title: "Atomistica",
    description: "Estrutura atomica e tabela periodica.",
    gradeRange: [8, 10],
    prerequisites: [],
  },
  {
    id: "qui-estequiometria",
    subjectKey: "quimica",
    title: "Estequiometria",
    description: "Balanceamento e calculos molares.",
    gradeRange: [9, 12],
    prerequisites: ["qui-atomistica"],
  },
  {
    id: "qui-solucoes",
    subjectKey: "quimica",
    title: "Solucoes",
    description: "Concentracao, diluicao e misturas.",
    gradeRange: [10, 12],
    prerequisites: ["qui-estequiometria"],
  },
];

export const KNOWLEDGE_TOPICS: KnowledgeTopic[] = [
  { id: "top-tri-seno", unitId: "mat-trigonometria", title: "Seno e cosseno", description: "Razoes no triangulo retangulo." },
  { id: "top-tri-tangente", unitId: "mat-trigonometria", title: "Tangente", description: "Relacao entre os catetos." },
  { id: "top-geo-area", unitId: "mat-geometria-plana", title: "Area", description: "Calculo de area de figuras." },
  { id: "top-geo-perimetro", unitId: "mat-geometria-plana", title: "Perimetro", description: "Soma dos lados." },
  { id: "top-fun-leitura", unitId: "mat-funcoes", title: "Leitura de graficos", description: "Interpretacao visual de funcoes." },
  { id: "top-fun-quadratica", unitId: "mat-funcoes", title: "Funcao quadratica", description: "Parabola e pontos notaveis." },
  { id: "top-geoa-pontos", unitId: "mat-geometria-analitica", title: "Pontos no plano", description: "Distancia e ponto medio." },
  { id: "top-geoa-reta", unitId: "mat-geometria-analitica", title: "Equacao da reta", description: "Coeficiente angular e linear." },
  { id: "top-cin-vm", unitId: "fis-cinematica", title: "Velocidade media", description: "Deslocamento por tempo." },
  { id: "top-cin-graficos", unitId: "fis-cinematica", title: "Graficos de movimento", description: "Posicao, velocidade e aceleracao." },
  { id: "top-din-fma", unitId: "fis-dinamica", title: "Segunda lei", description: "F = m.a." },
  { id: "top-din-acao", unitId: "fis-dinamica", title: "Acao e reacao", description: "Terceira lei de Newton." },
  { id: "top-ene-conservacao", unitId: "fis-energia", title: "Conservacao", description: "Energia mecanica total." },
  { id: "top-ene-trabalho", unitId: "fis-energia", title: "Trabalho de uma forca", description: "Forca vezes deslocamento." },
  { id: "top-ato-modelos", unitId: "qui-atomistica", title: "Modelos atomicos", description: "Evolucao dos modelos." },
  { id: "top-ato-tabela", unitId: "qui-atomistica", title: "Tabela periodica", description: "Familias e periodos." },
  { id: "top-est-balanceamento", unitId: "qui-estequiometria", title: "Balanceamento", description: "Conservacao da massa." },
  { id: "top-est-mol", unitId: "qui-estequiometria", title: "Calculo molar", description: "Relacao entre massa e mol." },
  { id: "top-sol-concentracao", unitId: "qui-solucoes", title: "Concentracao", description: "g/L, mol/L e porcentagem." },
  { id: "top-sol-diluicao", unitId: "qui-solucoes", title: "Diluicao", description: "M1V1 = M2V2." },
];

export const STANDARD_TRACK_TEMPLATES: StandardTrackTemplate[] = [
  {
    id: "track-mat-base",
    subjectKey: "matematica",
    title: "Fundamentos de Matematica",
    description: "Base para provas e aplicacoes.",
    unitIds: ["mat-geometria-plana", "mat-funcoes", "mat-trigonometria"],
    defaultFocusMode: "MIXED",
  },
  {
    id: "track-mat-aplicacoes",
    subjectKey: "matematica",
    title: "Funcoes e aplicacoes",
    description: "Foco em leitura de graficos e problemas.",
    unitIds: ["mat-funcoes", "mat-trigonometria", "mat-geometria-analitica"],
    defaultFocusMode: "N2",
  },
  {
    id: "track-fis-base",
    subjectKey: "fisica",
    title: "Fisica em movimento",
    description: "Cinematica para dinamica.",
    unitIds: ["fis-cinematica", "fis-dinamica", "fis-energia"],
    defaultFocusMode: "MIXED",
  },
  {
    id: "track-qui-base",
    subjectKey: "quimica",
    title: "Quimica essencial",
    description: "Atomistica para estequiometria.",
    unitIds: ["qui-atomistica", "qui-estequiometria", "qui-solucoes"],
    defaultFocusMode: "MIXED",
  },
];

export const KNOWLEDGE_INSIGHTS: KnowledgeInsightTemplate[] = [
  {
    id: "insight-fis-mat-parabola",
    title: "Lancamento obliquo e funcao quadratica",
    text: "A trajetoria do lancamento obliquo forma uma parabola. Dominar funcao quadratica acelera a leitura dos problemas de fisica.",
    subjectKeys: ["matematica", "fisica"],
    unitIds: ["mat-funcoes", "fis-cinematica"],
  },
  {
    id: "insight-cin-graficos",
    title: "Cinematica e interpretacao de graficos",
    text: "Graficos de posicao e velocidade usam leitura de eixos, taxa de variacao e comparacao de curvas. E matematica aplicada direto.",
    subjectKeys: ["matematica", "fisica"],
    unitIds: ["mat-funcoes", "fis-cinematica"],
  },
  {
    id: "insight-energia-conservacao",
    title: "Conservacao conecta fisica e quimica",
    text: "A ideia de conservacao ajuda em energia mecanica e tambem em balanceamento quimico: o que entra precisa aparecer no resultado.",
    subjectKeys: ["fisica", "quimica"],
    unitIds: ["fis-energia", "qui-estequiometria"],
  },
];

export const PRACTICE_ITEM_BANK: PracticeItemTemplate[] = [
  {
    id: "item-tri-1",
    unitId: "mat-trigonometria",
    topicId: "top-tri-seno",
    type: "true_false",
    mode: "N1",
    difficulty: 1,
    prompt: "No triangulo retangulo, seno = cateto oposto / hipotenusa.",
    correctAnswer: "true",
    explanation: "Seno relaciona o cateto oposto com a hipotenusa.",
    errorTag: "concept",
  },
  {
    id: "item-tri-2",
    unitId: "mat-trigonometria",
    topicId: "top-tri-seno",
    type: "multiple_choice",
    mode: "N2",
    difficulty: 2,
    prompt: "Se sen(x)=0.5, qual angulo notavel pode representar x?",
    options: ["30", "45", "60", "90"],
    correctAnswer: "30",
    explanation: "Seno de 30 graus vale 0.5.",
    errorTag: "calculation",
  },
  {
    id: "item-tri-3",
    unitId: "mat-trigonometria",
    topicId: "top-tri-tangente",
    type: "short_answer",
    mode: "N1",
    difficulty: 2,
    prompt: "Explique como calcular tangente no triangulo retangulo.",
    correctAnswer: "oposto dividido por adjacente",
    acceptedKeywords: ["oposto", "adjacente"],
    explanation: "Tangente e a razao entre cateto oposto e cateto adjacente.",
    errorTag: "concept",
  },
  {
    id: "item-geo-1",
    unitId: "mat-geometria-plana",
    topicId: "top-geo-area",
    type: "multiple_choice",
    mode: "N1",
    difficulty: 1,
    prompt: "Area de um retangulo de base 8 e altura 5:",
    options: ["13", "40", "80", "20"],
    correctAnswer: "40",
    explanation: "Area = base x altura.",
    errorTag: "calculation",
  },
  {
    id: "item-geo-2",
    unitId: "mat-geometria-plana",
    topicId: "top-geo-perimetro",
    type: "true_false",
    mode: "N1",
    difficulty: 1,
    prompt: "Perimetro mede a regiao interna da figura.",
    correctAnswer: "false",
    explanation: "Perimetro mede o contorno, nao a area interna.",
    errorTag: "concept",
  },
  {
    id: "item-fun-1",
    unitId: "mat-funcoes",
    topicId: "top-fun-leitura",
    type: "multiple_choice",
    mode: "N2",
    difficulty: 2,
    prompt: "Se y aumenta quando x aumenta, a funcao nesse trecho e:",
    options: ["crescente", "decrescente", "constante", "periodica"],
    correctAnswer: "crescente",
    explanation: "Funcao crescente sobe para a direita.",
    errorTag: "concept",
  },
  {
    id: "item-fun-2",
    unitId: "mat-funcoes",
    topicId: "top-fun-quadratica",
    type: "short_answer",
    mode: "N2",
    difficulty: 3,
    prompt: "Qual formato do grafico de uma funcao quadratica?",
    correctAnswer: "parabola",
    acceptedKeywords: ["parabola"],
    explanation: "Funcao de segundo grau gera uma parabola.",
    errorTag: "concept",
  },
  {
    id: "item-geoa-1",
    unitId: "mat-geometria-analitica",
    topicId: "top-geoa-pontos",
    type: "multiple_choice",
    mode: "N2",
    difficulty: 3,
    prompt: "Distancia entre (0,0) e (3,4):",
    options: ["4", "5", "6", "7"],
    correctAnswer: "5",
    explanation: "Pelo teorema de Pitagoras: sqrt(3^2 + 4^2) = 5.",
    errorTag: "calculation",
  },
  {
    id: "item-cin-1",
    unitId: "fis-cinematica",
    topicId: "top-cin-vm",
    type: "true_false",
    mode: "N1",
    difficulty: 1,
    prompt: "Velocidade media = deslocamento / tempo.",
    correctAnswer: "true",
    explanation: "Essa e a definicao de velocidade media.",
    errorTag: "concept",
  },
  {
    id: "item-cin-2",
    unitId: "fis-cinematica",
    topicId: "top-cin-vm",
    type: "multiple_choice",
    mode: "N2",
    difficulty: 2,
    prompt: "Um corpo percorre 120m em 10s. Velocidade media:",
    options: ["10", "12", "14", "120"],
    correctAnswer: "12",
    explanation: "120/10 = 12 m/s.",
    errorTag: "calculation",
  },
  {
    id: "item-cin-3",
    unitId: "fis-cinematica",
    topicId: "top-cin-graficos",
    type: "short_answer",
    mode: "N1",
    difficulty: 2,
    prompt: "No grafico posicao x tempo, a inclinacao da reta representa o que?",
    correctAnswer: "velocidade",
    acceptedKeywords: ["velocidade"],
    explanation: "A inclinacao (coeficiente angular) representa velocidade.",
    errorTag: "concept",
  },
  {
    id: "item-din-1",
    unitId: "fis-dinamica",
    topicId: "top-din-fma",
    type: "multiple_choice",
    mode: "N1",
    difficulty: 2,
    prompt: "Segunda lei de Newton:",
    options: ["F = m.a", "E = m.c2", "P = V.I", "v = s/t"],
    correctAnswer: "F = m.a",
    explanation: "Forca resultante e massa vezes aceleracao.",
    errorTag: "concept",
  },
  {
    id: "item-din-2",
    unitId: "fis-dinamica",
    topicId: "top-din-acao",
    type: "true_false",
    mode: "N1",
    difficulty: 2,
    prompt: "Acao e reacao atuam no mesmo corpo.",
    correctAnswer: "false",
    explanation: "Atuam em corpos diferentes.",
    errorTag: "concept",
  },
  {
    id: "item-ene-1",
    unitId: "fis-energia",
    topicId: "top-ene-conservacao",
    type: "short_answer",
    mode: "N2",
    difficulty: 3,
    prompt: "Quando a energia mecanica total se conserva?",
    correctAnswer: "sem forcas dissipativas",
    acceptedKeywords: ["sem", "dissipativas"],
    explanation: "Sem atrito e outras perdas, energia mecanica se conserva.",
    errorTag: "concept",
  },
  {
    id: "item-ene-2",
    unitId: "fis-energia",
    topicId: "top-ene-trabalho",
    type: "multiple_choice",
    mode: "N2",
    difficulty: 3,
    prompt: "Trabalho de uma forca paralela ao deslocamento:",
    options: ["F / d", "F x d", "d / F", "F + d"],
    correctAnswer: "F x d",
    explanation: "Trabalho e o produto forca vezes deslocamento.",
    errorTag: "calculation",
  },
  {
    id: "item-ato-1",
    unitId: "qui-atomistica",
    topicId: "top-ato-modelos",
    type: "true_false",
    mode: "N1",
    difficulty: 1,
    prompt: "O modelo de Dalton descreve o atomo como indivisivel.",
    correctAnswer: "true",
    explanation: "No modelo de Dalton, o atomo e uma esfera macica indivisivel.",
    errorTag: "concept",
  },
  {
    id: "item-ato-2",
    unitId: "qui-atomistica",
    topicId: "top-ato-tabela",
    type: "multiple_choice",
    mode: "N1",
    difficulty: 2,
    prompt: "Elementos da mesma familia na tabela periodica possuem:",
    options: ["mesmo numero atomico", "propriedades semelhantes", "mesma massa", "mesmo periodo"],
    correctAnswer: "propriedades semelhantes",
    explanation: "Familia agrupa elementos com comportamento quimico semelhante.",
    errorTag: "concept",
  },
  {
    id: "item-est-1",
    unitId: "qui-estequiometria",
    topicId: "top-est-balanceamento",
    type: "short_answer",
    mode: "N1",
    difficulty: 2,
    prompt: "Por que balanceamos equacoes quimicas?",
    correctAnswer: "conservacao da massa",
    acceptedKeywords: ["conservacao", "massa"],
    explanation: "O numero de atomos deve ser conservado em reagentes e produtos.",
    errorTag: "concept",
  },
  {
    id: "item-est-2",
    unitId: "qui-estequiometria",
    topicId: "top-est-mol",
    type: "multiple_choice",
    mode: "N2",
    difficulty: 3,
    prompt: "Se 2 mol de H2 reagem com 1 mol de O2, formam quantos mol de H2O?",
    options: ["1", "2", "3", "4"],
    correctAnswer: "2",
    explanation: "Pela proporcao 2H2 + O2 -> 2H2O.",
    errorTag: "calculation",
  },
  {
    id: "item-sol-1",
    unitId: "qui-solucoes",
    topicId: "top-sol-concentracao",
    type: "true_false",
    mode: "N1",
    difficulty: 2,
    prompt: "Concentracao comum pode ser escrita em g/L.",
    correctAnswer: "true",
    explanation: "Uma forma comum de concentracao e massa por volume.",
    errorTag: "concept",
  },
  {
    id: "item-sol-2",
    unitId: "qui-solucoes",
    topicId: "top-sol-diluicao",
    type: "multiple_choice",
    mode: "N2",
    difficulty: 3,
    prompt: "Em diluicao, a relacao correta e:",
    options: ["M1 + V1 = M2 + V2", "M1V1 = M2V2", "M1/M2 = V1/V2 sempre", "M1 - V1 = M2 - V2"],
    correctAnswer: "M1V1 = M2V2",
    explanation: "A quantidade de soluto se conserva na diluicao.",
    errorTag: "calculation",
  },
];

export const parseGradeYear = (gradeYear?: string | null): number | null => {
  if (!gradeYear) return null;
  const normalized = gradeYear.toLowerCase();
  const digits = normalized.match(/\d+/)?.[0];
  if (!digits) return null;
  const numeric = Number(digits);
  if (Number.isNaN(numeric)) return null;
  if (normalized.includes("em")) {
    return 9 + numeric;
  }
  return numeric;
};

export const getKnowledgeSubject = (subjectKey?: string) =>
  KNOWLEDGE_SUBJECTS.find((subject) => subject.key === subjectKey);

export const getKnowledgeUnit = (unitId?: string) => KNOWLEDGE_UNITS.find((unit) => unit.id === unitId);

export const getKnowledgeTopic = (topicId?: string) => KNOWLEDGE_TOPICS.find((topic) => topic.id === topicId);

export const getUnitsBySubject = (subjectKey: SubjectKey) =>
  KNOWLEDGE_UNITS.filter((unit) => unit.subjectKey === subjectKey);

export const getTopicsByUnit = (unitId: string) => KNOWLEDGE_TOPICS.filter((topic) => topic.unitId === unitId);

export const getUnitsForGrade = (gradeLevel: number | null, subjectKey?: SubjectKey) => {
  const source = subjectKey ? getUnitsBySubject(subjectKey) : KNOWLEDGE_UNITS;
  if (!gradeLevel) return source;

  return source.filter((unit) => {
    const [minGrade, maxGrade] = unit.gradeRange;
    return gradeLevel >= minGrade && gradeLevel <= maxGrade;
  });
};

export const getFutureUnitsForGrade = (gradeLevel: number | null, subjectKey?: SubjectKey) => {
  const source = subjectKey ? getUnitsBySubject(subjectKey) : KNOWLEDGE_UNITS;
  if (!gradeLevel) return [];

  return source.filter((unit) => unit.gradeRange[0] > gradeLevel);
};

export const getPracticeTemplatesByUnitIds = (unitIds: string[]) =>
  PRACTICE_ITEM_BANK.filter((item) => unitIds.includes(item.unitId));

export const getPracticeTemplatesForMode = (unitIds: string[], mode: FocusMode) => {
  const unitItems = getPracticeTemplatesByUnitIds(unitIds);
  if (mode === "MIXED") return unitItems;
  return unitItems.filter((item) => item.mode === mode);
};
