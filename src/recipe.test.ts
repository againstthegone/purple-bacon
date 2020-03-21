import { when } from 'jest-when';

import fs from 'fs';
import { EOL } from 'os';

import { fetchRecipesFromUrl, readRecipesFromJson, writeRecipesToCsv, writeRecipesToJson, Recipe } from "./recipe";
import { fetchHtml } from './html';

jest.mock('./html');

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

    describe('readRecipesFromJson', () => {
        it('should be able to read the recipes from a JSON file', () => {
            const jsonPath = 'read.json';
            fs.writeFileSync(jsonPath, '[ { "title": "Test title" } ]');

            const recipes = readRecipesFromJson(jsonPath);
            expect(recipes[0].title).toEqual('Test title');

            fs.unlinkSync(jsonPath);
        });

        it('should be able to cope where there is not a JSON file', () => {
            const recipes = readRecipesFromJson('does_not_exist.json');
            expect(recipes).toEqual([]);
        });
    });

    describe('writeRecipesFromJson', () => {
        it('should write a recipe to the file specified', () => {
            const jsonPath = 'write.json';
            writeRecipesToJson([{ title: 'a new test recipe', url: 'https://a-new-test-recipe-link' }] as Recipe[], jsonPath);

            const data = fs.readFileSync(jsonPath).toString().split(EOL);
            expect(data).toEqual([
                '[',
                '  {',
                '    "title": "a new test recipe",',
                '    "url": "https://a-new-test-recipe-link"',
                '  }',
                ']'
            ]);

            fs.unlinkSync(jsonPath);
        });
    });

    describe('fetchRecipesFromUrl', () => {
        const mockUrl = 'https://mock-url';

        beforeEach(() => {
            const html
                = '<!DOCTYPE html>'
                + '<body>'
                + ' <ul class="fit-post-categories">'
                + '     <li>Some category</li>'
                + '     <li>Another theme</li>'
                + ' </ul>'
                + ' <div class="recipe-instructions-headline">Test recipe</div>'
                + ' <ul class="macros-bottom-content">'
                + '     <li class="macros-bottom-info"><span class="macros-label">Calories</span><span class="macros">166</span></li>'
                + '     <li class="macros-bottom-info"><span class="macros-label">Protein</span><span class="macros">3g</span></li>'
                + '     <li class="macros-bottom-info"><span class="macros-label">Fat</span><span class="macros">14g</span></li>'
                + '     <li class="macros-bottom-info"><span class="macros-label">Carbs</span><span class="macros">6g</span></li>'
                + ' </ul>'
                + ' <div class="recipe-instructions-headline">Supplementary test recipe</div>'
                + ' <ul class="macros-bottom-content">'
                + '     <li class="macros-bottom-info"><span class="macros-label">Calories</span><span class="macros">134</span></li>'
                + '     <li class="macros-bottom-info"><span class="macros-label">Protein</span><span class="macros">7g</span></li>'
                + '     <li class="macros-bottom-info"><span class="macros-label">Fat</span><span class="macros">10g</span></li>'
                + '     <li class="macros-bottom-info"><span class="macros-label">Carbs</span><span class="macros">4g</span></li>'
                + ' </ul>'
                + '</body>';
            when(fetchHtml as jest.Mock<Promise<string>>).calledWith(mockUrl).mockResolvedValue(html);
        });

        it('should be able to retrieve the recipes', async () => {
            const recipes = await fetchRecipesFromUrl(mockUrl);
            expect(recipes).toEqual([
                {
                    title: 'Test recipe',
                    url: mockUrl,
                    categories: ['Some category', 'Another theme'],
                    calories: 166,
                    carbohydrate: 6,
                    fat: 14,
                    protein: 3
                },
                {
                    title: 'Supplementary test recipe',
                    url: mockUrl,
                    categories: ['Some category', 'Another theme'],
                    calories: 134,
                    carbohydrate: 4,
                    fat: 10,
                    protein: 7
                }
            ]);
        });
    });
});