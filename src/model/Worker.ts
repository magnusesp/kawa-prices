import {Recipes} from "./Recipe";

export type DailyConsumption = {
    ticker: string
    amount: number
}

export class Worker {
    workerCategory: string
    consumables: DailyConsumption[]

    private _costPerDay = 0

    constructor(data: WorkerData) {
        this.workerCategory = data.workerCategory
        this.consumables = this.extractConsumables(data)
    }

    get costPerDay(): number {
        if (!this._costPerDay) {
            this._costPerDay = this.calculateCostPerDay()
        }

        return this._costPerDay
    }

    calculateCostPerDay(): number {
        return this.consumables.reduce((sum, consume) => {
            const consumable = Recipes.getCheapestRecipeByOutput(consume.ticker)
            return sum + consumable.price * consume.amount
        }, 0)
    }
    
    extractConsumables(data: WorkerData): DailyConsumption[] {
        return Object.entries(data.consumables).map(([ticker, amount]) => ({
            ticker,
            amount: Number(amount)
        }))
    }
}

export class Workers {
    static getWorkerOfType(category: string): Worker {

    }
}

export type WorkerData = {
    workerCategory: string,
    consumables: {
        [index: string]: number
    }
}
