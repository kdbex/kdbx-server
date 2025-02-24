import fs from "fs";
import readline from "readline";
import { spawn } from "child_process";
import { exec } from "child_process";

const TEMP_FILE = "./appfolder/auth.tmp";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (question) => {
  return new Promise((resolve) => rl.question(question, resolve));
};

(async () => {
  if (!fs.existsSync(TEMP_FILE)) {
    const pw = await askQuestion("Enter the password (no password = normal login):");
    fs.writeFileSync(TEMP_FILE, pw, "utf8");
  }

  rl.close();

  const nodemonProcess = exec("nodemon src/app.ts --dev")

  nodemonProcess.stdout.pipe(process.stdout);
  nodemonProcess.stderr.pipe(process.stderr);

  // Cleanup function
  const cleanup = () => {
    if (fs.existsSync(TEMP_FILE)) {
      fs.unlinkSync(TEMP_FILE);
      console.log("\nTemporary auth file deleted.");
    }
    process.exit();
  };

  // Handle process termination
  process.on("SIGINT", cleanup); // Handle Ctrl+C
  process.on("SIGTERM", cleanup); // Handle process termination (kill)
  process.on("exit", cleanup); // Cleanup on exit

  nodemonProcess.on("exit", (code) => {
    cleanup();
  });
})();
