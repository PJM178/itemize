"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const read_1 = require("../read");
const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
function genToken(length) {
    var result = "";
    for (var i = length; i > 0; --i) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    ;
    return result;
}
async function sensitiveConfigSetup(version, currentConfig, referenceConfig, packageJSON) {
    const newConfig = await read_1.configRequest(currentConfig || referenceConfig, "Sensitive configuration (" + version + ")", [
        {
            variableName: "ipStackAccessKey",
            message: "An ip stack access key, get one at https://ipstack.com/product." +
                "It is required if you want to be able to guess the user location and language otherwise" +
                "Fallbacks are used",
            defaultValue: "",
            hidden: true,
            nullifyFalseValues: true,
        },
        {
            variableName: "hereAppID",
            message: "Used in order to be able to type addresses and get locations get the ID and code at https://developer.here.com/",
            defaultValue: "",
            hidden: true,
            nullifyFalseValues: true,
        },
        {
            variableName: "hereAppCode",
            message: "Used in order to be able to type addresses and get locations get the ID and code at https://developer.here.com/",
            defaultValue: "",
            hidden: true,
            nullifyFalseValues: true,
        },
        {
            variableName: "mailgunAPIKey",
            message: "Used in order to send emails, get your key at https://www.mailgun.com/",
            defaultValue: "",
            hidden: true,
            nullifyFalseValues: true,
        },
        {
            variableName: "mailgunDomain",
            message: "Used in order to send emails, get your key at https://www.mailgun.com/",
            defaultValue: "",
            hidden: true,
            nullifyFalseValues: true,
        },
        {
            variableName: "mailgunTargetDomain",
            message: "The domain that is used in order to generate links, it should be equal the domain name where your app is hosted, " +
                "if unset it will default to the production hostname, you might want to use localhost when locally developing",
            defaultValue: "",
            hidden: true,
            nullifyFalseValues: true,
        },
        {
            variableName: "jwtKey",
            message: "a JSON web token key used for key validation and token generation, leave blank to autogenerate one if not filled",
            defaultValue: genToken(64),
            hidden: true,
        },
        {
            variableName: "devKey",
            message: "a development key that is used to obtain development javascript files in production settings when set as a cookie",
            defaultValue: genToken(16),
        }
    ]);
    return newConfig;
}
exports.sensitiveConfigSetup = sensitiveConfigSetup;