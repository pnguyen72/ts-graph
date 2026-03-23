import type { Edge, Graph } from "./graph";
import type { inf, lt, plus } from "./helpers/arithmetic";
import type { Fn } from "./helpers/function";
import type { List } from "./helpers/list";
import type { Table } from "./helpers/table";

export type shortestPath<
	src extends string,
	des extends string,
	g extends Graph,
	srcNode extends Node = Node.of<src, 0>,
	visited extends NodeTable = NodeTable.empty,
	unvisited extends NodeTable = Fn.pipe<
		g,
		[
			Graph.vertices,
			List.map<Node.ofDist<inf>>,
			NodeTable.ofList,
			NodeTable.remove<srcNode>,
		]
	>,
> =
	Graph.mem<src, g> extends false
		? `Vertex ${src} does not exist`
		: Graph.mem<des, g> extends false
			? `Vertex ${des} does not exist`
			: src extends des
				? { path: src; dist: 0 }
				: search<src, des, g, srcNode, visited, unvisited>;

type search<
	src extends string,
	des extends string,
	g extends Graph,
	current extends Node,
	visited extends NodeTable,
	unvisited extends NodeTable,
	newVisited extends NodeTable = Fn.call<NodeTable.update, [current, visited]>,
	neighbors extends Node[] = Fn.pipe<
		g,
		[
			Graph.neighbors<current["name"]>,
			List.filterMap<updateNeighbor<current, unvisited>>,
		]
	>,
> =
	NodeTable.removeMin<
		List.foldRight<NodeTable.update, neighbors, unvisited>
	> extends [infer next extends Node, infer newUnvisited extends NodeTable]
		? Node.relaxed<next> extends false
			? `Vertices ${src} and ${des} are not connected`
			: next["name"] extends des
				? Fn.call<Node.getPath, next>
				: search<src, des, g, next, newVisited, newUnvisited>
		: Fn.pipe<newVisited, [NodeTable.get<des>, Node.getPath]>;

interface updateNeighbor<current extends Node, unvisited extends NodeTable>
	extends Fn<Edge> {
	return: this["arg"] extends Edge.of<infer _, infer name, infer edgeLength>
		? Fn.call<NodeTable.get<name>, unvisited> extends infer neighbor extends
				Node
			? plus<current["dist"], edgeLength> extends infer newDist extends number
				? lt<newDist, neighbor["dist"]> extends true
					? Node.of<name, newDist, current>
					: unknown
				: never
			: unknown
		: never;
}

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

	export interface getPath extends Fn<Node> {
		return: this["arg"] extends infer node extends Node
			? { path: buildPath<node>; dist: node["dist"] }
			: never;
	}
}

type NodeTable = Table;
declare namespace NodeTable {
	export type empty = Table.empty;

	export interface update extends Fn<[Node, NodeTable], NodeTable> {
		return: Table.insert<
			this["arg"][0]["name"],
			this["arg"][0],
			this["arg"][1]
		>;
	}

	export interface remove<node extends Node> extends Fn<NodeTable, NodeTable> {
		return: Table.remove<node["name"], this["arg"]>;
	}

	export interface get<name extends string> extends Fn<NodeTable> {
		return: Table.get<name, this["arg"]> extends infer node extends Node
			? node
			: unknown;
	}

	export interface ofList extends Fn<Node[], NodeTable> {
		return: List.foldRight<update, this["arg"], Table.empty>;
	}

	export type removeMin<table extends NodeTable> =
		// @ts-ignore - infinite recursion, but still works if graph is small enough
		List.min<Node.ltFn, Table.values<table>> extends infer min extends Node
			? [min, Fn.call<remove<min>, table>]
			: unknown;
}
