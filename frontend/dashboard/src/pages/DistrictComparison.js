import React from "react";
import { useLanguage } from "../contexts/LanguageContext";
import DistrictCompare from "../components/DistrictCompare";

const DistrictComparison = () => {
  const { t } = useLanguage();
  const ui = {
    intro: t("compareIntro") || "Compare any number of districts across all available indicators and review scheme recommendations side by side.",
  };

  return (
    <div style={{ padding: "30px", maxWidth: "1600px", margin: "0 auto" }}>
      <h1 className="gov-heading" style={{ fontSize: "2rem", marginBottom: "12px" }}>
        {t("pageDistrictComparison")}
      </h1>
      <p style={{ marginTop: 0, marginBottom: "28px", color: "#64748b" }}>
        {ui.intro}
      </p>
      <DistrictCompare />
    </div>
  );
};

export default DistrictComparison;