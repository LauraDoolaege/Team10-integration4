import { useState } from "react";
import Pagination from "./Pagination";
import Camera from "./camera";

import logoImg from "../assets/images/Onboarding/trip/logo.png"

import starImg from "../assets/images/Onboarding/step1/stars.avif";
import buildingImg from "../assets/images/Onboarding/step1/building.avif";
import womenImg from "../assets/images/Onboarding/step1/women.avif";

import coneImg from "../assets/images/Onboarding/step2/cone.avif"
import peopleImg from "../assets/images/Onboarding/step2/people.avif"
import starImg2 from "../assets/images/Onboarding/step2/star.avif"
import drinksImg from "../assets/images/Onboarding/step2/drinks.avif"

import starImg3 from "../assets/images/Onboarding/step3/star.avif"
import calendarImg from "../assets/images/Onboarding/step3/calendar.avif"

import starImg4 from "../assets/images/Onboarding/step4/star.avif"
import spriteImg from "../assets/images/Onboarding/step4/sprite.avif"

import buildingsImg from "../assets/images/Onboarding/step5/buildings.avif";

import spriteImg2 from "../assets/images/Onboarding/step5/leftSprite.avif";
import spriteImg3 from "../assets/images/Onboarding/step5/rightSprite.avif";
import spriteImg4 from "../assets/images/Onboarding/step5/jumpSprite.avif";


import spriteImg6 from "../assets/images/Onboarding/step6/sprite.avif";
import handImg from "../assets/images/Onboarding/step6/hand.avif";
import tapStarImg from "../assets/images/Onboarding/step6/tap.avif";

export default function InitiatorOnboarding({ onComplete, nickname, setNickname, image, setImage }) {
    const [onboardingState, setOnboardingState] = useState(0);

    const handleContinue = () => {
        setOnboardingState(onboardingState + 1);
    }

    const handleSkipToLast = () => {
        setOnboardingState(4);
    }

    return (
        <div className="onboarding-flow">
            {onboardingState === 0 && (
                <section key={onboardingState} className="onboarding onboarding-1">
                    <img className="logo" src={logoImg} alt="logo" />
                    <div className="onboarding__images onboarding__images-1">
                        <img src={starImg} alt="star" />
                        <img src={buildingImg} alt="building" />
                        <img src={womenImg} alt="women" />
                        
                    </div>
                    <div className="onboarding__text__section onboarding__text__section-1 ">
        
                        <h2 className="onboarding__antwerp">Your hangout starts here!</h2>
                        <p className="text onboarding__text-1 transparent__black">Antwerp the city where <span className="highlight-bold">plans</span> make it out of the groupchat.</p>
                        <button type="button" className="onboarding__button" onClick={handleContinue}>Continue</button>
                    </div>
                </section>
            )}

            {onboardingState === 2 && (
                <section key={onboardingState} className="onboarding onboarding-2">
                    <button className="onboarding__skip" type="button" onClick={handleSkipToLast}>
                        <p>Skip</p>
                        <svg width="10" height="18" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0.750127 0.75C0.750127 0.75 8.75006 6.64187 8.75006 8.75C8.75006 10.8583 0.750061 16.75 0.750061 16.75" stroke="#79775B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    <div className="onboarding__images onboarding__images-2">
                        <img src={starImg2} alt="starImg2" />
                        <img src={drinksImg} alt="drinks" />
                        <img src={peopleImg} alt="people" />
                        <img src={coneImg} alt="people" />
                    </div>
                    <div className="onboarding__text__section onboarding__text__section-2">
                        <Pagination currentStage={onboardingState} setStage={setOnboardingState} />
                        <h2 className="title">Play and taste the win!</h2>
                        <p className="text onboarding__text-2 transparent__black"><span className="highlight-bold">Your run kicks off the planning.</span> Play the game and compete with your friends for a free drink!</p>
                        <button type="button" className="onboarding__button" onClick={handleContinue}>Continue</button>
                    </div>
                </section>
            )}

            {onboardingState === 1 && (
                <section key={onboardingState} className="onboarding onboarding-3">
                    <button className="onboarding__skip" type="button" onClick={handleSkipToLast}>
                        <p>Skip</p>
                        <svg width="10" height="18" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0.750127 0.75C0.750127 0.75 8.75006 6.64187 8.75006 8.75C8.75006 10.8583 0.750061 16.75 0.750061 16.75" stroke="#79775B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    <div className="onboarding__images onboarding__images-3">
                        <img src={starImg3} alt="star" />
                        <img src={calendarImg} alt="calendar" />
                    </div>
                    <div className="onboarding__text__section onboarding__text__section-3">
                        <Pagination currentStage={onboardingState} setStage={setOnboardingState} />
                        <h2 className="title">Plan your
                            Antwerp hangout</h2>
                        <p className="text onboarding__text-3 transparent__black"><span className="highlight-bold">You’re the first spark: play the game</span>, fill in the details and share with friends to finally make that hangout happen.</p>
                        <button type="button" className="onboarding__button" onClick={handleContinue}>Continue</button>
                    </div>
                </section>
            )}

            {onboardingState === 3 && (
                <section key={onboardingState} className="onboarding onboarding-4">
                    <button className="onboarding__skip" type="button" onClick={() => setOnboardingState(4)}>
                        <p>Skip</p>
                        <svg width="10" height="18" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0.750127 0.75C0.750127 0.75 8.75006 6.64187 8.75006 8.75C8.75006 10.8583 0.750061 16.75 0.750061 16.75" stroke="#79775B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    <div className="onboarding__images onboarding__images-4">
                        <img src={spriteImg} alt="sprite" />
                        <img src={starImg4} alt="pinkStar" />
                    </div>
                    <div className="onboarding__text__section onboarding__text__section-4">
                        <Pagination currentStage={onboardingState} setStage={setOnboardingState} />
                        <h2 className="title">You are the mc</h2>
                        <p className="text onboarding__text-4 transparent__black">Use If you’re up for it, flash those pearly whites and <span className="highlight-bold">create your character in a few seconds.</span></p>
                        <button type="button" className="onboarding__button" onClick={handleContinue}>Continue</button>
                    </div>
                </section>
            )}

             {onboardingState === 4 && (
                <section className="onboarding onboarding-5">
                    <div className="onboarding__top">
                        <h2 className="title no-wrap">Let's get started!</h2>
                        <ol className="step__list text align-left">
                            <li>Put your face on your character</li>
                            <li>Name your character</li>
                            <li>Play the game</li>
                            <li>Plan the trip</li>
                            <li>Share with friends</li>
                        </ol>
                     
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
                            onClick={() => setOnboardingState(5)}
                        >
                            Take your photo
                        </button>

                        <button
                            type="button"
                            className="button__arrow"
                            onClick={() => setOnboardingState(6)}
                        >
                             <span>Continue without photo </span>
                             <svg width="10" height="18" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0.750127 0.75C0.750127 0.75 8.75006 6.64187 8.75006 8.75C8.75006 10.8583 0.750061 16.75 0.750061 16.75" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </section>
            )}

            {onboardingState === 5 && (
                <div className="camera-step-wrapper">
             
                    <Camera 
                        image={image} 
                        setImage={setImage} 
                        setState={() => setOnboardingState(6)} 
                    />
                </div>
            )}

            {onboardingState === 6 && (
                <section className="onboarding onboarding-5 character-preview">
                    <div className="onboarding__top character-preview__top">
                        <h2 className="title">Name your character!</h2>
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
                                value={nickname} 
                                onChange={(e) => setNickname(e.target.value)} 
                                onFocus={(e) => e.target.scrollIntoView({ behavior: "smooth", block: "center" })}
                              
                                placeholder="Enter nickname..."
                            />
                        </label>

                        <button
                            type="button"
                            className="onboarding__button"
                            disabled={!nickname.trim()}
                            onClick={() => setOnboardingState(7)}
                        >
                           Continue
                        </button>
                    </div>
                </section>
            )}


            
            {onboardingState === 7 && (
                <section className="onboarding onboarding-5 character-preview character-preview--instructions-active">
                        <div className="onboarding__top character-preview__top">
                        <h2 className="title">Are you ready!</h2>
                        <h2 className="text"><span>Tap to jump</span> over obstacles and collect points. You only get <span>3 tries</span> to score as high as possible!</h2>
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
                            disabled={!nickname.trim()}
                            onClick={() => onComplete()}
                        >
                           Continue
                        </button>
                    </div>
                </section>
            )}
        </div>
    );
}
