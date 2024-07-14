import {MaterialAmount, Iteration, Materials} from "./Material";
import {Worker, Workers} from "./Worker"

export type WorkerAllocation = {
    worker: Worker
    amount: number
}

export class Building {
    ticker: string
    buildingCosts: MaterialAmount[]
    workforce: WorkerAllocation[]

    roiDays = 21

    private _costPerMs: number = -1

    constructor(data: BuildingData) {
        this.buildingCosts = this.extractBuildingCosts(data)
        this.ticker = data.Ticker
        this.workforce = this.extractWorkforce(data)
    }

    get costPerMs(): number {
        if (this._costPerMs < 0) {
            this._costPerMs = this.calculateCostPerMs()
        }
        return this._costPerMs
    }

    calculateCostPerMs(): number {
        const cost = this.calculateCostPerMsWorkforce() + this.calculateCostPerMsBuildingRoi()

//        console.log(`Building\t${this.ticker}\t${cost * 86_400_000}\t(per day)`)

        return cost
    }

    calculateCostPerMsWorkforce(): number {
        return this.workforce.reduce((sum, allocation) => {
            return sum + allocation.worker.costPerDay * allocation.amount / 86_400_000
        }, 0)
    }

    calculateCostPerMsBuildingRoi(): number {
        return this.buildingCosts.reduce((sum, buildingIngrdient) => {
            const material = Materials.getCheapestRecipeByOutput(buildingIngrdient.ticker, Iteration.PREVIOUS)
            return sum + material.price * buildingIngrdient.amount / (this.roiDays * 86_400_000)
        }, 0)
    }

    extractBuildingCosts(data: BuildingData): MaterialAmount[] {
        return data.BuildingCosts.map(it => ({
            ticker: it.CommodityTicker,
            amount: it.Amount
        }))
    }

    extractWorkforce(data: BuildingData): WorkerAllocation[] {
        const workerTypes = ["Pioneers"] // , "Settlers", "Technicians", "Engineers", "Scientists"]

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

    cloneWithCost(_costPerMs: number): Building {
        return Object.assign(
            Object.create(Object.getPrototypeOf(this)),
            {
                ...this,
                _costPerMs
            })
    }
}

export class Buildings {
    static current: BuildingsMap = {}
    static getBuildingByTicker(ticker: string): Building {
        return this.current[ticker]
    }

    static importBuildings(data: BuildingData[]) {
        data
            .map(buildingData => new Building(buildingData))
            .forEach(building => {
                this.current[building.ticker] = building
            })
    }

    static prepareNextIteration() {
        this.current = Object.entries(this.current)
            .reduce((acc, [ticker, building]) => {
                acc[ticker] = building.cloneWithCost(-1)
                return acc
            }, {} as BuildingsMap)
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
        Inputs: MaterialAmount[]
        Outputs: MaterialAmount[]
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

type BuildingsMap = {
    [index: string]: Building
}