import React, { useState } from "react";
import { useLanguage } from '../contexts/LanguageContext';
import axios from "axios";
import { API_BASE } from "../config";
import { getLocalizedDistrictName } from "../utils/districtLocalization";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

const interactiveButtonBase = {
  border: "none",
  borderRadius: "12px",
  color: "#ffffff",
  fontWeight: 700,
  fontSize: "0.95rem",
  padding: "12px 20px",
  cursor: "pointer",
  transition: "transform 300ms ease, box-shadow 300ms ease, filter 300ms ease",
};

const AIPolicyAdvisor = () => {
  const { t, language } = useLanguage();
  const ui = language === "hi"
    ? {
        title: "एआई नीति अनुकरण",
        ask: "पूछें",
        askPlaceholder: "नीति-आधारित प्रश्न पूछें...",
        increaseFunding: "वित्तपोषण बढ़ाएँ (%):",
        runSimulation: "सिमुलेशन चलाएँ",
        beforeAfter: "पहले बनाम बाद में नीति प्रभाव",
        greyGreen: "धूसर = वर्तमान स्थिति, हरा = अनुमानित प्रभाव",
        recommendedDistricts: "अनुशंसित जिले",
        beforeSimulation: "सिमुलेशन से पहले",
        reason: "कारण",
        supportingData: "सहायक डेटा",
        recommendedAction: "अनुशंसित कार्यवाही",
        recommendedSchemes: "जिलेवार अनुशंसित योजनाएँ",
        impactAnalysis: "प्रभाव विश्लेषण",
        loading: "लोड हो रहा है...",
        districts: "जिले",
        avgLiteracy: "औसत साक्षरता",
        avgPriority: "औसत प्राथमिकता",
        priority: "प्राथमिकता",
        population: "जनसंख्या",
        literacy: "साक्षरता",
        district: "जिला",
        metricLegend: "मेट्रिक रंग संकेतक:",
        districtCompareGrey: "धूसर = वर्तमान स्थिति",
        districtCompareGreen: "हरा = अनुमानित प्रभाव",
        selectedDistricts: "चयनित जिले",
        currentStatus: "वर्तमान स्थिति",
        predictedImpact: "अनुमानित प्रभाव",
        state: "राज्य",
        genderRatio: "लिंगानुपात",
        literacyIndex: "साक्षरता सूचकांक",
        schemeRecommendations: "योजना अनुशंसाएँ",
        triggerReasons: "ट्रिगर कारण",
        schemeOverlap: "योजनाओं का ओवरलैप",
        allSchemes: "सभी अनुशंसित योजनाएँ",
        noDistricts: "आरंभ करने के लिए एक या अधिक जिलों को जोड़ें",
        noDistrictsDesc: "पूरी जिला सूची से खोजें, जितने चाहें उतने जिले जोड़ें, और BPIS हर संख्यात्मक मेट्रिक व योजना अनुशंसाओं की तुलना करेगा।",
      }
    : {
        title: "AI Policy Simulation",
        ask: "Ask",
        askPlaceholder: "Ask a policy question...",
        increaseFunding: "Increase Funding (%):",
        runSimulation: "Run Simulation",
        beforeAfter: "Before vs After Policy Impact",
        greyGreen: "धूसर = वर्तमान स्थिति, हरा = अनुमानित प्रभाव",
        recommendedDistricts: "Recommended Districts",
        beforeSimulation: "Before Simulation (Current High Priority)",
        reason: "Reason",
        supportingData: "Supporting Data",
        recommendedAction: "Recommended Action",
        recommendedSchemes: "Recommended Schemes (District-wise)",
        impactAnalysis: "Impact Analysis: Priority Score Reduction",
        loading: "Loading...",
        districts: "Districts",
        avgLiteracy: "Average literacy",
        avgPriority: "Average priority score",
        priority: "Priority",
        population: "Population",
        literacy: "Literacy",
        district: "District",
        metricLegend: "Metric color legend:",
        districtCompareGrey: "Grey = Current Status",
        districtCompareGreen: "Green = Predicted Impact",
        selectedDistricts: "Selected districts",
        currentStatus: "Current Status",
        predictedImpact: "Predicted Impact",
        state: "State",
        genderRatio: "Gender ratio",
        literacyIndex: "Literacy index",
        schemeRecommendations: "योजना अनुशंसाएँ",
        triggerReasons: "ट्रिगर कारण",
        schemeOverlap: "Scheme overlap",
        allSchemes: "सभी अनुशंसित योजनाएँ",
        noDistricts: "आरंभ करने के लिए एक या अधिक जिले जोड़ें",
        noDistrictsDesc: "Search from the full district list, add as many districts as you want, and BPIS will compare every numeric metric plus scheme recommendations.",
      };
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [increase, setIncrease] = useState(20);
  const [simulationData, setSimulationData] = useState(null);

  // ---------------------------------------------------------------
  // Safe district-name localizer.
  // Safety Rule 1: We NEVER change the data key — only the display label.
  // Safety Rule 3: Falls back to capitalized original if key is missing.
  // ---------------------------------------------------------------
  const getDistrictLabel = (val) => {
    return getLocalizedDistrictName(t, val);
  };

  // ---------------------------------------------------------------
  // Custom tooltip for both simulation charts.
  // Safety Rule 1: dataKey in <Bar> stays as 'before'/'after'/'before_score'/'after_score'
  // We only translate the LABEL displayed to the user.
  // ---------------------------------------------------------------
  const LocalizedTooltip = ({ active, payload, label, keyLabelMap }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0',
          borderRadius: '8px', padding: '10px 14px',
          fontSize: '0.9rem', color: '#1e293b'
        }}>
          <p style={{ fontWeight: 700, marginBottom: '4px' }}>
            {getDistrictLabel(label)}
          </p>
          {payload.map((entry, i) => {
            // Translate the series label only — NOT the dataKey
            const displayLabel = keyLabelMap?.[entry.dataKey] || entry.name;
            return (
              <p key={i} style={{ color: entry.color, margin: '2px 0' }}>
                {displayLabel}: <strong>{Number(entry.value).toFixed(2)}</strong>
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const detectCategoryFromResponse = () => {
    const queryText = `${query} ${result?.reason || ""} ${result?.action || ""}`.toLowerCase();

    if (queryText.includes("health") || queryText.includes("hospital")) {
      return "health";
    }
    if (queryText.includes("education") || queryText.includes("literacy")) {
      return "education";
    }

    return "education";
  };

  const runSimulation = async () => {
    const detectedCategory = detectCategoryFromResponse();
    setSimulationData(null);

    try {
      const res = await axios.get(
        `${API_BASE}/simulate/${detectedCategory}?increase=${increase}&category=${detectedCategory}`
      );
      setSimulationData(res.data);
    } catch (err) {
      console.error("Simulation Error:", err);
      alert("Simulation Engine offline. Please check connection.");
    }
  };

  const handleAsk = async () => {
    if (!query) return;
    setLoading(true);
    setSimulationData(null);
    try {
      const res = await axios.post(`${API_BASE}/ai-policy-advisor`, { query });
      setResult(res.data);
    } catch (err) {
      console.error("API Error:", err);
    }
    setLoading(false);
  };

  const chartData = (() => {
    if (!result?.supporting_data || !simulationData?.data) return [];
    const before = result.supporting_data;
    const afterMap = {};
    simulationData.data.forEach((d) => { afterMap[d.district] = d.priority_score; });
    return before.map((b) => ({
      district: b.district,
      before: Math.round(b.priority_score),
      after: Math.round(afterMap[b.district] ?? b.priority_score),
    }));
  })();

  const getPriorityBadgeStyle = (priorityScore) => {
    if (priorityScore > 60) {
      return {
        background: "#fee2e2",
        color: "#b91c1c",
        border: "1px solid #fca5a5",
        boxShadow: "0 6px 16px rgba(185, 28, 28, 0.10)",
      };
    }

    if (priorityScore >= 40) {
      return {
        background: "#ffedd5",
        color: "#c2410c",
        border: "1px solid #fdba74",
        boxShadow: "0 6px 16px rgba(194, 65, 12, 0.10)",
      };
    }

    return {
      background: "#dcfce7",
      color: "#15803d",
      border: "1px solid #86efac",
      boxShadow: "0 6px 16px rgba(21, 128, 61, 0.10)",
    };
  };

  const sectionHeadingStyle = {
    fontSize: "0.78rem",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#64748b",
    margin: "0 0 14px 0",
  };

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 24px rgba(15, 23, 42, 0.04)",
    padding: "22px",
  };

  const inputStyle = {
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#0f172a",
    padding: "12px 14px",
    fontSize: "0.95rem",
    outline: "none",
    boxShadow: "inset 0 1px 2px rgba(15, 23, 42, 0.04)",
  };

  const askButtonStyle = {
    ...interactiveButtonBase,
    background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
    boxShadow: "0 10px 24px rgba(37, 99, 235, 0.22)",
  };

  const simulateButtonStyle = {
    ...interactiveButtonBase,
    background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
    boxShadow: "0 10px 24px rgba(249, 115, 22, 0.22)",
  };

  const disabledButtonStyle = {
    cursor: "not-allowed",
    opacity: 0.6,
    transform: "none",
    filter: "grayscale(0.1)",
    boxShadow: "none",
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>{ui.title}</h2>

      {/* Query Input */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
        <input
          type="text"
          placeholder={ui.askPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ ...inputStyle, flex: "1 1 420px", minWidth: "260px" }}
        />
        <button
          onClick={handleAsk}
          style={askButtonStyle}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 14px 30px rgba(37, 99, 235, 0.28)";
            e.currentTarget.style.filter = "brightness(1.03)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = askButtonStyle.boxShadow;
            e.currentTarget.style.filter = "brightness(1)";
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = "scale(0.98)";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
        >
          {ui.ask}
        </button>
      </div>

      <div style={{ marginTop: "16px", display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
        <label style={{ color: "#475569", fontWeight: 600 }}>{ui.increaseFunding}</label>
        <input
          type="number"
          value={increase}
          onChange={(e) => setIncrease(e.target.value)}
          style={{ ...inputStyle, width: "110px" }}
        />
        <button
          onClick={runSimulation}
          disabled={!result}
          style={result ? simulateButtonStyle : { ...simulateButtonStyle, ...disabledButtonStyle }}
          onMouseOver={(e) => {
            if (!result) return;
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 14px 30px rgba(249, 115, 22, 0.28)";
            e.currentTarget.style.filter = "brightness(1.03)";
          }}
          onMouseOut={(e) => {
            if (!result) return;
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = simulateButtonStyle.boxShadow;
            e.currentTarget.style.filter = "brightness(1)";
          }}
          onMouseDown={(e) => {
            if (!result) return;
            e.currentTarget.style.transform = "scale(0.98)";
          }}
          onMouseUp={(e) => {
            if (!result) return;
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
        >
          {ui.runSimulation}
        </button>
      </div>

      {/* Before vs After Chart */}
      {chartData.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h3>{ui.beforeAfter}</h3>
          <p style={{ margin: "0 0 12px 0", color: "#64748b", fontSize: "0.92rem", fontWeight: 600 }}>
            {ui.greyGreen}
          </p>
          <BarChart width={600} height={300} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            {/* tickFormatter uses getDistrictLabel — data key 'district' stays unchanged */}
            <XAxis dataKey="district" tickFormatter={getDistrictLabel} />
            <YAxis />
            {/* Tooltip translates labels; dataKeys 'before'/'after' are NOT changed */}
            <Tooltip
              content={
                <LocalizedTooltip
                  keyLabelMap={{
                    before: ui.currentStatus,
                    after: ui.predictedImpact,
                  }}
                />
              }
            />
            <Legend formatter={(value) => ({ before: ui.districtCompareGrey, after: ui.districtCompareGreen }[value] || value)} />
            <Bar dataKey="before" name={ui.districtCompareGrey} fill="#94a3b8" animationDuration={1500} />
            <Bar dataKey="after" name={ui.districtCompareGreen} fill="#22c55e" animationDuration={1500} />
          </BarChart>
        </div>
      )}

      {/* Loading */}
      {loading && <p>{ui.loading}</p>}

      {/* Result */}
      {result && (
        <div style={{ marginTop: "20px" }}>

          {/* Recommended Districts */}
          <h3>{ui.recommendedDistricts}</h3>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <h4>{ui.beforeSimulation}</h4>
            {result.supporting_data.map((districtData, i) => (
              <div
                key={`${districtData.district}-${i}`}
                style={{
                  padding: "10px 12px",
                  borderRadius: "999px",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  ...getPriorityBadgeStyle(Number(districtData.priority_score)),
                }}
              >
                {/* Display name is localized; the raw value is never mutated */}
                <span>{getDistrictLabel(districtData.district)}</span>
                <span style={{ opacity: 0.9 }}>
                  {Number(districtData.priority_score).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Reason — backend returns a translation key */}
          <h3 style={sectionHeadingStyle}>{ui.reason}</h3>
          <p style={{ marginTop: 0, lineHeight: 1.6, color: "#334155" }}>{t(result.reason)}</p>

          {/* Supporting Data Table */}
          <div style={{ ...cardStyle, marginTop: "24px" }}>
            <h3 style={sectionHeadingStyle}>{ui.supportingData}</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
                <thead>
                  <tr>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "0.84rem" }}>{ui.district}</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "0.84rem" }}>{ui.literacy}</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "0.84rem" }}>{ui.population}</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "0.84rem" }}>{ui.priority}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.supporting_data.map((d, i) => (
                    <tr key={i}>
                      {/* District name is localized in the cell; data key untouched */}
                      <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0", color: "#0f172a", fontWeight: 600 }}>{getDistrictLabel(d.district)}</td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0", color: "#334155" }}>{d.literacy}</td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0", color: "#334155" }}>{d.population?.toLocaleString()}</td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0", color: "#2563eb", fontWeight: 800 }}>{Number(d.priority_score).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action — backend returns a translation key */}
          <h3 style={{ ...sectionHeadingStyle, marginTop: "24px" }}>{ui.recommendedAction}</h3>
          <p style={{ marginTop: 0, lineHeight: 1.6, color: "#334155" }}>{t(result.action)}</p>

          {/* Recommended Schemes per district */}
          <div style={{ ...cardStyle, marginTop: "24px" }}>
            <h3 style={sectionHeadingStyle}>{ui.recommendedSchemes}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
              {result.recommended_schemes &&
                result.recommended_schemes.map((d, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "16px",
                      borderRadius: "14px",
                      background: "#f8fafc",
                      borderLeft: "4px solid #3b82f6",
                    }}
                  >
                    <strong style={{ color: "#0f172a", display: "block", marginBottom: "10px" }}>{getDistrictLabel(d.district)}</strong>
                    <ul style={{ margin: 0, paddingLeft: "18px", color: "#334155", lineHeight: 1.6 }}>
                      {d.schemes.map((s, j) => (
                        // Scheme name is passed through t() — it IS a translation key
                        <li key={j}>{t(s)}</li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Impact Analysis Chart */}
      {simulationData && (
        <div style={{ ...cardStyle, marginTop: "30px" }}>
          <h3 style={sectionHeadingStyle}>{ui.impactAnalysis}</h3>
          <p style={{ margin: "0 0 12px 0", color: "#64748b", fontSize: "0.92rem", fontWeight: 600 }}>
            {ui.greyGreen}
          </p>
          <BarChart width={600} height={300} data={simulationData.chart_data}>
            <CartesianGrid strokeDasharray="3 3" />
            {/* dataKey 'district' stays unchanged; label uses getDistrictLabel */}
            <XAxis dataKey="district" tickFormatter={getDistrictLabel} />
            <YAxis />
            {/* Tooltip: translates labels for before_score/after_score, NOT the key itself */}
            <Tooltip
              content={
                <LocalizedTooltip
                  keyLabelMap={{
                    before_score: t('currentPriority'),
                    after_score: t('postIntervention'),
                  }}
                />
              }
            />
            <Legend formatter={(value) => ({
              before_score: ui.districtCompareGrey,
              after_score: ui.districtCompareGreen,
            }[value] || value)} />
            <Bar name={ui.districtCompareGrey} dataKey="before_score" fill="#94a3b8" animationDuration={1500} />
            <Bar name={ui.districtCompareGreen} dataKey="after_score" fill="#22c55e" animationDuration={1500} />
          </BarChart>
        </div>
      )}
    </div>
  );
};

export default AIPolicyAdvisor;
