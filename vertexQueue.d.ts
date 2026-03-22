import type { Fn } from "./helpers/function";
import type * as List from "./helpers/list";
import type * as Table from "./helpers/table";
import type * as Vertex from "./vertex";

export * from "./helpers/table";

export type update<v extends Vertex.T, q extends Table.T> = Table.insert<
	v["name"],
	v,
	q
>;

export interface updateFn extends Fn<[Vertex.T, Table.T], Table.T> {
	return: update<this["arg"][0], this["arg"][1]>;
}

export type remove<v extends Vertex.T, q extends Table.T> = Table.remove<
	v["name"],
	q
>;

export type get<k extends string, q extends Table.T> =
	Table.get<k, q> extends infer v extends Vertex.T ? v : unknown;

export type ofList<
	vs extends Vertex.T[],
	acc extends Table.T = Table.empty,
> = vs extends [infer v extends Vertex.T, ...infer rest extends Vertex.T[]]
	? ofList<rest, update<v, acc>>
	: acc;

export type min<q extends Table.T> =
	// @ts-expect-error - infinite recursion, but still works if graph is small enough
	List.min<Table.values<q>, Vertex.lt> extends infer v extends Vertex.T
		? v
		: unknown;
