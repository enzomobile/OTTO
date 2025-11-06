document.addEventListener("DOMContentLoaded", function () {
    window.addEventListener("pageshow", function (event) {
        if (event.persisted) {
            window.location.reload();
        }
    });
});