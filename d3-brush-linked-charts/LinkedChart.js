import React, { Component } from "react";
import * as d3 from "d3";

const width = 500,
  height = 300;
const margin = { top: 20, right: 20, bottom: 30, left: 50 };

/**
 * Multi-line chart that filters its data to only the years selected by the brush.
 * When the brush range changes, getDerivedStateFromProps re-derives scales and paths
 * from the filtered subset — the chart zooms into the selected time window.
 */
class LinkedChart extends Component {
  constructor(props) {
    super(props);
    this.state = { lines: {}, xScale: null, yScale: null };
    this.xAxisRef = React.createRef();
    this.yAxisRef = React.createRef();
  }

  static getDerivedStateFromProps(nextProps) {
    const { data, range } = nextProps;
    if (!data || (range.length !== 0 && range.length < 4)) return null;

    const numericRange = range.map((y) => +y);

    // Filter to only brushed years (or all years if no brush)
    const filtered = Object.entries(data.World)
      .filter(([year]) => !range.length || numericRange.includes(+year))
      .map(([year, v]) => ({
        year: +year,
        sentiment: v.sentiment,
        denial: v.denial,
        aggressive: v.aggressive,
      }));

    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(filtered, (d) => d.year))
      .range([margin.left, width - margin.right]);

    const yMin = d3.min(filtered, (d) =>
      Math.min(d.sentiment, d.denial, d.aggressive),
    );
    const yMax = d3.max(filtered, (d) =>
      Math.max(d.sentiment, d.denial, d.aggressive),
    );
    const pad = (yMax - yMin) * 0.5;

    const yScale = d3
      .scaleLinear()
      .domain([yMin - pad, yMax + pad])
      .range([height - margin.bottom, margin.top]);

    const line = d3
      .line()
      .x((d) => xScale(d.year))
      .curve(d3.curveMonotoneX);

    // Three line paths from the same filtered dataset
    const lines = {
      sentiment: line.y((d) => yScale(d.sentiment))(filtered),
      denial: line.y((d) => yScale(d.denial))(filtered),
      aggressive: line.y((d) => yScale(d.aggressive))(filtered),
    };

    return { lines, xScale, yScale };
  }

  componentDidMount() {
    this.renderAxes();
  }
  componentDidUpdate() {
    this.renderAxes();
  }

  renderAxes() {
    if (!this.state.xScale) return;
    d3.select(this.xAxisRef.current).call(
      d3.axisBottom(this.state.xScale).tickFormat(d3.format("d")),
    );
    d3.select(this.yAxisRef.current).call(d3.axisLeft(this.state.yScale));
  }

  render() {
    const { lines } = this.state;
    return (
      <svg width={width} height={height}>
        <g transform={`translate(${margin.left},${margin.top})`}>
          <path
            d={lines.sentiment}
            stroke="#38BDF8CC"
            strokeWidth={2}
            fill="none"
          />
          <path d={lines.denial} stroke="orange" strokeWidth={2} fill="none" />
          <path
            d={lines.aggressive}
            stroke="#F87171"
            strokeWidth={2}
            fill="none"
          />
          <g
            ref={this.xAxisRef}
            transform={`translate(0,${height - margin.top - margin.bottom})`}
          />
          <g ref={this.yAxisRef} />
        </g>
      </svg>
    );
  }
}

export default LinkedChart;
