import { useState } from "react";
import Pagination from "./Pagination";
import Camera from "./camera";
import starImg from "../assets/images/Onboarding/step1/star.png";
import buildingImg from "../assets/images/Onboarding/step1/building1.png";
import womenImg from "../assets/images/Onboarding/step1/women.png";

import coneImg from "../assets/images/Onboarding/step2/cone.png"
import peopleImg from "../assets/images/Onboarding/step2/people.png"
import starImg2 from "../assets/images/Onboarding/step2/star.png"
import drinksImg from "../assets/images/Onboarding/step2/drinks.png"

import starImg3 from "../assets/images/Onboarding/step3/star.png"
import calendarImg from "../assets/images/Onboarding/step3/calendar.png"

import starImg4 from "../assets/images/Onboarding/step4/pinkStar.png"
import starImg5 from "../assets/images/Onboarding/step4/greenStar.png"
import spriteImg from "../assets/images/Onboarding/step4/sprite.png"

import buildingsImg from "../assets/images/Onboarding/step5/buildings.png";

import spriteImg2 from "../assets/images/Onboarding/step5/leftSprite.png";
import spriteImg3 from "../assets/images/Onboarding/step5/rightSprite.png";
import spriteImg4 from "../assets/images/Onboarding/step5/jumpSprite.png";


import spriteImg6 from "../assets/images/Onboarding/step6/run.png";
import handImg from "../assets/images/Onboarding/step6/hand.png";
import tapStarImg from "../assets/images/Onboarding/step6/tapStar.png";

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
                    <div className="onboarding__images onboarding__images-1">
                        <img src={starImg} alt="star" />
                        <img src={buildingImg} alt="building" />
                        <img src={womenImg} alt="women" />
                        
                    </div>
                    <div className="onboarding__text__section onboarding__text__section-1 ">
                        <p className="onboarding__subtitle">welcome to</p>
                        <h2 className="onboarding__antwerp">Antwerp</h2>
                        <p className="text onboarding__text-1">The city where plans make it out of the groupchat.</p>
                        <button type="button" className="onboarding__button" onClick={handleContinue}>continue</button>
                    </div>
                </section>
            )}

            {onboardingState === 1 && (
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
                        <h2 className="title">Compete 2 win</h2>
                        <p className="text onboarding__text-2">Play the <span className="highlight-yellow">game</span> and compete with your friends for a <span className="highlight-yellow">free drink!</span></p>
                        <button type="button" className="onboarding__button" onClick={handleContinue}>continue</button>
                    </div>
                </section>
            )}

            {onboardingState === 2 && (
                <section key={onboardingState} className="onboarding onboarding-3">
                    <button className="onboarding__skip" type="button" onClick={handleSkipToLast}>
                        <p>skip</p>
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
                        <h2 className="title">Plan with Ease</h2>
                        <p className="text onboarding__text-3">To cash in your coupon, plan a date to hangout with your crew!</p>
                        <button type="button" className="onboarding__button" onClick={handleContinue}>continue</button>
                    </div>
                </section>
            )}

            {onboardingState === 3 && (
                <section key={onboardingState} className="onboarding onboarding-4">
                    <button className="onboarding__skip" type="button" onClick={() => setOnboardingState(5)}>
                        <p>skip</p>
                        <svg width="10" height="18" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0.750127 0.75C0.750127 0.75 8.75006 6.64187 8.75006 8.75C8.75006 10.8583 0.750061 16.75 0.750061 16.75" stroke="#79775B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    <div className="onboarding__images onboarding__images-4">
                        <img src={starImg4} alt="pinkStar" />
                        <img src={starImg5} alt="greenStar" />
                        <img src={spriteImg} alt="sprite" />
                    </div>
                    <div className="onboarding__text__section onboarding__text__section-4">
                        <Pagination currentStage={onboardingState} setStage={setOnboardingState} />
                        <h2 className="title">You are the mc</h2>
                        <p className="text onboarding__text-4">Use <span className="highlight-yellow">your face</span> to create a personalized <span className="highlight-yellow">in-game character</span></p>
                        <button type="button" className="onboarding__button" onClick={handleContinue}>continue</button>
                    </div>
                </section>
            )}

             {onboardingState === 4 && (
                <section className="onboarding onboarding-5">
                    <div className="onboarding__top">
                        <h2 className="title">Build your character!</h2>

                        <p className="text onboarding__text-5">
                            Snap a pic, name your character — everyone gets their own look.
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
                                value={nickname} 
                                onChange={(e) => setNickname(e.target.value)} 
                                placeholder="Enter nickname..."
                            />
                        </label>

                        <button
                            type="button"
                            className="onboarding__button"
                            disabled={!nickname.trim()}
                            onClick={() => setOnboardingState(7)}
                        >
                           continue
                        </button>
                    </div>
                </section>
            )}


            
            {onboardingState === 7 && (
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
                            disabled={!nickname.trim()}
                            onClick={() => onComplete()}
                        >
                           continue
                        </button>
                    </div>
                </section>
            )}
        </div>
    );
}
