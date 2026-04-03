import { useLanguage } from '../contexts/LanguageContext';
import { useEffect, useState } from "react";
import { getPriorityRanking } from "../services/api";
import { getLocalizedDistrictName, getLocalizedStateName } from "../utils/districtLocalization";

function PriorityTable() {
  const { t, language } = useLanguage();


  const [districts, setDistricts] = useState([]);

  useEffect(() => {

    const fetchData = async () => {
      const data = await getPriorityRanking();
      setDistricts(data);
    };

    fetchData();

  }, []);

  
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
              <td style={{ padding:"16px", fontWeight:"600", color:"#0f172a" }}>{getLocalizedDistrictName(t, d.district)}</td>
              <td style={{ padding:"16px", color:"#475569", textTransform: 'capitalize' }}>{getLocalizedStateName(t, d.state, language)}</td>
              <td style={{ padding:"16px", color:"#dc2626", fontWeight:"700" }}>{d.priority_score.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

}

export default PriorityTable;
