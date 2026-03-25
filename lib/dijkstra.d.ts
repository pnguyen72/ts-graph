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
	otherNodes extends PriorityQueue = Fn.pipe<
		graph,
		[
			Graph.vertices,
			List.map<Node.ofDist<inf>>,
			PriorityQueue.ofList,
			PriorityQueue.remove<srcNode>,
		]
	>,
> =
	Graph.mem<src, graph> extends false
		? `Vertex ${src} does not exist`
		: Graph.mem<des, graph> extends false
			? `Vertex ${des} does not exist`
			: src extends des
				? { path: src; dist: 0 }
				: search<src, des, graph, srcNode, otherNodes>;

type search<
	src extends string,
	des extends string,
	graph extends Graph,
	current extends Node,
	unvisited extends PriorityQueue,
> =
	Fn.pipe<
		graph,
		[
			Graph.neighbors<current["name"]>,
			List.filterMap<relax<unvisited, current>>,
			List.foldLeft<PriorityQueue.update, unvisited>,
			PriorityQueue.pop,
		]
	> extends [infer next extends Node, infer nextUnvisited extends PriorityQueue]
		? Node.isRelaxed<next> extends false
			? `There's no path from ${src} to ${des}`
			: next["name"] extends des
				? Node.resolve<next>
				: search<src, des, graph, next, nextUnvisited>
		: /* Happens when unvisited is empty. 
		 	But des should've been visited and resolved in an earlier step. */
			never;

interface relax<unvisited extends PriorityQueue, current extends Node>
	extends Fn<Edge, Node | nil> {
	return: this["arg"] extends Edge<infer _, infer name, infer edgeLength>
		? PriorityQueue.find<name, unvisited> extends infer neighbor extends Node
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

	export interface ofDist<dist extends number> extends Fn<string, Node> {
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

type PriorityQueue = Table;
declare namespace PriorityQueue {
	export type empty = Table.empty;

	export type add<
		node extends Node,
		queue extends PriorityQueue,
	> = Table.insert<node["name"], node, queue>;

	export interface update extends Fn<[PriorityQueue, Node], PriorityQueue> {
		return: add<this["arg"][1], this["arg"][0]>;
	}

	export interface remove<node extends Node>
		extends Fn<PriorityQueue, PriorityQueue> {
		return: Table.remove<node["name"], this["arg"]>;
	}

	export type find<name extends string, queue extends PriorityQueue> =
		Table.get<name, queue> extends infer node extends Node ? node : nil;

	export type ofList = List.foldLeft<update, empty>;

	export interface pop extends Fn<PriorityQueue, [Node, PriorityQueue] | nil> {
		return: List.min<
			Node.ltFn,
			Table.values<this["arg"]>
		> extends infer min extends Node
			? [min, Fn.call<remove<min>, this["arg"]>]
			: nil;
	}
}
