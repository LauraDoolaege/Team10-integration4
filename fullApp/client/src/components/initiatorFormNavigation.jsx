export default function InitiatorFormNavigation({ currentStep, setStep }) {
    const steps = [1, 2, 3, 4, 5];
    
    return (
        <div className="form__navigation">
            {steps.map((step) => (
                <button
                    key={step}
                    className={`form__navigation-btn ${currentStep === step ? "active" : ""}`}
                    type="button"
                    onClick={() => setStep(step)}
                    aria-label={`Step ${step}`}
                    aria-current={currentStep === step ? "step" : undefined}
                >
                    {step}
                </button>
            ))}
        </div>
    );
}
