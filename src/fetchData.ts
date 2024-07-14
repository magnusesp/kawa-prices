import {
    buildingCacheFile,
    buildingsUrl,
    naturalResourcesCacheFile,
    recipesCacheFile,
    recipesUrl,
    workersCacheFile
} from './config'
import {BuildingData} from "./model/Building";
import * as fs from "node:fs";
import {RecipeData} from "./model/Material";
import {WorkerData} from "./model/Worker";

export async function fetchBuildings(): Promise<BuildingData[]> {
  return fetchAndCache(buildingsUrl, buildingCacheFile)
}

export function fetchCachedBuildings(): BuildingData[] {
  return JSON.parse(fs.readFileSync(buildingCacheFile).toString())
}

export async function fetchRecipes(): Promise<RecipeData[]> {
  return fetchAndCache(recipesUrl, recipesCacheFile)
}

export function fetchCachedRecipes(): RecipeData[] {
  return JSON.parse(fs.readFileSync(recipesCacheFile).toString())
}

export function fetchCachedNaturalResources(): RecipeData[] {
  const buildingTime:{[index: string]: number} = {
    COL: 21600000,
    EXT: 21600000,
    RIG: 17280000,
  }

  const naturalResources = {
    HEX: "RIG",
    LES: "RIG",
    BTS: "RIG",
    H2O: "RIG",

    AMM: "COL",
    AR: "COL",
    F: "COL",
    HE: "COL",
    HE3: "COL",
    H: "COL",
    NE: "COL",
    N: "COL",
    O: "COL",

    ALO: "EXT",
    CUO: "EXT",
    AUO: "EXT",
    FEO: "EXT",
    LIO: "EXT",
    SIO: "EXT",
    TIO: "EXT",

    BER: "EXT",
    BRM: "EXT",
    BOR: "EXT",
    CLI: "EXT",
    GAL: "EXT",
    HAL: "EXT",
    LST: "EXT",
    MGS: "EXT",
    MAG: "EXT",
    SCR: "EXT",
    TAI: "EXT",
    TCO: "EXT",
    TS: "EXT",
    ZIR: "EXT",
  }



  return Object.entries(naturalResources).map(([res, building]) => ( {
        "BuildingTicker": building,
        "RecipeName": building,
        "StandardRecipeName": "COL:=>",
        "Inputs": [],
        "Outputs": [
            {
                "Ticker": res,
                "Amount": 10
            }
        ],
        "TimeMs": buildingTime[building]
    }))
}
export function fetchCachedWorkers(): WorkerData[] {
  return JSON.parse(fs.readFileSync(workersCacheFile).toString())
}


async function fetchAndCache(url: string, filePath: string): Promise<any[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json()
  fs.writeFileSync(filePath, JSON.stringify(data))
  return data
}