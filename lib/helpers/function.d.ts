export interface Fn<arg = unknown, ret = unknown> {
	arg: arg;
	return: ret;
}

export namespace Fn {
	export type call<f extends Fn, arg> = (f & { arg: arg })["return"];
}
