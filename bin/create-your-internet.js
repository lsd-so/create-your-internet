#!/usr/bin/env node

const { execSync } = require('child_process');
const { constants } = require('fs');
const fs = require('fs');
const { access } = require('fs/promises');
const os = require('os');
const path = require('path');
const readline = require('readline');
const which = require('which');

async function isExecutableInPath(command) {
  try {
    const path = await which(command);
    await access(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

async function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

const getPreferredPackageManager = async () => {
  const answer = await askQuestion("Do you prefer (npm) or (yarn)? [yarn]: ").toLowerCase();
  if (answer === "yarn" || answer.length === 0) {
    return "yarn"
  } else if (answer === "npm") {
    return "npm"
  } else {
    return getPreferredPackageManager();
  }
}

function isValidPackageName(name) {
  // Package names must be lowercase
  if (name !== name.toLowerCase()) return false;

  // Check length
  if (name.length === 0 || name.length > 214) return false;

  // Must be URL-safe
  if (!/^[a-z0-9-._~]+$/.test(name)) return false;

  // Cannot start with . or _
  if (name.startsWith('.') || name.startsWith('_')) return false;

  // Cannot contain consecutive dots
  if (name.includes('..')) return false;

  // Cannot be 'node_modules' or 'favicon.ico'
  if (['node_modules', 'favicon.ico'].includes(name)) return false;

  return true;
}

const getPreferredProjectName = async () => {
  const answer = await askQuestion("What would you like to name your project? [my_project]: ");
  if (answer.length === 0) {
    return "my_project"
  } else if (!isValidPackageName(answer)) {
    console.log("Provided an invalid project name");
    return getPreferredProjectName();
  }

  return answer;
}

const shouldAssistWithAuth = async () => {
  const answer = await askQuestion("Would you like to connect to your LSD account (Y)es/(N)o? [Y]: ").toLowerCase();
  if (answer === "y" || answer.length === 0) {
    return "y"
  } else if (answer === "n") {
    return "n"
  } else {
    return shouldAssistWithAuth();
  }
}

const shouldAssistWithBicycle = async () => {
  const answer = await askQuestion("Would you like to download the Bicycle browser (Y)es/(N)o? [Y]: ").toLowerCase();
  if (answer === "y" || answer.length === 0) {
    return "y"
  } else if (answer === "n") {
    return "n"
  } else {
    return shouldAssistWithBicycle();
  }
}

const assistWithLSDAuth = async () => {
  console.log(`
Click on the following URL and/or create an account then go to your profile
and create an API key`
  // Provide link to profle page
  // say to create an API key and paste
  // then write to .lsd in HOME
}

const assistWithBicycle = async () => {
  // Provide link to downloads page
  // say to download bicycle and enter when done

  // check and offer to assist as tail case if
  // browser happens to not be installed at end
}

const isBicycleInstalled = () => {
  if (process.platform === 'darwin') {  // macOS
    return fs.existsSync('/Applications/Bicycle.app');
  } else if (process.platform === 'win32') {  // Windows
    return fs.existsSync('C:\\Program Files\\Bicycle') || 
           fs.existsSync('C:\\Program Files (x86)\\Bicycle');
  } else {  // Linux
    return fs.existsSync('/usr/bin/Bicycle') || 
           fs.existsSync('/usr/local/bin/Bicycle');
  }
}

const lsdAuthExists = () => {
  const configFilePath = path.join(os.homedir(), ".lsd");
  const configFileExists = fs.existsSync(configFilePath);
  if (configFileExists) {
    return true;
  }

  const userEnvVar = process.env.LSD_USER || "";
  const passwordEnvVar = process.env.LSD_PASSWORD || "";

  if (userEnvVar && passwordEnvVar) {
    return true
  }

  return false
}

const authWizard = async () => {
  const authenticated = lsdAuthExists();
  if (!authenticated) {
    const shouldAssist = await shouldAssistWithAuth();
    if (shouldAssist === "y") {
      await assistWithLSDAuth();
    }
  }
}

const bicycleWizard = async () => {
  const hasBicycle = isBicycleInstalled();
  if (!hasBicycle) {
    const shouldAssist = await shouldAssistWithBicycle();

    if (shouldAssist === "y") {
      await assistWithBicycle();
    }
  }
}

const createProjectFolder = (name) => {
  fs.mkdirSync(name);
  process.chdir(`./${name}`);
}

const copyRelevantFiles = () => {
  fs.writeFileSync("tsconfig.json", JSON.stringify({
    compilerOptions: {
      lib: ["es2015", "dom"],
      target: "es2015",
      moduleResolution: "node",
      allowSyntheticDefaultImports: true
    },
    exclude: [
      "dist",
      "node_modules"
    ]
  }, null, 2));
}

const assistWithIndexTS = async () => {
  // Depending on whether or not the browser is installed
  // [.on()] it

  // here is where we ask the user about the web data they want
}

const copyDefaultIndexTS = () => {
  const hasBicycle = isBicycleInstalled();
  fs.writeSync("index.ts", `import drop from "internetdata";
import { z } from "zod";

const run = async () => {
  const trip = await drop.tab();

  const docsSchema = z.array(
    z.object({
      title: z.string(),
    }),
  );

  const docsTitle = await trip
    .on('${hasBicycle ? "BROWSER" : "TRAVERSER"}')
    .navigate('https://lsd.so/docs')
    .select('title')
    .extrapolate<typeof docsSchema>(docsSchema);

  console.log("What is the tile of the database docs page?");
  console.log(docsTitle);
};

run();`)
}

const initNewProject = (packageManager, projectName) => {
  execSync(`${packageManager} init -y --name=${projectName}`, {stdio: 'inherit'});
  if (packageManager === "yarn") {
    execSync(`yarn add internetdata zod`, { stdio: 'inherit' });
  } else {
    execSync(`npm i internetdata zod`, { stdio: 'inherit' });
  }
}

const shouldAssistWithCode = async () => {
  const answer = await askQuestion("Would you like help writing your internetdata integration (Y)es/(N)o? [Y]: ").toLowerCase();
  if (answer === "y" || answer.length === 0) {
    return "y"
  } else if (answer === "n") {
    return "n"
  } else {
    return shouldAssistWithCode();
  }
}

const goUpADirectory = () => {
  process.chdir(`./..`);
}

const printProjectDetails = (name) => {
  console.log(`Created a new internetdata project: ${name}
Get started by running the index.ts file:

$ cd ${name} && npx ts-node index.ts`);
}

const createYourInternet = async () => {
  console.clear();

  // Getting information for the project itself
  const preferredPackageManager = await getPreferredPackageManager();
  const packageManagerInPath = await isExecutableInPath(preferredPackageManager);
  if (!packageManagerInPath) {
    console.error(`Requested package manager [${preferredPackageManager}] however was not accessible in the path`);
    return;
  }
  const projectName = await getPreferredProjectName();

  // Assisting with tooling for LSD projects
  await authWizard();
  await bicycleWizard();

  // Assisting with the code scaffolding
  createProjectFolder(projectName);
  copyRelevantFiles();
  initNewProject(preferredPackageManager, projectName);

  const assistWithCode = await shouldAssistWithCode();
  if (assistWithCode) {
    await assistWithIndexTS()
  } else {
    copyDefaultIndexTS();
  }

  // Resetting and printing information about the new project before exiting
  goUpADirectory();
  printProjectDetails(projectName);
}

createYourInternet();
