(() => {
    "use strict";

    document
        .querySelectorAll(".validated-form")
        .forEach((form) => {
            form.addEventListener("submit", (event) => {
                const isValid = form.checkValidity();

                if (!isValid) {
                    event.preventDefault();
                    event.stopPropagation();
                }

                form.classList.add("was-validated");
            });
        });
})();