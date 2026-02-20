import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { DifficultyLevel, MoodType, TrainingType } from "@/data/trainingCatalog";
import { generateId } from "@/lib/utils";

const STORAGE_KEY = "eleveteste_training_sessions_v1";
const QUERY_KEY = "training-sessions";

export interface TrainingWrongAnswer {
  questionId: string;
  prompt: string;
  expectedAnswer: string;
  studentAnswer: string;
  explanation: string;
}

export interface TrainingSession {
  id: string;
  studentId: string;
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicName: string;
  difficulty: DifficultyLevel;
  durationMinutes: number;
  trainingType: TrainingType;
  mood: MoodType;
  startedAt: string;
  finishedAt: string;
  totalTasks: number;
  correctCount: number;
  scorePercent: number;
  wrongAnswers: TrainingWrongAnswer[];
}

type NewTrainingSession = Omit<TrainingSession, "id" | "finishedAt"> & { finishedAt?: string };

const parseSessions = (raw: string | null): TrainingSession[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as TrainingSession[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
};

const readSessions = (): TrainingSession[] => parseSessions(localStorage.getItem(STORAGE_KEY));

const writeSessions = (sessions: TrainingSession[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
};

export const useTrainingSessions = (studentId?: string) => {
  const queryClient = useQueryClient();

  const sessionsQuery = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async () => readSessions(),
    staleTime: 0,
  });

  const allSessions = sessionsQuery.data ?? [];
  const sessions = useMemo(
    () => (studentId ? allSessions.filter((entry) => entry.studentId === studentId) : allSessions),
    [allSessions, studentId]
  );

  const saveSession = async (payload: NewTrainingSession) => {
    const current = readSessions();
    const completedAt = payload.finishedAt ?? new Date().toISOString();
    const entry: TrainingSession = {
      ...payload,
      id: generateId(),
      finishedAt: completedAt,
    };
    writeSessions([entry, ...current]);
    await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    return entry;
  };

  const stats = useMemo(() => {
    const totalSessions = sessions.length;
    const totalTasks = sessions.reduce((sum, item) => sum + item.totalTasks, 0);
    const totalCorrect = sessions.reduce((sum, item) => sum + item.correctCount, 0);
    const averageScore = totalTasks > 0 ? Math.round((totalCorrect / totalTasks) * 100) : 0;

    const difficultyMap: Record<string, number> = {};
    const topicMap: Record<string, { attempts: number; errors: number }> = {};

    sessions.forEach((item) => {
      difficultyMap[item.difficulty] = (difficultyMap[item.difficulty] ?? 0) + 1;
      const key = `${item.subjectName} - ${item.topicName}`;
      const previous = topicMap[key] ?? { attempts: 0, errors: 0 };
      topicMap[key] = {
        attempts: previous.attempts + 1,
        errors: previous.errors + item.wrongAnswers.length,
      };
    });

    const mostPracticedTopic =
      Object.entries(topicMap).sort((a, b) => b[1].attempts - a[1].attempts)[0]?.[0] ?? null;
    const highestDifficulty =
      Object.entries(difficultyMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    const hardestTopic =
      Object.entries(topicMap).sort((a, b) => b[1].errors - a[1].errors)[0]?.[0] ?? null;

    return {
      totalSessions,
      totalTasks,
      totalCorrect,
      averageScore,
      mostPracticedTopic,
      highestDifficulty,
      hardestTopic,
    };
  }, [sessions]);

  return {
    sessions,
    allSessions,
    stats,
    isLoading: sessionsQuery.isLoading,
    saveSession,
  };
};

