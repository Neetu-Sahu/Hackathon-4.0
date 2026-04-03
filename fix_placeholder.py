import json

print("Fixing search placeholder...")

t_file = r"d:\BPIS_2026\frontend\dashboard\src\translations.json"
with open(t_file, "r", encoding="utf-8") as f:
    t_data = json.load(f)

t_data["en"]["searchDistrictPlaceholder"] = "Search for a district..."
t_data["hi"]["searchDistrictPlaceholder"] = "एक जिला खोजें..."

with open(t_file, "w", encoding="utf-8") as f:
    json.dump(t_data, f, indent=2, ensure_ascii=False)

dc_file = r"d:\BPIS_2026\frontend\dashboard\src\components\DistrictCompare.js"
with open(dc_file, "r", encoding="utf-8") as f:
    dc = f.read()

dc = dc.replace('placeholder={selectedValue || "Search for a district..."}', 'placeholder={selectedValue || t("searchDistrictPlaceholder")}')

with open(dc_file, "w", encoding="utf-8") as f:
    f.write(dc)

print("Placeholder fixed!")
