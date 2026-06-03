import { Form } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";

export default function TripForm({ receivedTrip, playerId, actionData }) {
  const [message, setMessage] = useState("");
  const [formState, setFormState] = useState(0);

  const [formData, setFormData] = useState({
    dates: [],
    username: "",
    email: "",
  });

  const dateInputRef = useRef(null);

  const alreadyVoted = receivedTrip?.alreadyVoted;
  const trip = receivedTrip?.trip;
  const tripId = trip?.id;
  const cafe = receivedTrip.trip.cafe

  useEffect(() => {
    if (alreadyVoted) {
      setMessage("You already voted for this trip.");
    }
  }, [alreadyVoted]);

  useEffect(() => {
    if (!dateInputRef.current || !trip?.possibleDates) return;
    
    const fp = flatpickr(dateInputRef.current, {
      inline: true,
      mode: "multiple",
      dateFormat: "Y-m-d",
      enable: trip.possibleDates,
      // onDayCreate fires every time a day cell is built in the calendar UI
      onDayCreate: (selectedDates, dateStr, fp, dayElem) => {
        // dayElem.dateObj contains the actual Date object for the cell being rendered
        const date = dayElem.dateObj;
        if (!date) return;
        
        // Format the date into YYYY-MM-DD to match the format in trip.possibleDates
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const dateString = `${year}-${month}-${day}`;

        // If this specific date is an option from the trip, add a custom class
        // which triggers the grey circle highlight from government.css
        if (trip.possibleDates.includes(dateString)) {
          dayElem.classList.add("possible-date");
        }
      },
      
      // onChange fires when a user selects or deselects a date
      onChange: (selectedDates, dateStr) => {
        // dateStr is a comma-separated string of selected dates. 
        // We split it, remove empty strings, and store it as an array in formData
        const selected = dateStr.split(',').filter(Boolean).map(d => d.trim());
        updateField("dates", selected);
      },
    });

    return () => fp.destroy();
  }, [formState, trip?.possibleDates]);

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const canGoNext = () => {
    switch (formState) {
      case 1:
        return formData.dates.length > 0;
      case 2:
        return formData.username.trim() && formData.email.trim();
      default:
        return true;
    }
  };

  return (
    <>
      <h1>Official Trip Competition Portal</h1>
      <h2>Friend Invite Page</h2>
      <h3>{trip ? cafe.name : "Loading trip..."}</h3>

      {message && <p>{message}</p>}
      
      {trip && !message && !actionData?.success && (
        <Form method="post">
          <input type="hidden" name="tripId" value={tripId} />
          <input type="hidden" name="playerId" value={playerId} />

          {formData.dates.map((date) => (
            <input key={date} type="hidden" name="dates" value={date} />
          ))}

          <input type="hidden" name="username" value={formData.username} />
          <input type="hidden" name="email" value={formData.email} />

          {formState === 0 && (
            <>
              <label>Join the trip!</label>
              <button
                type="button"
                onClick={() => setFormState(1)}
                className="button-primary"
              >
                Start Voting
              </button>
            </>
          )}

          {formState === 1 && (
            <div className="preferences-container">
              <h2>Select Dates</h2>
              <p>When are you available?</p>
              <div ref={dateInputRef} className="calendar-wrapper trip-calendar" />
            </div>
          )}

          {formState === 2 && (
            <div>
              <label>
                Username
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => updateField("username", e.target.value)}
                  required
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  required
                />
              </label>
            </div>
          )}

          {formState > 0 && formState < 3 && (
            <div className="buttons">
              <button
                type="button"
                onClick={() => setFormState((s) => Math.max(0, s - 1))}
              >
                Previous
              </button>
              <button
                className="button-primary"
                type="button"
                disabled={!canGoNext()}
                onClick={() => {
                  if (canGoNext()) setFormState((s) => Math.min(3, s + 1));
                }}
              >
                Next
              </button>
            </div>
          )}

          {formState === 3 && (
            <button type="submit" className="submit__btn button-primary">
              Submit Vote
            </button>
          )}
        </Form>
      )}

      {actionData?.success && <p>Your vote has been submitted!</p>}
    </>
  );
}
