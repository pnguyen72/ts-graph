import type { call, Fn } from "./function.d.ts";

export type foldRight<
	f extends Fn<[unknown, unknown]>,
	arr extends unknown[],
	acc,
> = arr extends [...infer rest, infer last]
	? foldRight<f, rest, call<f, [last, acc]>>
	: acc;

interface minFn<lt extends Fn<[unknown, unknown], boolean>>
	extends Fn<[unknown, unknown], unknown> {
	return: call<lt, this["arg"]> extends true ? this["arg"][0] : this["arg"][1];
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
	? call<f, head> extends infer result
		? result extends never
			? filterMap<f, tail>
			: [result, ...filterMap<f, tail>]
		: never
	: [];

export type map<f extends Fn, arr extends unknown[]> = arr extends [
	infer head,
	...infer tail,
]
	? [call<f, head>, ...map<f, tail>]
	: [];
