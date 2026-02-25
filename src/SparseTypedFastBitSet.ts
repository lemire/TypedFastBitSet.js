/**
 * TypedFastBitSet.js : a fast bit set implementation in JavaScript.
 * (c) the authors
 * Licensed under the Apache License, Version 2.0.
 *
 * Speed-optimized BitSet implementation for modern browsers and JavaScript engines.
 *
 * Alternative version to TypedFastBitSet
 * This starts of as storing entries as an array in a Uint32Array Typed Array
 * The largest set value is first in the array. Everything else has no defined order
 * The largest set value is used when converting into a bitset to correctly size new Array
 * Once more than 256 entries have been added structure will convert to a bitset if it will create a smaller array
 * Very sparse data will remain an array until 1024 entries where it will convert to a bitset
 */

import { BitSet, hammingWeight, hammingWeight4 } from "./utils";

enum Type {
  ARRAY,
  BITSET,
  MIXED,
}
interface ArrayOrderResponse {
  first: SparseTypedFastBitSet;
  second: SparseTypedFastBitSet;
  type: Type.ARRAY;
}

interface BitsetOrderResponse {
  first: BitSet;
  second: BitSet;
  type: Type.BITSET;
}

interface MixedOrderResponse {
  first: SparseTypedFastBitSet;
  second: BitSet;
  type: Type.MIXED;
}

type OrderResponse =
  | ArrayOrderResponse
  | BitsetOrderResponse
  | MixedOrderResponse;

function isIterable(
  obj: Iterable<number> | null | undefined
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
export class SparseTypedFastBitSet implements BitSet {
  // -1 means we are bitset
  private arraySize = 0;

  get words() {
    if (this.arraySize !== -1) {
      this.data = this.toBitset();
      this.arraySize = -1;
    }
    return this.data;
  }

  constructor(
    iterable?: Iterable<number> | null,
    private data = new Uint32Array(8)
  ) {
    if (isIterable(iterable)) {
      for (const key of iterable) {
        this.add(key);
      }
    }
  }

  private toBitset(): Uint32Array {
    const array = this.data;
    // currently converts its internal type to bitset
    const count = (array[0] + 32) >>> 5;
    const newWords = new Uint32Array(count << 1);
    for (let i = 0; i < this.arraySize; i++) {
      const add = array[i];
      newWords[add >>> 5] |= 1 << add;
    }

    return newWords;
  }

  /**
   * Add the value (Set the bit at index to true)
   */
  add(index: number): void {
    const type = this.resize(index);
    if (type === Type.ARRAY) {
      const array = this.data;

      // zero will match the fill value so make sure match is within set area
      // store biggest index first just for resize help
      if (this.arraySize === 0) {
        array[this.arraySize++] = index;
        return;
      }
      const offset = array.indexOf(index);
      if (offset === -1 || offset >= this.arraySize) {
        const biggest = array[0];
        if (index > biggest) {
          array[0] = index;
          array[this.arraySize++] = biggest;
        } else {
          array[this.arraySize++] = index;
        }
      }
    } else {
      this.data[index >>> 5] |= 1 << index;
    }
  }

  /**
   * If the value was not in the set, add it, otherwise remove it (flip bit at index)
   */
  flip(index: number): void {
    const type = this.resize(index);
    if (type === Type.ARRAY) {
      const array = this.data;
      const arrayIndex = array.indexOf(index);
      if (arrayIndex === -1) {
        if (this.arraySize > 0 && index > array[0]) {
          array[this.arraySize++] = array[0];
          array[0] = index;
        } else {
          array[this.arraySize++] = index;
        }
      } else {
        if (arrayIndex === 0 && this.arraySize > 1) {
          // removing our largest marker need to find next largest
          let largest = array[1];
          let largestIndex = 1;
          for (let i = 2; i < this.arraySize; i++) {
            if (array[i] > largest) {
              largest = array[i];
              largestIndex = i;
            }
          }
          array[0] = array[largestIndex];
          array[largestIndex] = array[--this.arraySize];
        } else {
          array[arrayIndex] = array[--this.arraySize];
        }
      }
    } else {
      this.data[index >>> 5] ^= 1 << index;
    }
  }

  /**
   * Remove all values, reset memory usage
   */
  clear(): void {
    this.arraySize = 0;
    this.data = new Uint32Array(8);
  }

  /**
   * Set the bit at index to false
   */
  remove(index: number): void {
    const type = this.resize(index);
    if (type === Type.ARRAY) {
      const array = this.data;
      const arrayIndex = array.indexOf(index);
      if (arrayIndex !== -1 && arrayIndex < this.arraySize) {
        if (arrayIndex == this.arraySize - 1) {
          this.arraySize--;
        } else if (arrayIndex === 0 && this.arraySize > 1) {
          // removing our largest marker need to find next largest
          let largest = array[1];
          let largestIndex = 1;
          for (let i = 2; i < this.arraySize; i++) {
            if (array[i] > largest) {
              largest = array[i];
              largestIndex = i;
            }
          }
          array[0] = array[largestIndex];
          array[largestIndex] = array[--this.arraySize];
        } else {
          array[arrayIndex] = array[--this.arraySize];
        }
      }
    } else {
      this.data[index >>> 5] &= ~(1 << index);
    }
  }

  /**
   * Set bits from start (inclusive) to end (exclusive)
   */
  addRange(start: number, end: number): void {
    if (start >= end) {
      return;
    }

    const type = this.resize(end, end - start - 1);
    if (type === Type.ARRAY) {
      const array = this.data;

      const biggestAdd = end-- - 1;
      if (this.arraySize === 0) {
        array[this.arraySize++] = biggestAdd;
      } else {
        const offset = array.indexOf(biggestAdd);
        if (offset === -1 || offset >= this.arraySize) {
          const biggest = array[0];

          if (biggestAdd > biggest) {
            array[0] = biggestAdd;
            array[this.arraySize++] = biggest;
          } else {
            array[this.arraySize++] = biggestAdd;
          }
        }
      }
      for (; start < end; start++) {
        const offset = array.indexOf(start);
        if (offset === -1 || offset >= this.arraySize) {
          array[this.arraySize++] = start;
        }
      }
    } else {
      const words = this.data;

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
  }

  /**
   * Remove bits from start (inclusive) to end (exclusive)
   */
  removeRange(start: number, end: number): void {
    if (start >= end) {
      return;
    }

    if (this.arraySize !== -1) {
      const array = this.data;
      let findBiggest = false;
      for (let i = 0; i < this.arraySize; i++) {
        if (array[i] >= start && array[i] < end) {
          if (i === 0) {
            findBiggest = true;
          }
          array[i--] = array[--this.arraySize];
        }
      }
      if (findBiggest && this.arraySize > 1) {
        let largest = array[0];
        let largestIndex = 0;
        for (let i = 1; i < this.arraySize; i++) {
          if (array[i] > largest) {
            largest = array[i];
            largestIndex = i;
          }
        }
        const current = array[0];
        array[0] = array[largestIndex];
        array[largestIndex] = current;
      }
    } else {
      const words = this.data;

      start = Math.min(start, (words.length << 5) - 1);
      end = Math.min(end, (words.length << 5) - 1);

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
  }

  /**
   * @returns true if no bit is set
   */
  isEmpty(): boolean {
    if (this.arraySize === 0) {
      return true;
    }
    if (this.arraySize > 0) {
      return false;
    }
    const words = this.data;
    const c = words.length;
    for (let i = 0; i < c; i++) {
      if (words[i] !== 0) return false;
    }
    return true;
  }

  /**
   * Is the value contained in the set? Is the bit at index true or false?
   */
  has(index: number): boolean {
    if (this.arraySize === -1) {
      return (this.data[index >>> 5] & (1 << index)) !== 0;
    } else {
      const offset = this.data.indexOf(index);
      return offset !== -1 && offset < this.arraySize;
    }
  }

  /**
   * Tries to add the value (Set the bit at index to true)
   *
   * @returns 1 if the value was added, 0 if the value was already present
   */
  checkedAdd(index: number): 1 | 0 {
    const type = this.resize(index);
    if (type === Type.ARRAY) {
      const array = this.data;
      if (this.arraySize === 0) {
        array[this.arraySize++] = index;
        return 1;
      }
      const offset = array.indexOf(index);
      if (offset === -1 || offset >= this.arraySize) {
        const biggest = array[0];
        if (index > biggest) {
          array[0] = index;
          array[this.arraySize++] = biggest;
        } else {
          array[this.arraySize++] = index;
        }
        return 1;
      }
      return 0;
    } else {
      const words = this.data;
      const word = words[index >>> 5];
      const newword = word | (1 << index);
      words[index >>> 5] = newword;
      return ((newword ^ word) >>> index) as 0 | 1;
    }
  }

  /**
   * Reduce the memory usage to a minimum
   */
  trim(): void {
    const size = this.size();
    if (this.arraySize === -1) {
      const words = this.data;
      let nl = words.length;
      while (nl > 0 && words[nl - 1] === 0) {
        nl--;
      }
      // sparse array will be smaller
      if (size < nl) {
        const newArray = new Uint32Array(size);
        let pos = 0 | 0;
        const c = words.length;
        for (let k = 0; k < c; ++k) {
          let w = words[k];
          while (w != 0) {
            const t = w & -w;
            newArray[pos++] = (k << 5) + hammingWeight((t - 1) | 0);
            w ^= t;
          }
        }

        const first = newArray[0];
        newArray[0] = newArray[size - 1];
        newArray[size - 1] = first;

        this.data = newArray;
        this.arraySize = size;
      } else {
        this.data = words.slice(0, nl);
      }
    } else {
      // dense bitset will be smaller
      if (this.arraySize > 0 && this.data[0] >>> 5 < size) {
        const count = (this.data[0] + 32) >>> 5;
        const newWords = new Uint32Array(count);
        for (let i = 0; i < this.arraySize; i++) {
          const add = this.data[i];
          newWords[add >>> 5] |= 1 << add;
        }
        this.data = newWords;
        this.arraySize = -1;
      } else {
        this.data = this.data.slice(0, this.arraySize);
      }
    }
  }

  /**
   * Resize the bitset to a specific size
   */
  resizeTo(size: number): void {
    // Sparse implementation doesn't pre-allocate, so no-op
  }

  /**
   * Resize the bitset so that we can write a value at index
   */
  resize(index: number, capacity = 0): Type.ARRAY | Type.BITSET {
    if (this.arraySize === -1) {
      const words = this.data;
      if (words.length << 5 > index) return Type.BITSET;
      const count = (index + 32) >>> 5; // just what is needed
      const newwords = new Uint32Array(count << 1);
      newwords.set(words); // hopefully, this copy is fast
      this.data = newwords;

      return Type.BITSET;
    } else {
      const array = this.data;
      if (this.arraySize + capacity < array.length) {
        return Type.ARRAY;
      }
      if (array.length + capacity < 256) {
        const newData = new Uint32Array((array.length + capacity) << 1);
        newData.set(array);
        this.data = newData;
        return Type.ARRAY;
      } else {
        const count = (Math.max(array[0], index) + 32) >>> 5;
        // very sparse grow array some more
        if (
          count > array.length + capacity &&
          (array.length + capacity) << 1 < 1024
        ) {
          const newData = new Uint32Array((array.length + capacity) << 1);
          newData.set(array);
          this.data = newData;
          return Type.ARRAY;
        } else {
          const newwords = new Uint32Array(count << 1);
          for (let i = 0; i < this.arraySize; i++) {
            const add = array[i];
            newwords[add >>> 5] |= 1 << add;
          }
          this.arraySize = -1;
          this.data = newwords;

          return Type.BITSET;
        }
      }
    }
  }

  /**
   * How many values stored in the set? How many set bits?
   */
  size(): number {
    if (this.arraySize === -1) {
      const words = this.data;
      let answer = 0;
      const c = words.length;
      let k = 0 | 0;
      for (; k + 4 < c; k += 4) {
        answer += hammingWeight4(
          words[k] | 0,
          words[k + 1] | 0,
          words[k + 2] | 0,
          words[k + 3] | 0
        );
      }

      for (; k < c; ++k) {
        answer += hammingWeight(words[k] | 0);
      }
      return answer;
    } else {
      return this.arraySize;
    }
  }

  /**
   * @returns the set bit locations (values)
   */
  array(): number[] {
    if (this.arraySize === -1) {
      const words = this.data;
      const answer = new Array(this.size());
      let pos = 0 | 0;
      const c = words.length;
      for (let k = 0; k < c; ++k) {
        let w = words[k];
        while (w != 0) {
          const t = w & -w;
          answer[pos++] = (k << 5) + hammingWeight((t - 1) | 0);
          w ^= t;
        }
      }
      return answer;
    } else {
      const array = this.data;
      const answer = new Array(this.arraySize);
      for (let i = 0; i < this.arraySize; i++) {
        answer[i] = array[i];
      }
      return answer;
    }
  }

  forEach(fnc: (id: number) => void): void {
    if (this.arraySize === -1) {
      const words = this.data;
      const c = words.length;
      for (let k = 0; k < c; ++k) {
        let w = words[k];
        while (w != 0) {
          const t = w & -w;
          fnc(((k << 5) + hammingWeight(t - 1)) | 0);
          w ^= t;
        }
      }
    } else {
      const array = this.data;
      for (let i = 0; i < this.arraySize; i++) {
        const v = array[i];
        fnc(v);
        if (v !== array[i]) {
          i--;
        }
      }
    }
  }

  /**
   * Iterator of set bit locations (values)
   */
  [Symbol.iterator](): IterableIterator<number> {
    if (this.arraySize === -1) {
      const words = this.data;
      const c = words.length;
      let k = 0;
      let w = words[k];

      return {
        [Symbol.iterator]() {
          return this;
        },
        next() {
          while (k < c) {
            if (w !== 0) {
              const t = w & -w;
              const value = (k << 5) + hammingWeight((t - 1) | 0);
              w ^= t;
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
    } else {
      const array = this.data;
      const arraySize = this.arraySize;
      let i = 0;

      return {
        [Symbol.iterator]() {
          return this;
        },
        next() {
          if (i < arraySize) {
            const v = array[i];
            const result = { done: false, value: v };
            if (v !== array[i]) {
              i--;
            }
            i++;
            return result;
          } else {
            return { done: true, value: undefined };
          }
        },
      };
    }
  }

  /**
   * Creates a copy of this bitmap
   */
  clone(): SparseTypedFastBitSet {
    const bitset = new SparseTypedFastBitSet(
      undefined,
      new Uint32Array(this.data) // Correction : pas d'annotation générique
    );
    bitset.arraySize = this.arraySize;
    return bitset;
  }

  /**
   * Check if this bitset intersects with another one,
   * no bitmap is modified
   */
  intersects(otherbitmap: BitSet): boolean {
    const order = SparseTypedFastBitSet.order(this, otherbitmap);

    switch (order.type) {
      case Type.BITSET: {
        const firstWords = order.first.words;
        const secondWords = order.second.words;
        const newcount = Math.min(firstWords.length, secondWords.length);
        for (let k = 0 | 0; k < newcount; ++k) {
          if ((firstWords[k] & secondWords[k]) !== 0) return true;
        }
        return false;
      }
      case Type.MIXED:
      case Type.ARRAY: {
        for (let i = 0; i < order.first.arraySize; i++) {
          if (order.second.has(order.first.data[i])) {
            return true;
          }
        }
        return false;
      }
    }
  }

  /**
   * Computes the intersection between this bitset and another one,
   * the current bitmap is modified  (and returned by the function)
   */
  intersection(otherbitmap: BitSet): BitSet {
    if (this.arraySize === -1) {
      if (
        !(otherbitmap instanceof SparseTypedFastBitSet) ||
        otherbitmap.arraySize === -1
      ) {
        const words = this.data;
        const otherWords = otherbitmap.words;
        const newcount = Math.min(words.length, otherWords.length);
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
        const c = words.length;
        for (k = newcount; k < c; ++k) {
          words[k] = 0;
        }
        return this;
      } else {
        const newWord = new Uint32Array(otherbitmap.data.length);
        // iterate through target as it will be smaller
        const otherArray = otherbitmap.data;
        let newSize = 0;
        for (let i = 0; i < otherbitmap.arraySize; i++) {
          const index = otherArray[i];
          if (this.has(index)) {
            if (newSize > 0 && index > newWord[0]) {
              newWord[newSize++] = newWord[0];
              newWord[0] = index;
            } else {
              newWord[newSize++] = index;
            }
          }
        }
        this.data = newWord;
        this.arraySize = newSize;
        return this;
      }
    } else {
      const array = this.data;
      for (let i = 0; i < this.arraySize; i++) {
        const v = array[i];
        if (otherbitmap.has(v)) {
          if (i > 0 && v > array[0]) {
            array[i] = array[0];
            array[0] = v;
          }
        } else {
          array[i--] = array[--this.arraySize];
        }
      }
      return this;
    }
  }

  /**
   * Computes the size of the intersection between this bitset and another one
   */
  intersection_size(otherbitmap: BitSet): number {
    const order = SparseTypedFastBitSet.order(this, otherbitmap);

    switch (order.type) {
      case Type.BITSET: {
        const words = order.first.words;
        const otherWords = order.second.words;
        const newcount = Math.min(words.length, otherWords.length);
        let answer = 0 | 0;
        for (let k = 0 | 0; k < newcount; ++k) {
          answer += hammingWeight(words[k] & otherWords[k]);
        }
        return answer;
      }
      case Type.MIXED:
      case Type.ARRAY: {
        let answer = 0;
        const array = order.first.data;
        for (let i = 0; i < order.first.arraySize; i++) {
          if (order.second.has(array[i])) {
            answer++;
          }
        }
        return answer;
      }
    }
  }

  /**
   * Computes the intersection between this bitset and another one,
   * a new bitmap is generated
   */
  new_intersection(otherbitmap: BitSet): BitSet {
    const order = SparseTypedFastBitSet.order(this, otherbitmap);

    switch (order.type) {
      case Type.BITSET: {
        const words = order.first.words;
        const otherWords = order.second.words;
        const count = Math.min(words.length, otherWords.length);
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
        const answer = new SparseTypedFastBitSet(undefined, newWords);
        answer.arraySize = -1;
        return answer;
      }
      case Type.MIXED:
      case Type.ARRAY: {
        const newArray = new Uint32Array(order.first.data.length);
        // iterate through target as it will be smaller
        let newSize = 0;
        const array = order.first.data;
        for (let i = 0; i < order.first.arraySize; i++) {
          const index = array[i];
          if (order.second.has(index)) {
            if (newSize > 0 && index > newArray[0]) {
              newArray[newSize++] = newArray[0];
              newArray[0] = index;
            } else {
              newArray[newSize++] = index;
            }
          }
        }
        const answer = new SparseTypedFastBitSet(undefined, newArray);
        answer.arraySize = newSize;
        return answer;
      }
    }
  }

  /**
   * Computes the intersection between this bitset and another one,
   * the current bitmap is modified
   */
  equals(otherbitmap: BitSet): boolean {
    if (this === otherbitmap) {
      return true;
    }
    const order = SparseTypedFastBitSet.order(this, otherbitmap);
    switch (order.type) {
      case Type.BITSET: {
        const words = this.words;
        const otherWords = otherbitmap.words;
        const mcount = Math.min(words.length, otherWords.length);
        for (let k = 0 | 0; k < mcount; ++k) {
          if (words[k] != otherWords[k]) return false;
        }
        if (words.length < otherWords.length) {
          const c = otherWords.length;
          for (let k = words.length; k < c; ++k) {
            if (otherWords[k] != 0) return false;
          }
        } else if (otherWords.length < words.length) {
          const c = words.length;
          for (let k = otherWords.length; k < c; ++k) {
            if (words[k] != 0) return false;
          }
        }
        return true;
      }
      case Type.ARRAY:
      case Type.MIXED: {
        if (order.first.size() !== order.second.size()) {
          return false;
        }
        const array = order.first.data;
        for (let i = 0; i < order.first.arraySize; i++) {
          if (!order.second.has(array[i])) {
            return false;
          }
        }
        return true;
      }
    }
  }

  /**
   * Computes the difference between this bitset and another one,
   * the current bitset is modified (and returned by the function)
   */
  difference(otherbitmap: BitSet): BitSet {
    if (this.arraySize === -1) {
      if (
        !(otherbitmap instanceof SparseTypedFastBitSet) ||
        otherbitmap.arraySize === -1
      ) {
        const words = this.words;
        const otherWords = otherbitmap.words;
        const newcount = Math.min(words.length, otherWords.length);
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
      } else {
        const otherArray = otherbitmap.data;
        for (let i = 0; i < otherbitmap.arraySize; i++) {
          const index = otherArray[i];
          if (this.has(index)) {
            this.remove(index);
          }
        }

        return this;
      }
    } else {
      const array = this.data;
      let findBiggest = false;
      for (let i = 0; i < this.arraySize; i++) {
        if (otherbitmap.has(array[i])) {
          if (i === 0) {
            findBiggest = true;
          }
          array[i--] = array[--this.arraySize];
        }
      }
      if (findBiggest && this.arraySize > 1) {
        let largest = array[0];
        let largestIndex = 0;
        for (let i = 1; i < this.arraySize; i++) {
          if (array[i] > largest) {
            largest = array[i];
            largestIndex = i;
          }
        }
        const current = array[0];
        array[0] = array[largestIndex];
        array[largestIndex] = current;
      }

      return this;
    }
  }

  /**
   * Computes the difference between this bitset and another one,
   * the other bitset is modified (and returned by the function)
   *
   * (for this set A and other set B, this computes B = A - B  and returns B)
   */
  difference2<T extends BitSet>(otherbitmap: T): T {
    if (
      this.arraySize === -1 ||
      !(otherbitmap instanceof SparseTypedFastBitSet)
    ) {
      const words = this.words;
      const mincount = Math.min(words.length, otherbitmap.words.length);
      otherbitmap.resize((words.length << 5) - 1);
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
      for (; k < words.length; ++k) {
        otherWords[k] = words[k];
      }
      otherWords.fill(0, k);
      return otherbitmap;
    } else {
      const array = new Uint32Array(this.data);
      let arraySize = this.arraySize;
      let findBiggest = false;
      for (let i = 0; i < arraySize; i++) {
        if (otherbitmap.has(array[i])) {
          if (i === 0) {
            findBiggest = true;
          }
          array[i--] = array[--arraySize];
        }
      }
      if (findBiggest && arraySize > 1) {
        let largest = array[0];
        let largestIndex = 0;
        for (let i = 1; i < arraySize; i++) {
          if (array[i] > largest) {
            largest = array[i];
            largestIndex = i;
          }
        }
        const current = array[0];
        array[0] = array[largestIndex];
        array[largestIndex] = current;
      }
      otherbitmap.data = array;
      otherbitmap.arraySize = arraySize;
      return otherbitmap;
    }
  }

  /**
   * Computes the difference between this bitset and another one,
   * a new bitmap is generated
   */
  new_difference(otherbitmap: BitSet): BitSet {
    return this.clone().difference(otherbitmap);
  }

  /**
   * Computes the size of the difference between this bitset and another one
   */
  difference_size(otherbitmap: BitSet): number {
    if (this.arraySize === -1) {
      if (
        !(otherbitmap instanceof SparseTypedFastBitSet) ||
        otherbitmap.arraySize === -1
      ) {
        const words = this.words;
        const otherWords = otherbitmap.words;
        const newcount = Math.min(words.length, otherWords.length);
        let answer = 0 | 0;
        let k = 0 | 0;
        for (; k < newcount; ++k) {
          answer += hammingWeight(words[k] & ~otherWords[k]);
        }
        const c = words.length;
        for (; k < c; ++k) {
          answer += hammingWeight(words[k]);
        }
        return answer;
      } else {
        let answer = this.size();
        const otherArray = otherbitmap.data;
        for (let i = 0; i < otherbitmap.arraySize; i++) {
          const index = otherArray[i];
          if (this.has(index)) {
            answer--;
          }
        }

        return answer;
      }
    } else {
      let answer = this.arraySize;
      const array = this.data;
      for (let i = 0; i < this.arraySize; i++) {
        if (otherbitmap.has(array[i])) {
          answer--;
        }
      }
      return answer;
    }
  }

  /**
   * Computes the changed elements (XOR) between this bitset and another one,
   * the current bitset is modified (and returned by the function)
   */
  change(otherbitmap: BitSet): this {
    if (this.arraySize === -1) {
      if (
        !(otherbitmap instanceof SparseTypedFastBitSet) ||
        otherbitmap.arraySize === -1
      ) {
        const otherWords = otherbitmap.words;
        const mincount = Math.min(this.words.length, otherWords.length);
        this.resize((otherWords.length << 5) - 1);
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
        for (; k < otherWords.length; ++k) {
          words[k] = otherWords[k];
        }
        return this;
      } else if (otherbitmap.arraySize > 0) {
        const otherArray = otherbitmap.data;
        this.resize(otherArray[0]);
        const words = this.words;

        for (let i = 0; i < otherbitmap.arraySize; i++) {
          const index = otherArray[i];
          if ((words[index >>> 5] & (1 << index)) !== 0) {
            words[index >>> 5] &= ~(1 << index);
          } else {
            words[index >>> 5] |= 1 << index;
          }
        }

        return this;
      } else {
        return this;
      }
    } else {
      if (
        !(otherbitmap instanceof SparseTypedFastBitSet) ||
        otherbitmap.arraySize === -1
      ) {
        const words = new Uint32Array(
          Math.max(
            otherbitmap.words.length,
            this.arraySize > 0 ? this.data[0] << (5 + 32) : 0
          )
        );
        words.set(otherbitmap.words);

        const array = this.data;
        for (let i = 0; i < this.arraySize; i++) {
          const index = array[i];
          if ((words[index >>> 5] & (1 << index)) !== 0) {
            words[index >>> 5] &= ~(1 << index);
          } else {
            words[index >>> 5] |= 1 << index;
          }
        }
        this.data = words;
        this.arraySize = -1;
      } else {
        const otherArray = otherbitmap.data;
        for (let i = 0; i < otherbitmap.arraySize; i++) {
          const index = otherArray[i];
          if (this.has(index)) {
            this.remove(index);
          } else {
            this.add(index);
          }
        }
      }

      return this;
    }
  }

  /**
   * Computes the change between this bitset and another one,
   * a new bitmap is generated
   */
  new_change(otherbitmap: BitSet): SparseTypedFastBitSet {
    const order = SparseTypedFastBitSet.order(this, otherbitmap);

    switch (order.type) {
      case Type.BITSET: {
        const words = this.words;
        const otherWords = otherbitmap.words;
        const count = Math.max(words.length, otherWords.length);
        const answer = new SparseTypedFastBitSet(
          undefined,
          new Uint32Array(count)
        );
        answer.arraySize = -1;
        const mcount = Math.min(words.length, otherWords.length);
        let k = 0;
        for (; k + 7 < mcount; k += 8) {
          answer.words[k] = words[k] ^ otherWords[k];
          answer.words[k + 1] = words[k + 1] ^ otherWords[k + 1];
          answer.words[k + 2] = words[k + 2] ^ otherWords[k + 2];
          answer.words[k + 3] = words[k + 3] ^ otherWords[k + 3];
          answer.words[k + 4] = words[k + 4] ^ otherWords[k + 4];
          answer.words[k + 5] = words[k + 5] ^ otherWords[k + 5];
          answer.words[k + 6] = words[k + 6] ^ otherWords[k + 6];
          answer.words[k + 7] = words[k + 7] ^ otherWords[k + 7];
        }
        for (; k < mcount; ++k) {
          answer.words[k] = words[k] ^ otherWords[k];
        }

        const c = words.length;
        for (k = mcount; k < c; ++k) {
          answer.words[k] = words[k];
        }
        const c2 = otherWords.length;
        for (k = mcount; k < c2; ++k) {
          answer.words[k] = otherWords[k];
        }
        return answer;
      }
      case Type.MIXED: {
        const words = new Uint32Array(
          Math.max(
            order.second.words.length,
            order.first.arraySize > 0 ? (order.first.data[0] + 32) << 5 : 0
          )
        );
        words.set(order.second.words);

        const array = order.first.data;
        for (let i = 0; i < order.first.arraySize; i++) {
          const index = array[i];
          if ((words[index >>> 5] & (1 << index)) !== 0) {
            words[index >>> 5] &= ~(1 << index);
          } else {
            words[index >>> 5] |= 1 << index;
          }
        }

        const answer = new SparseTypedFastBitSet(undefined, words);
        answer.arraySize = -1;
        return answer;
      }
      case Type.ARRAY: {
        const newArray = new Uint32Array(
          order.first.data.length + order.second.data.length
        );
        newArray.set(order.second.data);
        // iterate through target as it will be smaller
        let newSize = order.second.arraySize;
        const array = order.first.data;
        for (let i = 0; i < order.first.arraySize; i++) {
          const index = array[i];
          const offset = newArray.indexOf(index);
          if (offset !== -1 && offset < newSize) {
            newArray[offset] = newArray[--newSize];
          } else {
            newArray[newSize++] = index;
          }
        }

        if (newSize > 1) {
          let largest = newArray[0];
          let largestIndex = 0;
          for (let i = 1; i < newSize; i++) {
            if (newArray[i] > largest) {
              largest = newArray[i];
              largestIndex = i;
            }
          }
          const current = newArray[0];
          newArray[0] = newArray[largestIndex];
          newArray[largestIndex] = current;
        }
        const answer = new SparseTypedFastBitSet(undefined, newArray);
        answer.arraySize = newSize;
        return answer;
      }
    }
  }

  /**
   * Computes the number of changed elements between this bitset and another one
   */
  change_size(otherbitmap: BitSet): number {
    const order = SparseTypedFastBitSet.order(this, otherbitmap);

    switch (order.type) {
      case Type.BITSET: {
        const words = this.words;
        const otherWords = otherbitmap.words;
        const mincount = Math.min(words.length, otherWords.length);
        let answer = 0 | 0;
        let k = 0 | 0;
        for (; k < mincount; ++k) {
          answer += hammingWeight(words[k] ^ otherWords[k]);
        }
        const longer = words.length > otherWords.length ? this : otherbitmap;
        const c = longer.words.length;
        for (; k < c; ++k) {
          answer += hammingWeight(longer.words[k]);
        }
        return answer;
      }
      case Type.MIXED: {
        const array = order.first.data;
        let answer = order.second.size();

        for (let i = 0; i < order.first.arraySize; i++) {
          const index = array[i];
          if (order.second.has(index)) {
            answer--;
          } else {
            answer++;
          }
        }

        return answer;
      }
      case Type.ARRAY: {
        // iterate through target as it will be smaller
        let answer = order.second.arraySize;
        const array = order.first.data;
        for (let i = 0; i < order.first.arraySize; i++) {
          const index = array[i];
          if (order.second.has(index)) {
            answer--;
          } else {
            answer++;
          }
        }
        return answer;
      }
    }
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
    if (
      !(otherbitmap instanceof SparseTypedFastBitSet) ||
      otherbitmap.arraySize === -1
    ) {
      if (this.arraySize !== -1) {
        this.data = this.toBitset();
        this.arraySize = -1;
      }
      let words = this.data;
      const otherWords = otherbitmap.words;
      const mcount = Math.min(words.length, otherWords.length);
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
      if (words.length < otherWords.length) {
        this.resize((otherWords.length << 5) - 1);
        words = this.data;
        const c = otherWords.length;
        for (k = mcount; k < c; ++k) {
          words[k] = otherWords[k];
        }
      }
      return this;
    } else {
      const otherArray = otherbitmap.data;
      for (let i = 0; i < otherbitmap.arraySize; i++) {
        const index = otherArray[i];
        this.add(index);
      }
      return this;
    }
  }

  /**
   * Computes the union between this bitset and another one,
   * a new bitmap is generated
   */
  new_union(otherbitmap: BitSet): SparseTypedFastBitSet {
    if (
      !(otherbitmap instanceof SparseTypedFastBitSet) ||
      otherbitmap.arraySize === -1
    ) {
      let words = this.data;
      if (this.arraySize !== -1) {
        words = this.toBitset();
      }
      const otherWords = otherbitmap.words;
      const count = Math.max(words.length, otherWords.length);
      const answer = new SparseTypedFastBitSet(
        undefined,
        new Uint32Array(count)
      );
      answer.arraySize = -1;
      const mcount = Math.min(words.length, otherWords.length);
      for (let k = 0; k < mcount; ++k) {
        answer.words[k] = words[k] | otherWords[k];
      }
      const c = words.length;
      for (let k = mcount; k < c; ++k) {
        answer.words[k] = words[k];
      }
      const c2 = otherWords.length;
      for (let k = mcount; k < c2; ++k) {
        answer.words[k] = otherWords[k];
      }
      return answer;
    } else {
      const answer = this.clone();
      const otherArray = otherbitmap.data;
      for (let i = 0; i < otherbitmap.arraySize; i++) {
        const index = otherArray[i];
        answer.add(index);
      }
      return answer;
    }
  }

  /**
   * Computes the size union between this bitset and another one
   */
  union_size(otherbitmap: BitSet): number {
    const order = SparseTypedFastBitSet.order(this, otherbitmap);
    switch (order.type) {
      case Type.BITSET: {
        const words = order.first.words;
        const otherWords = order.second.words;
        const mcount = Math.min(words.length, otherWords.length);
        let answer = 0 | 0;
        for (let k = 0 | 0; k < mcount; ++k) {
          answer += hammingWeight(words[k] | otherWords[k]);
        }
        if (words.length < otherWords.length) {
          const c = otherWords.length;
          for (let k = words.length; k < c; ++k) {
            answer += hammingWeight(otherWords[k] | 0);
          }
        } else {
          const c = words.length;
          for (let k = otherWords.length; k < c; ++k) {
            answer += hammingWeight(words[k] | 0);
          }
        }
        return answer;
      }
      case Type.ARRAY:
      case Type.MIXED: {
        let answer = order.second.size();
        const array = order.first.data;
        for (let i = 0; i < order.first.arraySize; i++) {
          if (!order.second.has(array[i])) {
            answer++;
          }
        }
        return answer;
      }
    }
  }

  /**
   * will put array based one first and return type if both array smallest first
   */
  private static order(first: BitSet, second: BitSet): OrderResponse {
    if (!(first instanceof SparseTypedFastBitSet) || first.arraySize === -1) {
      if (
        !(second instanceof SparseTypedFastBitSet) ||
        second.arraySize === -1
      ) {
        return {
          first: first,
          second: second,
          type: Type.BITSET,
        };
      } else {
        return {
          first: second,
          second: first,
          type: Type.MIXED,
        };
      }
    } else {
      if (
        !(second instanceof SparseTypedFastBitSet) ||
        second.arraySize === -1
      ) {
        return {
          first: first,
          second: second,
          type: Type.MIXED,
        };
      } else {
        if (second.arraySize > first.arraySize) {
          return {
            first: first,
            second: second,
            type: Type.ARRAY,
          };
        } else {
          return {
            first: second,
            second: first,
            type: Type.ARRAY,
          };
        }
      }
    }
  }
}
