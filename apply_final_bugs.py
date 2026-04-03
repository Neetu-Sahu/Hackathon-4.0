import json
import os
import re

print("Running final bug fixes...")

# 1. translations.json - Add brand and fix empty string fallback
t_file = r"d:\BPIS_2026\frontend\dashboard\src\translations.json"
with open(t_file, "r", encoding="utf-8") as f:
    t_data = json.load(f)

t_data["en"]["brand"] = "BPIS Portal"
t_data["hi"]["brand"] = "बीपीआईएस पोर्टल"

# Fix empty string returning key issue
t_data["hi"]["literacy_insight_prefix"] = " " 

with open(t_file, "w", encoding="utf-8") as f:
    json.dump(t_data, f, indent=2, ensure_ascii=False)


# 2. Sidebar.js - Translate 'BPIS Portal'
side_file = r"d:\BPIS_2026\frontend\dashboard\src\components\Sidebar.js"
with open(side_file, "r", encoding="utf-8") as f:
    side = f.read()

side = side.replace("<h2>BPIS Portal</h2>", "<h2>{t('brand')}</h2>")
with open(side_file, "w", encoding="utf-8") as f:
    f.write(side)


# 3. SummaryCards.js - Wrap district name
sum_file = r"d:\BPIS_2026\frontend\dashboard\src\components\SummaryCards.js"
with open(sum_file, "r", encoding="utf-8") as f:
    sumc = f.read()

sum_rep = "<p style={{...numberStyle, textTransform: 'capitalize'}}>{(t('districtNameMap') && stats.highestRisk && t('districtNameMap')[stats.highestRisk.toLowerCase()]) || stats.highestRisk}</p>"
sumc = re.sub(r"<p style={{...numberStyle, textTransform: 'capitalize'}}>[^<]+</p>", sum_rep, sumc)

with open(sum_file, "w", encoding="utf-8") as f:
    f.write(sumc)


# 4. DistrictCompare.js - Fix quote injection and PDF font issue
dc_file = r"d:\BPIS_2026\frontend\dashboard\src\components\DistrictCompare.js"
with open(dc_file, "r", encoding="utf-8") as f:
    dc = f.read()

# Fix literal string bug
dc = dc.replace('"{t(\'prioritizeSarvaShiksha\')}"', "t('prioritizeSarvaShiksha')")
dc = dc.replace('"{t(\'focusInfrastructure\')}"', "t('focusInfrastructure')")

# Fix PDF Header
# User says: "Ensure doc.setFont('NotoSansDevanagari') is called immediately before writing that specific line."
pdf_title_old_1 = """    const pDName = getDistrictName(selectedDistrictName);
    if (/[a-zA-Z]/.test(pDName)) {
        doc.setFont('helvetica', 'bold');
    }
    doc.text(pDName, 20 + titleWidth, 52);"""

pdf_title_new_1 = """    const pDName = getDistrictName(selectedDistrictName);
    if (/[a-zA-Z]/.test(pDName)) {
        doc.setFont('helvetica', 'bold');
    } else {
        if (language === 'hi') {
            doc.setFont('NotoSansDevanagari', 'normal');
        }
    }
    doc.text(pDName, 20 + titleWidth, 52);"""
    
dc = dc.replace(pdf_title_old_1, pdf_title_new_1)

with open(dc_file, "w", encoding="utf-8") as f:
    f.write(dc)


# Check Insights.js just in case it's missing something?
# No, user asked about DistrictCompare Insights and Overview page High risk district

print("Patches completed successfully.")
