import { useState } from "react";
import Pagination from "./Pagination";
import starImg from "../assets/images/Onboarding/step1/stars.avif";
import buildingImg from "../assets/images/Onboarding/step1/building.avif";

import headerImg from "../assets/images/Onboarding/trip/header.avif";
import logoImg from "../assets/images/Onboarding/trip/logo.png"

import coneImg from "../assets/images/Onboarding/step2/cone.avif"
import peopleImg from "../assets/images/Onboarding/step2/people.avif"
import starImg2 from "../assets/images/Onboarding/step2/star.avif"
import drinksImg from "../assets/images/Onboarding/step2/drinks.avif"

import starImg3 from "../assets/images/Onboarding/step3/star.avif"
import calendarImg from "../assets/images/Onboarding/step3/calendar.avif"

import starImg4 from "../assets/images/Onboarding/step4/star.avif"
import spriteImg from "../assets/images/Onboarding/step4/sprite.avif"



export default function TripOnboarding({ setTripState }) {
    const [onboardingState, setOnboardingState] = useState(0);

    const handleContinue = () => {
        setOnboardingState(onboardingState + 1);
    }

    const handleSkipToLast = () => {
        setOnboardingState(3);
    }

    return (
        <div className="trip-onboarding-flow">
            {onboardingState === 0 && (
                <section key={onboardingState} className="trip-onboarding trip-onboarding-1">
                    <img className="logo" src={logoImg} alt="logo" />
                    <div className="trip-onboarding__images trip-onboarding__images-1">
                        <img src={starImg} alt="star" />
                        <img src={buildingImg} alt="building" />
                        <img src={headerImg} alt="header" />
                        
                    </div>
                    <div className="trip-onboarding__text__section trip-onboarding__text__section-1">
                        <p className="trip-onboarding__subtitle dark">Earn a free drink</p>
                        <h2 className="title">Try to beat me!</h2>
                        <p className="text trip-onboarding__text-1-dark"><span className="highlight-bold">You are invited</span> to a trip to Antwerp and a local bar! You can get a free drink if you <span className="highlight-bold">compete with your friends and win!</span>  </p>
                        <button type="button" className="trip-onboarding__button" onClick={handleContinue}>continue</button>
                    </div>
                </section>
            )}

            {onboardingState === 1 && (
                <section key={onboardingState} className="trip-onboarding trip-onboarding-2">
                    <button className="trip-onboarding__skip" type="button" onClick={handleSkipToLast}>
                        <p>Skip</p>
                        <svg width="10" height="18" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0.750127 0.75C0.750127 0.75 8.75006 6.64187 8.75006 8.75C8.75006 10.8583 0.750061 16.75 0.750061 16.75" stroke="#79775B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                   


                    <div className="trip-onboarding__images trip-onboarding__images-2">
                        <img src={starImg2} alt="starImg2" />
                        <img src={drinksImg} alt="drinks" />
                        <img src={peopleImg} alt="people" />
                        <img src={coneImg} alt="people" />
                    </div>
                    <div className="trip-onboarding__text__section trip-onboarding__text__section-2">
                        <Pagination currentStage={onboardingState} setStage={setOnboardingState} />
                        <h2 className="title">Compete 2 win</h2>
                        <p className="text trip-onboarding__text-2">Play the <span className="highlight-yellow">game</span> and compete with your friends for a <span className="highlight-yellow">free drink!</span></p>
                        <button type="button" className="trip-onboarding__button" onClick={handleContinue}>continue</button>
                    </div>
                </section>
            )}

            {onboardingState === 2 && (
                <section key={onboardingState} className="trip-onboarding trip-onboarding-3">
                    <button className="trip-onboarding__skip" type="button" onClick={handleSkipToLast}>
                        <p>skip</p>
                        <svg width="10" height="18" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0.750127 0.75C0.750127 0.75 8.75006 6.64187 8.75006 8.75C8.75006 10.8583 0.750061 16.75 0.750061 16.75" stroke="#79775B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    <div className="trip-onboarding__images trip-onboarding__images-3">
                        <img src={starImg3} alt="star" />
                        <img src={calendarImg} alt="calendar" />
                    </div>
                    <div className="trip-onboarding__text__section trip-onboarding__text__section-3">
                        <Pagination currentStage={onboardingState} setStage={setOnboardingState} />
                        <h2 className="title">Plan with Ease</h2>
                        <p className="text trip-onboarding__text-3">To cash in your coupon, plan a date to hangout with your crew!</p>
                        <button type="button" className="trip-onboarding__button" onClick={handleContinue}>continue</button>
                    </div>
                </section>
            )}

            {onboardingState === 3 && (
                <section key={onboardingState} className="trip-onboarding trip-onboarding-4">
                  

                    <div className="trip-onboarding__images trip-onboarding__images-4">
                        <img src={spriteImg} alt="sprite" />
                        <img src={starImg4} alt="pinkStar" />
                    </div>
                    <div className="trip-onboarding__text__section trip-onboarding__text__section-4">
                        <Pagination currentStage={onboardingState} setStage={setOnboardingState} />
                        <h2 className="title">You are the mc</h2>
                        <p className="text trip-onboarding__text-4">Use <span className="highlight-yellow">your face</span> to create a personalized <span className="highlight-yellow">in-game character</span></p>
                        <button type="button" className="trip-onboarding__button" onClick={() => {setTripState(1)}}>continue</button>
                    </div>
                </section>
            )}

        
        </div>
    );
}
