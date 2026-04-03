import json

t_file = r"d:\BPIS_2026\frontend\dashboard\src\translations.json"
with open(t_file, "r", encoding="utf-8") as f:
    t_data = json.load(f)

t_data["en"]["exportPDFBtn"] = "Export PDF"
t_data["hi"]["exportPDFBtn"] = "पीडीएफ निर्यात करें"

with open(t_file, "w", encoding="utf-8") as f:
    json.dump(t_data, f, indent=2, ensure_ascii=False)

print("Added exportPDFBtn successfully!")
