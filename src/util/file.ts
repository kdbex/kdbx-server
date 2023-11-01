import fs from "fs";

/**
 * Used to export functions to manage file storages
 * All the files will be stored in the current repo when working in dev mode, and in the appdata folder when in prod mode
 */
var dev = process.argv.includes("--dev");
var folder = dev ? "./" : (process.env.APPDATA + "/KdbxChrome/");

//fs.readFileSync(path.resolve(process.cwd(), "config.json"), "utf-8")
//Checks if the global folder is created, if not creates it
export function checkFolder () {
    if(!fs.existsSync(folder))
        fs.mkdirSync(folder)
}

export function getFile(name: string): string {
    return folder + name;
}

export default folder;