'use client';

import { useEffect } from 'react';
import { useEvoStore } from '@/lib/evo/store';
import { t } from '@/lib/evo/i18n';
import EvoLayout from '@/components/evo/evo-layout';
import EvoDashboard from '@/components/evo/evo-dashboard';
import EvoProjects from '@/components/evo/evo-projects';
import EvoPipeline from '@/components/evo/evo-pipeline';
import EvoSignals from '@/components/evo/evo-signals';
import EvoHistory from '@/components/evo/evo-history';
import EvoExports from '@/components/evo/evo-exports';
import EvoPlans from '@/components/evo/evo-plans';
import EvoHealth from '@/components/evo/evo-health';
import EvoDebug from '@/components/evo/evo-debug';

export default function Home() {
  const { loadProjects, loadHistory, projectsLoading, locale, activeView, setActiveView } = useEvoStore();

  useEffect(() => {
    loadProjects();
    loadHistory();
  }, [loadProjects, loadHistory]);

  return (
    <EvoLayout activeView={activeView} setActiveView={setActiveView}>
      {projectsLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-cyan-400 text-sm">{t(locale, 'loadingEvo')}</div>
        </div>
      ) : (
        <>
          {activeView === 'dashboard' && <EvoDashboard />}
          {activeView === 'projects' && <EvoProjects />}
          {activeView === 'pipeline' && <EvoPipeline />}
          {activeView === 'signals' && <EvoSignals />}
          {activeView === 'history' && <EvoHistory />}
          {activeView === 'exports' && <EvoExports />}
          {activeView === 'plans' && <EvoPlans />}
          {activeView === 'health' && <EvoHealth />}
          {activeView === 'debug' && <EvoDebug />}
        </>
      )}
    </EvoLayout>
  );
}
