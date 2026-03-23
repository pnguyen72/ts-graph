export interface Fn<arg = unknown, ret = unknown> {
	arg: arg;
	return: ret;
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
