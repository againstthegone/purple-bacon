import fs from 'fs';
import { EOL } from 'os';

import cheerio from 'cheerio';

import { fetchHtml } from './html';

const TITLE_HEADER = 'title';
const CALORIES_HEADER = 'calories';
const CARBOHYDRATE_HEADER = 'carbohydrate';
const FAT_HEADER = 'fat';
const PROTEIN_HEADER = 'protein';
const URL_HEADER = 'url';

export interface Recipe {
    url: string,
    title: string,
    categories: string[],
    calories: number,
    carbohydrate: number,
    fat: number,
    protein: number,
}

export function writeRecipesToCsv(recipes: Recipe[], csvPath: string) {
    const allCategories = recipes.map(({ categories }) => categories)
        .reduce((acc, cur) => [...new Set([...acc, ...cur])], [])
        .sort();
    const headers = [TITLE_HEADER, CALORIES_HEADER, CARBOHYDRATE_HEADER, FAT_HEADER, PROTEIN_HEADER, ...allCategories, URL_HEADER];
    const data = recipes.map(({title, calories, carbohydrate, fat, protein, categories, url}) => {
        const categoryMarkers = allCategories.map((category) => categories.includes(category) ? 'y' : 'n');
        return [`"${title}"`, calories, carbohydrate, fat, protein, ...categoryMarkers, url].join();
    });
    fs.writeFileSync(csvPath, [headers, ...data].join(EOL));
}

export function readRecipesFromJson(jsonPath: string): Recipe[] {
    try {
        const buffer = fs.readFileSync(jsonPath);
        return JSON.parse(buffer.toString());
    }
    catch (e) {
        return [];
    }
}

export function writeRecipesToJson(recipes: Recipe[], jsonPath: string): void {
    fs.writeFileSync(jsonPath, JSON.stringify(recipes, null, 2));
}

export async function fetchRecipesFromUrl(url: string): Promise<Recipe[]> {
    const html = await fetchHtml(url);
    return findRecipesFromHtml(html).map((recipe) => ({ ...recipe, url }));
}

function findRecipesFromHtml(html: string): Omit<Recipe, 'url'>[] {
    const $ = cheerio.load(html);

    const categories = $('.fit-post-categories').first().children().map((i, e) => $(e).text()).get();
    const titles = $('.recipe-instructions-headline').map((_, e) => $(e).text().trim()).get();
    const nutritions = $('.macros-bottom-content').map((_, c) => 
        $(c).find('.macros-bottom-info').map((_, i) => {
            const label = $(i).find('.macros-label').text().trim().toLowerCase();
            const textValue = $(i).find('.macros').text().replace(/[^\d\.]/g, '');
            const value = textValue.length > 0 ? (textValue.includes('.') ? parseFloat(textValue) : parseInt(textValue)) : undefined;
            return {
                [label]: value
            };
        }).get().reduce((acc, cur) => ({ ...acc, ...cur }), {})
    ).get();

    if (titles.length !== nutritions.length) {
        throw new Error(`Inconsistent nutrition captured for recipes: (${titles.length}) recipes found, but (${nutritions.length}) sets of nutrition captured.`);
    }

    return titles.map((title, i) => ({
        title,
        categories,
        calories: nutritions[i].calories,
        carbohydrate: nutritions[i].carbs,
        fat: nutritions[i].fat,
        protein: nutritions[i].protein,
    }));
}