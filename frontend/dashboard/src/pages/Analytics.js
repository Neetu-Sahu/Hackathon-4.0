import React from 'react';
import DistrictTable from "../components/DistrictTable";
import Charts from "../components/Charts";
import PriorityTable from "../components/PriorityTable";
import PopulationChart from "../components/PopulationChart";
import Insights from "../components/Insights";
import { useLanguage } from '../contexts/LanguageContext';

const Analytics = () => {
  const { t } = useLanguage();

  return (
    <div style={{ padding: '30px', maxWidth: '1600px', margin: '0 auto' }}>
      <h1 className="gov-heading" style={{ fontSize: '2rem', marginBottom: '30px' }}>{t("pageAnalytics")}</h1>

      
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px', marginBottom: '24px' }}>
        <div className="gov-card" style={{ marginBottom: 0 }}>
          <h2 className="gov-heading">{t("priorityDistribution")}</h2>
          <Charts />
        </div>
        <div className="gov-card" style={{ marginBottom: 0 }}>
          <h2 className="gov-heading">{t("populationMetrics")}</h2>
          <PopulationChart />
        </div>
      </div>

      <div className="gov-card">
        <h2 className="gov-heading">{t("keyPolicyInsights")}</h2>
        <Insights />
      </div>

      <div className="gov-card">
        <h2 className="gov-heading">{t("fullDistrictData")}</h2>
        <DistrictTable />
      </div>

      <div className="gov-card">
        <h2 className="gov-heading">{t("highPriorityTargets")}</h2>
        <PriorityTable />
      </div>
    </div>
  );
};

export default Analytics;
