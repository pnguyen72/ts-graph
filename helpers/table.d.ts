import type { toArray } from "./union.d.ts";
export type T = object;

export type empty = object;

export type insert<k extends string | number, v, t extends T> = Omit<t, k> &
	Record<k, v>;

export type get<k extends string | number, t extends T> =
	t extends Record<k, infer v> ? v : unknown;

export type mem<k extends string | number, t extends T> =
	t extends Record<k, infer _> ? true : false;

export type remove<k extends string | number, t extends T> = Omit<t, k>;

export type keys<t extends T> = toArray<keyof t>;

export type values<t extends T> = toArray<t[keyof t]>;
