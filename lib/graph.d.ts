import type { Fn } from "./helpers/function";
import type { nil } from "./helpers/nil";
import type { Table } from "./helpers/table";

export type Edge<
	src extends string = string,
	des extends string = string,
	len extends number = number,
> = { src: src; des: des; len: len };

export type Graph = Table;
export namespace Graph {
	type addEdge<e extends Edge, graph extends Graph> = (
		Fn.call<neighbors<e["src"]>, graph> extends infer edges extends Edge[]
			? Table.update<e["src"], [...edges, e], graph>
			: Table.insert<e["src"], [e], graph>
	) extends infer graph extends Graph
		? mem<e["des"], graph> extends false
			? Table.insert<e["des"], [], graph>
			: graph
		: never;

	export type of<
		edges extends Edge[],
		graph extends Graph = Table.empty,
	> = edges extends [infer head extends Edge, ...infer tail extends Edge[]]
		? of<tail, addEdge<head, graph>>
		: graph;

	export interface vertices extends Fn<Graph, string[]> {
		return: Table.keys<this["arg"]>;
	}

	export interface neighbors<v extends string> extends Fn<Graph, Edge[] | nil> {
		return: Table.get<v, this["arg"]>;
	}

	export type mem<v extends string, graph extends Graph> = Table.mem<v, graph>;
}
