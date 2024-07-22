import { printNewPrices } from "../config";
import { Buildings } from "./Building";
import { Core, Iteration } from "./Core";
import {Materials} from "./Material";

export type DailyConsumption = {
    ticker: string
    amount: number
}


const habitatMap: {[index: string]: string} = {
    "Pioneers": "HB1",
    "Settlers": "HB2",
    "Technicians": "HB3",
    "Engineers": "HB4",
    "Scientists": "HB5",
}

export class Worker {
    workerCategory: string
    habitationTicker: string
    consumables: DailyConsumption[]

    private _costPerMs = -1

    constructor(data: WorkerData) {
        this.workerCategory = data.workerCategory
        this.habitationTicker = habitatMap[data.workerCategory]
        this.consumables = this.extractConsumables(data)
    }

    get costPerMs(): number {
        Core.pushPath(this.workerCategory, Iteration.LOOKUP, `${this._costPerMs}`)

        if (this._costPerMs < 0) {
            this._costPerMs = this.calculateCostPerMs()
        }

        return this._costPerMs
    }

    calculateCostPerMs(): number {
        Core.pushPath(this.workerCategory, Iteration.PREVIOUS)

        const cost = this.calculateCostPerMsConsumables() + this.calculateCostPerMsHabitation()

        if (printNewPrices) console.log(`Worker\t\t${this.workerCategory}\t${cost * 86_400_000}\t(per day)`)

        Core.popPath(this.workerCategory, Iteration.PREVIOUS)

        return cost
    }

    calculateCostPerMsConsumables(): number {
        const cost = this.consumables.reduce((sum, consume) => {
            const consumable = Materials.getCheapestRecipeByOutput(consume.ticker, Iteration.PREVIOUS)
            return sum + consumable.price * consume.amount
        }, 0) / 86_400_000

        return cost
    }

    calculateCostPerMsHabitation() : number {
        return Buildings.getBuildingByTicker(this.habitationTicker).costPerMs / 100
    }

    extractConsumables(data: WorkerData): DailyConsumption[] {
        return Object.entries(data.consumables).map(([ticker, amount]) => ({
            ticker,
            amount: Number(amount) / 100 // File content is per 100 workforce
        }))
    }

    cloneWithCost(_costPerDay: number): Worker {
        return Object.assign(
            Object.create(Object.getPrototypeOf(this)),
            {
                ...this,
                _costPerDay
            })
    }
}

export class Workers {
    static current: WorkersMap = {}

    static getWorkerOfType(category: string): Worker {
        return this.current[category]
    }

    static importWorkers(data: WorkerData[]) {
        data
            .map(workerData => new Worker(workerData))
            .forEach(worker => {
                this.current[worker.workerCategory] = worker
            })
    }

    static prepareNextIteration() {
        this.current = Object.entries(this.current)
            .reduce((acc, [ticker, worker]) => {
                acc[ticker] = worker.cloneWithCost(-1)
                return acc
            }, {} as WorkersMap)
    }
}

export type WorkerData = {
    workerCategory: string,
    consumables: {
        [index: string]: number
    }
}

type WorkersMap = {
    [index: string]: Worker
}