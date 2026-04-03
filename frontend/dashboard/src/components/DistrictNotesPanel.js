import { useEffect, useState } from "react";
import { MessageSquarePlus, NotebookText, Tag } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { createDistrictNote, getDistrictNotes, getPriorityRanking } from "../services/api";
import { getLocalizedDistrictName } from "../utils/districtLocalization";

const defaultForm = {
  author_name: "",
  comment: "",
  tag: "meeting",
  action_item: "",
};

export default function DistrictNotesPanel() {
  const { t, language } = useLanguage();
  const ui = language === "hi"
    ? {
        title: "नोट्स और सहयोग",
        subtitle: "किसी जिले में टिप्पणियाँ, टैग और कार्य-आइटम जोड़ें ताकि टीमें एक साझा रिकॉर्ड से काम कर सकें।",
        sharedLog: "साझा जिला लॉग",
        district: "जिला",
        author: "लेखक",
        tag: "टैग",
        actionItem: "कार्य-आइटम",
        comment: "टिप्पणी",
        save: "नोट सहेजें",
        selectedDistrict: "चयनित जिला",
        loading: "लोड हो रहा है...",
        chooseDistrict: "पहले एक जिला चुनें।",
        noteSaved: "नोट सहेजा गया।",
        saveError: "नोट सहेजा नहीं जा सका।",
        typeDistrict: "जिले का नाम लिखें",
        officerName: "अधिकारी का नाम",
        nextStep: "टीम के लिए अगला कदम",
        writeNote: "जिले के बारे में एक छोटा नोट लिखें...",
        noNotes: "इस जिले के लिए अभी कोई नोट नहीं है।",
        actionLabel: "कार्य-आइटम",
      }
    : {
        title: "Notes and collaboration",
        subtitle: "Attach comments, tags, and action items to a district so teams can work from one shared record.",
        sharedLog: "Shared district log",
        district: "District",
        author: "Author",
        tag: "Tag",
        actionItem: "Action item",
        comment: "Comment",
        save: "Save note",
        selectedDistrict: "selected district",
        loading: "Loading...",
        chooseDistrict: "Choose a district first.",
        noteSaved: "Note saved.",
        saveError: "Could not save note.",
        typeDistrict: "Type a district name",
        officerName: "Officer name",
        nextStep: "Next step for the team",
        writeNote: "Write a short note about the district...",
        noNotes: "No notes yet for this district.",
        actionLabel: "Action item",
      };
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getPriorityRanking().then((data) => {
      setDistricts(data || []);
    });
  }, []);

  useEffect(() => {
    if (!selectedDistrict) return;
    setLoading(true);
    getDistrictNotes(selectedDistrict)
      .then((response) => {
        setNotes(response?.notes || []);
      })
      .finally(() => setLoading(false));
  }, [selectedDistrict]);

  const submitNote = async (event) => {
    event.preventDefault();
    setStatus("");

    if (!selectedDistrict) {
      setStatus(ui.chooseDistrict);
      return;
    }

    try {
      await createDistrictNote({
        district: selectedDistrict,
        author_name: form.author_name,
        comment: form.comment,
        tag: form.tag,
        action_item: form.action_item,
      });
      setForm(defaultForm);
      const refreshed = await getDistrictNotes(selectedDistrict);
      setNotes(refreshed?.notes || []);
      setStatus(ui.noteSaved);
    } catch (error) {
      setStatus(error?.response?.data?.detail || ui.saveError);
    }
  };

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
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#ea580c", fontWeight: 700 }}>
          <NotebookText size={18} />
          {ui.sharedLog}
        </div>
      </div>

      <form onSubmit={submitNote} style={{ display: "grid", gap: "14px", marginBottom: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "14px" }}>
          <div>
            <label style={{ display: "block", fontWeight: 700, marginBottom: "8px", color: "#0f172a" }}>{ui.district}</label>
            <input
              list="district-note-options"
              value={selectedDistrict}
              onChange={(event) => setSelectedDistrict(event.target.value)}
              placeholder={ui.typeDistrict}
              style={{ width: "100%", borderRadius: "12px", border: "1px solid #cbd5e1", padding: "12px 14px", boxSizing: "border-box" }}
            />
            <datalist id="district-note-options">
              {districts.map((district) => (
                <option key={district.district} value={district.district}>
                  {getLocalizedDistrictName(t, district.district)}
                </option>
              ))}
            </datalist>
          </div>
          <div>
            <label style={{ display: "block", fontWeight: 700, marginBottom: "8px", color: "#0f172a" }}>{ui.author}</label>
            <input
              value={form.author_name}
              onChange={(event) => setForm((current) => ({ ...current, author_name: event.target.value }))}
              placeholder={ui.officerName}
              style={{ width: "100%", borderRadius: "12px", border: "1px solid #cbd5e1", padding: "12px 14px", boxSizing: "border-box" }}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "14px" }}>
          <div>
            <label style={{ display: "block", fontWeight: 700, marginBottom: "8px", color: "#0f172a" }}>{ui.tag}</label>
            <select
              value={form.tag}
              onChange={(event) => setForm((current) => ({ ...current, tag: event.target.value }))}
              style={{ width: "100%", borderRadius: "12px", border: "1px solid #cbd5e1", padding: "12px 14px", boxSizing: "border-box", background: "white" }}
            >
              <option value="meeting">meeting</option>
              <option value="risk">risk</option>
              <option value="follow-up">follow-up</option>
              <option value="action-item">action-item</option>
              <option value="observation">observation</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontWeight: 700, marginBottom: "8px", color: "#0f172a" }}>{ui.actionItem}</label>
            <input
              value={form.action_item}
              onChange={(event) => setForm((current) => ({ ...current, action_item: event.target.value }))}
              placeholder={ui.nextStep}
              style={{ width: "100%", borderRadius: "12px", border: "1px solid #cbd5e1", padding: "12px 14px", boxSizing: "border-box" }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontWeight: 700, marginBottom: "8px", color: "#0f172a" }}>{ui.comment}</label>
          <textarea
            value={form.comment}
            onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))}
            rows={4}
            placeholder={ui.writeNote}
            style={{ width: "100%", borderRadius: "12px", border: "1px solid #cbd5e1", padding: "12px 14px", boxSizing: "border-box", resize: "vertical" }}
          />
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="submit"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", border: "none", background: "#0f172a", color: "white", fontWeight: 800, borderRadius: "12px", padding: "12px 16px", cursor: "pointer" }}
          >
            <MessageSquarePlus size={18} />
            {ui.save}
          </button>
          {status && <span style={{ color: "#475569" }}>{status}</span>}
        </div>
      </form>

      <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <h3 style={{ margin: 0, color: "#0f172a" }}>
            {language === "hi" ? "नोट्स के लिए " : "Notes for "}{selectedDistrict ? getLocalizedDistrictName(t, selectedDistrict) : ui.selectedDistrict}
          </h3>
          {loading && <span style={{ color: "#64748b" }}>{ui.loading}</span>}
        </div>

        {notes.length ? (
          <div style={{ display: "grid", gap: "12px" }}>
            {notes.map((note) => (
              <div key={note.id} style={{ borderRadius: "16px", border: "1px solid #e2e8f0", padding: "16px", background: "#f8fafc" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginBottom: "8px", flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 800, color: "#0f172a" }}>{note.author_name}</div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ background: "#ffedd5", color: "#c2410c", borderRadius: "999px", padding: "5px 10px", fontSize: "0.8rem", fontWeight: 800 }}>
                      <Tag size={12} style={{ display: "inline", marginRight: "5px" }} />
                      {note.tag}
                    </span>
                    <span style={{ color: "#64748b", fontSize: "0.85rem" }}>{new Date(note.created_at).toLocaleString()}</span>
                  </div>
                </div>
                <div style={{ color: "#334155", lineHeight: 1.7, marginBottom: "8px" }}>{note.comment}</div>
                {note.action_item ? (
                  <div style={{ color: "#0f172a", fontWeight: 700 }}>
                    {ui.actionLabel}: <span style={{ color: "#475569", fontWeight: 500 }}>{note.action_item}</span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ borderRadius: "16px", border: "1px dashed #cbd5e1", padding: "20px", color: "#64748b" }}>
            {ui.noNotes}
          </div>
        )}
      </div>
    </div>
  );
}
