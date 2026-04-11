/**
 * D3 choropleth map that colors 200+ countries using the nested lookup structure.
 * On every year/metric change, updateColors() iterates all <path> elements
 * and does a two-key O(1) lookup per country — no filtering, no searching.
 */

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useSelection } from "@/app/context/store";
import { countryData } from "@/app/data/realData";

const VisMap = () => {
  const { selectedYear, selectedSelection } = useSelection();
  const mapContainerRef = useRef(null);

  // Different color scales per metric
  const colorScales: Record<string, d3.ScaleLinear<string, string>> = {
    Sentiment: d3
      .scaleLinear<string>()
      .domain([0, 1])
      .range(["#b3cde3", "#011f4b"]),
    "Denial Rate": d3
      .scaleLinear<string>()
      .domain([0, 1])
      .range(["#ffffcc", "#800026"]),
    Aggressiveness: d3
      .scaleLinear<string>()
      .domain([0, 1])
      .range(["#ffd2a0", "#662200"]),
  };

  /**
   * The hot path — runs on every year slider change or metric toggle.
   * For each of 200+ country paths, does:
   *   countryData[countryName]  → O(1) object property lookup
   *   [selectedYear]            → O(1) numeric property lookup
   *   .sentiment / .denial / .aggressive → O(1) property access
   *
   * Total: O(n) where n = number of countries, with O(1) per country.
   * No .filter(), no .find(), no .reduce().
   */
  const updateColors = () => {
    const scale = colorScales[selectedSelection] || colorScales["Denial Rate"];

    d3.select(mapContainerRef.current)
      .selectAll("path")
      .transition()
      .duration(500)
      .attr("fill", (d: any) => {
        const countryName = d.properties.name;

        // Two-key O(1) lookup — the whole point of the nested structure
        const yearData = countryData[countryName]?.[selectedYear];

        if (!yearData) return "#ccc"; // Sparse: no data for this country-year

        const metricMap: Record<string, number> = {
          Sentiment: yearData.sentiment,
          "Denial Rate": yearData.denial,
          Aggressiveness: yearData.aggressive,
        };

        return scale(metricMap[selectedSelection] ?? 0);
      });
  };

  // Build the map once on mount
  useEffect(() => {
    const svg = d3
      .select(mapContainerRef.current)
      .append("svg")
      .attr("width", 1000)
      .attr("height", 600);

    const projection = d3.geoMercator().scale(150).translate([480, 420]);
    const path = d3.geoPath().projection(projection);

    d3.json("geo.json").then((geoData: any) => {
      if (!geoData) return;
      svg
        .selectAll("path")
        .data(geoData.features)
        .enter()
        .append("path")
        .attr("d", path as any)
        .attr("class", "country");

      updateColors();
    });

    return () => {
      d3.select(mapContainerRef.current).select("svg").remove();
    };
  }, []);

  // Re-color on year or metric change
  useEffect(() => {
    updateColors();
  }, [selectedSelection, selectedYear]);

  return <div ref={mapContainerRef} className="mainViz" />;
};

export default VisMap;
