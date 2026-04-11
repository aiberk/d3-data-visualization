import React, { Component } from "react";
import * as d3 from "d3";

const width = 480,
  height = 230;
const margin = { top: 20, right: 5, bottom: 20, left: 50 };

/**
 * Grouped bar chart with D3 brush overlay.
 * Brushing selects years and passes them to the parent via updateRange().
 * Uses getDerivedStateFromProps to keep D3 scales in sync with data.
 */
class BarChart extends Component {
  constructor(props) {
    super(props);
    this.state = { bars: [] };
    this.xAxisRef = React.createRef();
    this.yAxisRef = React.createRef();
    this.brushRef = React.createRef();
  }

  // Derive D3 scales and bar positions from props — always in sync
  static getDerivedStateFromProps(nextProps) {
    const { data } = nextProps;
    if (!data) return {};

    // Flatten nested Record into array with one entry per metric per year
    const dataArray = [];
    Object.entries(data.World).forEach(([year, values]) => {
      dataArray.push({
        year: +year,
        type: "Sentiment",
        value: values.sentiment,
      });
      dataArray.push({ year: +year, type: "Denial", value: values.denial });
      dataArray.push({
        year: +year,
        type: "Aggressive",
        value: values.aggressive,
      });
    });

    const xScale = d3
      .scaleBand()
      .domain(dataArray.map((d) => d.year))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(dataArray, (d) => d.value))
      .range([height - margin.bottom, margin.top]);

    const colorScale = d3
      .scaleOrdinal()
      .domain(["Sentiment", "Denial", "Aggressive"])
      .range(["#F87171", "orange", "#38BDF8CC"]);

    // Position 3 bars per year group, side by side
    const bars = dataArray.map((d, i) => ({
      year: d.year.toString(),
      x: xScale(d.year) + (xScale.bandwidth() / 4) * i,
      y: yScale(d.value),
      width: xScale.bandwidth() / 4,
      height: height - margin.bottom - yScale(d.value),
      fill: colorScale(d.type),
    }));

    return { bars, xScale, yScale };
  }

  componentDidMount() {
    // D3 brush overlay — maps pixel selection to year selection
    this.brush = d3
      .brushX()
      .extent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ])
      .handleSize(30)
      .on("brush", (event) => {
        // Enforce minimum brush size to prevent degenerate selections
        const [x0, x1] = event.selection || [0, 0];
        const minSize = 30;
        if (x1 - x0 < minSize) {
          const clamped =
            x1 === width - margin.right
              ? [x1 - minSize, x1]
              : [x0, x0 + minSize];
          d3.select(this.brushRef.current).call(this.brush.move, clamped);
        }
      })
      .on("end", this.brushEnd);

    d3.select(this.brushRef.current).call(this.brush);
    this.renderAxes();
  }

  componentDidUpdate() {
    this.renderAxes();
  }

  renderAxes() {
    d3.select(this.xAxisRef.current).call(
      d3.axisBottom(this.state.xScale).tickFormat(d3.format("d")),
    );
    d3.select(this.yAxisRef.current).call(d3.axisLeft(this.state.yScale));
  }

  // Pixel coordinates → data: filter bars by x position within brush selection
  brushEnd = (event) => {
    if (!event.selection) {
      this.props.updateRange([]);
      return;
    }
    const [x0, x1] = event.selection;
    const selectedYears = this.state.bars
      .filter((d) => x0 <= d.x && d.x + d.width <= x1)
      .map((d) => d.year);
    this.props.updateRange(selectedYears);
  };

  render() {
    return (
      <svg width={width} height={height}>
        {this.state.bars.map((d, i) => (
          <rect
            key={i}
            x={d.x}
            y={d.y}
            width={d.width}
            height={d.height}
            fill={d.fill}
          />
        ))}
        <g
          ref={this.xAxisRef}
          transform={`translate(0,${height - margin.bottom})`}
        />
        <g ref={this.yAxisRef} transform={`translate(${margin.left},0)`} />
        <g ref={this.brushRef} />
      </svg>
    );
  }
}

export default BarChart;
