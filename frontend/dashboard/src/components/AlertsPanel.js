import { useEffect, useState } from "react";
import { BellRing } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { getAlerts } from "../services/api";
import { getLocalizedDistrictName } from "../utils/districtLocalization";

const severityStyles = {
  high: { background: "#fee2e2", color: "#b91c1c" },
  medium: { background: "#ffedd5", color: "#c2410c" },
  low: { background: "#e0f2fe", color: "#0369a1" },
};

export default function AlertsPanel() {
  const { t, language } = useLanguage();
  const ui = language === "hi"
    ? {
        title: "चेतावनियाँ और विसंगति पहचान",
        subtitle: "असामान्य प्रदर्शन, दबाव या जनसांख्यिकीय पैटर्न वाले जिलों को स्वचालित रूप से हाइलाइट करता है।",
        live: "लाइव विसंगति स्कैन",
        totalDistricts: "कुल जिले",
        avgLiteracy: "औसत साक्षरता",
        avgPriority: "औसत प्राथमिकता स्कोर",
        highAlerts: "उच्च चेतावनियाँ",
        high: "उच्च",
        medium: "मध्यम",
        total: "कुल",
        type: "प्रकार",
        metric: "मेट्रिक",
        score: "स्कोर",
        none: "अभी कोई विसंगति नहीं मिली।",
      }
    : {
        title: "Alerts and anomaly detection",
        subtitle: "Automatically highlights districts with unusual performance, pressure, or demographic patterns.",
        live: "Live anomaly scan",
        totalDistricts: "Total districts",
        avgLiteracy: "Avg literacy",
        avgPriority: "Avg priority score",
        highAlerts: "High alerts",
        high: "High",
        medium: "Medium",
        total: "Total",
        type: "Type",
        metric: "Metric",
        score: "Score",
        none: "No anomalies detected right now.",
      };
  const [data, setData] = useState({ alerts: [], metrics: {} });

  useEffect(() => {
    getAlerts().then((response) => {
      setData({
        alerts: response?.alerts || [],
        metrics: response?.metrics || {},
      });
    });
  }, []);

  const alerts = data.alerts || [];
  const highAlerts = alerts.filter((alert) => alert.severity === "high").length;
  const mediumAlerts = alerts.filter((alert) => alert.severity === "medium").length;

  return (
    <div className="gov-card" style={{ background: "white", marginBottom: "28px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "flex-start", marginBottom: "20px" }}>
        <div>
          <h2 className="gov-heading" style={{ margin: 0 }}>
            {ui.title}
          </h2>
          <p style={{ margin: "8px 0 0 0", color: "#64748b" }}>
            {ui.subtitle}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#b91c1c", fontWeight: 700 }}>
          <BellRing size={18} />
          {ui.live}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "14px", marginBottom: "20px" }}>
        <div style={{ borderRadius: "16px", padding: "16px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
          <div style={{ color: "#64748b", fontSize: "0.85rem" }}>{ui.totalDistricts}</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#0f172a" }}>{data.metrics.total_districts || 0}</div>
        </div>
        <div style={{ borderRadius: "16px", padding: "16px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
          <div style={{ color: "#64748b", fontSize: "0.85rem" }}>{ui.avgLiteracy}</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#0f172a" }}>{Number(data.metrics.avg_literacy_rate || 0).toFixed(2)}%</div>
        </div>
        <div style={{ borderRadius: "16px", padding: "16px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
          <div style={{ color: "#64748b", fontSize: "0.85rem" }}>{ui.avgPriority}</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#0f172a" }}>{Number(data.metrics.avg_priority_score || 0).toFixed(2)}</div>
        </div>
        <div style={{ borderRadius: "16px", padding: "16px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
          <div style={{ color: "#64748b", fontSize: "0.85rem" }}>{ui.highAlerts}</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#b91c1c" }}>{data.metrics.high_alert_districts || 0}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "14px", flexWrap: "wrap" }}>
        <div style={{ ...severityStyles.high, borderRadius: "999px", padding: "8px 12px", fontWeight: 800 }}>
          {ui.high}: {highAlerts}
        </div>
        <div style={{ ...severityStyles.medium, borderRadius: "999px", padding: "8px 12px", fontWeight: 800 }}>
          {ui.medium}: {mediumAlerts}
        </div>
        <div style={{ ...severityStyles.low, borderRadius: "999px", padding: "8px 12px", fontWeight: 800 }}>
          {ui.total}: {alerts.length}
        </div>
      </div>

      {alerts.length ? (
        <div style={{ display: "grid", gap: "12px" }}>
          {alerts.slice(0, 8).map((alert, index) => {
            const style = severityStyles[alert.severity] || severityStyles.low;
            return (
              <div key={`${alert.district}-${alert.metric}-${index}`} style={{ border: "1px solid #e2e8f0", borderRadius: "16px", padding: "16px", background: "white", display: "grid", gap: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ color: "#ea580c", fontWeight: 800, marginBottom: "4px" }}>
                      {getLocalizedDistrictName(t, alert.district)}
                    </div>
                    <div style={{ color: "#475569", fontWeight: 600 }}>
                      {alert.title}
                    </div>
                  </div>
                  <div style={{ ...style, borderRadius: "999px", padding: "6px 10px", fontSize: "0.8rem", fontWeight: 800, textTransform: "uppercase" }}>
                    {alert.severity}
                  </div>
                </div>
                <div style={{ color: "#334155", lineHeight: 1.7 }}>
                  <strong>{ui.type}:</strong> {alert.type}{" "}
                  <strong style={{ marginLeft: "12px" }}>{ui.metric}:</strong> {alert.metric}{" "}
                  <strong style={{ marginLeft: "12px" }}>{ui.score}:</strong> {Number(alert.priority_score || 0).toFixed(2)}
                </div>
                <div style={{ color: "#475569", lineHeight: 1.7 }}>
                  {alert.detail}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ borderRadius: "16px", border: "1px dashed #cbd5e1", padding: "24px", color: "#64748b" }}>
          {ui.none}
        </div>
      )}
    </div>
  );
}
