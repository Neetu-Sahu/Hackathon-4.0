import L from "leaflet";
import DistrictSearch from "./DistrictSearch";
import { useLanguage } from '../contexts/LanguageContext';
import Legend from "./Legend";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import { getLocalizedDistrictName, getLocalizedStateName } from "../utils/districtLocalization";


/* Controller used to zoom map when a district is selected */
function MapController({ selectedDistrict, geoData }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedDistrict || !geoData) return;

    const feature = geoData.features.find(
      (f) =>
        f.properties?.district?.toLowerCase() ===
        selectedDistrict.toLowerCase(),
    );

    if (!feature) return;

    const layer = L.geoJSON(feature);

    const bounds = layer.getBounds();

    map.fitBounds(bounds);
  }, [selectedDistrict, geoData, map]);

  return null;
}

function MapView() {
  const { t, language } = useLanguage();
  const [geoData, setGeoData] = useState(null);
  const [priorityData, setPriorityData] = useState([]);
  const [districtList, setDistrictList] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [showHighPriority, setShowHighPriority] = useState(false);

  /* Load GeoJSON */
  useEffect(() => {
    fetch("/maps/INDIA_DISTRICTS.geojson")
      .then((res) => res.json())
      .then((data) => {
        console.log("GeoJSON loaded:", data);
        setGeoData(data);
      });
  }, []);

  /* Load priority data */
  useEffect(() => {
    axios.get("http://localhost:8000/priority-ranking").then((res) => {
      setPriorityData(res.data);
      setDistrictList(res.data);
    });
  }, []);

  /* Get priority score */
  const getPriorityScore = (districtName) => {
    if (!districtName) return 0;

    const match = priorityData.find(
      (d) => d.district?.toLowerCase() === districtName.toLowerCase(),
    );

    return match ? match.priority_score : 0;
  };

  /* Style districts */
  const styleDistrict = (feature) => {
    const districtName = feature.properties?.district;
    const score = getPriorityScore(districtName);

    if (showHighPriority && score < 60) {
      return {
        fillOpacity: 0,
        opacity: 0,
      };
    }

    let color = "#22c55e";

    if (score > 60) {
      color = "#ef4444";
    } else if (score > 35 && score <= 60) {
      color = "#f59e0b";
    }
    return {
      fillColor: color,
      weight: 1,
      opacity: 1,
      color: "rgba(255,255,255,0.95)",
      fillOpacity: 0.72,
    };
  };

  /* Tooltip + Popup logic */
  const onEachDistrict = (feature, layer) => {
    const name = feature.properties?.district;
    if (!name) return;

    layer.bindTooltip(getLocalizedDistrictName(t, name));

    const match = priorityData.find(
      (d) => d.district?.toLowerCase() === name.toLowerCase(),
    );

    if (!match) return;

    const districtLabel = getLocalizedDistrictName(t, match.district);
    const stateLabel = getLocalizedStateName(t, match.state, language);

    layer.on("click", async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/scheme-recommendation/${encodeURIComponent(match.district)}`,
        );

        const schemeData = await response.json();

        const issues = schemeData.issues || [];
        const schemes = schemeData.recommended_schemes || [];

        layer
          .bindPopup(
            `
              <div style="font-size:14px;line-height:1.55;color:#0f172a;min-width:250px;">
                <div style="font-size:16px;font-weight:800;margin-bottom:8px;">${districtLabel}</div>
                <div style="display:grid;gap:4px;margin-bottom:12px;color:#334155;">
                  <div><b>${t('state')}:</b> ${stateLabel}</div>
                  <div><b>${t('population')}:</b> ${match.population?.toLocaleString('en-IN')}</div>
                  <div><b>${t('literacyRateLabel')}:</b> ${match.literacy_rate?.toFixed(2)}%</div>
                  <div><b>${t('priorityScore')}:</b> ${match.priority_score?.toFixed(2)}</div>
                </div>

                <div style="margin-bottom:10px;">
                  <div style="font-weight:800;margin-bottom:6px;">${t('Policy Insights')}:</div>
                  <div style="color:#475569;">
                    ${
                      issues.length > 0
                        ? issues.map((i) => `&bull; ${t(i)}`).join("<br>")
                        : t("Stable Socio-Economic Indicators: Routine Monitoring")
                    }
                  </div>
                </div>

                <div>
                  <div style="font-weight:800;margin-bottom:6px;">${t('Recommended Schemes')}:</div>
                  <div style="color:#475569;">
                    ${
                      schemes.length > 0
                        ? schemes.map((s) => `&bull; ${t(s)}`).join("<br>")
                        : t("schemeRecommendationsEmpty")
                    }
                  </div>
                </div>
              </div>
            `,
          )
          .openPopup();
      } catch (error) {
        console.error("Scheme API error:", error);
      }
    });
  };

  return (
    <div style={{ position: "relative" }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "14px",
        flexWrap: "wrap",
        marginBottom: "14px",
      }}>
        <div style={{ flex: "1 1 320px" }}>
          <DistrictSearch
            districts={districtList}
            onSelect={(name) => setSelectedDistrict(name)}
            placeholder={t('searchDistrict')}
          />
        </div>

        <button
          onClick={() => setShowHighPriority(!showHighPriority)}
          style={{
            minWidth: "188px",
            height: "48px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: showHighPriority
              ? "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)"
              : "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            color: "white",
            border: "none",
            borderRadius: "14px",
            cursor: "pointer",
            boxShadow: "0 12px 24px rgba(15, 23, 42, 0.16)",
            fontWeight: 700,
            fontSize: "0.95rem",
            lineHeight: 1.1,
            letterSpacing: "0.01em",
            whiteSpace: "nowrap",
          }}
          aria-label={showHighPriority ? t("showAllDistricts") : t("showCriticalDistricts")}
          title={showHighPriority ? t("showAllDistricts") : t("showCriticalDistricts")}
        >
          {showHighPriority ? t("showAllDistricts") : t("showCriticalDistricts")}
        </button>
      </div>

      <div style={{
        position: "relative",
        borderRadius: "24px",
        overflow: "hidden",
        border: "1px solid rgba(226,232,240,0.9)",
        boxShadow: "0 20px 42px rgba(15, 23, 42, 0.12)",
        background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
      }}>
        <MapContainer
          center={[22.9734, 78.6569]}
          zoom={5}
          style={{ height: "520px", width: "100%" }}
        >
          <MapController selectedDistrict={selectedDistrict} geoData={geoData} />

          {/* Using CartoDB Voyager to explicitly enforce English labels */}
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />

          {geoData && (
            <GeoJSON
              key={language}
              data={geoData}
              style={styleDistrict}
              onEachFeature={onEachDistrict}
            />
          )}
        </MapContainer>

      </div>

      <Legend />
    </div>
  );
}

export default MapView;

