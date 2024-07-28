import yargs from "yargs"
import {Buildings} from "./model/Building"
import {
    loadBuildings,
    loadMaterials,
    loadPlanets,
    loadRecipes,
    loadWorkers
} from "./fetchData";
import {Workers} from "./model/Worker";
import {Statistics} from "./model/Statistics";
import {Planets} from "./model/Planet";
import {Materials} from "./model/Materials";

interface Argv {
    fetchBuildings: boolean;
    fetchMaterials: boolean;
    fetchPlanets: boolean;
    fetchRecipes: boolean;
  }

const argv = yargs.options({
    fetchBuildings: { type: 'boolean', demandOption: false, default: false, describe: 'Flag to fetch building data' },
    fetchMaterials: { type: 'boolean', demandOption: false, default: false, describe: 'Flag to fetch material data' },
    fetchPlanets: { type: 'boolean', demandOption: false, default: false, describe: 'Flag to fetch planet data' },
    fetchRecipes: { type: 'boolean', demandOption: false, default: false, describe: 'Flag to fetch recipe data' },
}).argv as Argv

async function main() {
    const priceOverride = {
        "DW": 66.7,
        "OVE": 106.7,
        "RAT": 106.7,
    }

    Workers.importWorkers(loadWorkers())
    Buildings.importBuildings(await loadBuildings(argv.fetchBuildings))
    Materials.importMaterials(await loadMaterials(argv.fetchMaterials))
    Planets.importPlanets(await loadPlanets(argv.fetchPlanets))
    Materials.importRecipes(await loadRecipes(argv.fetchRecipes), priceOverride)
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
//        printPrices([...Object.keys(priceOverride), "C"])
    } while(counter < 20 && avgDiff > 1)

    printPrices(Materials.getAllTickers())
//    printPrices([...Object.keys(priceOverride), "C"])
}

function printPrices(tickers: string[]) {
    tickers.forEach(ticker => {
        const recipe = Materials.getCheapestRecipeByOutput(ticker)
        console.log(`${ticker},${recipe.price.toFixed(2)},${recipe.sourceName}`)
    })
}

main()
