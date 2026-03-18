import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./styles/calendar.css";

const BACKEND_URL = "https://ontime-backend-5.onrender.com";

function CalendarApp() {
  const [schoologyUrl, setSchoologyUrl] = useState("");
  const [bandUrl, setBandUrl] = useState("");
  const [googleUrl, setGoogleUrl] = useState("");
  const [events, setEvents] = useState([]);

  const fetchEvents = async () => {
    let allEvents = [];

    const fetchSource = async (url, color) => {
      if (!url) return;
      try {
        const res = await fetch(`${BACKEND_URL}/events?url=${encodeURIComponent(url)}`);
        const data = await res.json();

        const colored = data.map(event => ({
          title: event.title,
          start: event.start,
          end: event.end,
          backgroundColor: color,
          borderColor: color
        }));

        allEvents = [...allEvents, ...colored];
      } catch (err) {
        console.error("Error loading events:", err);
      }
    };

    await fetchSource(schoologyUrl, "#2563eb"); // blue
    await fetchSource(bandUrl, "#16a34a");      // green
    await fetchSource(googleUrl, "#dc2626");    // red

    setEvents(allEvents);
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
        events={events}
        height="80vh"
      />
    </div>
  );
}

export default CalendarApp;