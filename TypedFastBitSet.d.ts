// Type definitions for TypedFastBitSet 0.2
// Project: https://github.com/lemire/TypedFastBitSet.js#readme
// Definitions by: Tom Varley <https://github.com/tomvarley>


declare class TypedFastBitSet {
    constructor(iterable?: number[]);

    /** Add the value (Set the bit at `index` to `true`) */
    add(index: number): void;

    /** Set bits from start (inclusive) to end (exclusive) */
    addRange(start: number, end: number): void;

    /** Return an array with the set bit locations (values) */
    array(): number[];

    /** Computes change between bitsets, current bitmap is modified */
    change(otherbitmap: TypedFastBitSet): TypedFastBitSet;

    /** Computes size of change between this bitset and another one */
    change_size(otherbitmap: TypedFastBitSet): number;

    /**
     * Tries to add the value (Set the bit at `index` to `true`), returns `1` if the
     * value was added, returns `0` if the value was already present
     */
    checkedAdd(index: number): 1 | 0;

    /** Remove all values, reset memory usage */
    clear(): void;

    /** Creates a copy of this bitmap */
    clone(): TypedFastBitSet;

    /**
     * Computes the difference between this bitset and another one,
     * the current bitset is modified (and returned by the function)
     */
    difference(otherbitmap: TypedFastBitSet): TypedFastBitSet;

    /**
     * Computes the difference between this bitset and another one,
     * the other bitset is modified (and returned by the function)
     */
    difference2(otherbitmap: TypedFastBitSet): TypedFastBitSet;

    /** Computes the size of the difference between this bitset and another one */
    difference_size(otherbitmap: TypedFastBitSet): number;

    /**
     * Computes the intersection between this bitset and another one,
     * the current bitmap is modified
     */
    equals(otherbitmap: TypedFastBitSet): boolean;

    /** If the value was not in the set, add it, otherwise remove it (flip bit at `index`) */
    flip(index: number): void;

    /** Return an array with the set bit locations (values) */
    forEach(fnc: (index: number) => void): void;

    /** fast function to compute the Hamming weight of a 32-bit unsigned integer */
    hammingWeight(v: number): number;

    /** fast function to compute the Hamming weight of four 32-bit unsigned integers */
    hammingWeight4(v1: number, v2: number, v3: number, v4: number): number;

    /** Is the value contained in the set? Is the bit at `index` `true` or `false`? */
    has(index: number): boolean;

    /**
     * Check if this bitset intersects with another one,
     * no bitmap is modified
     */
    intersects(otherbitmap: TypedFastBitSet): boolean;

    /**
     * Computes the intersection between this bitset and another one,
     * the current bitmap is modified  (and returned by the function)
     */
    intersection(otherbitmap: TypedFastBitSet): TypedFastBitSet;

    /** Computes the size of the intersection between this bitset and another one */
    intersection_size(otherbitmap: TypedFastBitSet): number;

    /** Return `true` if no bit is set */
    isEmpty(index: number): boolean;

    /** Computes change between bitsets, a new bitset is generated */
    new_change(otherbitmap: TypedFastBitSet): TypedFastBitSet;

    /**
     * Computes the intersection between this bitset and another one,
     * a new bitmap is generated
     */
    new_intersection(otherbitmap: TypedFastBitSet): TypedFastBitSet;

    /**
     * Computes the difference between this bitset and another one,
     * a new bitmap is generated
     */
    new_difference(otherbitmap: TypedFastBitSet): TypedFastBitSet;

    new_union(otherbitmap: TypedFastBitSet): TypedFastBitSet;

    /** Set the bit at `index` to `false` */
    remove(index: number): void;

    /** Remove bits from start (inclusive) to end (exclusive) */
    removeRange(start: number, end: number): void;

    /** Resize the bitset so that we can write a value at `index` */
    resize(index: number): void;

    /** How many values stored in the set? How many set bits? */
    size(): number;

    /** Returns a string representation */
    toString(): string;

    /** Reduce the memory usage to a minimum */
    trim(): void;

    /**
     * Computes the union between this bitset and another one,
     * the current bitset is modified (and returned by the function)
     */
    union(otherbitmap: TypedFastBitSet): TypedFastBitSet;

    /** Computes the size union between this bitset and another one */
    union_size(otherbitmap: TypedFastBitSet): number;
}

export = TypedFastBitSet;
