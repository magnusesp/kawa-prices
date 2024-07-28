import {BaseMaterial} from "./BaseMaterial"
import {Core, Iteration} from "./Core"
import {Material, MaterialRecipeData} from "./Material"
import {NaturalResource, NaturalResourceData} from "./NaturalResource"
import {Planet} from "./Planet"

export class Materials {
    static current: MaterialsMap = {}
    static previous: MaterialsMap = {}

    static allTickers: string[] = []
    static allTickersMap: { [index: string]: number } = {}
    static tickerToMaterialIdMap: { [index: string]: string } = {}
    static materialIdToTickerMap: { [index: string]: string } = {}


    static importMaterials(materials: MaterialData[]) {
        materials.forEach(mat => {
            if (this.tickerToMaterialIdMap[mat.Ticker]) {
                throw new Error(`Duplicate material ${mat.Ticker} : ${this.tickerToMaterialIdMap[mat.Ticker]} vs ${mat.MaterialId}`)
            }

            if (this.materialIdToTickerMap[mat.MaterialId]) {
                throw new Error(`Duplicate material ${mat.MaterialId} : ${this.materialIdToTickerMap[mat.MaterialId]} vs ${mat.Ticker}`)
            }
            this.tickerToMaterialIdMap[mat.Ticker] = mat.MaterialId
            this.materialIdToTickerMap[mat.MaterialId] = mat.Ticker
        })
    }

    static importRecipes(
        materialRecipes: MaterialRecipeData[],
        priceOverride: PriceOverrideMap = {}) {

        materialRecipes
            .flatMap(recipeData => this.createMaterialInstances(recipeData))
            .forEach(material => {
                const currentMaterial = material
                const previousMaterial = priceOverride[material.ticker] ? material.cloneWithPrice(priceOverride[material.ticker]) : material.cloneWithPrice(0)

                if (this.current[material.ticker]) {
                    this.current[material.ticker].push(currentMaterial)
                    this.previous[material.ticker].push(previousMaterial)
                } else {
                    this.current[material.ticker] = [currentMaterial]
                    this.previous[material.ticker] = [previousMaterial]
                }

                this.allTickersMap[material.ticker] = 1
            })
    }

    static linkNaturalResourceAndPlanet(materialId: string, planetName: string, rawConcentration: number) {
        const materialTicker = this.materialIdToTickerMap[materialId]
        const naturalResourceCurrent = new NaturalResource(materialTicker, planetName, rawConcentration)
        const naturalResourcePrevious = naturalResourceCurrent.cloneWithPrice(0)

        if (!materialTicker) {
            throw new Error(`Missing material id ${materialId}`)
        }

        if (this.current[materialTicker]) {
            this.current[materialTicker].push(naturalResourceCurrent)
            this.previous[materialTicker].push(naturalResourcePrevious)
        } else {
            this.current[materialTicker] = [naturalResourceCurrent]
            this.previous[materialTicker] = [naturalResourcePrevious]
        }

        this.allTickersMap[materialTicker] = 1
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
        if(this.allTickers.length === 0) {
            this.allTickers = Object.keys(this.allTickersMap)
            this.allTickers.sort()
        }


        return this.allTickers
    }
}

type MaterialsMap = {
    [index: string]: BaseMaterial[]
}

type PriceOverrideMap = {
    [index: string]: number
}

export type MaterialData = {
    MaterialId: string;
    CategoryName: string;
    CategoryId: string;
    Name: string;
    Ticker: string;
    Weight: number;
    Volume: number;
    UserNameSubmitted: string;
    Timestamp: string; // or Date if converting to Date object
}