import React, { useState, useEffect, useCallback } from "react";
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

  // ✅ Load saved URLs ONLY (no auto fetch)
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("calendars"));
    if (saved) {
      setSchoologyUrl(saved.schoology || "");
      setBandUrl(saved.band || "");
      setGoogleUrl(saved.google || "");
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    if (!schoologyUrl && !bandUrl && !googleUrl) {
      alert("Please paste at least one calendar link.");
      return;
    }

    try {
      setEvents([]);

      // Save URLs
      localStorage.setItem(
        "calendars",
        JSON.stringify({
          schoology: schoologyUrl,
          band: bandUrl,
          google: googleUrl,
        })
      );

      // Clear backend FIRST
      await fetch(`${BACKEND_URL}/api/clear`, { method: "POST" });

      // Add calendars
      const addCalendar = async (url, source) => {
        if (!url) return;
        await fetch(`${BACKEND_URL}/api/add-ics`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, source }),
        });
      };

      await Promise.all([
        addCalendar(schoologyUrl, "schoology"),
        addCalendar(bandUrl, "band"),
        addCalendar(googleUrl, "google"),
      ]);

      // Fetch events
      const res = await fetch(`${BACKEND_URL}/api/events`);
      const data = await res.json();

      // Color + dedupe
      const seen = new Set();
      const formatted = data
        .map((event) => {
          let color;
          switch (event.source) {
            case "schoology":
              color = "#2563eb";
              break;
            case "band":
              color = "#16a34a";
              break;
            case "google":
              color = "#dc2626";
              break;
            default:
              color = "#6366f1";
          }

          return {
            title: event.title,
            start: event.start,
            end: event.end,
            backgroundColor: color,
            borderColor: color,
            extendedProps: { source: event.source },
          };
        })
        .filter((ev) => {
          const key = ev.title + ev.start + ev.extendedProps.source;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

      setEvents(formatted);
    } catch (err) {
      console.error(err);
      alert("Error loading calendar.");
    }
  }, [schoologyUrl, bandUrl, googleUrl]);

  return (
    <div className="app">
      <div className="header">
        <h1>📅 On Time</h1>
        <p>All your calendars. One place.</p>
      </div>

      <div className="inputs">
        <input
          placeholder="Schoology ICS URL"
          value={schoologyUrl}
          onChange={(e) => setSchoologyUrl(e.target.value)}
        />
        <input
          placeholder="Band / Remind ICS URL"
          value={bandUrl}
          onChange={(e) => setBandUrl(e.target.value)}
        />
        <input
          placeholder="Google Calendar ICS URL"
          value={googleUrl}
          onChange={(e) => setGoogleUrl(e.target.value)}
        />
        <button onClick={fetchEvents}>Load Calendars</button>
      </div>

      <div className="calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          height="auto"
          nowIndicator={true}
          slotMinTime="00:00:00"
          slotMaxTime="24:00:00"
          eventMinHeight={30}
          dayMaxEvents={true}
          eventContent={(arg) => (
            <div className="event-box">{arg.event.title}</div>
          )}
        />
      </div>
    </div>
  );
}

export default CalendarApp;