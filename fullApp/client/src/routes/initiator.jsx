import { useActionData } from "react-router";
import { useState, useEffect } from "react";
import InitiatorForm from "../components/initiatorForm";
import Game from "../components/game";
import Camera from "../components/camera";
import InitiatorOnboarding from "../components/initiatorOnboarding";

export default function Initiator() {
  const actionData = useActionData();

  // Load attempts from sessionStorage
  const [attempts, setAttempts] = useState(() => {
    return Number(sessionStorage.getItem("attempts") || 0);
  });

  // Load score from sessionStorage
  const [score, setScore] = useState(() => {
    return Number(sessionStorage.getItem("score") || 0);
  });

  const [nickname, setNickname] = useState(() => {
    return sessionStorage.getItem("nickname") || "";
  });

  const [image, setImage] = useState(() => {
    return sessionStorage.getItem("capturedImage") || null;
  });

  // Derive initial state based on attempts: 
  // If 3 or more attempts, go to score summary (2). 
  // Otherwise, start with onboarding (-1).
  const [initiatorState, setInitiatorState] = useState(() => {
    const savedAttempts = Number(sessionStorage.getItem("attempts") || 0);
    if (savedAttempts >= 3) return 2;
    if (savedAttempts > 0) return 1;
    return -1;
  });

  // Persist nickname to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("nickname", nickname);
  }, [nickname]);

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
    } else {
      sessionStorage.removeItem("capturedImage");
    }
  }, [image]);

  const handleOnboardingComplete = () => {
    setInitiatorState(1);
  };

  return (
    <>
      {/* State -1: Onboarding */}
      {initiatorState === -1 && (
        <InitiatorOnboarding 
           onComplete={handleOnboardingComplete} 
           nickname={nickname}
           setNickname={setNickname}
           image={image}
           setImage={setImage}
        />
      )}

      {/* State 1: Game - Only accessible if attempts are under 3 */}
      {initiatorState === 1 && attempts < 3 && (
        <Game
          image={image}
          nickname={nickname}
          setNickname={setNickname}
          attempt={attempts + 1}
          onGameOver={(gameScore) => {
            const nextScore = Math.max(score, gameScore);
            const nextAttempts = Math.min(attempts + 1, 3);
            setScore(nextScore);
            setAttempts(nextAttempts);
            if (nextAttempts >= 3) {
                setInitiatorState(2);
            }
          }}
        />
      )}


      {/* State 3: Final Form */}
      {initiatorState === 2 && (
        <InitiatorForm nickname={nickname} image={image} score={score} actionData={actionData} />
      )}
    </>
  );
}