import type { Edge, Graph } from "./graph";
import type { inf, lt, plus } from "./helpers/arithmetic";

import type { Fn } from "./helpers/function";
import type { List } from "./helpers/list";
import type { nil } from "./helpers/nil";
import type { Table } from "./helpers/table";

export type shortestPath<
	src extends string,
	des extends string,
	graph extends Graph,
	srcNode extends Node = Node.of<src, 0>,
	visited extends NodeTable = NodeTable.empty,
	unvisited extends NodeTable = Fn.pipe<
		graph,
		[
			Graph.vertices,
			List.map<Node.ofDist<inf>>,
			NodeTable.ofList,
			NodeTable.remove<srcNode>,
		]
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
	nextVisited extends NodeTable = NodeTable.add<current, visited>,
> =
	Fn.pipe<
		graph,
		[
			Graph.neighbors<current["name"]>,
			List.filterMap<relax<unvisited, current>>,
			List.foldLeft<NodeTable.update, unvisited>,
			NodeTable.removeMin,
		]
	> extends [infer next extends Node, infer nextUnvisited extends NodeTable]
		? Node.isRelaxed<next> extends false
			? `There's no path from ${src} to ${des}`
			: next["name"] extends des
				? Node.resolve<next>
				: search<src, des, graph, next, nextVisited, nextUnvisited>
		: /* Happens when unvisited is empty. 
		 	But des should've been visited and resolved in an earlier step. */
			"should be unreachable";

interface relax<unvisited extends NodeTable, current extends Node>
	extends Fn<Edge> {
	return: this["arg"] extends Edge<infer _, infer name, infer edgeLength>
		? NodeTable.get<name, unvisited> extends infer neighbor extends Node
			? plus<current["dist"], edgeLength> extends infer newDist extends number
				? lt<newDist, neighbor["dist"]> extends true
					? Node.of<name, newDist, current>
					: nil
				: never
			: nil
		: never;
}

type Node = { name: string; dist: number; prev: Node | null };
declare namespace Node {
	export type of<
		name extends string,
		dist extends number,
		prev extends Node | null = null,
	> = { name: name; dist: dist; prev: prev };

	export interface ofDist<dist extends number> extends Fn<string> {
		return: of<this["arg"], dist>;
	}

	export interface ltFn extends Fn<[Node, Node], boolean> {
		return: lt<this["arg"][0]["dist"], this["arg"][1]["dist"]>;
	}

	export type isRelaxed<node extends Node> = node["dist"] extends inf
		? false
		: true;

	export type resolve<node extends Node> = {
		path: buildPath<node>;
		dist: node["dist"];
	};
	type buildPath<node extends Node, acc extends string = ""> =
		node extends of<infer name, infer _, infer prev>
			? (acc extends "" ? name : `${name} -> ${acc}`) extends infer acc extends
					string
				? prev extends Node
					? buildPath<prev, acc>
					: acc
				: never
			: never;
}

type NodeTable = Table;
declare namespace NodeTable {
	export type empty = Table.empty;

	export type add<node extends Node, table extends NodeTable> = Table.insert<
		node["name"],
		node,
		table
	>;

	export interface update extends Fn<[NodeTable, Node]> {
		return: add<this["arg"][1], this["arg"][0]>;
	}

	export interface remove<node extends Node> extends Fn<NodeTable> {
		return: Table.remove<node["name"], this["arg"]>;
	}

	export type get<name extends string, table extends NodeTable> =
		Table.get<name, table> extends infer node extends Node ? node : nil;

	export type ofList = List.foldLeft<update, empty>;

	export interface removeMin extends Fn<NodeTable> {
		return: List.min<
			Node.ltFn,
			Table.values<this["arg"]>
		> extends infer min extends Node
			? [min, Fn.call<remove<min>, this["arg"]>]
			: nil;
	}
}
