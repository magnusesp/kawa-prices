import yargs from "yargs"
import {Buildings} from "./model/Building"
import {
    fetchBuildings, fetchCachedBuildings,
    fetchCachedNaturalResources, fetchCachedPlanets, fetchCachedRecipes, fetchCachedWorkers, fetchPlanets, fetchRecipes
} from "./fetchData";
import {Workers} from "./model/Worker";
import {Statistics} from "./model/Statistics";
import {Planets} from "./model/Planet";
import {Materials} from "./model/Materials";

interface Argv {
    fetchData: boolean;
  }

const argv = yargs.options({
    fetchData: { type: 'boolean', demandOption: false, default: false, describe: 'Flag to fetch data' }
}).argv as Argv

async function main() {
    const priceOverride = {
        "DW": 66.7,
        "OVE": 106.7,
        "RAT": 106.7,
    }

    Planets.importPlanets(argv.fetchData ? await fetchPlanets() : fetchCachedPlanets())
    Workers.importWorkers(fetchCachedWorkers())
    Buildings.importBuildings(argv.fetchData ? await fetchBuildings() : fetchCachedBuildings())
    Materials.importMaterials(fetchCachedNaturalResources(), [])
    Materials.importMaterials(argv.fetchData ? await fetchRecipes() : fetchCachedRecipes(), [], priceOverride)
    const calcThese = Materials.getAllTickers()

    calcThese.forEach(ticker => {
        Materials.getCheapestRecipeByOutput(ticker)
    })

    const startStamp = Date.now()
    let counter = 1
    let avgDiff = Infinity

    printPrices(Object.keys(priceOverride))
    do {
        Buildings.prepareNextIteration()
        Materials.prepareNextIteration()
        Workers.prepareNextIteration()

        avgDiff = Statistics.compare()
        counter++

        const elapsedTimeMs = Date.now() - startStamp
        console.log(`Avg Diff is ${avgDiff.toFixed(6)} after ${counter} rounds. (${(elapsedTimeMs / counter).toFixed(0)} ms / round)`)
        printPrices([...Object.keys(priceOverride), "C"])
    } while(counter < 20 && avgDiff > 1)

//    Materials.allTickers.forEach(ticker => {
//        console.log(`${ticker}\t${Materials.getCheapestRecipeByOutput(ticker).price.toFixed(2)}`)
//    })
}

function printPrices(tickers: string[]) {
    tickers.forEach(ticker => {
        const recipe = Materials.getCheapestRecipeByOutput(ticker)
        console.log(`${ticker}\t${recipe.price.toFixed(2)}\t${recipe.sourceName}`)
    })
}

main()
