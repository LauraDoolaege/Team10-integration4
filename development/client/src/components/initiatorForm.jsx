import { Form } from "react-router";
import { useEffect, useRef, useState } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { io } from "socket.io-client";

import FormNavigation from "./initiatorFormNavigation";

import pfpSrc from "../assets/images/Planning/step1/pfp.avif";
import buidlSrc from "../assets/images/Planning/step1/building.avif";

import tableSrc from "../assets/images/Planning/step3/table.avif";
import beerSrc from "../assets/images/Planning/step3/beer.avif";
import wineSrc from "../assets/images/Planning/step3/wine.avif";
import coffeeSrc from "../assets/images/Planning/step3/coffee.avif";
import lateSrc from "../assets/images/Planning/step3/late.avif";

import pinkStarSrc from "../assets/images/Planning/step4/star.avif";
import walletSrc from "../assets/images/Planning/step4/wallet.avif";
import billSrc from "../assets/images/Planning/step4/bill.avif";

import beerSrc2 from "../assets/images/Planning/step5/beer.avif";
import cocktailSrc from "../assets/images/Planning/step5/cocktail.avif";

import wineSrc2 from "../assets/images/Planning/step5/wine.avif";
import diceSrc from "../assets/images/Planning/step5/dice.avif";


let socket;

export default function InitiatorForm({ actionData, nickname, score, image }) {
  console.log(actionData?.cafeId);
  const moods = [
    {mood:"Beer & Banter", path: beerSrc2},
    {mood:"Cocktails, darling", path: cocktailSrc},
    {mood:"Mocktails & chill", path: coffeeSrc},
    {mood:"Wine & refined", path: wineSrc2},
  ];



  const [formState, setFormState] = useState(0);

  const [formData, setFormData] = useState({
    possibleDates: "",
    expectedPlayers: 2,
    budget: 0,
    mood: "",
    email: "",
    cafe: "",
  });

  const dateInputRef = useRef(null);

  useEffect(() => {
    if (actionData?.errors && actionData.errors.length > 0) {
      // Find the first formState from errors and jump to it
      const firstError = actionData.errors[0];
      setFormState(firstError.formState);
    } else if (actionData?.error) {
      // General error: jump back to the last step to show it
      setFormState(5);
    }
  }, [actionData]);

 
  const updateField = (field, value) => {
    setFormData((prev) => ({ //prev current 
      ...prev,
      [field]: value,
    }));
  };

  const handleMoodSelect = (mood) => {
    updateField("mood", mood.mood);
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
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()) //regex test for basic email format validation
        );

      default:
        return true;
    }
  };

  useEffect(() => {
    console.log("formData changed:", formData);
  }, [formData]);

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
      defaultDate: formData.possibleDates,
      minDate: "today",
      prevArrow: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 6C15 6 9 10.4189 9 12C9 13.5812 15 18 15 18" stroke="#111111" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      nextArrow: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.00005 6C9.00005 6 15 10.4189 15 12C15 13.5812 9 18 9 18" stroke="#111111" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      onChange: (selectedDates, dateStr) => {
        updateField("possibleDates", dateStr);
      },
    });

    return () => fp.destroy();
  }, [formState, formData.possibleDates]);

  return (
    <>
      <Form method="post" onSubmit={(e) => {
        const fd = new FormData(e.currentTarget);

        console.log(
          "Submitting possibleDates:",
          fd.get("possibleDates")
        );
      }}>


        {formState === 0 && (
          <div className="form-container leaderboard">
          <div className="leaderboard__header">
          <h2 className="title">Leaderboard!</h2>
          <ol className="leaderboard__list">
            <li className="leaderboard__player">
              <div className="leaderboard__splitter">
              <span className="leaderboard__rank">1</span>
              <div className="leaderboard__seperator">
              
              <img className={image?"leaderboard__image":"leaderboard__image-default"} src={image ? image : pfpSrc} alt="playerImg"/>
              <p className="leaderboard__nickname">{nickname}</p>
              </div>
              </div>
               
                  <p className="leaderboard__score">{score}pts</p>


            </li>

             <li className="leaderboard__player-loser">
              <div className="leaderboard__splitter">
              <span className="leaderboard__rank">2</span>
              <div className="leaderboard__seperator">
              <img className="leaderboard__image-default" src={pfpSrc} alt="playerImg"/>
              <p className="leaderboard__nickname">Nickname</p>
              </div>
              </div>
               
                  <p className="leaderboard__score">00pts</p>


            </li>
            <li className="leaderboard__player-loser">
              <div className="leaderboard__splitter">
              <span className="leaderboard__rank">3</span>
              <div className="leaderboard__seperator">
              <img className="leaderboard__image-default" src={pfpSrc} alt="playerImg"/>
              <p className="leaderboard__nickname">Nickname</p>
              </div>
              </div>
               
                  <p className="leaderboard__score">00pts</p>


            </li>
            
          </ol>
          </div>
          <img src={buidlSrc} className="leaderboard__buildings" alt="buildings" />
          <div className="leaderboard__cta">
            <h3 className="leaderboard__subtitle">Looks like you're in the lead!</h3>
            <p className="text leaderboard__cta-text">Now <span className="highlight-bold">let's plan a trip </span> and invite your friends to <span className="highlight-bold">fill this leaderboard!</span></p>
            <button className="button__arrow-fill" onClick={() => setFormState(1)}>
            <p>Plan the trip!</p>
                        <svg width="10" height="18" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0.750127 0.75C0.750127 0.75 8.75006 6.64187 8.75006 8.75C8.75006 10.8583 0.750061 16.75 0.750061 16.75" stroke="#C3C3C3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
          </button>
          </div>
        </div>

        )}

        {formState === 1 && (
          <div className="form-container"> 
           <fieldset className="form-container-step">
            <legend className="visually-hidden">Step 1: Select possible dates</legend>
            <FormNavigation currentStep={formState} setStep={setFormState} page="initiator" canGoNext={canGoNext} />

            <div className="form__text-content">
            <h2 className="title">Dates</h2>
            <p >when are you free for a drink?</p>
            </div>
        
            <div ref={dateInputRef} className="calendar-wrapper" aria-label="Calendar for date selection" />
          </fieldset>
          </div>
        )}

        {formState === 2 && (
          <div className="form-container"> 
           <fieldset className="form-container-step">
            <legend className="visually-hidden">Step 2: Expected number of players</legend>
              <FormNavigation currentStep={formState} setStep={setFormState} page="initiator" canGoNext={canGoNext} />

            <div className="form__text-content">
            <h2 className="title">Players</h2>
            <p >Friends in your trip group <span>(up to 10)</span></p>
            </div>
        
            <div className="stepper-container">
            <div className="stepper">
              <button
                type="button"
                aria-label="Decrease player count"
                disabled={formData.expectedPlayers <= 2}
                onClick={() =>
                  updateField(
                    "expectedPlayers",
                    Math.max(2, formData.expectedPlayers - 1)
                  )
                  
                }
              >
                -
              </button>

              <span aria-live="polite" aria-atomic="true" aria-label={`${formData.expectedPlayers} players selected`}>{formData.expectedPlayers}</span>

              <button
                type="button"
                aria-label="Increase player count"
                disabled={formData.expectedPlayers >= 10}
                onClick={() =>
                  updateField(
                    "expectedPlayers",
                    Math.min(10, formData.expectedPlayers + 1)
                  )
                }
              >
                +
              </button>
            </div>

            <div className="stepper__grid" aria-hidden="true">
              <img src={tableSrc} alt=""/>

              <img src={beerSrc} alt="beer"/>
              <img src={wineSrc} alt="wine"/>
              <img src={coffeeSrc} alt="coffee" style={{ display: formData.expectedPlayers > 2 ? 'block' : 'none' }}/>
              <img src={lateSrc} alt="late" style={{ display: formData.expectedPlayers > 3 ? 'block' : 'none' }}/>
              <img src={wineSrc} alt="wine" style={{ display: formData.expectedPlayers > 4 ? 'block' : 'none' }}/>
              <img src={coffeeSrc} alt="coffee" style={{ display: formData.expectedPlayers > 5 ? 'block' : 'none' }}/>
              <img src={beerSrc} alt="beer" style={{ display: formData.expectedPlayers > 6 ? 'block' : 'none' }}/>
              <img src={coffeeSrc} alt="coffee" style={{ display: formData.expectedPlayers > 7 ? 'block' : 'none' }}/>
              <img src={lateSrc} alt="late" style={{ display: formData.expectedPlayers > 8 ? 'block' : 'none' }}/>
              <img src={wineSrc} alt="wine" style={{ display: formData.expectedPlayers > 9 ? 'block' : 'none' }}/>
            </div>
            </div>
          </fieldset>
          </div>
         
        )}


        {formState === 3 && (
          <div className="form-container">
            <fieldset className="form-container-step">
              <legend className="visually-hidden">Step 3: Budget selection</legend>
              <FormNavigation currentStep={formState} setStep={setFormState} page="initiator" canGoNext={canGoNext} />

              <div className="form__text-content">
                <h2 className="title">Budget</h2>
                <p>what's the budget for the day?</p>
              </div>

              <div className="budget__container">
              <div className="budget__grid" aria-hidden="true">
              <img src={pinkStarSrc} alt="star"/>
              <img src={billSrc} alt="bill" style={{ display: formData.budget > 0 ? 'block' : 'none' }}/>
              <img src={billSrc} alt="bill" style={{ display: formData.budget > 10 ? 'block' : 'none' }}/> 
              <img src={billSrc} alt="bill" style={{ display: formData.budget > 20 ? 'block' : 'none' }}/>
              <img src={billSrc} alt="bill" style={{ display: formData.budget > 30 ? 'block' : 'none' }}/>
              <img src={billSrc} alt="bill" style={{ display: formData.budget > 40 ? 'block' : 'none' }}/>
              <img src={billSrc} alt="bill" style={{ display: formData.budget > 50 ? 'block' : 'none' }}/>
              <img src={billSrc} alt="bill" style={{ display: formData.budget > 60 ? 'block' : 'none' }}/>

             
              <img src={walletSrc} alt="wallet"/>
                </div>

              <div className="budget-slider-container">
                <label htmlFor="budget-range" className="visually-hidden">Select budget per person in euros</label>
                <input
                  id="budget-range"
                  type="range"
                  className="budget-slider"
                  min={0}
                  step="10"
                  max={70}
                  value={formData.budget}
                  style={{
                    background: `linear-gradient(to right, var(--color-green) ${(formData.budget / 70) * 100}%, var(--color-grey) ${(formData.budget / 70) * 100}%)`
                  }}
                  onChange={(e) => {
                    updateField("budget", e.target.value)
                  }}
                />
                <span className="budget-value" aria-live="polite">€{formData.budget}</span>
              </div>
              </div>
            </fieldset>
          </div>
        )}

        {formState === 4 && (
         <div className="form-container"> 
           <fieldset className="form-container-step">
            <legend className="visually-hidden">Step 4: Select bar mood preferences</legend>
              <FormNavigation currentStep={formState} setStep={setFormState} page="initiator" canGoNext={canGoNext} />

            <div className="form__text-content">
            <h2 className="title">Preferences</h2>
            <p >We'll select the perfect bar for you!
            
            </p>
            </div>
        
          <div className="mood_buttons" role="radiogroup" aria-label="Select a bar mood">
              {moods.map((mood) => (
                <button
                  key={mood.mood}
                  type="button"
                  className={
                    formData.mood === mood.mood ? "mood__btn mood__active" : "mood__btn"
                  }
                  onClick={() => handleMoodSelect(mood)}
                  aria-pressed={formData.mood === mood.mood}
                >
                  <img className="mood__img" src={mood.path} alt="" aria-hidden="true" />
                  <span className="mood__btn-text">{mood.mood}</span>
                </button>
              ))}
           

            <button
              type="button"
              className={
                formData.mood === "random" ? "mood__btn mood__active mood__random" : "mood__btn mood__random"
              }
              onClick={handleRandomPick}
              aria-pressed={formData.mood === "random"}
            >
              <img src={diceSrc} alt="" aria-hidden="true" />
              <div className="mood__btn-text"> 
                 <span>
                  Random drinks
               </span>
               
               <span>
                Surprise us!
               </span></div>
            
            </button>
             </div>
          </fieldset>
          </div>
        )}


        {(formState === 5 || formState === 6) && (
          <div className="form-step-container" style={{ position: "relative", width: "100%" }}>
            <div className="form-container">
              <fieldset className="form-container-step">
                <legend className="visually-hidden">Step 5: Contact details</legend>
                <FormNavigation currentStep={formState} setStep={setFormState} page="initiator" canGoNext={canGoNext} />

                <div className="form__text-content">
                  <h2 className="title">Contact</h2>
                  <p>To send final trip info after everyone participated.</p>
                </div>

                <div className="input__container">
                  <label htmlFor="email-input" className="visually-hidden">Email address</label>
                  <input
                    id="email-input"
                    type="email"
                    className={formData.email === "" ? "" : !canGoNext() ? "input__error" : "input__correct"}
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) =>
                      updateField("email", e.target.value)
                    }
                  />
                  <p className={formData.email === "" ? "visually-hidden" : !canGoNext() ? "input__error-message" : "visually-hidden"}>Please enter a valid email address.</p>
                </div>
              </fieldset>
            </div>


            {formState === 6 && (
              <div className="form-container-darkened">
                <div className="form__confirmation">
                  <div className="form__confirmation-heading">
                    <h2 className="title">Confirm your choices</h2>
                    <p className="subtitle">Please check your selection.</p>
                  </div>
                  <div className="form__confirmation-content">

                    <article>
                      <div className="overview__text-container">
                        <h3 className="overview_title">Trip Date options</h3>
                        <p>{formData.possibleDates ? formData.possibleDates.split(",").map(d => d.split("-").reverse().join("/")).join(" , ") : "No dates selected"}</p> {/*formatting date from yyyy-mm-dd to dd/mm/yyyy for better readability*/}
                      </div>

                      <button type="button" className="button__edit" onClick={() => setFormState(1)}>Edit</button>
                    </article>

                    <article>
                      <div className="overview__text-container">
                        <h3 className="overview_title">Trip Companions/players</h3>
                        <p>{formData.expectedPlayers}</p>
                      </div>
                      <button type="button" className="button__edit" onClick={() => setFormState(2)}>Edit</button>
                    </article>

                    <article>
                      <div className="overview__text-container">
                        <h3 className="overview_title">Trip budget/person</h3>
                        <p>€{formData.budget}</p>
                      </div>
                      <button type="button" className="button__edit" onClick={() => setFormState(3)}>Edit</button>
                    </article>

                    <article>
                      <div className="overview__text-container">
                        <h3 className="overview_title">Bar/drink preferences</h3>
                        <p>{formData.mood}</p>
                      </div>
                      <button type="button" className="button__edit" onClick={() => setFormState(4)}>Edit</button>
                    </article>

                    <article>
                      <div className="overview__text-container">
                        <h3 className="overview_title">Email</h3>
                        <p>{formData.email}</p>
                      </div>
                      <button type="button" className="button__edit" onClick={() => setFormState(5)}>Edit</button>
                    </article>
                  </div>

                  <div className="form__confirmation-buttons">
                    <button type="submit" className="">Confirm</button>
                    <button type="button" className="button__outline" onClick={() => setFormState(5)}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}


      {formState > 0 && formState < 6 && (
        <div className="form-navigation-container">
          {actionData?.errors?.find(err => err.formState === formState) && (
            <div className="step-error-message">
              {actionData.errors.find(err => err.formState === formState).error}
            </div>
          )}
          {/* server errors {actionData?.error && formState === 5 && (
            <div className="step-error-message">
              {actionData.error}
            </div>
          )} */}
          <div className="buttons">
            <button
              className="button__arrow"
              type="button"
              onClick={() =>
                setFormState((s) => Math.max(0, s - 1))
              }
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 6C15 6 9 10.4189 9 12C9 13.5812 15 18 15 18" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>

              <span>previous</span>

            </button>

            <button
              className="button__arrow-fill"
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
              <span>next</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.00005 6C9.00005 6 15 10.4189 15 12C15 13.5812 9 18 9 18" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      )}

        {formState === 7 && (
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
          value={image ? image : ""}
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
          value={nickname}
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
    </>
  );
}
