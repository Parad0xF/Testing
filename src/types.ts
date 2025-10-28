// Fix: Import d3 types to resolve namespace errors.
import * as d3 from 'd3';

export interface MindMapNode {
  name: string;
  details?: string;
  children?: MindMapNode[];
}

// Correcting D3Node type definition.
// By defining D3Node as a type alias with an intersection, we can avoid
// potential complex type resolution issues with interface extension.
// This also allows for a more accurate representation of nodes that are decorated
// with additional properties.
// FIX: Base the D3Node on d3.HierarchyNode and make layout-specific properties
// optional. This correctly models the node before and after the layout is applied.
export type D3Node = d3.HierarchyNode<MindMapNode> & {
  id?: number;
  x0?: number;
  y0?: number;
  x?: number;
  y?: number;
  _children?: D3Node[];
};

// FIX: D3Link should extend d3.HierarchyLink instead of d3.HierarchyPointLink
// to be compatible with the updated D3Node type.
export interface D3Link extends d3.HierarchyLink<MindMapNode> {
  source: D3Node;
  target: D3Node;
}
