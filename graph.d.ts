import type * as Table from "./helpers/table";

type Edge = { from: string; to: string; weight: number };

export type edge<
	from extends string,
	to extends string,
	weight extends number,
> = { from: from; to: to; weight: weight };

export type T = Table.T;

type addEdge<e extends Edge, g extends T> = (
	Table.mem<e["from"], g> extends false
		? Table.insert<e["from"], [e], g>
		: Table.get<e["from"], g> extends infer edgesFrom extends Edge[]
			? Table.insert<e["from"], [...edgesFrom, e], g>
			: never
) extends infer g extends T
	? Table.mem<e["to"], g> extends false
		? Table.insert<e["to"], [], g>
		: g
	: never;

export type ofEdges<
	edges extends Edge[],
	g extends T = Table.empty,
> = edges extends [infer e extends Edge, ...infer rest extends Edge[]]
	? ofEdges<rest, addEdge<e, g>>
	: g;

export type vertices<g extends T> =
	Table.keys<g> extends infer names extends string[] ? names : never;

export type neighbors<v extends string, g extends T> =
	Table.get<v, g> extends infer edges extends Edge[] ? edges : never;
