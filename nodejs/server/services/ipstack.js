"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupIPStack = exports.IPStack = void 0;
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const imported_resources_1 = require("../../imported-resources");
const __1 = require("../");
class IPStack {
    constructor(apiKey, httpsEnabled) {
        this.apiKey = apiKey;
        this.httpsEnabled = httpsEnabled;
    }
    requestInfoFor(ip) {
        return new Promise((resolve, reject) => {
            (this.httpsEnabled ? https_1.default : http_1.default).get(`http://api.ipstack.com/${ip}?access_key=${this.apiKey}`, (resp) => {
                // let's get the response from the stream
                let data = "";
                resp.on("data", (chunk) => {
                    data += chunk;
                });
                resp.on("error", (err) => {
                    __1.logger.error("IPStack.requestInfoFor: request to the ip stack ip returned error", {
                        errMessage: err.message,
                        errStack: err.stack,
                        ip,
                    });
                    reject(err);
                });
                resp.on("end", () => {
                    // now that we got the answer, let's use our guess
                    try {
                        const parsedData = JSON.parse(data);
                        if (parsedData.error) {
                            __1.logger.error("IPStack.requestInfoFor: ipstack provided a custom error", {
                                errMessage: parsedData.error,
                                ip,
                                data,
                            });
                            reject(new Error(parsedData.error));
                        }
                        else {
                            resolve(parsedData);
                        }
                    }
                    catch (err) {
                        __1.logger.error("IPStack.requestInfoFor: request to the ip stack ip returned invalid data", {
                            errMessage: err.message,
                            errStack: err.stack,
                            ip,
                            data,
                        });
                        reject(err);
                    }
                });
            }).on("error", (err) => {
                __1.logger.error("IPStack.requestInfoFor: https request to ipstack API failed", {
                    errMessage: err.message,
                    errStack: err.stack,
                    ip,
                });
                reject(err);
            });
        });
    }
    async requestUserInfoForIp(ip, fallback) {
        try {
            const standardResponse = await this.requestInfoFor(ip);
            if (standardResponse.country_code === null) {
                return fallback;
            }
            const languageCode = standardResponse.location && standardResponse.location.languages &&
                standardResponse.location.languages[0] && standardResponse.location.languages[0].code;
            return {
                country: standardResponse.country_code,
                currency: imported_resources_1.countries[standardResponse.country_code] ? imported_resources_1.countries[standardResponse.country_code].currency || "EUR" : "EUR",
                language: languageCode ? languageCode : (imported_resources_1.countries[standardResponse.country_code].languages[0] || "en"),
            };
        }
        catch (err) {
            return fallback;
        }
    }
}
exports.IPStack = IPStack;
function setupIPStack(apiKey, httpsEnabled) {
    return new IPStack(apiKey, httpsEnabled);
}
exports.setupIPStack = setupIPStack;
