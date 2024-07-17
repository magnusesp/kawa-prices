import { printNewPrices } from "../config";
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

    static currentPath: string[] = []

    constructor(ticker: string, data: RecipeData) {
        this.buildingTicker = data.BuildingTicker
        this.recipeName = data.RecipeName
        this.inputs = data.Inputs.map(input => ({ticker: input.Ticker, amount: input.Amount}))
        this.outputs = data.Outputs.map(output => ({ticker: output.Ticker, amount: output.Amount}))
        this.timeMs = data.TimeMs

        this.ticker = ticker
    }

    get price(): number {
        if (this._price < 0) {
            try {
                this._price = this.calculatePrice()
            } catch (e: any) {
                if (/Circular reference/.test(e)) {
//                    console.error(`Got circular reference for ${this.ticker}, skipping with Infinity`, e)
                    return Infinity
                }
            }
        }
        return this._price
    }

    calculatePrice(): number {
        if(Material.currentPath.includes(this.ticker)) {
            throw new Error(`Circular reference at ${this.ticker} ${this.recipeName}. Path: ${Material.currentPath.join(",")}`)
        }

        Material.currentPath.push(this.ticker)

        // TODO Enable multiple outputs
        const outputAmountTotal = this.outputs.reduce((sum, mat) => sum + mat.amount, 0)
        const outputAmountMaterial = this.outputs.find(mat => mat.ticker === this.ticker)?.amount

        if (!outputAmountMaterial) {
            throw new Error(`Cannot find output amount for material ${this.ticker} recipe ${this.recipeName}`)
        }

        const outputFractionMaterial = outputAmountMaterial / outputAmountTotal

        const priceInputs = this.calculatePriceInputs();
        const priceBuilding = this.calculatePriceBulding();
        // TODO is that actually accurate?
//
//        console.log(`Price Inputs: ${priceInputs}`);
//        console.log(`Price Building: ${priceBuilding}`);
//        console.log(`Output Amount Material: ${outputAmountMaterial}`);
//        console.log(`Output Amount Sum: ${outputAmountSum}`);

        const price = (priceInputs + priceBuilding) * outputFractionMaterial / outputAmountMaterial;

//        const price = (this.calculatePriceInputs() + this.calculatePriceBulding()) * (outputAmountMaterial / outputAmountSum)

        if (printNewPrices) console.log(`Material\t${this.ticker}\t${price}\t${this.recipeName}\t${Material.currentPath.join(",")}`)

        Material.currentPath.pop()
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
        return Object.assign(
            Object.create(Object.getPrototypeOf(this)),
            {
                ...this,
                _price
            })
    }
}

export class Materials {
    static current: RecipesMap = {}
    static previous: RecipesMap = {}

    static allTickers: string[] = []

    static importRecipes(data: RecipeData[], priceOverride: PriceOverrideMap = {}) {
        const allTickersMap: {[index: string]: number} = {}

        data
            .flatMap(recipeData => this.createMaterialInstances(recipeData))
            .forEach(material => {
                const currentMaterial = material
                const previousMaterial =  priceOverride[material.ticker] ? material.cloneWithPrice(priceOverride[material.ticker]) : material.cloneWithPrice(0)

                if (this.current[material.ticker]) {
                    this.current[material.ticker].push(currentMaterial)
                    this.previous[material.ticker].push(previousMaterial)
                } else {
                    this.current[material.ticker] = [currentMaterial]
                    this.previous[material.ticker] = [previousMaterial]
                }

                allTickersMap[material.ticker] = 1
            })

            this.allTickers = Object.keys(allTickersMap)
            this.allTickers.sort()
    }

    static createMaterialInstances(data: RecipeData): Material[] {
        return data.Outputs.map(output => new Material(output.Ticker, data))
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
        const receipe = iteration === Iteration.CURRENT
            ? this.current[ticker]
            : this.previous[ticker]

        if (!receipe) {
            throw new Error(`Unknown recipe ${ticker} in ${iteration}. Path: ${Material.currentPath.join(",")}`)
        }

        return receipe
    }

    static getCheapestRecipeByOutput(ticker: string, iteration: Iteration = Iteration.CURRENT): Material {
        const cheapestRecipe = this.getRecipesByOutput(ticker, iteration).reduce((min, recipe) => {
            return recipe.price < min.price ? recipe : min
        }, {price: Infinity} as unknown as Material)

        if (cheapestRecipe.price === Infinity) {
            throw new Error(`No usable recipes for ticker ${ticker}`)
        }

        return cheapestRecipe
    }
}

export enum Iteration {
    CURRENT = "CURRENT",
    PREVIOUS = "PREVIOUS"
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

type PriceOverrideMap = {
    [index: string]: number
}