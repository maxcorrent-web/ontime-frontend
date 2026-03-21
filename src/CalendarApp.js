import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./calendar.css";

const BACKEND_URL = "https://ontime-backend-5.onrender.com";

function CalendarApp() {
  const [schoologyUrl, setSchoologyUrl] = useState("");
  const [bandUrl, setBandUrl] = useState("");
  const [googleUrl, setGoogleUrl] = useState("");
  const [events, setEvents] = useState([]);

  // Load saved calendars
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("calendars"));
    if (saved) {
      setSchoologyUrl(saved.schoology || "");
      setBandUrl(saved.band || "");
      setGoogleUrl(saved.google || "");
    }
  }, []);

  const fetchEvents = async () => {
    console.log("BUTTON CLICKED");
    try {
      // Save URLs
      localStorage.setItem(
        "calendars",
        JSON.stringify({
          schoology: schoologyUrl,
          band: bandUrl,
          google: googleUrl,
        })
      );

      // Clear backend calendars
      await fetch(`${BACKEND_URL}/api/clear`, { method: "POST" });

      // Add calendars

    const tryAdd = async (url, name) => {
  if (!url) return;

  try {
    await fetch(`${BACKEND_URL}/api/add-ics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });
    console.log(`${name} loaded`);
  } catch (err) {
    console.error(`${name} failed`);
  }
};

await tryAdd(schoologyUrl, "Schoology");
await tryAdd(bandUrl, "Band");
await tryAdd(googleUrl, "Google");

      // Get merged events
      const res = await fetch(`${BACKEND_URL}/api/events`);
      const data = await res.json();

      // Color-code events
      const colored = data.map((event, index) => {
        let color = "#6366f1";

        if (index % 3 === 0) color = "#2563eb"; // blue
        if (index % 3 === 1) color = "#16a34a"; // green
        if (index % 3 === 2) color = "#dc2626"; // red

        return {
          title: event.title,
          start: event.start,
          end: event.end,
          backgroundColor: color,
          borderColor: color,
        };
      });

      setEvents(colored);
    } catch (err) {
      console.error("Error loading calendars:", err);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <img src="/logo.png" alt="logo" className="logo" />
        <h1>On Time</h1>
      </div>

      <div className="input-boxes">
        <input
          placeholder="Paste Schoology ICS URL"
          value={schoologyUrl}
          onChange={(e) => setSchoologyUrl(e.target.value)}
        />

        <input
          placeholder="Paste Band Calendar ICS URL"
          value={bandUrl}
          onChange={(e) => setBandUrl(e.target.value)}
        />

        <input
          placeholder="Paste Google Calendar ICS URL"
          value={googleUrl}
          onChange={(e) => setGoogleUrl(e.target.value)}
        />

        <button onClick={fetchEvents}>Load Calendars</button>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        editable={true}
        selectable={true}
        events={events}
        height="80vh"
      />
    </div>
  );
}

export default CalendarApp;