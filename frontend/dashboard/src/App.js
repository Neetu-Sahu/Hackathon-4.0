import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ChatBot from "./components/ChatBot";
import { LanguageProvider } from './contexts/LanguageContext';

import Overview from "./pages/Overview";
import Analytics from "./pages/Analytics";
import PolicyAI from "./pages/PolicyAI";
import DistrictComparison from "./pages/DistrictComparison";
import DistrictAlerts from "./pages/DistrictAlerts";
import DistrictExplainability from "./pages/DistrictExplainability";
import DistrictNotes from "./pages/DistrictNotes";
import Login from "./pages/Login";
import SchemeRepository from "./components/SchemeRepository";
import "./Layout.css";

function AuthenticatedShell({ isAuthenticated, sidebarWidth, isSidebarExpanded, setIsSidebarExpanded, onWidthChange }) {
  const navigate = useNavigate();
  const previousAuth = useRef(isAuthenticated);

  useEffect(() => {
    if (!previousAuth.current && isAuthenticated) {
      navigate("/", { replace: true });
    }
    previousAuth.current = isAuthenticated;
  }, [isAuthenticated, navigate]);

  return (
    <div className="dashboard-shell">
      <Sidebar
        isExpanded={isSidebarExpanded}
        setIsExpanded={setIsSidebarExpanded}
        onWidthChange={onWidthChange}
      />

      <div
        className="main-shell"
        style={{
          marginLeft: `${sidebarWidth}px`,
        }}
      >
        <Navbar isSidebarExpanded={isSidebarExpanded} />

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/policy-advisor" element={<PolicyAI />} />
            <Route path="/district-comparison" element={<DistrictComparison />} />
            <Route path="/district-alerts" element={<DistrictAlerts />} />
            <Route path="/district-explainability" element={<DistrictExplainability />} />
            <Route path="/district-notes" element={<DistrictNotes />} />
            <Route path="/scheme-repository" element={<SchemeRepository />} />
          </Routes>
        </div>
      </div>

      {isSidebarExpanded && <div className="main-shell-blur" />}

      <ChatBot />
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(0);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  return (
    <LanguageProvider>
      <BrowserRouter>
        {!isAuthenticated ? (
          <Routes>
            <Route path="*" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
          </Routes>
        ) : (
          <AuthenticatedShell
            isAuthenticated={isAuthenticated}
            sidebarWidth={sidebarWidth}
            isSidebarExpanded={isSidebarExpanded}
            setIsSidebarExpanded={setIsSidebarExpanded}
            onWidthChange={setSidebarWidth}
          />
        )}
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
