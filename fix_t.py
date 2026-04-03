import os
import re

files = [
    r"d:\BPIS_2026\frontend\dashboard\src\components\Charts.js", 
    r"d:\BPIS_2026\frontend\dashboard\src\components\PopulationChart.js",
    r"d:\BPIS_2026\frontend\dashboard\src\components\DistrictTable.js",
    r"d:\BPIS_2026\frontend\dashboard\src\components\PriorityTable.js"
]

tick_formatter = """<XAxis dataKey="district" tickFormatter={(val) => { const nameMap = t('districtNameMap'); const mapped = (nameMap && nameMap[val?.toLowerCase()]) ? nameMap[val.toLowerCase()] : val; return mapped?.charAt(0).toUpperCase() + mapped?.slice(1); }} />"""

for target in files:
    if os.path.exists(target):
        with open(target, "r", encoding="utf-8") as f:
            t_content = f.read()
            
        # Ensure import exists
        if "useLanguage" not in t_content:
            t_content = "import { useLanguage } from '../contexts/LanguageContext';\n" + t_content
            
        # Ensure hook exists inside function
        if "const { t } = useLanguage();" not in t_content:
            t_content = re.sub(r'(function\s+[A-Za-z]+\s*\([^)]*\)\s*{)', r'\1\n  const { t } = useLanguage();\n', t_content)
            
        # Fix XAxis for Charts.js specifically
        if "XAxis" in t_content and "tickFormatter" not in t_content:
             t_content = re.sub(r'<XAxis\s+dataKey="district"\s*/>', tick_formatter, t_content, flags=re.MULTILINE)
             t_content = re.sub(r'<XAxis\s*\n\s*dataKey="district"\s*\n\s*/>', tick_formatter, t_content, flags=re.MULTILINE)

        with open(target, "w", encoding="utf-8") as f:
            f.write(t_content)

print("Fixed 't is not defined' issue!")
