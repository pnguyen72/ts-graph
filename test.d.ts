import type { shortestPath } from "./lib/dijkstra";
import type { Edge, Graph } from "./lib/graph";

type graph = Graph.of<
	[
		Edge.of<"a", "c", 2>,
		Edge.of<"b", "a", 4>,
		Edge.of<"c", "b", 6>,
		Edge.of<"c", "d", 5>,
		Edge.of<"c", "e", 2>,
		Edge.of<"d", "e", 3>,
		Edge.of<"e", "b", 2>,
		Edge.of<"e", "f", 1>,
		Edge.of<"f", "d", 2>,
	]
>;

type _path = shortestPath<"a", "b", graph>;
