export type DifficultyLevel = "easy" | "medium" | "hard";
export type TrainingType = "multiple_choice" | "open_answer" | "mixed";
export type MoodType = "confident" | "ok" | "tired";

export interface TrainingQuestion {
  id: string;
  prompt: string;
  type: "multiple_choice" | "open_answer";
  options?: string[];
  correctAnswer: string;
  acceptedKeywords?: string[];
  explanation: string;
}

export interface TrainingTopic {
  id: string;
  name: string;
  shortDescription: string;
  questions: TrainingQuestion[];
}

export interface TrainingSubject {
  id: string;
  name: string;
  icon: string;
  colorClass: string;
  topics: TrainingTopic[];
}

export const TRAINING_SUBJECTS: TrainingSubject[] = [
  {
    id: "matematica",
    name: "Matematica",
    icon: "📐",
    colorClass: "from-blue-500/20 to-cyan-500/20 border-blue-200",
    topics: [
      {
        id: "trigonometria",
        name: "Trigonometria",
        shortDescription: "Seno, cosseno e relacoes no triangulo retangulo.",
        questions: [
          {
            id: "tri-1",
            type: "multiple_choice",
            prompt: "Em um triangulo retangulo, sen(30 graus) vale:",
            options: ["1/2", "sqrt(3)/2", "1", "2"],
            correctAnswer: "1/2",
            explanation: "Para 30 graus, seno e 1/2.",
          },
          {
            id: "tri-2",
            type: "multiple_choice",
            prompt: "Se cos(x) = 0,8 e a hipotenusa e 10, o cateto adjacente e:",
            options: ["6", "8", "10", "12"],
            correctAnswer: "8",
            explanation: "cos(x) = adjacente/hipotenusa, entao adjacente = 0,8 x 10 = 8.",
          },
          {
            id: "tri-3",
            type: "open_answer",
            prompt: "Explique quando usar seno, cosseno e tangente em triangulo retangulo.",
            correctAnswer: "seno oposto hipotenusa cosseno adjacente hipotenusa tangente oposto adjacente",
            acceptedKeywords: ["seno", "oposto", "hipotenusa", "cosseno", "adjacente", "tangente"],
            explanation: "A escolha depende dos lados que voce conhece e quer encontrar.",
          },
          {
            id: "tri-4",
            type: "multiple_choice",
            prompt: "A tangente de um angulo e:",
            options: ["cateto oposto / hipotenusa", "cateto adjacente / hipotenusa", "cateto oposto / cateto adjacente", "hipotenusa / cateto oposto"],
            correctAnswer: "cateto oposto / cateto adjacente",
            explanation: "Tangente relaciona os dois catetos.",
          },
        ],
      },
      {
        id: "geometria-plana",
        name: "Geometria Plana",
        shortDescription: "Areas, perimetros e propriedades basicas.",
        questions: [
          {
            id: "geo-1",
            type: "multiple_choice",
            prompt: "Area de um retangulo de base 8 e altura 5:",
            options: ["13", "40", "26", "80"],
            correctAnswer: "40",
            explanation: "Area = base x altura.",
          },
          {
            id: "geo-2",
            type: "open_answer",
            prompt: "Descreva a diferenca entre area e perimetro.",
            correctAnswer: "area superficie interna perimetro contorno lados",
            acceptedKeywords: ["area", "superficie", "perimetro", "contorno"],
            explanation: "Area mede regiao interna; perimetro mede o contorno.",
          },
        ],
      },
    ],
  },
  {
    id: "fisica",
    name: "Fisica",
    icon: "⚡",
    colorClass: "from-violet-500/20 to-indigo-500/20 border-violet-200",
    topics: [
      {
        id: "cinematica",
        name: "Cinematica",
        shortDescription: "Movimento uniforme e variado.",
        questions: [
          {
            id: "cin-1",
            type: "multiple_choice",
            prompt: "No MRU, a velocidade e:",
            options: ["variavel", "constante", "zero", "negativa sempre"],
            correctAnswer: "constante",
            explanation: "No movimento retilineo uniforme a velocidade nao muda.",
          },
          {
            id: "cin-2",
            type: "open_answer",
            prompt: "Qual e a formula da velocidade media?",
            correctAnswer: "velocidade media deslocamento tempo",
            acceptedKeywords: ["deslocamento", "tempo", "velocidade"],
            explanation: "v media = deslocamento / intervalo de tempo.",
          },
        ],
      },
      {
        id: "leis-de-newton",
        name: "Leis de Newton",
        shortDescription: "Inercia, dinamica e acao-reacao.",
        questions: [
          {
            id: "new-1",
            type: "multiple_choice",
            prompt: "A segunda lei de Newton pode ser escrita como:",
            options: ["F = m.a", "E = m.c2", "P = V.I", "v = s/t"],
            correctAnswer: "F = m.a",
            explanation: "Forca resultante e massa vezes aceleracao.",
          },
          {
            id: "new-2",
            type: "open_answer",
            prompt: "Explique a terceira lei de Newton com um exemplo curto.",
            correctAnswer: "acao reacao forcas opostas mesma intensidade",
            acceptedKeywords: ["acao", "reacao", "opostas", "mesma intensidade"],
            explanation: "Sempre que ha uma acao, ha uma reacao de mesma intensidade e sentido oposto.",
          },
        ],
      },
    ],
  },
];

export const getSubjectById = (subjectId?: string) =>
  TRAINING_SUBJECTS.find((subject) => subject.id === subjectId);

export const getTopicById = (subjectId?: string, topicId?: string) => {
  const subject = getSubjectById(subjectId);
  return subject?.topics.find((topic) => topic.id === topicId);
};

