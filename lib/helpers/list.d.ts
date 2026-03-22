import type { Fn } from "./function.d.ts";

export namespace List {
	export type foldRight<
		f extends Fn<[unknown, unknown]>,
		arr extends unknown[],
		acc,
	> = arr extends [...infer rest, infer last]
		? foldRight<f, rest, Fn.call<f, [last, acc]>>
		: acc;

	interface minFn<lt extends Fn<[unknown, unknown], boolean>>
		extends Fn<[unknown, unknown], unknown> {
		return: Fn.call<lt, this["arg"]> extends true
			? this["arg"][0]
			: this["arg"][1];
	}
	export type min<
		arr extends unknown[],
		lt extends Fn<[unknown, unknown], boolean>,
	> = arr extends [...infer rest, infer last]
		? foldRight<minFn<lt>, rest, last>
		: unknown;

	export type filterMap<f extends Fn, arr extends unknown[]> = arr extends [
		infer head,
		...infer tail,
	]
		? Fn.call<f, head> extends infer result
			? unknown extends result
				? filterMap<f, tail>
				: [result, ...filterMap<f, tail>]
			: never
		: [];

	export type map<f extends Fn, arr extends unknown[]> = arr extends [
		infer head,
		...infer tail,
	]
		? [Fn.call<f, head>, ...map<f, tail>]
		: [];

	// https://github.com/hackle/blog-rust/blob/master/sample/typescript-union-to-tuple-array.ts
	export type ofUnion<u> = [u] extends [never]
		? []
		: pickOne<u> extends infer last
			? Exclude<u, last> extends never
				? [last]
				: [...ofUnion<Exclude<u, last>>, last]
			: never;
	type pickOne<T> = inferContra<inferContra<contra<contra<T>>>>;
	type contra<T> = T extends T ? (arg: T) => void : never;
	type inferContra<T> = [T] extends [(arg: infer I) => void] ? I : never;
}
