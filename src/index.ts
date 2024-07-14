import yargs from "yargs"
import {Buildings} from "./model/Building"
import {fetchBuildings, fetchCachedBuildings,
    fetchCachedNaturalResources, fetchCachedRecipes, fetchCachedWorkers, fetchRecipes} from "./fetchData";
import {Material, Materials} from './model/Material';
import {Workers} from "./model/Worker";
import {Statistics} from "./model/Statistics";

const argv = yargs
  .option('refetch', {
    alias: 'r',
    description: 'Refetch data',
    type: 'boolean',
  })
  .help()
  .alias('help', 'h')
  .argv

async function main() {
    const priceOverride = {
        "DW": 25,
        "OVE": 40,
        "RAT": 40,
    }

    Workers.importWorkers(fetchCachedWorkers())
    Buildings.importBuildings(false ? await fetchBuildings() : fetchCachedBuildings())
    Materials.importRecipes(fetchCachedNaturalResources())
    Materials.importRecipes(false ? await fetchRecipes() : fetchCachedRecipes(), priceOverride)

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

    Materials.allTickers.forEach(ticker => {
        console.log(`${ticker}\t${Materials.getCheapestRecipeByOutput(ticker).price.toFixed(2)}`)
    })
}

main()
