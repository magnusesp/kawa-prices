import { printNewPrices } from "../config";
import {Iteration, Materials} from "./Material";

export type DailyConsumption = {
    ticker: string
    amount: number
}

export class Worker {
    workerCategory: string
    consumables: DailyConsumption[]

    private _costPerDay = -1

    constructor(data: WorkerData) {
        this.workerCategory = data.workerCategory
        this.consumables = this.extractConsumables(data)
    }

    get costPerDay(): number {
        if (this._costPerDay < 0) {
            this._costPerDay = this.calculateCostPerDay()
        }

        return this._costPerDay
    }

    calculateCostPerDay(): number {
        const cost = this.consumables.reduce((sum, consume) => {
            const consumable = Materials.getCheapestRecipeByOutput(consume.ticker, Iteration.PREVIOUS)
            return sum + consumable.price * consume.amount
        }, 0)

        if (printNewPrices) console.log(`Worker\t\t${this.workerCategory}\t${cost}\t(per day)`)

        return cost
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