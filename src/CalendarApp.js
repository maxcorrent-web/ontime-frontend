import "./calendar.css";
import React, { useEffect, useState } from "react";
import axios from "axios";

const BACKEND = "https://ontime-backend-5.onrender.com";

function CalendarApp() {

  const [events, setEvents] = useState([]);
  const [icsLink, setIcsLink] = useState("");

  const fetchEvents = async () => {
    const res = await axios.get(`${BACKEND}/api/events`);
    setEvents(res.data);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const addCalendar = async () => {
    if (!icsLink) return;

    await axios.post(`${BACKEND}/api/add-ics`, {
      url: icsLink
    });

    setIcsLink("");
    fetchEvents();
  };

  return (
    <div className="container">

      <h1 className="title">On Time</h1>

      <div className="input-section">
        <input
          type="text"
          placeholder="Paste Google / School / Band calendar link..."
          value={icsLink}
          onChange={(e) => setIcsLink(e.target.value)}
        />

        <button onClick={addCalendar}>
          Add Calendar
        </button>
      </div>

      <div className="events">

        {events.length === 0 && (
          <p className="no-events">
            No events yet — add a calendar above
          </p>
        )}

        {events.map((event, index) => (
          <div key={index} className="event">

            <h3>{event.title}</h3>

            <p>
              {new Date(event.start).toLocaleString()}
            </p>

          </div>
        ))}

      </div>

    </div>
  );
}

export default CalendarApp;