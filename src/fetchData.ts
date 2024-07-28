import {
    buildingCacheFile,
    buildingsUrl, materialsCacheFile,
    materialsUrl,
    naturalResourcesCacheFile,
    planetCacheFile,
    planetsUrl,
    recipesCacheFile,
    recipesUrl,
    workersCacheFile
} from './config'
import {BuildingData} from "./model/Building";
import * as fs from "node:fs";
import {WorkerData} from "./model/Worker";
import { PlanetData } from './model/Planet';
import { MaterialRecipeData } from './model/Material';
import { MaterialData } from './model/Materials';

export async function loadBuildings(reFetch: boolean): Promise<BuildingData[]> {
  return reFetch
    ? fetchAndCache(buildingsUrl, buildingCacheFile)
    : JSON.parse(fs.readFileSync(buildingCacheFile).toString())
}

export async function loadMaterials(reFetch: boolean): Promise<MaterialData[]> {
  return reFetch
   ? fetchAndCache(materialsUrl, materialsCacheFile)
   :JSON.parse(fs.readFileSync(materialsCacheFile).toString())
}

export async function loadPlanets(reFetch: boolean): Promise<PlanetData[]> {
  return reFetch
    ? fetchAndCache(planetsUrl, planetCacheFile)
    : JSON.parse(fs.readFileSync(planetCacheFile).toString())
}

export async function loadRecipes(reFetch: boolean): Promise<MaterialRecipeData[]> {
  return reFetch
    ? fetchAndCache(recipesUrl, recipesCacheFile)
    : JSON.parse(fs.readFileSync(recipesCacheFile).toString())
}

export function loadWorkers(): WorkerData[] {
  return JSON.parse(fs.readFileSync(workersCacheFile).toString())
}

async function fetchAndCache(url: string, filePath: string): Promise<any[]> {
  console.log(`Fetching ${url}`)
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json()
  fs.writeFileSync(filePath, JSON.stringify(data))
  return data
}