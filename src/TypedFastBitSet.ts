/**
 * TypedFastBitSet.js : a fast bit set implementation in JavaScript.
 * (c) the authors
 * Licensed under the Apache License, Version 2.0.
 *
 * Speed-optimized BitSet implementation for modern browsers and JavaScript engines.
 *
 * A BitSet is an ideal data structure to implement a Set when values being stored are
 * reasonably small integers. It can be orders of magnitude faster than a generic set implementation.
 * The FastBitSet implementation optimizes for speed, leveraging commonly available features
 * like typed arrays.
 *
 * Simple usage :
 *  const b = new TypedFastBitSet();// initially empty
 *         // will throw exception if typed arrays are not supported
 *  b.add(1);// add the value "1"
 *  b.has(1); // check that the value is present! (will return true)
 *  b.add(2);
 *  console.log(""+b);// should display {1,2}
 *  b.add(10);
 *  b.array(); // would return [1,2,10]
 *
 *  let c = new FastBitSet([1,2,3,10]); // create bitset initialized with values 1,2,3,10
 *  c.difference(b); // from c, remove elements that are in b (modifies c)
 *  c.difference2(b); // from c, remove elements that are in b (modifies b)
 *  c.change(b); // c will contain elements that are in b or in c, but not both
 *  const su = c.union_size(b);// compute the size of the union (bitsets are unchanged)
 *  c.union(b); // c will contain all elements that are in c and b
 *  const s1 = c.intersection_size(b);// compute the size of the intersection (bitsets are unchanged)
 *  c.intersection(b); // c will only contain elements that are in both c and b
 *  c = b.clone(); // create a (deep) copy of b and assign it to c.
 *  c.equals(b); // check whether c and b are equal
 *
 *   See README.md file for a more complete description.
 *
 * You can install the library under node with the command line
 *   npm install typedfastbitset
 */

import { BitSet } from "./utils";

// Local copies of hammingWeight to avoid module import indirection
// (V8 inlines local functions much better than (0, module.fn)() calls)
function hammingWeight(v: number) {
  v -= (v >>> 1) & 0x55555555;
  v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
  return (((v + (v >>> 4)) & 0xf0f0f0f) * 0x1010101) >>> 24;
}

function hammingWeight4(v1: number, v2: number, v3: number, v4: number) {
  v1 -= (v1 >>> 1) & 0x55555555;
  v2 -= (v2 >>> 1) & 0x55555555;
  v3 -= (v3 >>> 1) & 0x55555555;
  v4 -= (v4 >>> 1) & 0x55555555;

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

// Get the logical word count of a BitSet.
// TypedFastBitSet tracks _count separately from words.length;
// other BitSet implementations use words.length directly.
function wc(bitmap: BitSet): number {
  return (bitmap as any)._count ?? bitmap.words.length;
}

function isIterable(
  obj: Iterable<number> | null | undefined,
): obj is Iterable<number> {
  if (obj) {
    return obj[Symbol.iterator] !== undefined;
  }
  return false;
}

/**
 * you can provide an iterable
 * an exception is thrown if typed arrays are not supported
 */
export class TypedFastBitSet implements BitSet {
  public words: Uint32Array;
  // Logical word count. May be less than words.length due to buffer overallocation.
  // Words beyond _count are guaranteed to be zero.
  _count: number;

  constructor(iterable?: Iterable<number> | null, words?: Uint32Array) {
    if (words) {
      this.words = words;
      this._count = words.length;
    } else {
      this.words = new Uint32Array(8);
      this._count = 0;
    }
    if (isIterable(iterable)) {
      for (const key of iterable) {
        this.add(key);
      }
    }
  }

  /**
   * @returns a new TypedFastBitset given a Uint32Array of words
   */
  static fromWords(words: Uint32Array): TypedFastBitSet {
    return new TypedFastBitSet(undefined, words);
  }

  /**
   * Add the value (Set the bit at index to true)
   */
  add(index: number): void {
    this.resize(index);
    this.words[index >>> 5] |= 1 << index;
  }

  /**
   *  If the value was not in the set, add it, otherwise remove it (flip bit at index)
   */
  flip(index: number): void {
    this.resize(index);
    this.words[index >>> 5] ^= 1 << index;
  }

  /**
   * Remove all values, reset memory usage
   */
  clear(): void {
    this.words = new Uint32Array(8);
    this._count = 0;
  }

  /**
   * Set the bit at index to false
   */
  remove(index: number): void {
    this.resize(index);
    this.words[index >>> 5] &= ~(1 << index);
  }

  /**
   * Set bits from start (inclusive) to end (exclusive)
   */
  addRange(start: number, end: number): void {
    if (start >= end) {
      return;
    }

    if (this._count << 5 <= end) {
      this.resize(end);
    }
    const words = this.words;

    const firstword = start >> 5;
    const endword = (end - 1) >> 5;

    if (firstword === endword) {
      words[firstword] |= (~0 << start) & (~0 >>> -end);
      return;
    }
    words[firstword] |= ~0 << start;
    words.fill(~0, firstword + 1, endword);
    words[endword] |= ~0 >>> -end;
  }

  /**
   * Remove bits from start (inclusive) to end (exclusive)
   */
  removeRange(start: number, end: number): void {
    const words = this.words;
    start = Math.min(start, (this._count << 5) - 1);
    end = Math.min(end, (this._count << 5) - 1);

    if (start >= end) {
      return;
    }
    const firstword = start >> 5;
    const endword = (end - 1) >> 5;

    if (firstword === endword) {
      words[firstword] &= ~((~0 << start) & (~0 >>> -end));
      return;
    }
    words[firstword] &= ~(~0 << start);
    words.fill(0, firstword + 1, endword);
    words[endword] &= ~(~0 >>> -end);
  }

  /**
   * @returns true if no bit is set
   */
  isEmpty(): boolean {
    const words = this.words;
    const c = this._count;
    for (let i = 0; i < c; i++) {
      if (words[i] !== 0) return false;
    }
    return true;
  }

  /**
   * Is the value contained in the set? Is the bit at index true or false?
   */
  has(index: number): boolean {
    return (this.words[index >>> 5] & (1 << index)) !== 0;
  }

  /**
   * Is any value of the (exclusive) range contained in the set?
   */
  hasAnyInRange(start: number, end: number): boolean {
    if (start >= end) return false;
    const words = this.words;
    start = Math.min(start, (this._count << 5) - 1);
    end = Math.min(end, (this._count << 5) - 1);
    const firstword = start >>> 5;
    const endword = (end - 1) >> 5;
    if (firstword === endword)
      return (words[firstword] & ((~0 << start) & (~0 >>> -end))) !== 0;
    if ((words[firstword] & (~0 << start)) !== 0) return true;
    for (let index = firstword + 1; index < endword - 1; index++)
      if (words[index] !== 0) return true;
    return (words[endword] & (~0 >>> -end)) !== 0;
  }

  /**
   * Tries to add the value (Set the bit at index to true)
   *
   * @returns 1 if the value was added, 0 if the value was already present
   */
  checkedAdd(index: number): 0 | 1 {
    this.resize(index);
    const words = this.words;
    const word = words[index >>> 5];
    const newword = word | (1 << index);
    words[index >>> 5] = newword;
    return ((newword ^ word) >>> index) as 0 | 1;
  }

  /**
   * Reduce the memory usage to a minimum
   */
  trim(): void {
    let nl = this._count;
    while (nl > 0 && this.words[nl - 1] === 0) {
      nl--;
    }
    this._count = nl;
    if (nl < this.words.length) {
      const newWords = new Uint32Array(nl);
      newWords.set(this.words.subarray(0, nl));
      this.words = newWords;
    }
  }

  /**
   * Resize the bitset so that we can write a value at index.
   * The underlying buffer may be overallocated for amortized growth,
   * but _count always reflects the exact logical word count.
   */
  resize(index: number): void {
    if (this._count << 5 > index) return;
    const count = (index + 32) >>> 5;
    if (count <= this.words.length) {
      // Buffer has room — just update logical count
      this._count = count;
    } else {
      // Need a bigger buffer — 4x overallocation for amortized growth
      let newCapacity = count;
      if (newCapacity << 1 > newCapacity) {
        newCapacity <<= 1;
      }
      newCapacity <<= 1;
      const newWords = new Uint32Array(newCapacity);
      newWords.set(this.words.subarray(0, this._count));
      this.words = newWords;
      this._count = count;
    }
  }

  /**
   * Resize the bitset to a specific size.
   * This does not overallocate memory.
   */
  resizeTo(size: number): void {
    const needed = (size + 31) >>> 5;
    if (this._count >= needed) return;
    if (needed <= this.words.length) {
      this._count = needed;
    } else {
      const newWords = new Uint32Array(needed);
      newWords.set(this.words.subarray(0, this._count));
      this.words = newWords;
      this._count = needed;
    }
  }

  /**
   * @returns How many values stored in the set? How many set bits?
   */
  size(): number {
    const words = this.words;
    let answer = 0;
    const c = this._count;
    let k = 0 | 0;
    for (; k + 4 < c; k += 4) {
      answer += hammingWeight4(
        words[k] | 0,
        words[k + 1] | 0,
        words[k + 2] | 0,
        words[k + 3] | 0,
      );
    }

    for (; k < c; ++k) {
      answer += hammingWeight(words[k] | 0);
    }
    return answer;
  }

  /**
   * @returns an array with the set bit locations (values)
   */
  array(): number[] {
    const words = this.words;
    const answer: number[] = new Array(this.size());
    let pos = 0 | 0;
    const c = this._count;
    for (let k = 0; k < c; ++k) {
      let w = words[k];
      while (w != 0) {
        answer[pos++] = (k << 5) + (31 - Math.clz32(w & -w));
        w &= w - 1;
      }
    }
    return answer;
  }

  forEach(fnc: (id: number) => void): void {
    const words = this.words;
    const c = this._count;
    for (let k = 0; k < c; ++k) {
      let w = words[k];
      while (w != 0) {
        fnc((k << 5) + (31 - Math.clz32(w & -w)));
        w &= w - 1;
      }
    }
  }

  /**
   * Iterator of set bit locations (values)
   */
  [Symbol.iterator](): IterableIterator<number> {
    const words = this.words;
    const c = this._count;
    let k = 0;
    let w = k < c ? words[k] : 0;

    return {
      [Symbol.iterator]() {
        return this;
      },
      next() {
        while (k < c) {
          if (w !== 0) {
            const value = (k << 5) + (31 - Math.clz32(w & -w));
            w &= w - 1;
            return { done: false, value };
          } else {
            k++;
            if (k < c) {
              w = words[k];
            }
          }
        }
        return { done: true, value: undefined };
      },
    };
  }

  /**
   * @returns a copy of this bitmap
   */
  clone(): TypedFastBitSet {
    return TypedFastBitSet.fromWords(this.words.slice(0, this._count));
  }

  /**
   * Check if this bitset intersects with another one,
   * no bitmap is modified
   */
  intersects(otherbitmap: BitSet): boolean {
    const words = this.words;
    const otherWords = otherbitmap.words;
    const newcount = Math.min(this._count, wc(otherbitmap));
    for (let k = 0 | 0; k < newcount; ++k) {
      if ((words[k] & otherWords[k]) !== 0) return true;
    }
    return false;
  }

  /**
   * Computes the intersection between this bitset and another one,
   * the current bitmap is modified (and returned by the function)
   */
  intersection(otherbitmap: BitSet): this {
    const words = this.words;
    const otherWords = otherbitmap.words;
    const oc = wc(otherbitmap);
    const newcount = Math.min(this._count, oc);
    let k = 0 | 0;
    for (; k + 7 < newcount; k += 8) {
      words[k] &= otherWords[k];
      words[k + 1] &= otherWords[k + 1];
      words[k + 2] &= otherWords[k + 2];
      words[k + 3] &= otherWords[k + 3];
      words[k + 4] &= otherWords[k + 4];
      words[k + 5] &= otherWords[k + 5];
      words[k + 6] &= otherWords[k + 6];
      words[k + 7] &= otherWords[k + 7];
    }
    for (; k < newcount; ++k) {
      words[k] &= otherWords[k];
    }
    for (k = newcount; k < this._count; ++k) {
      words[k] = 0;
    }
    this._count = newcount;
    return this;
  }

  /**
   * Computes the size of the intersection between this bitset and another one
   */
  intersection_size(otherbitmap: BitSet): number {
    const words = this.words;
    const otherWords = otherbitmap.words;
    const newcount = Math.min(this._count, wc(otherbitmap));
    let answer = 0 | 0;
    for (let k = 0 | 0; k < newcount; ++k) {
      answer += hammingWeight(words[k] & otherWords[k]);
    }
    return answer;
  }

  /**
   * Computes the intersection between this bitset and another one,
   * a new bitmap is generated
   */
  new_intersection(otherbitmap: BitSet): TypedFastBitSet {
    const words = this.words;
    const otherWords = otherbitmap.words;

    const count = Math.min(this._count, wc(otherbitmap));
    const newWords = new Uint32Array(count);
    let k = 0 | 0;
    for (; k + 7 < count; k += 8) {
      newWords[k] = words[k] & otherWords[k];
      newWords[k + 1] = words[k + 1] & otherWords[k + 1];
      newWords[k + 2] = words[k + 2] & otherWords[k + 2];
      newWords[k + 3] = words[k + 3] & otherWords[k + 3];
      newWords[k + 4] = words[k + 4] & otherWords[k + 4];
      newWords[k + 5] = words[k + 5] & otherWords[k + 5];
      newWords[k + 6] = words[k + 6] & otherWords[k + 6];
      newWords[k + 7] = words[k + 7] & otherWords[k + 7];
    }
    for (; k < count; ++k) {
      newWords[k] = words[k] & otherWords[k];
    }
    return new TypedFastBitSet(undefined, newWords);
  }

  /**
   * Computes the intersection between this bitset and another one,
   * the current bitmap is modified
   */
  equals(otherbitmap: BitSet): boolean {
    const words = this.words;
    const otherWords = otherbitmap.words;
    const tc = this._count;
    const oc = wc(otherbitmap);
    const mcount = Math.min(tc, oc);
    for (let k = 0 | 0; k < mcount; ++k) {
      if (words[k] != otherWords[k]) return false;
    }
    if (tc < oc) {
      for (let k = tc; k < oc; ++k) {
        if (otherWords[k] != 0) return false;
      }
    } else if (oc < tc) {
      for (let k = oc; k < tc; ++k) {
        if (words[k] != 0) return false;
      }
    }
    return true;
  }

  /**
   * Computes the difference between this bitset and another one,
   * the current bitset is modified (and returned by the function)
   */
  difference(otherbitmap: BitSet): this {
    const words = this.words;
    const otherWords = otherbitmap.words;
    const newcount = Math.min(this._count, wc(otherbitmap));
    let k = 0 | 0;
    for (; k + 7 < newcount; k += 8) {
      words[k] &= ~otherWords[k];
      words[k + 1] &= ~otherWords[k + 1];
      words[k + 2] &= ~otherWords[k + 2];
      words[k + 3] &= ~otherWords[k + 3];
      words[k + 4] &= ~otherWords[k + 4];
      words[k + 5] &= ~otherWords[k + 5];
      words[k + 6] &= ~otherWords[k + 6];
      words[k + 7] &= ~otherWords[k + 7];
    }
    for (; k < newcount; ++k) {
      words[k] &= ~otherWords[k];
    }
    return this;
  }

  /**
   * Computes the difference between this bitset and another one,
   * the other bitset is modified (and returned by the function)
   *
   * (for this set A and other set B, this computes B = A - B  and returns B)
   */
  difference2(otherbitmap: BitSet): BitSet {
    const tc = this._count;
    const mincount = Math.min(tc, wc(otherbitmap));
    otherbitmap.resizeTo((tc << 5) - 1);

    const words = this.words;
    const otherWords = otherbitmap.words;
    let k = 0 | 0;
    for (; k + 7 < mincount; k += 8) {
      otherWords[k] = words[k] & ~otherWords[k];
      otherWords[k + 1] = words[k + 1] & ~otherWords[k + 1];
      otherWords[k + 2] = words[k + 2] & ~otherWords[k + 2];
      otherWords[k + 3] = words[k + 3] & ~otherWords[k + 3];
      otherWords[k + 4] = words[k + 4] & ~otherWords[k + 4];
      otherWords[k + 5] = words[k + 5] & ~otherWords[k + 5];
      otherWords[k + 6] = words[k + 6] & ~otherWords[k + 6];
      otherWords[k + 7] = words[k + 7] & ~otherWords[k + 7];
    }
    for (; k < mincount; ++k) {
      otherWords[k] = words[k] & ~otherWords[k];
    }
    // remaining words are all part of difference
    for (; k < tc; ++k) {
      otherWords[k] = words[k];
    }
    // zero beyond this bitmap's logical extent
    const oc = wc(otherbitmap);
    for (let j = tc; j < oc; ++j) {
      otherWords[j] = 0;
    }
    return otherbitmap;
  }

  /**
   * Computes the difference between this bitset and another one,
   * a new bitmap is generated
   */
  new_difference(otherbitmap: BitSet): TypedFastBitSet {
    return this.clone().difference(otherbitmap); // should be fast enough
  }

  /**
   * Computes the size of the difference between this bitset and another one
   */
  difference_size(otherbitmap: BitSet): number {
    const words = this.words;
    const otherWords = otherbitmap.words;
    const newcount = Math.min(this._count, wc(otherbitmap));
    let answer = 0 | 0;
    let k = 0 | 0;
    for (; k < newcount; ++k) {
      answer += hammingWeight(words[k] & ~otherWords[k]);
    }
    const c = this._count;
    for (; k < c; ++k) {
      answer += hammingWeight(words[k]);
    }
    return answer;
  }

  /**
   * Computes the changed elements (XOR) between this bitset and another one,
   * the current bitset is modified (and returned by the function)
   */
  change(otherbitmap: BitSet): this {
    const otherWords = otherbitmap.words;
    const oc = wc(otherbitmap);
    const mincount = Math.min(this._count, oc);
    this.resizeTo((oc << 5) - 1);
    const words = this.words;
    let k = 0 | 0;
    for (; k + 7 < mincount; k += 8) {
      words[k] ^= otherWords[k];
      words[k + 1] ^= otherWords[k + 1];
      words[k + 2] ^= otherWords[k + 2];
      words[k + 3] ^= otherWords[k + 3];
      words[k + 4] ^= otherWords[k + 4];
      words[k + 5] ^= otherWords[k + 5];
      words[k + 6] ^= otherWords[k + 6];
      words[k + 7] ^= otherWords[k + 7];
    }
    for (; k < mincount; ++k) {
      words[k] ^= otherWords[k];
    }
    // remaining words are all part of change
    for (; k < oc; ++k) {
      words[k] = otherWords[k];
    }
    return this;
  }

  /**
   * Computes the change between this bitset and another one,
   * a new bitmap is generated
   */
  new_change(otherbitmap: BitSet): TypedFastBitSet {
    const words = this.words;
    const otherWords = otherbitmap.words;
    const tc = this._count;
    const oc = wc(otherbitmap);
    const count = Math.max(tc, oc);
    const newWords = new Uint32Array(count);
    const mcount = Math.min(tc, oc);
    let k = 0;
    for (; k + 7 < mcount; k += 8) {
      newWords[k] = words[k] ^ otherWords[k];
      newWords[k + 1] = words[k + 1] ^ otherWords[k + 1];
      newWords[k + 2] = words[k + 2] ^ otherWords[k + 2];
      newWords[k + 3] = words[k + 3] ^ otherWords[k + 3];
      newWords[k + 4] = words[k + 4] ^ otherWords[k + 4];
      newWords[k + 5] = words[k + 5] ^ otherWords[k + 5];
      newWords[k + 6] = words[k + 6] ^ otherWords[k + 6];
      newWords[k + 7] = words[k + 7] ^ otherWords[k + 7];
    }
    for (; k < mcount; ++k) {
      newWords[k] = words[k] ^ otherWords[k];
    }

    for (k = mcount; k < tc; ++k) {
      newWords[k] = words[k];
    }
    for (k = mcount; k < oc; ++k) {
      newWords[k] = otherWords[k];
    }
    return new TypedFastBitSet(undefined, newWords);
  }

  /**
   * Computes the number of changed elements between this bitset and another one
   */
  change_size(otherbitmap: BitSet): number {
    const words = this.words;
    const otherWords = otherbitmap.words;
    const tc = this._count;
    const oc = wc(otherbitmap);
    const mincount = Math.min(tc, oc);
    let answer = 0 | 0;
    let k = 0 | 0;
    for (; k < mincount; ++k) {
      answer += hammingWeight(words[k] ^ otherWords[k]);
    }
    if (tc > oc) {
      for (; k < tc; ++k) {
        answer += hammingWeight(words[k]);
      }
    } else {
      for (; k < oc; ++k) {
        answer += hammingWeight(otherWords[k]);
      }
    }
    return answer;
  }

  /**
   * @returns a string representation
   */
  toString(): string {
    return "{" + this.array().join(",") + "}";
  }

  /**
   * Computes the union between this bitset and another one,
   * the current bitset is modified  (and returned by the function)
   */
  union(otherbitmap: BitSet): this {
    let words = this.words;
    const otherWords = otherbitmap.words;
    const oc = wc(otherbitmap);
    const mcount = Math.min(this._count, oc);
    let k = 0 | 0;
    for (; k + 7 < mcount; k += 8) {
      words[k] |= otherWords[k];
      words[k + 1] |= otherWords[k + 1];
      words[k + 2] |= otherWords[k + 2];
      words[k + 3] |= otherWords[k + 3];
      words[k + 4] |= otherWords[k + 4];
      words[k + 5] |= otherWords[k + 5];
      words[k + 6] |= otherWords[k + 6];
      words[k + 7] |= otherWords[k + 7];
    }
    for (; k < mcount; ++k) {
      words[k] |= otherWords[k];
    }
    if (this._count < oc) {
      this.resizeTo((oc << 5) - 1);
      words = this.words;
      for (k = mcount; k < oc; ++k) {
        words[k] = otherWords[k];
      }
    }
    return this;
  }

  /**
   * Computes the union between this bitset and another one,
   * a new bitmap is generated
   */
  new_union(otherbitmap: BitSet): TypedFastBitSet {
    const words = this.words;
    const otherWords = otherbitmap.words;
    const tc = this._count;
    const oc = wc(otherbitmap);
    const count = Math.max(tc, oc);
    const newWords = new Uint32Array(count);
    const mcount = Math.min(tc, oc);
    for (let k = 0; k < mcount; ++k) {
      newWords[k] = words[k] | otherWords[k];
    }
    for (let k = mcount; k < tc; ++k) {
      newWords[k] = words[k];
    }
    for (let k = mcount; k < oc; ++k) {
      newWords[k] = otherWords[k];
    }
    return new TypedFastBitSet(undefined, newWords);
  }

  /**
   * Computes the size union between this bitset and another one
   */
  union_size(otherbitmap: BitSet): number {
    const words = this.words;
    const otherWords = otherbitmap.words;
    const tc = this._count;
    const oc = wc(otherbitmap);
    const mcount = Math.min(tc, oc);
    let answer = 0 | 0;
    for (let k = 0 | 0; k < mcount; ++k) {
      answer += hammingWeight(words[k] | otherWords[k]);
    }
    if (tc < oc) {
      for (let k = tc; k < oc; ++k) {
        answer += hammingWeight(otherWords[k] | 0);
      }
    } else {
      for (let k = oc; k < tc; ++k) {
        answer += hammingWeight(words[k] | 0);
      }
    }
    return answer;
  }
}
