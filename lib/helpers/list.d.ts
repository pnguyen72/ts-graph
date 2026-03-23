import type { Fn } from "./function.d.ts";

export namespace List {
	export type foldRight<
		f extends Fn<[unknown, unknown]>,
		l extends unknown[],
		acc,
	> = l extends [...infer head, infer tail]
		? foldRight<f, head, Fn.call<f, [tail, acc]>>
		: acc;

	interface minFn<lt extends Fn<[unknown, unknown], boolean>>
		extends Fn<[unknown, unknown], unknown> {
		return: Fn.call<lt, this["arg"]> extends true
			? this["arg"][0]
			: this["arg"][1];
	}
	export type min<
		l extends unknown[],
		lt extends Fn<[unknown, unknown], boolean>,
	> = l extends [...infer head, infer tail]
		? foldRight<minFn<lt>, head, tail>
		: unknown;

	export type filterMap<f extends Fn, l extends unknown[]> = l extends [
		infer head,
		...infer tail,
	]
		? Fn.call<f, head> extends infer result
			? unknown extends result
				? filterMap<f, tail>
				: [result, ...filterMap<f, tail>]
			: never
		: [];

	export type map<f extends Fn, l extends unknown[]> = l extends [
		infer head,
		...infer tail,
	]
		? [Fn.call<f, head>, ...map<f, tail>]
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
