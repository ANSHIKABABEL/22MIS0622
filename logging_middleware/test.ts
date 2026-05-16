import { Log } from "./logger";

async function test() {
  await Log(
    "backend",
    "info",
    "handler",
    "Logger working successfully"
  );

  console.log("done");
}

test();