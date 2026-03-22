import type { toList } from "./union.d.ts";
export type T = object;

export type empty = object;

export type insert<k extends string | number, v, t extends T> = Omit<t, k> &
	Record<k, v>;

export type get<k extends string | number, t extends T> = k extends keyof t
	? t[k]
	: unknown;

export type mem<k extends string | number, t extends T> = k extends keyof t
	? true
	: false;

export type remove<k extends string | number, t extends T> = Omit<t, k>;

export type keys<t extends T> = toList<keyof t>;

export type values<t extends T> = toList<t[keyof t]>;
