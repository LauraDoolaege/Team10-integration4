import { Form, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import Game from "../components/game";
import Camera from "../components/camera";

export default function TripForm({ receivedTrip, playerId, actionData }) {
  const navigate = useNavigate();
  
  // Load attempts from sessionStorage
  const [attempts, setAttempts] = useState(() => {
    return Number(sessionStorage.getItem("attempts") || 0);
  });

  // Load score from sessionStorage
  const [score, setScore] = useState(() => {
    return Number(sessionStorage.getItem("score") || 0);
  });

  // Load image from sessionStorage
  const [image, setImage] = useState(() => {
    return sessionStorage.getItem("capturedImage") || null;
  });

  // Derive initial state based on attempts: 
  // If 3 or more attempts, go to score summary (5). 
  // Otherwise, start with intro (0).
  const [formState, setFormState] = useState(() => {
    const savedAttempts = Number(sessionStorage.getItem("attempts") || 0);
    return savedAttempts >= 3 ? 5 : 0;
  });

  const [formData, setFormData] = useState({
    dates: [],
    username: "",
    email: "",
  });

  const dateInputRef = useRef(null);

  const alreadyVoted = receivedTrip?.alreadyVoted;
  const trip = receivedTrip?.trip;
  const tripId = trip?.id;
  const cafe = receivedTrip?.trip?.cafe;

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Persist attempts to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("attempts", String(attempts));
  }, [attempts]);

  // Persist score to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("score", String(score));
  }, [score]);

  // Persist image to sessionStorage
  useEffect(() => {
    if (image) {
      sessionStorage.setItem("capturedImage", image);
    }
  }, [image]);

  useEffect(() => {
    if (alreadyVoted && tripId) {
      navigate(`/leaderboard/${tripId}`);
    }
  }, [alreadyVoted, tripId, navigate]);

  useEffect(() => {
    if (!dateInputRef.current || !trip?.possibleDates || formState !== 1) return;

    const fp = flatpickr(dateInputRef.current, {
      inline: true,
      mode: "multiple",
      dateFormat: "Y-m-d",
      prevArrow: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 6C15 6 9 10.4189 9 12C9 13.5812 15 18 15 18" stroke="#111111" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      nextArrow: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.00005 6C9.00005 6 15 10.4189 15 12C15 13.5812 9 18 9 18" stroke="#111111" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      enable: trip.possibleDates,
      onDayCreate: (selectedDates, dateStr, fp, dayElem) => {
        const date = dayElem.dateObj;
        if (!date) return;

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const dateString = `${year}-${month}-${day}`;

        if (trip.possibleDates.includes(dateString)) {
          dayElem.classList.add("possible-date");
        }
      },
      onChange: (selectedDates, dateStr) => {
        const selected = dateStr.split(',').filter(Boolean).map(d => d.trim());
        updateField("dates", selected);
      },
    });

    return () => fp.destroy();
  }, [formState, trip?.possibleDates]);

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

  if (actionData?.success) {
    return <p>Your vote has been submitted!</p>;
  }

  return (
    <>
      <div style={{ textAlign: "center", display: (formState === 3 || formState === 4) ? "none" : "block" }}>
        <h1>Official Trip Competition Portal</h1>
        <h2>Friend Invite Page</h2>
        <h3>{trip ? cafe.name : "Loading trip..."}</h3>
      </div>

      {/* States 0-2: Form Steps (Dates, Info) */}
      {formState < 3 && (
        <div className="form-container form-fixed">
          {formState === 0 && (
            <>
              <h2>Join the trip!</h2>
              <p>Challenge your friends after selecting your preferred dates! </p>
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

          {formState > 0 && (
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
                  if (canGoNext()) setFormState((s) => s + 1);
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* State 3: Camera capture before the game */}
      {formState === 3 && (
     <>
          <h2>Capture your face</h2>
          <p>This will be used for your character in the game!</p>
          <Camera 
            image={image} 
            setImage={setImage} 
            setState={() => setFormState(4)} 
          />
       </>
      )}

      {/* State 4: Game */}
      {formState === 4 && attempts < 3 && (
        <Game 
          image={image}
          attempt={attempts + 1} 
          onGameOver={(gameScore) => {
            const nextScore = Math.max(score, gameScore);
            const nextAttempts = Math.min(attempts + 1, 3);
            setScore(nextScore);
            setAttempts(nextAttempts);
            if (nextAttempts >= 3) {
              setFormState(5);
            }
          }}
        />
      )}

      {/* State 5: Submission / Summary */}
      {formState === 5 && (
        <Form method="post" className="form-container form-fixed">
          {/* Hidden inputs to pass all collected data */}
          <input type="hidden" name="tripId" value={tripId} />
          <input type="hidden" name="playerId" value={playerId} />
          {formData.dates.map((date) => (
            <input key={date} type="hidden" name="dates" value={date} />
          ))}
          <input type="hidden" name="username" value={formData.username} />
          <input type="hidden" name="email" value={formData.email} />
          <input type="hidden" name="score" value={score} />
          <input type="hidden" name="image" value={image} />

          <div style={{ textAlign: "center", marginTop: "auto", marginBottom: "auto" }}>
            <h2>All attempts completed!</h2>
            <p>Your highest score: {score}</p>
            <button type="submit" className="submit__btn button-primary">
              Submit Vote
            </button>
          </div>
        </Form>
      )}
    </>
  )
}