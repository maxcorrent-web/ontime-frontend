import React, { useState } from "react";
import { useEffect } from "react";
useEffect(() => {
  const saved = JSON.parse(localStorage.getItem("calendars"));
  if (saved) {
    setSchoologyUrl(saved.schoology || "");
    setBandUrl(saved.band || "");
    setGoogleUrl(saved.google || "");
  }
}, []);
localStorage.setItem("calendars", JSON.stringify({
  schoology: schoologyUrl,
  band: bandUrl,
  google: googleUrl
}));
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

  const fetchEvents = async () => {
  try {
    // Clear old calendars first
    await fetch(`${BACKEND_URL}/api/clear`, { method: "POST" });

    // Add each calendar
    const add = async (url) => {
      if (!url) return;
      await fetch(`${BACKEND_URL}/api/add-ics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url })
      });
    };

    await add(schoologyUrl);
    await add(bandUrl);
    await add(googleUrl);

    // Fetch merged events
    const res = await fetch(`${BACKEND_URL}/api/events`);
    const data = await res.json();

    // Color coding
    const colored = data.map((event, i) => ({
      ...event,
      backgroundColor:
        i % 3 === 0 ? "#2563eb" :
        i % 3 === 1 ? "#16a34a" :
        "#dc2626"
    }));

    setEvents(colored);

  } catch (err) {
    console.error(err);
  }
};
<FullCalendar
  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
  editable={true}
  selectable={true}
  events={events}
/>
export default CalendarApp;