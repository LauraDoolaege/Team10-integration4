import { Form } from "react-router";
import { useEffect, useRef, useState } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { io } from "socket.io-client";

let socket;

export default function InitiatorForm({ actionData, score, image }) {
  console.log(actionData?.cafeId);
  const moods = [
    "Beer & Banter",
    "Cocktails, darling",
    "Mocktails & chill",
    "Wine & refined",
  ];

  const [formState, setFormState] = useState(0);

  const [formData, setFormData] = useState({
    possibleDates: "",
    expectedPlayers: 4,
    budget: 0,
    mood: "",
    username: "",
    email: "",
    cafe: "",
  });

  const [shareLink, setShareLink] = useState("");
  const dateInputRef = useRef(null);

  const updateField = (field, value) => {
    setFormData((prev) => ({ //prev current 
      ...prev,
      [field]: value,
    }));
  };

  const handleMoodSelect = (mood) => {
    updateField("mood", mood);
  };

  const handleRandomPick = () => {
    const randomMood = "random"
    // moods[Math.floor(Math.random() * moods.length)];
    updateField("mood", randomMood);
  };

  const canGoNext = () => {
    switch (formState) {
      case 1:
        return formData.possibleDates.trim().length > 0;

      case 2:
        return Number(formData.expectedPlayers) >= 2;

      case 3:
        return formData.budget !== "";

      case 4:
        return formData.mood.trim().length > 0;

      case 5:
        return (
          formData.username.trim() &&
          formData.email.trim() &&
          formData.cafe.trim()
        );

      default:
        return true;
    }
  };

  useEffect(() => {
    console.log("formData changed:", formData);
  }, [formData]);

  useEffect(() => {
    if (actionData?.tripId) {
      setShareLink(
        `${window.location.origin}/friend/${actionData.tripId}`
      );
    }
  }, [actionData]);

  useEffect(() => {
    let playerId = localStorage.getItem("playerId");

    if (!playerId) {
      playerId = crypto.randomUUID();
      localStorage.setItem("playerId", playerId);
    }

    socket = io();

    socket.on("connect", () => {
      console.log("Connected:", socket.id);
      socket.emit("identify", { playerId });
    });

    socket.on("clients", (data) => {
      console.log("Clients:", data);
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (!dateInputRef.current) return;
    console.log("Flatpickr init element:", dateInputRef.current);
    const fp = flatpickr(dateInputRef.current, {
      inline: true,
      mode: "multiple",
      dateFormat: "Y-m-d",
      onChange: (selectedDates, dateStr) => {
        updateField("possibleDates", dateStr);
      },
    });

    return () => fp.destroy();
  }, [formState]);

  async function handleShare() {
    if (!shareLink) return;

    await navigator.share({
      title: "Hey, come and compete for a drink!",
      text: "Let's all meet up and compete for a drink.",
      url: shareLink,
    });
  }

  return (
    <>
      <h1> Trip Competition Portal</h1>

      <Form method="post" onSubmit={(e) => {
        const fd = new FormData(e.currentTarget);

        console.log(
          "Submitting possibleDates:",
          fd.get("possibleDates")
        );
      }}>
        {formState === 0 && (
          <>
            <h2>Let's start planning with 4 steps!</h2>
            <button
              type="button"
              onClick={() => setFormState(1)}
              className="button-primary"
            >
              Start Planning
            </button>
          </>
        )}


        {formState === 1 && (
          <label>
            Possible Dates
            <div ref={dateInputRef} className="calendar-wrapper" />
          </label>
        )}

        {formState === 2 && (
          <div>
            <h2> Expected Players</h2>
            <p>how many people are traveling</p>
            <div className="stepper">
              <button
                type="button"
                onClick={() =>
                  updateField(
                    "expectedPlayers",
                    Math.max(2, formData.expectedPlayers - 1)
                  )
                }
              >
                −
              </button>

              <span>{formData.expectedPlayers}</span>

              <button
                type="button"
                onClick={() =>
                  updateField(
                    "expectedPlayers",
                    formData.expectedPlayers + 1
                  )
                }
              >
                +
              </button>
            </div>
          </div>
        )}


        {formState === 3 && (
          <div>
            Budget
            <p>what's in your budget</p>
            <input
              type="range"
              min={0}
              max={1000}
              value={formData.budget}
              onChange={(e) => {
                updateField("budget", e.target.value)
                console.log("Budget updated:", e.target.value)
              }}
            />
            <span>€{formData.budget}</span>
          </div>
        )}

        {formState === 4 && (
          <div className="preferences-container">
            <h2>Preferences</h2>

            <div className="mood-buttons">
              {moods.map((mood) => (
                <button
                  key={mood}
                  type="button"
                  className={
                    formData.mood === mood ? "active" : ""
                  }
                  onClick={() => handleMoodSelect(mood)}
                >
                  {mood}
                </button>
              ))}
            </div>

            <button
              type="button"
              className={
                formData.mood === "random" ? "active" : ""
              }
              onClick={handleRandomPick}
            >
              🎲 Random mood
            </button>
          </div>
        )}


        {formState === 5 && (
          <div>
            <label>
              Username
              <input
                value={formData.username}
                onChange={(e) =>
                  updateField(
                    "username",
                    e.target.value
                  )
                }
              />
            </label>

            <label>
              Email
              <input
                value={formData.email}
                onChange={(e) =>
                  updateField("email", e.target.value)
                }
              />
            </label>

            <label>
              Café
              <input
                value={formData.cafe}
                onChange={(e) =>
                  updateField("cafe", e.target.value)
                }
              />
            </label>
          </div>
        )}


        {formState > 0 && formState < 6 && (
          <div className="buttons">
            <button
              type="button"
              onClick={() =>
                setFormState((s) => Math.max(0, s - 1))
              }
            >
              Previous
            </button>

            <button
              className="button-primary"
              type="button"
              disabled={!canGoNext()}
              onClick={() => {
                if (canGoNext()) {
                  setFormState((s) =>
                    Math.min(6, s + 1)
                  );
                }
              }}
            >
              Next
            </button>
          </div>
        )}

        {formState === 6 && (
          <button

            type="submit"
            className="submit__btn button-primary"
          >
            Done
          </button>
        )}

        <input
          type="hidden"
          name="possibleDates"
          value={formData.possibleDates}
        />

        <input
          type="hidden"
          name="expectedPlayers"
          value={formData.expectedPlayers}
        />

        <input
          type="hidden"
          name="score"
          value={score}
        />

        <input
          type="hidden"
          name="image"
          value={image}
        />

        <input
          type="hidden"
          name="budget"
          value={formData.budget}
        />

        <input
          type="hidden"
          name="mood"
          value={formData.mood}
        />

        <input
          type="hidden"
          name="username"
          value={formData.username}
        />

        <input
          type="hidden"
          name="email"
          value={formData.email}
        />

        <input
          type="hidden"
          name="cafe"
          value={formData.cafe}
        />
      </Form>

      {actionData?.success && (
        <p>Trip created for {actionData.cafe}</p>
      )}

      {shareLink && (
        <>
          <a href={shareLink}>{shareLink}</a>
          <button onClick={handleShare}>
            Share
          </button>
        </>
      )}
    </>
  );
}
