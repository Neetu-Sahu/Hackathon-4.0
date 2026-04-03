import { useLanguage } from '../contexts/LanguageContext';

function Legend() {
  const { t } = useLanguage();

  return (
    <div
      style={{
        position: "absolute",
        bottom: "18px",
        left: "18px",
        background: "rgba(255,255,255,0.92)",
        padding: "14px 16px",
        borderRadius: "18px",
        boxShadow: "0 18px 40px rgba(15, 23, 42, 0.16)",
        fontSize: "13px",
        zIndex: 1000,
        border: "1px solid rgba(226,232,240,0.9)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        minWidth: "170px",
      }}
    >
      <div style={{ fontWeight: 800, color: "#0f172a", marginBottom: "10px" }}>
        {t('priorityLegend')}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: "#334155" }}>
        <span style={{ width: "10px", height: "10px", borderRadius: "999px", background: "#22c55e", display: "inline-block", boxShadow: "0 0 0 4px rgba(34,197,94,0.12)" }} />
        <span>{t('lowPriority')}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: "#334155" }}>
        <span style={{ width: "10px", height: "10px", borderRadius: "999px", background: "#f59e0b", display: "inline-block", boxShadow: "0 0 0 4px rgba(245,158,11,0.12)" }} />
        <span>{t('mediumPriority')}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#334155" }}>
        <span style={{ width: "10px", height: "10px", borderRadius: "999px", background: "#ef4444", display: "inline-block", boxShadow: "0 0 0 4px rgba(239,68,68,0.12)" }} />
        <span>{t('highPriority')}</span>
      </div>
    </div>
  );
}

export default Legend;
