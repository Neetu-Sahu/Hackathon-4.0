import React from "react";
import { useLanguage } from "../contexts/LanguageContext";
import DistrictNotesPanel from "../components/DistrictNotesPanel";

const DistrictNotes = () => {
  const { t, language } = useLanguage();
  const ui = language === "hi"
    ? {
        intro: "चयनित जिले के लिए आंतरिक टिप्पणियाँ, टैग और कार्य-आइटम जोड़ें।",
      }
    : {
        intro: "Add internal comments, tags, and action items for the selected district.",
      };

  return (
    <div style={{ padding: "30px", maxWidth: "1600px", margin: "0 auto" }}>
      <h1 className="gov-heading" style={{ fontSize: "2rem", marginBottom: "12px" }}>
        {t("pageDistrictNotes")}
      </h1>
      <p style={{ marginTop: 0, marginBottom: "28px", color: "#64748b" }}>
        {ui.intro}
      </p>
      <DistrictNotesPanel />
    </div>
  );
};

export default DistrictNotes;
