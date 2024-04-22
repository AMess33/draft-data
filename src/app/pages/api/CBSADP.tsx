import type { NextApiRequest, NextApiResponse } from "next";

const puppeteer = require("puppeteer");
const fs = require("fs");
import { Browser } from "puppeteer";
const dayjs = require("dayjs");

const currentDate = dayjs().format("MM-DD-YYYY");

// urls for different draft types
let url = [
  {
    url: "https://www.cbssports.com/fantasy/football/draft/averages/",
    lable: "CBS Standard",
  },
  {
    url: "https://www.cbssports.com/fantasy/football/draft/averages/ppr/both/h2h/all/",
    lable: "CBS PPR",
  },
];

const CBS_ADP = async (url: { url: string; lable: string }) => {
  const browser: Browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url.url);

  const adpData = await page.evaluate(() => {
    const playerRows = Array.from(
      document.querySelectorAll(".TableBase-bodyTr")
    );
    // map each row in the table
    const data = playerRows.map((player: any) => ({
      // player rank data saved as rank
      rank: player.querySelector(" td:nth-child(1) ").innerText,
      playerName: player.querySelector(
        "td:nth-child(2) > span.CellPlayerName--long > span > a"
      ).innerText,
      // player position data saved as position
      position: player
        .querySelector(
          "td:nth-child(2) > span.CellPlayerName--long > span > span.CellPlayerName-position"
        )
        .innerText.trim(),
      // player team data saved as team
      team: player
        .querySelector(
          " td:nth-child(2) > span.CellPlayerName--long > span > span.CellPlayerName-team "
        )
        .innerText.trim(),
      // player adp data saved as adp
      adp: player.querySelector(" td:nth-child(4) ").innerText,
    }));
    return data;
  });
  // close puppeteer browser instance
  await browser.close();
  // replace write file for your DB post/update
  fs.writeFileSync(
    `${url.lable} ${currentDate}.json`,
    JSON.stringify(adpData),
    (err: any) => {
      if (err) throw err;
    }
  );
};
// run scraping function for both urls in the url function
url.forEach((url) => CBS_ADP(url));

export default CBS_ADP;
