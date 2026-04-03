import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";

function DistrictSearch({ districts, onSelect, placeholder }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredDistricts = (districts || []).filter((district) => {
    const label = district?.district || "";
    return label.toLowerCase().includes(query.toLowerCase());
  });

  const handleSelect = (districtName) => {
    setQuery(districtName);
    onSelect(districtName);
    setIsOpen(false);
  };

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "relative",
        display: "inline-block",
        margin: "0",
        zIndex: 1000,
        background: "rgba(255,255,255,0.92)",
        padding: "10px",
        borderRadius: "16px",
        boxShadow: "0 16px 32px rgba(15, 23, 42, 0.12)",
        minWidth: "320px",
        border: "1px solid rgba(226,232,240,0.9)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <input
          type="text"
          placeholder={placeholder || "Search District..."}
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && filteredDistricts.length > 0) {
              handleSelect(filteredDistricts[0].district);
            }
          }}
          style={{
            padding: "11px 13px",
            width: "100%",
            border: "1px solid #cbd5e1",
            borderRadius: "12px",
            outline: "none",
            fontSize: "0.98rem",
            boxSizing: "border-box",
            background: "#f8fafc",
          }}
        />
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          style={{
            padding: "10px 14px",
            border: "1px solid rgba(15,23,42,0.08)",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)",
            color: "white",
            cursor: "pointer",
            whiteSpace: "nowrap",
            boxShadow: "0 10px 20px rgba(15, 23, 42, 0.14)",
            fontWeight: 700,
          }}
        >
          {isOpen ? t("hide") : t("districts")}
        </button>
      </div>

      {isOpen && (
        <div
          style={{
            marginTop: "8px",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            maxHeight: "280px",
            overflowY: "auto",
            background: "white",
            boxShadow: "0 18px 36px rgba(15, 23, 42, 0.12)",
          }}
        >
          {filteredDistricts.length > 0 ? (
            filteredDistricts.map((district) => (
              <button
                key={district.district}
                type="button"
                onClick={() => handleSelect(district.district)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 12px",
                  border: "none",
                  background: "white",
                  cursor: "pointer",
                  borderBottom: "1px solid #f1f5f9",
                  fontSize: "0.95rem",
                  color: "#0f172a",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8fafc";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                }}
              >
                {district.district}
              </button>
            ))
          ) : (
            <div style={{ padding: "12px", color: "#64748b" }}>No matching districts found</div>
          )}
        </div>
      )}
    </div>
  );
}

export default DistrictSearch;
