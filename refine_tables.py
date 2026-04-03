import json
import os

print("Starting table refinement script...")

# 1. Update translations.json
translations_file = r"d:\BPIS_2026\frontend\dashboard\src\translations.json"
with open(translations_file, "r", encoding="utf-8") as f:
    t_data = json.load(f)

# Add keys if missing
if "state" not in t_data["en"]:
    t_data["en"]["state"] = "State"
    t_data["hi"]["state"] = "राज्य"

t_data["en"]["stateNameMap"] = {
    "jammu and kashmir": "Jammu and Kashmir",
    "maharashtra": "Maharashtra",
    "west bengal": "West Bengal",
    "karnataka": "Karnataka",
    "bihar": "Bihar",
    "rajasthan": "Rajasthan",
    "gujarat": "Gujarat",
    "uttar pradesh": "Uttar Pradesh"
}

t_data["hi"]["stateNameMap"] = {
    "jammu and kashmir": "जम्मू और कश्मीर",
    "maharashtra": "महाराष्ट्र",
    "west bengal": "पश्चिम बंगाल",
    "karnataka": "कर्नाटक",
    "bihar": "बिहार",
    "rajasthan": "राजस्थान",
    "gujarat": "गुजरात",
    "uttar pradesh": "उत्तर प्रदेश"
}

with open(translations_file, "w", encoding="utf-8") as f:
    json.dump(t_data, f, indent=2, ensure_ascii=False)


# 2. Rebuild DistrictTable.js
dt_file = r"d:\BPIS_2026\frontend\dashboard\src\components\DistrictTable.js"
with open(dt_file, "r", encoding="utf-8") as f:
    dt = f.read()

# Replace the entire render logic for safety.
dt_new_jsx = """
  return (
    <div style={{ background:"white", padding:"24px", borderRadius:"12px", marginTop:"20px", boxShadow:"0 4px 12px rgba(0,0,0,0.05)", overflow:"hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize:"0.95rem" }}>
        <thead>
          <tr style={{ background:"#f1f5f9", textAlign:"left", borderBottom:"2px solid #cbd5e1", color:"#334155", textTransform:"uppercase", fontSize:"0.85rem", letterSpacing:"0.5px" }}>
            <th style={{ padding:"16px" }}>{t('district')}</th>
            <th style={{ padding:"16px" }}>{t('state')}</th>
            <th style={{ padding:"16px" }}>{t('population')}</th>
            <th style={{ padding:"16px", width:"200px" }}>{t('literacy')}</th>
          </tr>
        </thead>
        <tbody>
          {districts.slice(0, 5).map((d, index) => (
            <tr key={index} style={{ background: index % 2 === 0 ? "#ffffff" : "#f8fafc", borderBottom:"1px solid #e2e8f0", transition:"background-color 0.2s" }} onMouseOver={e=>e.currentTarget.style.backgroundColor="#f1f5f9"} onMouseOut={e=>e.currentTarget.style.backgroundColor=index % 2 === 0 ? "#ffffff" : "#f8fafc"}>
              <td style={{ padding:"16px", fontWeight:"600", color:"#0f172a", textTransform: 'capitalize' }}>{(t("districtNameMap") && t("districtNameMap")[d.district?.toLowerCase()]) || d.district}</td>
              <td style={{ padding:"16px", color:"#475569", textTransform: 'capitalize' }}>{(t("stateNameMap") && t("stateNameMap")[d.state?.toLowerCase()]) || d.state}</td>
              <td style={{ padding:"16px", color:"#475569", fontWeight:"500" }}>{d.population?.toLocaleString('en-IN')}</td>
              <td style={{ padding:"16px", color:"#0f172a", fontWeight:"600" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                  <span style={{ minWidth:"45px" }}>{d.literacy_rate.toFixed(1)}%</span>
                  <div style={{ flex:1, height:"8px", background:"#e2e8f0", borderRadius:"4px", overflow:"hidden" }}>
                    <div style={{ width: `${d.literacy_rate}%`, height:"100%", background:"linear-gradient(90deg, #3b82f6 0%, #10b981 100%)", borderRadius:"4px", transition:"width 1s ease-in-out" }}></div>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
"""
import re
dt = re.sub(r'return \(\s*<div.*?\);\s*}', dt_new_jsx + '\n}', dt, flags=re.DOTALL)
dt = dt.replace("<h3 style={{ marginTop: \"40px\" }}>District Data</h3>", "")

with open(dt_file, "w", encoding="utf-8") as f:
    f.write(dt)


# 3. Rebuild PriorityTable.js
pt_file = r"d:\BPIS_2026\frontend\dashboard\src\components\PriorityTable.js"
with open(pt_file, "r", encoding="utf-8") as f:
    pt = f.read()

pt_new_jsx = """
  return (
    <div style={{ background:"white", padding:"24px", borderRadius:"12px", marginTop:"20px", boxShadow:"0 4px 12px rgba(0,0,0,0.05)", overflow:"hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize:"0.95rem" }}>
        <thead>
          <tr style={{ background:"#f1f5f9", textAlign:"left", borderBottom:"2px solid #cbd5e1", color:"#334155", textTransform:"uppercase", fontSize:"0.85rem", letterSpacing:"0.5px" }}>
            <th style={{ padding:"16px" }}>{t('district')}</th>
            <th style={{ padding:"16px" }}>{t('state')}</th>
            <th style={{ padding:"16px" }}>{t('priorityScore')}</th>
          </tr>
        </thead>
        <tbody>
          {districts.slice(0, 5).map((d, index) => (
            <tr key={index} style={{ background: index % 2 === 0 ? "#ffffff" : "#f8fafc", borderBottom:"1px solid #e2e8f0", transition:"background-color 0.2s" }} onMouseOver={e=>e.currentTarget.style.backgroundColor="#fef2f2"} onMouseOut={e=>e.currentTarget.style.backgroundColor=index % 2 === 0 ? "#ffffff" : "#f8fafc"}>
              <td style={{ padding:"16px", fontWeight:"600", color:"#0f172a", textTransform: 'capitalize' }}>{(t("districtNameMap") && t("districtNameMap")[d.district?.toLowerCase()]) || d.district}</td>
              <td style={{ padding:"16px", color:"#475569", textTransform: 'capitalize' }}>{(t("stateNameMap") && t("stateNameMap")[d.state?.toLowerCase()]) || d.state}</td>
              <td style={{ padding:"16px", color:"#dc2626", fontWeight:"700" }}>{d.priority_score.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
"""

pt = re.sub(r'return \(\s*<div.*?\);\s*}', pt_new_jsx + '\n}', pt, flags=re.DOTALL)

with open(pt_file, "w", encoding="utf-8") as f:
    f.write(pt)

print("Tables refined successfully!")
