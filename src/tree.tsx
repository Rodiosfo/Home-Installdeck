import { cloneElement, isValidElement, ReactElement, ReactNode } from "react";

// Only traverse React children, not arbitrary Steam objects or cyclic fibers.
// Clone ancestors, preserving keys, refs, styles, callbacks and component types.
export function replaceFirst(
  tree: ReactNode, match: (node: ReactElement<any>) => boolean,
  replacement: (node: ReactElement<any>) => ReactNode,
): { tree: ReactNode; found: boolean } {
  let found = false;
  function walk(node: ReactNode, depth = 0): ReactNode {
    if (found || depth > 40) return node;
    if (Array.isArray(node)) {
      let changed = false;
      const next = node.map(child => { const value = walk(child, depth + 1); changed ||= value !== child; return value; });
      return changed ? next : node;
    }
    if (!isValidElement<any>(node)) return node;
    if (match(node)) { found = true; return replacement(node); }
    const children = (node as ReactElement<any>).props.children;
    if (children === undefined) return node;
    const next = walk(children, depth + 1);
    return next === children ? node : cloneElement(node, {}, next);
  }
  return { tree: walk(tree), found };
}
