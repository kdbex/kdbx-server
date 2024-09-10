/**
 * Used to export functions to manage file storages
 * All the files will be stored in the current repo when working in dev mode, and in the appdata folder when in prod mode
 */
import fs from "fs";

const dev = process.argv.includes("--dev");
const folder = dev ? "./" : process.env.APPDATA + "\\Kdbex\\";
//Checks if the global folder is created, if not creates it
export function checkFolder() {
  if (!fs.existsSync(folder)) fs.mkdirSync(folder);
}

export function getFile(name: string): string {
  return folder + name;
}

export interface Config {
  filePath: string;
  port: number;
  cryptKey: string;
}
checkFolder();
if (!fs.existsSync(getFile("config.json"))) {
  fs.writeFileSync(
    getFile("config.json"),
    JSON.stringify({
      filePath: "",
      port: 3000,
      cryptKey: "",
    })
  );
}
var config: Config = JSON.parse(
  fs.readFileSync(getFile("config.json"), "utf-8")
);
export function getConfig() {
  return config;
}
