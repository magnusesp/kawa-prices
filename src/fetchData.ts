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
  return JSON.parse(fs.readFileSync(naturalResourcesCacheFile).toString())
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