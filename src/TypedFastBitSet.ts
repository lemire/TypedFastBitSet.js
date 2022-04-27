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

 *   See README.md file for a more complete description.
 *
 * You can install the library under node with the command line
 *   npm install typedfastbitset
 */

import { BitSet, hammingWeight, hammingWeight4 } from "./utils";

function isIterable(
  obj: Iterable<number> | null | undefined
): obj is Iterable<number> {
  if (obj) {
    return obj[Symbol.iterator] !== undefined;
  }
  return false;
}
// you can provide an iterable
// an exception is thrown if typed arrays are not supported

export class TypedFastBitSet implements BitSet {
  //constructor
  constructor(
    iterable?: Iterable<number> | null,
    public words = new Uint32Array(8)
  ) {
    if (isIterable(iterable)) {
      for (const key of iterable) {
        this.add(key);
      }
    }
  }

  // Returns a new TypedFastBitset given a Uint32Array
  // of words
  static fromWords(words: Uint32Array) {
    return new TypedFastBitSet(undefined, words);
  }

  // Add the value (Set the bit at index to true)
  add(index: number) {
    this.resize(index);
    this.words[index >>> 5] |= 1 << index;
  }

  // If the value was not in the set, add it, otherwise remove it (flip bit at index)
  flip(index: number) {
    this.resize(index);
    this.words[index >>> 5] ^= 1 << index;
  }

  // Remove all values, reset memory usage
  clear() {
    this.words = new Uint32Array(8);
  }

  // Set the bit at index to false
  remove(index: number) {
    this.resize(index);
    this.words[index >>> 5] &= ~(1 << index);
  }

  // Set bits from start (inclusive) to end (exclusive)
  addRange(start: number, end: number) {
    if (start >= end) {
      return;
    }

    if (this.words.length << 5 <= end) {
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

  // Remove bits from start (inclusive) to end (exclusive)
  removeRange(start: number, end: number) {
    const words = this.words;
    start = Math.min(start, (words.length << 5) - 1);
    end = Math.min(end, (words.length << 5) - 1);

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

  // Return true if no bit is set
  isEmpty() {
    const words = this.words;
    const c = words.length;
    for (let i = 0; i < c; i++) {
      if (words[i] !== 0) return false;
    }
    return true;
  }

  // Is the value contained in the set? Is the bit at index true or false? Returns a boolean
  has(index: number) {
    return (this.words[index >>> 5] & (1 << index)) !== 0;
  }

  // Tries to add the value (Set the bit at index to true), return 1 if the
  // value was added, return 0 if the value was already present
  checkedAdd(index: number) {
    const words = this.words;
    this.resize(index);
    const word = words[index >>> 5];
    const newword = word | (1 << index);
    words[index >>> 5] = newword;
    return ((newword ^ word) >>> index) as 0 | 1;
  }

  // Reduce the memory usage to a minimum
  trim() {
    const words = this.words;
    let nl = words.length;
    while (nl > 0 && words[nl - 1] === 0) {
      nl--;
    }
    this.words = words.slice(0, nl);
  }

  // Resize the bitset so that we can write a value at index
  resize(index: number) {
    const words = this.words;
    if (words.length << 5 > index) return;
    const count = (index + 32) >>> 5; // just what is needed
    const newwords = new Uint32Array(count << 1);
    newwords.set(words); // hopefully, this copy is fast
    this.words = newwords;
  }

  // How many values stored in the set? How many set bits?
  size() {
    const words = this.words;
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
  }

  // Return an array with the set bit locations (values)
  array() {
    const words = this.words;
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
  }

  // Return an array with the set bit locations (values)
  forEach(fnc: (id: number) => void) {
    const words = this.words;
    const c = words.length;
    for (let k = 0; k < c; ++k) {
      let w = words[k];
      while (w != 0) {
        const t = w & -w;
        fnc(((k << 5) + hammingWeight(t - 1)) | 0);
        w ^= t;
      }
    }
  }

  // Returns an iterator of set bit locations (values)
  *[Symbol.iterator]() {
    const words = this.words;
    const c = words.length;
    for (let k = 0; k < c; ++k) {
      let w = words[k];
      while (w != 0) {
        const t = w & -w;
        yield (k << 5) + hammingWeight((t - 1) | 0);
        w ^= t;
      }
    }
  }

  // Creates a copy of this bitmap
  clone() {
    return TypedFastBitSet.fromWords(new Uint32Array(this.words));
  }

  // Check if this bitset intersects with another one,
  // no bitmap is modified
  intersects(otherbitmap: BitSet) {
    const words = this.words;
    const otherWords = otherbitmap.words;
    const newcount = Math.min(words.length, otherWords.length);
    for (let k = 0 | 0; k < newcount; ++k) {
      if ((words[k] & otherWords[k]) !== 0) return true;
    }
    return false;
  }

  // Computes the intersection between this bitset and another one,
  // the current bitmap is modified  (and returned by the function)
  intersection(otherbitmap: BitSet) {
    const words = this.words;
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
  }

  // Computes the size of the intersection between this bitset and another one
  intersection_size(otherbitmap: BitSet) {
    const words = this.words;
    const otherWords = otherbitmap.words;
    const newcount = Math.min(words.length, otherWords.length);
    let answer = 0 | 0;
    for (let k = 0 | 0; k < newcount; ++k) {
      answer += hammingWeight(words[k] & otherWords[k]);
    }
    return answer;
  }

  // Computes the intersection between this bitset and another one,
  // a new bitmap is generated
  new_intersection(otherbitmap: BitSet) {
    const words = this.words;
    const otherWords = otherbitmap.words;
    const answer = Object.create(TypedFastBitSet.prototype);
    const count = Math.min(words.length, otherWords.length);
    answer.words = new Uint32Array(count);
    let k = 0 | 0;
    for (; k + 7 < count; k += 8) {
      answer.words[k] = words[k] & otherWords[k];
      answer.words[k + 1] = words[k + 1] & otherWords[k + 1];
      answer.words[k + 2] = words[k + 2] & otherWords[k + 2];
      answer.words[k + 3] = words[k + 3] & otherWords[k + 3];
      answer.words[k + 4] = words[k + 4] & otherWords[k + 4];
      answer.words[k + 5] = words[k + 5] & otherWords[k + 5];
      answer.words[k + 6] = words[k + 6] & otherWords[k + 6];
      answer.words[k + 7] = words[k + 7] & otherWords[k + 7];
    }
    for (; k < count; ++k) {
      answer.words[k] = words[k] & otherWords[k];
    }
    return answer;
  }

  // Computes the intersection between this bitset and another one,
  // the current bitmap is modified
  equals(otherbitmap: BitSet) {
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

  // Computes the difference between this bitset and another one,
  // the current bitset is modified (and returned by the function)
  difference(otherbitmap: BitSet) {
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
  }

  // Computes the difference between this bitset and another one,
  // the other bitset is modified (and returned by the function)
  // (for this set A and other set B,
  //   this computes B = A - B  and returns B)
  difference2(otherbitmap: BitSet) {
    const mincount = Math.min(this.words.length, otherbitmap.words.length);
    otherbitmap.resize((this.words.length << 5) - 1);

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
      otherWords[k] = this.words[k] & ~otherWords[k];
    }
    // remaining words are all part of difference
    for (; k < this.words.length; ++k) {
      otherWords[k] = this.words[k];
    }
    otherWords.fill(0, k);
    return otherbitmap;
  }

  // Computes the difference between this bitset and another one,
  // a new bitmap is generated
  new_difference(otherbitmap: BitSet) {
    return this.clone().difference(otherbitmap); // should be fast enough
  }

  // Computes the size of the difference between this bitset and another one
  difference_size(otherbitmap: BitSet) {
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
  }

  // Computes the changed elements (XOR) between this bitset and another one,
  // the current bitset is modified (and returned by the function)
  change(otherbitmap: BitSet) {
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
  }

  // Computes the change between this bitset and another one,
  // a new bitmap is generated
  new_change(otherbitmap: BitSet) {
    const words = this.words;
    const otherWords = otherbitmap.words;
    const answer = Object.create(TypedFastBitSet.prototype);
    const count = Math.max(words.length, otherWords.length);
    answer.words = new Uint32Array(count);
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

  // Computes the number of changed elements between this bitset and another one
  change_size(otherbitmap: BitSet) {
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

  // Returns a string representation
  toString() {
    return "{" + this.array().join(",") + "}";
  }

  // Computes the union between this bitset and another one,
  // the current bitset is modified  (and returned by the function)
  union(otherbitmap: BitSet) {
    let words = this.words;
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
      words = this.words;
      const c = otherWords.length;
      for (k = mcount; k < c; ++k) {
        words[k] = otherWords[k];
      }
    }
    return this;
  }

  // Computes the union between this bitset and another one,
  // a new bitmap is generated
  new_union(otherbitmap: BitSet) {
    const words = this.words;
    const otherWords = otherbitmap.words;
    const answer = Object.create(TypedFastBitSet.prototype);
    const count = Math.max(words.length, otherWords.length);
    answer.words = new Uint32Array(count);
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
  }

  // Computes the size union between this bitset and another one
  union_size(otherbitmap: BitSet) {
    const words = this.words;
    const otherWords = otherbitmap.words;
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
}
