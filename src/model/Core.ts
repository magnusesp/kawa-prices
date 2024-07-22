export enum Iteration {
    CURRENT = "CURRENT",
    PREVIOUS = "PREVIOUS",
    LOOKUP = "LOOKUP"
}

export class Core {
    static paths: {[index: string]: string[]} = {
        [Iteration.CURRENT]: [],
        [Iteration.PREVIOUS]: [],
        [Iteration.LOOKUP]: []
    }

    static lastPush: string = ""
    
    static tickerAlreadyInPath(ticker: string, iteration: Iteration): boolean {
        return this.paths[iteration].includes(ticker) 
    }
    
    static pushPath(ticker: string, iteration: Iteration, additionalInfo: string = "") {
        if(iteration !== Iteration.LOOKUP && this.tickerAlreadyInPath(ticker, iteration)) {
            throw new Error(`Circular reference at ${ticker} (${iteration}) (${additionalInfo}) Path: ${Core.returnPathAsString()}`)
        }

        this.lastPush = ticker
        this.paths[iteration].push(ticker)
    }
    
    static popPath(ticker: string, iteration: Iteration) {
        if(this.paths[iteration][this.paths[iteration].length - 1] !== ticker) {
            throw new Error(`Poping wrong ticker ${ticker} ${iteration} from ${this.returnPathAsString()}`)
        }
        
        this.paths[iteration].pop()
    }
    
    static returnPathAsString(includeLookup: boolean = true): string {
        return `Cur: ${this.paths[Iteration.CURRENT].join(", ")} Prev: ${this.paths[Iteration.PREVIOUS].join(", ")} Lookup: ${includeLookup ? this.paths[Iteration.LOOKUP].join(", ") : ""} Last: ${this.lastPush}`
    }
}

