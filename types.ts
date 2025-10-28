// Fix: Import d3 types to resolve namespace errors.
import * as d3 from 'd3';

export interface MindMapNode {
  name: string;
  details?: string;
  children?: MindMapNode[];
}

export interface D3Node extends d3.HierarchyPointNode<MindMapNode> {
  x0?: number;
  y0?: number;
  _children?: d3.HierarchyNode<MindMapNode>[];
}

export interface D3Link extends d3.HierarchyPointLink<MindMapNode> {
  source: D3Node;
  target: D3Node;
}
