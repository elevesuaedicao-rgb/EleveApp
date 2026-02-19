import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  addDays,
  addWeeks,
  format,
  isSameDay,
  parseISO,
  startOfWeek,
  subWeeks,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useGuardianPortal } from '@/hooks/useGuardianPortal';
import { cn } from '@/lib/utils';
import { useGuardian } from './GuardianLayout';
import eleveLogo from '@/assets/brand/eleve-logo.svg';
import '@/styles/guardian-eleve-calendar.css';

type ModalityFilter = 'all' | 'online' | 'presencial';

const MODALITY_LABELS = {
  online: 'Online',
  presencial: 'Presencial',
  ambos: 'Online + presencial',
} as const;

const STATUS_LABELS = {
  LIVRE: 'Livre',
  OCUPADO: 'Ocupado',
  INDISPONIVEL: 'Indisponivel',
} as const;

const STATUS_DESCRIPTION = {
  LIVRE: 'Horario aberto para novo agendamento.',
  OCUPADO: 'Horario ocupado; voce pode entrar na fila.',
  INDISPONIVEL: 'Professor indisponivel neste horario.',
} as const;

export const GuardianCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const { setSelectedStudentId } = useGuardian();
  const [searchParams, setSearchParams] = useSearchParams();
  const dateParam = searchParams.get('date');

  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDate, setSelectedDate] = useState(dateParam || format(new Date(), 'yyyy-MM-dd'));
  const [modalityFilter, setModalityFilter] = useState<ModalityFilter>('all');
  const [onlyFree, setOnlyFree] = useState(false);

  useEffect(() => {
    if (studentId) setSelectedStudentId(studentId);
  }, [setSelectedStudentId, studentId]);

  const { slotsByDate, hasStudents, teacher, students, activeStudentId } = useGuardianPortal(studentId);
  const studentPathId = studentId || activeStudentId || '';

  const activeStudentName = useMemo(() => {
    const byId = students.find((student) => student.id === studentPathId);
    return byId?.name || 'Aluno';
  }, [studentPathId, students]);

  const selectedDateObj = parseISO(selectedDate);
  const selectedDateIsValid = !Number.isNaN(selectedDateObj.getTime());

  useEffect(() => {
    if (!selectedDate || searchParams.get('date') === selectedDate) return;
    const next = new URLSearchParams(searchParams);
    next.set('date', selectedDate);
    setSearchParams(next, { replace: true });
  }, [searchParams, selectedDate, setSearchParams]);

  useEffect(() => {
    if (dateParam && dateParam !== selectedDate) setSelectedDate(dateParam);
  }, [dateParam, selectedDate]);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart]
  );

  const dayCards = useMemo(() => {
    return weekDays.map((day) => {
      const key = format(day, 'yyyy-MM-dd');
      const slots = slotsByDate.get(key) || [];
      const filteredByMode = slots.filter((slot) => modalityFilter === 'all' || slot.modality === 'ambos' || slot.modality === modalityFilter);
      const freeCount = filteredByMode.filter((slot) => slot.status === 'LIVRE').length;
      const morning = filteredByMode.some((slot) => slot.startTime < '12:00' && slot.status === 'LIVRE');
      const afternoon = filteredByMode.some((slot) => slot.startTime >= '12:00' && slot.startTime < '18:00' && slot.status === 'LIVRE');
      const night = filteredByMode.some((slot) => slot.startTime >= '18:00' && slot.status === 'LIVRE');

      return {
        day,
        key,
        freeCount,
        indicators: [morning, afternoon, night],
      };
    });
  }, [modalityFilter, slotsByDate, weekDays]);

  const selectedSlots = useMemo(() => {
    const slots = slotsByDate.get(selectedDate) || [];
    return slots.filter((slot) => {
      if (modalityFilter !== 'all' && slot.modality !== 'ambos' && slot.modality !== modalityFilter) return false;
      if (onlyFree && slot.status !== 'LIVRE') return false;
      return true;
    });
  }, [modalityFilter, onlyFree, selectedDate, slotsByDate]);

  const dateLabel = selectedDateIsValid
    ? format(selectedDateObj, "dd/MM '(',EEE,')'", { locale: ptBR })
    : selectedDate;

  const moveToMonth = (value: string) => {
    if (!value) return;
    const [year, month] = value.split('-').map(Number);
    const first = new Date(year, month - 1, 1);
    setWeekStart(startOfWeek(first, { weekStartsOn: 1 }));
    setSelectedDate(format(first, 'yyyy-MM-dd'));
  };

  return (
    <TooltipProvider>
      <div className="guardian-eleve-calendar space-y-5 font-body">
        <section className="guardian-eleve-hero rounded-[2rem] px-5 py-6 sm:px-6 sm:py-7 text-white">
          <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                <img src={eleveLogo} alt="Eleve" className="guardian-eleve-logo w-9 h-9 object-contain" />
              </div>
              <div>
                <p className="font-body text-[11px] uppercase tracking-[0.18em] text-white/70">Portal responsavel</p>
                <h1 className="font-display text-3xl sm:text-4xl leading-none mt-1">Agenda</h1>
              </div>
            </div>

            <label className="min-w-[148px]">
              <span className="text-[11px] uppercase tracking-[0.16em] text-white/70">Mes</span>
              <input
                type="month"
                value={selectedDate.slice(0, 7)}
                onChange={(event) => moveToMonth(event.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-white/20 bg-black/20 px-3 text-sm font-medium text-white shadow-inner outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              />
            </label>
          </div>

          <div className="relative z-10 mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 px-3 py-2.5 border border-white/15">
              <p className="text-[10px] uppercase tracking-[0.15em] text-white/70">Aluno</p>
              <p className="font-body mt-1 text-sm font-semibold text-white">{activeStudentName}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-3 py-2.5 border border-white/15">
              <p className="text-[10px] uppercase tracking-[0.15em] text-white/70">Professor</p>
              <p className="font-body mt-1 text-sm font-semibold text-white">{teacher?.full_name || 'Nao informado'}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-3 py-2.5 border border-white/15">
              <p className="text-[10px] uppercase tracking-[0.15em] text-white/70">Semana</p>
              <p className="font-body mt-1 text-sm font-semibold text-white">
                {format(weekStart, "dd 'de' MMM", { locale: ptBR })}
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-5 flex items-center gap-2 flex-wrap">
            <Button
              className="guardian-eleve-cta bg-white text-[#111f45] hover:bg-white/90"
              onClick={() => navigate(`/app/guardian/students/${studentPathId}/booking/new?date=${selectedDate}`)}
              disabled={!hasStudents || !studentPathId}
            >
              Agendar aula
            </Button>
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                setWeekStart(startOfWeek(today, { weekStartsOn: 1 }));
                setSelectedDate(format(today, 'yyyy-MM-dd'));
              }}
              className="guardian-eleve-cta px-4 text-sm font-semibold rounded-xl border border-white/25 bg-white/10 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              Ir para hoje
            </button>
          </div>
        </section>

        <div className="rounded-[1.4rem] border border-slate-200 bg-[var(--eleve-surface)] p-2.5">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
            <button
              type="button"
              onClick={() => setWeekStart(subWeeks(weekStart, 1))}
              className="h-11 min-w-11 rounded-xl bg-white border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--eleve-primary)]"
              aria-label="Semana anterior"
            >
              {'<'}
            </button>
            <p className="font-body text-center text-sm font-semibold text-slate-800">
              {format(weekStart, "dd 'de' MMM", { locale: ptBR })} - {format(addDays(weekStart, 6), "dd 'de' MMM", { locale: ptBR })}
            </p>
            <button
              type="button"
              onClick={() => setWeekStart(addWeeks(weekStart, 1))}
              className="h-11 min-w-11 rounded-xl bg-white border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--eleve-primary)]"
              aria-label="Proxima semana"
            >
              {'>'}
            </button>
          </div>
        </div>

        {!hasStudents && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
            Nenhum aluno vinculado para agendamento.
          </div>
        )}

        <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
          <button
            type="button"
            onClick={() => setOnlyFree((value) => !value)}
            className="guardian-eleve-chip px-4 text-sm whitespace-nowrap"
            data-active={onlyFree}
          >
            Somente livres
          </button>
          <button
            type="button"
            onClick={() => setModalityFilter('online')}
            className="guardian-eleve-chip px-4 text-sm whitespace-nowrap"
            data-active={modalityFilter === 'online'}
          >
            Online
          </button>
          <button
            type="button"
            onClick={() => setModalityFilter('presencial')}
            className="guardian-eleve-chip px-4 text-sm whitespace-nowrap"
            data-active={modalityFilter === 'presencial'}
          >
            Presencial
          </button>
          <button
            type="button"
            onClick={() => setModalityFilter('all')}
            className="guardian-eleve-chip px-4 text-sm whitespace-nowrap"
            data-active={modalityFilter === 'all'}
          >
            Todos
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 snap-x hide-scrollbar">
          {dayCards.map((dayCard) => {
            const isSelected = selectedDate === dayCard.key;
            const isToday = isSameDay(dayCard.day, new Date());
            return (
              <button
                key={dayCard.key}
                onClick={() => setSelectedDate(dayCard.key)}
                className={cn(
                  'guardian-eleve-day snap-start min-w-[124px] p-3.5 text-left',
                  dayCard.freeCount === 0 && 'opacity-80'
                )}
                data-selected={isSelected}
                data-today={isToday}
              >
                <p className="font-body text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {format(dayCard.day, 'EEE', { locale: ptBR })}
                </p>
                <p className="font-display text-3xl leading-none text-slate-900 mt-2">{format(dayCard.day, 'dd')}</p>
                <p className="font-body text-xs text-slate-600 mt-1">{dayCard.freeCount} livres</p>
                <div className="flex items-center gap-1 mt-2.5">
                  {dayCard.indicators.map((available, index) => (
                    <span
                      key={index}
                      className={cn('w-2 h-2 rounded-full', available ? 'bg-[var(--eleve-primary)]' : 'bg-slate-300')}
                    />
                  ))}
                </div>
                {isToday && (
                  <span className="inline-flex mt-2 rounded-full bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                    Hoje
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="font-display text-xl text-slate-900">Horarios de {dateLabel}</h2>
            <p className="font-body text-sm text-slate-600">{selectedSlots.length} opcoes</p>
          </div>

          {selectedSlots.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600">
              Sem slots disponiveis para este dia com os filtros atuais.
            </div>
          )}

          {selectedSlots.map((slot) => (
            <article key={slot.id} className="guardian-eleve-slot p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={cn(
                      'guardian-eleve-slot-tag',
                      slot.modality === 'online' && 'guardian-eleve-slot-tag--online',
                      slot.modality === 'presencial' && 'guardian-eleve-slot-tag--presencial',
                      slot.modality === 'ambos' && 'guardian-eleve-slot-tag--ambos'
                    )}
                  >
                    {MODALITY_LABELS[slot.modality]}
                  </span>
                  <span
                    className={cn(
                      'guardian-eleve-slot-status',
                      slot.status === 'LIVRE' && 'guardian-eleve-slot-status--livre',
                      slot.status === 'OCUPADO' && 'guardian-eleve-slot-status--ocupado',
                      slot.status === 'INDISPONIVEL' && 'guardian-eleve-slot-status--indisponivel'
                    )}
                  >
                    {STATUS_LABELS[slot.status]}
                  </span>
                </div>
                <p className="font-display text-2xl text-slate-900 mt-3">
                  {slot.startTime} - {slot.endTime}
                </p>
                <p className="font-body text-sm text-slate-600 mt-1">{STATUS_DESCRIPTION[slot.status]}</p>
              </div>

              <div className="sm:ml-auto">
                {slot.status === 'LIVRE' && (
                  <Button
                    className="guardian-eleve-cta min-w-[156px]"
                    onClick={() =>
                      navigate(
                        `/app/guardian/students/${studentPathId}/booking/new?date=${slot.date}&time=${slot.startTime}&slotId=${slot.id}`
                      )
                    }
                    disabled={!studentPathId}
                  >
                    Agendar
                  </Button>
                )}

                {slot.status === 'OCUPADO' && (
                  <Button
                    className="guardian-eleve-cta min-w-[156px] bg-amber-100 text-amber-800 hover:bg-amber-200"
                    onClick={() =>
                      navigate(
                        `/app/guardian/students/${studentPathId}/booking/waitlist?date=${slot.date}&time=${slot.startTime}&slotId=${slot.id}`
                      )
                    }
                    disabled={!studentPathId}
                  >
                    Entrar na fila
                  </Button>
                )}

                {slot.status === 'INDISPONIVEL' && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        disabled
                        className="guardian-eleve-cta min-w-[156px] px-4 text-sm text-slate-500 bg-slate-100 border border-slate-200"
                      >
                        Indisponivel
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Professor indisponivel neste horario.</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </article>
          ))}
        </section>
      </div>
    </TooltipProvider>
  );
};
