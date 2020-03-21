import fs from 'fs';
import { EOL } from 'os';

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