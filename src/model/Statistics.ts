import {Iteration, Materials} from "./Material";

export class Statistics {
    static calculateCorrelation(): number {
        const [prices1, prices2] = this.preparePrices()
        
        console.log(`Comparing ${prices1.length} prices`)
        
        const n = prices1.length
        const sum1 = prices1.reduce((a, b) => a + b, 0)
        const sum2 = prices2.reduce((a, b) => a + b, 0)
      
        const sum1Sq = prices1.reduce((a, b) => a + b * b, 0)
        const sum2Sq = prices2.reduce((a, b) => a + b * b, 0)
      
        const pSum = prices1.reduce((sum, val, i) => sum + val * prices2[i], 0)
      
        const numerator = pSum - (sum1 * sum2 / n)
        const denominator = Math.sqrt((sum1Sq - Math.pow(sum1, 2) / n) * (sum2Sq - Math.pow(sum2, 2) / n))
      
        if (denominator === 0) return 0
      
        return numerator / denominator
      }

      static preparePrices(): number[][] {
          const prices1: number[] = []
          const prices2: number[] = []
          
          Materials.allTickers.forEach(ticker => {
              prices1.push(Materials.getCheapestRecipeByOutput(ticker, Iteration.PREVIOUS).price)
              prices2.push(Materials.getCheapestRecipeByOutput(ticker, Iteration.CURRENT).price)
          })
          
          return [prices1, prices2]
      }
}