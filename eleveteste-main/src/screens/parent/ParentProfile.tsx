import React from 'react';
import { useNavigate } from 'react-router-dom';

export const ParentProfile: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="text-center pt-8">
        <div className="w-24 h-24 rounded-full bg-muted border-4 border-surface shadow-xl mx-auto overflow-hidden mb-4">
          <img src="https://picsum.photos/100/100" alt="Avatar" className="w-full h-full object-cover" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Roberto Silva</h2>
        <p className="text-muted-foreground">roberto.silva@email.com</p>
      </div>

      <div className="bg-surface rounded-3xl border border-border p-6 space-y-4">
        <h3 className="font-bold text-foreground text-lg">Dados Pessoais</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center py-3 border-b border-border">
            <span className="text-muted-foreground text-sm">Nome completo</span>
            <span className="font-medium text-foreground">Roberto Silva</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-border">
            <span className="text-muted-foreground text-sm">E-mail</span>
            <span className="font-medium text-foreground">roberto.silva@email.com</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-border">
            <span className="text-muted-foreground text-sm">Telefone</span>
            <span className="font-medium text-foreground">(11) 99999-8888</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-muted-foreground text-sm">Filhos cadastrados</span>
            <span className="font-medium text-foreground">2 filhos</span>
          </div>
        </div>
      </div>

      <button className="w-full py-3 bg-muted text-muted-foreground font-bold rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors">
        Sair da Conta
      </button>
    </div>
  );
};
