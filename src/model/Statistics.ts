import { Iteration } from "./Core";
import {Materials} from "./Materials";

export class Statistics {

    static compare(): number[] {
        const [prices1, prices2] = this.preparePrices()
        console.log(`Comparing ${prices1.length} prices`)

        const avgDiff = this.calculateDiff(prices1, prices2)

        return avgDiff
    }
    static calculateCorrelation(prices1: number[], prices2: number[]): number {
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

    static calculateDiff(prices1: number[], prices2: number[]): number[] {
        let min = Infinity
        let max = 0

        const avg = prices1.reduce((sum, cur, idx) =>{
            const diff = Math.abs(cur - prices2[idx]) / cur * 100
            min = Math.min(diff, min)
            max = Math.max(diff, max)

            return sum + diff
        }, 0) / prices1.length

        console.log(`AVG: ${avg.toFixed(2)}% MIN: ${min.toFixed(2)}% MAX: ${max.toFixed(2)}%`)
        return [avg, min, max]
    }

    static preparePrices(): number[][] {
          const prices1: number[] = []
          const prices2: number[] = []
          
          Materials.getAllTickers().forEach(ticker => {
              prices1.push(Materials.getCheapestRecipeByOutput(ticker, Iteration.PREVIOUS).price)
              prices2.push(Materials.getCheapestRecipeByOutput(ticker, Iteration.CURRENT).price)
          })
          
          return [prices1, prices2]
      }
}