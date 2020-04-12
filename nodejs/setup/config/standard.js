"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const read_1 = require("../read");
const imported_resources_1 = require("../../imported-resources");
async function standardConfigSetup(currentConfig, packageJSON) {
    const newConfig = await read_1.configRequest(currentConfig, "Standard configuration", [
        {
            variableName: "entry",
            message: "Please choose your entry schema root, the entry root contains the data for your itemize app",
            defaultValue: "schema/root",
        },
        {
            variableName: "appName",
            message: "Please choose your app name, your app name is the unique identifier that is used for fallback title and manifests",
            defaultValue: packageJSON.name,
        },
        {
            variableName: "port",
            type: "integer",
            message: "Please enter the port number that the app will be used to be served and exposed",
            defaultValue: 8000,
            validate: (v) => !isNaN(v),
        },
        {
            variableName: "supportedLanguages",
            type: "strarray",
            message: "Please choose the languages you are supporting as a list of comma separated values eg. en, es; " +
                "use language ISO codes, and regions are allowed, eg. en-US, de-DE, etc...",
            defaultValue: ["en"],
        },
        {
            variableName: "rtlLanguages",
            type: "strarray",
            message: "Of the languages you had input, is any of those languages a right to left language, such as arabic; " +
                "use language ISO codes, and regions are allowed, eg. en-US, de-DE, etc...",
            defaultValue: [],
        },
        {
            variableName: "dictionaries",
            type: "strobject",
            message: "Now you need to specify the dictionaries, the dictionaries use simple ISO codes without regions; " +
                "these are used for full text search, and you should have all languages you aim to support FTS. " +
                "Please insert the same way as before a list a comma separated values",
            defaultValue: {
                "en": "english"
            },
        },
        {
            variableName: "roles",
            type: "strarray",
            message: "Now you should specify the user roles that your app supports, make these uppercase, no spaces",
            defaultValue: ["ADMIN", "USER"],
            validate: (value) => {
                return value.every((v) => v.toUpperCase().replace(/\s/g, "") === v);
            }
        },
        {
            variableName: "fontUrl",
            message: "Specify an url to a font to be the default font for your app, local values are valid, as in /rest/resource/font.css",
            defaultValue: "https://fonts.googleapis.com/css?family=Open+Sans:300,400,500&subset=cyrillic,cyrillic-ext,greek,greek-ext,latin-ext,vietnamese",
        },
        {
            variableName: "manifest",
            type: "config",
            message: "Manifest configuration for the web manifest",
            defaultValue: null,
            extractData: [
                {
                    variableName: "backgroundColor",
                    message: "Please specify a proper css style hex value for the background color eg. #00FFAA",
                    defaultValue: "#FFFFFF",
                },
                {
                    variableName: "themeColor",
                    message: "Please specify a proper css style hex value for the theme color eg. #00FFAA",
                    defaultValue: "#000000",
                },
                {
                    variableName: "macSafariMaskIconThemeColor",
                    message: "Please specify a proper css style hex value for the safari mask icon theme color eg. #00FFAA",
                    defaultValue: "#000000",
                },
                {
                    variableName: "msTileColor",
                    message: "Please specify a proper css style hex value for the metro icon in edge eg. #00FFAA",
                    defaultValue: "#000000",
                },
                {
                    variableName: "orientation",
                    message: "The orientation of the app, landscape or portrait",
                    defaultValue: "portrait",
                    validate: (value) => ["portrait", "landscape"].includes(value),
                },
                {
                    variableName: "display",
                    message: "The display of the application, fullscreen, standalone, minimal-ui or browser",
                    defaultValue: "standalone",
                    validate: (value) => ["fullscreen", "standalone", "minimal-ui", "browser"].includes(value),
                },
            ]
        },
        {
            variableName: "fallbackLanguage",
            message: "Please specify the fallback language code when an user language cannot be determined (also used in development); " +
                "this should match one of the languages you had specified before, with region, eg. en-US",
            defaultValue: "en",
            validate: (value, config) => config.supportedLanguages.includes(value),
        },
        {
            variableName: "fallbackCountryCode",
            message: "Please set the two digit iso code for the fallback country",
            defaultValue: "FI",
            validate: (value) => !!imported_resources_1.countries[value],
        },
        {
            variableName: "fallbackCurrency",
            message: "Please set the three digit iso code for the fallback currency",
            defaultValue: "EUR",
            validate: (value) => !!imported_resources_1.currencies[value],
        },
        {
            variableName: "developmentHostname",
            message: "The development host name where you might intend to deploy",
            defaultValue: "dev." + packageJSON.name + ".com",
            validate: (v) => v.replace(/\s/g, "") === v,
        },
        {
            variableName: "stagingHostname",
            message: "The staging host name where you might intend to deploy",
            defaultValue: "staging." + packageJSON.name + ".com",
            validate: (v) => v.replace(/\s/g, "") === v,
        },
        {
            variableName: "productionHostname",
            message: "The production host name where you might intend to deploy",
            defaultValue: packageJSON.name + ".com",
            validate: (v) => v.replace(/\s/g, "") === v,
        }
    ]);
    return newConfig;
}
exports.standardConfigSetup = standardConfigSetup;