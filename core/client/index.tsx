import "./theme/base.scss";
import ReactDOM from "react-dom";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import App from "./app";
import "babel-polyfill";
import PropertyDefinition from "../base/ItemDefinition/PropertyDefinition";
import Moment from "moment";

const importedSrcPool: string[] = [];
export function importScript(src: string) {
  if (importedSrcPool.includes(src)) {
    return new Promise((resolve) => {
      resolve();
    });
  }
  importedSrcPool.push(src);
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    document.body.appendChild(script);
    script.onload = resolve;
    script.onerror = reject;
    script.async = true;
    script.src = src;
  });
}

(async () => {
  // TODO we need to fetch these based on location too if local storage cannot find
  // anything, by default user session token will be stored in local storage so these
  // should be set, when logging out they are not removed
  // TODO SEO also requires different urls, we are on local storage now
  const storedLang = window.location.pathname.split("/")[1] || localStorage.getItem("lang");
  const storedCurrency = localStorage.getItem("currency");
  const storedCountry = localStorage.getItem("country");
  const initialLang = storedLang || "en";
  const initialCurrency = storedCurrency || "EUR";
  const initialCountry = storedCountry || "FI";

  (window as any).moment = Moment;

  const [initialData, localeData, countryData, currencyData] = await Promise.all([
    fetch(`/resource/build.${initialLang}.json?version=${(window as any).BUILD_NUMBER}`).then((r) => r.json()),
    fetch(`/resource/lang.json?version=${(window as any).BUILD_NUMBER}`).then((r) => r.json()),
    fetch(`/resource/countries.json?version=${(window as any).BUILD_NUMBER}`).then((r) => r.json()),
    fetch(`/resource/currency.json?version=${(window as any).BUILD_NUMBER}`).then((r) => r.json()),

    initialLang !== "en" ?
      importScript(`/resource/${initialLang}.moment.js?version=${(window as any).BUILD_NUMBER}`) : null,
  ]);

  Moment.locale(initialLang);
  PropertyDefinition.currencyData = currencyData;

  ReactDOM.render(
    <BrowserRouter>
      <App
        initialData={initialData}
        localeData={localeData.locales}
        countryData={countryData}
        currencyData={currencyData}

        initialCurrency={initialCurrency}
        initialCountry={initialCountry}
        initialLanguage={initialLang}
      />
    </BrowserRouter>,
    document.getElementById("app"),
  );
})();
