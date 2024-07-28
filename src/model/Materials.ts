import { BaseMaterial } from "./BaseMaterial"
import {Core, Iteration } from "./Core"
import { Material, MaterialRecipeData } from "./Material"
import { NaturalResourceData } from "./NaturalResource"

export class Materials {
    static current: MaterialsMap = {}
    static previous: MaterialsMap = {}

    static allTickers: string[] = []

    static importMaterials(
        materialRecipes: MaterialRecipeData[],
        naturalResources: NaturalResourceData[],
        priceOverride: PriceOverrideMap = {}) {
        const allTickersMap: {[index: string]: number} = {}

        materialRecipes
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

    static createMaterialInstances(data: MaterialRecipeData): Material[] {
        return data.Outputs.map(output => new Material(output.Ticker, data))
    }

    static prepareNextIteration() {
        this.previous = this.current
        this.current = Object.entries(this.current)
            .reduce((acc, [ticker, recipes]) => {
                acc[ticker] = recipes.map(it => it.cloneWithPrice(-1))
                return acc
            }, {} as MaterialsMap)
    }

    static getRecipesByOutput(ticker: string, iteration: Iteration = Iteration.CURRENT): BaseMaterial[] {
        const receipe = iteration === Iteration.CURRENT
            ? this.current[ticker]
            : this.previous[ticker]

        if (!receipe) {
            throw new Error(`Unknown recipe ${ticker} in ${iteration}. Path: ${Core.returnPathAsString()}`)
        }

        return receipe
    }

    static getCheapestRecipeByOutput(ticker: string, iteration: Iteration = Iteration.CURRENT): BaseMaterial {
        const cheapestRecipe = this.getRecipesByOutput(ticker, iteration).reduce((min, recipe) => {
            return recipe.price < min.price ? recipe : min
        }, {price: Infinity} as unknown as Material)

        if (cheapestRecipe.price === Infinity) {
            throw new Error(`No usable recipes for ticker ${ticker}, path ${Core.returnPathAsString()}`)
        }

        return cheapestRecipe
    }
    
    static getAllTickers(): string[] {
        return this.allTickers
    }
}

type MaterialsMap = {
    [index: string]: BaseMaterial[]
}

type PriceOverrideMap = {
    [index: string]: number
}