import { useLanguage } from '../contexts/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import axios from "axios";
import { getLocalizedDistrictName } from "../utils/districtLocalization";


function Charts() {
  const { t } = useLanguage();
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8000/priority-ranking")
      .then(res => {
        const top = res.data
          .sort((a, b) => b.priority_score - a.priority_score)
          .slice(0, 5);
        setData(top);
      });
  }, []);

  // Translate a district name using the map, with capitalization fallback
  const getDistrictLabel = (val) => {
    return getLocalizedDistrictName(t, val);
  };

  // Custom tooltip: translates the key label and formats priority_score to 2 decimals
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'rgba(255,255,255,0.96)', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '10px 14px', fontSize: '0.9rem', color: '#1e293b', boxShadow: '0 16px 30px rgba(15,23,42,0.12)' }}>
          <p style={{ fontWeight: 700, marginBottom: '4px' }}>{getDistrictLabel(label)}</p>
          {payload.map((entry, i) => (
            <p key={i} style={{ color: entry.color, margin: '2px 0' }}>
              {t('priorityScore')}: <strong>{Number(entry.value).toFixed(2)}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: "100%", height: 420, background: "rgba(255,255,255,0.96)", borderRadius: "20px", border: "1px solid rgba(226,232,240,0.9)", boxShadow: "0 18px 40px rgba(15,23,42,0.08)", padding: "20px" }}>
      <h3 style={{ marginTop: 0, marginBottom: "12px", color: "#0f172a" }}>{t('topPriorityDistricts')}</h3>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="priorityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
          </defs>
          <XAxis dataKey="district" tick={{ fill: '#334155', fontSize: 12 }} tickFormatter={getDistrictLabel} angle={-45}  textAnchor="end" height={80} fontSize={12} fontWeight={700} />
          <YAxis dataKey="priority_score" tick={{ fill: '#334155' }} fontSize={12} fontWeight={700}/>
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="priority_score" fill="url(#priorityGradient)" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Charts;
