import React from 'react';
import MapView from "../components/MapView";
import SummaryCards from "../components/SummaryCards";
import { useLanguage } from '../contexts/LanguageContext';

const Overview = () => {
  const { t } = useLanguage();

  return (
    <div style={{ padding: '28px', maxWidth: '1440px', margin: '0 auto' }}>
      <div className="gov-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'end', flexWrap: 'wrap' }}>
          <div>
            <span className="section-label">{t("nationalDistrictView")}</span>
            <h2 className="gov-heading" style={{ marginTop: '12px', marginBottom: '6px' }}>{t("districtMapLivePriorityTitle")}</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              {t("districtMapLivePrioritySubtitle")}
            </p>
          </div>
        </div>
        <MapView />
      </div>

      <div className="gov-card" style={{ background: 'transparent', boxShadow: 'none', border: 'none', padding: 0 }}>
        <SummaryCards />
      </div>
    </div>
  );
};

export default Overview;
