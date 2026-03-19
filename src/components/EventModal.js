import React, { useState } from "react";
import Modal from "react-modal";

Modal.setAppElement("#root");

const calendarOptions = ["personal", "google", "band", "schoology", "remind"];

export default function EventModal({ start, onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [calendarType, setCalendarType] = useState("personal");

  const handleSubmit = () => {
    if (!title) return;
    onSave({
      title,
      start,
      end: start,
      calendarType
    });
    onClose();
  };

  return (
    <Modal isOpen onRequestClose={onClose} contentLabel="Add Event" style={{ content: { maxWidth: "400px", margin: "auto" } }}>
      <h2>Add Event</h2>
      <input
        type="text"
        placeholder="Event Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: "100%", padding: "6px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
      />
      <select
        value={calendarType}
        onChange={(e) => setCalendarType(e.target.value)}
        style={{ width: "100%", padding: "6px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
      >
        {calendarOptions.map((c) => (
          <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
        ))}
      </select>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button onClick={handleSubmit} style={{ backgroundColor: "#34A853", color: "white", padding: "6px 12px", borderRadius: "5px", border: "none" }}>Save</button>
        <button onClick={onClose} style={{ backgroundColor: "#F44336", color: "white", padding: "6px 12px", borderRadius: "5px", border: "none" }}>Cancel</button>
      </div>
    </Modal>
  );
}
useEffect(() => {
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }
}, []);
new Notification("Event coming up!", {
  body: "Check your On Time calendar"
});