import type { NextApiRequest, NextApiResponse } from "next";

const puppeteer = require("puppeteer");
const fs = require("fs");
import { Browser } from "puppeteer";
const dayjs = require("dayjs");

// setting dates and formats to use in webpage injection
const currentDate = dayjs().format("MM-DD-YYYY");
const inputDate = dayjs().format("MM-DD-YYYY");
const twoWeeks = dayjs().subtract(2, "weeks").format("MM-DD-YYYY");
const pastMonth = dayjs().subtract(1, "months").format("MM-DD-YYYY");

const url = "https://nfc.shgn.com/adp/football";
// different draft types to select from draft type drop down menu
let draft_types = [
  {
    lable: "Primetime",
    value: "447",
  },
  {
    lable: "Rotowire",
    value: "446",
  },
  {
    lable: "NFFC BestBall Overall",
    value: "444",
  },
  {
    lable: "Classic",
    value: "442",
  },
  {
    lable: "Guillotine",
    value: "455",
  },
  {
    lable: "Superflex",
    value: "469",
  },
];

const GET_NFFC_ADP = async (draft_type: { lable: string; value: string }) => {
  const browser: Browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url).catch((err) => {
    console.log("Webpage not found");
  });

  // inject date range values
  // uncomment the one you want to use depending on time of year

  await page.type("#from_date", pastMonth);
  // await page.type("#from_date", twoWeeks);
  await page.type("#to_date", inputDate);

  // select draft type drop down menu, then draft type desired
  await page.select("select#draft_type", draft_type.value);
  await page
    .waitForSelector("td:nth-child(2) > a", { timeout: 10000 })
    .catch((err) => {
      console.log("No table data found");
    });

  const adpData = await page.evaluate(() => {
    const playerRows = Array.from(
      document.querySelectorAll("#adp > tbody > tr")
    );
    // map each row in the table
    const data = playerRows.map((player: any) => ({
      rank: player.querySelector(".rank").innerText,
      playerName: player.querySelector("td:nth-child(2) > a").innerText,
      position: player.querySelector("td:nth-child(4)").innerText.trim(),
      team: player.querySelector("td:nth-child(3)").innerText.trim(),
      adp: player.querySelector("td:nth-child(5)").innerText,
    }));
    return data;
  });
  // replace write file for your DB post/update
  fs.writeFileSync(
    `${draft_type.lable} ${currentDate}.json`,
    JSON.stringify(adpData),
    (err: any) => {
      if (err) throw err;
    }
  );
  // closes puppeteer browser instance
  await browser.close();
};
// run the scraping function for each draft type from the draft types array
draft_types.forEach((draft_type) => {
  GET_NFFC_ADP(draft_type);
});
