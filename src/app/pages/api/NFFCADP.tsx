const puppeteer = require("puppeteer");
const fs = require("fs");

import { Browser } from "puppeteer";

const url = "https://nfc.shgn.com/adp/football";

const NFFC_Primetime_ADP = async () => {
  const browser: Browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  // select draft type drop down menu, then draft type desired
  await page.select("#draft_type", "option:nth-child(2)");
  await page.waitForSelector("td:nth-child(2) > a", { timeout: 10000 });

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

  console.log(adpData);
  await browser.close();
};

NFFC_Primetime_ADP();

// primetime option:nth-child(3)
// rotowire online option:nth-child(4)
// NFFC BB online option:nth-child(5)
// classic option:nth-child(11)
// Guillotine option:nth-child(14)
// superflex option:nth-child(17)
