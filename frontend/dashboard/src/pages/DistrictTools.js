import React from "react";
import { useLanguage } from "../contexts/LanguageContext";
import AlertsPanel from "../components/AlertsPanel";
import MultiDistrictCompare from "../components/MultiDistrictCompare";
import SchemeExplainabilityPanel from "../components/SchemeExplainabilityPanel";
import DistrictNotesPanel from "../components/DistrictNotesPanel";

const DistrictTools = () => {
  const { t } = useLanguage();

  return (
    <div style={{ padding: "30px", maxWidth: "1600px", margin: "0 auto" }}>
      <h1 className="gov-heading" style={{ fontSize: "2rem", marginBottom: "12px" }}>
        {t("pageDistrictTools")}
      </h1>
      <p style={{ marginTop: 0, marginBottom: "28px", color: "#64748b" }}>
        Alerts, district comparison, notes, and scheme explainability are grouped here as a dedicated BPIS feature page.
      </p>

      <AlertsPanel />
      <MultiDistrictCompare />
      <SchemeExplainabilityPanel />
      <DistrictNotesPanel />
    </div>
  );
};

export default DistrictTools;
