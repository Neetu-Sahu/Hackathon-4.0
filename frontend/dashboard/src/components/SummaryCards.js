import { useEffect, useState } from "react";
import { useLanguage } from '../contexts/LanguageContext';
import axios from "axios";
import { getLocalizedDistrictName } from "../utils/districtLocalization";
import { AlertTriangle, MapPinned, GraduationCap } from "lucide-react";

function SummaryCards() {
  const { t, language } = useLanguage();
  const captions = language === 'hi'
    ? {
        low: 'साक्षरता सीमा से नीचे के जिले',
        high: 'वर्तमान रैंकिंग में सबसे उच्च प्राथमिकता वाला जिला',
        avg: 'डेटासेट के सभी जिलों में',
      }
    : {
        low: 'Districts below the literacy threshold',
        high: 'Highest priority district in the current ranking',
        avg: 'Across all districts in the dataset',
      };

  const [stats, setStats] = useState({
    lowLiteracy: 0,
    highestRisk: "",
    avgLiteracy: 0
  });

  useEffect(() => {

    axios.get("http://localhost:8000/districts")
      .then(res => {

        const districts = res.data;

        const lowLiteracy = districts.filter(
          d => d.literacy_rate < 70
        ).length;

        const avgLiteracy =
          districts.reduce((sum,d)=>sum+d.literacy_rate,0) /
          districts.length;

        setStats(prev => ({
          ...prev,
          lowLiteracy: lowLiteracy,
          avgLiteracy: avgLiteracy.toFixed(2)
        }));

      });

    axios.get("http://localhost:8000/priority-ranking")
      .then(res => {

        const highestRisk =
          res.data.sort((a,b)=>b.priority_score-a.priority_score)[0];

        setStats(prev => ({
          ...prev,
          highestRisk: highestRisk.district
        }));

      });

  }, []);

  return (

    <div style={{
      display:"grid",
      gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))",
      gap:"18px",
      marginTop:"20px"
    }}>

      <div style={{ ...cardStyle, background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)" }}>
        <MetricBadge tone="warning" icon={GraduationCap} />
        <h4 style={labelStyle}>{t('lowLiteracyDistricts')}</h4>
        <p style={numberStyle}>{stats.lowLiteracy}</p>
        <p style={captionStyle}>{captions.low}</p>
      </div>

      <div style={{ ...cardStyle, background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)" }}>
        <MetricBadge tone="danger" icon={AlertTriangle} />
        <h4 style={labelStyle}>{t('highestRiskDistrict')}</h4>
        <p style={numberStyle}>{getLocalizedDistrictName(t, stats.highestRisk)}</p>
        <p style={captionStyle}>{captions.high}</p>
      </div>

      <div style={{ ...cardStyle, background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)" }}>
        <MetricBadge tone="primary" icon={MapPinned} />
        <h4 style={labelStyle}>{t('averageLiteracy')}</h4>
        <p style={numberStyle}>{stats.avgLiteracy}%</p>
        <p style={captionStyle}>{captions.avg}</p>
      </div>

    </div>

  );

}

const cardStyle = {
  border:"1px solid rgba(226, 232, 240, 0.9)",
  padding:"22px",
  borderRadius:"20px",
  textAlign:"left",
  boxShadow:"0 14px 32px rgba(15, 23, 42, 0.08)",
  transition:"transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
  position:"relative",
  overflow:"hidden"
};

const numberStyle = {
  fontSize:"clamp(1.8rem, 2.8vw, 2.5rem)",
  fontWeight:"800",
  margin:"6px 0 4px",
  letterSpacing:"-0.04em",
  color:"#0f172a"
};

const labelStyle = {
  fontSize:"0.88rem",
  color:"#475569",
  margin:"0",
  fontWeight:"700",
  textTransform:"uppercase",
  letterSpacing:"0.08em"
};

const captionStyle = {
  margin:"0",
  color:"#64748b",
  fontSize:"0.92rem",
  lineHeight: 1.5
};

function MetricBadge({ tone, icon: Icon }) {
  const tones = {
    warning: { bg: "linear-gradient(135deg, #fff7ed, #fed7aa)", color: "#ea580c" },
    danger: { bg: "linear-gradient(135deg, #fef2f2, #fecaca)", color: "#dc2626" },
    primary: { bg: "linear-gradient(135deg, #eff6ff, #bfdbfe)", color: "#1d4ed8" },
  };

  const style = tones[tone] || tones.primary;

  return (
    <div style={{
      width:"52px",
      height:"52px",
      borderRadius:"16px",
      display:"flex",
      alignItems:"center",
      justifyContent:"center",
      background: style.bg,
      color: style.color,
      marginBottom: "16px",
      boxShadow:"inset 0 1px 0 rgba(255,255,255,0.7)"
    }}>
      <Icon size={24} strokeWidth={2.4} />
    </div>
  );
}

export default SummaryCards;
