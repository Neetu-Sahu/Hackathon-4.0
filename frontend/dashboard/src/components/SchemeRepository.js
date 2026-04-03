import React, { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

const categoryColors = {
  Health: {
    background: "rgba(59, 130, 246, 0.14)",
    color: "#2563eb",
    border: "1px solid rgba(59, 130, 246, 0.28)",
  },
  Education: {
    background: "rgba(34, 197, 94, 0.14)",
    color: "#15803d",
    border: "1px solid rgba(34, 197, 94, 0.28)",
  },
  "Digital Skill": {
    background: "rgba(249, 115, 22, 0.14)",
    color: "#ea580c",
    border: "1px solid rgba(249, 115, 22, 0.28)",
  },
  Infrastructure: {
    background: "rgba(99, 102, 241, 0.14)",
    color: "#4f46e5",
    border: "1px solid rgba(99, 102, 241, 0.28)",
  },
  default: {
    background: "rgba(148, 163, 184, 0.14)",
    color: "#475569",
    border: "1px solid rgba(148, 163, 184, 0.28)",
  },
};

const pageShellStyle = {
  padding: "30px",
  maxWidth: "1400px",
  margin: "0 auto",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "22px",
};

const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.65)",
  backdropFilter: "blur(8px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  zIndex: 1000,
};

const modalCardStyle = {
  width: "min(820px, 100%)",
  maxHeight: "85vh",
  overflowY: "auto",
  borderRadius: "24px",
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.58) 100%)",
  border: "1px solid rgba(255,255,255,0.35)",
  boxShadow: "0 24px 60px rgba(15, 23, 42, 0.22)",
  backdropFilter: "blur(18px)",
  padding: "28px",
};

const getSchemeTranslationKey = (prefix, schemeName) =>
  `${prefix}.${schemeName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")}`;

const resolveTranslatedValue = (translate, key, fallback) => {
  const translated = translate(key);
  return translated === key ? fallback : translated;
};

const SchemeRepository = () => {
  const { t } = useLanguage();
  const [schemes, setSchemes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchSchemes = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch("http://localhost:8000/api/schemes");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.detail || t("schemeRepositoryError"));
        }

        if (isMounted) {
          setSchemes(data.schemes || []);
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError.message || t("schemeRepositoryError"));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchSchemes();

    return () => {
      isMounted = false;
    };
  }, [t]);

  const filteredSchemes = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();

    if (!normalizedTerm) {
      return schemes;
    }

    return schemes.filter((scheme) =>
      [scheme.name, scheme.category, scheme.description, scheme.working_process]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(normalizedTerm)),
    );
  }, [schemes, searchTerm]);

  return (
    <div style={pageShellStyle}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              color: "#0f172a",
              fontSize: "2rem",
              fontWeight: 800,
            }}
          >
            {t("pageSchemeRepository")}
          </h1>
          <p
            style={{
              margin: "10px 0 0 0",
              color: "#475569",
              fontSize: "1rem",
            }}
          >
            {t("schemeRepositorySubtitle")}
          </p>
        </div>

        <div
          style={{
            position: "relative",
            width: "min(420px, 100%)",
          }}
        >
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#64748b",
            }}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={t("schemeRepositorySearchPlaceholder")}
            style={{
              width: "100%",
              padding: "14px 16px 14px 46px",
              borderRadius: "16px",
              border: "1px solid #cbd5e1",
              background: "white",
              color: "#0f172a",
              fontSize: "0.98rem",
              boxShadow: "0 14px 35px rgba(15, 23, 42, 0.06)",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {isLoading ? (
        <div
          style={{
            padding: "32px",
            borderRadius: "24px",
            background: "white",
            color: "#475569",
            boxShadow: "0 18px 40px rgba(15, 23, 42, 0.07)",
          }}
        >
          {t("loading")}
        </div>
      ) : error ? (
        <div
          style={{
            padding: "24px",
            borderRadius: "24px",
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.18)",
            color: "#b91c1c",
          }}
        >
          {error}
        </div>
      ) : (
        <>
          <div
            style={{
              marginBottom: "22px",
              color: "#64748b",
              fontSize: "0.95rem",
              fontWeight: 600,
            }}
          >
            {t("schemeCountLabel")
              .replace("{{count}}", String(filteredSchemes.length))}
          </div>

          <div style={gridStyle}>
            {filteredSchemes.map((scheme) => {
              const badgeStyle = categoryColors[scheme.category] || categoryColors.default;
              const localizedCategory = resolveTranslatedValue(
                t,
                scheme.category,
                scheme.category,
              );
              const localizedName = resolveTranslatedValue(t, scheme.name, scheme.name);
              const localizedDescription = resolveTranslatedValue(
                t,
                getSchemeTranslationKey("schemeDescription", scheme.name),
                scheme.description,
              );

              return (
                <div
                  key={scheme.id}
                  style={{
                    background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
                    borderRadius: "22px",
                    border: "1px solid rgba(226, 232, 240, 0.95)",
                    padding: "22px",
                    minHeight: "240px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: "0 20px 40px rgba(15, 23, 42, 0.08)",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "12px",
                        marginBottom: "16px",
                      }}
                    >
                      <span
                        style={{
                          ...badgeStyle,
                          display: "inline-flex",
                          alignItems: "center",
                          borderRadius: "999px",
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          padding: "7px 12px",
                        }}
                      >
                        {localizedCategory}
                      </span>
                    </div>

                    <h3
                      style={{
                        margin: "0 0 14px 0",
                        color: "#0f172a",
                        fontSize: "1.2rem",
                        fontWeight: 800,
                        lineHeight: 1.35,
                      }}
                    >
                      {localizedName}
                    </h3>

                    <p
                      style={{
                        margin: 0,
                        color: "#475569",
                        fontSize: "0.95rem",
                        lineHeight: 1.7,
                      }}
                    >
                      {localizedDescription.length > 140
                        ? `${localizedDescription.slice(0, 140)}...`
                        : localizedDescription}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedScheme(scheme)}
                    style={{
                      marginTop: "22px",
                        border: "none",
                        borderRadius: "14px",
                        padding: "12px 16px",
                        background: "#0f172a",
                      color: "white",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      cursor: "pointer",
                        boxShadow: "0 12px 24px rgba(15, 23, 42, 0.18)",
                      }}
                    >
                    {t("viewDetails")}
                  </button>
                </div>
              );
            })}
          </div>

          {!filteredSchemes.length && (
            <div
              style={{
                marginTop: "26px",
                borderRadius: "22px",
                padding: "28px",
                textAlign: "center",
                background: "white",
                color: "#475569",
                boxShadow: "0 16px 34px rgba(15, 23, 42, 0.06)",
              }}
            >
              {t("schemeRepositoryEmpty")}
            </div>
          )}
        </>
      )}

      {selectedScheme && (
        <div
          role="presentation"
          style={modalOverlayStyle}
          onClick={() => setSelectedScheme(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            style={modalCardStyle}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "20px",
                marginBottom: "20px",
              }}
            >
              <div>
                <span
                  style={{
                    ...(categoryColors[selectedScheme.category] || categoryColors.default),
                    display: "inline-flex",
                    alignItems: "center",
                    borderRadius: "999px",
                    fontSize: "0.78rem",
                  fontWeight: 700,
                  padding: "7px 12px",
                  marginBottom: "12px",
                }}
                >
                  {resolveTranslatedValue(
                    t,
                    selectedScheme.category,
                    selectedScheme.category,
                  )}
                </span>
                <h2
                  style={{
                    margin: 0,
                    color: "#0f172a",
                    fontSize: "1.8rem",
                    fontWeight: 800,
                    lineHeight: 1.3,
                  }}
                >
                  {resolveTranslatedValue(
                    t,
                    selectedScheme.name,
                    selectedScheme.name,
                  )}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedScheme(null)}
                style={{
                  border: "none",
                  background: "rgba(15, 23, 42, 0.08)",
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                  color: "#0f172a",
                  flexShrink: 0,
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gap: "18px",
              }}
            >
              <section
                style={{
                  background: "rgba(255, 255, 255, 0.55)",
                  borderRadius: "18px",
                  padding: "18px 20px",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 10px 0",
                    color: "#ea580c",
                    fontSize: "1rem",
                    fontWeight: 800,
                    letterSpacing: "0.02em",
                  }}
                >
                  {t("schemeDescriptionTitle")}
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: "#334155",
                    fontSize: "0.98rem",
                    lineHeight: 1.8,
                  }}
                >
                  {resolveTranslatedValue(
                    t,
                    getSchemeTranslationKey("schemeDescription", selectedScheme.name),
                    selectedScheme.description,
                  )}
                </p>
              </section>

              <section
                style={{
                  background: "rgba(255, 255, 255, 0.55)",
                  borderRadius: "18px",
                  padding: "18px 20px",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 10px 0",
                    color: "#ea580c",
                    fontSize: "1rem",
                    fontWeight: 800,
                    letterSpacing: "0.02em",
                  }}
                >
                  {t("schemeWorkingTitle")}
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: "#334155",
                    fontSize: "0.98rem",
                    lineHeight: 1.8,
                  }}
                >
                  {resolveTranslatedValue(
                    t,
                    getSchemeTranslationKey(
                      "schemeWorkingProcess",
                      selectedScheme.name,
                    ),
                    selectedScheme.working_process,
                  )}
                </p>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemeRepository;
