import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getFutureUnitsForGrade,
  getKnowledgeTopic,
  getKnowledgeUnit,
  getPracticeTemplatesByUnitIds,
  getPracticeTemplatesForMode,
  getUnitsForGrade,
  KNOWLEDGE_INSIGHTS,
  KNOWLEDGE_SUBJECTS,
  KNOWLEDGE_TOPICS,
  KNOWLEDGE_UNITS,
  parseGradeYear,
  PRACTICE_ITEM_BANK,
  STANDARD_TRACK_TEMPLATES,
  type KnowledgeTopic,
  type KnowledgeUnit,
  type FocusMode,
  type SubjectKey,
  type PracticeItemTemplate,
  type PracticeItemType,
} from "@/data/knowledgeCatalog";

const STORAGE_KEY = "eleveteste_knowledge_v2";
const QUERY_KEY = "knowledge-v2";

export type SessionMood = "low" | "ok" | "high";
export type SessionTimeBox = 5 | 15 | 30;
export type SessionSource = "track" | "unit" | "errors";
export type PracticeSessionStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "ABANDONED";
export type UnitProgressStatus = "NOT_STARTED" | "STARTED" | "IN_PROGRESS" | "ALMOST_MASTERED" | "MASTERED";

export interface StudentTrack {
  id: string;
  studentId: string;
  subjectKey: SubjectKey;
  title: string;
  focusMode: FocusMode;
  objective: "reforco" | "prova" | "base" | "curiosidade";
  unitIds: string[];
  createdAt: string;
  isCustom: boolean;
}

export interface PracticeSession {
  id: string;
  studentId: string;
  subjectKey: SubjectKey;
  unitIds: string[];
  mode: FocusMode;
  mood: SessionMood;
  timeBox: SessionTimeBox;
  source: SessionSource;
  status: PracticeSessionStatus;
  trackId?: string;
  startedAt?: string;
  endedAt?: string;
  planItemCount: number;
}

export interface PracticeItem {
  id: string;
  sessionId: string;
  type: PracticeItemType;
  prompt: string;
  options?: string[];
  correctAnswer: string;
  acceptedKeywords?: string[];
  explanation: string;
  unitId: string;
  topicId: string;
  difficulty: number;
  errorTag: "concept" | "calculation";
}

export interface PracticeAttempt {
  id: string;
  sessionId: string;
  itemId: string;
  answer: string;
  isCorrect: boolean;
  timeSpentMs: number;
  errorTag?: "concept" | "calculation";
  createdAt: string;
}

export interface MasteryResult {
  id: string;
  studentId: string;
  unitId: string;
  score: number;
  passed: boolean;
  createdAt: string;
}

export interface StudentUnitProgress {
  studentId: string;
  unitId: string;
  masteryPercent: number;
  status: UnitProgressStatus;
  lastPracticedAt?: string;
}

export interface LessonFocus {
  lessonId: string;
  studentId: string;
  unitId?: string;
  topicId?: string;
  note?: string;
  createdAt: string;
}

interface StudentKnowledgeProfile {
  studentId: string;
  levelPoints: number;
  streak: number;
  lastPracticeDate?: string;
}

interface KnowledgeStore {
  tracks: StudentTrack[];
  sessions: PracticeSession[];
  sessionItems: PracticeItem[];
  attempts: PracticeAttempt[];
  masteryResults: MasteryResult[];
  unitProgress: StudentUnitProgress[];
  lessonFocuses: LessonFocus[];
  studentProfiles: Record<string, StudentKnowledgeProfile>;
  customUnits: KnowledgeUnit[];
  customTopics: KnowledgeTopic[];
}

export interface SessionPlanConfig {
  mood: SessionMood;
  timeBox: SessionTimeBox;
  source: SessionSource;
  mode: FocusMode;
  subjectKey?: SubjectKey;
  trackId?: string;
  unitId?: string;
}

export interface SessionPlan {
  subjectKey: SubjectKey;
  unitIds: string[];
  mode: FocusMode;
  itemCount: number;
  items: PracticeItemTemplate[];
  weakTopicId?: string;
}

export interface MasteryQuestion {
  id: string;
  templateId: string;
  type: PracticeItemType;
  prompt: string;
  options?: string[];
  explanation: string;
}

const defaultStore: KnowledgeStore = {
  tracks: [],
  sessions: [],
  sessionItems: [],
  attempts: [],
  masteryResults: [],
  unitProgress: [],
  lessonFocuses: [],
  studentProfiles: {},
  customUnits: [],
  customTopics: [],
};

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const parseStore = (raw: string | null): KnowledgeStore => {
  if (!raw) return defaultStore;
  try {
    const parsed = JSON.parse(raw) as Partial<KnowledgeStore>;
    return {
      tracks: parsed.tracks ?? [],
      sessions: parsed.sessions ?? [],
      sessionItems: parsed.sessionItems ?? [],
      attempts: parsed.attempts ?? [],
      masteryResults: parsed.masteryResults ?? [],
      unitProgress: parsed.unitProgress ?? [],
      lessonFocuses: parsed.lessonFocuses ?? [],
      studentProfiles: parsed.studentProfiles ?? {},
      customUnits: parsed.customUnits ?? [],
      customTopics: parsed.customTopics ?? [],
    };
  } catch {
    return defaultStore;
  }
};

const readStore = (): KnowledgeStore => parseStore(localStorage.getItem(STORAGE_KEY));

const writeStore = (store: KnowledgeStore) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const getYesterdayDate = (today: string) => {
  const date = new Date(`${today}T00:00:00`);
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
};

const getSessionItemCount = (mood: SessionMood, timeBox: SessionTimeBox) => {
  if (mood === "low" && timeBox === 5) return 4;
  if (mood === "high" && timeBox === 30) return 20;

  const base = timeBox === 5 ? 5 : timeBox === 15 ? 10 : 16;
  const moodAdjust = mood === "low" ? -1 : mood === "high" ? 3 : 0;
  return clamp(base + moodAdjust, 3, 25);
};

const evaluateAnswer = (
  item: Pick<PracticeItem, "type" | "correctAnswer" | "acceptedKeywords">,
  answer: string
) => {
  const normalized = normalizeText(answer);
  if (!normalized) return false;

  if (item.type === "true_false") {
    const truthy = ["true", "verdadeiro", "v", "sim"];
    const falsy = ["false", "falso", "f", "nao"];

    const expected = normalizeText(item.correctAnswer);
    const isTrueExpected = truthy.includes(expected);
    if (isTrueExpected) {
      return truthy.includes(normalized);
    }
    return falsy.includes(normalized);
  }

  if (item.type === "short_answer") {
    if (item.acceptedKeywords && item.acceptedKeywords.length > 0) {
      return item.acceptedKeywords.every((keyword) => normalized.includes(normalizeText(keyword)));
    }
    return normalized.includes(normalizeText(item.correctAnswer));
  }

  return normalized === normalizeText(item.correctAnswer);
};

const deriveUnitStatus = (masteryPercent: number, totalAttempts: number): UnitProgressStatus => {
  if (totalAttempts === 0) return "NOT_STARTED";
  if (masteryPercent < 25) return "STARTED";
  if (masteryPercent < 65) return "IN_PROGRESS";
  if (masteryPercent < 85) return "ALMOST_MASTERED";
  return "MASTERED";
};

const getWeakTopicRanking = (
  attempts: PracticeAttempt[],
  sessionItems: PracticeItem[],
  maxSize = 5
): Array<{ topicId: string; count: number }> => {
  const itemMap = new Map(sessionItems.map((item) => [item.id, item]));
  const topicErrorCount = new Map<string, number>();

  for (const attempt of attempts) {
    if (attempt.isCorrect) continue;
    const topicId = itemMap.get(attempt.itemId)?.topicId;
    if (!topicId) continue;
    topicErrorCount.set(topicId, (topicErrorCount.get(topicId) ?? 0) + 1);
  }

  return [...topicErrorCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxSize)
    .map(([topicId, count]) => ({ topicId, count }));
};

const cyclePick = <T,>(source: T[], count: number): T[] => {
  if (source.length === 0) return [];
  const result: T[] = [];
  for (let index = 0; index < count; index += 1) {
    result.push(source[index % source.length]);
  }
  return result;
};

const computeUnitProgress = (
  store: KnowledgeStore,
  studentId: string,
  unitId: string
): StudentUnitProgress => {
  const studentSessionIds = new Set(store.sessions.filter((session) => session.studentId === studentId).map((session) => session.id));
  const unitItemIds = new Set(
    store.sessionItems
      .filter((item) => item.unitId === unitId && studentSessionIds.has(item.sessionId))
      .map((item) => item.id)
  );

  const unitAttempts = store.attempts
    .filter((attempt) => studentSessionIds.has(attempt.sessionId) && unitItemIds.has(attempt.itemId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const totalAttempts = unitAttempts.length;
  const correctAttempts = unitAttempts.filter((attempt) => attempt.isCorrect).length;
  const rawPercent = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

  const latestMastery = store.masteryResults
    .filter((result) => result.studentId === studentId && result.unitId === unitId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

  let masteryPercent = rawPercent;
  if (latestMastery) {
    masteryPercent = Math.round(rawPercent * 0.6 + latestMastery.score * 0.4);
    if (latestMastery.passed) {
      masteryPercent = Math.max(masteryPercent, 90);
    }
  }

  return {
    studentId,
    unitId,
    masteryPercent,
    status: deriveUnitStatus(masteryPercent, totalAttempts),
    lastPracticedAt: unitAttempts[0]?.createdAt,
  };
};

const getProgressStatusLabel = (status: UnitProgressStatus) => {
  if (status === "NOT_STARTED") return "Iniciante";
  if (status === "STARTED") return "Em inicio";
  if (status === "IN_PROGRESS") return "Em progresso";
  if (status === "ALMOST_MASTERED") return "Quase la";
  return "Dominado";
};

const getOrCreateProfile = (
  profiles: Record<string, StudentKnowledgeProfile>,
  studentId: string
): StudentKnowledgeProfile => {
  return (
    profiles[studentId] ?? {
      studentId,
      levelPoints: 0,
      streak: 0,
    }
  );
};

const mergeUnitProgress = (
  current: StudentUnitProgress[],
  entries: StudentUnitProgress[]
): StudentUnitProgress[] => {
  const map = new Map(current.map((entry) => [`${entry.studentId}:${entry.unitId}`, entry]));
  for (const entry of entries) {
    map.set(`${entry.studentId}:${entry.unitId}`, entry);
  }
  return [...map.values()];
};

const resolveKnowledgeUnits = (store: KnowledgeStore) => [...KNOWLEDGE_UNITS, ...store.customUnits];

import { generateId } from "@/lib/utils";

export const useKnowledge = (studentId?: string, gradeYear?: string | null) => {
  const queryClient = useQueryClient();

  const storeQuery = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async () => readStore(),
    staleTime: 0,
  });

  const store = storeQuery.data ?? defaultStore;
  const gradeLevel = parseGradeYear(gradeYear);

  const updateStore = async (updater: (current: KnowledgeStore) => KnowledgeStore) => {
    const current = readStore();
    const next = updater(current);
    writeStore(next);
    await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    return next;
  };

  const units = useMemo(() => resolveKnowledgeUnits(store), [store]);
  const topics = useMemo(() => resolveKnowledgeTopics(store), [store]);

  const allTracks = store.tracks;
  const tracks = useMemo(
    () => (studentId ? allTracks.filter((track) => track.studentId === studentId) : []),
    [allTracks, studentId]
  );

  const allSessions = store.sessions;
  const sessions = useMemo(
    () =>
      studentId
        ? allSessions
          .filter((session) => session.studentId === studentId)
          .sort((a, b) => {
            const left = a.endedAt ?? a.startedAt ?? "";
            const right = b.endedAt ?? b.startedAt ?? "";
            return right.localeCompare(left);
          })
        : [],
    [allSessions, studentId]
  );

  const sessionIdSet = new Set(sessions.map((session) => session.id));

  const sessionItems = useMemo(
    () => store.sessionItems.filter((item) => sessionIdSet.has(item.sessionId)),
    [sessionIdSet, store.sessionItems]
  );

  const attempts = useMemo(
    () => store.attempts.filter((attempt) => sessionIdSet.has(attempt.sessionId)),
    [sessionIdSet, store.attempts]
  );

  const masteryResults = useMemo(
    () =>
      studentId
        ? store.masteryResults
          .filter((result) => result.studentId === studentId)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        : [],
    [store.masteryResults, studentId]
  );

  const lessonFocuses = useMemo(
    () => (studentId ? store.lessonFocuses.filter((focus) => focus.studentId === studentId) : []),
    [store.lessonFocuses, studentId]
  );

  const studentProfile = studentId
    ? getOrCreateProfile(store.studentProfiles, studentId)
    : {
      studentId: "guest",
      levelPoints: 0,
      streak: 0,
    };

  const gradeUnits = useMemo(() => {
    const recommended = getUnitsForGrade(gradeLevel);
    if (recommended.length > 0) return recommended;
    return units;
  }, [gradeLevel, units]);

  const futureUnits = useMemo(() => getFutureUnitsForGrade(gradeLevel), [gradeLevel]);

  const unitProgress = useMemo(() => {
    if (!studentId) return [];
    return units
      .map((unit) => {
        const stored = store.unitProgress.find((entry) => entry.studentId === studentId && entry.unitId === unit.id);
        return stored ?? computeUnitProgress(store, studentId, unit.id);
      })
      .sort((a, b) => a.unitId.localeCompare(b.unitId));
  }, [store, studentId, units]);

  const unitProgressMap = useMemo(
    () => new Map(unitProgress.map((entry) => [entry.unitId, entry])),
    [unitProgress]
  );

  const weakTopics = useMemo(() => getWeakTopicRanking(attempts, sessionItems), [attempts, sessionItems]);

  const weakTopicSuggestions = useMemo(() => {
    return weakTopics.map((entry) => {
      const topic = getKnowledgeTopic(entry.topicId);
      const unit = topic ? getKnowledgeUnit(topic.unitId) : undefined;
      return {
        ...entry,
        topicTitle: topic?.title ?? "Topico",
        unitId: topic?.unitId,
        unitTitle: unit?.title ?? "Unidade",
      };
    });
  }, [weakTopics]);

  const subjectCards = useMemo(() => {
    return KNOWLEDGE_SUBJECTS.map((subject) => {
      const subjectUnits = units.filter((unit) => unit.subjectKey === subject.key);
      const subjectProgress = subjectUnits
        .map((unit) => unitProgressMap.get(unit.id))
        .filter(Boolean) as StudentUnitProgress[];

      const masteryPercent =
        subjectProgress.length > 0
          ? Math.round(
            subjectProgress.reduce((sum, entry) => sum + entry.masteryPercent, 0) / subjectProgress.length
          )
          : 0;

      const inProgressCount = subjectProgress.filter(
        (entry) => entry.status === "STARTED" || entry.status === "IN_PROGRESS" || entry.status === "ALMOST_MASTERED"
      ).length;

      const nextUnit = subjectUnits.find((unit) => {
        const progress = unitProgressMap.get(unit.id);
        if (!progress || progress.status === "NOT_STARTED") return true;
        return progress.status !== "MASTERED";
      });

      return {
        ...subject,
        masteryPercent,
        inProgressCount,
        nextStep: nextUnit?.title ?? "Continuar revisao",
      };
    });
  }, [unitProgressMap, units]);

  const recommendedTracks = useMemo(() => {
    const existingTitles = new Set(tracks.map((track) => track.title.toLowerCase()));
    return STANDARD_TRACK_TEMPLATES.filter((template) => {
      const hasGradeFit = template.unitIds.some((unitId) => gradeUnits.some((unit) => unit.id === unitId));
      if (!hasGradeFit && gradeLevel) return false;
      return !existingTitles.has(template.title.toLowerCase());
    });
  }, [tracks, gradeUnits, gradeLevel]);

  const activeSubjects = useMemo(() => {
    const set = new Set<SubjectKey>();
    tracks.forEach((track) => set.add(track.subjectKey));
    sessions.forEach((session) => set.add(session.subjectKey));
    return set;
  }, [tracks, sessions]);

  const insights = useMemo(() => {
    const currentUnitIds = new Set(tracks.flatMap((track) => track.unitIds));

    const ranked = [...KNOWLEDGE_INSIGHTS]
      .map((insight) => {
        const subjectScore = insight.subjectKeys.filter((subject) => activeSubjects.has(subject)).length;
        const unitScore = insight.unitIds.filter((unitId) => currentUnitIds.has(unitId)).length;
        return { insight, score: subjectScore * 2 + unitScore };
      })
      .sort((a, b) => b.score - a.score);

    return ranked.slice(0, 6).map((entry) => entry.insight);
  }, [activeSubjects, tracks]);

  const buildSessionPlan = (input: SessionPlanConfig): SessionPlan | null => {
    if (!studentId) return null;

    const allUnits = resolveKnowledgeUnits(readStore());

    const track = input.trackId ? tracks.find((entry) => entry.id === input.trackId) : undefined;
    const unit = input.unitId ? allUnits.find((entry) => entry.id === input.unitId) : undefined;

    const subjectKey =
      input.subjectKey ?? track?.subjectKey ?? unit?.subjectKey ?? gradeUnits[0]?.subjectKey ?? "matematica";

    let selectedUnitIds: string[] = [];

    if (input.source === "track" && track) {
      selectedUnitIds = track.unitIds;
    } else if (input.source === "unit" && input.unitId) {
      selectedUnitIds = [input.unitId];
    } else if (input.source === "errors") {
      const weakUnitIds = weakTopicSuggestions
        .map((entry) => entry.unitId)
        .filter((unitId): unitId is string => Boolean(unitId));
      selectedUnitIds = weakUnitIds;
    }

    if (selectedUnitIds.length === 0) {
      selectedUnitIds = gradeUnits
        .filter((entry) => entry.subjectKey === subjectKey)
        .map((entry) => entry.id)
        .slice(0, 3);
    }

    if (selectedUnitIds.length === 0) {
      selectedUnitIds = allUnits
        .filter((entry) => entry.subjectKey === subjectKey)
        .map((entry) => entry.id)
        .slice(0, 3);
    }

    const dedupedUnitIds = [...new Set(selectedUnitIds)];

    const weakTopicId = weakTopicSuggestions[0]?.topicId;
    const totalItems = getSessionItemCount(input.mood, input.timeBox);

    let sourceItems = getPracticeTemplatesForMode(dedupedUnitIds, input.mode);
    if (sourceItems.length === 0 && input.mode !== "MIXED") {
      sourceItems = getPracticeTemplatesByUnitIds(dedupedUnitIds);
    }
    if (sourceItems.length === 0) {
      sourceItems = PRACTICE_ITEM_BANK;
    }

    if (weakTopicId) {
      const weakItems = sourceItems.filter((item) => item.topicId === weakTopicId);
      const nonWeakItems = sourceItems.filter((item) => item.topicId !== weakTopicId);
      sourceItems = [...weakItems, ...nonWeakItems];
    }

    return {
      subjectKey,
      unitIds: dedupedUnitIds,
      mode: input.mode,
      itemCount: totalItems,
      items: cyclePick(sourceItems, totalItems),
      weakTopicId,
    };
  };

  const createTrack = async (input: {
    subjectKey: SubjectKey;
    unitIds: string[];
    focusMode: FocusMode;
    objective: StudentTrack["objective"];
    title?: string;
    customUnitTitle?: string;
  }) => {
    if (!studentId) {
      throw new Error("Student not authenticated");
    }

    const now = new Date().toISOString();
    const current = readStore();

    let customUnitIds: string[] = [];
    let customUnits = current.customUnits;
    let customTopics = current.customTopics;

    if (input.customUnitTitle && input.customUnitTitle.trim().length > 0) {
      const unitId = `custom-${generateId()}`;
      const topicId = `custom-topic-${generateId()}`;

      const newUnit: KnowledgeUnit = {
        id: unitId,
        subjectKey: input.subjectKey,
        title: input.customUnitTitle.trim(),
        description: "Unidade personalizada pelo aluno.",
        gradeRange: [1, 12],
        prerequisites: [],
      };

      const newTopic: KnowledgeTopic = {
        id: topicId,
        unitId,
        title: input.customUnitTitle.trim(),
        description: "Topico personalizado.",
      };

      customUnitIds = [unitId];
      customUnits = [newUnit, ...current.customUnits];
      customTopics = [newTopic, ...current.customTopics];
    }

    const finalUnitIds = [...new Set([...input.unitIds, ...customUnitIds])];
    const fallbackTitle = finalUnitIds[0] ? getKnowledgeUnit(finalUnitIds[0])?.title : undefined;

    const track: StudentTrack = {
      id: generateId(),
      studentId,
      subjectKey: input.subjectKey,
      title: input.title?.trim() || fallbackTitle || "Nova trilha",
      focusMode: input.focusMode,
      objective: input.objective,
      unitIds: finalUnitIds,
      createdAt: now,
      isCustom: true,
    };

    writeStore({
      ...current,
      tracks: [track, ...current.tracks],
      customUnits,
      customTopics,
    });

    await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    return track;
  };

  const createPracticeSession = async (config: SessionPlanConfig) => {
    if (!studentId) {
      throw new Error("Student not authenticated");
    }

    const now = new Date().toISOString();
    const plan = buildSessionPlan(config);
    if (!plan) {
      throw new Error("Nao foi possivel criar plano de sessao");
    }

    const sessionId = generateId();
    const session: PracticeSession = {
      id: sessionId,
      studentId,
      subjectKey: plan.subjectKey,
      unitIds: plan.unitIds,
      mode: plan.mode,
      mood: config.mood,
      timeBox: config.timeBox,
      source: config.source,
      status: "PLANNED",
      trackId: config.trackId,
      planItemCount: plan.itemCount,
      startedAt: now,
    };

    const items: PracticeItem[] = plan.items.map((item) => ({
      id: generateId(),
      sessionId,
      type: item.type,
      prompt: item.prompt,
      options: item.options,
      correctAnswer: item.correctAnswer,
      acceptedKeywords: item.acceptedKeywords,
      explanation: item.explanation,
      unitId: item.unitId,
      topicId: item.topicId,
      difficulty: item.difficulty,
      errorTag: item.errorTag,
    }));

    await updateStore((current) => ({
      ...current,
      sessions: [session, ...current.sessions],
      sessionItems: [...items, ...current.sessionItems],
    }));

    return session;
  };

  const startPracticeSession = async (sessionId: string) => {
    if (!studentId) return;

    await updateStore((current) => ({
      ...current,
      sessions: current.sessions.map((session) => {
        if (session.id !== sessionId) return session;
        if (session.status === "COMPLETED") return session;
        return {
          ...session,
          status: "IN_PROGRESS",
          startedAt: session.startedAt ?? new Date().toISOString(),
        };
      }),
    }));
  };

  const savePracticeAttempt = async (input: {
    sessionId: string;
    itemId: string;
    answer: string;
    timeSpentMs: number;
  }) => {
    if (!studentId) {
      throw new Error("Student not authenticated");
    }

    const current = readStore();
    const item = current.sessionItems.find((entry) => entry.id === input.itemId && entry.sessionId === input.sessionId);
    if (!item) {
      throw new Error("Item de pratica nao encontrado");
    }

    const isCorrect = evaluateAnswer(item, input.answer);
    const attempt: PracticeAttempt = {
      id: generateId(),
      sessionId: input.sessionId,
      itemId: input.itemId,
      answer: input.answer,
      isCorrect,
      timeSpentMs: input.timeSpentMs,
      errorTag: isCorrect ? undefined : item.errorTag,
      createdAt: new Date().toISOString(),
    };

    await updateStore((storeState) => {
      const withoutOldAttempt = storeState.attempts.filter(
        (entry) => !(entry.sessionId === input.sessionId && entry.itemId === input.itemId)
      );

      return {
        ...storeState,
        attempts: [attempt, ...withoutOldAttempt],
      };
    });

    return {
      attempt,
      explanation: item.explanation,
      isCorrect,
      expectedAnswer: item.correctAnswer,
    };
  };

  const completePracticeSession = async (sessionId: string) => {
    if (!studentId) {
      throw new Error("Student not authenticated");
    }

    const nowIso = new Date().toISOString();
    const today = nowIso.slice(0, 10);

    let summary: {
      scorePercent: number;
      correctCount: number;
      wrongCount: number;
      gainedLevelPoints: number;
      unitIds: string[];
      suggestions: Array<{ unitId: string; topicId: string; count: number }>;
    } | null = null;

    await updateStore((current) => {
      const session = current.sessions.find((entry) => entry.id === sessionId && entry.studentId === studentId);
      if (!session) return current;

      const items = current.sessionItems.filter((entry) => entry.sessionId === sessionId);
      const attemptsByItem = new Map(
        current.attempts
          .filter((attempt) => attempt.sessionId === sessionId)
          .map((attempt) => [attempt.itemId, attempt])
      );

      const answered = items.map((item) => attemptsByItem.get(item.id)).filter(Boolean) as PracticeAttempt[];
      const correctCount = answered.filter((attempt) => attempt.isCorrect).length;
      const totalCount = items.length || 1;
      const wrongCount = totalCount - correctCount;
      const scorePercent = Math.round((correctCount / totalCount) * 100);

      const profile = getOrCreateProfile(current.studentProfiles, studentId);
      const yesterday = getYesterdayDate(today);

      let nextStreak = profile.streak;
      if (profile.lastPracticeDate === today) {
        nextStreak = profile.streak;
      } else if (profile.lastPracticeDate === yesterday) {
        nextStreak = profile.streak + 1;
      } else {
        nextStreak = 1;
      }

      const streakBonus = Math.min(30, nextStreak * 2);
      const gainedLevelPoints = correctCount * 8 + 20 + streakBonus;

      const nextProfiles: Record<string, StudentKnowledgeProfile> = {
        ...current.studentProfiles,
        [studentId]: {
          ...profile,
          streak: nextStreak,
          levelPoints: profile.levelPoints + gainedLevelPoints,
          lastPracticeDate: today,
        },
      };

      const completedSession: PracticeSession = {
        ...session,
        status: "COMPLETED",
        endedAt: nowIso,
        startedAt: session.startedAt ?? nowIso,
      };

      const nextSessions = current.sessions.map((entry) => (entry.id === sessionId ? completedSession : entry));

      const perTopicErrors = new Map<string, number>();
      for (const attempt of answered) {
        if (attempt.isCorrect) continue;
        const item = items.find((entry) => entry.id === attempt.itemId);
        if (!item) continue;
        const key = `${item.unitId}:${item.topicId}`;
        perTopicErrors.set(key, (perTopicErrors.get(key) ?? 0) + 1);
      }

      const touchedUnitIds = [...new Set(items.map((item) => item.unitId))];
      const provisionalStore: KnowledgeStore = {
        ...current,
        sessions: nextSessions,
        studentProfiles: nextProfiles,
      };

      const freshProgressEntries = touchedUnitIds.map((unitId) => computeUnitProgress(provisionalStore, studentId, unitId));

      summary = {
        scorePercent,
        correctCount,
        wrongCount,
        gainedLevelPoints,
        unitIds: touchedUnitIds,
        suggestions: [...perTopicErrors.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([key, count]) => {
            const [unitId, topicId] = key.split(":");
            return { unitId, topicId, count };
          }),
      };

      return {
        ...provisionalStore,
        unitProgress: mergeUnitProgress(current.unitProgress, freshProgressEntries),
      };
    });

    if (!summary) {
      throw new Error("Sessao nao encontrada para finalizar");
    }

    return summary;
  };

  const abandonPracticeSession = async (sessionId: string) => {
    if (!studentId) return;

    await updateStore((current) => ({
      ...current,
      sessions: current.sessions.map((session) =>
        session.id === sessionId && session.status !== "COMPLETED"
          ? { ...session, status: "ABANDONED", endedAt: new Date().toISOString() }
          : session
      ),
    }));
  };

  const getSession = (sessionId?: string) => sessions.find((session) => session.id === sessionId);

  const getSessionItems = (sessionId?: string) =>
    sessionItems.filter((item) => item.sessionId === sessionId);

  const getSessionAttempts = (sessionId?: string) =>
    attempts
      .filter((attempt) => attempt.sessionId === sessionId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const generateMasteryQuestions = (unitId: string, count = 20): MasteryQuestion[] => {
    const unitItems = getPracticeTemplatesByUnitIds([unitId]);
    const source = unitItems.length > 0 ? unitItems : PRACTICE_ITEM_BANK;
    const picked = cyclePick(source, count);

    return picked.map((template, index) => ({
      id: `${template.id}-${index + 1}`,
      templateId: template.id,
      type: template.type,
      prompt: template.prompt,
      options: template.options,
      explanation: template.explanation,
    }));
  };

  const submitMasteryResult = async (
    unitId: string,
    questions: MasteryQuestion[],
    answers: Record<string, string>
  ) => {
    if (!studentId) {
      throw new Error("Student not authenticated");
    }

    const templateMap = new Map(PRACTICE_ITEM_BANK.map((item) => [item.id, item]));

    let correct = 0;
    const weakTopics = new Map<string, number>();

    for (const question of questions) {
      const template = templateMap.get(question.templateId);
      if (!template) continue;

      const isCorrect = evaluateAnswer(template, answers[question.id] ?? "");
      if (isCorrect) {
        correct += 1;
      } else {
        weakTopics.set(template.topicId, (weakTopics.get(template.topicId) ?? 0) + 1);
      }
    }

    const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    const passed = score >= 80;

    const result: MasteryResult = {
      id: generateId(),
      studentId,
      unitId,
      score,
      passed,
      createdAt: new Date().toISOString(),
    };

    await updateStore((current) => {
      const computed = computeUnitProgress(
        {
          ...current,
          masteryResults: [result, ...current.masteryResults],
        },
        studentId,
        unitId
      );

      const adjusted: StudentUnitProgress = {
        ...computed,
        masteryPercent: passed
          ? Math.max(computed.masteryPercent, 90)
          : Math.round(computed.masteryPercent * 0.6 + score * 0.4),
      };

      adjusted.status = passed ? "MASTERED" : deriveUnitStatus(adjusted.masteryPercent, 1);

      return {
        ...current,
        masteryResults: [result, ...current.masteryResults],
        unitProgress: mergeUnitProgress(current.unitProgress, [adjusted]),
      };
    });

    return {
      result,
      weakTopics: [...weakTopics.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([topicId, count]) => ({
          topicId,
          count,
          topicTitle: getKnowledgeTopic(topicId)?.title ?? "Topico",
        })),
    };
  };

  const saveLessonFocus = async (input: {
    lessonId: string;
    unitId?: string;
    topicId?: string;
    note?: string;
  }) => {
    if (!studentId) {
      throw new Error("Student not authenticated");
    }

    const lessonFocus: LessonFocus = {
      lessonId: input.lessonId,
      studentId,
      unitId: input.unitId,
      topicId: input.topicId,
      note: input.note,
      createdAt: new Date().toISOString(),
    };

    await updateStore((current) => {
      const withoutCurrent = current.lessonFocuses.filter(
        (focus) => !(focus.studentId === studentId && focus.lessonId === input.lessonId)
      );

      return {
        ...current,
        lessonFocuses: [lessonFocus, ...withoutCurrent],
      };
    });

    return lessonFocus;
  };

  const getLessonFocusByLessonId = (lessonId?: string) =>
    lessonFocuses.find((focus) => focus.lessonId === lessonId);

  const getUnitTopics = (unitId: string) => topics.filter((topic) => topic.unitId === unitId);

  const getUnitProgressLabel = (unitId: string) =>
    getProgressStatusLabel(unitProgressMap.get(unitId)?.status ?? "NOT_STARTED");

  return {
    isLoading: storeQuery.isLoading,
    gradeLevel,
    subjects: KNOWLEDGE_SUBJECTS,
    units,
    topics,
    tracks,
    sessions,
    sessionItems,
    attempts,
    masteryResults,
    lessonFocuses,
    unitProgress,
    subjectCards,
    recommendedTracks,
    weakTopicSuggestions,
    insights,
    futureUnits,
    gradeUnits,
    studentProfile,
    getUnitProgress: (unitId: string) => unitProgressMap.get(unitId),
    getUnitProgressLabel,
    getUnitTopics,
    getSession,
    getSessionItems,
    getSessionAttempts,
    buildSessionPlan,
    createTrack,
    createPracticeSession,
    startPracticeSession,
    savePracticeAttempt,
    completePracticeSession,
    abandonPracticeSession,
    generateMasteryQuestions,
    submitMasteryResult,
    saveLessonFocus,
    getLessonFocusByLessonId,
  };
};
