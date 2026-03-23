import type { Edge, Graph } from "./graph";
import type { inf, lt, plus } from "./helpers/arithmetic";
import type { Fn } from "./helpers/function";
import type { List } from "./helpers/list";
import type { Table } from "./helpers/table";

export type shortestPath<
	src extends string,
	des extends string,
	graph extends Graph,
	srcNode extends Node = Node.of<src, 0>,
	visited extends NodeTable = NodeTable.empty,
	unvisited extends NodeTable = NodeTable.remove<
		srcNode,
		NodeTable.ofList<List.map<Node.ofDist<inf>, Graph.vertices<graph>>>
	>,
> =
	Graph.mem<src, graph> extends false
		? `Vertex ${src} does not exist`
		: Graph.mem<des, graph> extends false
			? `Vertex ${des} does not exist`
			: src extends des
				? { path: src; dist: 0 }
				: search<src, des, graph, srcNode, visited, unvisited>;

type search<
	src extends string,
	des extends string,
	graph extends Graph,
	current extends Node,
	visited extends NodeTable,
	unvisited extends NodeTable,
	newVisited extends NodeTable = NodeTable.add<current, visited>,
	neighbors extends Node[] = Graph.neighbors<
		current["name"],
		graph
	> extends infer edges extends Edge[]
		? List.filterMap<
				updateNeighborFn<current, unvisited>,
				edges
			> extends infer nodes extends Node[]
			? nodes
			: never
		: never,
> =
	NodeTable.removeMin<
		List.foldRight<NodeTable.update, neighbors, unvisited>
	> extends [infer next extends Node, infer newUnvisited extends NodeTable]
		? Node.relaxed<next> extends false
			? `Vertices ${src} and ${des} are not connected`
			: next["name"] extends des
				? Node.getPath<next>
				: search<src, des, graph, next, newVisited, newUnvisited>
		: NodeTable.get<des, newVisited> extends infer desNode extends Node
			? Node.getPath<desNode>
			: never;

// @ts-ignore - infinite recursion, but still works if graph is small enough
interface updateNeighborFn<current extends Node, unvisited extends NodeTable>
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
	unvisited extends NodeTable,
	name extends string,
	weight extends number,
> =
	NodeTable.get<name, unvisited> extends infer neighbor extends Node
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

	export interface ofDist<dist extends number> extends Fn<string, Node> {
		return: of<this["arg"], dist>;
	}

	export interface ltFn extends Fn<[Node, Node], boolean> {
		return: lt<this["arg"][0]["dist"], this["arg"][1]["dist"]>;
	}

	export type relaxed<node extends Node> = lt<node["dist"], inf>;

	type buildPath<node extends Node, acc extends string = ""> =
		node extends of<infer name, infer _, infer prev>
			? (acc extends "" ? name : `${name} - ${acc}`) extends infer acc extends
					string
				? prev extends Node
					? buildPath<prev, acc>
					: acc
				: never
			: never;

	export type getPath<node extends Node> = {
		path: buildPath<node>;
		dist: node["dist"];
	};
}

type NodeTable = Table;
declare namespace NodeTable {
	export type empty = Table.empty;

	export type add<node extends Node, table extends NodeTable> = Table.insert<
		node["name"],
		node,
		table
	>;

	export interface update extends Fn<[Node, NodeTable], NodeTable> {
		return: add<this["arg"][0], this["arg"][1]>;
	}

	export type remove<node extends Node, table extends NodeTable> = Table.remove<
		node["name"],
		table
	>;

	export type get<name extends string, table extends NodeTable> =
		Table.get<name, table> extends infer node extends Node ? node : unknown;

	export type ofList<nodes extends Node[]> = List.foldRight<
		update,
		nodes,
		Table.empty
	>;

	export type removeMin<table extends NodeTable> =
		// @ts-ignore - infinite recursion, but still works if graph is small enough
		List.min<Table.values<table>, Node.ltFn> extends infer node extends Node
			? [node, remove<node, table>]
			: unknown;
}
