import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showArea?: boolean;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 120,
  height = 40,
  color = 'var(--success-500)',
  showArea = true,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create scales
    const x = d3
      .scaleLinear()
      .domain([0, data.length - 1])
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain(d3.extent(data) as [number, number])
      .range([height, 0]);

    // Create line generator
    const line = d3
      .line<number>()
      .x((d, i) => x(i))
      .y((d) => y(d))
      .curve(d3.curveMonotoneX);

    // Create area generator
    const area = d3
      .area<number>()
      .x((d, i) => x(i))
      .y0(height)
      .y1((d) => y(d))
      .curve(d3.curveMonotoneX);

    // Add area
    if (showArea) {
      svg
        .append('path')
        .datum(data)
        .attr('fill', color)
        .attr('fill-opacity', '0.2')
        .attr('d', area);
    }

    // Add line
    svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', '2')
      .attr('d', line);

    // Add dot at the end
    svg
      .append('circle')
      .attr('cx', width)
      .attr('cy', y(data[data.length - 1]))
      .attr('r', '3')
      .attr('fill', color);
  }, [data, width, height, color, showArea]);

  if (data.length === 0) return null;

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ overflow: 'visible' }}
    />
  );
};

export default Sparkline;
