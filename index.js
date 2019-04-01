const puppeteer = require("puppeteer");
const open = require("open");
require("dotenv").config();

const url =
  "https://tickets.hudsonyardsnewyork.com/webstore/shop/viewitems.aspx?cg=VesselTix&C=VesselAdm";
const checkStr =
  "We are excited to plan your visit to Vessel. Tickets for the next two weeks are fully reserved. However, every morning at 8 am additional same-day tickets are made available, as well as tickets for an additional day as part of the new two-week ticketing window. Please check back regularly at 8am to plan your visit. We look forward to welcoming you to Hudson Yards soon.";
const waitTime = 101;
const timeoutTime = 1000 * 60 * 15;

/** Helper functions */
const waitNumberOfMilliseconds = async timeToWait => {
  await new Promise(resolve => {
    setTimeout(() => resolve(true), timeToWait);
  });
  return;
};

const openBrowser = async url => {
  // Opens the url in the default browser
  //   await open(url);

  // Specify the app to open in
  await open(url, { app: "google chrome" });
};

const getTextFromPTag = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  await page.screenshot({ path: "pageStart.png" });
  //   check if selling page is active
  const text = await page.evaluate(async () => {
    let element = document.querySelector(".row .ng-scope > p.ng-binding");
    if (element) {
      return element.innerText;
    } else {
      let input = document.querySelector(".reminder-form input");
      let button = document.querySelector(".reminder-form button");

      input.value = process.env.EMAIL;
      await waitNumberOfMilliseconds(waitTime);
      button.click();

      return "";
    }
  });
  await page.screenshot({ path: "pageEnd.png" });

  await browser.close();
  return text;
};

let index = 0;
// const maxIndex = Math.floor(timeoutTime / waitTime);
const maxIndex = 1;

const pageCheckRecur = async waitTime => {
  let text = await getTextFromPTag();
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
