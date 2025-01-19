/**
 * Used to export functions to manage file storages
 * All the files will be stored in the current repo when working in dev mode, and in the appdata folder when in prod mode
 */
import fs from "fs";
import { getConfig } from "./config";
import { base } from "../app";
import { error, info } from "console";
import { drive_v3 } from "googleapis/build/src/apis/drive";
import { google } from "googleapis";

const dev = process.argv.includes("--dev");
const folder = dev ? "./appfolder/" : process.env.APPDATA + "\\Kdbex\\";
export const driveBase = getLocalFile("db.kdbx");//The location of the database file if linked to a drive
const driveDatesFile = getLocalFile("drive.json");//The location of the drive settings, to check updates
var drivesDateData: DriveLocal;//Keeps the last checked dates of local and drive files to check if any upload / download is needed

export function getLocalFile(name: string): string {
  return folder + name;
}

interface DriveLocal {
  localDate: number;//Last date of the local file update
  driveDate: number;//Last date of the drive update
}

//Checks if the global folder is created, if not creates it
export function checkFolder() {
  if (!fs.existsSync(folder)) fs.mkdirSync(folder);
  if(!fs.existsSync(driveDatesFile)) {
    let data = { localDate: 0, driveDate: 0 };
    fs.writeFileSync(driveDatesFile, JSON.stringify(data));
  }
  drivesDateData = JSON.parse(fs.readFileSync(driveDatesFile, "utf-8"));
}

var drive: drive_v3.Drive;

//Checks if the drive version of the db is newer, if so, updates the local version
//Note: no system of conflict resolution is implemented
export function checkDrive() {
  let credentials = JSON.parse(fs.readFileSync(getLocalFile("service.json"), "utf-8"));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
  drive = google.drive({ version: 'v3', auth });
  drive.files.get({ fileId: getConfig().driveId, fields: 'modifiedTime' })
    .then(async (res) => {
      let driveDate = new Date(res.data.modifiedTime);
      if(driveDate > new Date(drivesDateData.driveDate)) {//Newer version on drive
        downloadFromDrive(driveDate);
      }
      let localDate = fs.existsSync(driveBase) ? fs.statSync(driveBase).mtime : new Date(0);
      if(localDate > new Date(drivesDateData.localDate)) {//Newer local version that the one uploaded on the drive
        uploadToDrive();
      }
    })
}

//Gets the database file
export function getDatabase(): Promise<Buffer> {
  return fs.promises.readFile(getConfig().path);
}

async function downloadFromDrive(date: Date) {
  console.debug("Downloading newer version from drive");
  const response = await drive.files.get({ fileId: getConfig().driveId, alt: 'media'}, {responseType: 'arraybuffer' });
  if (response.data instanceof ArrayBuffer) {
    fs.writeFileSync(driveBase, Buffer.from(response.data));
    drivesDateData.driveDate = date.getTime();
    drivesDateData.localDate = fs.statSync(driveBase).mtime.getTime();
    fs.writeFileSync(driveDatesFile, JSON.stringify(drivesDateData));
  } else {
    console.debug("Error during file download : ", response.data);
  }
}

export function uploadToDrive() {
  console.debug("Uploading file to drive");
  const media = {
    body: fs.createReadStream(getConfig().path),
    media: 'application/octet-stream'
  };
  drive.files.update({
    fileId: getConfig().driveId,
    media: media
  }).then(() => {
    console.debug("File updated on drive");
    drivesDateData.localDate = fs.statSync(driveBase).mtime.getTime();
    fs.writeFileSync(driveDatesFile, JSON.stringify(drivesDateData));
  }).catch((err) => {
    console.debug("Error during file update", err);
  });
}

/**
 * Saves the database to the file
 * @returns true if ok, else if there is an error
 */
export function saveDatabase(): Promise<boolean> {
  return new Promise((resolve, _) => {
    base.save().then((ab) => {
      fs.promises.writeFile(getConfig().path, Buffer.from(ab)).then(() => {
        info("File saved !");
        if(getConfig().driveId != null) 
          uploadToDrive()
        resolve(true);
      }).catch((err) => {
        error("Error during file write : " + err);
        resolve(false);
      })
    }, (rej) => {
      error("Error during kdbx base saving : " + rej);
      resolve(false);
  });
})

}