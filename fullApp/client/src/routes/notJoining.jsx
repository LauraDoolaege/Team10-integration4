import sadSrc from "../assets/images/notJoining/notJoining.png"

export default function NotJoining() {

    return (
        <>

            <div className="form-container leaderboard">
                <div className="leaderboard__header">
                    {/* Header space */}
                </div>

                <img className="leaderboard__buildings sadImg" src={sadSrc} alt="sadImg" />

                <div className="leaderboard__cta">
                    <h3 className="title">Oh well <br /> Maybe next time</h3>
                    <p className="text leaderboard__cta-text">
                        We are sorry to hear that you won’t join the trip.
                        See you another time!
                    </p>
                </div>
            </div>
        </>

    )

}