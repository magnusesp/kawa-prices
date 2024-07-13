import {Ingredient, Recipe} from './Recipe'

class RecipeBook {
    private recipesByOutput: Map<string, Recipe[]>;

    constructor(recipes: Recipe[]) {
        this.recipesByOutput = new Map();

        recipes.forEach(recipe => {
            recipe.outputs.forEach(output => {
                if (!this.recipesByOutput.has(output.Ticker)) {
                    this.recipesByOutput.set(output.Ticker, []);
                }
                this.recipesByOutput.get(output.Ticker)?.push(recipe);
            });
        });
    }

    getRecipesByOutput(ticker: string): Recipe[] | undefined {
        return this.recipesByOutput.get(ticker);
    }

    calculatePrice(ticker: string, seen: Set<string> = new Set()): number {
        if (seen.has(ticker)) {
            throw new Error(`Circular dependency detected for ticker: ${ticker}`);
        }

        const recipes = this.getRecipesByOutput(ticker);
        if (!recipes) return 0;

        seen.add(ticker);
        let minPrice = Infinity;

        recipes.forEach(recipe => {
            
            if (recipe.price > 0) {
                minPrice = Math.min(minPrice, recipe.price);
            } else {
                let sumPrice = 0;
                recipe.Inputs.forEach((input: Ingredient) => {
                    sumPrice += this.calculatePrice(input.Ticker, seen) * input.Quantity;
                });
                minPrice = Math.min(minPrice, sumPrice);
                recipe.price = sumPrice
            }
        });

        seen.delete(ticker);
        return minPrice;
    }
    
    calculateAllPrices() {
        const startItem = (this.getRecipesByOutput('H2O') || [])[0]
        if (!startItem) {
            return
        }
        
        
        startItem.price = 25
    }
}