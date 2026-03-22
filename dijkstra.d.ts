import type * as Graph from "./graph";
import type { lt, plus } from "./helpers/arithmetic";
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
	Queue.get<name, unvisited> extends never
		? never
		: Queue.get<name, unvisited> extends infer neighbor extends Vertex.T
			? lt<plus<current["dist"], weight>, neighbor["dist"]> extends true
				? Vertex.create<name, plus<current["dist"], weight>, current>
				: never
			: never;

// @ts-expect-error - infinite recursion, but still works if graph is small enough
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
	updatedNeighbors extends Vertex.T[] = List.filterMap<
		updateNeighborFn<current, newUnvisited>,
		Graph.neighbors<current["name"], g>
	> extends infer neighbours extends Vertex.T[]
		? neighbours
		: never,
	updatedUnvisited extends Queue.T = List.foldRight<
		Queue.updateFn,
		updatedNeighbors,
		newUnvisited
	>,
> =
	Queue.min<updatedUnvisited> extends never
		? Vertex.getPath<Queue.get<des, newVisited>>
		: Queue.min<updatedUnvisited> extends infer next extends Vertex.T
			? next["name"] extends des
				? Vertex.getPath<next>
				: search<des, g, next, newVisited, updatedUnvisited>
			: never;

export type shortestPath<
	src extends string,
	des extends string,
	g extends Graph.T,
	firstVertex extends Vertex.T = Vertex.create<src, 0>,
	initialVisited extends Queue.T = Queue.empty,
	initialUnvisited extends Queue.T = Queue.ofList<
		List.map<Vertex.createFn<999>, Graph.vertices<g>>
	>,
> = search<des, g, firstVertex, initialVisited, initialUnvisited>;
