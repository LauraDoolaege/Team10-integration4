export default function FormNavigation({ currentStep, setStep, page, canGoNext }) {
    const steps = page === "initiator" ? [1, 2, 3, 4, 5] : [0, 1, 2];

    return (
        <div className="form__navigation">
            {steps.map((step) => {
                let isDisabled = true;
                if (step <= currentStep) {
                    isDisabled = false;
                } else if (step === currentStep + 1) {
                    isDisabled = canGoNext ? !canGoNext() : true;
                }

                const label = page === "initiator" ? step : step + 1;

                return (
                    <button
                        key={step}
                        className={`form__navigation-btn ${currentStep === step ? "active" : ""}`}
                        type="button"
                        onClick={() => setStep(step)}
                        disabled={isDisabled}
                        aria-label={`Step ${label}`}
                        aria-current={currentStep === step ? "step" : undefined}
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    );
}
