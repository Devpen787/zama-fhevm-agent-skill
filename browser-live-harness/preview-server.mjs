import {createServer} from "node:http";
import {readFile, stat} from "node:fs/promises";
import {createReadStream} from "node:fs";
import {extname, join, normalize} from "node:path";
import {fileURLToPath} from "node:url";
import {execFile} from "node:child_process";
import {promisify} from "node:util";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const distDir = join(__dirname, "dist");
const rpcTarget = "http://127.0.0.1:8545";
const hardhatCwd = "/tmp/zama-validation";
const port = 4177;
const execFileAsync = promisify(execFile);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".wasm": "application/wasm",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
};

function sendNotFound(res) {
  res.writeHead(404, {"Content-Type": "text/plain; charset=utf-8"});
  res.end("Not found");
}

function sendJson(res, status, payload) {
  res.writeHead(status, {"Content-Type": "application/json; charset=utf-8"});
  res.end(JSON.stringify(payload, null, 2));
}

async function readJsonBody(req) {
  const bodyChunks = [];
  for await (const chunk of req) {
    bodyChunks.push(chunk);
  }

  if (!bodyChunks.length) return {};
  return JSON.parse(Buffer.concat(bodyChunks).toString("utf8"));
}

async function serveStatic(pathname, res) {
  const rawPath = pathname === "/" ? "/index.html" : pathname;
  const safePath = normalize(rawPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(distDir, safePath);

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      sendNotFound(res);
      return;
    }

    const contentType = mimeTypes[extname(filePath)] ?? "application/octet-stream";
    res.writeHead(200, {"Content-Type": contentType});
    createReadStream(filePath).pipe(res);
  } catch {
    sendNotFound(res);
  }
}

async function proxyRpc(req, res) {
  const bodyChunks = [];
  for await (const chunk of req) {
    bodyChunks.push(chunk);
  }

  const response = await fetch(rpcTarget, {
    method: req.method,
    headers: {
      "content-type": req.headers["content-type"] ?? "application/json",
    },
    body: bodyChunks.length ? Buffer.concat(bodyChunks) : undefined,
  });

  const bytes = Buffer.from(await response.arrayBuffer());
  res.writeHead(response.status, {
    "Content-Type": response.headers.get("content-type") ?? "application/json",
  });
  res.end(bytes);
}

async function runHardhatJson(scriptName, env = {}) {
  const {stdout} = await execFileAsync(
    "npx",
    ["hardhat", "run", "--network", "localhost", `scripts/${scriptName}`],
    {
      cwd: hardhatCwd,
      env: {
        ...process.env,
        ...env,
      },
      maxBuffer: 10 * 1024 * 1024,
    },
  );

  return JSON.parse(stdout);
}

async function handleEncryptVote(req, res) {
  try {
    const body = await readJsonBody(req);
    const payload = await runHardhatJson("generateConfidentialVotingInput.ts", {
      CONTRACT_ADDRESS: body.contractAddress,
      USER_ADDRESS: body.userAddress,
      VOTE: String(body.vote ?? true),
    });
    sendJson(res, 200, payload);
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "encrypt helper failed",
    });
  }
}

async function handleResetLiveVote(req, res) {
  try {
    const body = await readJsonBody(req);
    const payload = await runHardhatJson("deployConfidentialVoting.ts", {
      ADMIN_ADDRESS: body.adminAddress,
      ELIGIBLE_VOTER: body.eligibleVoter ?? body.adminAddress,
    });
    sendJson(res, 200, payload);
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "reset helper failed",
    });
  }
}

async function handleDecryptTally(req, res) {
  try {
    const body = await readJsonBody(req);
    const payload = await runHardhatJson("decryptConfidentialVotingTally.ts", {
      CONTRACT_ADDRESS: body.contractAddress,
      HANDLE_GETTER: body.handleGetter,
      USER_INDEX: String(body.userIndex ?? 0),
    });
    sendJson(res, 200, payload);
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "decrypt helper failed",
    });
  }
}

createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

  if (url.pathname.startsWith("/rpc")) {
    await proxyRpc(req, res);
    return;
  }

  if (url.pathname === "/api/encrypt-vote" && req.method === "POST") {
    await handleEncryptVote(req, res);
    return;
  }

  if (url.pathname === "/api/reset-live-vote" && req.method === "POST") {
    await handleResetLiveVote(req, res);
    return;
  }

  if (url.pathname === "/api/decrypt-tally" && req.method === "POST") {
    await handleDecryptTally(req, res);
    return;
  }

  await serveStatic(url.pathname, res);
}).listen(port, "127.0.0.1", () => {
  console.log(`Local preview server running at http://127.0.0.1:${port}/`);
});
