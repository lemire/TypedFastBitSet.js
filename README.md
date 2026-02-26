# TypedFastBitSet.js

Speed-optimized BitSet implementation for modern browsers and JavaScript engines, uses typed arrays.

A BitSet (also called Bitmap or bit vector) is an ideal data structure to implement a
set when values being stored are reasonably small integers. It can be orders of magnitude
faster than a generic set implementation. In particular, a BitSet has fast support for set
operations (union, difference, intersection).

The TypedFastBitSet.js implementation optimizes for speed, leveraging commonly available features
like typed arrays. It can be several times faster than competitive alternatives. It is also entirely
dynamic, and has functions to minimize the memory usage. It should be supported by most of the modern
browsers and JavaScript engines. It is ideal for maintaining sets of integers when performance matters.

License: Apache License 2.0

## Usage

```javascript
const b = new TypedFastBitSet(); // initially empty
b.add(1); // add the value "1"
b.has(1); // check that the value is present! (will return true)
b.add(2);
console.log("" + b); // should display {1,2}
b.add(10);
b.addRange(11, 13);
b.array(); // would return [1, 2, 10, 11, 12, 13]
let c = new TypedFastBitSet([1, 2, 3, 10]); // create bitset initialized with values 1,2,3,10
c.difference(b); // from c, remove elements that are in b (modifies c)
c.difference2(b); // from c, remove elements that are in b (modifies b)
c.change(b); // c will contain all elements that are in b or in c, but not both (elements that changed)
const su = c.union_size(b); // compute the size of the union (bitsets are unchanged)
c.union(b); // c will contain all elements that are in c and b
const out1 = c.new_union(b); // creates a new bitmap that contains everything in c and b
const out2 = c.new_intersection(b); // creates a new bitmap that contains everything that is in both c and b
const out3 = c.new_change(b); // creates a new bitmap that contains everything in b or in c, but not both
const s1 = c.intersection_size(b); // compute the size of the intersection (bitsets are unchanged)
const s2 = c.difference_size(b); // compute the size of the difference (bitsets are unchanged)
const s3 = c.change_size(b); // compute the number of elements that are in b but not c, or vice versa
c.intersects(b); // return true if c intersects with b
c.intersection(b); // c will only contain elements that are in both c and b
c = b.clone(); // create a (deep) copy of b and assign it to c.
c.equals(b); // checks whether c and b are equal
c.forEach(fnc); // execute fnc on each value stored in c
for (const x of c) fnc(x); // execute fnc on each value stored in c (allows early exit with break)
c.trim(); // reduce the memory usage of the bitmap if possible, the content remains the same
```

If you are using Node.js, you need to import the module:

```javascript
const { TypedFastBitSet } = require("typedfastbitset");
const b = new TypedFastBitSet(); // initially empty
b.add(1); // add the value "1"
```

Performance tip: in-place functions such as `intersection`, `union` and `difference` can be
much faster than functions generating a new bitmap (`new_intersection`, `new_union`
and `new_difference`) because they avoid creating a new object, a potentially
expensive process in JavaScript. For faster code, use as few TypedFastBitSet objects as
you can.

There is also `SparseTypedFastBitSet` which might perform better depending on the shape of your data.
This implementation starts as an array of values and switches to a bitset structure once enough entries have been added.

## API

### Constructor and Static Methods

- `new TypedFastBitSet(iterable?)` — create a bitset, optionally initialized from an iterable of integers
- `TypedFastBitSet.fromWords(words: Uint32Array)` — create a bitset from a raw word array

### Basic Operations

- `add(index)` — set bit at index to true
- `checkedAdd(index)` — add value, returns `1` if added, `0` if already present
- `remove(index)` — set bit at index to false
- `flip(index)` — toggle bit at index
- `has(index)` — returns `true` if bit at index is set
- `clear()` — remove all values, reset memory

### Range Operations

- `addRange(start, end)` — set bits from start (inclusive) to end (exclusive)
- `removeRange(start, end)` — clear bits from start (inclusive) to end (exclusive)
- `hasAnyInRange(start, end)` — returns `true` if any bit in range is set

### Iteration

- `array()` — return an array of set bit indices
- `forEach(fn)` — call `fn` for each set bit index
- `[Symbol.iterator]()` — iterate over set bit indices (supports `for...of`)

### Set Operations (in-place, modifies `this`)

- `union(other)` — `this = this | other`
- `intersection(other)` — `this = this & other`
- `difference(other)` — `this = this & ~other`
- `difference2(other)` — `other = this & ~other` (modifies `other`)
- `change(other)` — `this = this ^ other`

### Set Operations (new bitmap)

- `new_union(other)` — returns new bitmap `this | other`
- `new_intersection(other)` — returns new bitmap `this & other`
- `new_difference(other)` — returns new bitmap `this & ~other`
- `new_change(other)` — returns new bitmap `this ^ other`

### Size Queries

- `size()` — number of set bits
- `isEmpty()` — returns `true` if no bit is set
- `union_size(other)` — size of union without creating it
- `intersection_size(other)` — size of intersection without creating it
- `difference_size(other)` — size of difference without creating it
- `change_size(other)` — size of symmetric difference without creating it

### Comparison and Utility

- `equals(other)` — returns `true` if both bitsets contain the same values
- `intersects(other)` — returns `true` if bitsets share any value
- `clone()` — returns a deep copy
- `trim()` — reduce memory usage by removing trailing empty words
- `resize(index)` — ensure capacity for the given index (may over-allocate for speed)
- `resizeTo(size)` — ensure capacity for exactly `size` bits (no over-allocation)
- `toString()` — string representation like `{1,2,3}`

## npm install

```
npm install typedfastbitset
```

## Testing

```
npm test
```

## Is it faster?

TypedFastBitSet can be quite fast compared to competitive alternatives :

```bash
$ node benchmark/test.js
Benchmarking against:
TypedFastBitSet.js: https://github.com/lemire/TypedFastBitSet.js
roaring: https://www.npmjs.com/package/roaring
infusion.BitSet.js from https://github.com/infusion/BitSet.js 5.0.0
tdegrunt.BitSet from https://github.com/tdegrunt/bitset
mattkrick.fast-bitset from https://github.com/mattkrick/fast-bitset 1.3.2
standard Set object from JavaScript

Not all libraries support all operations. We benchmark what is available.

Platform: darwin 25.2.0 arm64
Apple M4 Max
Node version 25.6.1, v8 version 14.1.146.11-node.19

starting union query benchmark
roaring x 1,094 ops/sec ±3.58% (38 runs sampled)
FastBitSet (creates new bitset) x 117 ops/sec ±1.28% (80 runs sampled)
TypedFastBitSet (creates new bitset) x 194 ops/sec ±1.85% (81 runs sampled)
SparseTypedFastBitSet (creates new bitset) x 29.50 ops/sec ±3.87% (29 runs sampled)
mattkrick.fast-bitset (creates new bitset) x 141 ops/sec ±2.29% (70 runs sampled)
Set x 12.61 ops/sec ±1.31% (36 runs sampled)

starting change (XOR) query benchmark
roaring x 1,212 ops/sec ±1.99% (39 runs sampled)
FastBitSet (creates new bitset) x 115 ops/sec ±1.26% (79 runs sampled)
TypedFastBitSet (creates new bitset) x 180 ops/sec ±1.91% (66 runs sampled)
SparseTypedFastBitSet (creates new bitset) x 30.00 ops/sec ±2.10% (29 runs sampled)
mattkrick.fast-bitset (creates new bitset) x 25.04 ops/sec ±1.62% (47 runs sampled)
Set x 7.73 ops/sec ±1.12% (24 runs sampled)

starting intersection query benchmark
FastBitSet (creates new bitset) x 6,267 ops/sec ±0.26% (97 runs sampled)
TypedFastBitSet (creates new bitset) x 9,373 ops/sec ±1.74% (81 runs sampled)
SparseTypedFastBitSet (creates new bitset) x 8,474 ops/sec ±1.08% (84 runs sampled)
mattkrick.fast-bitset  (creates new bitset) x 24.87 ops/sec ±1.75% (46 runs sampled)
roaring x 53,457 ops/sec ±1.97% (74 runs sampled)
Set x 17.91 ops/sec ±2.25% (46 runs sampled)

starting difference query benchmark
FastBitSet (creates new bitset) x 9,956 ops/sec ±0.36% (98 runs sampled)
TypedFastBitSet (creates new bitset) x 10,244 ops/sec ±2.02% (79 runs sampled)
SparseTypedFastBitSet (creates new bitset) x 9,940 ops/sec ±1.91% (86 runs sampled)
Set x 18.79 ops/sec ±0.99% (37 runs sampled)

starting inplace change (XOR) benchmark
FastBitSet (inplace) x 298 ops/sec ±2.85% (91 runs sampled)
TypedFastBitSet (inplace) x 365 ops/sec ±1.49% (92 runs sampled)
SparseTypedFastBitSet (inplace) x 343 ops/sec ±1.25% (92 runs sampled)
infusion.BitSet.js (inplace) x 2.84 ops/sec ±5.24% (12 runs sampled)
tdegrunt.BitSet (inplace) x 2.98 ops/sec ±1.78% (12 runs sampled)
roaring x 1,217 ops/sec ±0.16% (100 runs sampled)
Set (inplace) x 18.71 ops/sec ±1.77% (37 runs sampled)

starting inplace union  benchmark
FastBitSet (inplace) x 335 ops/sec ±2.51% (91 runs sampled)
TypedFastBitSet (inplace) x 368 ops/sec ±1.50% (91 runs sampled)
SparseTypedFastBitSet (inplace) x 150 ops/sec ±2.00% (84 runs sampled)
infusion.BitSet.js (inplace) x 3.08 ops/sec ±2.07% (12 runs sampled)
tdegrunt.BitSet (inplace) x 3.31 ops/sec ±3.49% (13 runs sampled)
roaring x 1,576 ops/sec ±0.38% (98 runs sampled)
Set (inplace) x 36.73 ops/sec ±3.98% (50 runs sampled)

starting inplace intersection  benchmark
FastBitSet (inplace) x 25,628 ops/sec ±0.37% (97 runs sampled)
TypedFastBitSet (inplace) x 27,163 ops/sec ±0.32% (95 runs sampled)
SparseTypedFastBitSet (inplace) x 25,253 ops/sec ±0.34% (98 runs sampled)
infusion.BitSet.js (inplace) x 8,735 ops/sec ±0.56% (95 runs sampled)
tdegrunt.BitSet (inplace) x 8,629 ops/sec ±0.70% (93 runs sampled)
roaring x 83,231 ops/sec ±0.56% (97 runs sampled)
Set (inplace) x 17.19 ops/sec ±6.40% (34 runs sampled)

starting inplace difference benchmark
FastBitSet (inplace) x 25,658 ops/sec ±0.37% (96 runs sampled)
FastBitSet (inplace2) x 25,370 ops/sec ±0.34% (100 runs sampled)
TypedFastBitSet (inplace) x 27,036 ops/sec ±0.42% (94 runs sampled)
TypedFastBitSet (inplace2) x 218,075,807 ops/sec ±3.59% (80 runs sampled)
SparseTypedFastBitSet (inplace) x 25,153 ops/sec ±0.47% (96 runs sampled)
SparseTypedFastBitSet (inplace2) x 36,456,912 ops/sec ±0.53% (96 runs sampled)
infusion.BitSet.js (inplace) x 136 ops/sec ±4.12% (72 runs sampled)
tdegrunt.BitSet (inplace) x 136 ops/sec ±3.57% (79 runs sampled)
roaring x 110,417 ops/sec ±0.23% (98 runs sampled)
Set (inplace) x 20.17 ops/sec ±3.67% (38 runs sampled)

starting cardinality benchmark
FastBitSet x 11,936 ops/sec ±6.39% (81 runs sampled)
TypedFastBitSet x 16,984 ops/sec ±0.36% (96 runs sampled)
SparseTypedFastBitSet x 15,468 ops/sec ±0.33% (98 runs sampled)
infusion.BitSet.js x 11,187 ops/sec ±6.80% (81 runs sampled)
tdegrunt.BitSet x 10,807 ops/sec ±5.92% (81 runs sampled)
mattkrick.fast-bitset x 14,236 ops/sec ±0.65% (90 runs sampled)

starting union cardinality query benchmark
FastBitSet (creates new bitset) x 68.00 ops/sec ±0.54% (72 runs sampled)
FastBitSet (fast way) x 203 ops/sec ±1.24% (89 runs sampled)
TypedFastBitSet (creates new bitset) x 113 ops/sec ±1.31% (69 runs sampled)
TypedFastBitSet (fast way) x 210 ops/sec ±0.82% (91 runs sampled)
SparseTypedFastBitSet (creates new bitset) x 25.38 ops/sec ±7.04% (48 runs sampled)
SparseTypedFastBitSet (fast way) x 207 ops/sec ±0.67% (90 runs sampled)
roaring x 132,730 ops/sec ±0.42% (98 runs sampled)
mattkrick.fast-bitset (creates new bitset) x 22.45 ops/sec ±1.78% (43 runs sampled)
Set x 21.18 ops/sec ±2.80% (39 runs sampled)

starting intersection cardinality query benchmark
FastBitSet (creates new bitset) x 3,406 ops/sec ±0.81% (88 runs sampled)
FastBitSet (fast way) x 9,136 ops/sec ±0.36% (96 runs sampled)
TypedFastBitSet (creates new bitset) x 6,375 ops/sec ±1.44% (73 runs sampled)
TypedFastBitSet (fast way) x 7,799 ops/sec ±7.81% (73 runs sampled)
SparseTypedFastBitSet (creates new bitset) x 5,884 ops/sec ±1.44% (75 runs sampled)
SparseTypedFastBitSet (fast way) x 10,082 ops/sec ±0.23% (99 runs sampled)
roaring x 181,699 ops/sec ±0.16% (98 runs sampled)
mattkrick.fast-bitset (creates new bitset) x 22.29 ops/sec ±1.64% (42 runs sampled)
Set x 19.29 ops/sec ±1.74% (37 runs sampled)

starting difference cardinality query benchmark
FastBitSet (creates new bitset) x 67.90 ops/sec ±0.42% (72 runs sampled)
FastBitSet (fast way) x 9,579 ops/sec ±0.43% (95 runs sampled)
TypedFastBitSet (creates new bitset) x 112 ops/sec ±1.16% (67 runs sampled)
TypedFastBitSet (fast way) x 11,129 ops/sec ±0.63% (93 runs sampled)
SparseTypedFastBitSet (creates new bitset) x 25.89 ops/sec ±1.79% (48 runs sampled)
SparseTypedFastBitSet (fast way) x 10,080 ops/sec ±0.35% (96 runs sampled)
roaring x 184,226 ops/sec ±0.30% (97 runs sampled)
Set x 27.16 ops/sec ±1.86% (49 runs sampled)

starting dynamic bitmap creation benchmark
FastBitSet x 639 ops/sec ±4.35% (88 runs sampled)
TypedFastBitSet x 1,004 ops/sec ±2.76% (90 runs sampled)
SparseTypedFastBitSet x 452 ops/sec ±2.13% (93 runs sampled)
infusion.BitSet.js x 527 ops/sec ±2.82% (89 runs sampled)
tdegrunt.BitSet x 529 ops/sec ±2.77% (91 runs sampled)
Set x 28.40 ops/sec ±1.44% (52 runs sampled)

starting query benchmark
FastBitSet x 267,971,357 ops/sec ±4.56% (78 runs sampled)
TypedFastBitSet x 277,248,227 ops/sec ±3.60% (79 runs sampled)
SparseTypedFastBitSet x 270,419,090 ops/sec ±5.64% (76 runs sampled)
infusion.BitSet.js x 243,560,372 ops/sec ±4.13% (78 runs sampled)
tdegrunt.BitSet x 250,951,159 ops/sec ±3.95% (77 runs sampled)
mattkrick.fast-bitset x 265,732,094 ops/sec ±5.79% (75 runs sampled)
Set x 273,777,755 ops/sec ±4.58% (78 runs sampled)

starting array extraction benchmark
FastBitSet x 458 ops/sec ±0.58% (92 runs sampled)
TypedFastBitSet x 541 ops/sec ±15.18% (83 runs sampled)
SparseTypedFastBitSet x 478 ops/sec ±0.46% (94 runs sampled)
mattkrick.fast-bitset x 59.31 ops/sec ±0.70% (63 runs sampled)

starting forEach benchmark
FastBitSet x 634 ops/sec ±0.39% (96 runs sampled)
TypedFastBitSet x 416 ops/sec ±1.38% (86 runs sampled)
SparseTypedFastBitSet x 358 ops/sec ±2.75% (89 runs sampled)
FastBitSet (via array):
TypedFastBitSet (via array) x 42.65 ops/sec ±3.74% (57 runs sampled)
SparseTypedFastBitSet (via array) x 40.93 ops/sec ±9.44% (59 runs sampled)
mattkrick.fast-bitset x 61.62 ops/sec ±11.95% (66 runs sampled)
Set x 67.15 ops/sec ±8.87% (71 runs sampled)

starting clone benchmark
FastBitSet x 11,599 ops/sec ±14.75% (72 runs sampled)
TypedFastBitSet x 34,875 ops/sec ±1.12% (43 runs sampled)
SparseTypedFastBitSet x 38,408 ops/sec ±0.81% (36 runs sampled)
infusion.BitSet.js x 13,320 ops/sec ±0.73% (95 runs sampled)
mattkrick.fast-bitset x 382 ops/sec ±0.40% (90 runs sampled)
Set x 154 ops/sec ±0.48% (82 runs sampled)
```

To reproduce, install benchmark dependencies and run:

```bash
npm install benchmark fastbitset bitset bitset.js fast-bitset roaring minimist
npm run build:package
npm run benchmark
```

## You might also like...

If you like this library, you might also like:

- https://github.com/lemire/FastBitSet.js
- https://github.com/RoaringBitmap/roaring-node — Roaring Bitmaps for Node.js, potentially faster for very large or very sparse sets
- https://github.com/lemire/FastPriorityQueue.js
- https://github.com/lemire/StablePriorityQueue.js
- https://github.com/lemire/FastIntegerCompression.js
