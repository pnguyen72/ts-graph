import type { List } from "./list.d.ts";

export type Table = object;
export namespace Table {
	export type empty = object;

	export type insert<k extends PropertyKey, v, t extends Table> = Omit<t, k> &
		Record<k, v>;

	export type get<k extends PropertyKey, t extends Table> = k extends keyof t
		? t[k]
		: unknown;

	export type mem<k extends PropertyKey, t extends Table> = k extends keyof t
		? true
		: false;

	export type remove<k extends PropertyKey, t extends Table> = Omit<t, k>;

	export type keys<t extends Table> = List.ofUnion<keyof t>;

	export type values<t extends Table> = List.ofUnion<t[keyof t]>;
}
