import * as cheerio from "cheerio";
import { Fave, FaveOptions, FaveType, MAX_RETRIES } from "./types";

export const getUrl = (options: FaveOptions): string => {
  const BASE_URL = "https://news.ycombinator.com/favorites";
  const url = new URL(BASE_URL);
  for (const [key, value] of Object.entries(options)) {
    url.searchParams.append(key, String(value));
  }
  return url.toString();
};

export const getFavesHtmlList = async (
  options: FaveOptions
): Promise<cheerio.Element[] | null> => {
  const url = getUrl(options);
  const res = await fetch(url);
  const html = await res.text();
  if (html.length === 0) return null;

  const $ = cheerio.load(html);
  const list = $(".athing").toArray();

  if (!list.length) {
    const ERROR_STRING =
      "Sorry, we're not able to serve your requests this quickly.";
    const errorCell = $("body > center > table > tr:nth-child(3) > td");
    if (errorCell.text().trim() === ERROR_STRING) return null;
  }
  return list;
};

export const fetchFaves: Record<
  FaveType,
  (options: FaveOptions) => Promise<Fave[] | null>
> = {
  stories: async (options) => {
    const list = await getFavesHtmlList(options);
    if (!list) return null;

    return list.map((item) => {
      const $item = cheerio.load(item);
      const id = Number($item(".athing").attr("id")!);
      const title = $item("span.titleline a").contents().first().text();
      let url = $item("span.titleline a").attr("href")!;
      const hnUrl = `https://news.ycombinator.com/item?id=${id}`;
      if (url.startsWith("item")) url = `https://news.ycombinator.com/${url}`;
      return { id, title, url, hnUrl, type: "story" };
    });
  },
  comments: async (options) => {
    const list = await getFavesHtmlList(options);
    if (!list) return null;

    return list.map((item) => {
      const $item = cheerio.load(item);
      const id = Number($item(".athing").attr("id")!);
      const url = `https://news.ycombinator.com/${$item("span.age a").attr(
        "href"
      )!}`;
      const user = $item(".hnuser").text();

      return { id, url, user, type: "comment" };
    });
  },
};

export const paginateAndCollect = async (
  type: FaveType,
  options: FaveOptions,
  acc: Fave[] = [],
  retriesRemaining = MAX_RETRIES
): Promise<Fave[]> => {
  const faves = (await fetchFaves[type](options)) ?? [];
  if (!faves) {
    const retryDelay = Math.pow(2, MAX_RETRIES - retriesRemaining) * 1000;
    await new Promise<void>((resolve) => setTimeout(resolve, retryDelay));
    return retriesRemaining > 0
      ? paginateAndCollect(type, options, acc, retriesRemaining - 1)
      : acc;
  }
  const newAcc = [...acc, ...faves];
  if (faves.length < 30) return newAcc;
  await new Promise<void>((resolve) => setTimeout(resolve, 1000));
  return paginateAndCollect(type, { ...options, p: options.p + 1 }, newAcc);
};

export const getCacheKey = (request: Request<"type" | "id">): string => {
  const { id, type } = request.param();
  const { origin } = new URL(request.url);
  return `${origin}/${id}/${type}`;
};
