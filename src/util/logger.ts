import fs from "fs";
import { getLocalFile } from "./file";

//The different log types
enum Log {
	INFO,
	WARN,
	ERROR,
}	

//The file logger class
class Logger{

	constructor(){
		if(!fs.existsSync(this.file())){
			fs.appendFile(this.file(), "", () => {});
		}
	}

    file(): string{
        return getLocalFile("server.log");
    }

	log(message: string, tag: string){
		//TODO moments.js for the timezone ?
		const currentDate = new Date().toLocaleString();
		fs.appendFile(this.file(), currentDate + tag + message + "\n", () => {});
	}

	info(message: string){
		this.log(message, " [INFO] ");
	}

	warn(message: string){
		this.log(message, " [WARN] ");
	}

	error(message: string){
		this.log(message, " [ERROR] ");
	}
}
//We init to console or logger depending on the args
let o: Console | Logger;
if(process.argv.includes("--dev")){
    o = console;
}else{
    o = new Logger();
}

function log(s: string, log: Log) {
	switch (log) {
		case Log.INFO:
			o.info(s);
			break;
		case Log.WARN:
			o.warn(s);
			break;
		case Log.ERROR:
			o.error(s);
			break;
	}
}

export function info(s: string) {
	log(s, Log.INFO);
}

export function warn(s: string) {
	log(s, Log.WARN);
}

export function error(s: string) {
	log(s, Log.ERROR);
}