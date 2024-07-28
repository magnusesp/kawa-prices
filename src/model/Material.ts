import { printNewPrices } from "../config";
import {BaseMaterial} from "./BaseMaterial";
import {Buildings} from "./Building";
import { Core, Iteration } from "./Core";
import { Materials } from "./Materials";

export type MaterialAmount = {
    ticker: string
    amount: number
}

export class Material extends BaseMaterial {
    inputs: MaterialAmount[]
    outputs: MaterialAmount[]


    constructor(ticker: string, data: MaterialRecipeData) {
        super(data.BuildingTicker, ticker, data.TimeMs, data.RecipeName)

        this.inputs = data.Inputs.map(input => ({ticker: input.Ticker, amount: input.Amount}))
        this.outputs = data.Outputs.map(output => ({ticker: output.Ticker, amount: output.Amount}))
    }



    override calculatePrice(): number {
        Core.pushPath(this.ticker, Iteration.CURRENT, this.sourceName)

        // TODO Enable multiple outputs
        const outputAmountTotal = this.outputs.reduce((sum, mat) => sum + mat.amount, 0)
        const outputAmountMaterial = this.outputs.find(mat => mat.ticker === this.ticker)?.amount

        if (!outputAmountMaterial) {
            throw new Error(`Cannot find output amount for material ${this.ticker} recipe ${this.sourceName}`)
        }

        const outputFractionMaterial = outputAmountMaterial / outputAmountTotal

        const priceInputs = this.calculatePriceInputs();
        const priceBuilding = this.calculatePriceBulding();

        const price = (priceInputs + priceBuilding) * outputFractionMaterial / outputAmountMaterial;

        if (printNewPrices) console.log(`Material\t${this.ticker}\t${price}\t${this.sourceName}\t${Core.returnPathAsString(false)}`)

        Core.popPath(this.ticker, Iteration.CURRENT)
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
}

export type MaterialRecipeData = {
    BuildingTicker: string
    RecipeName: string
    StandardRecipeName: string
    Inputs: { Ticker: string, Amount: number }[]
    Outputs: { Ticker: string, Amount: number }[]
    TimeMs: number
}