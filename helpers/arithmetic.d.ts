type Number<
	n extends number,
	acc extends unknown[] = [],
> = n extends acc["length"] ? acc : Number<n, [...acc, acc["length"]]>;

export type minus<a extends number, b extends number> =
	Number<a> extends [...Number<b>, ...infer rest] ? rest["length"] : unknown;

export type plus<a extends number, b extends number> = [
	...Number<a>,
	...Number<b>,
]["length"];

export type lt<a extends number, b extends number> =
	minus<a, b> extends number ? false : true;
