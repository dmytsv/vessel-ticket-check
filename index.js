const puppeteer = require("puppeteer");
const open = require("open");

const url =
  "https://tickets.hudsonyardsnewyork.com/webstore/shop/viewitems.aspx?cg=VesselTix&C=VesselAdm";
const checkStr =
  "We are excited to plan your visit to Vessel. Tickets for the next two weeks are fully reserved. However, every morning at 8 am additional same-day tickets are made available, as well as tickets for an additional day as part of the new two-week ticketing window. Please check back regularly at 8am to plan your visit. We look forward to welcoming you to Hudson Yards soon.";
const waitTime = 101;
const timeoutTime = 1000 * 60 * 5;

/** Helper functions */
const waitNumberOfMilliseconds = async timeToWait => {
  const timer = await new Promise(resolve => {
    setTimeout(() => resolve(true), timeToWait);
  });

  return timer;
};

const openBrowser = async url => {
  // Opens the url in the default browser
  await open(url);

  // Specify the app to open in
  await open(url, { app: "google chrome" });
};

const $log = (...args) => {
  let mainColor = "blue";

  let logObj = args.reduce(
    (logObj, arg) => ({
      log: logObj.log + `%c${arg}`,
      style: [
        ...logObj.style,
        `color: ${mainColor};
        font-weight: bold; 
        font-size: 10px;`
      ]
    }),
    { log: "", style: [] }
  );
  console.log(logObj.log, ...logObj.style);
};

const getTextFromPtag = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  //   check if selling page is active
  const text = await page.evaluate(() => {
    return document.querySelector(".row .ng-scope > p.ng-binding").innerText;
  });

  console.log("Test: ", text === checkStr);

  await browser.close();
  return text;
};

let index = 0;
const maxIndex = Math.floor(timeoutTime / waitTime);

const pageCheckRecur = async waitTime => {
  let text = await getTextFromPtag();
  await waitNumberOfMilliseconds(waitTime);
  index++;
  if (index > maxIndex) {
    console.log("iteration N ", index, " Timeout");
    return;
  } else if (text === checkStr) {
    console.log("iteration N ", index, " rechecking");
    pageCheckRecur();
  } else {
    console.log("iteration N ", index, "exit");
    openBrowser(url);
    return;
  }
};

pageCheckRecur(waitTime);
