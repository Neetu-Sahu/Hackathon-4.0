import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

function Navbar({ isSidebarExpanded }) {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <div style={{
      background: "linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(15, 23, 42, 0.94) 100%)",
      color:"white",
      padding:"12px 20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      position: "sticky",
      top: 0,
      zIndex: 20,
      borderBottom: "1px solid rgba(148, 163, 184, 0.14)",
      boxShadow: "0 12px 30px rgba(15, 23, 42, 0.18)",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
    }}>
      <div style={{
        paddingLeft: isSidebarExpanded ? "0px" : "70px",
        transition: "padding-left 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
        flexDirection: "column",
        gap: "2px",
      }}>
        <div style={{ fontSize: "0.78rem", color: "#94a3b8", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          District Intelligence Platform
        </div>
        <div style={{ fontSize: "1.2rem", fontWeight: 700, letterSpacing: "-0.02em" }}>{t("appTitle")}</div>
      </div>
      
      <button
        type="button"
        onClick={toggleLanguage}
        aria-label="Toggle language"
        title={language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
        style={{
          width: '92px',
          height: '40px',
          background: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
          borderRadius: '999px',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          cursor: 'pointer',
          padding: '4px',
          border: '1px solid rgba(255,255,255,0.14)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          boxShadow: '0 10px 22px rgba(234, 88, 12, 0.22)',
        }}
      >
        <div style={{
          position: 'absolute',
          width: '42px',
          height: '32px',
          backgroundColor: 'white',
          borderRadius: '999px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
          transition: 'transform 0.45s cubic-bezier(0.68, -0.55, 0.265, 1.55), box-shadow 0.3s ease',
          transform: language === 'en' ? 'translateX(42px)' : 'translateX(0px)',
          boxShadow: '0 6px 14px rgba(15,23,42,0.16)'
        }}>
          <span style={{ 
            color: '#ea580c', 
            fontSize: '13px', 
            fontWeight: '800',
            letterSpacing: '0.04em',
            transition: 'opacity 0.2s ease' 
          }}>
            {language === 'en' ? 'EN' : 'HI'}
          </span>
        </div>

        <div style={{ 
          flex: 1, 
          display: 'flex', 
          justifyContent: 'space-around', 
          alignItems: 'center',
          zIndex: 1,
          userSelect: 'none'
        }}>
          <span style={{ color: 'white', fontSize: '12px', fontWeight: '700', opacity: language === 'hi' ? 0.4 : 0.9 }}>HI</span>
          <span style={{ color: 'white', fontSize: '12px', fontWeight: '700', opacity: language === 'en' ? 0.4 : 0.9 }}>EN</span>
        </div>
      </button>
    </div>
  );
}

export default Navbar;
