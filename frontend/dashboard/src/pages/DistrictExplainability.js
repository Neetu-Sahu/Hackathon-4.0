import React from "react";
import { useLanguage } from "../contexts/LanguageContext";
import SchemeExplainabilityPanel from "../components/SchemeExplainabilityPanel";

const DistrictExplainability = () => {
  const { t, language } = useLanguage();
  const ui = language === "hi"
    ? {
        intro: "देखें कि किन जिला संकेतों के कारण प्रत्येक योजना अनुशंसा दी गई।",
      }
    : {
        intro: "See why specific schemes were recommended and which district signals triggered them.",
      };

  return (
    <div style={{ padding: "30px", maxWidth: "1600px", margin: "0 auto" }}>
      <h1 className="gov-heading" style={{ fontSize: "2rem", marginBottom: "12px" }}>
        {t("pageDistrictExplainability")}
      </h1>
      <p style={{ marginTop: 0, marginBottom: "28px", color: "#64748b" }}>
        {ui.intro}
      </p>
      <SchemeExplainabilityPanel />
    </div>
  );
};

export default DistrictExplainability;
