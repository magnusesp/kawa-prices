export class Planet {
    name: string
    
    constructor(data: PlanetData) {
        this.name = data.PlanetName
    }
}

export class Planets {
    static importPlanets(planets: PlanetData[]) {
        
    }
}


export type Resource = {
    MaterialId: string;
    ResourceType: string;
    Factor: number;
};

export type BuildRequirement = {
    MaterialName: string;
    MaterialId: string;
    MaterialTicker: string;
    MaterialCategory: string;
    MaterialAmount: number;
    MaterialWeight: number;
    MaterialVolume: number;
};

export type ProductionFee = {
    Category: string;
    WorkforceLevel: string;
    FeeAmount: number;
    FeeCurrency: string;
};

export type PlanetData = {
    Resources: Resource[];
    BuildRequirements: BuildRequirement[];
    ProductionFees: ProductionFee[];
    COGCPrograms: any[]; // Adjust based on actual structure if available
    COGCVotes: any[]; // Adjust based on actual structure if available
    COGCUpkeep: any[]; // Adjust based on actual structure if available
    PlanetId: string;
    PlanetNaturalId: string;
    PlanetName: string;
    Namer: string | null;
    NamingDataEpochMs: number;
    Nameable: boolean;
    SystemId: string;
    Gravity: number;
    MagneticField: number;
    Mass: number;
    MassEarth: number;
    OrbitSemiMajorAxis: number;
    OrbitEccentricity: number;
    OrbitInclination: number;
    OrbitRightAscension: number;
    OrbitPeriapsis: number;
    OrbitIndex: number;
    Pressure: number;
    Radiation: number;
    Radius: number;
    Sunlight: number;
    Surface: boolean;
    Temperature: number;
    Fertility: number;
    HasLocalMarket: boolean;
    HasChamberOfCommerce: boolean;
    HasWarehouse: boolean;
    HasAdministrationCenter: boolean;
    HasShipyard: boolean;
    FactionCode: string | null;
    FactionName: string | null;
    GoverningEntity: string | null;
    CurrencyName: string | null;
    CurrencyCode: string | null;
    BaseLocalMarketFee: number;
    LocalMarketFeeFactor: number;
    WarehouseFee: number;
    EstablishmentFee: number | null;
    PopulationId: string;
    COGCProgramStatus: string | null;
    PlanetTier: number;
    UserNameSubmitted: string;
    Timestamp: string;
};