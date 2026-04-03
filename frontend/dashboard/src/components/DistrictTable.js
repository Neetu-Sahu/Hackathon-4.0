import { useLanguage } from '../contexts/LanguageContext';
import { useEffect, useState } from "react";
import { getDistricts } from "../services/api";
import { getLocalizedDistrictName, getLocalizedStateName } from "../utils/districtLocalization";

function DistrictTable() {
  const { t, language } = useLanguage();

  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getDistricts();
      setDistricts(data);
    };

    fetchData();
  }, []);

  
  return (
    <div style={{ background:"rgba(255,255,255,0.95)", padding:"24px", borderRadius:"20px", marginTop:"20px", boxShadow:"0 18px 40px rgba(15,23,42,0.08)", overflow:"hidden", border:"1px solid rgba(226,232,240,0.9)" }}>
      <div style={{ marginBottom: "16px" }}>
        <span className="section-label">{t('district')} snapshot</span>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize:"0.95rem" }}>
        <thead>
          <tr style={{ background:"linear-gradient(180deg, #f8fafc, #eef2ff)", textAlign:"left", borderBottom:"2px solid #cbd5e1", color:"#334155", textTransform:"uppercase", fontSize:"0.82rem", letterSpacing:"0.09em" }}>
            <th style={{ padding:"16px" }}>{t('district')}</th>
            <th style={{ padding:"16px" }}>{t('state')}</th>
            <th style={{ padding:"16px" }}>{t('population')}</th>
            <th style={{ padding:"16px", width:"200px" }}>{t('literacy')}</th>
          </tr>
        </thead>
        <tbody>
          {districts.slice(0, 5).map((d, index) => (
            <tr key={index} style={{ background: index % 2 === 0 ? "#ffffff" : "#f8fafc", borderBottom:"1px solid #e2e8f0", transition:"background-color 0.2s" }} onMouseOver={e=>e.currentTarget.style.backgroundColor="#f1f5f9"} onMouseOut={e=>e.currentTarget.style.backgroundColor=index % 2 === 0 ? "#ffffff" : "#f8fafc"}>
              <td style={{ padding:"16px", fontWeight:"600", color:"#0f172a" }}>{getLocalizedDistrictName(t, d.district)}</td>
              <td style={{ padding:"16px", color:"#475569", textTransform: 'capitalize' }}>{getLocalizedStateName(t, d.state, language)}</td>
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

}

export default DistrictTable;
