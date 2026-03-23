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
		neighbors<e["from"], graph> extends infer edges extends Edge[]
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

	export type vertices<graph extends Graph> =
		Table.keys<graph> extends infer names extends string[] ? names : [];

	export type neighbors<v extends string, graph extends Graph> =
		Table.get<v, graph> extends infer edges extends Edge[] ? edges : unknown;

	export type mem<v extends string, graph extends Graph> = Table.mem<v, graph>;
}
