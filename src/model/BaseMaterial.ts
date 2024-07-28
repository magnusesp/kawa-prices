import {Core, Iteration } from "./Core"


export abstract class BaseMaterial {
    buildingTicker: string
    sourceName: string
    ticker: string
    timeMs: number
    
    private  _price: number = -1
    
    constructor(buildingTicker: string, ticker: string, timeMs: number, sourceName: string) {
        this.buildingTicker = buildingTicker
        this.ticker = ticker
        this.timeMs = timeMs
        this.sourceName = sourceName
    }
    
    get price(): number {
        Core.pushPath(this.ticker + this.sourceName, Iteration.LOOKUP, `${this._price}`)

        if (this._price < 0) {
            try {
                this._price = this.calculatePrice()
            } catch (e: any) {
                if (/Circular reference at/.test(e)) {
                    console.error(`Got circular reference for ${this.ticker}, skipping with Infinity`, e)
                    return Infinity
                }
            }
        }
        return this._price
    }
    
    abstract calculatePrice(): number
    
    cloneWithPrice(_price: number): BaseMaterial {
        return Object.assign(
            Object.create(Object.getPrototypeOf(this)),
            {
                ...this,
                _price
            })
    }
}
