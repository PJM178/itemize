if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
    const isDevelopment = process.env.NODE_ENV === "development";
    let url;
    if (isDevelopment) {
        url = "/sw.development.js";
    }
    else {
        url = "/sw.production.js";
    }
    navigator.serviceWorker.register(url);
}