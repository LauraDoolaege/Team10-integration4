import { useState } from "react";
import Pagination from "./Pagination";
import starImg from "../assets/images/Onboarding/step1/star.png";
import buildingImg from "../assets/images/Onboarding/step1/building1.png";
import headerImg from "../assets/images/Onboarding/trip/header.png";
import logoImg from "../assets/images/Onboarding/trip/logo.png"

import coneImg from "../assets/images/Onboarding/step2/cone.png"
import peopleImg from "../assets/images/Onboarding/step2/people.png"
import starImg2 from "../assets/images/Onboarding/step2/star.png"
import drinksImg from "../assets/images/Onboarding/step2/drinks.png"

import starImg3 from "../assets/images/Onboarding/step3/star.png"
import calendarImg from "../assets/images/Onboarding/step3/calendar.png"

import starImg4 from "../assets/images/Onboarding/step4/pinkStar.png"
import starImg5 from "../assets/images/Onboarding/step4/greenStar.png"
import spriteImg from "../assets/images/Onboarding/step4/sprite.png"



export default function InitiatorOnboarding({ setTripState }) {
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
                        <img src={headerImg} alt="header" />
                        
                    </div>
                    <div className="onboarding__text__section onboarding__text__section-1">
                        <p className="onboarding__subtitle dark">Earn a free drink</p>
                        <h2 className="title">Try to beat me!</h2>
                        <p className="text onboarding__text-1-dark"><span className="highlight-bold">You are invited</span> to a trip to Antwerp and a local bar! You can get a free drink if you <span className="highlight-bold">compete with your friends!</span>  </p>
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
                        <button type="button" className="onboarding__button" onClick={() => {setTripState(1)}}>continue</button>
                    </div>
                </section>
            )}

        
        </div>
    );
}
