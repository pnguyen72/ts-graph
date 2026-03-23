import type { Fn } from "./function.d.ts";

export namespace List {
	export type foldRight<
		f extends Fn<[unknown, unknown]>,
		l extends unknown[],
		acc,
	> = l extends [...infer head, infer tail]
		? foldRight<f, head, Fn.call<f, [tail, acc]>>
		: acc;

	export type min<
		lt extends Fn<[unknown, unknown], boolean>,
		l extends unknown[],
	> = l extends [infer singleton]
		? singleton
		: l extends [infer first, infer second, ...infer rest]
			? min<
					lt,
					[Fn.call<lt, [first, second]> extends true ? first : second, ...rest]
				>
			: unknown;

	export interface filterMap<f extends Fn> extends Fn {
		return: this["arg"] extends [infer head, ...infer tail]
			? Fn.call<f, head> extends infer fHead
				? unknown extends fHead
					? Fn.call<filterMap<f>, tail>
					: [fHead, ...Fn.call<filterMap<f>, tail>]
				: never
			: [];
	}

	export interface map<f extends Fn> extends Fn<unknown[], unknown[]> {
		return: this["arg"] extends [infer head, ...infer tail]
			? [Fn.call<f, head>, ...Fn.call<map<f>, tail>]
			: [];
	}

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
