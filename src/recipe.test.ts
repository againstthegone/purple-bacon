import fs from 'fs';
import { EOL } from 'os';

import { writeRecipesToCsv, Recipe } from "./recipe";

describe('recipe', () => {
    describe('writeRecipesToCsv', () => {
        it('creates a csv with link, title, and nutritional information headers', () => {
            const csvPath = 'coreHeaders.csv';
            writeRecipesToCsv([], csvPath);

            const csvData = fs.readFileSync(csvPath).toString();
            expect(csvData).toEqual('title,calories,carbohydrate,fat,protein,url');

            fs.unlinkSync(csvPath);
        });

        it('adds all the found categories into the headers', () => {
            const csvPath = 'category-headers.csv';
            const recipes = [{ categories: ['a', 'c'] }, { categories: ['b', 'c'] }] as Recipe[];
            writeRecipesToCsv(recipes, csvPath);

            const csvData = fs.readFileSync(csvPath).toString();
            const header = csvData.split(EOL)[0];
            expect(header).toEqual('title,calories,carbohydrate,fat,protein,a,b,c,url');

            fs.unlinkSync(csvPath);
        });

        it('contains the recipe passed in', () => {
            const csvPath = 'single-recipe.csv';
            const recipes = [{ title: 'Test title', calories: 205, carbohydrate: 11, fat: 0, protein: 6, categories: ['s', 'r'], url: 'https://test-link' }] as Recipe[];
            writeRecipesToCsv(recipes, csvPath);

            const csvData = fs.readFileSync(csvPath).toString();
            const recipe = csvData.split(EOL)[1];
            expect(recipe).toEqual('"Test title",205,11,0,6,y,y,https://test-link');

            fs.unlinkSync(csvPath);
        });

        it('contains the recipes passed in', () => {
            const csvPath = 'double-recipe.csv';
            const recipe1 = { title: 'First title', calories: 205, carbohydrate: 11, fat: 0, protein: 6, categories: ['s', 'r'], url: 'https://test-link' };
            const recipe2 = { title: 'Second title', calories: 365, carbohydrate: 16, fat: 6, protein: 0, categories: ['a', 'c', 'r'], url: 'https://test-link' };
            writeRecipesToCsv([recipe1, recipe2], csvPath);

            const csvData = fs.readFileSync(csvPath).toString();
            const recipes = csvData.split(EOL).slice(1);
            expect(recipes).toEqual(['"First title",205,11,0,6,n,n,y,y,https://test-link', '"Second title",365,16,6,0,y,y,y,n,https://test-link']);

            fs.unlinkSync(csvPath);
        });
    });
});