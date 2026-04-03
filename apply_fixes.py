import json
import os

# 1. Update translations.json
translations_file = r"d:\BPIS_2026\frontend\dashboard\src\translations.json"
with open(translations_file, "r", encoding="utf-8") as f:
    t_data = json.load(f)

en = t_data["en"]
hi = t_data["hi"]

en.update({
    "lowLiteracyDistricts": "Low Literacy Districts",
    "highestRiskDistrict": "Highest Risk District",
    "averageLiteracy": "Average Literacy",
    "recommendedDistricts": "Recommended Districts",
    "supportingData": "Supporting Data",
    "recommendedAction": "Recommended Action",
    "reason": "Reason",
    "beforeSimulation": "Before Simulation (Current High Priority)",
    "recommendedSchemes": "Recommended Schemes (District-wise)",
    "impactAnalysis": "Impact Analysis: Priority Score Reduction",
    "askPolicyQuestion": "Ask policy question...",
    "ask": "Ask",
    "runSimulation": "Run Simulation",
    "increaseFunding": "Increase Funding (%):",
    "beforeVsAfter": "Before vs After Policy Impact",
    "district": "District",
    "literacy": "Literacy",
    "population": "Population",
    "priorityScore": "Priority Score",
    "before": "Before",
    "after": "After",
    "currentPriority": "Current Priority",
    "postIntervention": "Post-Intervention"
})

hi.update({
    "lowLiteracyDistricts": "कम साक्षरता वाले जिले",
    "highestRiskDistrict": "उच्चतम जोखिम वाला जिला",
    "averageLiteracy": "औसत साक्षरता",
    "recommendedDistricts": "अनुशंसित जिले",
    "supportingData": "समर्थन डेटा",
    "recommendedAction": "अनुशंसित कार्रवाई",
    "reason": "कारण",
    "beforeSimulation": "सिमुलेशन से पहले (वर्तमान उच्च प्राथमिकता)",
    "recommendedSchemes": "अनुशंसित योजनाएं (जिलेवार)",
    "impactAnalysis": "प्रभाव विश्लेषण: प्राथमिकता स्कोर में कमी",
    "askPolicyQuestion": "नीतिगत प्रश्न पूछें...",
    "ask": "पूछें",
    "runSimulation": "सिमुलेशन चलाएँ",
    "increaseFunding": "वित्तपोषण बढ़ाएँ (%):",
    "beforeVsAfter": "नीति प्रभाव: पहले बनाम बाद",
    "district": "जिला",
    "literacy": "साक्षरता",
    "population": "जनसंख्या",
    "priorityScore": "प्राथमिकता स्कोर",
    "before": "पहले",
    "after": "बाद में",
    "currentPriority": "वर्तमान प्राथमिकता",
    "postIntervention": "हस्तक्षेप के बाद"
})

with open(translations_file, "w", encoding="utf-8") as f:
    json.dump(t_data, f, indent=2, ensure_ascii=False)


# 2. Update DistrictCompare.js
dc_file = r"d:\BPIS_2026\frontend\dashboard\src\components\DistrictCompare.js"
with open(dc_file, "r", encoding="utf-8") as f:
    content = f.read()

auto_table_old = """    autoTable(doc, {
      startY: 56,
      head: [[t("districtName"), t("totalPopulation"), t("literacyRate")]],
      body: [
        [
          selectedData.district, 
          selectedData.population?.toLocaleString() || 'N/A', 
          selectedData.literacy_rate?.toFixed(2) || 'N/A'
        ]
      ],
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: 255 },
      styles: { 
          font: language === 'hi' ? 'NotoSansDevanagari' : 'helvetica', 
          fontSize: 11, 
          cellPadding: 6 
      },
      margin: { left: 20, right: 20 }
    });"""

auto_table_new = """    autoTable(doc, {
      startY: 56,
      head: [[t("districtName"), t("totalPopulation"), t("literacyRate")]],
      body: [
        [
          selectedData.district, 
          selectedData.population?.toLocaleString() || 'N/A', 
          selectedData.literacy_rate?.toFixed(2) || 'N/A'
        ]
      ],
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'normal' },
      styles: { 
          font: language === 'hi' ? 'NotoSansDevanagari' : 'helvetica', 
          fontStyle: 'normal',
          fontSize: 11, 
          cellPadding: 6 
      },
      margin: { left: 20, right: 20 }
    });"""

if auto_table_old in content:
    content = content.replace(auto_table_old, auto_table_new)
else:
    print("Could not find autoTable original block.")

content = content.replace("margin={{ top: 20, right: 30, left: 20, bottom: 5 }}", "margin={{ top: 20, right: 40, left: 20, bottom: 30 }}")
content = content.replace("<Legend />", "<Legend wrapperStyle={{ paddingTop: '20px' }} />")

with open(dc_file, "w", encoding="utf-8") as f:
    f.write(content)

# 3. Update SummaryCards.js
sc_file = r"d:\BPIS_2026\frontend\dashboard\src\components\SummaryCards.js"
with open(sc_file, "r", encoding="utf-8") as f:
    sc_content = f.read()

sc_content = sc_content.replace(
    "import { useEffect, useState } from \"react\";",
    "import { useEffect, useState } from \"react\";\nimport { useLanguage } from '../contexts/LanguageContext';"
)
sc_content = sc_content.replace(
    "function SummaryCards() {",
    "function SummaryCards() {\n  const { t } = useLanguage();"
)
sc_content = sc_content.replace("<h4>Low Literacy Districts</h4>", "<h4>{t('lowLiteracyDistricts')}</h4>")
sc_content = sc_content.replace("<h4>Highest Risk District</h4>", "<h4>{t('highestRiskDistrict')}</h4>")
sc_content = sc_content.replace("<h4>Average Literacy</h4>", "<h4>{t('averageLiteracy')}</h4>")

with open(sc_file, "w", encoding="utf-8") as f:
    f.write(sc_content)

# 4. Update AIPolicyAdvisor.js
ai_file = r"d:\BPIS_2026\frontend\dashboard\src\components\AIPolicyAdvisor.js"
with open(ai_file, "r", encoding="utf-8") as f:
    ai_content = f.read()

ai_content = ai_content.replace(
    "import React, { useState } from \"react\";",
    "import React, { useState } from \"react\";\nimport { useLanguage } from '../contexts/LanguageContext';"
)
ai_content = ai_content.replace(
    "const AIPolicyAdvisor = () => {",
    "const AIPolicyAdvisor = () => {\n  const { t } = useLanguage();"
)

replacements = {
    "<h2>AI Policy Advisor</h2>": "<h2>{t('aiPolicySimulation')}</h2>",
    "placeholder=\"Ask policy question...\"": "placeholder={t('askPolicyQuestion')}",
    "Increase Funding (%): ": "{t('increaseFunding')} ",
    "Run Simulation<": "{t('runSimulation')}<",
    ">Ask<": ">{t('ask')}<",
    "<h3>Before vs After Policy Impact</h3>": "<h3>{t('beforeVsAfter')}</h3>",
    "name=\"Before\"": "name={t('before')}",
    "name=\"After\"": "name={t('after')}",
    "<h3>Recommended Districts</h3>": "<h3>{t('recommendedDistricts')}</h3>",
    "<h4>Before Simulation (Current High Priority)</h4>": "<h4>{t('beforeSimulation')}</h4>",
    "<h3>Reason</h3>": "<h3>{t('reason')}</h3>",
    "<h3>Supporting Data</h3>": "<h3>{t('supportingData')}</h3>",
    "<th>District</th>": "<th>{t('district')}</th>",
    "<th>Literacy</th>": "<th>{t('literacy')}</th>",
    "<th>Population</th>": "<th>{t('population')}</th>",
    "<th>Priority Score</th>": "<th>{t('priorityScore')}</th>",
    "<h3>Recommended Action</h3>": "<h3>{t('recommendedAction')}</h3>",
    "<h3>Recommended Schemes (District-wise)</h3>": "<h3>{t('recommendedSchemes')}</h3>",
    "<h3>Impact Analysis: Priority Score Reduction</h3>": "<h3>{t('impactAnalysis')}</h3>",
    "name=\"Current Priority\"": "name={t('currentPriority')}",
    "name=\"Post-Intervention\"": "name={t('postIntervention')}"
}

for k, v in replacements.items():
    ai_content = ai_content.replace(k, v)

with open(ai_file, "w", encoding="utf-8") as f:
    f.write(ai_content)

print("Fixes applied successfully!")
