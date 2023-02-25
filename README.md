# TypedFastBitSet.js

[![Build Status](https://travis-ci.org/lemire/TypedFastBitSet.js.svg?branch=master)](https://travis-ci.org/lemire/TypedFastBitSet.js)

Speed-optimized BitSet implementation for modern browsers and JavaScript engines, uses typed arrays

A BitSet (also called Bitmap or bit vector) is an ideal data structure to implement a
set when values being stored are reasonably small integers. It can be orders of magnitude
faster than a generic set implementation. In particular, a BitSet has fast support for set
operations (union, difference, intersection).

The TypedFastBitSet.js implementation optimizes for speed, leveraging commonly available features
like typed arrays. It can be several times faster than competitive alternatives. It is also entirely
dynamic, and has functions to minimize the memory usage. It should be supported by most of the modern
browsers and JavaScript engines. It is ideal for maintaining sets of integers when performance matters.

License: Apache License 2.0

# Usage

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

If you are using node.js, you need to import the module:

```javascript
const TypedFastBitSet = require("typedfastbitset");
const b = new TypedFastBitSet(); // initially empty
b.add(1); // add the value "1"
```

Performance tip: in-place functions such as intersection, union and difference can be
much faster than functions generating a new bitmap (new_intersection, new_union
and new_difference) because they avoid creating a new object, a potentially
expensive process in JavaScript. For faster code, use as few FastBitSet objects as
you can.

There is also `SparseTypedFastBitSet` which might perform better depending on the shape of your data
This implementation starts as an array of values and switches to a bitset structure once enough entries have been added

# npm install

      $ npm install typedfastbitset

# Testing

Using node.js (npm), you can test the code as follows...

      $ npm install mocha
      $ npm test

# Is it faster?

To run benchmarks, please use the instructions in the benchmark folder.

TypedFastBitSet can be quite fast compared to competitive alternatives :

```bash
$ node test.js
Benchmarking against:
TypedFastBitSet.js: https://github.com/lemire/TypedFastBitSet.js
infusion.BitSet.js from https://github.com/infusion/BitSet.js 5.0.0
tdegrunt.BitSet from https://github.com/tdegrunt/bitset 5.1.1
mattkrick.fast-bitset from https://github.com/mattkrick/fast-bitset 1.3.2
standard Set object from JavaScript

Not all libraries support all operations. We benchmark what is available.

Platform: linux 4.19.128-microsoft-standard x64
Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz
Node version 12.20.0, v8 version 7.8.279.23-node.45

We proceed with the logical operations generating new bitmaps:

starting union query benchmark
FastBitSet (creates new bitset) x 60.79 ops/sec ±1.07% (66 runs sampled)
TypedFastBitSet (creates new bitset) x 42.67 ops/sec ±10.58% (46 runs sampled)
SparseTypedFastBitSet (creates new bitset) x 60.95 ops/sec ±11.04% (61 runs sampled)
mattkrick.fast-bitset (creates new bitset) x 76.72 ops/sec ±3.77% (69 runs sampled)
Set x 2.64 ops/sec ±3.42% (11 runs sampled)

starting change (XOR) query benchmark
FastBitSet (creates new bitset) x 58.48 ops/sec ±1.23% (64 runs sampled)
TypedFastBitSet (creates new bitset) x 52.21 ops/sec ±5.21% (56 runs sampled)
SparseTypedFastBitSet (creates new bitset) x 78.15 ops/sec ±2.69% (70 runs sampled)
mattkrick.fast-bitset (creates new bitset) x 12.41 ops/sec ±2.53% (36 runs sampled)
Set x 2.67 ops/sec ±1.01% (11 runs sampled)

starting intersection query benchmark
FastBitSet (creates new bitset) x 1,804 ops/sec ±0.87% (96 runs sampled)
TypedFastBitSet (creates new bitset) x 2,432 ops/sec ±3.04% (73 runs sampled)
SparseTypedFastBitSet (creates new bitset) x 3,738 ops/sec ±3.55% (66 runs sampled)
mattkrick.fast-bitset  (creates new bitset) x 12.59 ops/sec ±2.47% (36 runs sampled)
Set x 6.65 ops/sec ±3.54% (21 runs sampled)

starting difference query benchmark
FastBitSet (creates new bitset) x 2,088 ops/sec ±1.61% (86 runs sampled)
TypedFastBitSet (creates new bitset) x 2,720 ops/sec ±3.48% (74 runs sampled)
SparseTypedFastBitSet (creates new bitset) x 4,184 ops/sec ±3.63% (61 runs sampled)
Set x 3.13 ops/sec ±2.52% (12 runs sampled)

We benchmark the in-place logical operations:
(Notice how much faster they are.)

starting inplace change (XOR) benchmark
FastBitSet (inplace) x 93.96 ops/sec ±1.09% (83 runs sampled)
TypedFastBitSet (inplace) x 79.81 ops/sec ±0.89% (71 runs sampled)
SparseTypedFastBitSet (inplace) x 113 ops/sec ±0.48% (85 runs sampled)
infusion.BitSet.js (inplace) x 1.15 ops/sec ±1.68% (7 runs sampled)
tdegrunt.BitSet (inplace) x 1.15 ops/sec ±4.27% (7 runs sampled)
Set (inplace) x 5.35 ops/sec ±1.16% (18 runs sampled)

starting inplace union  benchmark
FastBitSet (inplace) x 112 ops/sec ±1.19% (84 runs sampled)
TypedFastBitSet (inplace) x 79.55 ops/sec ±1.29% (71 runs sampled)
SparseTypedFastBitSet (inplace) x 74.71 ops/sec ±11.95% (71 runs sampled)
infusion.BitSet.js (inplace) x 1.18 ops/sec ±1.58% (7 runs sampled)
tdegrunt.BitSet (inplace) x 1.15 ops/sec ±3.42% (7 runs sampled)
Set (inplace) x 14.07 ops/sec ±5.76% (41 runs sampled)

starting inplace intersection  benchmark
FastBitSet (inplace) x 12,358 ops/sec ±1.25% (88 runs sampled)
TypedFastBitSet (inplace) x 6,092 ops/sec ±0.40% (96 runs sampled)
SparseTypedFastBitSet (inplace) x 8,812 ops/sec ±0.53% (98 runs sampled)
infusion.BitSet.js (inplace) x 1,606 ops/sec ±0.63% (98 runs sampled)
tdegrunt.BitSet (inplace) x 1,591 ops/sec ±0.86% (86 runs sampled)
Set (inplace) x 5.40 ops/sec ±2.94% (18 runs sampled)

starting inplace difference benchmark
FastBitSet (inplace) x 11,185 ops/sec ±0.52% (95 runs sampled)
FastBitSet (inplace2) x 12,276 ops/sec ±0.51% (101 runs sampled)
TypedFastBitSet (inplace) x 5,902 ops/sec ±0.63% (100 runs sampled)
TypedFastBitSet (inplace2) x 35,722,525 ops/sec ±1.84% (99 runs sampled)
SparseTypedFastBitSet (inplace) x 9,121 ops/sec ±0.84% (98 runs sampled)
SparseTypedFastBitSet (inplace2) x 12,010,947 ops/sec ±1.72% (97 runs sampled)
infusion.BitSet.js (inplace) x 27.94 ops/sec ±9.24% (40 runs sampled)
tdegrunt.BitSet (inplace) x 26.88 ops/sec ±10.65% (38 runs sampled)
Set (inplace) x 6.87 ops/sec ±3.95% (22 runs sampled)

We benchmark the operations computing the set sizes:

starting cardinality benchmark
FastBitSet x 4,778 ops/sec ±0.73% (97 runs sampled)
TypedFastBitSet x 2,670 ops/sec ±2.20% (93 runs sampled)
SparseTypedFastBitSet x 4,444 ops/sec ±0.63% (96 runs sampled)
infusion.BitSet.js x 5,929 ops/sec ±1.12% (99 runs sampled)
tdegrunt.BitSet x 4,739 ops/sec ±2.94% (80 runs sampled)
mattkrick.fast-bitset x 5,319 ops/sec ±2.06% (91 runs sampled)

starting union cardinality query benchmark
FastBitSet (creates new bitset) x 19.79 ops/sec ±1.29% (38 runs sampled)
FastBitSet (fast way) x 69.56 ops/sec ±0.81% (74 runs sampled)
TypedFastBitSet (creates new bitset) x 25.15 ops/sec ±1.84% (47 runs sampled)
TypedFastBitSet (fast way) x 49.84 ops/sec ±1.29% (67 runs sampled)
SparseTypedFastBitSet (creates new bitset) x 34.47 ops/sec ±2.59% (61 runs sampled)
SparseTypedFastBitSet (fast way) x 66.34 ops/sec ±0.51% (71 runs sampled)
mattkrick.fast-bitset (creates new bitset) x 10.79 ops/sec ±2.25% (32 runs sampled)
Set x 6.74 ops/sec ±6.31% (22 runs sampled)

starting intersection cardinality query benchmark
FastBitSet (creates new bitset) x 973 ops/sec ±1.00% (90 runs sampled)
FastBitSet (fast way) x 4,747 ops/sec ±2.76% (93 runs sampled)
TypedFastBitSet (creates new bitset) x 1,364 ops/sec ±2.73% (83 runs sampled)
TypedFastBitSet (fast way) x 2,752 ops/sec ±1.39% (96 runs sampled)
SparseTypedFastBitSet (creates new bitset) x 1,963 ops/sec ±3.26% (79 runs sampled)
SparseTypedFastBitSet (fast way) x 3,621 ops/sec ±0.47% (97 runs sampled)
mattkrick.fast-bitset (creates new bitset) x 10.91 ops/sec ±1.68% (32 runs sampled)
Set x 7.17 ops/sec ±1.52% (22 runs sampled)

starting difference cardinality query benchmark
FastBitSet (creates new bitset) x 20.04 ops/sec ±1.42% (38 runs sampled)
FastBitSet (fast way) x 3,909 ops/sec ±1.92% (89 runs sampled)
TypedFastBitSet (creates new bitset) x 24.93 ops/sec ±1.83% (47 runs sampled)
TypedFastBitSet (fast way) x 2,696 ops/sec ±1.13% (93 runs sampled)
SparseTypedFastBitSet (creates new bitset) x 34.78 ops/sec ±2.36% (62 runs sampled)
SparseTypedFastBitSet (fast way) x 4,105 ops/sec ±1.49% (98 runs sampled)
Set x 7.30 ops/sec ±1.26% (23 runs sampled)

We conclude with other benchmarks:

starting dynamic bitmap creation benchmark
FastBitSet x 226 ops/sec ±1.24% (84 runs sampled)
TypedFastBitSet x 291 ops/sec ±1.11% (89 runs sampled)
SparseTypedFastBitSet x 186 ops/sec ±0.52% (89 runs sampled)
infusion.BitSet.js x 205 ops/sec ±0.76% (89 runs sampled)
tdegrunt.BitSet x 201 ops/sec ±0.99% (88 runs sampled)
Set x 9.32 ops/sec ±4.18% (28 runs sampled)

starting query benchmark
FastBitSet x 151,822,950 ops/sec ±2.34% (97 runs sampled)
TypedFastBitSet x 155,858,543 ops/sec ±1.15% (95 runs sampled)
SparseTypedFastBitSet x 161,645,701 ops/sec ±0.45% (100 runs sampled)
infusion.BitSet.js x 148,735,325 ops/sec ±0.67% (96 runs sampled)
tdegrunt.BitSet x 161,754,395 ops/sec ±0.42% (99 runs sampled)
mattkrick.fast-bitset x 163,421,081 ops/sec ±0.58% (100 runs sampled)
Set x 79,311,192 ops/sec ±0.47% (98 runs sampled)

starting array extraction benchmark
FastBitSet x 221 ops/sec ±0.86% (89 runs sampled)
TypedFastBitSet x 199 ops/sec ±2.38% (81 runs sampled)
SparseTypedFastBitSet x 215 ops/sec ±0.93% (87 runs sampled)
mattkrick.fast-bitset x 32.82 ops/sec ±2.71% (58 runs sampled)

starting forEach benchmark
FastBitSet x 87.98 ops/sec ±0.69% (77 runs sampled)
TypedFastBitSet x 88.98 ops/sec ±0.64% (78 runs sampled)
SparseTypedFastBitSet x 87.26 ops/sec ±0.62% (77 runs sampled)
FastBitSet (via array):
TypedFastBitSet (via array) x 5.18 ops/sec ±8.10% (18 runs sampled)
SparseTypedFastBitSet (via array) x 5.09 ops/sec ±2.49% (18 runs sampled)
mattkrick.fast-bitset x 60.89 ops/sec ±0.87% (65 runs sampled)
Set x 56.26 ops/sec ±4.53% (60 runs sampled)

starting clone benchmark
FastBitSet x 2,449 ops/sec ±1.38% (91 runs sampled)
TypedFastBitSet x 9,491 ops/sec ±2.45% (58 runs sampled)
SparseTypedFastBitSet x 14,517 ops/sec ±2.13% (71 runs sampled)
infusion.BitSet.js x 1,519 ops/sec ±2.82% (64 runs sampled)
mattkrick.fast-bitset x 113 ops/sec ±1.44% (82 runs sampled)
Set x 5.28 ops/sec ±8.09% (17 runs sampled)
```

# You might also like...

If you like this library, you might also like

- https://github.com/lemire/FastBitSet.js
- https://github.com/lemire/FastPriorityQueue.js
- https://github.com/lemire/StablePriorityQueue.js
- https://github.com/lemire/FastIntegerCompression.js
