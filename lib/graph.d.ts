import type { Fn } from "./helpers/function";
import type { Table } from "./helpers/table";

export type Edge = { from: string; to: string; weight: number };
export namespace Edge {
	export type of<
		from extends string,
		to extends string,
		weight extends number,
	> = { from: from; to: to; weight: weight };
}

export type Graph = Table;
export namespace Graph {
	type addEdge<e extends Edge, graph extends Graph> = (
		Fn.call<neighbors<e["from"]>, graph> extends infer edges extends Edge[]
			? Table.insert<e["from"], [...edges, e], graph>
			: Table.insert<e["from"], [e], graph>
	) extends infer graph extends Graph
		? mem<e["to"], graph> extends false
			? Table.insert<e["to"], [], graph>
			: graph
		: never;

	export type of<
		edges extends Edge[],
		graph extends Graph = Table.empty,
	> = edges extends [infer head extends Edge, ...infer tail extends Edge[]]
		? of<tail, addEdge<head, graph>>
		: graph;

	export interface vertices extends Fn<Graph, string[]> {
		return: Table.keys<this["arg"]> extends infer names extends string[]
			? names
			: [];
	}

	export interface neighbors<v extends string>
		extends Fn<Graph, Edge[] | unknown> {
		return: Table.get<v, this["arg"]> extends infer edges extends Edge[]
			? edges
			: unknown;
	}

	export type mem<v extends string, graph extends Graph> = Table.mem<v, graph>;
}
