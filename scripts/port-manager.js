import { execSync } from "node:child_process";

function getPortOwners(port) {
  if (process.platform === "win32") {
    const output = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf8" });
    const lines = output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => line.includes("LISTENING"));

    return [...new Set(lines.map((line) => line.split(/\s+/).at(-1)).filter(Boolean))];
  }

  const output = execSync(`lsof -ti tcp:${port}`, { encoding: "utf8" });
  return [...new Set(output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean))];
}

function stopPortOwners(port) {
  const owners = getPortOwners(port);
  if (!owners.length) {
    console.log(`Port ${port} is free.`);
    return;
  }

  for (const pid of owners) {
    if (process.platform === "win32") {
      execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
    } else {
      execSync(`kill -9 ${pid}`, { stdio: "ignore" });
    }
    console.log(`Stopped PID ${pid} on port ${port}.`);
  }
}

function printStatus(port) {
  const owners = getPortOwners(port);
  if (!owners.length) {
    console.log(`Port ${port} is free.`);
    return;
  }
  console.log(`Port ${port} is in use by PID(s): ${owners.join(", ")}`);
}

const [, , command = "status", portArg = "3036"] = process.argv;
const port = Number(portArg);

try {
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`Invalid port: ${portArg}`);
  }

  if (command === "stop") {
    stopPortOwners(port);
  } else if (command === "status") {
    printStatus(port);
  } else {
    throw new Error(`Unknown command: ${command}`);
  }
} catch (error) {
  if (error?.status === 1) {
    console.log(`Port ${port} is free.`);
    process.exit(0);
  }

  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
