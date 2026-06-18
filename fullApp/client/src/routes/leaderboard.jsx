import { useState, useEffect } from "react";
import { useLoaderData } from "react-router";

import pfpSrc from "../assets/images/Planning/step1/pfp.avif";
import buidlSrc from "../assets/images/Planning/step1/building.avif";
import successSrc from "../assets/images/leaderboard/confirmation.png"

export default function Leaderboard() {
    const { tripId, leaderboard } = useLoaderData();
    const players = leaderboard.players;
    const initiatorPage = leaderboard.trip.initiatorId === localStorage.getItem("playerId");
    const url = `${window.location.origin}/friend/${tripId}`

    const [showSuccess, setShowSuccess] = useState(() => {
        return localStorage.getItem("alreadyVisited") !== "true";
    });
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        if (showSuccess) {
            localStorage.setItem("alreadyVisited", "true");
            const timer = setTimeout(() => {
                setIsFading(true);
                setTimeout(() => setShowSuccess(false), 500); // Remove from DOM after fade animation
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccess]);

    const [copied, setCopied] = useState(false);

    const copyToClipboard = async () =>{
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    }


    async function handleShare() {
        if (!url) return;

        await navigator.share({
            title: "Hey, come and compete for a drink!",
            text: "Let's all meet up and compete for a drink.",
            url: url,
        });
    }


    return (


        <>

    

            <div className="form-container leaderboard">
                {showSuccess && (
                <div className={`succes__container ${isFading ? "fade-out" : ""}`}>
                    <img src={successSrc} alt="check mark" />
                    <h2 className="title">Succes!</h2>
                    <p className="subtitle">you succesfully created a trip!</p>
                </div>
                )}

                <div className="leaderboard__header">
                <h2 className="title">Leaderboard!</h2>
                <ol className="leaderboard__list">
                    {players.map((player, index) => {
                        if (index === 0) {
                            return (
                                <li key={player.playerId} className="leaderboard__player">
                                    <div className="leaderboard__splitter">
                                        <span className="leaderboard__rank">1</span>
                                        <div className="leaderboard__seperator">
                                            <img
                                                className={player.image ? "leaderboard__image" : "leaderboard__image-default"}
                                                src={player.image ? player.image : pfpSrc}
                                                alt="playerImg"
                                            />
                                            <p className="leaderboard__nickname">{player.username}</p>
                                        </div>
                                    </div>
                                    <p className="leaderboard__score">{player.score}pts</p>
                                </li>
                            );
                        } else {
                            return (
                                <li key={player.playerId} className="leaderboard__player-loser">
                                    <div className="leaderboard__splitter">
                                        <span className="leaderboard__rank">{index + 1}</span>
                                        <div className="leaderboard__seperator">
                                            <img
                                                className={player.image?.trim() ? "leaderboard__image" : "leaderboard__image-default"}
                                                src={player.image?.trim() ? player.image : pfpSrc}
                                                alt="playerImg"
                                            />
                                            <p className="leaderboard__nickname">{player.username}</p>
                                        </div>
                                    </div>
                                    <p className="leaderboard__score">{player.score}pts</p>
                                </li>
                            );
                        }
                    })}
                    </ol>

                </div>
                <img src={buidlSrc} className="leaderboard__buildings" alt="buildings" />

                
                <div className="leaderboard__cta">
                    {initiatorPage && (
                        <div className="leaderboard__share">
                                    <div className="leaderboard__cta-heading">
                                        <h2 className="title">share with friends!</h2>
                                        <p className="subtitle">Invite your friends, play your trip, and compete for a free drink at a local bar in Antwerp!</p>
                                    </div>
                                    <div className="copy__container">
                                        <input value={url} readOnly />
                                        <button onClick={copyToClipboard} className={copied ? "copied" : "uncopied"}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                            </svg>
                                        </button>
                                    </div>
                     
                            <button onClick={handleShare} className="button-primary button-share">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                                    <polyline points="16 6 12 2 8 6"></polyline>
                                    <line x1="12" y1="2" x2="12" y2="15"></line>
                                </svg>
                                Share
                            </button>
                        </div>
                    )}


                    {!initiatorPage && (
                    <>
                    <h3 className="leaderboard__subtitle">Looks like you're in the lead!</h3>
                    <p className="text leaderboard__cta-text">Now <span className="highlight-bold">let's plan a trip </span> and invite your friends to <span className="highlight-bold">fill this leaderboard!</span></p>
                    <button className="button__arrow-fill" >
                        <p>Plan the trip!</p>
                        <svg width="10" height="18" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0.750127 0.75C0.750127 0.75 8.75006 6.64187 8.75006 8.75C8.75006 10.8583 0.750061 16.75 0.750061 16.75" stroke="#C3C3C3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}