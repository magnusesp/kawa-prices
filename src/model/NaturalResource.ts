import {BaseMaterial} from "./BaseMaterial";
import {Planet} from "./Planet";

export class NaturalResources extends BaseMaterial {
    planet: Planet
    constructor(data: NaturalResourceData, planet: Planet) {
       super(data.BuildingTicker, ticker, data.TimeMs, planet.name)
       
       this.planet = planet
    }
}

export type NaturalResourceData = {
    
}