import { Form, useSubmit } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Game from "../components/game";
import Camera from "../components/camera";
import InitiatorFormNavigation from "./initiatorFormNavigation";
import successSrc from "../assets/images/Onboarding/trip/success.avif"

import buildingsImg from "../assets/images/Onboarding/step5/buildings.avif";
import spriteImg2 from "../assets/images/Onboarding/step5/leftSprite.avif";
import spriteImg3 from "../assets/images/Onboarding/step5/rightSprite.avif";
import spriteImg4 from "../assets/images/Onboarding/step5/jumpSprite.avif";

import handImg from "../assets/images/Onboarding/step6/hand.avif";
import tapStarImg from "../assets/images/Onboarding/step6/tap.avif";

import spriteImg6 from "../assets/images/Onboarding/step6/sprite.avif";

import pfpSrc from "../assets/images/Planning/step1/pfp.avif";

export default function TripForm({ receivedTrip, playerId, actionData }) {
  const formRef = useRef(null);
  const submit = useSubmit();
  
  // Load attempts from sessionStorage
  const [attempts, setAttempts] = useState(() => {
    return Number(sessionStorage.getItem("attempts") || 0);
  });

  const [input, setInput] = useState(false);

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

  const [popupState, setPopupState] = useState(false);

  const [formData, setFormData] = useState({
    joining: true,
    dates: [],
    email: "",
    username: "", // Keeping for compatibility with backend action
  });

  const trip = receivedTrip?.trip;
  const tripId = trip?.id;
  const cafe = receivedTrip?.trip?.cafe;
  const votesWithImages = receivedTrip?.votesWithImages || [];
  const maxVotes = Math.max(...votesWithImages.map(d => d.players.length), 0);
  console.log("images", votesWithImages);

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

  const canGoNext = () => {
    switch (formState) {
      case 1:
        return formData.dates.length > 0;
      case 2:
  
        return (
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()) //regex test for basic email format validation
        );

      case 9:

        return (
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()) //regex test for basic email format validation
        );
      default:
        return true;
    }
  };

  const handleNotJoining = () => {
    // Set joining to false and trigger form submission using the ref
    updateField("joining", false);
    
    // We use setTimeout to ensure the hidden input value is updated in the DOM
    // before we trigger the submission via submit(formRef.current)
    setTimeout(() => {
      if (formRef.current) {
        submit(formRef.current);
      }
    }, 0);
  };

  if (actionData?.success) {
    return <p>Your vote has been submitted!</p>;
  }

  return (
    <Form method="post" ref={formRef}>
      {/* Hidden inputs to pass all collected data - always present in the form */}
      <input type="hidden" name="joining" value={formData.joining} />
      <input type="hidden" name="tripId" value={tripId} />
      <input type="hidden" name="playerId" value={playerId} />
      {formData.dates.map((date) => (
        <input key={date} type="hidden" name="dates" value={date} />
      ))}
      <input type="hidden" name="username" value={formData.username} />
      <input type="hidden" name="email" value={formData.email} />
      <input type="hidden" name="score" value={score} />
      <input type="hidden" name="image" value={image || ""} />

      {/* States 0-2: Form Steps (Dates, Info) */}
      {formState < 3 && (
        <div className="form-container form-fixed">
          {formState === 0 && (
            <>
            {popupState && (
              <div className="form-container-darkened">
                <div className="form__confirmation">
                  <div className="form__confirmation-heading">
                    <h2 className="title">Are you sure?</h2>
                    <p className="text">Are you sure you are not interested in the trip?</p>
                  </div>
                  
                  <div className="form__confirmation-buttons">
                    <button
                      type="button"
                      className="button__arrow-fill"
                      onClick={handleNotJoining}>confirm</button>
                    <button
                      type="button"
                      className="button__outline"
                      onClick={()=>{setPopupState(false)}}>cancel</button>
                  </div>
                </div>
              </div>
            )}
                   <div className="form-container"> 
                       <fieldset className="form-container-step">
                        <legend className="visually-hidden">Step 1: overview </legend>
                        <InitiatorFormNavigation currentStep={formState} setStep={setFormState} />
            
                        <div className="form__text-content">
                        <h2 className="title no-wrap">Drinks at Antwerp!</h2>
                        <p >Let's <span>go to Antwerp</span> and enjoy a drink afterwards. </p>
                        </div>
                        <div className="form__trip-overview">
                          <article className="form__trip-data">
                            <div className="icon__wrapper">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="25" viewBox="0 0 20 25" fill="none">
                          <path d="M10 0C15.5228 0 20 4.47715 20 10C20 15.5228 12 25 10 25C8 25 0 15.5228 0 10C0 4.47715 4.47715 0 10 0ZM10 5C7.23858 5 5 7.23858 5 10C5 12.7614 7.23858 15 10 15C12.7614 15 15 12.7614 15 10C15 7.23858 12.7614 5 10 5Z" fill="#FE7D3C" />
                        </svg>                            </div>
                            <div className="trip-data__text">
                              <h3 className="trip-data__label">Location</h3>
                              <p className="trip-data__value">{cafe?.address}</p>
                            </div>
                          </article>

                          <article className="form__trip-data">
                            <div className="icon__wrapper">
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="20" viewBox="0 0 25 20" fill="none">
                          <path d="M22 0C23.6569 6.44256e-08 25 1.34315 25 3V17C25 18.6569 23.6569 20 22 20H3C1.34315 20 6.44266e-08 18.6569 0 17V3C0 1.34315 1.34315 0 3 0H22ZM12.5 3.5C8.91015 3.5 6 6.41015 6 10C6 13.5899 8.91015 16.5 12.5 16.5C16.0899 16.5 19 13.5899 19 10C19 6.41015 16.0899 3.5 12.5 3.5ZM13.0986 5.75C13.5068 5.75 13.9001 5.83577 14.251 6.05762C14.6022 6.2798 14.8917 6.62595 15.1123 7.1123C15.1551 7.20661 15.1353 7.31792 15.0625 7.3916L14.6738 7.78516C14.6188 7.84088 14.5405 7.86772 14.4629 7.85742C14.3851 7.84699 14.3168 7.79986 14.2783 7.73145C14.1277 7.46378 13.9671 7.27841 13.791 7.15918C13.6184 7.04227 13.4162 6.97955 13.1621 6.97949C12.7718 6.97949 12.4638 7.17081 12.2285 7.50781C12.0298 7.79241 11.8895 8.17576 11.8125 8.60938H13.5088C13.6466 8.60958 13.7587 8.72155 13.7588 8.85938V9.47363C13.7586 9.61139 13.6465 9.72343 13.5088 9.72363H11.6953C11.6917 9.79643 11.6895 9.86814 11.6895 9.93652C11.6895 10.0358 11.6898 10.1336 11.6934 10.2305H13.5088C13.6467 10.2307 13.7588 10.3425 13.7588 10.4805V11.0938C13.7588 11.2317 13.6467 11.3435 13.5088 11.3438H11.8076C11.8926 11.8852 12.0495 12.288 12.2568 12.5605C12.4897 12.8666 12.7943 13.0205 13.1826 13.0205C13.658 13.0205 14.0345 12.8013 14.4482 12.291C14.4963 12.2317 14.5692 12.1974 14.6455 12.1982C14.7219 12.1992 14.7941 12.2354 14.8408 12.2959L15.1982 12.7588C15.2668 12.8477 15.2674 12.9716 15.2002 13.0615C14.6747 13.764 13.9983 14.25 13.0146 14.25C12.2841 14.25 11.6587 13.9747 11.1973 13.4287C10.7775 12.932 10.5101 12.2281 10.3984 11.3438H10C9.86193 11.3438 9.75 11.2318 9.75 11.0938V10.4805C9.75 10.3424 9.86193 10.2305 10 10.2305H10.3184C10.3179 10.1825 10.3174 10.1347 10.3174 10.0869C10.3174 9.96439 10.3212 9.84224 10.3262 9.72363H10C9.86206 9.72363 9.75022 9.61152 9.75 9.47363V8.85938C9.75013 8.72142 9.86201 8.60938 10 8.60938H10.4385C10.7366 6.87755 11.7347 5.75006 13.0986 5.75ZM12.9834 6.74023C12.8684 6.7552 12.7606 6.78573 12.6592 6.82812C12.7608 6.78561 12.8691 6.75617 12.9844 6.74121C13.0418 6.73377 13.1012 6.72949 13.1621 6.72949C13.1008 6.72949 13.0412 6.73269 12.9834 6.74023Z" fill="#00D67B" />
                        </svg>                            </div>
                            <div className="trip-data__text">
                              <h3 className="trip-data__label">Budget</h3>
                              <p className="trip-data__value">€{trip?.budget}</p>
                            </div>
                          </article>

                          <article className="form__trip-data">
                            <div className="icon__wrapper">
        
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="32" viewBox="0 0 22 32" fill="none">
                          <path d="M12.8877 15.1094C17.8582 15.1094 21.8877 19.1388 21.8877 24.1094V31.9971H0V24.1094C0 19.1388 4.02944 15.1094 9 15.1094H12.8877ZM10.9434 0C14.7895 0 17.908 2.78551 17.9082 6.22168C17.9082 9.65797 14.7896 12.4443 10.9434 12.4443C7.09729 12.4442 3.97949 9.65786 3.97949 6.22168C3.97966 2.78563 7.09739 0.000179574 10.9434 0Z" fill="#5796FF" />
                        </svg>                            </div>
                            <div className="trip-data__text">
                              <h3 className="trip-data__label">People</h3>
                              <p className="trip-data__value">{trip?.expected_players}</p>
                            </div>
                          </article>

                          <article className="form__trip-data">
                            <div className="icon__wrapper">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="23" viewBox="0 0 20 23" fill="none">
                          <path d="M17.6377 0C18.8105 0 19.7313 1.00448 19.6299 2.17285L17.9775 21.1729C17.8877 22.2064 17.0228 23 15.9854 23H3.65234C2.61513 22.9998 1.75001 22.2062 1.66016 21.1729L0.0078125 2.17285C-0.0935341 1.0045 0.82818 0 2.00098 0H17.6377ZM15.9434 7.82812C14.8354 7.62444 12.9372 7.33582 11.8193 7.50293C10.1694 7.74967 9.47818 8.82656 7.81934 9.00293C6.89097 9.10159 5.43558 8.777 4.33398 8.47168C3.62517 8.27529 2.91058 8.84878 2.98926 9.58008L4.02637 19.2168C4.13576 20.2326 4.99394 21.0029 6.01562 21.0029H13.623C14.6447 21.0029 15.5019 20.2326 15.6113 19.2168L16.7236 8.8916C16.778 8.38558 16.4439 7.92015 15.9434 7.82812Z" fill="#FE83DE" />
                        </svg>                            </div>
                            <div className="trip-data__text">
                              <h3 className="trip-data__label">Drink</h3>
                              <p className="trip-data__value">{trip?.mood}</p>
                            </div>
                          </article>
                        </div>
                      </fieldset>
                      </div>
            </>
          )}

          {formState === 1 && (
            <>
               {popupState && (
            <div className="form-container-darkened">
              <div className="form__confirmation">
                <div className="form__confirmation-heading">
                  <h2 className="title">Are you sure?</h2>
                  <p className="text">Are you sure you are not available for this trip?</p>
                </div>

                <div className="form__confirmation-buttons">
                  <button
                    type="button"
                    className="button__arrow-fill"
                    onClick={handleNotJoining}>confirm</button>
                  <button
                    type="button"
                    className="button__outline"
                    onClick={() => { setPopupState(false) }}>cancel</button>
                </div>
              </div>
            </div>
          )}
            <div className="form-container">
              <fieldset className="form-container-step">
                <legend className="visually-hidden">
                  Step 1: available dates
                </legend>

                <InitiatorFormNavigation
                  currentStep={formState}
                  setStep={setFormState}
                />

                <div className="form__text-content">
                  <h2 className="title">Availability</h2>
                  <p>Select the dates that fit for you!</p>
                </div>

                <div className="availability-list">
                  {votesWithImages.map((date) => (
                    <article key={date.date} className="availability-card">
                      {date.players.length === maxVotes && maxVotes > 0 && (
                        <span className="availability-card__most-voted">most voted</span>
                      )}
                      <div className="availability-card__date">
                        {date.date.split("-").reverse().join("/")}
                      </div>

                      <div className="availability-card__votes">
                        <p className="availability-card__count">{date.players.length} votes</p>

                        <div className="availability-card__players">
                          {date.players.map((player, index) => (
                            <img
                              key={index}
                              src={player.image || pfpSrc }
                              alt="profile picture"
                              className="availability-card__player-img"
                            />
                          ))}
                        </div>
                      </div>

                      <input
                        type="checkbox"
                        className="availability-card__checkbox"
                        value={date.date}
                        checked={formData.dates.includes(date.date)}
                        onChange={(e) => {
                          const val = e.target.value;
                          const newDates = e.target.checked
                            ? [...formData.dates, val]
                            : formData.dates.filter((d) => d !== val);
                          updateField("dates", newDates);
                        }}
                      />
                    </article>
                  ))}
                </div>
              </fieldset>
            </div>
            </>
          )}

          {formState === 2 && (
            <div className="form-container">
              <fieldset className="form-container-step">
                <legend className="visually-hidden">
                  Step 2: contact details
                </legend>
                <InitiatorFormNavigation
                  currentStep={formState}
                  setStep={setFormState}
                />
                <div className="form__text-content">
                  <h2 className="title">Contact</h2>
                  <p>Where can we reach you?</p>
                </div>
                <div className="input__container">
                  <label htmlFor="email" className="visually-hidden">Email</label>
                  <input
                    id="email"
                    type="email"
                    className={formData.email === "" ? "" : !canGoNext() ? "input__error" : "input__correct"}
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    required
                    placeholder="Enter your email"
                  />
                  <p className={formData.email === "" ? "visually-hidden" : !canGoNext() ? "input__error-message" : "visually-hidden"}>Please enter a valid email address.</p>
                </div>
              </fieldset>
            </div>
          )}


          
          <div className="form-navigation-container">
              <div className="buttons">
              {formState <= 1 ? (
                <button
                  className="button__outline"
                  type="button"
                  onClick={() => setPopupState(true)}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6 6L18 18" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="no-wrap"> {formState === 0 ? "no thanks" : "not available"}</span>
                </button>
              ) : (
                <button
                  className="button__arrow"
                  type="button"
                  onClick={() => setFormState((s) => Math.max(0, s - 1))}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 6C15 6 9 10.4189 9 12C9 13.5812 15 18 15 18" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>previous</span>
                </button>
              )}

              <button
                className="button__arrow-fill"
                type="button"
                disabled={!canGoNext()}
                onClick={() => {
                  if (canGoNext()) {
                    setFormState((s) => Math.min(3, s + 1));
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

        </div>
      )}

   {formState === 3 && (
          <div className="form-container leaderboard">
          <div className="leaderboard__header">

          <img className="successImg" src={successSrc} alt="success" />
          
       
          </div>
   
          <div className="leaderboard__cta">
            <h3 className="title">Time for the game!</h3>
            <p className="text leaderboard__cta-text">Now that the planning is done  <span className="highlight-bold">it's time for the game!</span></p>
            <button
              type="button"
              className="button__arrow-fill" onClick={() => setFormState(4)}>
            <p>Let's go!</p>
                        <svg width="10" height="18" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0.750127 0.75C0.750127 0.75 8.75006 6.64187 8.75006 8.75C8.75006 10.8583 0.750061 16.75 0.750061 16.75" stroke="#C3C3C3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
          </button>
          </div>
        </div>

        )}

        {formState === 4 && (
            <section className="onboarding onboarding-5">
                            <div className="onboarding__top">
                                <h2 className="title">Build your character!</h2>
        
                                <p className="text onboarding__text-5">
                                    Snap a pic, name your character  everyone gets their own look.
                                </p>
                            </div>
        
                            <div className="onboarding__scene">
                                <img
                                    src={buildingsImg}
                                    alt="Buildings"
                                    className="buildings"
                                />
        
                                <img
                                    src={spriteImg2}
                                    alt="Left Character"
                                    className="character character--left"
                                />
        
                                <img
                                    src={spriteImg4}
                                    alt="Center Character"
                                    className="character character--center"
                                />
        
                                <img
                                    src={spriteImg3}
                                    alt="Right Character"
                                    className="character character--right"
                                />
                            </div>
        
                            <div className="onboarding__bottom">
                                <button
                                    type="button"
                                    className="onboarding__button"
                                    // onClick={() => onComplete(true)}
                                    onClick={() => setFormState(5)}
                                >
                                    Take your photo
                                </button>
        
                                <button
                                    type="button"
                                    className="button__arrow"
                                    onClick={() => setFormState(6)}
                                >
                                     <span>Continue without photo </span>
                                     <svg width="10" height="18" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M0.750127 0.75C0.750127 0.75 8.75006 6.64187 8.75006 8.75C8.75006 10.8583 0.750061 16.75 0.750061 16.75" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            </div>
                        </section>
        )}

      {/* State 3: Camera capture before the game */}
      {formState === 5 && (
     <>
          <Camera 
            image={image} 
            setImage={setImage} 
            setState={() => setFormState(6)} 
          />
       </>
      )}

  
      {formState === 6 && (
          <section className="onboarding onboarding-5 character-preview">
                <div className="onboarding__top character-preview__top">
                          <h2 className="title">name your character!</h2>
                      </div>
  
                      <div className="onboarding__scene character-preview__scene">
                          <img
                              src={buildingsImg}
                              alt="Buildings"
                              className="buildings character-preview__buildings"
                          />
                          <div className="character-preview__character">
                              <img src={spriteImg6} alt="Character Body" className="character-preview__body" />
                              {image && 
                              (<img src={image} alt="Your Face" className="character-preview__face" />)}
                          </div>
                      </div>
  
                      <div className="onboarding__bottom character-preview__bottom">
                          <label>
                              <div className="label__text">Nickname:</div>
                       
                              <input
                                  type="text" 
                                  className="form-control"
                                  value={formData.username} 
                                  onChange={(e) => updateField("username",e.target.value)} 
                                  onFocus={(e) => e.target.scrollIntoView({ behavior: "smooth", block: "nearest" })}
                                  placeholder="Enter nickname..."
                              />
                          </label>
  
                          <button
                              type="button"
                              className="onboarding__button"
                              disabled={!formData.username.trim()}
                              onClick={() => setFormState(7)}
                          >
                             continue
                    </button>
                </div>
          </section>
        )}
  


    {formState === 7 && (
                <section className="onboarding onboarding-5 character-preview character-preview--instructions-active">
                        <div className="onboarding__top character-preview__top">
                        <h2 className="title">Are you ready!</h2>
                        <h2 className="text"><span>tap to jump</span> over obstacles and collect points. You only get <span>3 tries</span> to score as high as possible!</h2>
                    </div>

                    <div className="onboarding__scene character-preview__scene">
                
                        <div className="character-preview__character">
                            <img src={spriteImg6} alt="Character Body" className="character-preview__body" />
                            {image && 
                            (<img src={image} alt="Your Face" className="character-preview__face" />)}
                        </div>
                        <div className="character-preview__instructions">
                             <img className="onboarding__tap-star-img" src={tapStarImg} alt="TapStar"/>
                            <img className="onboarding__hand-img" src={handImg} alt="Hand" />
                           
                        </div>
                    </div>
                    <div className="onboarding__bottom character-preview__bottom">
                        <button
                            type="button"
                            className="onboarding__button"
                            disabled={!formData.username.trim()}
                            onClick={() => setFormState(8)}
                        >
                           continue
                        </button>
                    </div>
                </section>
            )}

      {/* State 4: Game */}
      {formState === 8 && attempts < 3 && (
        <Game 
          image={image}
          attempt={attempts + 1} 
          onGameOver={(gameScore) => {
            const nextScore = Math.max(score, gameScore);
            const nextAttempts = Math.min(attempts + 1, 3);
            setScore(nextScore);
            setAttempts(nextAttempts);
            if (nextAttempts >= 3) {
              setFormState(9);
            }
          }}
        />
      )}



      {/* State 5: Submission / Summary */}
      {formState === 9 && (
        <>
          <div className="summary-container">
            <div className="summary__header">
              {/* Header space */}
              <h2 className="summary__intro">All attempts completed!</h2>
              <p className="summary__score">Your highest score: {score}</p>
            </div>

            <div className="summary__cta">
              <div>
              </div>
              <div className="summary__text">
              <h3 className="summary__title">Last step!</h3>
              <p className="summary__subtitle">Check your email.</p>
              </div>

            <article className="summary__article">
              <div className="summary__text-container">
                <p className="summary__overview-title">Email</p>
                {!input && <p>{formData.email}</p>}
                {input && (
                  <input
                    onBlur={() => setInput(false)}
                    className={formData.email === "" ? "" : !canGoNext() ? "input__error" : "input__correct"}
                    type="email"
                    name="email"
                    id="mail"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    autoFocus
                  />
                )}
              </div>
              {!input && (
                <button type="button" className="summary__edit-button" onClick={() => setInput(true)}>Edit</button>
              )}
            </article>

              <button disabled={!canGoNext()} type="submit" className="summary__submit-btn button-primary">
                Submit
              </button>
            </div>
          </div>
        </>
      )}
    </Form>
  )
}
