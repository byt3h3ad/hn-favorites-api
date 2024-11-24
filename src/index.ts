import { Hono } from "hono";
import { trimTrailingSlash } from "hono/trailing-slash";
import { getCacheKey, paginateAndCollect } from "./utils";
import { FaveType } from "./types";

const app = new Hono({ strict: true });
app.use(trimTrailingSlash());

app.get("/:id/:type", async (ctx) => {
  const cache = caches.default;
  const cacheKey = getCacheKey(ctx.req);
  let response = await cache.match(cacheKey);
  if (response) return response;

  const { id, type } = ctx.req.param();
  if (!id) return ctx.text("Invalid ID", 400);
  if (!["comments", "stories"].includes(type))
    return ctx.text("Invalid type", 400);

  const faves = await paginateAndCollect(type as FaveType, {
    id,
    p: 1,
    comments: type === "comments",
  });
  response = ctx.json(faves, 200, {
    "Cache-Control": "max-age=86400",
  });

  ctx.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
});

app.get("/:id/:type/delete-cache", async (ctx) => {
  const cache = caches.default;
  const cacheKey = getCacheKey(ctx.req);
  const deleted = await cache.delete(cacheKey);
  return ctx.text(deleted ? "Cache deleted" : "Cache not found");
});

app.all("*", (ctx) =>
  ctx.text(`Usage:
======

GET /:username/stories
GET /:username/comments
`)
);

export default app;
