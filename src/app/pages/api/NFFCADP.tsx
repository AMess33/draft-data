const puppeteer = require("puppeteer");
const fs = require("fs");

import { Browser } from "puppeteer";

const url = "https://nfc.shgn.com/adp/football";

const getADPData = async () => {
  const browser: Browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const adpData = await page.evaluate(() => {
    const playerRows = Array.from(document.querySelectorAll("#adp"));
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

getADPData();
