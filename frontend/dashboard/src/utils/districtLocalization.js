export const getLocalizedDistrictName = (t, districtName) => {
  if (typeof districtName !== "string") return "";

  const rawName = districtName.trim();
  if (!rawName) return "";

  const districtMap = typeof t === "function" ? t("districtNameMap") : null;
  const normalizedKey = rawName.toLowerCase();

  if (
    districtMap &&
    typeof districtMap === "object" &&
    !Array.isArray(districtMap) &&
    typeof districtMap[normalizedKey] === "string" &&
    districtMap[normalizedKey].trim()
  ) {
    return districtMap[normalizedKey];
  }

  return rawName.charAt(0).toUpperCase() + rawName.slice(1);
};

const HI_STATE_NAME_MAP = {
  "andaman and nicobar islands": "अंडमान और निकोबार द्वीपसमूह",
  "andhra pradesh": "आंध्र प्रदेश",
  "arunachal pradesh": "अरुणाचल प्रदेश",
  "assam": "असम",
  "bihar": "बिहार",
  "chandigarh": "चंडीगढ़",
  "chhattisgarh": "छत्तीसगढ़",
  "dadra and nagar haveli": "दादरा और नगर हवेली",
  "daman and diu": "दमन और दीव",
  "goa": "गोवा",
  "gujarat": "गुजरात",
  "haryana": "हरियाणा",
  "himachal pradesh": "हिमाचल प्रदेश",
  "jammu and kashmir": "जम्मू और कश्मीर",
  "jharkhand": "झारखंड",
  "karnataka": "कर्नाटक",
  "kerala": "केरल",
  "lakshadweep": "लक्षद्वीप",
  "madhya pradesh": "मध्य प्रदेश",
  "maharashtra": "महाराष्ट्र",
  "manipur": "मणिपुर",
  "meghalaya": "मेघालय",
  "mizoram": "मिजोरम",
  "nagaland": "नागालैंड",
  "nct of delhi": "राष्ट्रीय राजधानी क्षेत्र दिल्ली",
  "orissa": "ओडिशा",
  "pondicherry": "पुदुच्चेरी",
  "punjab": "पंजाब",
  "rajasthan": "राजस्थान",
  "sikkim": "सिक्किम",
  "tamil nadu": "तमिलनाडु",
  "tripura": "त्रिपुरा",
  "uttar pradesh": "उत्तर प्रदेश",
  "uttarakhand": "उत्तराखंड",
  "west bengal": "पश्चिम बंगाल",
};

export const getLocalizedStateName = (t, stateName, language) => {
  if (typeof stateName !== "string") return "";

  const rawName = stateName.trim();
  if (!rawName) return "";

  const stateMap = typeof t === "function" ? t("stateNameMap") : null;
  const normalizedKey = rawName.toLowerCase();

  if (
    stateMap &&
    typeof stateMap === "object" &&
    !Array.isArray(stateMap) &&
    typeof stateMap[normalizedKey] === "string" &&
    stateMap[normalizedKey].trim()
  ) {
    return stateMap[normalizedKey];
  }

  if (language === "hi" && typeof HI_STATE_NAME_MAP[normalizedKey] === "string") {
    return HI_STATE_NAME_MAP[normalizedKey];
  }

  return rawName.charAt(0).toUpperCase() + rawName.slice(1);
};
