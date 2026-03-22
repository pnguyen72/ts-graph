import type { lt as numLt } from "./helpers/arithmetic.d.ts";
import type { Fn } from "./helpers/function";

type T = { name: string; dist: number; prev: T | null };

export type create<
	name extends string,
	dist extends number,
	prev extends T | null = null,
> = {
	name: name;
	dist: dist;
	prev: prev;
};

export interface createFn<dist extends number> extends Fn<string, T> {
	return: create<this["arg"], dist>;
}

export interface lt extends Fn<[T, T], boolean> {
	return: numLt<this["arg"][0]["dist"], this["arg"][1]["dist"]>;
}

type buildPath<v extends T, acc extends string[] = []> =
	v extends create<infer name, infer _, infer prev>
		? prev extends T
			? buildPath<prev, [name, ...acc]>
			: [name, ...acc]
		: never;

export type getPath<v extends T> = { path: buildPath<v>; distance: v["dist"] };
