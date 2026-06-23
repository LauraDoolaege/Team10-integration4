import sadSrc from "../assets/images/notJoining/notJoining.avif"

export default function NotJoining() {

    return (
        <>

            <div className="not-joining-container">
                <div className="not-joining__header">
                    {/* Header space */}
                </div>

                <img className="not-joining__buildings sadImg" src={sadSrc} alt="sadImg" />

                <div className="not-joining__cta">
                    <h3 className="title">Oh well Maybe next time</h3>
                    <p className="text not-joining__cta-text">
                        We are sorry to hear that you won’t join the trip.
                        See you another time!
                    </p>
                </div>
            </div>
        </>

    )

}