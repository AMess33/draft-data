import { exec } from "child_process";

const runFile = (filePath: string) => {
  exec("npx tsx " + filePath, (error: any, stdout: any, stderr: any) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
};

const files = [
  "src/app/pages/api/CBSADP.tsx",
  "src/app/pages/api/DraftKingsADP.tsx",
  "src/app/pages/api/ESPNADP.tsx",
  "src/app/pages/api/NFLADP.tsx",
  "src/app/pages/api/NFFCADP.tsx",
  "src/app/pages/api/RTSADP.tsx",
  "src/app/pages/api/SFBADP.tsx",
  "src/app/pages/api/YahooADP.tsx",
  "src/app/pages/api/UNDERDOGADP.tsx",
  "src/app/pages/api/DLFRankings.tsx",
];
for (const file of files) {
  runFile(file);
}
