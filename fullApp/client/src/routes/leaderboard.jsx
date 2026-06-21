import { useState, useEffect } from "react";
import { useLoaderData, Form, useNavigation } from "react-router-dom";

import pfpSrc from "../assets/images/Planning/step1/pfp.avif";
import buidlSrc from "../assets/images/Planning/step1/building.avif";
import successSrc from "../assets/images/leaderboard/confirmation.png"

export default function Leaderboard() {
    const { tripId, leaderboard } = useLoaderData();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";
    const players = leaderboard.players;
    const canClose = players.length>=2;
    const initiatorPage = leaderboard.trip.initiatorId === localStorage.getItem("playerId");
    const url = `${window.location.origin}/friend/${tripId}`

    const [showSuccess, setShowSuccess] = useState(() => {
        return localStorage.getItem("alreadyVisited") !== "true";
    });
    const [isFading, setIsFading] = useState(false);
    const [popupState,setPopupState] = useState(false);
    const [closeButton, setCloseButton] =useState(canClose);

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
                    <p className="subtitle">nice!</p>
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
                     
                            <button type="button" onClick={handleShare} className="button-share">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                                    <polyline points="16 6 12 2 8 6"></polyline>
                                    <line x1="12" y1="2" x2="12" y2="15"></line>
                                </svg>
                                Share
                            </button>
                            {closeButton &&(
                            <button type="button" className="button__outline"  onClick={() => setPopupState(true)}>
                                closeTrip
                            </button>
                            )}
                        </div>
                    )}


                    {!initiatorPage && (
                        <>
                            <h3 className="leaderboard__subtitle">Wait for your friends!</h3>
                            <p className="text leaderboard__cta-text">Wait untill all your friends have played the game!</p>

                        </>
                    )}
                </div>
            </div>

            {popupState && (
                <Form onSubmit={()=>{
                    setPopupState(false)
                    setCloseButton(false);
                }} method="POST">
                    
                    <div className="leaderboard-popup-overlay">
                        <div className="leaderboard-popup-card">
                            <div className="leaderboard-popup-heading">
                                <h2 className="title">Are you sure?</h2>
                                <p className="text">Your friends won't be play the game, and the final trip details will be sent out to everyone's mailbox?</p>
                            </div>

                            <div className="leaderboard-popup-buttons">
                                <button
                                    type="submit"
                                 
                                    className="button__arrow-fill">
                                        confirm
                                    </button>
                                <button
                                    type="button"
                                    className="button__outline"
                                    onClick={() => { setPopupState(false) }}>cancel</button>
                            </div>
                        </div>
                    </div>
                </Form>
            )}

            {isSubmitting && (
                <div className="leaderboard-popup-overlay">
                    <div className="spinner">
                        Sending emails & closing trip...
                    </div>
                </div>
            )}
        </>
    );
}