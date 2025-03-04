import { decrypt, encrypt } from "./util/crypt";
import { getConfig } from "./util/config";
import { error, info } from "./util/logger";
import * as kdbx from "kdbxweb";

import {
  KdbexEntry,
  KdbexEntryInfo,
  KdbexEntryStore,
  SetupVerification,
} from "./model";
import { randomBytes } from "crypto";
import { base, registerToken } from "./app";
import { devPassword, getDatabase, saveDatabase } from "./util/file";
import { argon2 } from "./util/argon";

//All the functions to get directly the data from an entry

function url(entry: kdbx.KdbxEntry): string {
  return entry.fields.get("URL")!!.toString();
}
function title(entry: kdbx.KdbxEntry): string {
  return entry.fields.get("Title")!!.toString();
}
function username(entry: kdbx.KdbxEntry): string {
  return entry.fields.get("UserName")!!.toString();
}
function password(entry: kdbx.KdbxEntry): string {
  return (<kdbx.ProtectedValue>entry.fields.get("Password")).getText();
}

export function setup(verif: SetupVerification): boolean {
  let cmp = verif.message == decrypt(verif.hash, getConfig().cryptKey);
  if (cmp) {
    info("Setup has been done correctly, token is ok");
  }
  return cmp;
}

function toArrayBuffer(buf: Buffer) {
  const ab = new ArrayBuffer(buf.length);
  const view = new Uint8Array(ab);
  for (let i = 0; i < buf.length; ++i) {
    view[i] = buf[i];
  }
  return ab;
}

export async function login(password: string): Promise<string | number> {
  const filePassword = devPassword();
  kdbx.CryptoEngine.setArgon2Impl(argon2);
  let credentials = new kdbx.Credentials(
    kdbx.ProtectedValue.fromString(filePassword ? filePassword : password)
  );
  return getDatabase()
    .then((data) =>
      kdbx.Kdbx.load(toArrayBuffer(data), credentials)
        .then((db) => {
          var token = randomBytes(200).toString("hex");
          registerToken(db, token);
          return token;
        })
        .catch((reason) => {
          info("Wrong password : " + reason.message);
          return 401;
        })
    )
    .catch((err) => {
      error("Internal error : " + err);
      return 500;
    });
}

//the current entries, because the deleted entries are still visible
function notTrashIterator(): kdbx.KdbxEntry[] {
  let array = [];
  for (const entry of base.getDefaultGroup().allEntries()) {
    if (entry.parentGroup != base.getGroup(base.meta.recycleBinUuid!!)) {
      array.push(entry);
    }
  }
  return array;
}

export function getEntriesForName(name: string): KdbexEntryInfo[] {
  return notTrashIterator()
    .filter((entry) => title(entry).toLowerCase().includes(name))
    .map((entry) => ({ name: title(entry), id: entry.uuid.id }));
}

export function getEntriesForUrl(
  filledUrl: string
): KdbexEntryInfo[] {
  return notTrashIterator()
    .filter((entry) => url(entry).toLowerCase().includes(filledUrl))
    .map((entry) => ({ name: title(entry), id: entry.uuid.id }));
}

export function getEntry(
  id: string,
  code: number
): KdbexEntry | undefined {
  const entry = notTrashIterator().find((entry) => entry.uuid.id == id);
  if(entry) {
    return {
      id: entry.uuid.id,
      name: title(entry),
      passwordHash: (code & 2) > 0 ? encrypt(password(entry), getConfig().cryptKey) : undefined,
      username:  (code & 1) > 0 ? username(entry) : undefined,
    };
  }
  return undefined;
}

export async function createEntry(
  request: KdbexEntryStore
): Promise<KdbexEntry | boolean> {
  let entry = base.createEntry(base.getDefaultGroup());
  entry.fields.set("URL", request.url);
  entry.fields.set("UserName", request.username);
  entry.fields.set(
    "Password",
    kdbx.ProtectedValue.fromString(
      decrypt(request.pwHash, getConfig().cryptKey)
    )
  );
  entry.fields.set("Title", request.name);
  const faviconId = await setFavicon(request.faviconUrl, entry.customIcon, request.url);
  if(faviconId) {
    entry.customIcon = faviconId;
  }
  let v = { id: entry.uuid.id, name: title(entry) };
  return saveDatabase().then((b) => (b ? v : false));
}

export async function updateEntry(update: KdbexEntryStore): Promise<boolean> {
  for (let entry of base.getDefaultGroup().allEntries()) {
    if (entry.uuid.id == update.uuid) {
      info("Entry updating : " + title(entry));
      if(update.url) {
        entry.fields.set("URL", update.url);
      }
      if(update.username) {
        entry.fields.set("UserName", update.username);
      }
      if(update.pwHash) {
        entry.fields.set(
          "Password",
          kdbx.ProtectedValue.fromString(
            decrypt(update.pwHash, getConfig().cryptKey)
          )
        );
      }
      entry.customIcon = await setFavicon(update.faviconUrl, entry.customIcon, update.url);
      return saveDatabase();
    }
  }
  return false;
}

export function generatePassword(): string {
  const lowCase = "abcdefghijklmnopqrstuvxyz";
  const upCase = "ABCDEFGHIJKLMNOPQRSTUVXYZ";
  const numbers = "0123456789";
  const spec = "£$&()*+[]@#^-_!?";
  const arrays = [lowCase, upCase, numbers, spec];
  let size = 20;
  let pw = "";
  for (let i = 0; i < size; i++) {
    let arr = arrays[Math.floor(arrays.length * Math.random())];
    pw += arr.charAt(Math.floor(arr.length * Math.random()));
  }
  return pw;
}

async function setFavicon(faviconUrl: string, currentIconUuid: kdbx.KdbxUuid | undefined, _url: string): Promise<kdbx.KdbxUuid | undefined> {
  var uuid = currentIconUuid;
  if(uuid == undefined) {
    const value = Array.from(base.getDefaultGroup().allEntries()).find((entry) => entry.fields.get("URL") && url(entry) ==  _url && entry.customIcon);
    uuid = value ? value.customIcon!! : kdbx.KdbxUuid.random();
  }
  const favicon = await fetch(faviconUrl, {
    method: "GET",
  });
  if (favicon.ok) {
    const buffer = await favicon.arrayBuffer();
    const uuid = currentIconUuid ?? kdbx.KdbxUuid.random();
    base.meta.customIcons.set(uuid.id, {
      data: buffer,
      lastModified: new Date()
    });
    return uuid;
  } else {
    console.log("Favicon error", favicon);
    return undefined;
  }
}
