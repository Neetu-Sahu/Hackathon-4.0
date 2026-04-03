import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const ChatbotFAB = ({ onClick }) => {
  const { language } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);

  const tooltipText = language === 'hi' ? 'नीति एआई से पूछें' : 'Ask Policy AI';

  return (
    <>
      <style>{`
        .policy-fab-wrapper {
          position: fixed;
          right: 30px;
          bottom: 30px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .policy-fab-tooltip {
          padding: 10px 14px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.22);
          background: rgba(255, 255, 255, 0.22);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          color: #0f172a;
          font-size: 0.85rem;
          font-weight: 700;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.16);
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 260ms ease, transform 260ms ease;
          pointer-events: none;
          white-space: nowrap;
        }

        .policy-fab-wrapper.is-hovered .policy-fab-tooltip {
          opacity: 1;
          transform: translateY(0);
        }

        .policy-fab-button {
          position: relative;
          width: 65px;
          height: 65px;
          border: none;
          padding: 0;
          border-radius: 50%;
          background: transparent;
          cursor: pointer;
          transition: transform 300ms ease;
        }

        .policy-fab-shell {
          position: relative;
          width: 65px;
          height: 65px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: visible;
          transition: transform 300ms ease, box-shadow 300ms ease, filter 300ms ease;
        }

        .policy-fab-shell::before {
          content: '';
          position: absolute;
          inset: -14px;
          border-radius: 50%;
          background: radial-gradient(circle at center, rgba(59, 130, 246, 0.35) 0%, rgba(59, 130, 246, 0.14) 35%, rgba(59, 130, 246, 0) 72%);
          z-index: -1;
          opacity: 0.92;
          filter: blur(6px);
          transition: transform 300ms ease, opacity 300ms ease;
        }

        .policy-fab-wrapper.is-hovered .policy-fab-shell {
          transform: scale(1.1);
          box-shadow: 0 24px 32px -6px rgba(0, 0, 0, 0.38), 0 14px 14px -6px rgba(0, 0, 0, 0.16);
          filter: brightness(1.04);
        }

        .policy-fab-button:active {
          transform: scale(0.95);
        }

        .policy-fab-button:active .policy-fab-shell {
          transform: scale(0.95);
        }

        .policy-fab-wrapper.is-hovered .policy-fab-shell::before {
          transform: scale(1.08);
          opacity: 1;
        }

        .policy-fab-svg {
          width: 92px;
          height: 92px;
          display: block;
          filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.5));
          transform: translate(-7px, -8px);
          pointer-events: none;
        }

        .policy-fab-status {
          position: absolute;
          top: 2px;
          right: 2px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #10b981;
          border: 2px solid #ffffff;
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.55);
          animation: policyStatusPulse 1.8s infinite;
        }

        .policy-eye {
          transform-box: fill-box;
          transform-origin: center;
          animation: policyMascotBlink 4s infinite;
        }

        .policy-bubble {
          animation: policyBubbleFloat 2.8s ease-in-out infinite;
        }

        .policy-typing-line {
          transform-box: fill-box;
          transform-origin: left center;
          animation: policyTyping 1.8s ease-in-out infinite;
        }

        .policy-typing-line.line-2 {
          animation-delay: 180ms;
        }

        .policy-typing-line.line-3 {
          animation-delay: 360ms;
        }

        @keyframes policyMascotBlink {
          0%, 44%, 48%, 100% { transform: scaleY(1); }
          46%, 47% { transform: scaleY(0.12); }
        }

        @keyframes policyBubbleFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes policyTyping {
          0%, 100% { transform: scaleX(0.55); }
          50% { transform: scaleX(1); }
        }

        @keyframes policyStatusPulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.55); }
          70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
      `}</style>

      <div
        className={`policy-fab-wrapper ${isHovered ? 'is-hovered' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="policy-fab-tooltip">{tooltipText}</div>
        <button
          type="button"
          className="policy-fab-button"
          onClick={onClick}
          aria-label={tooltipText}
        >
          <div className="policy-fab-shell">
            <span className="policy-fab-status" aria-hidden="true" />
            <svg className="policy-fab-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <ellipse cx="256" cy="438" rx="126" ry="28" fill="rgba(15, 23, 42, 0.10)" />

              <path fill="#D9E8F6" d="M106 320c0-60 60-100 150-100s150 40 150 100v80c0 60-60 112-150 112s-150-52-150-112v-80z" />
              <circle fill="#1A365D" cx="256" cy="380" r="30" />

              <ellipse fill="#D9E8F6" cx="90" cy="400" rx="30" ry="60" transform="rotate(20 90 400)" />
              <ellipse fill="#D9E8F6" cx="422" cy="400" rx="30" ry="60" transform="rotate(-20 422 400)" />

              <rect x="76" y="100" width="360" height="240" rx="80" fill="#EBF4FF" />
              <rect x="116" y="140" width="280" height="160" rx="60" fill="#1A365D" />

              <circle className="policy-eye" fill="#00F5FF" cx="196" cy="200" r="25" />
              <circle className="policy-eye" fill="#00F5FF" cx="316" cy="200" r="25" />
              <path fill="#00F5FF" d="M216 240q40 40 80 0v10q-40 40-80 0z" />

              <g className="policy-bubble">
                <rect x="280" y="10" width="220" height="180" rx="20" fill="#68D391" />
                <path fill="#68D391" d="M440 180 l40 40 v-40 z" />
                <rect className="policy-typing-line line-1" x="310" y="50" width="160" height="15" rx="7.5" fill="#2F855A" />
                <rect className="policy-typing-line line-2" x="310" y="90" width="160" height="15" rx="7.5" fill="#2F855A" />
                <rect className="policy-typing-line line-3" x="310" y="130" width="100" height="15" rx="7.5" fill="#2F855A" />
              </g>
            </svg>
          </div>
        </button>
      </div>
    </>
  );
};

export default ChatbotFAB;
