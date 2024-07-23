# KAWA Price calculator

## Setup
1. Install the dependencies:
   ```sh
   npm install
2. Run the calculator, fetching data:
   ```sh
   ts-node src/index.ts --fetchData
3. Run the calculator with cached data:
   ```sh
   ts-node src/index.ts


## TODO
* Initial prices
   * Setting DW, OVE, RAT prices at start ✅
   * Using a percentage of CX prices (30-40% discount)
* Workers
   * Basic consumables ✅
   * Luxury consumables ✅
   * Housing costs (HB1/HB2/...) ✅
* Buildings
   * Construction costs ✅
   * Worker costs ✅
   * Consider repair costs ✅
     * (50% every 80 days => construction cost / 160 * ROI days)
   * CM cost (area used / 475) ✅
   * ROI of 25 days ✅
* Materials
   * Price of Material inputs ✅
   * Price of Natural resources inputs 🟡
   * Multiple outputs: divide cost equally per unit produced ✅
   * Building costs (divided by ms per unit) ✅
   * CoGC
   * Production fees
* Natural resources
   * Same as Materials, plus:
      * Optimal planet
      * Optimal planet w/ range of planet X
      * Shipping costs
* Planets
   * Prices per planet
   * Shipping costs (fixed prices per jump/intra system travel)
   * Shipping costs (dynamic)




- ✅ implemented/completed
- 🟡 started/in progress
- ❌ not started