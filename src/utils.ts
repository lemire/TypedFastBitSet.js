// fast function to compute the Hamming weight of a 32-bit unsigned integer
export function hammingWeight(v: number) {
  v -= (v >>> 1) & 0x55555555; // works with signed or unsigned shifts
  v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
  return (((v + (v >>> 4)) & 0xf0f0f0f) * 0x1010101) >>> 24;
}

// fast function to compute the Hamming weight of four 32-bit unsigned integers
export function hammingWeight4(v1: number, v2: number, v3: number, v4: number) {
  v1 -= (v1 >>> 1) & 0x55555555; // works with signed or unsigned shifts
  v2 -= (v2 >>> 1) & 0x55555555; // works with signed or unsigned shifts
  v3 -= (v3 >>> 1) & 0x55555555; // works with signed or unsigned shifts
  v4 -= (v4 >>> 1) & 0x55555555; // works with signed or unsigned shifts

  v1 = (v1 & 0x33333333) + ((v1 >>> 2) & 0x33333333);
  v2 = (v2 & 0x33333333) + ((v2 >>> 2) & 0x33333333);
  v3 = (v3 & 0x33333333) + ((v3 >>> 2) & 0x33333333);
  v4 = (v4 & 0x33333333) + ((v4 >>> 2) & 0x33333333);

  v1 = (v1 + (v1 >>> 4)) & 0xf0f0f0f;
  v2 = (v2 + (v2 >>> 4)) & 0xf0f0f0f;
  v3 = (v3 + (v3 >>> 4)) & 0xf0f0f0f;
  v4 = (v4 + (v4 >>> 4)) & 0xf0f0f0f;
  return ((v1 + v2 + v3 + v4) * 0x1010101) >>> 24;
}

export interface BitSet {
  get words(): Uint32Array;

  /**
   * Returns a new TypedFastBitset given a Uint32Array of words
   */

  /** Add the value (Set the bit at `index` to `true`) */
  add(index: number): void;

  /** Set bits from start (inclusive) to end (exclusive) */
  addRange(start: number, end: number): void;

  /** Return an array with the set bit locations (values) */
  array(): number[];

  /** Computes change between bitsets, current bitmap is modified */
  change(otherbitmap: BitSet): BitSet;

  /** Computes size of change between this bitset and another one */
  change_size(otherbitmap: BitSet): number;

  /**
   * Tries to add the value (Set the bit at `index` to `true`), returns `1` if the
   * value was added, returns `0` if the value was already present
   */
  checkedAdd(index: number): 1 | 0;

  /** Remove all values, reset memory usage */
  clear(): void;

  /** Creates a copy of this bitmap */
  clone(): BitSet;

  /**
   * Computes the difference between this bitset and another one,
   * the current bitset is modified (and returned by the function)
   */
  difference(otherbitmap: BitSet): BitSet;

  /**
   * Computes the difference between this bitset and another one,
   * the other bitset is modified (and returned by the function)
   */
  difference2(otherbitmap: BitSet): BitSet;

  /** Computes the size of the difference between this bitset and another one */
  difference_size(otherbitmap: BitSet): number;

  /**
   * Computes the intersection between this bitset and another one,
   * the current bitmap is modified
   */
  equals(otherbitmap: BitSet): boolean;

  /** If the value was not in the set, add it, otherwise remove it (flip bit at `index`) */
  flip(index: number): void;

  /** Call a function with the set bit locations (values) */
  forEach(fnc: (index: number) => void): void;

  /** Iterate over the set bit locations */
  [Symbol.iterator](): IterableIterator<number>;

  /** Is the value contained in the set? Is the bit at `index` `true` or `false`? */
  has(index: number): boolean;

  /**
   * Check if this bitset intersects with another one,
   * no bitmap is modified
   */
  intersects(otherbitmap: BitSet): boolean;

  /**
   * Computes the intersection between this bitset and another one,
   * the current bitmap is modified  (and returned by the function)
   */
  intersection(otherbitmap: BitSet): BitSet;

  /** Computes the size of the intersection between this bitset and another one */
  intersection_size(otherbitmap: BitSet): number;

  /** Return `true` if no bit is set */
  isEmpty(): boolean;

  /** Computes change between bitsets, a new bitset is generated */
  new_change(otherbitmap: BitSet): BitSet;

  /**
   * Computes the intersection between this bitset and another one,
   * a new bitmap is generated
   */
  new_intersection(otherbitmap: BitSet): BitSet;

  /**
   * Computes the difference between this bitset and another one,
   * a new bitmap is generated
   */
  new_difference(otherbitmap: BitSet): BitSet;

  new_union(otherbitmap: BitSet): BitSet;

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
  union(otherbitmap: BitSet): BitSet;

  /** Computes the size union between this bitset and another one */
  union_size(otherbitmap: BitSet): number;
}
