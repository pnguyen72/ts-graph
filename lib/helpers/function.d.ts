export interface Fn<Arg = unknown, Return = unknown> {
	arg: Arg;
	return: Return;
}

export namespace Fn {
	export type call<f extends Fn, arg> = (f & { arg: arg })["return"];

	export type pipe<acc, fs extends Fn[]> = fs extends [
		infer head extends Fn,
		...infer tail extends Fn[],
	]
		? pipe<call<head, acc>, tail>
		: acc;
}
