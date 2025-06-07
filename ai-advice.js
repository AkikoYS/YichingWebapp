document.querySelectorAll(".next-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        const currentStep = btn.closest(".question-step");
        const nextStep = currentStep.nextElementSibling;

        const input = currentStep.querySelector("input, textarea");
        if (input && !input.value.trim()) {
            input.focus();
            return;
        }

        currentStep.classList.add("hidden");
        if (nextStep) {
            nextStep.classList.remove("hidden");
            const nextInput = nextStep.querySelector("input, textarea");
            nextInput?.focus();
        }
    });
});