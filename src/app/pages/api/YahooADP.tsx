const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs");
import { Browser } from "puppeteer";
const dayjs = require("dayjs");

const currentDate = dayjs().format("YYYY-MM-DD");

puppeteer.use(StealthPlugin());

const { executablePath } = require("puppeteer");

const url =
  "https://football.fantasysports.yahoo.com/f1/393/draftanalysis?pos=ALL";

const main = async () => {
  const browser: Browser = await puppeteer.launch({
    headless: true,
    executablePath: executablePath(),
  });
  const page = await browser.newPage();
  await page.goto(url);
  await page.waitForSelector("#fantasy-stat-table", {
    timeout: 10000,
  });

  const adpData = await page.evaluate(() => {
    const playerRows = Array.from(
      document.querySelectorAll("#fantasy-stat-table ")
    );

    const data = playerRows.map((player: any) => ({
      rank: player.querySelector("td:nth-child(2) > div").innerText,
      playerName: player.querySelector(
        "td:nth-child(1) > div > div > div.D(f).Fxd(c).Ai(s).Jc(c).Pstart(8px) > div.Fz(14px).Lh(17px).Fw(500)"
      ).innerText,
      position: player
        .querySelector(
          "td:nth-child(1) > div > div > div.D(f).Fxd(c).Ai(s).Jc(c).Pstart(8px) > div.C($text-secondary).Fz(12px).Lh(15px).Fw(500) > span"
        )
        .innerText.trim(),
      team: player
        .querySelector(
          " td:nth-child(1) > div > div > div.D(f).Fxd(c).Ai(s).Jc(c).Pstart(8px) > div.C($text-secondary).Fz(12px).Lh(15px).Fw(500) "
        )
        .innerText.trim(),
      adp: player.querySelector("td:nth-child(7) > div ").innerText,
      prevWeekADP: player.querySelector(" td:nth-child(8) > div ").innerText,
    }));
    return data;
  });
  console.log(adpData);
  await browser.close();
  fs.writeFile("CBSadp.json", JSON.stringify(adpData), (err: any) => {
    if (err) throw err;
    console.log("The file has been saved!");
  });
};

main();

// table body selector not found properly, id was changing on each page load/ then no id was present
