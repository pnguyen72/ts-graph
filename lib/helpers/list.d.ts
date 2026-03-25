import type { Fn } from "./function.d.ts";
import type { nil } from "./nil";

export namespace List {
	export interface foldLeft<f extends Fn<[unknown, unknown]>, acc> extends Fn {
		return: foldLeftImpl<f, acc, this["arg"]>;
	}
	type foldLeftImpl<f extends Fn<[unknown, unknown]>, acc, l> = l extends [
		infer head,
		...infer tail,
	]
		? foldLeftImpl<f, Fn.call<f, [acc, head]>, tail>
		: acc;

	export type min<lt extends Fn, l extends unknown[]> = l extends [infer only]
		? only
		: l extends [infer first, infer second, ...infer rest]
			? min<lt, [takeMin<lt, first, second>, ...rest]>
			: nil;
	type takeMin<lt extends Fn, a, b> = Fn.call<lt, [a, b]> extends true ? a : b;

	export interface filterMap<f extends Fn> extends Fn {
		return: filterMapImpl<f, this["arg"]>;
	}
	type filterMapImpl<f extends Fn, l> = l extends [infer head, ...infer tail]
		? Fn.call<f, head> extends infer fHead
			? fHead extends nil
				? filterMapImpl<f, tail>
				: [fHead, ...filterMapImpl<f, tail>]
			: never
		: [];

	export interface map<f extends Fn> extends Fn<unknown[]> {
		return: mapImpl<f, this["arg"]>;
	}
	type mapImpl<f extends Fn, l extends unknown[]> = l extends [
		infer head,
		...infer tail,
	]
		? [Fn.call<f, head>, ...mapImpl<f, tail>]
		: [];

	// https://github.com/hackle/blog-rust/blob/master/sample/typescript-union-to-tuple-lay.ts
	export type ofUnion<u> = [u] extends [never]
		? []
		: pickOne<u> extends infer last
			? [...ofUnion<Exclude<u, last>>, last]
			: never;
	type pickOne<T> = inferContra<inferContra<contra<contra<T>>>>;
	type contra<T> = T extends T ? (arg: T) => void : never;
	type inferContra<T> = [T] extends [(arg: infer I) => void] ? I : never;
}
