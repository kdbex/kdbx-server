import { checkDrive, checkFolder, driveBase, getLocalFile } from "./file";
import fs from "fs";

export interface Config {
    driveId: string | null;
    localPath: string | null;
    port: number;//The port on which the server will listen
    cryptKey: string;//The key used to crypt communication
    path: string;
}

const configFile = getLocalFile("config.json");
var config: Config;//The config that will be shared to other modules

/**
 * The function ran at the start, creates a default config if it does not exist
 */
export function initConfig() {
    checkFolder();
    if (!fs.existsSync(configFile)) {
        fs.writeFileSync(
            configFile,
            JSON.stringify({
                file: "",
                port: 3000,
                cryptKey: "",
                drive: false
            })
        );
    }
    config = JSON.parse(
        fs.readFileSync(configFile, "utf-8")
    );
    if (/*config.driveId != null*/false) {
        config.path = driveBase;
        checkDrive();
    } else {
        config.path = config.localPath;
    }
    
}

export function getConfig() {
    return config;
}