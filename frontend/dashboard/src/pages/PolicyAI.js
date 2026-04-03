import React from 'react';
import AIPolicyAdvisor from "../components/AIPolicyAdvisor";
import { useLanguage } from '../contexts/LanguageContext';

const PolicyAI = () => {
  const { t } = useLanguage();

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 className="gov-heading" style={{ fontSize: '2rem', marginBottom: '30px' }}>{t("pagePolicyAI")}</h1>
      
      <div className="gov-card">
        <AIPolicyAdvisor />
      </div>
    </div>
  );
};

export default PolicyAI;
