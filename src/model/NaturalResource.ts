import {BaseMaterial} from "./BaseMaterial";
import {Planet} from "./Planet";
import {Buildings} from "./Building";

export class NaturalResource extends BaseMaterial {
    rawConcentration: number
    constructor(ticker: string, planetName: string, rawConcentration: number) {
        const buildingTicker = getBuilding(ticker)
        const timeMs = getTimeMs(buildingTicker)

        super(buildingTicker, ticker, timeMs, planetName)

        this.rawConcentration = rawConcentration
    }

    calculatePrice(): number {
        const dailyExtraction = (this.rawConcentration * 100) * getBuildingExtractionFactor(this.buildingTicker)

        return Buildings.getBuildingByTicker(this.buildingTicker).costPerMs * 86_400_000 / dailyExtraction
    }
}

export type NaturalResourceData = {
    
}

function getBuilding(materialTicker: string): string {
    if(!naturalResourceToBuildingMap[materialTicker]) {
        throw new Error(`Unknown building for material ${materialTicker}`)
    }
    return naturalResourceToBuildingMap[materialTicker]
}

const naturalResourceToBuildingMap: {[index: string]: string} = {
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

function getTimeMs(buildingTicker: string): number {
    if(!buildingToDurationMsMap[buildingTicker]) {
        throw new Error(`Unknown duration for building ${buildingTicker}`)
    }

    return buildingToDurationMsMap[buildingTicker]
}
const buildingToDurationMsMap: {[index: string]: number} = {
    COL: 21600000,
    EXT: 43200000,
    RIG: 17280000

}

function getBuildingExtractionFactor(buildingTicker: string): number {
    if(!buildingToExtractionFactor[buildingTicker]) {
        throw new Error(`Unknown extraction factor for building ${buildingTicker}`)
    }

    return buildingToExtractionFactor[buildingTicker]
}
const buildingToExtractionFactor: {[index: string]: number} = {
    COL: 0.6,
    EXT: 0.7,
    RIG: 0.7
}