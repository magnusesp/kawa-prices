import {Ingredient, Recipes} from "./Recipe";
import {Worker, Workers} from "./Worker"

export type WorkerAllocation = {
    worker: Worker
    amount: number
}

export class Building {
    ticker: string
    buildingCosts: Ingredient[]
    workforce: WorkerAllocation[]

    roiDays = 21

    private _costPerMs: number = 0

    constructor(data: BuildingData) {
        this.buildingCosts = this.extractBuildingCosts(data)
        this.ticker = data.Ticker
        this.workforce = this.extractWorkforce(data)
    }

    get costPerMs(): number {
        if (!this._costPerMs) {
            this._costPerMs = this.calculateCostPerMs()
        }
        return this._costPerMs
    }

    calculateCostPerMs(): number {
        return this.calculateCostPerMsWorkforce() + this.calculateCostPerMsBuildingRoi()
    }

    calculateCostPerMsWorkforce(): number {
        return this.workforce.reduce((sum, allocation) => {
            return sum + allocation.worker.costPerDay * allocation.amount / 86_400_000
        }, 0)
    }

    calculateCostPerMsBuildingRoi(): number {
        return this.buildingCosts.reduce((sum, buildingIngrdient) => {
            const material = Recipes.getCheapestRecipeByOutput(buildingIngrdient.ticker)
            return sum + material.price * buildingIngrdient.amount / (this.roiDays * 86_400_000)
        }, 0)
    }

    extractBuildingCosts(data: BuildingData): Ingredient[] {
        return data.BuildingCosts.map(it => ({
            ticker: it.CommodityTicker,
            amount: it.Amount
        }))
    }

    extractWorkforce(data: BuildingData): WorkerAllocation[] {
        const workerTypes = ["Pioneers", "Settlers", "Technicians", "Engineers", "Scientists"]

        return workerTypes.map(type => {
            const worker = Workers.getWorkerOfType(type)
            // @ts-ignore
            const amount = data[type]

            if (!worker) {
                throw new Error(`Worker of type ${type} does not exist`)
            }

            if (amount === undefined || amount === null) {
                throw new Error(`Data for ${type} is missing or invalid`)
            }

            return {worker, amount}
        })
    }
}

export class Buildings {
    static getBuildingByTicker(tiker: string): Building {

    }
}

export type BuildingData = {
    BuildingCosts: {
        CommodityName: string
        CommodityTicker: string
        Weight: number
        Volume: number
        Amount: number
    }[]
    Recipes: {
        Inputs: Ingredient[]
        Outputs: Ingredient[]
        BuildingRecipeId: string
        DurationMs: number
        RecipeName: string
        StandardRecipeName: string
    }[]
    BuildingId: string
    Name: string
    Ticker: string
    Expertise: string
    Pioneers: number
    Settlers: number
    Technicians: number
    Engineers: number
    Scientists: number
    AreaCost: number
    UserNameSubmitted: string
    Timestamp: string
}