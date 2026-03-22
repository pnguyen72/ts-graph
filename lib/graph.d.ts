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
	type addEdge<e extends Edge, g extends Graph> = (
		Table.get<e["from"], g> extends infer edges extends Edge[]
			? Table.insert<e["from"], [...edges, e], g>
			: Table.insert<e["from"], [e], g>
	) extends infer g extends Graph
		? Table.mem<e["to"], g> extends false
			? Table.insert<e["to"], [], g>
			: g
		: never;

	export type of<
		edges extends Edge[],
		g extends Graph = Table.empty,
	> = edges extends [infer e extends Edge, ...infer rest extends Edge[]]
		? of<rest, addEdge<e, g>>
		: g;

	export type vertices<g extends Graph> =
		Table.keys<g> extends infer names extends string[] ? names : [];

	export type neighbors<v extends string, g extends Graph> =
		Table.get<v, g> extends infer edges extends Edge[] ? edges : unknown;
}
