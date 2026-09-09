import React from 'react';
import { cn } from '../../lib/utils';

interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex items-center space-x-1 p-1 rounded-xl bg-slate-950/60 border border-white/10 w-fit overflow-x-auto',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap',
              isActive
                ? 'bg-[#14213d] text-[#fca311] shadow border border-[#fca311]/30 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            )}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px]',
                  isActive
                    ? 'bg-[#fca311]/20 text-[#fca311]'
                    : 'bg-white/10 text-slate-400'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
