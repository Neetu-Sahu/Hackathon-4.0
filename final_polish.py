import json
import os

# 1. Update translations.json
translations_file = r"d:\BPIS_2026\frontend\dashboard\src\translations.json"
with open(translations_file, "r", encoding="utf-8") as f:
    t_data = json.load(f)

en = t_data["en"]
hi = t_data["hi"]

en.update({
    "searchDistrict": "Search District...",
    "showCriticalDistricts": "Show Critical Districts",
    "showAllDistricts": "Show All Districts",
    "priorityLegend": "Priority Legend",
    "lowPriority": "Low Priority",
    "mediumPriority": "Medium Priority",
    "highPriority": "High Priority",
    "These districts have low literacy rates, indicating need for education intervention.": "These districts have low literacy rates, indicating need for education intervention.",
    "Deploy education-focused schemes and improve school infrastructure.": "Deploy education-focused schemes and improve school infrastructure.",
    "Samagra Shiksha Abhiyan": "Samagra Shiksha Abhiyan",
    "Mid-Day Meal Scheme": "Mid-Day Meal Scheme",
    "School Infrastructure Expansion Program": "School Infrastructure Expansion Program",
    "High Priority Intervention Package": "High Priority Intervention Package",
    "Digital Literacy Mission": "Digital Literacy Mission",
    "literacy_insight_prefix": "Literacy in",
    "literacy_insight_suffix": "is",
    "literacy_insight_end": "%.",
    "below_national": "It sits {{gap}}% below the national target.",
    "above_national": "However, it exceeds national averages by {{gap}}%."
})

hi.update({
    "searchDistrict": "जिले की खोज करें...",
    "showCriticalDistricts": "गंभीर जिले दिखाएँ",
    "showAllDistricts": "सभी जिले दिखाएँ",
    "priorityLegend": "प्राथमिकता लेजेंड",
    "lowPriority": "कम प्राथमिकता",
    "mediumPriority": "मध्यम प्राथमिकता",
    "highPriority": "उच्च प्राथमिकता",
    "These districts have low literacy rates, indicating need for education intervention.": "इन जिलों में साक्षरता दर कम है, जो शिक्षा हस्तक्षेप की आवश्यकता का संकेत देता है।",
    "Deploy education-focused schemes and improve school infrastructure.": "शिक्षा-केंद्रित योजनाओं को तैनात करें और स्कूल के बुनियादी ढांचे में सुधार करें।",
    "Samagra Shiksha Abhiyan": "समग्र शिक्षा अभियान",
    "Mid-Day Meal Scheme": "मध्याह्न भोजन योजना",
    "School Infrastructure Expansion Program": "स्कूल बुनियादी ढांचा विस्तार कार्यक्रम",
    "High Priority Intervention Package": "उच्च प्राथमिकता हस्तक्षेप पैकेज",
    "Digital Literacy Mission": "डिजिटल साक्षरता मिशन",
    "literacy_insight_prefix": "",
    "literacy_insight_suffix": "में साक्षरता",
    "literacy_insight_end": "% है।",
    "below_national": "यह राष्ट्रीय लक्ष्य से {{gap}}% नीचे है।",
    "above_national": "हालाँकि, यह राष्ट्रीय औसत से {{gap}}% अधिक है।"
})

with open(translations_file, "w", encoding="utf-8") as f:
    json.dump(t_data, f, indent=2, ensure_ascii=False)


# 2. Update DistrictCompare.js
dc_file = r"d:\BPIS_2026\frontend\dashboard\src\components\DistrictCompare.js"
with open(dc_file, "r", encoding="utf-8") as f:
    content = f.read()

# Fix PDF Table Missing Latin cell
auto_table_old = """    autoTable(doc, {
      startY: 56,"""
auto_table_new = """    autoTable(doc, {
      startY: 56,
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 0) {
          data.cell.styles.font = 'helvetica';
        }
      },"""
content = content.replace(auto_table_old, auto_table_new)

# Fix PDF Header
title_old = """    doc.text(`${t("districtProfile")}: ${selectedDistrictName}`, 20, 52);"""
title_new = """    doc.text(`${t("districtProfile")}: `, 20, 52);
    const titleWidth = doc.getTextWidth(`${t("districtProfile")}: `);
    doc.setFont('helvetica', 'bold');
    doc.text(selectedDistrictName.charAt(0).toUpperCase() + selectedDistrictName.slice(1), 20 + titleWidth, 52);"""
content = content.replace(title_old, title_new)

# Fix JSX AI Insight
insight_old = """                <strong>{t('policyGapIdentified')}</strong> Literacy in {selectedDistrictName} is {selectedData?.literacy_rate.toFixed(1)}%.
                {gap > 0 ? ` It sits ${Math.abs(gap).toFixed(1)}% below the national target.` : ` However, it exceeds national averages by ${Math.abs(gap).toFixed(1)}%.`}"""
insight_new = """                <strong>{t('policyGapIdentified')}</strong> {t('literacy_insight_prefix')} <span style={{textTransform: 'capitalize'}}>{selectedDistrictName}</span> {t('literacy_insight_suffix')} {selectedData?.literacy_rate.toFixed(1)}{t('literacy_insight_end')}
                {' '}{gap > 0 ? t('below_national').replace('{{gap}}', Math.abs(gap).toFixed(1)) : t('above_national').replace('{{gap}}', Math.abs(gap).toFixed(1))}"""
content = content.replace(insight_old, insight_new)

with open(dc_file, "w", encoding="utf-8") as f:
    f.write(content)


# 3. Update SummaryCards.js (Capitalize District Name)
sc_file = r"d:\BPIS_2026\frontend\dashboard\src\components\SummaryCards.js"
with open(sc_file, "r", encoding="utf-8") as f:
    sc = f.read()
sc = sc.replace("<p style={numberStyle}>{stats.highestRisk}</p>", "<p style={{...numberStyle, textTransform: 'capitalize'}}>{stats.highestRisk}</p>")
with open(sc_file, "w", encoding="utf-8") as f:
    f.write(sc)


# 4. Update AIPolicyAdvisor.js
ai_file = r"d:\BPIS_2026\frontend\dashboard\src\components\AIPolicyAdvisor.js"
with open(ai_file, "r", encoding="utf-8") as f:
    ai = f.read()
ai = ai.replace("borderRadius: \"5px\",", "borderRadius: \"5px\", textTransform: \"capitalize\",")
ai = ai.replace("<p>{result.reason}</p>", "<p>{t(result.reason)}</p>")
ai = ai.replace("<p>{result.action}</p>", "<p>{t(result.action)}</p>")
ai = ai.replace("<li key={j}>{s}</li>", "<li key={j}>{t(s)}</li>")
with open(ai_file, "w", encoding="utf-8") as f:
    f.write(ai)


# 5. Update MapView.js
map_file = r"d:\BPIS_2026\frontend\dashboard\src\components\MapView.js"
with open(map_file, "r", encoding="utf-8") as f:
    mapv = f.read()
mapv = mapv.replace("import DistrictSearch from \"./DistrictSearch\";", "import DistrictSearch from \"./DistrictSearch\";\nimport { useLanguage } from '../contexts/LanguageContext';")
mapv = mapv.replace("function MapView() {", "function MapView() {\n  const { t } = useLanguage();")
mapv = mapv.replace("onSelect={(name) => setSelectedDistrict(name)}", "onSelect={(name) => setSelectedDistrict(name)}\n        placeholder={t('searchDistrict')}")
mapv = mapv.replace("{showHighPriority ? \"Show All Districts\" : \"Show Critical Districts\"}", "{showHighPriority ? t('showAllDistricts') : t('showCriticalDistricts')}")
with open(map_file, "w", encoding="utf-8") as f:
    f.write(mapv)


# 6. Update DistrictSearch.js
ds_file = r"d:\BPIS_2026\frontend\dashboard\src\components\DistrictSearch.js"
with open(ds_file, "r", encoding="utf-8") as f:
    ds = f.read()
ds = ds.replace("function DistrictSearch({ districts, onSelect }) {", "function DistrictSearch({ districts, onSelect, placeholder }) {")
ds = ds.replace("placeholder=\"Search District...\"", "placeholder={placeholder || \"Search District...\"}")
with open(ds_file, "w", encoding="utf-8") as f:
    f.write(ds)


# 7. Update Legend.js
leg_file = r"d:\BPIS_2026\frontend\dashboard\src\components\Legend.js"
with open(leg_file, "r", encoding="utf-8") as f:
    leg = f.read()
leg = leg.replace("function Legend(){", "import { useLanguage } from '../contexts/LanguageContext';\nfunction Legend(){\n  const { t } = useLanguage();")
leg = leg.replace("<b>Priority Legend</b>", "<b>{t('priorityLegend')}</b>")
leg = leg.replace(" Low Priority", " {t('lowPriority')}")
leg = leg.replace(" Medium Priority", " {t('mediumPriority')}")
leg = leg.replace(" High Priority", " {t('highPriority')}")
with open(leg_file, "w", encoding="utf-8") as f:
    f.write(leg)


print("Final Polish Items Script Execution Successful!")
