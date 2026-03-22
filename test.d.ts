import type { shortestPath } from "./lib/dijkstra";
import type * as Graph from "./lib/graph";

type graph = Graph.ofEdges<
	[
		Graph.edge<"a", "c", 2>,
		Graph.edge<"b", "a", 4>,
		Graph.edge<"c", "b", 6>,
		Graph.edge<"c", "d", 5>,
		Graph.edge<"c", "e", 1>,
		Graph.edge<"d", "e", 3>,
		Graph.edge<"e", "b", 2>,
		Graph.edge<"e", "f", 1>,
		Graph.edge<"f", "d", 2>,
	]
>;

type _path = shortestPath<"a", "f", graph>;
