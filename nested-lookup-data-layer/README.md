# Nested Lookup Data Layer  -  O(1) Country × Year Access for Real-Time Choropleth Rendering

> **Origin:** Selected code from shipped production software

## Problem

A D3 choropleth map needs to color 200+ countries based on climate sentiment data for a selected year and metric (sentiment, denial rate, aggressiveness). On every year slider change or metric toggle, every country path needs its fill color recalculated. If the data access pattern involves filtering or searching, the map stutters.

## Solution

A two-level nested `Record` structure  -  `Record<country, Record<year, YearData>>`  -  that gives O(1) access to any data point via `countryData[countryName][selectedYear]`. No filtering, no iteration, no searching. The D3 color update just does a direct property lookup per country path.

### The Data Shape

```typescript
interface YearData {
  total_count: number;
  sentiment: number;
  believer: number;
  neutral: number;
  denial: number;
  aggressive: number;
  sentiment_std: number | null;
  beliver_v_denier: number | null;
  aggressive_rate_believer: number | null;
  aggressive_rate_denier: number | null;
}

interface DataStructure {
  [country: string]: {
    [year: number]: YearData;
  };
}
```

### How It's Consumed

The D3 map update iterates every `<path>` element and does a two-key lookup:

```typescript
// O(1) per country  -  no filter, no find, no iteration over years
const yearData = countryData[countryName]?.[selectedYear];
const metricValue = yearData ? yearData[selectedMetric] : null;
return metricValue !== null ? colorScale(metricValue) : "#ccc";
```

The card component computes country averages by iterating only that country's year entries  -  `Object.keys(country)` is bounded by the number of years (≤14), not the number of countries.

## Key Design Decisions

- **Nested Record over flat array**  -  a flat `{ country, year, sentiment, ... }[]` would require `.filter()` on every render. The nested structure trades memory (duplicate keys) for O(1) access on the hot path.
- **Country name as key, not ID**  -  the GeoJSON features use `d.properties.name` as the country identifier, so the data structure uses the same key. No mapping table needed between the map and the data.
- **Sparse years**  -  not every country has data for every year. Missing years return `undefined` from the lookup, which the map handles by falling back to `#ccc`. No need to pad missing years with zeros.
- **Pre-computed world averages**  -  `worldDataAverage` is a separate flat object, not computed at render time. The card component compares country averages against this constant without re-aggregating the full dataset.

## Concepts Demonstrated

- Nested Record structure for O(1) two-dimensional lookup
- D3 choropleth rendering with data-driven color scales
- Sparse data handling (missing country-year pairs)
- Pre-computed aggregates to avoid render-time computation
- Context-driven state (year, metric) flowing into D3 updates