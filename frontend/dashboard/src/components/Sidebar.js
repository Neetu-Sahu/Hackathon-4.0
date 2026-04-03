import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Map,
  BarChart2,
  Cpu,
  Search,
  Menu,
  AlertTriangle,
  ClipboardList,
  Lightbulb,
  NotebookText,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import logo from "../assets/logo.png";

const EXPANDED_WIDTH = 260;

const Sidebar = ({ isExpanded, setIsExpanded, onWidthChange }) => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    if (typeof onWidthChange === "function") {
      onWidthChange(isExpanded ? EXPANDED_WIDTH : 0);
    }
  }, [isExpanded, onWidthChange]);

  const navItems = [
    { path: "/", label: t("navOverview"), icon: <Map size={20} /> },
    { path: "/analytics", label: t("navAnalytics"), icon: <BarChart2 size={20} /> },
    { path: "/policy-advisor", label: t("navPolicyAI"), icon: <Cpu size={20} /> },
    {
      path: "/scheme-repository",
      label: t("navSchemeRepository"),
      icon: <Search size={20} />,
    },
    {
      path: "/district-comparison",
      label: t("navDistrictComparison"),
      icon: <ClipboardList size={20} />,
    },
    {
      path: "/district-alerts",
      label: t("navDistrictAlerts"),
      icon: <AlertTriangle size={20} />,
    },
    {
      path: "/district-explainability",
      label: t("navDistrictExplainability"),
      icon: <Lightbulb size={20} />,
    },
    {
      path: "/district-notes",
      label: t("navDistrictNotes"),
      icon: <NotebookText size={20} />,
    },
  ];

  const sharedItemStyle = {
    textDecoration: "none",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    transition: "transform 0.2s ease, background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease",
    borderLeft: "4px solid transparent",
    whiteSpace: "nowrap",
    borderRadius: "14px",
    margin: "0 14px",
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: "16px",
          left: "16px",
          zIndex: 1005,
          width: "52px",
          height: "52px",
        }}
      >
        <button
          type="button"
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          onMouseEnter={() => setIsExpanded(true)}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            color: "white",
            boxShadow: "0 14px 28px rgba(15, 23, 42, 0.22)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Menu size={18} />
        </button>
      </div>

      <aside
        onMouseLeave={() => setIsExpanded(false)}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: `${EXPANDED_WIDTH}px`,
          height: "100vh",
          background:
            "linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(15, 23, 42, 0.95) 55%, rgba(17, 24, 39, 0.98) 100%)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          boxShadow: "18px 0 40px rgba(15, 23, 42, 0.28)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          transform: isExpanded ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 1000,
          overflow: "hidden",
          willChange: "transform",
          borderRight: "1px solid rgba(148, 163, 184, 0.16)",
        }}
      >
        <div
          style={{
            minHeight: "78px",
            padding: "10px 15px 10px 60px",
            borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            background: "linear-gradient(180deg, rgba(255,255,255,0.06), transparent)",
          }}
        >
          <div
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              padding: "6px",
              borderRadius: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 24px rgba(15, 23, 42, 0.18)",
              flexShrink: 0,
            }}
          >
            <img
              src={logo}
              alt="BPIS Logo"
              style={{ width: "auto", height: "42px", objectFit: "contain" }}
            />
          </div>

          <div style={{ minWidth: 0, maxWidth: "110px", paddingRight: "6px" }}>
            <div
              style={{
                margin: 0,
                fontSize: "1.08rem",
                fontWeight: 700,
                letterSpacing: "0.2px",
                lineHeight: 1.05,
                color: "#ffffff",
                whiteSpace: "normal",
                wordBreak: "break-word",
              }}
            >
              {t("brand")}
            </div>
          </div>
        </div>

        <nav
          style={{
            flex: 1,
            padding: "20px 0 18px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            overflowY: "auto",
          }}
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={item.label}
                aria-label={item.label}
                style={{
                  ...sharedItemStyle,
                  padding: "12px 24px",
                  color: isActive ? "#ffffff" : "#cbd5e1",
                  background: isActive
                    ? "linear-gradient(135deg, rgba(29, 78, 216, 0.32), rgba(15, 23, 42, 0.86))"
                    : "transparent",
                  borderLeft: isActive
                    ? "4px solid #60a5fa"
                    : "4px solid transparent",
                  fontWeight: isActive ? 600 : 400,
                  boxShadow:
                    isActive
                      ? "0 10px 24px rgba(15, 23, 42, 0.18)"
                      : "none",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)";
                    e.currentTarget.style.color = "#ffffff";
                    e.currentTarget.style.transform = "translateX(3px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#cbd5e1";
                    e.currentTarget.style.transform = "translateX(0)";
                  }
                }}
              >
                {item.icon}
                <span style={{ fontSize: "1.03rem" }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div
          style={{
            padding: "24px",
            borderTop: "1px solid rgba(148, 163, 184, 0.18)",
            fontSize: "0.8rem",
            color: "#94a3b8",
            textAlign: "center",
            background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.03))",
          }}
        >
          {t("footerCopyright")}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
