import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { MindMapNode, D3Node } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface MindMapProps {
  data: MindMapNode;
}

interface TooltipState {
  visible: boolean;
  content: string;
  x: number;
  y: number;
}

const MindMap: React.FC<MindMapProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, content: '', x: 0, y: 0 });
  const { theme } = useTheme();

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const container = svg.node()?.parentElement;
    if (!container) return;

    svg.selectAll("*").remove(); // Clear previous renders

    const { width, height } = container.getBoundingClientRect();
    const dx = 40;
    const dy = width / 6;
    const transitionDuration = 500;
    
    const linkColor = theme === 'dark' ? '#4f4f4f' : '#cccccc';
    const textColor = theme === 'dark' ? '#f3f4f6' : '#1f2937';
    const textHaloColor = theme === 'dark' ? '#1f2937' : '#ffffff';
    const nodeColor = theme === 'dark' ? '#a5f3fc' : '#38bdf8';
    const nodeWithChildrenColor = theme === 'dark' ? '#22d3ee' : '#0ea5e9';


    const tree = d3.tree<MindMapNode>().nodeSize([dx, dy]);
    const root = d3.hierarchy(data) as D3Node;

    root.x0 = height / 2;
    root.y0 = 0;
    root.descendants().forEach((d: any, i: number) => {
        d.id = i;
        d._children = d.children;
        if (d.depth > 1) d.children = null;
    });

    const g = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 12);

    const linkGroup = g.append("g")
        .attr("fill", "none")
        .attr("stroke", linkColor)
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", 1.5);

    const nodeGroup = g.append("g")
        .attr("cursor", "pointer")
        .attr("pointer-events", "all");
    
    const update = (source: D3Node) => {
        const nodes = root.descendants().reverse();
        const links = root.links();

        tree(root);

        let left = root;
        let right = root;
        root.eachBefore(node => {
            if (node.x < left.x!) left = node;
            if (node.x > right.x!) right = node;
        });

        const newHeight = right.x! - left.x! + dx * 2;
        svg.attr("viewBox", [-dy / 2, left.x! - dx, width, newHeight]);
        
        if(source.parent){ // Center on the parent of the toggled node
            const t = d3.zoomTransform(svg.node()!);
            const newX = -source.parent.y0! * t.k + width/4;
            const newY = -source.parent.x0! * t.k + newHeight/2*t.k;
            const transform = d3.zoomIdentity.translate(newX, newY).scale(t.k);
            svg.transition().duration(transitionDuration).call(zoom.transform as any, transform);
        }

        // --- NODES ---
        const node = nodeGroup.selectAll<SVGGElement, D3Node>("g")
            .data(nodes, d => d.id as any);

        const nodeEnter = node.enter().append("g")
            .attr("transform", d => `translate(${source.y0},${source.x0})`)
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0)
            .on("click", (event, d) => {
                d.children = d.children ? null : d._children;
                update(d);
            });
        
        nodeEnter.append("circle")
            .attr("r", 6)
            .attr("stroke-width", 10);

        nodeEnter.append("text")
            .attr("dy", "0.31em")
            .attr("x", d => d._children ? -10 : 10)
            .attr("text-anchor", d => d._children ? "end" : "start")
            .attr("fill", textColor)
            .text(d => d.data.name)
            .clone(true).lower()
            .attr("stroke-linejoin", "round")
            .attr("stroke-width", 3)
            .attr("stroke", textHaloColor);
            
        node.merge(nodeEnter)
            .on("mouseover", (event, d) => {
                if (d.data.details) {
                setTooltip({ visible: true, content: d.data.details, x: event.pageX, y: event.pageY });
                }
            })
            .on("mouseout", () => {
                setTooltip(t => ({ ...t, visible: false }));
            })
            .transition()
            .duration(transitionDuration)
            .attr("transform", d => `translate(${d.y},${d.x})`)
            .attr("fill-opacity", 1)
            .attr("stroke-opacity", 1);
        
        node.merge(nodeEnter).select('circle')
            .attr("fill", d => d._children ? nodeWithChildrenColor : nodeColor);

        node.exit<D3Node>().transition()
            .duration(transitionDuration)
            .remove()
            .attr("transform", d => `translate(${source.y},${source.x})`)
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0);

        // --- LINKS ---
        const link = linkGroup.selectAll<SVGPathElement, d3.HierarchyLink<MindMapNode>>("path")
            .data(links, d => (d.target as any).id);

        const linkEnter = link.enter().append("path")
            .attr("d", d => {
                const o = { x: source.x0!, y: source.y0! };
                return d3.linkHorizontal()({ source: o, target: o } as any);
            });

        link.merge(linkEnter).transition()
            .duration(transitionDuration)
            .attr("d", d3.linkHorizontal().x(d => (d as any).y).y(d => (d as any).x) as any);

        link.exit<d3.HierarchyLink<MindMapNode>>().transition()
            .duration(transitionDuration)
            .remove()
            .attr("d", d => {
                const o = { x: source.x!, y: source.y! };
                return d3.linkHorizontal()({ source: o, target: o } as any);
            });

        root.eachBefore(d => {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }
    
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
      
    svg.call(zoom);

    update(root);
    
     return () => {
        svg.selectAll("*").remove();
    };

  }, [data, theme]); // Re-run effect if data or theme changes

  return (
    <div className="w-full h-full relative">
      <svg ref={svgRef} className="w-full h-full"></svg>
      {tooltip.visible && (
        <div
          className="absolute p-2 text-sm bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 border border-cyan-400 rounded-md shadow-lg pointer-events-none z-10"
          style={{ top: tooltip.y + 10, left: tooltip.x + 10, maxWidth: '400px' }}
        >
          <pre className="whitespace-pre-wrap font-mono text-xs">{tooltip.content}</pre>
        </div>
      )}
    </div>
  );
};

export default MindMap;