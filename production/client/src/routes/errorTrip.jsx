import { useLoaderData } from "react-router-dom";
import errorSrc from "../assets/error/error.png"

export default function ErrorTrip (){
    const {errorCode} = useLoaderData();
    return (
        <>
        
                  <div className="form-container leaderboard">
                  <div className="leaderboard__header">
        
                  <img className="errorImg" src={errorSrc} alt="errorImg" />
                  
               
                  </div>
           
                  <div className="leaderboard__cta">
                    {errorCode === "closed" &&(
                    <>
                    <h3 className="title">This trip is already closed...</h3>
                    <p className="text leaderboard__cta-text">This trip has already been fully planned...</p>
                        </>
                    )}

                    {errorCode === "form" && (
                        <>
                            <h3 className="title">Something went wrong</h3>
                            <p className="text leaderboard__cta-text">Something went wrong whilst submitting your details...</p>
                        </>
                    )}
                  </div>
                </div>
        </>

    )

}