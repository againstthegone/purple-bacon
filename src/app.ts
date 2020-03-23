import { readRecipesFromJson, Recipe, fetchRecipesFromUrl, writeRecipesToJson, writeRecipesToCsv } from "./recipe";
import { fetchRecipeUrls } from "./url";

export async function run(host: string, jsonPath = `${host}.json`, csvPath = `${host}.csv`) {    
    const existingRecipes = readRecipesFromJson(jsonPath);
    const recipes: Recipe[] = [...existingRecipes];
    console.log(`${recipes.length} recipes loaded from ${jsonPath}`);

    console.log(`Fetching recipe urls from ${host}`);
    const externalRecipeUrls: string[] = await fetchRecipeUrls(`https://${host}`);
    console.log(`${externalRecipeUrls.length} recipe urls found`);

    const existingRecipesUrls = [...new Set(existingRecipes.map(({ url }) => url))];
    const missingRecipesUrls = externalRecipeUrls.filter((url) => !existingRecipesUrls.includes(url));
    for(let url of missingRecipesUrls) {
        console.log(`Checking ${url} for recipes`);
        const urlRecipes = await fetchRecipesFromUrl(url);
        urlRecipes.forEach(({ title }) => console.log(`${title} added`));
        recipes.push(...urlRecipes);
    }
    console.log(`${recipes.length - existingRecipes.length} recipes added`);

    writeRecipesToJson(recipes, jsonPath);
    console.log(`Recipes written to ${jsonPath}`);
    writeRecipesToCsv(recipes, csvPath);
    console.log(`Recipes written to ${csvPath}`);
}