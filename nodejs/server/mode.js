"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getCookie(splittedCookie, name) {
    const nameEQ = name + "=";
    const foundCookie = splittedCookie.find((cookieValue) => {
        return cookieValue.startsWith(nameEQ);
    });
    if (!foundCookie) {
        return null;
    }
    return foundCookie.substr(nameEQ.length) || null;
}
function getMode(appData, req) {
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    let defaultMode = "production";
    // This only occurs during development
    if (ip === "127.0.0.1" ||
        ip === "::1" ||
        ip === "::ffff:127.0.0.1") {
        defaultMode = "development";
    }
    const cookies = req.headers["cookie"];
    if (cookies) {
        const splittedCookies = cookies.split(";");
        const devmode = getCookie(splittedCookies, "devmode");
        const devkey = getCookie(splittedCookies, "devkey");
        console.log(devmode, devkey, appData.sensitiveConfig.devKey);
        if ((devmode === "production" ||
            devkey === appData.sensitiveConfig.devKey) &&
            (devmode === "development" ||
                devmode === "production")) {
            console.log(devmode);
            return devmode;
        }
        else {
            console.log("default");
            return defaultMode;
        }
    }
    else {
        console.log("no cookie");
        return defaultMode;
    }
}
exports.getMode = getMode;
