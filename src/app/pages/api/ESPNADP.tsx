import type { NextApiRequest, NextApiResponse } from "next";

const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs");
import { Browser } from "puppeteer";

// steal plugin and executable path help avoid bot detection
puppeteer.use(StealthPlugin());
const { executablePath } = require("puppeteer");

const url = "https://fantasy.espn.com/football/livedraftresults";

(async () => {
  const browser: Browser = await puppeteer.launch({
    defaultViewport: false,
    executablePath: executablePath(),
  });
  const page = await browser.newPage();
  await page.goto(url).catch((err) => {
    console.log("Webpage not found");
  });

  let players = new Array();
  let isBtnDisabled = false;
  let firstPlayer = "";

  await page.waitForSelector("tbody > tr").catch((err) => {
    console.log("No table data found");
  });

  while (!isBtnDisabled) {
    await page.waitForFunction(
      // function to run in wait for function
      // grab player name at top of current page
      (p) => {
        const player = document.querySelector<HTMLDivElement>(
          "tbody > tr > td:nth-child(2) > div"
        )?.title;
        // check global variable vs current player
        if (!p || player !== p) {
          return true;
        }
        return false;
      },
      // function arguments for slowing down webpage and allowing to load
      { polling: 5000, timeout: 60000 },
      // pass in first player variable as argument
      firstPlayer
    );

    const first = await page.evaluate(() => {
      return document.querySelector<HTMLElement>(
        "tbody > tr > td:nth-child(2) > div"
      )?.title;
    });

    firstPlayer = first ?? "";

    // select table row and loop through them for data scraping

    const playerRows = await page.$$(".Table__TBODY > tr");

    for (const playerData of playerRows) {
      let rank: any = "Null";
      let playerName: any = "Null";
      let position: any = "Null";
      let team: any = "Null";
      let adp: any = "Null";
      let changeADP: any = "Null";
      let auctionValue: any = "Null";
      let auctionChange: any = "Null";
      // scrape rank data
      try {
        rank = await page.evaluate(
          (el: any) => el.querySelector("td:nth-child(1) > div").innerText,
          playerData
        );
      } catch (error) {
        console.log("rank selector not found");
      }
      // scrape player name data
      try {
        playerName = await page.evaluate(
          (el: any) =>
            el.querySelector(
              "td:nth-child(2) > div > div > div.jsx-1811044066.player-column_info.flex.flex-column > div > div.jsx-1811044066.player-column__athlete.flex > span > a"
            ).innerText,
          playerData
        );
      } catch (error) {
        console.log("player name selector not found");
      }
      // scrape position data
      try {
        position = await page.evaluate(
          (el: any) =>
            el.querySelector(
              "td:nth-child(2) > div > div > div.jsx-1811044066.player-column_info.flex.flex-column > div > div.jsx-1811044066.player-column__position.flex > span.playerinfo__playerpos.ttu"
            ).innerText,
          playerData
        );
      } catch (error) {
        console.log("position selector not found");
      }
      // scrape team name data
      try {
        team = await page.evaluate(
          (el: any) =>
            el.querySelector(
              "td:nth-child(2) > div > div > div.jsx-1811044066.player-column_info.flex.flex-column > div > div.jsx-1811044066.player-column__position.flex > span.playerinfo__playerteam"
            ).innerText,
          playerData
        );
      } catch (error) {
        console.log("team selector not found");
      }
      // scrape adp data
      try {
        adp = await page.evaluate(
          (el: any) => el.querySelector("td:nth-child(3) > div").innerText,
          playerData
        );
      } catch (error) {
        console.log("adp selector not found");
      }
      // scrape adp change data
      try {
        changeADP = await page.evaluate(
          (el: any) =>
            el.querySelector("td:nth-child(4) > div > span").innerText,
          playerData
        );
      } catch (error) {
        console.log("change adp selector not found");
      }
      // scrape auction value data
      try {
        auctionValue = await page.evaluate(
          (el: any) => el.querySelector("td:nth-child(5) > div").innerText,
          playerData
        );
      } catch (error) {
        console.log("auction value selector not found");
      }
      // scrape auction change data
      try {
        auctionChange = await page.evaluate(
          (el: any) => el.querySelector("td:nth-child(6) > div").innerText,
          playerData
        );
      } catch (error) {
        console.log("auction change selector not found");
      }
      // push player data into players array
      if (rank !== "Null") {
        players.push({
          rank,
          playerName,
          position,
          team,
          adp,
          changeADP,
          auctionValue,
          auctionChange,
        });
      }
    }

    // checking for last page status based on next button
    await page.waitForSelector(".Pagination__Button--next", {
      visible: true,
    });
    const is_disabled =
      (await page.$(".Pagination__Button--next.Button--disabled")) !== null;

    isBtnDisabled = is_disabled;

    if (!is_disabled) {
      await page.click(".Pagination__Button--next");
    }
  }

  // replace write file for your DB post/update
  fs.writeFile(
    "espnADP.json",
    JSON.stringify({
      players,
    }),
    (err: any) => {
      if (err) throw err;
    }
  );
  // closes puppeteer browser instance
  await browser.close();
})();
