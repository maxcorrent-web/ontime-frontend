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

      // Helper to add ICS calendar
      const tryAdd = async (url, name) => {
        if (!url) return;
        try {
          await fetch(`${BACKEND_URL}/api/add-ics`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
          });
          console.log(`${name} loaded`);
        } catch (err) {
          console.error(`${name} failed`, err);
        }
      };

      // Load all calendars in parallel
      await Promise.all([
        tryAdd(schoologyUrl, "Schoology"),
        tryAdd(bandUrl, "Band"),
        tryAdd(googleUrl, "Google"),
      ]);

      // Get merged events
      const res = await fetch(`${BACKEND_URL}/api/events`);
      const data = await res.json();

      // Color-code events
      const colored = data.map((event) => {
        let color = "#6366f1"; // default purple
        switch (event.source) {
          case "schoology":
            color = "#2563eb"; // blue
            break;
          case "band":
            color = "#16a34a"; // green
            break;
          case "google":
            color = "#dc2626"; // red
            break;
        }
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
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="header text-center mb-6">
        <h1 className="text-4xl font-bold text-indigo-600">📅 On Time</h1>
        <p className="text-gray-500 mt-2">
          Merge your Schoology, Band, and Google calendars
        </p>
      </div>

      {/* Input boxes */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <input
          placeholder="Paste Schoology ICS URL"
          value={schoologyUrl}
          onChange={(e) => setSchoologyUrl(e.target.value)}
          className="border p-2 rounded-md w-full md:w-1/3"
        />
        <input
          placeholder="Paste Band Calendar ICS URL"
          value={bandUrl}
          onChange={(e) => setBandUrl(e.target.value)}
          className="border p-2 rounded-md w-full md:w-1/3"
        />
        <input
          placeholder="Paste Google Calendar ICS URL"
          value={googleUrl}
          onChange={(e) => setGoogleUrl(e.target.value)}
          className="border p-2 rounded-md w-full md:w-1/3"
        />
        <button
          onClick={fetchEvents}
          className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition"
        >
          Load Calendars
        </button>
      </div>

      {/* Calendar */}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        editable={true}
        selectable={true}
        events={events}
        height="auto"
        nowIndicator={true}
        weekNumbers={true}
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
      />
    </div>
  );
}

export default CalendarApp;