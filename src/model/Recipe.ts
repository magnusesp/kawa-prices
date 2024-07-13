import {Buildings} from "./Building";

export type Ingredient = {
    ticker: string
    amount: number
}

type RecipeData = {
    BuildingTicker: string
    RecipeName: string
    Inputs: Ingredient[]
    Outputs: Ingredient[]
    TimeMs: number
}

export class Recipe {
        buildingTicker: string
        recipeName: string
        inputs: Ingredient[]
        outputs: Ingredient[]
        timeMs: number
        private _price: number = 0

        constructor(data: RecipeData) {
            this.buildingTicker = data.BuildingTicker
            this.recipeName = data.RecipeName  
            this.inputs = data.Inputs
            this.outputs = data.Outputs
            this.timeMs = data.TimeMs
        }

        get price(): number {
            if(!this._price) {
                this._price = this.calculatePrice()
            }
            return this._price
        }
        
        calculatePrice(): number {
            // TODO divide by number of outputs
            return this.calculatePriceInputs() + this.calculatePriceBulding()
        }
        
        calculatePriceInputs(): number {
            return this.inputs.reduce((sum, input) => {
                const material = Recipes.getCheapestRecipeByOutput(input.ticker)
                return sum + material.price * input.amount
            }, 0)
        }
        
        calculatePriceBulding(): number {
            return Buildings.getBuildingByTicker(this.buildingTicker).costPerMs * this.timeMs
        }
    }

export class Recipes {
    static getRecipesByOutput(ticker: string): Recipe[] {
        
    }
    
    static getCheapestRecipeByOutput(ticker: string): Recipe {
        const cheapestRecipe = this.getRecipesByOutput(ticker).reduce((min, recipe) => {
            if (recipe.price < min.price) {
                return recipe
            } else {
                return min
            }
        }, {price: Infinity} as unknown as Recipe)
        
        if (cheapestRecipe.price === Infinity) {
            throw new Error(`No recipes for ticker ${ticker}`)
        }
        
        return cheapestRecipe
    }
}