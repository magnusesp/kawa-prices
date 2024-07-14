import {Buildings} from "./Building";

export type MaterialAmount = {
    ticker: string
    amount: number
}

export class Material {
    buildingTicker: string
    ticker: string
    recipeName: string
    inputs: MaterialAmount[]
    outputs: MaterialAmount[]
    timeMs: number
    private _price: number = -1

    constructor(data: RecipeData) {
        this.buildingTicker = data.BuildingTicker
        this.recipeName = data.RecipeName
        this.inputs = data.Inputs.map(input => ({ticker: input.Ticker, amount: input.Amount}))
        this.outputs = data.Outputs.map(output => ({ticker: output.Ticker, amount: output.Amount}))
        this.timeMs = data.TimeMs

        if (this.outputs.length !== 1) {
            throw new Error(`Cannot handle multiple outputs yet. Recipe ${this.recipeName}`)
        }

        this.ticker = this.outputs[0].ticker
    }

    get price(): number {
        if (this._price < 0) {
            this._price = this.calculatePrice()
        }
        return this._price
    }

    set price(value: number) {
        this._price = value
    }

    calculatePrice(): number {
        // TODO Enable multiple outputs
        const outputAmount = this.outputs[0]?.amount

        if (!outputAmount) {
            throw new Error(`Cannot find output amount for material ${this.ticker} recipe ${this.recipeName}`)
        }

        const price = (this.calculatePriceInputs() + this.calculatePriceBulding()) / outputAmount

        console.log(`Material\t${this.ticker}\t${price}\t${this.recipeName}`)

        return price
    }

    calculatePriceInputs(): number {
        return this.inputs.reduce((sum, input) => {
            const material = Materials.getCheapestRecipeByOutput(input.ticker)
            return sum + material.price * input.amount
        }, 0)
    }

    calculatePriceBulding(): number {
        return Buildings.getBuildingByTicker(this.buildingTicker).costPerMs * this.timeMs
    }

    cloneWithPrice(_price: number): Material {
        return {
            ...this,
            _price
        }
    }
}

export class Materials {
    static current: RecipesMap = {}
    static previous: RecipesMap = {}

    static importRecipes(data: RecipeData[]) {
        data
            .map(recipeData => new Material(recipeData))
            .forEach(material => {
                const previousMaterial = material.cloneWithPrice(0)

                if (this.current[material.ticker]) {
                    this.current[material.ticker].push(material)
                    this.previous[material.ticker].push(previousMaterial)
                } else {
                    this.current[material.ticker] = [material]
                    this.previous[material.ticker] = [previousMaterial]
                }
            })
    }

    static prepareNextIteration() {
        this.previous = this.current
        this.current = Object.entries(this.current)
            .reduce((acc, [ticker, recipes]) => {
                acc[ticker] = recipes.map(it => it.cloneWithPrice(-1))
                return acc
            }, {} as RecipesMap)
    }

    static getRecipesByOutput(ticker: string, iteration: Iteration = Iteration.CURRENT): Material[] {
        return iteration === Iteration.CURRENT
            ? this.current[ticker]
            : this.previous[ticker]
    }

    static getCheapestRecipeByOutput(ticker: string, iteration: Iteration = Iteration.CURRENT): Material {
        const cheapestRecipe = this.getRecipesByOutput(ticker, iteration).reduce((min, recipe) => {
            return recipe.price < min.price ? recipe : min
        }, {price: Infinity} as unknown as Material)

        if (cheapestRecipe.price === Infinity) {
            throw new Error(`No recipes for ticker ${ticker}`)
        }

        return cheapestRecipe
    }
}

export enum Iteration {
    CURRENT,
    PREVIOUS
}

export type RecipeData = {
    BuildingTicker: string
    RecipeName: string
    StandardRecipeName: string
    Inputs: { Ticker: string, Amount: number }[]
    Outputs: { Ticker: string, Amount: number }[]
    TimeMs: number
}

type RecipesMap = {
    [index: string]: Material[]
}