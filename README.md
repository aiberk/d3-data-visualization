# D3 Data Visualization

> **Origin:** Selected code from shipped production software

![D3.js](https://img.shields.io/badge/D3.js-F9A03C?style=flat&logo=d3dotjs&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)

Selected code from a D3-powered choropleth visualization of global climate sentiment data across 200+ countries and 14 years. Features a nested Record data layer for O(1) lookups and brush-linked time-series charts.

## Tech Stack

Next.js, TypeScript, D3.js, React Context, GeoJSON

## What's Inside

| Folder                                                 | What It Shows                                                                   |
| :----------------------------------------------------- | :------------------------------------------------------------------------------ |
| [nested-lookup-data-layer](./nested-lookup-data-layer) | O(1) country × year access via nested Record for real-time choropleth rendering |
| [d3-brush-linked-charts](./d3-brush-linked-charts)     | Interactive brush on a bar chart driving a filtered line chart in real time     |

Each folder has its own README with problem, solution, and design decisions.