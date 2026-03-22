/*
 * https://github.com/hackle/blog-rust/blob/master/sample/typescript-union-to-tuple-array
 */

export type toList<u> = [u] extends [never]
	? []
	: pickOne<u> extends infer last
		? Exclude<u, last> extends never
			? [last]
			: [...toList<Exclude<u, last>>, last]
		: never;

type pickOne<T> = inferContra<inferContra<contra<contra<T>>>>;

type contra<T> = T extends T ? (arg: T) => void : never;

type inferContra<T> = [T] extends [(arg: infer I) => void] ? I : never;
