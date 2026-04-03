import React, { useEffect, useMemo, useRef, useState } from "react";
import { BarChart3, ChevronDown, FileText, Search, Sparkles, X } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useLanguage } from "../contexts/LanguageContext";
import { getPriorityRanking, getSchemeRecommendation } from "../services/api";
import { getLocalizedDistrictName as localizeDistrictName, getLocalizedStateName } from "../utils/districtLocalization";

const metricLabelMap = {
  priority_score: "Priority Score",
  literacy_rate: "Literacy Rate",
  population: "Population",
  male_population: "Male Population",
  female_population: "Female Population",
  gender_ratio: "Gender Ratio",
};

const metricLabelMapHi = {
  priority_score: "प्राथमिकता स्कोर",
  literacy_rate: "साक्षरता दर",
  population: "जनसंख्या",
  male_population: "पुरुष जनसंख्या",
  female_population: "महिला जनसंख्या",
  gender_ratio: "लिंगानुपात",
};

const preferredMetricOrder = [
  "priority_score",
  "literacy_rate",
  "population",
  "male_population",
  "female_population",
  "gender_ratio",
];

const excludedMetrics = new Set([
  "norm_pop",
  "norm_illit",
  "illiteracy_rate",
  "literate_population",
  "population_weight",
  "literacy_index",
]);

const metricColorMap = {
  priority_score: "#dc2626",
  literacy_rate: "#2563eb",
  population: "#059669",
  male_population: "#0284c7",
  female_population: "#db2777",
  gender_ratio: "#4f46e5",
};

const metricLabelKeyMap = {
  priority_score: "priorityScore",
  literacy_rate: "literacyRate",
  population: "population",
  male_population: "malePopulation",
  female_population: "femalePopulation",
  gender_ratio: "genderRatio",
};

const formatLabel = (key, language = "en") =>
  (language === "hi" ? metricLabelMapHi[key] : metricLabelMap[key]) ||
  key
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const formatValue = (key, value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "N/A";
  }

  const numeric = Number(value);

  if (key.includes("population")) {
    return Math.round(numeric).toLocaleString("en-IN");
  }

  if (key.includes("score") || key.includes("rate") || key.includes("index") || key.includes("ratio") || key.includes("weight")) {
    return numeric.toFixed(2);
  }

  return numeric.toFixed(2);
};

const hexToRgb = (hex) => {
  const normalized = hex.replace("#", "");
  const bigint = Number.parseInt(normalized, 16);
  return [
    (bigint >> 16) & 255,
    (bigint >> 8) & 255,
    bigint & 255,
  ];
};

function DistrictPicker({ data, selectedDistricts, onAdd, t, language }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredDistricts = useMemo(() => {
    const term = query.trim().toLowerCase();
    return data.filter((district) => {
      const englishMatch = district.district.toLowerCase().includes(term);
      const localizedMatch = localizeDistrictName(t, district.district).toLowerCase().includes(term);
      const notAlreadySelected = !selectedDistricts.includes(district.district);
      return notAlreadySelected && (!term || englishMatch || localizedMatch);
    });
  }, [data, query, selectedDistricts, t]);

  const addAndReset = (districtName) => {
    onAdd(districtName);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <input
          type="text"
          value={query}
          placeholder={t("searchDistrictPlaceholder") || "Search district names..."}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && filteredDistricts.length > 0) {
              addAndReset(filteredDistricts[0].district);
            }
          }}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: "12px",
            border: "1px solid #cbd5e1",
            outline: "none",
            fontSize: "1rem",
            background: "white",
            boxSizing: "border-box",
          }}
        />
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 14px",
            border: "none",
            borderRadius: "12px",
            background: "#0f172a",
            color: "white",
            cursor: "pointer",
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          {isOpen ? <ChevronDown size={18} /> : <Search size={18} />}
          {t("districtCompareAdd") || "Add District"}
        </button>
      </div>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            left: 0,
            right: 0,
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            boxShadow: "0 18px 40px rgba(15, 23, 42, 0.12)",
            overflow: "hidden",
            zIndex: 1000,
            maxHeight: "320px",
            overflowY: "auto",
          }}
        >
          {filteredDistricts.length > 0 ? (
            filteredDistricts.map((district) => (
              <button
                key={district.district}
                type="button"
                onClick={() => addAndReset(district.district)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "12px 16px",
                  border: "none",
                  borderBottom: "1px solid #f1f5f9",
                  background: "white",
                  cursor: "pointer",
                  color: "#0f172a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
                onMouseOver={(event) => {
                  event.currentTarget.style.backgroundColor = "#f8fafc";
                }}
                onMouseOut={(event) => {
                  event.currentTarget.style.backgroundColor = "white";
                }}
              >
                <span style={{ fontWeight: 600 }}>{localizeDistrictName(t, district.district)}</span>
                <span style={{ color: "#64748b", fontSize: "0.85rem" }}>{getLocalizedStateName(t, district.state, language)}</span>
              </button>
            ))
          ) : (
            <div style={{ padding: "14px 16px", color: "#64748b" }}>
              {t("noMatchingDistricts") || "No districts match your search."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DistrictCompare() {
  const { t, language } = useLanguage();
  const [data, setData] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [recommendations, setRecommendations] = useState({});
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    getPriorityRanking().then((response) => {
      setData(response || []);
    });
  }, []);

  useEffect(() => {
    let isActive = true;

    if (!selectedDistricts.length) {
      setRecommendations({});
      return undefined;
    }

    setLoadingRecommendations(true);

    Promise.all(
      selectedDistricts.map(async (districtName) => {
        try {
          const result = await getSchemeRecommendation(districtName);
          return [districtName, result];
        } catch (error) {
          return [
            districtName,
            {
              district: districtName,
              recommended_schemes: [],
              issue_details: [],
              scheme_explanations: {},
              error: error?.response?.data?.detail || "Failed to load recommendations.",
            },
          ];
        }
      }),
    )
      .then((entries) => {
        if (!isActive) return;
        setRecommendations(Object.fromEntries(entries));
      })
      .finally(() => {
        if (isActive) {
          setLoadingRecommendations(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [selectedDistricts]);

  const selectedRecords = useMemo(
    () =>
      selectedDistricts
        .map((districtName) =>
          data.find((district) => district.district.toLowerCase() === districtName.toLowerCase()),
        )
        .filter(Boolean),
    [data, selectedDistricts],
  );

  const getMetricLabel = (metric) => t(metricLabelKeyMap[metric]) || formatLabel(metric);

  const ui = {
    multiCompare: t("introBadge") || "Multi-district compare",
    compareIntro: t("compareIntro") || "Select any number of districts and compare every numeric signal we have, along with district-wise scheme recommendations.",
    selectedDistricts: t("selectedDistricts") || "Selected districts:",
    clearAll: t("clearAll") || "Clear all",
    districtsSelected: t("districtsSelected") || "Districts selected",
    averageLiteracy: t("averageLiteracy") || "Average literacy",
    averagePriority: t("averagePriority") || "Average priority score",
    highestPopulation: t("highestPopulation") || "Highest population",
    metric: t("metric") || "Metric",
    range: t("range") || "Range",
    state: t("state") || "State",
    population: t("population") || "Population",
    literacy: t("literacy") || "Literacy",
    priorityScore: t("priorityScore") || "Priority score",
    genderRatio: t("genderRatio") || "Gender ratio",
    schemeRecommendations: t("schemeRecommendations") || "Scheme recommendations",
    triggerReasons: t("triggerReasons") || "Trigger reasons",
    schemeOverlap: t("schemeOverlap") || "Scheme overlap",
    allRecommendedSchemes: t("allRecommendedSchemes") || "All recommended schemes",
    loading: t("loadingSchemeRecommendations") || "Loading scheme recommendations...",
    addDistricts: t("addDistricts") || "Add one or more districts to begin",
    addDistrictsDesc:
      t("addDistrictsDesc") ||
      "Search from the full district list, add as many districts as you want, and BPIS will compare every numeric metric plus scheme recommendations.",
    noCommonYet: t("noCommonYet") || "No common scheme across all selected districts yet.",
    noSchemes: t("noSchemesRecommended") || "No schemes recommended for the current selection.",
    noScheme: t("noSchemeRecommendation") || "No scheme recommendation found.",
    noTrigger: t("noTriggerRules") || "No major trigger rules fired.",
    introBadge: t("introBadge") || "Multi-district compare",
    metricLegend: t("metricLegend") || "Metric color legend:",
    ruleMatched: t("ruleMatched") || "Matched by district policy rules.",
    recommendedAcross: t("recommendedAcross") || "Recommended across all selected districts.",
    schemeSummary: t("schemeSummary") || "Scheme summary",
    commonSchemes: t("commonSchemes") || "Common scheme recommendations",
    commonExplanation: t("commonExplanation") || "Recommended across all selected districts.",
    noCommon: t("noCommonScheme") || "No common scheme recommendation across all selected districts.",
  };
  const labels = ui;

  const handleExportPdf = () => {
    if (!selectedRecords.length) {
      return;
    }

    const doc = new jsPDF("landscape", "pt", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const topMargin = 40;
    const footerReserve = 52;
    const bottomLimit = pageHeight - footerReserve;
    let nextY = 0;

    const startNewPage = () => {
      doc.addPage();
      nextY = topMargin;
    };

    const ensureSpace = (height) => {
      if (nextY + height > bottomLimit) {
        startNewPage();
      }
    };

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 72, "F");
    doc.setFillColor(234, 88, 12);
    doc.rect(0, 72, pageWidth, 8, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(t("reportHeader") || "BPIS District Comparison Report", pageWidth / 2, 30, {
      align: "center",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      `${t("generatedOn") || "Generated on"}: ${new Date().toLocaleString()}`,
      pageWidth / 2,
      50,
      { align: "center" },
    );

    nextY = 104;
    doc.setTextColor(15, 23, 42);
    const selectedDistrictLabels = selectedRecords
      .map((district) => localizeDistrictName(t, district.district))
      .join(", ");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
      doc.text(ui.selectedDistricts || "Selected districts:", 40, nextY);
    doc.setFont("helvetica", "normal");
    doc.text(selectedDistrictLabels, 40, nextY + 16, {
      maxWidth: pageWidth - 80,
    });

    nextY += 32;
    ensureSpace(34);
    const summaryCardsY = nextY;
    const summaryCardWidth = (pageWidth - 100) / 3;
    const summaryCards = [
      { label: ui.districtsSelected, value: String(selectedRecords.length), fill: [15, 23, 42] },
      {
        label: ui.averageLiteracy,
        value: `${(
          selectedRecords.reduce((sum, district) => sum + Number(district.literacy_rate || 0), 0) /
          selectedRecords.length
        ).toFixed(2)}%`,
        fill: [37, 99, 235],
      },
      {
        label: ui.averagePriority,
        value: `${(
          selectedRecords.reduce((sum, district) => sum + Number(district.priority_score || 0), 0) /
          selectedRecords.length
        ).toFixed(2)}`,
        fill: [234, 88, 12],
      },
    ];

    summaryCards.forEach((card, index) => {
      const x = 40 + index * (summaryCardWidth + 10);
      doc.setFillColor(...card.fill);
      doc.roundedRect(x, summaryCardsY, summaryCardWidth, 34, 10, 10, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text(card.label, x + 12, summaryCardsY + 12);
      doc.setFontSize(13);
      doc.text(card.value, x + 12, summaryCardsY + 25);
    });

    nextY = summaryCardsY + 52;
    ensureSpace(26);
    const badgeY = nextY;
    const selectedBadgeWidth = Math.min(120, (pageWidth - 80) / Math.max(selectedRecords.length, 1) - 8);
    selectedRecords.forEach((district, index) => {
      const x = 40 + index * (selectedBadgeWidth + 8);
      const badgeColor = index % 2 === 0 ? [234, 88, 12] : [15, 23, 42];
      doc.setFillColor(...badgeColor);
      doc.roundedRect(x, badgeY, selectedBadgeWidth, 24, 8, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text(
        localizeDistrictName(t, district.district),
        x + selectedBadgeWidth / 2,
        badgeY + 15,
        { align: "center", maxWidth: selectedBadgeWidth - 8 },
      );
    });

    nextY = badgeY + 34;
    ensureSpace(28);
    const legendItems = numericMetrics.slice(0, 6);
    if (legendItems.length > 0) {
      let legendX = 40;
      const legendY = nextY;
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(40, legendY - 14, pageWidth - 80, 28, 10, 10, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(labels.metricLegend, legendX, legendY - 4);
      legendX += 110;
      legendItems.forEach((metric) => {
        const label = getMetricLabel(metric);
        const fill = metricColorMap[metric] || "#ea580c";
        doc.setFillColor(fill);
        doc.roundedRect(legendX, legendY - 8, 10, 10, 3, 3, "F");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(label, legendX + 14, legendY);
        legendX += Math.min(90 + label.length * 2, 160);
      });
      nextY = legendY + 20;
    } else {
      nextY += 18;
    }

    doc.setTextColor(15, 23, 42);
    autoTable(doc, {
      startY: nextY + 12,
      head: [[ui.metric, ...selectedRecords.map((district) => localizeDistrictName(t, district.district)), ui.range]],
      didParseCell: (cellData) => {
        if (cellData.section === "head" && cellData.column.index === 0) {
          cellData.cell.styles.cellPadding = { top: 6, right: 6, bottom: 6, left: 18 };
        }

        if (cellData.section === "body" && cellData.column.index === 0) {
          cellData.cell.styles.cellPadding = { top: 7, right: 6, bottom: 7, left: 20 };
          cellData.cell.styles.fontStyle = "bold";
          cellData.cell.styles.textColor = [15, 23, 42];
        }
      },
      didDrawCell: (cellData) => {
        if (cellData.section === "body" && cellData.column.index === 0) {
          const metricKey = numericMetrics[cellData.row.index];
          const fill = hexToRgb(metricColorMap[metricKey] || "#ea580c");
          doc.setFillColor(...fill);
          const x = cellData.cell.x + 8;
          const y = cellData.cell.y + (cellData.cell.height / 2) - 3;
          doc.roundedRect(x, y, 6, 6, 2, 2, "F");
        }
      },
      body: numericMetrics.map((metric) => {
        const metricValues = selectedRecords.map((district) => Number(district[metric] || 0));
        const minValue = Math.min(...metricValues);
        const maxValue = Math.max(...metricValues);
        const rangeText = `${formatValue(metric, minValue)} - ${formatValue(metric, maxValue)}`;

        return [
          getMetricLabel(metric),
          ...selectedRecords.map((district) => formatValue(metric, Number(district[metric] || 0))),
          rangeText,
        ];
      }),
      styles: {
        font: "helvetica",
        fontSize: 8.5,
        cellPadding: { top: 6, right: 5, bottom: 6, left: 5 },
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: 40, right: 40 },
    });

    nextY = doc.lastAutoTable.finalY + 18;

    selectedRecords.forEach((district) => {
      const rec = recommendations[district.district];
      const schemes = rec?.recommended_schemes || [];
      const issueDetails = rec?.issue_details || [];

      ensureSpace(130);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(localizeDistrictName(t, district.district), 40, nextY);
      nextY += 14;

      ensureSpace(44);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(40, nextY - 2, pageWidth - 80, 34, 8, 8, "F");
      doc.setTextColor(71, 85, 105);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text(`${ui.state}: ${getLocalizedStateName(t, district.state, language) || "N/A"}`, 52, nextY + 10);
      doc.text(`${ui.priorityScore}: ${Number(district.priority_score || 0).toFixed(2)}`, 52, nextY + 22);
      doc.setTextColor(15, 23, 42);
      nextY += 50;

      ensureSpace(28);
      doc.setFillColor(15, 23, 42);
      doc.roundedRect(40, nextY - 12, 142, 18, 8, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text(labels.schemeRecommendations || "Scheme recommendations", 111, nextY + 0, { align: "center" });
      doc.setTextColor(15, 23, 42);
      nextY += 14;

      if (schemes.length) {
        schemes.forEach((scheme) => {
          const explanation = (rec?.scheme_explanations?.[scheme] || [ui.ruleMatched]).join(" ");
          const lines = doc.splitTextToSize(`${scheme}: ${explanation}`, pageWidth - 108);
          const blockHeight = lines.length * 13 + 18;
          ensureSpace(blockHeight + 8);
          doc.setFillColor(255, 247, 237);
          doc.roundedRect(48, nextY - 2, pageWidth - 96, blockHeight, 8, 8, "F");
          doc.setFillColor(234, 88, 12);
          doc.circle(60, nextY + 8, 3, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.text(scheme, 70, nextY + 10);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.5);
          doc.text(lines, 70, nextY + 22);
          nextY += blockHeight + 4;
        });
      } else {
        ensureSpace(30);
        doc.setFont("helvetica", "normal");
        doc.setFillColor(248, 250, 252);
        doc.text(
          labels.noScheme || (language === "hi" ? "कोई योजना अनुशंसा नहीं मिली।" : "No scheme recommendation found."),
          60,
          nextY + 13,
        );
        nextY += 30;
      }

      ensureSpace(28);
      doc.setFillColor(15, 23, 42);
      doc.roundedRect(40, nextY - 10, 126, 18, 8, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text(labels.triggerReasons || (language === "hi" ? "कोई प्रमुख ट्रिगर नियम सक्रिय नहीं हुए।" : "Trigger reasons"), 103, nextY + 2, { align: "center" });
      doc.setTextColor(15, 23, 42);
      nextY += 14;

      if (issueDetails.length) {
        issueDetails.forEach((issue) => {
          const lines = doc.splitTextToSize(issue.reason, pageWidth - 108);
          const blockHeight = lines.length * 13 + 14;
          ensureSpace(blockHeight + 8);
          doc.setFillColor(255, 251, 235);
          doc.roundedRect(48, nextY - 2, pageWidth - 96, blockHeight, 8, 8, "F");
          doc.setFillColor(245, 158, 11);
          doc.circle(60, nextY + 8, 3, "F");
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.5);
          doc.text(lines, 70, nextY + 12);
          nextY += blockHeight + 4;
        });
      } else {
        ensureSpace(30);
        doc.setFont("helvetica", "normal");
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(48, nextY - 2, pageWidth - 96, 24, 8, 8, "F");
        doc.text(labels.noTrigger || (language === "hi" ? "कोई प्रमुख ट्रिगर नियम सक्रिय नहीं हुए।" : "No major trigger rules fired."), 60, nextY + 13);
        nextY += 30;
      }

      nextY += 18;
    });

    const commonSchemesPdf = commonSchemes || [];
    const allSchemesPdf = allSchemes || [];
    ensureSpace(160);

    doc.setFillColor(15, 23, 42);
    doc.roundedRect(40, nextY, pageWidth - 80, 24, 10, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(labels.schemeSummary || (language === "hi" ? "योजना सारांश" : "Scheme summary"), 54, nextY + 16);
    nextY += 40;

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(labels.commonSchemes || (language === "hi" ? "सामान्य योजनाएँ" : "Common schemes"), 54, nextY + 16);
    nextY += 12;

    if (commonSchemesPdf.length) {
      commonSchemesPdf.forEach((scheme) => {
        const explanation = labels.commonExplanation || (language === "hi" ? "जिला नीति नियमों से मेल खाता है।" : "Matched by district policy rules.");
        const lines = doc.splitTextToSize(`- ${scheme}: ${explanation}`, pageWidth - 90);
        doc.text(lines, 48, nextY);
        nextY += lines.length * 12 + 2;
      });
    } else {
      doc.setFont("helvetica", "normal");
      doc.text(language === "hi" ? "कोई समान योजना नहीं मिली।" : "No common schemes found.", 48, nextY);
      nextY += 14;
    }

    nextY += 10;
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(labels.allSchemes || (language === "hi" ? "सभी अनुशंसित योजनाएँ" : "All recommended schemes"), 54, nextY + 16);
    nextY += 12;

    if (allSchemesPdf.length) {
      allSchemesPdf.forEach((scheme) => {
        const lines = doc.splitTextToSize(`- ${scheme}`, pageWidth - 90);
        doc.text(lines, 48, nextY);
        nextY += lines.length * 12 + 2;
      });
    } else {
      doc.setFont("helvetica", "normal");
      doc.text(labels.noSchemes || (language === "hi" ? "चयनित जिले के लिए कोई योजना अनुशंसित नहीं है।" : "No schemes recommended for the current selection."), 48, nextY);
      nextY += 14;
    }

    const totalPages = doc.getNumberOfPages();
    for (let page = 1; page <= totalPages; page += 1) {
      doc.setPage(page);
      const pageWidthCurrent = doc.internal.pageSize.getWidth();
      const pageHeightCurrent = doc.internal.pageSize.getHeight();

      doc.setTextColor(253, 253, 254);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(30);
      doc.text("BPIS", pageWidthCurrent / 2, pageHeightCurrent / 2, {
        align: "center",
        angle: 20,
      });

      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(t("confidentialFooter") || "Confidential - For Internal Govt Use Only", pageWidthCurrent / 2, pageHeightCurrent - 14, { align: "center" });

      doc.setTextColor(148, 163, 184);
      doc.setFontSize(8);
      doc.text(`Page ${page} of ${totalPages}`, pageWidthCurrent - 40, pageHeightCurrent - 14, {
        align: "right",
      });
    }

    doc.save("BPIS_District_Comparison.pdf");
  };

  const numericMetrics = useMemo(() => {
    const metricSet = new Set();

    data.forEach((district) => {
      Object.entries(district).forEach(([key, value]) => {
        if (typeof value === "number" && Number.isFinite(value) && !excludedMetrics.has(key)) {
          metricSet.add(key);
        }
      });
    });

    return Array.from(metricSet).sort((a, b) => {
      const aIndex = preferredMetricOrder.indexOf(a);
      const bIndex = preferredMetricOrder.indexOf(b);

      if (aIndex !== -1 || bIndex !== -1) {
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      }

      return a.localeCompare(b);
    });
  }, [data]);

  const summaryStats = useMemo(() => {
    if (!selectedRecords.length) {
      return null;
    }

    const literacyValues = selectedRecords.map((district) => Number(district.literacy_rate || 0));
    const priorityValues = selectedRecords.map((district) => Number(district.priority_score || 0));
    const populationValues = selectedRecords.map((district) => Number(district.population || 0));

    return {
      avgLiteracy: literacyValues.reduce((sum, value) => sum + value, 0) / literacyValues.length,
      avgPriority: priorityValues.reduce((sum, value) => sum + value, 0) / priorityValues.length,
      maxPopulation: Math.max(...populationValues),
      selectedCount: selectedRecords.length,
    };
  }, [selectedRecords]);

  const commonSchemes = useMemo(() => {
    if (!selectedDistricts.length || !Object.keys(recommendations).length) {
      return [];
    }

    const recommendationLists = selectedDistricts.map(
      (district) => recommendations[district]?.recommended_schemes || [],
    );

    if (!recommendationLists.length || recommendationLists.some((list) => list.length === 0)) {
      return [];
    }

    return recommendationLists.reduce((shared, list) =>
      shared.filter((scheme) => list.includes(scheme)),
    );
  }, [recommendations, selectedDistricts]);

  const allSchemes = useMemo(() => {
    const merged = new Set();
    selectedDistricts.forEach((district) => {
      (recommendations[district]?.recommended_schemes || []).forEach((scheme) => merged.add(scheme));
    });
    return Array.from(merged);
  }, [recommendations, selectedDistricts]);

  const removeDistrict = (districtName) => {
    setSelectedDistricts((current) => current.filter((district) => district !== districtName));
  };

  const addDistrict = (districtName) => {
    setSelectedDistricts((current) => {
      if (current.includes(districtName)) {
        return current;
      }
      return [...current, districtName];
    });
  };

  if (!data.length) {
    return null;
  }

  return (
    <div className="gov-card" style={{ background: "white", marginBottom: "32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", marginBottom: "20px" }}>
        <div>
          <h2 className="gov-heading" style={{ margin: 0, fontSize: "1.5rem" }}>
            {t("districtCompareTitle")}
          </h2>
          <p style={{ margin: "8px 0 0 0", color: "#64748b" }}>
            {ui.compareIntro}
          </p>
        </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#ea580c", fontWeight: 700 }}>
          <BarChart3 size={18} />
          {labels.multiCompare}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
        <button
          type="button"
          onClick={handleExportPdf}
          disabled={!selectedRecords.length}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            border: "none",
            borderRadius: "12px",
            padding: "12px 16px",
            background: selectedRecords.length ? "#ea580c" : "#cbd5e1",
            color: "white",
            fontWeight: 800,
            cursor: selectedRecords.length ? "pointer" : "not-allowed",
            boxShadow: selectedRecords.length ? "0 10px 24px rgba(234, 88, 12, 0.2)" : "none",
          }}
        >
          <FileText size={18} />
          {t("exportPDF") || "Export PDF"}
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "18px",
          padding: "14px 16px",
          borderRadius: "14px",
          border: "1px solid #e2e8f0",
          background: "#f8fafc",
        }}
      >
        {numericMetrics.slice(0, 6).map((metric) => (
          <div
            key={metric}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.88rem",
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "999px",
                background: metricColorMap[metric] || "#ea580c",
                display: "inline-block",
              }}
            />
            {getMetricLabel(metric)}
          </div>
        ))}
      </div>

      <div style={{ marginBottom: "18px" }}>
        <DistrictPicker data={data} selectedDistricts={selectedDistricts} onAdd={addDistrict} t={t} />
      </div>

      {selectedDistricts.length ? (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
            {selectedDistricts.map((districtName) => (
              <div
                key={districtName}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 12px",
                  borderRadius: "999px",
                  background: "#fff7ed",
                  border: "1px solid #fdba74",
                  color: "#9a3412",
                  fontWeight: 700,
                }}
              >
                {localizeDistrictName(t, districtName)}
                <button
                  type="button"
                  onClick={() => removeDistrict(districtName)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#9a3412",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    padding: 0,
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setSelectedDistricts([])}
              style={{
                border: "1px solid #cbd5e1",
                background: "white",
                color: "#0f172a",
                padding: "8px 12px",
                borderRadius: "999px",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              {ui.clearAll}
            </button>
          </div>

          {summaryStats && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "14px",
                marginBottom: "24px",
              }}
            >
              <div style={summaryCardStyle}>
                <div style={summaryLabelStyle}>{ui.districtsSelected}</div>
                <div style={summaryValueStyle}>{summaryStats.selectedCount}</div>
              </div>
              <div style={summaryCardStyle}>
                <div style={summaryLabelStyle}>{ui.averageLiteracy}</div>
                <div style={summaryValueStyle}>{summaryStats.avgLiteracy.toFixed(2)}%</div>
              </div>
              <div style={summaryCardStyle}>
                <div style={summaryLabelStyle}>{ui.averagePriority}</div>
                <div style={summaryValueStyle}>{summaryStats.avgPriority.toFixed(2)}</div>
              </div>
              <div style={summaryCardStyle}>
                <div style={summaryLabelStyle}>{ui.highestPopulation}</div>
                <div style={summaryValueStyle}>{summaryStats.maxPopulation.toLocaleString("en-IN")}</div>
              </div>
            </div>
          )}

          <div style={{ overflowX: "auto", marginBottom: "28px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", textAlign: "left" }}>
                  <th style={tableHeaderStyle}>{ui.metric}</th>
                  {selectedRecords.map((district) => (
                    <th key={district.district} style={tableHeaderStyle}>
                      {localizeDistrictName(t, district.district)}
                    </th>
                  ))}
                  <th style={tableHeaderStyle}>{ui.range}</th>
                </tr>
              </thead>
              <tbody>
                {numericMetrics.map((metric) => {
                  const metricValues = selectedRecords.map((district) => Number(district[metric] || 0));
                  const minValue = Math.min(...metricValues);
                  const maxValue = Math.max(...metricValues);
                  const rangeText = `${formatValue(metric, minValue)} - ${formatValue(metric, maxValue)}`;

                  return (
                    <tr key={metric}>
                      <td style={tableMetricStyle}>{getMetricLabel(metric)}</td>
                      {selectedRecords.map((district) => {
                        const value = Number(district[metric] || 0);
                        const denominator = maxValue - minValue || 1;
                        const percent = ((value - minValue) / denominator) * 100;

                        return (
                          <td key={`${metric}-${district.district}`} style={tableCellStyle}>
                            <div style={{ fontWeight: 800, color: "#0f172a" }}>{formatValue(metric, value)}</div>
                        <div style={barTrackStyle}>
                          <div
                            style={{
                                  ...barFillStyle,
                                  background: metricColorMap[metric] || "#ea580c",
                                  width: `${Math.max(percent, 8)}%`,
                                }}
                              />
                            </div>
                          </td>
                        );
                      })}
                      <td style={tableCellStyle}>{rangeText}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            {selectedRecords.map((district) => {
              const rec = recommendations[district.district];
              const schemes = rec?.recommended_schemes || [];
              const issueDetails = rec?.issue_details || [];
              const schemeExplanations = rec?.scheme_explanations || {};

              return (
                <div key={district.district} style={districtCardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div>
                      <div style={districtNameStyle}>{localizeDistrictName(t, district.district)}</div>
                      <div style={districtSubtleStyle}>{getLocalizedStateName(t, district.state, language)}</div>
                    </div>
                    <div style={districtScoreStyle}>
                      {Number(district.priority_score || 0).toFixed(2)}
                    </div>
                  </div>

                  <div style={{ display: "grid", gap: "8px", marginBottom: "16px" }}>
                    <div><strong>{ui.population}:</strong> {Number(district.population || 0).toLocaleString("en-IN")}</div>
                    <div><strong>{ui.literacy}:</strong> {Number(district.literacy_rate || 0).toFixed(2)}%</div>
                    <div><strong>{ui.genderRatio}:</strong> {Number(district.gender_ratio || 0).toFixed(0)}</div>
                  </div>

                  <div style={sectionLabelStyle}>
                    <Sparkles size={16} />
                    {labels.schemeRecommendations}
                  </div>
                  <div style={{ display: "grid", gap: "10px", marginBottom: "16px" }}>
                    {schemes.length > 0 ? (
                      schemes.map((scheme) => (
                        <div key={scheme} style={schemeItemStyle}>
                          <div style={{ fontWeight: 800, color: "#0f172a" }}>{scheme}</div>
                          <div style={{ color: "#475569", lineHeight: 1.6 }}>
                            {(schemeExplanations[scheme] || [ui.ruleMatched]).join(" ")}
                          </div>
                        </div>
                      ))
                    ) : (
      <div style={emptyStateStyle}>{labels.noScheme || (language === "hi" ? "कोई योजना अनुशंसित नहीं है।" : "No scheme recommendation found.")}</div>
                    )}
                  </div>

                  <div style={sectionLabelStyle}>
                    <Sparkles size={16} />
                    {labels.triggerReasons}
                  </div>
                  <div style={{ display: "grid", gap: "10px" }}>
                    {issueDetails.length > 0 ? (
                      issueDetails.map((issue) => (
                        <div key={issue.issue} style={issueItemStyle}>
                          <div style={{ fontWeight: 800, color: "#0f172a" }}>{issue.issue.replaceAll("_", " ")}</div>
                          <div style={{ color: "#475569", lineHeight: 1.6 }}>{issue.reason}</div>
                        </div>
                      ))
                    ) : (
      <div style={emptyStateStyle}>{labels.noSchemes || (language === "hi" ? "चयनित जिले के लिए कोई योजना अनुशंसित नहीं है।" : "No schemes recommended for the current selection.")}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "12px" }}>
            <div style={overviewCardStyle}>
              <div style={sectionLabelStyle}>
                <BarChart3 size={16} />
                {labels.schemeOverlap}
              </div>
              {commonSchemes.length > 0 ? (
                <div style={{ display: "grid", gap: "8px" }}>
                  {commonSchemes.map((scheme) => (
                    <div key={scheme} style={overlapTagStyle}>
                      {scheme}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={emptyStateStyle}>{labels.noCommonYet}</div>
              )}
            </div>

            <div style={overviewCardStyle}>
              <div style={sectionLabelStyle}>
                <Sparkles size={16} />
                {labels.allRecommendedSchemes}
              </div>
              {allSchemes.length > 0 ? (
                <div style={{ display: "grid", gap: "8px" }}>
                  {allSchemes.map((scheme) => (
                    <div key={scheme} style={overlapTagStyle}>
                      {scheme}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={emptyStateStyle}>{labels.noSchemes}</div>
              )}
            </div>
          </div>

          {loadingRecommendations && (
            <div style={{ marginTop: "14px", color: "#64748b" }}>
              {labels.loading}
            </div>
          )}
        </>
      ) : (
        <div style={emptyStateContainerStyle}>
          <h3 style={{ margin: "0 0 8px 0", color: "#0f172a" }}>{labels.addDistricts}</h3>
          <p style={{ margin: 0, color: "#64748b" }}>
            Search from the full district list, add as many districts as you want, and BPIS will compare every numeric metric plus scheme recommendations.
          </p>
        </div>
      )}
    </div>
  );
}

const summaryCardStyle = {
  background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
  border: "1px solid #e2e8f0",
  borderRadius: "18px",
  padding: "18px",
};

const summaryLabelStyle = {
  color: "#64748b",
  fontSize: "0.85rem",
  marginBottom: "8px",
};

const summaryValueStyle = {
  color: "#0f172a",
  fontSize: "1.6rem",
  fontWeight: 900,
};

const tableHeaderStyle = {
  padding: "14px",
  borderBottom: "1px solid #e2e8f0",
  color: "#334155",
  fontWeight: 800,
};

const tableMetricStyle = {
  padding: "14px",
  borderBottom: "1px solid #eef2f7",
  color: "#0f172a",
  fontWeight: 800,
  minWidth: "220px",
};

const tableCellStyle = {
  padding: "14px",
  borderBottom: "1px solid #eef2f7",
  verticalAlign: "top",
  minWidth: "180px",
};

const barTrackStyle = {
  marginTop: "8px",
  height: "8px",
  width: "100%",
  background: "#e2e8f0",
  borderRadius: "999px",
  overflow: "hidden",
};

const barFillStyle = {
  height: "100%",
  background: "linear-gradient(90deg, #ea580c 0%, #f97316 100%)",
  borderRadius: "999px",
};

const districtCardStyle = {
  borderRadius: "18px",
  border: "1px solid #e2e8f0",
  padding: "18px",
  background: "#ffffff",
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
};

const districtNameStyle = {
  fontSize: "1.15rem",
  fontWeight: 900,
  color: "#0f172a",
};

const districtSubtleStyle = {
  color: "#64748b",
  marginTop: "4px",
  textTransform: "capitalize",
};

const districtScoreStyle = {
  background: "#0f172a",
  color: "white",
  fontWeight: 900,
  borderRadius: "999px",
  padding: "8px 12px",
  whiteSpace: "nowrap",
};

const sectionLabelStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  color: "#ea580c",
  fontWeight: 800,
  marginBottom: "10px",
};

const schemeItemStyle = {
  borderRadius: "14px",
  border: "1px solid #e2e8f0",
  padding: "12px 14px",
  background: "#f8fafc",
};

const issueItemStyle = {
  borderRadius: "14px",
  border: "1px solid #fde68a",
  padding: "12px 14px",
  background: "#fffbeb",
};

const emptyStateStyle = {
  color: "#64748b",
  borderRadius: "14px",
  border: "1px dashed #cbd5e1",
  padding: "14px",
  background: "white",
};

const overviewCardStyle = {
  borderRadius: "18px",
  border: "1px solid #e2e8f0",
  padding: "18px",
  background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
};

const overlapTagStyle = {
  display: "inline-flex",
  alignItems: "center",
  borderRadius: "999px",
  padding: "8px 12px",
  background: "#fff7ed",
  color: "#9a3412",
  fontWeight: 800,
  border: "1px solid #fdba74",
};

const emptyStateContainerStyle = {
  padding: "40px",
  border: "2px dashed #cbd5e1",
  borderRadius: "18px",
  textAlign: "center",
  background: "#f8fafc",
};

export default DistrictCompare;



