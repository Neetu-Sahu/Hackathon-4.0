import { useLanguage } from '../contexts/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import axios from "axios";
import { getLocalizedDistrictName } from "../utils/districtLocalization";

function PopulationChart() {
  const { t } = useLanguage();
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8000/districts")
      .then(res => {
        const topPopulation = res.data
          .sort((a, b) => b.population - a.population)
          .slice(0, 5);
        setData(topPopulation);
      });
  }, []);

  // Translate a district name using the map, with capitalization fallback
  const getDistrictLabel = (val) => {
    return getLocalizedDistrictName(t, val);
  };

  // Custom tooltip: translates 'population' key label
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9rem', color: '#1e293b' }}>
          <p style={{ fontWeight: 700, marginBottom: '4px' }}>{getDistrictLabel(label)}</p>
          {payload.map((entry, i) => (
            <p key={i} style={{ color: entry.color, margin: '2px 0' }}>
              {t('population')}: <strong>{Number(entry.value).toLocaleString()}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: "100%", height: 400, marginBottom: "40px" }}>
      <h3>{t('topPopulationDistricts')}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 7 }} >
          <XAxis dataKey="district" interval={0} angle={-45}  textAnchor="end" height={80} fontSize={12} tickFormatter={getDistrictLabel} fontWeight={700} tick={{ fill: '#000000' }} />
          {/* <XAxis dataKey="district" tickFormatter={getDistrictLabel} /> */}
          <YAxis tick={{ fill: '#000000' }} fontSize={12} fontWeight={700}/>
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="population" fill="#3498db" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PopulationChart;
