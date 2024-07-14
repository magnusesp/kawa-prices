import yargs from "yargs"
import {Buildings} from "./model/Building"
import {fetchBuildings, fetchCachedBuildings,
    fetchCachedNaturalResources, fetchCachedRecipes, fetchCachedWorkers, fetchRecipes} from "./fetchData";
import {Material, Materials} from './model/Material';
import {Workers} from "./model/Worker";

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
        "DW":createOverrideMaterial("DW", 25),
        "OVE":createOverrideMaterial("OVE", 40),
        "RAT":createOverrideMaterial("RAT", 40),
    }

    Workers.importWorkers(fetchCachedWorkers())
    Buildings.importBuildings(true ? await fetchBuildings() : fetchCachedBuildings())
    Materials.importRecipes(fetchCachedNaturalResources())
    Materials.importRecipes(true ? await fetchRecipes() : fetchCachedRecipes(), priceOverride)

    const grn = Materials.getCheapestRecipeByOutput("GRN")
    console.log(`GRN costs `, grn)
}

function createOverrideMaterial(ticker: string, price: number) {
    const overrideMaterial = new Material({
        BuildingTicker: "OVERRIDE",
        RecipeName : "OVERRIDE",
        StandardRecipeName:  "OVERRIDE",
            Inputs: [],
            Outputs: [{
                Ticker: ticker,
                Amount: 1
            }],
            TimeMs: 1,
        })

    return overrideMaterial.cloneWithPrice(price)
}

main()
