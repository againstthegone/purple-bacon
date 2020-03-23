import cheerio from 'cheerio';

import { fetchHtml } from "./html";

export function fetchRecipeUrls(url: string, htmlFetcher: (url: string) => Promise<string> = fetchHtml): Promise<string[]> {
    return fetchAllRecipeUrlsFromPaginationUrl(`${url}/recipes/`, htmlFetcher);
}

async function fetchAllRecipeUrlsFromPaginationUrl(paginationUrl: string, htmlFetcher: (url: string) => Promise<string>, _pageNumber: number = 1, _recipeUrls: string[] = []): Promise<string[]> {
    const pageUrl = _pageNumber <= 1 ? paginationUrl : `${paginationUrl}page/${_pageNumber}/`;
    const html = await htmlFetcher(pageUrl);
    const $ = cheerio.load(html);
    const pageRecipeUrls = $('.fit-post-title > a').map((_, e) => $(e).attr('href')).get();
    return pageRecipeUrls.length <= 0
        ? _recipeUrls
        : fetchAllRecipeUrlsFromPaginationUrl(paginationUrl, htmlFetcher, _pageNumber + 1, [..._recipeUrls, ...pageRecipeUrls]);
}
