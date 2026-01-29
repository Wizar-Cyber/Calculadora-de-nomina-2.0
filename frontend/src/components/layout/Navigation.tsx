import { DollarSign, List, Settings } from 'lucide-react';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface NavigationProps {
  activeTab: 'config' | 'registros' | 'resultado';
  onTabChange: (tab: string) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="w-full justify-center rounded-t-xl border border-white/10 bg-white/5 px-2">
        <TabsTrigger value="config" className="border-b-2 border-transparent data-[state=active]:border-blue-500">
          <Settings className="h-4 w-4" />
          Configuración
        </TabsTrigger>
        <TabsTrigger value="registros" className="border-b-2 border-transparent data-[state=active]:border-blue-500">
          <List className="h-4 w-4" />
          Registros
        </TabsTrigger>
        <TabsTrigger value="resultado" className="border-b-2 border-transparent data-[state=active]:border-blue-500">
          <DollarSign className="h-4 w-4" />
          Resultado
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
