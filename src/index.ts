import yargs from "yargs"
import {Buildings} from "./model/Building"
import {
    fetchBuildings, fetchCachedBuildings,
    fetchCachedNaturalResources, fetchCachedPlanets, fetchCachedRecipes, fetchCachedWorkers, fetchPlanets, fetchRecipes
} from "./fetchData";
import {Material, Materials} from './model/Material';
import {Workers} from "./model/Worker";
import {Statistics} from "./model/Statistics";
import {Planets} from "./model/Planet";

interface Argv {
    fetchData: boolean;
  }

const argv = yargs.options({
    fetchData: { type: 'boolean', demandOption: false, default: false, describe: 'Flag to fetch data' }
}).argv as Argv

async function main() {
    const priceOverride = {
        "DW": 25,
        "OVE": 40,
        "RAT": 40,
    }

    Planets.importPlanets(argv.fetchData ? await fetchPlanets() : fetchCachedPlanets())
    Workers.importWorkers(fetchCachedWorkers())
    Buildings.importBuildings(argv.fetchData ? await fetchBuildings() : fetchCachedBuildings())
    Materials.importRecipes(fetchCachedNaturalResources())
    Materials.importRecipes(argv.fetchData ? await fetchRecipes() : fetchCachedRecipes(), priceOverride)
    const calcThese = Materials.allTickers

    calcThese.forEach(ticker => {
        Materials.getCheapestRecipeByOutput(ticker)
    })

    const startStamp = Date.now()
    let counter = 0
    let correlation = 0

    do {
        Buildings.prepareNextIteration()
        Materials.prepareNextIteration()
        Workers.prepareNextIteration()

        correlation = Statistics.calculateCorrelation()
        counter++

        const elapsedTimeMs = Date.now() - startStamp
        console.log(`Correlation is ${correlation.toFixed(6)} after ${counter} rounds. (${(elapsedTimeMs / counter).toFixed(0)} ms / round)`)

    } while(counter < 20 && correlation < 0.99)
//
//    Materials.allTickers.forEach(ticker => {
//        console.log(`${ticker}\t${Materials.getCheapestRecipeByOutput(ticker).price.toFixed(2)}`)
//    })
}

main()
