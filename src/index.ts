import { run } from "./app";

const args = process.argv.slice(2);
if (args.length <= 0) {
    throw new Error('Must provide "proxy://host" as initial argument');
}

const host = args[0];
const jsonPath = args[1];
const csvPath = args[2];

(async function main() {
    await run(host, jsonPath, csvPath);
})();