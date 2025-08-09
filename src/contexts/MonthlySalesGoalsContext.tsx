import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useLicense } from '@/contexts/LicenseContext';
import type { SalesMonthlyGoal } from '@/types/metrics';
import { toast } from '@/hooks/use-toast';
// import api from '@/services/api'; // Prepared for future Axios integration

interface MonthlySalesGoalsContextValue {
  goals: SalesMonthlyGoal[];
  getGoal: (empresaId: string, filialId: number, ano: number, mes: number) => SalesMonthlyGoal | undefined;
  createGoal: (payload: Omit<SalesMonthlyGoal, 'id'>) => Promise<SalesMonthlyGoal | null>;
  updateGoal: (id: string, updates: Partial<Omit<SalesMonthlyGoal, 'id' | 'empresaId'>>) => Promise<SalesMonthlyGoal | null>;
  deleteGoal: (id: string) => Promise<boolean>;
  refresh: () => void;
}

const STORAGE_KEY = 'monthlySalesGoals';

const MonthlySalesGoalsContext = createContext<MonthlySalesGoalsContextValue | undefined>(undefined);

function loadFromStorage(): SalesMonthlyGoal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(list: SalesMonthlyGoal[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export const MonthlySalesGoalsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { selectedLicenseId } = useLicense();
  const [goals, setGoals] = useState<SalesMonthlyGoal[]>([]);

  useEffect(() => {
    setGoals(loadFromStorage());
  }, []);

  const getGoal: MonthlySalesGoalsContextValue['getGoal'] = (empresaId, filialId, ano, mes) => {
    return goals.find(g => g.empresaId === empresaId && g.filialId === filialId && g.ano === ano && g.mes === mes);
  };

  const createGoal: MonthlySalesGoalsContextValue['createGoal'] = async (payload) => {
    // Enforce uniqueness (empresaId, filialId, ano, mes)
    const exists = goals.some(g => g.empresaId === payload.empresaId && g.filialId === payload.filialId && g.ano === payload.ano && g.mes === payload.mes);
    if (exists) {
      toast({ title: 'Duplicidade', description: 'Já existe uma meta para este mês/ano/filial.', variant: 'destructive' });
      return null; // 409-like behavior
    }

    const newGoal: SalesMonthlyGoal = { id: crypto.randomUUID(), ...payload };
    const next = [...goals, newGoal];
    setGoals(next);
    saveToStorage(next);

    // Prepared Axios call (do not enable now)
    // await api.post('/metas', { empresaId: payload.empresaId, filialId: payload.filialId, ano: payload.ano, mes: payload.mes, valorMeta: payload.valorMeta });

    return newGoal;
  };

  const updateGoal: MonthlySalesGoalsContextValue['updateGoal'] = async (id, updates) => {
    const idx = goals.findIndex(g => g.id === id);
    if (idx === -1) return null; // 404-like behavior

    // If changing (filialId/ano/mes), ensure uniqueness
    const target = goals[idx];
    const nextTarget = { ...target, ...updates } as SalesMonthlyGoal;
    const duplicate = goals.some(g => g.id !== id && g.empresaId === nextTarget.empresaId && g.filialId === nextTarget.filialId && g.ano === nextTarget.ano && g.mes === nextTarget.mes);
    if (duplicate) {
      toast({ title: 'Duplicidade', description: 'Já existe uma meta para este mês/ano/filial.', variant: 'destructive' });
      return null; // 409-like behavior
    }

    const next = [...goals];
    next[idx] = nextTarget;
    setGoals(next);
    saveToStorage(next);

    // Prepared Axios call (do not enable now)
    // await api.put(`/metas/${id}`, { valorMeta: updates.valorMeta, ano: updates.ano, mes: updates.mes, filialId: updates.filialId });

    return nextTarget;
  };

  const deleteGoal: MonthlySalesGoalsContextValue['deleteGoal'] = async (id) => {
    const exists = goals.some(g => g.id === id);
    if (!exists) return false; // 404-like behavior
    const next = goals.filter(g => g.id !== id);
    setGoals(next);
    saveToStorage(next);

    // Prepared Axios call (do not enable now)
    // await api.delete(`/metas/${id}`);

    return true;
  };

  const refresh = () => {
    setGoals(loadFromStorage());
  };

  const value = useMemo<MonthlySalesGoalsContextValue>(() => ({ goals, getGoal, createGoal, updateGoal, deleteGoal, refresh }), [goals]);

  return (
    <MonthlySalesGoalsContext.Provider value={value}>
      {children}
    </MonthlySalesGoalsContext.Provider>
  );
};

export const useMonthlySalesGoals = () => {
  const ctx = useContext(MonthlySalesGoalsContext);
  if (!ctx) throw new Error('useMonthlySalesGoals deve ser usado dentro de MonthlySalesGoalsProvider');
  return ctx;
};
