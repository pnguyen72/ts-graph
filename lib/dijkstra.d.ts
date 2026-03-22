import type * as Graph from "./graph";
import type { inf, lt, plus } from "./helpers/arithmetic";
import type { Fn } from "./helpers/function";
import type * as List from "./helpers/list";
import type * as Vertex from "./vertex";
import type * as Queue from "./vertexQueue";

type updateNeighbor<
	current extends Vertex.T,
	unvisited extends Queue.T,
	name extends string,
	weight extends number,
> =
	Queue.get<name, unvisited> extends infer neighbor extends Vertex.T
		? plus<current["dist"], weight> extends infer newDist extends number
			? lt<newDist, neighbor["dist"]> extends true
				? Vertex.create<name, newDist, current>
				: unknown
			: unknown
		: unknown;

// @ts-ignore - infinite recursion, but still works if graph is small enough
interface updateNeighborFn<current extends Vertex.T, unvisited extends Queue.T>
	extends Fn<Graph.Edge, Vertex.T> {
	return: updateNeighbor<
		current,
		unvisited,
		this["arg"]["to"],
		this["arg"]["weight"]
	>;
}

type search<
	des extends string,
	g extends Graph.T,
	current extends Vertex.T,
	visited extends Queue.T,
	unvisited extends Queue.T,
	newVisited extends Queue.T = Queue.update<current, visited>,
	newUnvisited extends Queue.T = Queue.remove<current, unvisited>,
	updatedNeighbors extends Vertex.T[] = Graph.neighbors<
		current["name"],
		g
	> extends infer edges extends Graph.Edge[]
		? List.filterMap<
				updateNeighborFn<current, newUnvisited>,
				edges
			> extends infer vertices extends Vertex.T[]
			? vertices
			: []
		: [],
	updatedUnvisited extends Queue.T = List.foldRight<
		Queue.updateFn,
		updatedNeighbors,
		newUnvisited
	>,
> =
	Queue.min<updatedUnvisited> extends infer next extends Vertex.T
		? next["name"] extends des
			? lt<next["dist"], inf> extends true
				? Vertex.getPath<next>
				: "not connected"
			: search<des, g, next, newVisited, updatedUnvisited>
		: Queue.get<des, newVisited> extends infer desVertex extends Vertex.T
			? Vertex.getPath<desVertex>
			: unknown;

export type shortestPath<
	src extends string,
	des extends string,
	g extends Graph.T,
	srcVertex extends Vertex.T = Vertex.create<src, 0>,
	visited extends Queue.T = Queue.empty,
	unvisited extends Queue.T = Queue.ofList<
		List.map<Vertex.createFn<inf>, Graph.vertices<g>>
	>,
> = src extends des
	? { path: [src]; dist: 0 }
	: search<des, g, srcVertex, visited, unvisited>;
