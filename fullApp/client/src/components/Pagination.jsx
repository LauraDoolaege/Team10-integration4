export default function Pagination({ currentStage, setStage }) {
    return (
        <div className="onboarding__balls">
            {[1, 2, 3, 4].map((stage) => (
                <button
                    key={stage}
                    className={`onboarding__ball ${currentStage === stage ? "active" : ""}`}
                    type="button"
                    onClick={() => setStage(stage)}
                    aria-label={`Go to onboarding step ${stage}`}
                ></button>
            ))}
        </div>
    );
}
