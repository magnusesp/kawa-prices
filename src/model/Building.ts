import {MaterialAmount} from "./Material"
import {Worker, Workers} from "./Worker"
import {baseRoiDays, printNewPrices} from "../config"
import { Core, Iteration } from "./Core"
import { Materials } from "./Materials"

export type WorkerAllocation = {
    worker: Worker
    amount: number
}

export class Building {
    ticker: string
    area: number
    buildingCosts: MaterialAmount[]
    workforce: WorkerAllocation[]

    private _costPerMs: number = -1

    constructor(data: BuildingData) {
        this.ticker = data.Ticker
        this.area = data.AreaCost
        this.buildingCosts = this.extractBuildingCosts(data)
        this.workforce = this.extractWorkforce(data)
        
    }

    get costPerMs(): number {
        Core.pushPath(this.ticker, Iteration.LOOKUP, `${this._costPerMs}`)

        if (this._costPerMs < 0) {
            this._costPerMs = this.calculateCostPerMs()
        }
        return this._costPerMs
    }

    calculateCostPerMs(): number {
        Core.pushPath(this.ticker, Iteration.PREVIOUS)

        const cost =  this.calculateCostPerMsWorkforce() + this.calculateCostPerMsBuildingRoi()

        if (printNewPrices) console.log(`Building\t${this.ticker}\t${cost * 86_400_000}\t(per day)`)

        Core.popPath(this.ticker, Iteration.PREVIOUS)

        return cost
    }

    calculateCostPerMsWorkforce(): number {
        return this.workforce.reduce((sum, allocation) => {
            return sum + allocation.worker.costPerMs * allocation.amount
        }, 0)
    }

    calculateCostPerMsBuildingRoi(): number {
        return this.buildingCosts.reduce((sum, buildingIngrdient) => {
            const material = Materials.getCheapestRecipeByOutput(buildingIngrdient.ticker, Iteration.PREVIOUS)
            return sum + material.price * buildingIngrdient.amount / (baseRoiDays * 86_400_000)
        }, 0)
        * (this.ticker !== "CM" ? (1 + 1 / 160 * baseRoiDays) : 1)
        + (this.ticker !== "CM" ? Buildings.getBuildingByTicker("CM").costPerMs * this.area / 475 : 0)
    }


    extractBuildingCosts(data: BuildingData): MaterialAmount[] {
        return data.BuildingCosts.map(it => ({
            ticker: it.CommodityTicker,
            amount: it.Amount
        }))
    }

    extractWorkforce(data: BuildingData): WorkerAllocation[] {
        const workerTypes = ["Pioneers", "Settlers", "Technicians", "Engineers", "Scientists"]

        return workerTypes.reduce((acc: WorkerAllocation[], type: string) => {
            const worker = Workers.getWorkerOfType(type)

            if (!(type in data)) {
                throw new Error(`Type ${type} is not present in data`);
            }
            const amount = (data as any)[type]

            if(amount < 1) {
                return acc
            }

            if (!worker) {
                throw new Error(`Worker of type ${type} does not exist`)
            }

            if (amount === undefined || amount === null) {
                throw new Error(`Data for ${type} is missing or invalid`)
            }

            acc.push({worker, amount})
            return acc
        }, [])
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
        if (!ticker || !this.current[ticker]) {
            throw new Error(`Unknown building ${ticker}`)
        }
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