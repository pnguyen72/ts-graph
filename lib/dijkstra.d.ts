import type { Edge, Graph } from "./graph";
import type { inf, lt, plus } from "./helpers/arithmetic";
import type { Fn } from "./helpers/function";
import type { List } from "./helpers/list";
import type { Table } from "./helpers/table";

export type shortestPath<
	src extends string,
	des extends string,
	g extends Graph,
	srcVertex extends Node = Node.of<src, 0>,
	visited extends Queue = Queue.empty,
	unvisited extends Queue = Queue.ofList<
		List.map<Node.createFn<inf>, Graph.vertices<g>>
	>,
> = src extends des
	? { path: [src]; dist: 0 }
	: search<des, g, srcVertex, visited, unvisited>;

type search<
	des extends string,
	g extends Graph,
	current extends Node,
	visited extends Queue,
	unvisited extends Queue,
	newVisited extends Queue = Queue.update<current, visited>,
	newUnvisited extends Queue = Queue.remove<current, unvisited>,
	updatedNeighbors extends Node[] = Graph.neighbors<
		current["name"],
		g
	> extends infer edges extends Edge[]
		? List.filterMap<
				updateNeighborFn<current, newUnvisited>,
				edges
			> extends infer nodes extends Node[]
			? nodes
			: []
		: [],
	updatedUnvisited extends Queue = List.foldRight<
		Queue.updateFn,
		updatedNeighbors,
		newUnvisited
	>,
> =
	Queue.min<updatedUnvisited> extends infer next extends Node
		? next["name"] extends des
			? Node.isRelaxed<next> extends true
				? Node.getPath<next>
				: "not connected"
			: search<des, g, next, newVisited, updatedUnvisited>
		: Queue.get<des, newVisited> extends infer desVertex extends Node
			? Node.getPath<desVertex>
			: unknown;

// @ts-ignore - infinite recursion, but still works if graph is small enough
interface updateNeighborFn<current extends Node, unvisited extends Queue>
	extends Fn<Edge, Node> {
	return: updateNeighbor<
		current,
		unvisited,
		this["arg"]["to"],
		this["arg"]["weight"]
	>;
}

type updateNeighbor<
	current extends Node,
	unvisited extends Queue,
	name extends string,
	weight extends number,
> =
	Queue.get<name, unvisited> extends infer neighbor extends Node
		? plus<current["dist"], weight> extends infer newDist extends number
			? lt<newDist, neighbor["dist"]> extends true
				? Node.of<name, newDist, current>
				: unknown
			: unknown
		: unknown;

type Node = { name: string; dist: number; prev: Node | null };
declare namespace Node {
	export type of<
		name extends string,
		dist extends number,
		prev extends Node | null = null,
	> = { name: name; dist: dist; prev: prev };

	export interface createFn<dist extends number> extends Fn<string, Node> {
		return: of<this["arg"], dist>;
	}

	export interface ltFn extends Fn<[Node, Node], boolean> {
		return: lt<this["arg"][0]["dist"], this["arg"][1]["dist"]>;
	}

	export type isRelaxed<node extends Node> = lt<node["dist"], inf>;

	type buildPath<node extends Node, acc extends string[] = []> =
		node extends of<infer name, infer _, infer prev>
			? prev extends Node
				? buildPath<prev, [name, ...acc]>
				: [name, ...acc]
			: never;

	export type getPath<v extends Node> = { path: buildPath<v>; dist: v["dist"] };
}

type Queue = Table;
declare namespace Queue {
	export type empty = Table.empty;

	export type update<v extends Node, q extends Queue> = Table.insert<
		v["name"],
		v,
		q
	>;

	export interface updateFn extends Fn<[Node, Table], Table> {
		return: update<this["arg"][0], this["arg"][1]>;
	}

	export type remove<v extends Node, q extends Queue> = Table.remove<
		v["name"],
		q
	>;

	export type get<k extends string, q extends Queue> =
		Table.get<k, q> extends infer v extends Node ? v : unknown;

	export type ofList<
		vs extends Node[],
		acc extends Queue = Table.empty,
	> = vs extends [infer v extends Node, ...infer rest extends Node[]]
		? ofList<rest, update<v, acc>>
		: acc;

	export type min<q extends Queue> =
		// @ts-ignore - infinite recursion, but still works if graph is small enough
		List.min<Table.values<q>, Node.ltFn> extends infer v extends Node
			? v
			: unknown;
}
