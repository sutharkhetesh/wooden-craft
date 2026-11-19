import https from "node:https";

// Node's default fetch fails to connect on some dual-stack networks. Keep this
// adapter at the Node boundary; the hosted Worker uses its own native fetch.
/** @type {typeof fetch} */
export async function databaseFetch(input, init) {
  const request = new Request(input, init);
  request.signal.throwIfAborted();
  const body = Buffer.from(await request.arrayBuffer());
  return new Promise((resolve, reject) => {
    const req = https.request(
      new URL(request.url),
      {
        method: request.method,
        headers: Object.fromEntries(request.headers),
        family: 4,
        timeout: 15000,
        signal: request.signal,
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        res.on("error", reject);
        res.on("end", () => {
          resolve(
            new Response(Buffer.concat(chunks), {
              status: res.statusCode,
            }),
          );
        });
      },
    );
    req.on("timeout", () =>
      req.destroy(new Error("Database HTTPS request timed out")),
    );
    req.on("error", reject);
    req.end(body);
  });
}
