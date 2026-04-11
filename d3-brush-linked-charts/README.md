# D3 Brush-Linked Charts  -  Interactive Time Selection Driving a Filtered Line Chart

> **Origin:** Selected code from shipped production software

## Problem

Users need to explore climate data across 14 years, but a single chart can't show both the overview and the detail. They need to brush (drag-select) a time range on one chart and see a second chart zoom into that range in real time.

## Solution

Two class-based React components sharing state via props:

- **BarChart**  -  grouped bars (sentiment, denial, aggressiveness) per year with a D3 brush overlay. Brushing selects years and passes them up via `updateRange()`.
- **LinkedChart**  -  a multi-line chart that filters its data to only the brushed years. When the brush changes, the line chart re-derives its scales and paths from the filtered subset.

### The Brush → Filter → Redraw Flow

1. User drags on the BarChart → `brushEnd` fires
2. `brushEnd` maps pixel coordinates to bar positions → extracts selected years
3. Parent receives years via `updateRange(selectedYears)`
4. Parent passes years as `range` prop to LinkedChart
5. LinkedChart's `getDerivedStateFromProps` filters `data.World` to only matching years
6. New scales and line paths are computed from the filtered subset
7. Axes re-render via `componentDidUpdate`

## What Makes This Interesting

- **`getDerivedStateFromProps` for D3**  -  both charts use this lifecycle method to derive D3 scales and shapes from props. No `useEffect` timing issues  -  the scales are always in sync with the data.
- **Pixel-to-data coordinate mapping**  -  the brush returns pixel coordinates `[x0, x1]`. The BarChart maps these back to data by filtering bars whose x position falls within the selection. This is the inverse of the scale function.
- **Minimum brush size enforcement**  -  if the user makes a tiny brush, it's snapped to a minimum width to prevent degenerate selections.
- **Shared color semantics**  -  both charts use the same color mapping (red = sentiment, orange = denial, blue = aggressive) so the visual connection is immediate.

## Files

- `BarChart.js`  -  grouped bar chart with D3 brush overlay
- `LinkedChart.js`  -  multi-line chart filtered by brush selection