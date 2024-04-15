const puppeteer = require("puppeteer");
const fs = require("fs");
import { Browser } from "puppeteer";

const url = "https://www.cbssports.com/fantasy/football/draft/averages/";

const getADPData = async () => {
  const browser: Browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

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

  console.log(adpData);
  await browser.close();
  fs.writeFileSync("CBSadp.json", JSON.stringify(adpData), (err: any) => {
    if (err) throw err;
    console.log("The file has been saved!");
  });
};

getADPData();