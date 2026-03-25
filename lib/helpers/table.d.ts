import type { List } from "./list.d.ts";
import type { nil } from "./nil";

export type Table = object;
export namespace Table {
	export type empty = object;

	export type insert<k extends PropertyKey, v, t extends Table> = t &

		Record<k, v>;
	export type update<k extends PropertyKey, v, t extends Table> = insert<k, v, remove<k, t>>;

	export type remove<k extends PropertyKey, t extends Table> = Omit<t, k>;

	export type get<k extends PropertyKey, t extends Table> = k extends keyof t
		? t[k]
		: nil;

	export type mem<k extends PropertyKey, t extends Table> = k extends keyof t
		? true
		: false;

	export type keys<t extends Table> = List.ofUnion<keyof t>;

	export type values<t extends Table> = List.ofUnion<t[keyof t]>;
}
