import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface TimeSlot {
  id: string;
  date: string;
  time: string;
  status: 'available' | 'booked' | 'pending';
  studentName?: string;
  subject?: string;
  topics?: string[];
  notes?: string;
  linkedQuestionId?: string;
}

export interface Notification {
  id: string;
  type: 'swap_request' | 'class_reminder' | 'info';
  message: string;
  userId: string;
  read: boolean;
  actionPayload?: {
    actionPath?: string;
    actionLabel?: string;
    slotId?: string;
  };
}

interface ScheduleContextType {
  slots: TimeSlot[];
  notifications: Notification[];
  requestBooking: (slotId: string, data: { subject: string; topics: string[]; notes?: string; linkedQuestionId?: string }) => void;
  requestSwap: (fromSlotId: string, toSlotId: string) => void;
  acceptSwap: (notificationId: string) => void;
  markNotificationRead: (notificationId: string) => void;
  updateBookingDetails: (slotId: string, data: { topics?: string[]; notes?: string; linkedQuestionId?: string }) => void;
}

const INITIAL_SLOTS: TimeSlot[] = [
  { id: '1', date: '2024-06-20', time: '14:00', status: 'available' },
  { id: '2', date: '2024-06-20', time: '16:00', status: 'booked', studentName: 'Aluno (Você)', subject: 'Matemática', topics: ['Função Afim'] },
  { id: '3', date: '2024-06-21', time: '10:00', status: 'available' },
  { id: '4', date: '2024-06-21', time: '14:00', status: 'booked', studentName: 'Lucas', subject: 'Física', topics: ['Cinemática'] },
  { id: '5', date: '2024-06-22', time: '09:00', status: 'available' },
  { id: '6', date: '2024-06-22', time: '11:00', status: 'available' },
  { id: '7', date: '2024-06-23', time: '14:00', status: 'available' },
  { id: '8', date: '2024-06-24', time: '10:00', status: 'available' },
  { id: '9', date: '2024-06-24', time: '15:00', status: 'pending', studentName: 'Aluno (Você)', subject: 'Química', topics: ['Estequiometria'] },
  { id: '10', date: '2024-06-25', time: '08:00', status: 'available' },
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: 'class_reminder',
    message: 'Sua aula de Matemática é amanhã às 16:00!',
    userId: 'student',
    read: false,
    actionPayload: { actionPath: '/student/booking', actionLabel: 'Ver Aula' }
  },
  {
    id: 'n2',
    type: 'info',
    message: 'O professor adicionou novos horários para a próxima semana.',
    userId: 'student',
    read: false,
  },
];

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const ScheduleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [slots, setSlots] = useState<TimeSlot[]>(INITIAL_SLOTS);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  const requestBooking = (slotId: string, data: { subject: string; topics: string[]; notes?: string; linkedQuestionId?: string }) => {
    setSlots(prev => prev.map(s => 
      s.id === slotId 
        ? { ...s, status: 'pending', studentName: 'Aluno (Você)', ...data } 
        : s
    ));
    
    setNotifications(prev => [...prev, {
      id: `n-${Date.now()}`,
      type: 'info',
      message: `Novo agendamento de ${data.subject} solicitado para aprovação.`,
      userId: 'teacher',
      read: false,
    }]);
  };

  const requestSwap = (fromSlotId: string, toSlotId: string) => {
    console.log('Swap requested:', fromSlotId, '->', toSlotId);
    setNotifications(prev => [...prev, {
      id: `n-${Date.now()}`,
      type: 'swap_request',
      message: `Solicitação de troca de horário recebida.`,
      userId: 'teacher',
      read: false,
      actionPayload: { slotId: fromSlotId }
    }]);
  };

  const acceptSwap = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const updateBookingDetails = (slotId: string, data: { topics?: string[]; notes?: string; linkedQuestionId?: string }) => {
    setSlots(prev => prev.map(s => 
      s.id === slotId ? { ...s, ...data } : s
    ));
  };

  return (
    <ScheduleContext.Provider value={{ 
      slots, 
      notifications, 
      requestBooking, 
      requestSwap, 
      acceptSwap, 
      markNotificationRead,
      updateBookingDetails 
    }}>
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};
