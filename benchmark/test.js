/* performance benchmark */
/* This script expects node.js */

"use strict";

const FastBitSet = require("fastbitset");
const { TypedFastBitSet, SparseTypedFastBitSet } = require("../lib");
const BitSet = require("bitset.js");
const Benchmark = require("benchmark");
const tBitSet = require("bitset");
const fBitSet = require("fast-bitset");
const roaring = require("roaring");
const os = require("os");
const minimist = require("minimist");

const smallgap = 3;
const largegap = 210;

const genericSetChange = function (set1, set2) {
  const answer = new Set();
  if (set2.length > set1.length) {
    for (const j of set2) {
      if (!set1.has(j)) {
        answer.add(j);
      }
    }
  } else {
    for (const j of set1) {
      if (!set2.has(j)) {
        answer.add(j);
      }
    }
  }
  return answer;
};

const genericInplaceSetChange = function (set1, set2) {
  if (set2.length > set1.length) {
    for (const j of set2) {
      if (set1.has(j)) {
        set2.delete(j);
      }
    }
    return set2;
  } else {
    for (const j of set1) {
      if (set2.has(j)) {
        set1.delete(j);
      }
    }
    return set1;
  }
};

const genericSetIntersection = function (set1, set2) {
  const answer = new Set();
  if (set2.length > set1.length) {
    for (const j of set1) {
      if (set2.has(j)) {
        answer.add(j);
      }
    }
  } else {
    for (const j of set2) {
      if (set1.has(j)) {
        answer.add(j);
      }
    }
  }
  return answer;
};

const genericInplaceSetIntersection = function (set1, set2) {
  for (const j of set2) {
    if (!set1.has(j)) {
      set1.delete(j);
    }
  }
  return set1;
};

const genericSetIntersectionCard = function (set1, set2) {
  let answer = 0;
  if (set2.length > set1.length) {
    for (const j of set1) {
      if (set2.has(j)) {
        answer++;
      }
    }
  } else {
    for (const j of set2.values()) {
      if (set1.has(j)) {
        answer++;
      }
    }
  }
  return answer;
};

const genericSetUnion = function (set1, set2) {
  const answer = new Set(set1);
  for (const j of set2) {
    answer.add(j);
  }
  return answer;
};

const genericInplaceSetUnion = function (set1, set2) {
  for (const j of set2) {
    set1.add(j);
  }
  return set1;
};

const genericSetUnionCard = function (set1, set2) {
  return set1.size + set2.size - genericSetIntersectionCard(set1, set2);
};

const genericSetDifference = function (set1, set2) {
  const answer = new Set(set1);
  for (const j of set2) {
    answer.delete(j);
  }
  return answer;
};

const genericInplaceSetDifference = function (set1, set2) {
  for (const j of set2) {
    set1.delete(j);
  }
  return set1;
};

const genericSetDifferenceCard = function (set1, set2) {
  return set1.size - genericSetIntersectionCard(set1, set2);
};

const N = 1024 * 1024;

function CreateBench() {
  console.log("starting dynamic bitmap creation benchmark");
  const b = new FastBitSet();
  const tb = new TypedFastBitSet();
  const stb = new SparseTypedFastBitSet();

  let bs = new BitSet();
  const bt = new tBitSet();
  const fb = new fBitSet(smallgap * N + 5);
  for (let i = 0; i < N; i++) {
    b.add(smallgap * i + 5);
    tb.add(smallgap * i + 5);
    stb.add(smallgap * i + 5);
    bs = bs.set(smallgap * i + 5, true);
    bt.set(smallgap * i + 5);
    fb.set(smallgap * i + 5);
  }
  if (bs.cardinality() != b.size()) throw "something is off";
  if (bs.cardinality() != bt.cardinality()) throw "something is off";
  if (bs.cardinality() != fb.getCardinality()) throw "something is off";
  const suite = new Benchmark.Suite();
  // add tests
  const ms = suite
    .add("FastBitSet", function () {
      const b = new FastBitSet();
      for (let i = 0; i < N; i++) {
        b.add(smallgap * i + 5);
      }
      return b;
    })
    .add("TypedFastBitSet", function () {
      const b = new TypedFastBitSet();
      for (let i = 0; i < N; i++) {
        b.add(smallgap * i + 5);
      }
      return b;
    })
    .add("SparseTypedFastBitSet", function () {
      const b = new SparseTypedFastBitSet();
      for (let i = 0; i < N; i++) {
        b.add(smallgap * i + 5);
      }
      return b;
    })
    .add("infusion.BitSet.js", function () {
      let bs = new BitSet();
      for (let i = 0; i < N; i++) {
        bs = bs.set(smallgap * i + 5, true);
      }
      return bs;
    })
    .add("tdegrunt.BitSet", function () {
      const bt = new tBitSet();
      for (let i = 0; i < N; i++) {
        bt.set(smallgap * i + 5);
      }
      return bt;
    })
    .add("Set", function () {
      const bt = new Set();
      for (let i = 0; i < N; i++) {
        bt.add(smallgap * i + 5);
      }
      return bt;
    })
    // add listeners
    .on("cycle", function (event) {
      console.log(String(event.target));
    })
    // run async
    .run({ async: false });
}

function ArrayBench() {
  console.log("starting array extraction benchmark");
  const b = new FastBitSet();
  const tb = new TypedFastBitSet();
  const stb = new SparseTypedFastBitSet();
  let bs = new BitSet();
  const bt = new tBitSet();
  const fb = new fBitSet(smallgap * N + 5);
  for (let i = 0; i < N; i++) {
    b.add(smallgap * i + 5);
    tb.add(smallgap * i + 5);
    stb.add(smallgap * i + 5);
    bs = bs.set(smallgap * i + 5, true);
    bt.set(smallgap * i + 5);
    fb.set(smallgap * i + 5);
  }
  if (bs.cardinality() != b.size()) throw "something is off";
  if (bs.cardinality() != bt.cardinality()) throw "something is off";
  if (bs.cardinality() != fb.getCardinality()) throw "something is off";
  const suite = new Benchmark.Suite();
  // add tests
  const ms = suite
    .add("FastBitSet", function () {
      return b.array();
    })
    .add("TypedFastBitSet", function () {
      return tb.array();
    })
    .add("SparseTypedFastBitSet", function () {
      return stb.array();
    })
    // .add("infusion.BitSet.js", function () {
    // return bs.toArray();
    // })
    .add("mattkrick.fast-bitset", function () {
      return fb.getIndices();
    })
    // add listeners
    .on("cycle", function (event) {
      console.log(String(event.target));
    })
    // run async
    .run({ async: false });
}

function ForEachBench() {
  console.log("starting forEach benchmark");
  const b = new FastBitSet();
  const tb = new TypedFastBitSet();
  const stb = new TypedFastBitSet();

  let bs = new BitSet();
  const bt = new tBitSet();
  const fb = new fBitSet(smallgap * N + 5);
  const s = new Set();
  for (let i = 0; i < N; i++) {
    b.add(smallgap * i + 5);
    tb.add(smallgap * i + 5);
    stb.add(smallgap * i + 5);
    bs = bs.set(smallgap * i + 5, true);
    bt.set(smallgap * i + 5);
    fb.set(smallgap * i + 5);
    s.add(smallgap * i + 5);
  }
  let card = 0;
  for (const i in b.array()) {
    card++;
  }

  if (bs.cardinality() != b.size()) throw "something is off";
  if (bs.cardinality() != bt.cardinality()) throw "something is off";
  if (bs.cardinality() != fb.getCardinality()) throw "something is off";
  const suite = new Benchmark.Suite();
  // add tests
  const ms = suite
    .add("FastBitSet", function () {
      let card = 0;
      const inc = function () {
        card++;
      };
      b.forEach(inc);
      return card;
    })
    .add("TypedFastBitSet", function () {
      let card = 0;
      const inc = function () {
        card++;
      };
      tb.forEach(inc);
      return card;
    })
    .add("SparseTypedFastBitSet", function () {
      let card = 0;
      const inc = function () {
        card++;
      };
      stb.forEach(inc);
      return card;
    })
    .add("FastBitSet (via array)", function () {
      const card = 0;
      for (const i in b.array()) {
        card++;
      }
      return card;
    })
    .add("TypedFastBitSet (via array)", function () {
      let card = 0;
      for (const i in tb.array()) {
        card++;
      }
      return card;
    })
    .add("SparseTypedFastBitSet (via array)", function () {
      let card = 0;
      for (const i in stb.array()) {
        card++;
      }
      return card;
    })
    .add("mattkrick.fast-bitset", function () {
      let card = 0;
      const inc = function () {
        card++;
      };
      fb.forEach(inc);
      return card;
    })
    .add("Set", function () {
      let card = 0;
      const inc = function () {
        card++;
      };
      fb.forEach(inc);
      return card;
    })
    // add listeners
    .on("cycle", function (event) {
      console.log(String(event.target));
    })
    // run async
    .run({ async: false });
}

function CardBench() {
  console.log("starting cardinality benchmark");
  const b = new FastBitSet();
  const tb = new TypedFastBitSet();
  const stb = new SparseTypedFastBitSet();
  let bs = new BitSet();
  const bt = new tBitSet();
  const fb = new fBitSet(smallgap * N + 5);
  for (let i = 0; i < N; i++) {
    b.add(smallgap * i + 5);
    tb.add(smallgap * i + 5);
    stb.add(smallgap * i + 5);
    bs = bs.set(smallgap * i + 5, true);
    bt.set(smallgap * i + 5);
    fb.set(smallgap * i + 5);
  }
  if (bs.cardinality() != b.size()) throw "something is off";
  if (bs.cardinality() != bt.cardinality()) throw "something is off";
  if (bs.cardinality() != fb.getCardinality()) throw "something is off";
  const suite = new Benchmark.Suite();
  // add tests
  const ms = suite
    .add("FastBitSet", function () {
      return b.size();
    })
    .add("TypedFastBitSet", function () {
      return tb.size();
    })
    .add("SparseTypedFastBitSet", function () {
      return stb.size();
    })
    .add("infusion.BitSet.js", function () {
      return bs.cardinality();
    })
    .add("tdegrunt.BitSet", function () {
      return bt.cardinality();
    })
    .add("mattkrick.fast-bitset", function () {
      return fb.getCardinality();
    })
    // add listeners
    .on("cycle", function (event) {
      console.log(String(event.target));
    })
    // run async
    .run({ async: false });
}

function QueryBench() {
  console.log("starting query benchmark");
  const b = new FastBitSet();
  const tb = new TypedFastBitSet();
  const stb = new TypedFastBitSet();
  let bs = new BitSet();
  const bt = new tBitSet();
  const fb = new fBitSet(smallgap * N + 5);
  const s = new Set();
  for (let i = 0; i < N; i++) {
    b.add(smallgap * i + 5);
    tb.add(smallgap * i + 5);
    stb.add(smallgap * i + 5);
    bs = bs.set(smallgap * i + 5, true);
    bt.set(smallgap * i + 5);
    fb.set(smallgap * i + 5);
    s.add(smallgap * i + 5);
  }
  if (bs.cardinality() != b.size()) throw "something is off";
  if (bs.cardinality() != bt.cardinality()) throw "something is off";
  if (bs.cardinality() != fb.getCardinality()) throw "something is off";
  const suite = new Benchmark.Suite();
  // add tests
  const ms = suite
    .add("FastBitSet", function () {
      return b.has(122);
    })
    .add("TypedFastBitSet", function () {
      return tb.has(122);
    })
    .add("SparseTypedFastBitSet", function () {
      return stb.has(122);
    })
    .add("infusion.BitSet.js", function () {
      return bs.get(122);
    })
    .add("tdegrunt.BitSet", function () {
      return bt.get(122);
    })
    .add("mattkrick.fast-bitset", function () {
      return fb.get(122);
    })
    .add("Set", function () {
      return s.has(122);
    })
    // add listeners
    .on("cycle", function (event) {
      console.log(String(event.target));
    })
    // run async
    .run({ async: false });
}

function CloneBench() {
  console.log("starting clone benchmark");
  const b = new FastBitSet();
  const tb = new TypedFastBitSet();
  const stb = new SparseTypedFastBitSet();
  let bs = new BitSet();
  const bt = new tBitSet();
  const fb = new fBitSet(smallgap * N + 5);
  const s = new Set();
  for (let i = 0; i < N; i++) {
    b.add(smallgap * i + 5);
    tb.add(smallgap * i + 5);
    stb.add(smallgap * i + 5);
    bs = bs.set(smallgap * i + 5, true);
    bt.set(smallgap * i + 5);
    fb.set(smallgap * i + 5);
    s.add(smallgap * i + 5);
  }
  if (bs.cardinality() != b.size()) throw "something is off";
  if (bs.cardinality() != bt.cardinality()) throw "something is off";
  if (bs.cardinality() != fb.getCardinality()) throw "something is off";
  const suite = new Benchmark.Suite();
  // add tests
  const ms = suite
    .add("FastBitSet", function () {
      return b.clone();
    })
    .add("TypedFastBitSet", function () {
      return tb.clone();
    })
    .add("SparseTypedFastBitSet", function () {
      return stb.clone();
    })
    .add("infusion.BitSet.js", function () {
      return bs.clone();
    })
    .add("mattkrick.fast-bitset", function () {
      return fb.clone();
    })
    .add("Set", function () {
      return new Set(s);
    })
    // add listeners
    .on("cycle", function (event) {
      console.log(String(event.target));
    })
    // run async
    .run({ async: false });
}

function AndBench() {
  console.log("starting intersection query benchmark");
  const b1 = new FastBitSet();
  const tb1 = new TypedFastBitSet();
  const stb1 = new SparseTypedFastBitSet();
  const bt1 = new tBitSet();
  const r1 = new roaring.RoaringBitmap32();
  const r2 = new roaring.RoaringBitmap32();
  const fb1 = new fBitSet(largegap * N + 5);
  const b2 = new FastBitSet();
  const tb2 = new TypedFastBitSet();
  const stb2 = new SparseTypedFastBitSet();
  const bt2 = new tBitSet();
  const fb2 = new fBitSet(largegap * N + 5);
  const s1 = new Set();
  const s2 = new Set();
  let bs1 = new BitSet();
  let bs2 = new BitSet();

  for (let i = 0; i < N; i++) {
    b1.add(smallgap * i + 5);
    tb1.add(smallgap * i + 5);
    stb1.add(smallgap * i + 5);
    bs1 = bs1.set(smallgap * i + 5, true);
    bt1.set(smallgap * i + 5);
    fb1.set(smallgap * i + 5);
    s1.add(smallgap * i + 5);
    r1.add(smallgap * i + 5);
    r2.add(largegap * i + 5);
    b2.add(largegap * i + 5);
    tb2.add(largegap * i + 5);
    stb2.add(largegap * i + 5);
    bs2 = bs2.set(largegap * i + 5, true);
    bt2.set(largegap * i + 5);
    fb2.set(largegap * i + 5);
    s2.add(largegap * i + 5);
  }
  if (bs1.cardinality() != b1.size()) throw "something is off";
  if (bs1.cardinality() != bt1.cardinality()) throw "something is off";
  if (bs1.cardinality() != fb1.getCardinality()) throw "something is off";
  if (bs2.cardinality() != b2.size()) throw "something is off";
  if (bs2.cardinality() != bt2.cardinality()) throw "something is off";
  if (bs2.cardinality() != fb2.getCardinality()) throw "something is off";

  const suite = new Benchmark.Suite();
  // add tests
  const ms = suite
    .add("FastBitSet (creates new bitset)", function () {
      return b1.new_intersection(b2);
    })
    .add("TypedFastBitSet (creates new bitset)", function () {
      return tb1.new_intersection(tb2);
    })
    .add("SparseTypedFastBitSet (creates new bitset)", function () {
      return stb1.new_intersection(stb2);
    })
    .add("mattkrick.fast-bitset  (creates new bitset)", function () {
      return fb1.and(fb2);
    })

    .add("roaring", function () {
      return roaring.RoaringBitmap32.and(r1, r2);
    })
    .add("Set", function () {
      return genericSetIntersection(s1, s2);
    })
    // add listeners
    .on("cycle", function (event) {
      console.log(String(event.target));
    })
    // run async
    .run({ async: false });
}

function AndCardBench() {
  console.log("starting intersection cardinality query benchmark");
  const b1 = new FastBitSet();
  const tb1 = new TypedFastBitSet();
  const stb1 = new SparseTypedFastBitSet();
  const bt1 = new tBitSet();
  const r1 = new roaring.RoaringBitmap32();
  const r2 = new roaring.RoaringBitmap32();
  const fb1 = new fBitSet(largegap * N + 5);
  const b2 = new FastBitSet();
  const tb2 = new TypedFastBitSet();
  const stb2 = new SparseTypedFastBitSet();
  const bt2 = new tBitSet();
  const fb2 = new fBitSet(largegap * N + 5);
  const s1 = new Set();
  const s2 = new Set();
  let bs1 = new BitSet();
  let bs2 = new BitSet();

  for (let i = 0; i < N; i++) {
    b1.add(smallgap * i + 5);
    tb1.add(smallgap * i + 5);
    stb1.add(smallgap * i + 5);
    bs1 = bs1.set(smallgap * i + 5, true);
    bt1.set(smallgap * i + 5);
    fb1.set(smallgap * i + 5);
    s1.add(smallgap * i + 5);
    r1.add(smallgap * i + 5);
    r2.add(largegap * i + 5);
    b2.add(largegap * i + 5);
    tb2.add(largegap * i + 5);
    stb2.add(largegap * i + 5);
    bs2 = bs2.set(largegap * i + 5, true);
    bt2.set(largegap * i + 5);
    fb2.set(largegap * i + 5);
    s2.add(largegap * i + 5);
  }
  if (genericSetIntersectionCard(s1, s2) != b1.intersection_size(b2))
    throw "potential bug";
  if (bs1.cardinality() != b1.size()) throw "something is off";
  if (bs1.cardinality() != bt1.cardinality()) throw "something is off";
  if (bs1.cardinality() != fb1.getCardinality()) throw "something is off";
  if (bs2.cardinality() != b2.size()) throw "something is off";
  if (bs2.cardinality() != bt2.cardinality()) throw "something is off";
  if (bs2.cardinality() != fb2.getCardinality()) throw "something is off";

  const suite = new Benchmark.Suite();
  // add tests
  const ms = suite
    .add("FastBitSet (creates new bitset)", function () {
      return b1.new_intersection(b2).size();
    })
    .add("FastBitSet (fast way)", function () {
      return b1.intersection_size(b2);
    })
    .add("TypedFastBitSet (creates new bitset)", function () {
      return tb1.new_intersection(tb2).size();
    })
    .add("TypedFastBitSet (fast way)", function () {
      return tb1.intersection_size(tb2);
    })
    .add("SparseTypedFastBitSet (creates new bitset)", function () {
      return stb1.new_intersection(stb2).size();
    })
    .add("SparseTypedFastBitSet (fast way)", function () {
      return stb1.intersection_size(stb2);
    })
    .add("roaring", function () {
      return r1.andCardinality(r2);
    })
    .add("mattkrick.fast-bitset (creates new bitset)", function () {
      return fb1.and(fb2).getCardinality();
    })
    .add("Set", function () {
      return genericSetIntersectionCard(s1, s2);
    })
    // add listeners
    .on("cycle", function (event) {
      console.log(String(event.target));
    })
    // run async
    .run({ async: false });
}

function OrCardBench() {
  console.log("starting union cardinality query benchmark");
  const b1 = new FastBitSet();
  const tb1 = new TypedFastBitSet();
  const stb1 = new SparseTypedFastBitSet();
  const bt1 = new tBitSet();
  const r1 = new roaring.RoaringBitmap32();
  const r2 = new roaring.RoaringBitmap32();
  const fb1 = new fBitSet(largegap * N + 5);
  const b2 = new FastBitSet();
  const tb2 = new TypedFastBitSet();
  const stb2 = new SparseTypedFastBitSet();
  const bt2 = new tBitSet();
  const fb2 = new fBitSet(largegap * N + 5);
  const s1 = new Set();
  const s2 = new Set();
  let bs1 = new BitSet();
  let bs2 = new BitSet();
  for (let i = 0; i < N; i++) {
    b1.add(smallgap * i + 5);
    tb1.add(smallgap * i + 5);
    stb1.add(smallgap * i + 5);
    bs1 = bs1.set(smallgap * i + 5, true);
    bt1.set(smallgap * i + 5);
    fb1.set(smallgap * i + 5);
    s1.add(smallgap * i + 5);
    r1.add(smallgap * i + 5);
    r2.add(largegap * i + 5);
    b2.add(largegap * i + 5);
    tb2.add(largegap * i + 5);
    stb2.add(largegap * i + 5);
    bs2 = bs2.set(largegap * i + 5, true);
    bt2.set(largegap * i + 5);
    fb2.set(largegap * i + 5);
    s2.add(largegap * i + 5);
  }
  if (bs1.cardinality() != b1.size()) throw "something is off";
  if (bs1.cardinality() != bt1.cardinality()) throw "something is off";
  if (bs1.cardinality() != fb1.getCardinality()) throw "something is off";
  if (bs2.cardinality() != b2.size()) throw "something is off";
  if (bs2.cardinality() != bt2.cardinality()) throw "something is off";
  if (bs2.cardinality() != fb2.getCardinality()) throw "something is off";

  const suite = new Benchmark.Suite();
  // add tests
  const ms = suite
    .add("FastBitSet (creates new bitset)", function () {
      return b1.new_union(b2).size();
    })
    .add("FastBitSet (fast way)", function () {
      return b1.union_size(b2);
    })
    .add("TypedFastBitSet (creates new bitset)", function () {
      return tb1.new_union(tb2).size();
    })
    .add("TypedFastBitSet (fast way)", function () {
      return tb1.union_size(tb2);
    })
    .add("SparseTypedFastBitSet (creates new bitset)", function () {
      return stb1.new_union(stb2).size();
    })
    .add("SparseTypedFastBitSet (fast way)", function () {
      return stb1.union_size(stb2);
    })
    .add("roaring", function () {
      return r1.orCardinality(r2);
    })
    .add("mattkrick.fast-bitset (creates new bitset)", function () {
      return fb1.or(fb2).getCardinality();
    })
    .add("Set", function () {
      return genericSetUnionCard(s1, s2);
    })
    // add listeners
    .on("cycle", function (event) {
      console.log(String(event.target));
    })
    // run async
    .run({ async: false });
}

function DifferenceCardBench() {
  console.log("starting difference cardinality query benchmark");
  const b1 = new FastBitSet();
  const tb1 = new TypedFastBitSet();
  const stb1 = new SparseTypedFastBitSet();
  const bt1 = new tBitSet();
  const r1 = new roaring.RoaringBitmap32();
  const r2 = new roaring.RoaringBitmap32();
  const fb1 = new fBitSet(largegap * N + 5);
  const b2 = new FastBitSet();
  const tb2 = new TypedFastBitSet();
  const stb2 = new SparseTypedFastBitSet();
  const bt2 = new tBitSet();
  const fb2 = new fBitSet(largegap * N + 5);
  const s1 = new Set();
  const s2 = new Set();
  let bs1 = new BitSet();
  let bs2 = new BitSet();
  for (let i = 0; i < N; i++) {
    b1.add(smallgap * i + 5);
    tb1.add(smallgap * i + 5);
    stb1.add(smallgap * i + 5);
    bs1 = bs1.set(smallgap * i + 5, true);
    bt1.set(smallgap * i + 5);
    fb1.set(smallgap * i + 5);
    s1.add(smallgap * i + 5);
    r1.add(smallgap * i + 5);
    r2.add(largegap * i + 5);
    b2.add(largegap * i + 5);
    tb2.add(largegap * i + 5);
    stb2.add(largegap * i + 5);
    bs2 = bs2.set(largegap * i + 5, true);
    bt2.set(largegap * i + 5);
    fb2.set(largegap * i + 5);
    s2.add(largegap * i + 5);
  }
  if (bs1.cardinality() != b1.size()) throw "something is off";
  if (bs1.cardinality() != bt1.cardinality()) throw "something is off";
  if (bs1.cardinality() != fb1.getCardinality()) throw "something is off";
  if (bs2.cardinality() != b2.size()) throw "something is off";
  if (bs2.cardinality() != bt2.cardinality()) throw "something is off";
  if (bs2.cardinality() != fb2.getCardinality()) throw "something is off";

  const suite = new Benchmark.Suite();
  // add tests
  const ms = suite
    .add("FastBitSet (creates new bitset)", function () {
      return b1.new_union(b2).size();
    })
    .add("FastBitSet (fast way)", function () {
      return b1.difference_size(b2);
    })
    .add("TypedFastBitSet (creates new bitset)", function () {
      return tb1.new_union(tb2).size();
    })
    .add("TypedFastBitSet (fast way)", function () {
      return tb1.difference_size(tb2);
    })
    .add("SparseTypedFastBitSet (creates new bitset)", function () {
      return stb1.new_union(stb2).size();
    })
    .add("SparseTypedFastBitSet (fast way)", function () {
      return stb1.difference_size(stb2);
    })
    .add("roaring", function () {
      return r1.andNotCardinality(r2);
    })
    .add("Set", function () {
      return genericSetDifferenceCard(s1, s2);
    })
    // add listeners
    .on("cycle", function (event) {
      console.log(String(event.target));
    })
    // run async
    .run({ async: false });
}

function OrInplaceBench() {
  console.log("starting inplace union  benchmark");
  const b1 = new FastBitSet();
  const tb1 = new TypedFastBitSet();
  const stb1 = new SparseTypedFastBitSet();
  let bs1 = new BitSet();
  const bt1 = new tBitSet();
  const r1 = new roaring.RoaringBitmap32();
  const r2 = new roaring.RoaringBitmap32();
  const fb1 = new fBitSet(largegap * N + 5);
  const b2 = new FastBitSet();
  const tb2 = new TypedFastBitSet();
  const stb2 = new SparseTypedFastBitSet();
  let bs2 = new BitSet();
  const bt2 = new tBitSet();
  const fb2 = new fBitSet(largegap * N + 5);
  const s1 = new Set();
  const s2 = new Set();
  for (let i = 0; i < N; i++) {
    b1.add(smallgap * i + 5);
    tb1.add(smallgap * i + 5);
    stb1.add(smallgap * i + 5);
    bs1 = bs1.set(smallgap * i + 5, true);
    bt1.set(smallgap * i + 5);
    fb1.set(smallgap * i + 5);
    s1.add(smallgap * i + 5);
    r1.add(smallgap * i + 5);
    r2.add(largegap * i + 5);
    b2.add(largegap * i + 5);
    tb2.add(largegap * i + 5);
    stb2.add(largegap * i + 5);
    bs2 = bs2.set(largegap * i + 5, true);
    bt2.set(largegap * i + 5);
    fb2.set(largegap * i + 5);
    s2.add(largegap * i + 5);
  }
  if (bs1.cardinality() != b1.size()) throw "something is off";
  if (bs1.cardinality() != bt1.cardinality()) throw "something is off";
  if (bs1.cardinality() != fb1.getCardinality()) throw "something is off";
  if (bs2.cardinality() != b2.size()) throw "something is off";
  if (bs2.cardinality() != bt2.cardinality()) throw "something is off";
  if (bs2.cardinality() != fb2.getCardinality()) throw "something is off";

  const suite = new Benchmark.Suite();
  // add tests
  const ms = suite
    .add("FastBitSet (inplace)", function () {
      return b1.union(b2);
    })
    .add("TypedFastBitSet (inplace)", function () {
      return tb1.union(tb2);
    })
    .add("SparseTypedFastBitSet (inplace)", function () {
      return stb1.union(tb2);
    })
    .add("infusion.BitSet.js (inplace)", function () {
      return bs1.or(bs2);
    })
    .add("tdegrunt.BitSet (inplace)", function () {
      return bt1.or(bt2);
    })
    .add("roaring", function () {
      return r1.orInPlace(r2);
    })
    .add("Set (inplace)", function () {
      return genericInplaceSetUnion(s1, s2);
    })
    // add listeners
    .on("cycle", function (event) {
      console.log(String(event.target));
    })
    // run async
    .run({ async: false });
}

function AndInplaceBench() {
  console.log("starting inplace intersection  benchmark");
  const b1 = new FastBitSet();
  const tb1 = new TypedFastBitSet();
  const stb1 = new SparseTypedFastBitSet();
  let bs1 = new BitSet();
  const bt1 = new tBitSet();
  const r1 = new roaring.RoaringBitmap32();
  const r2 = new roaring.RoaringBitmap32();
  const fb1 = new fBitSet(largegap * N + 5);
  const b2 = new FastBitSet();
  const tb2 = new TypedFastBitSet();
  const stb2 = new SparseTypedFastBitSet();
  let bs2 = new BitSet();
  const bt2 = new tBitSet();
  const fb2 = new fBitSet(largegap * N + 5);
  const s1 = new Set();
  const s2 = new Set();
  for (let i = 0; i < N; i++) {
    b1.add(smallgap * i + 5);
    tb1.add(smallgap * i + 5);
    stb1.add(smallgap * i + 5);
    bs1 = bs1.set(smallgap * i + 5, true);
    bt1.set(smallgap * i + 5);
    fb1.set(smallgap * i + 5);
    s1.add(smallgap * i + 5);
    r1.add(smallgap * i + 5);
    r2.add(largegap * i + 5);
    b2.add(largegap * i + 5);
    tb2.add(largegap * i + 5);
    stb2.add(largegap * i + 5);
    bs2 = bs2.set(largegap * i + 5, true);
    bt2.set(largegap * i + 5);
    fb2.set(largegap * i + 5);
    s2.add(largegap * i + 5);
  }
  if (bs1.cardinality() != b1.size()) throw "something is off";
  if (bs1.cardinality() != bt1.cardinality()) throw "something is off";
  if (bs1.cardinality() != fb1.getCardinality()) throw "something is off";
  if (bs2.cardinality() != b2.size()) throw "something is off";
  if (bs2.cardinality() != bt2.cardinality()) throw "something is off";
  if (bs2.cardinality() != fb2.getCardinality()) throw "something is off";
  b1.intersection(b2);
  bt1.and(bt2);
  genericInplaceSetIntersection(s1, s2);
  const suite = new Benchmark.Suite();
  // add tests
  const ms = suite
    .add("FastBitSet (inplace)", function () {
      return b1.intersection(b2);
    })
    .add("TypedFastBitSet (inplace)", function () {
      return tb1.intersection(tb2);
    })
    .add("SparseTypedFastBitSet (inplace)", function () {
      return stb1.intersection(tb2);
    })
    .add("infusion.BitSet.js (inplace)", function () {
      return bs1.and(bs2);
    })
    .add("tdegrunt.BitSet (inplace)", function () {
      return bt1.and(bt2);
    })
    .add("roaring", function () {
      return r1.andInPlace(r2);
    })
    .add("Set (inplace)", function () {
      return genericInplaceSetIntersection(s1, s2);
    })
    // add listeners
    .on("cycle", function (event) {
      console.log(String(event.target));
    })
    // run async
    .run({ async: false });
}

function AndNotInplaceBench() {
  console.log("starting inplace difference benchmark");
  const b1 = new FastBitSet();
  const bb1 = new FastBitSet();
  const tb1 = new TypedFastBitSet();
  const tbb1 = new TypedFastBitSet();
  const stb1 = new SparseTypedFastBitSet();
  const stbb1 = new SparseTypedFastBitSet();
  let bs1 = new BitSet();
  const bt1 = new tBitSet();
  const r1 = new roaring.RoaringBitmap32();
  const r2 = new roaring.RoaringBitmap32();
  const fb1 = new fBitSet(largegap * N + 5);
  const b2 = new FastBitSet();
  const bb2 = new FastBitSet();
  const tb2 = new TypedFastBitSet();
  const tbb2 = new TypedFastBitSet();
  const stb2 = new SparseTypedFastBitSet();
  const stbb2 = new SparseTypedFastBitSet();
  let bs2 = new BitSet();
  const bt2 = new tBitSet();
  const fb2 = new fBitSet(largegap * N + 5);
  const s1 = new Set();
  const s2 = new Set();
  for (let i = 0; i < N; i++) {
    b1.add(smallgap * i + 5);
    bb1.add(smallgap * i + 5);
    tb1.add(smallgap * i + 5);
    stb1.add(smallgap * i + 5);
    bs1 = bs1.set(smallgap * i + 5, true);
    bt1.set(smallgap * i + 5);
    fb1.set(smallgap * i + 5);
    s1.add(smallgap * i + 5);
    r1.add(smallgap * i + 5);
    r2.add(largegap * i + 5);
    b2.add(largegap * i + 5);
    bb2.add(largegap * i + 5);
    tb2.add(largegap * i + 5);
    stb2.add(largegap * i + 5);
    bs2 = bs2.set(largegap * i + 5, true);
    bt2.set(largegap * i + 5);
    fb2.set(largegap * i + 5);
    s2.add(largegap * i + 5);
  }
  if (bs1.cardinality() != b1.size()) throw "something is off";
  if (bs1.cardinality() != bb1.size()) throw "something is off";
  if (bs1.cardinality() != bt1.cardinality()) throw "something is off";
  if (bs1.cardinality() != fb1.getCardinality()) throw "something is off";
  if (bs2.cardinality() != b2.size()) throw "something is off";
  if (bs2.cardinality() != bb2.size()) throw "something is off";
  if (bs2.cardinality() != bt2.cardinality()) throw "something is off";
  if (bs2.cardinality() != fb2.getCardinality()) throw "something is off";

  b1.difference(b2);
  bb1.difference2(bb2);
  bt1.andNot(bt2);
  genericInplaceSetDifference(s1, s2);
  const suite = new Benchmark.Suite();
  // add tests
  const ms = suite
    .add("FastBitSet (inplace)", function () {
      return b1.difference(b2);
    })
    .add("FastBitSet (inplace2)", function () {
      return bb1.difference2(bb2);
    })
    .add("TypedFastBitSet (inplace)", function () {
      return tb1.difference(tb2);
    })
    .add("TypedFastBitSet (inplace2)", function () {
      return tbb1.difference2(tbb2);
    })
    .add("SparseTypedFastBitSet (inplace)", function () {
      return stb1.difference(stb2);
    })
    .add("SparseTypedFastBitSet (inplace2)", function () {
      return stbb1.difference2(stbb2);
    })
    .add("infusion.BitSet.js (inplace)", function () {
      return bs1.andNot(bs2);
    })
    .add("tdegrunt.BitSet (inplace)", function () {
      return bt1.andNot(bt2);
    })
    .add("roaring", function () {
      return r1.andNotInPlace(r2);
    })
    .add("Set (inplace)", function () {
      return genericInplaceSetDifference(s1, s2);
    })
    // add listeners
    .on("cycle", function (event) {
      console.log(String(event.target));
    })
    // run async
    .run({ async: false });
}

function OrBench() {
  console.log("starting union query benchmark");
  const b1 = new FastBitSet();
  const tb1 = new TypedFastBitSet();
  const stb1 = new SparseTypedFastBitSet();
  let bs1 = new BitSet();
  const bt1 = new tBitSet();
  const r1 = new roaring.RoaringBitmap32();
  const r2 = new roaring.RoaringBitmap32();
  const fb1 = new fBitSet(largegap * N + 5);
  const b2 = new FastBitSet();
  const tb2 = new TypedFastBitSet();
  const stb2 = new SparseTypedFastBitSet();
  let bs2 = new BitSet();
  const bt2 = new tBitSet();
  const fb2 = new fBitSet(largegap * N + 5);
  const s1 = new Set();
  const s2 = new Set();
  for (let i = 0; i < N; i++) {
    b1.add(smallgap * i + 5);
    tb1.add(smallgap * i + 5);
    stb1.add(smallgap * i + 5);
    bs1 = bs1.set(smallgap * i + 5, true);
    bt1.set(smallgap * i + 5);
    fb1.set(smallgap * i + 5);
    s1.add(smallgap * i + 5);
    r1.add(smallgap * i + 5);
    r2.add(largegap * i + 5);
    b2.add(largegap * i + 5);
    tb2.add(largegap * i + 5);
    stb2.add(largegap * i + 5);
    bs2 = bs2.set(largegap * i + 5, true);
    bt2.set(largegap * i + 5);
    fb2.set(largegap * i + 5);
    s2.add(largegap * i + 5);
  }
  if (bs1.cardinality() != b1.size()) throw "something is off";
  if (bs1.cardinality() != bt1.cardinality()) throw "something is off";
  if (bs1.cardinality() != fb1.getCardinality()) throw "something is off";
  if (bs2.cardinality() != b2.size()) throw "something is off";
  if (bs2.cardinality() != bt2.cardinality()) throw "something is off";
  if (bs2.cardinality() != fb2.getCardinality()) throw "something is off";
  roaring.RoaringBitmap32.or(r1, r2);
  const suite = new Benchmark.Suite();
  // add tests
  const ms = suite
    .add("roaring", function () {
      return roaring.RoaringBitmap32.or(r1, r2);
    })
    .add("FastBitSet (creates new bitset)", function () {
      return b1.new_union(b2);
    })
    .add("TypedFastBitSet (creates new bitset)", function () {
      return tb1.new_union(tb2);
    })
    .add("SparseTypedFastBitSet (creates new bitset)", function () {
      return stb1.new_union(stb2);
    })
    .add("mattkrick.fast-bitset (creates new bitset)", function () {
      return fb1.or(fb2);
    })
    .add("Set", function () {
      return genericSetUnion(s1, s2);
    })
    // add listeners
    .on("cycle", function (event) {
      console.log(String(event.target));
    })
    // run async
    .run({ async: false });
}

function DifferenceBench() {
  console.log("starting difference query benchmark");
  const b1 = new FastBitSet();
  const tb1 = new TypedFastBitSet();
  const stb1 = new SparseTypedFastBitSet();
  let bs1 = new BitSet();
  const bt1 = new tBitSet();
  const r1 = new roaring.RoaringBitmap32();
  const r2 = new roaring.RoaringBitmap32();
  const fb1 = new fBitSet(largegap * N + 5);
  const b2 = new FastBitSet();
  const tb2 = new TypedFastBitSet();
  const stb2 = new SparseTypedFastBitSet();
  let bs2 = new BitSet();
  const bt2 = new tBitSet();
  const fb2 = new fBitSet(largegap * N + 5);
  const s1 = new Set();
  const s2 = new Set();
  for (let i = 0; i < N; i++) {
    b1.add(smallgap * i + 5);
    tb1.add(smallgap * i + 5);
    stb1.add(smallgap * i + 5);
    bs1 = bs1.set(smallgap * i + 5, true);
    bt1.set(smallgap * i + 5);
    fb1.set(smallgap * i + 5);
    s1.add(smallgap * i + 5);
    r1.add(smallgap * i + 5);
    r2.add(largegap * i + 5);
    b2.add(largegap * i + 5);
    tb2.add(largegap * i + 5);
    stb2.add(largegap * i + 5);
    bs2 = bs2.set(largegap * i + 5, true);
    bt2.set(largegap * i + 5);
    fb2.set(largegap * i + 5);
    s2.add(largegap * i + 5);
  }
  if (bs1.cardinality() != b1.size()) throw "something is off";
  if (bs1.cardinality() != bt1.cardinality()) throw "something is off";
  if (bs1.cardinality() != fb1.getCardinality()) throw "something is off";
  if (bs2.cardinality() != b2.size()) throw "something is off";
  if (bs2.cardinality() != bt2.cardinality()) throw "something is off";
  if (bs2.cardinality() != fb2.getCardinality()) throw "something is off";
  const suite = new Benchmark.Suite();
  // add tests
  const ms = suite
    .add("FastBitSet (creates new bitset)", function () {
      return b1.clone().difference(b2);
    })
    .add("TypedFastBitSet (creates new bitset)", function () {
      return tb1.clone().difference(tb2);
    })
    .add("SparseTypedFastBitSet (creates new bitset)", function () {
      return stb1.clone().difference(stb2);
    })
    .add("Set", function () {
      return genericSetDifference(s1, s2);
    })
    //.add('roaring', function() {
    //       return roaring.RoaringBitmap32.andNot(r1,r2);
    // })
    // add listeners
    .on("cycle", function (event) {
      console.log(String(event.target));
    })
    // run async
    .run({ async: false });
}

function XORInplaceBench() {
  console.log("starting inplace change (XOR) benchmark");
  const b1 = new FastBitSet();
  const tb1 = new TypedFastBitSet();
  const stb1 = new SparseTypedFastBitSet();
  let bs1 = new BitSet();
  const bt1 = new tBitSet();
  const r1 = new roaring.RoaringBitmap32();
  const r2 = new roaring.RoaringBitmap32();
  const fb1 = new fBitSet(largegap * N + 5);
  const b2 = new FastBitSet();
  const tb2 = new TypedFastBitSet();
  const stb2 = new SparseTypedFastBitSet();
  let bs2 = new BitSet();
  const bt2 = new tBitSet();
  const fb2 = new fBitSet(largegap * N + 5);
  const s1 = new Set();
  const s2 = new Set();
  for (let i = 0; i < N; i++) {
    b1.add(smallgap * i + 5);
    tb1.add(smallgap * i + 5);
    stb1.add(smallgap * i + 5);
    bs1 = bs1.set(smallgap * i + 5, true);
    bt1.set(smallgap * i + 5);
    fb1.set(smallgap * i + 5);
    s1.add(smallgap * i + 5);
    r1.add(smallgap * i + 5);
    r2.add(largegap * i + 5);
    b2.add(largegap * i + 5);
    tb2.add(largegap * i + 5);
    stb2.add(largegap * i + 5);
    bs2 = bs2.set(largegap * i + 5, true);
    bt2.set(largegap * i + 5);
    fb2.set(largegap * i + 5);
    s2.add(largegap * i + 5);
  }
  if (bs1.cardinality() != b1.size()) throw "something is off";
  if (bs1.cardinality() != bt1.cardinality()) throw "something is off";
  if (bs1.cardinality() != fb1.getCardinality()) throw "something is off";
  if (bs2.cardinality() != b2.size()) throw "something is off";
  if (bs2.cardinality() != bt2.cardinality()) throw "something is off";
  if (bs2.cardinality() != fb2.getCardinality()) throw "something is off";
  b1.change(b2);
  bt1.xor(bt2);
  genericInplaceSetChange(s1, s2);
  const suite = new Benchmark.Suite();
  // add tests
  const ms = suite
    .add("FastBitSet (inplace)", function () {
      return b1.change(b2);
    })
    .add("TypedFastBitSet (inplace)", function () {
      return tb1.change(tb2);
    })
    .add("SparseTypedFastBitSet (inplace)", function () {
      return stb1.change(stb2);
    })
    .add("infusion.BitSet.js (inplace)", function () {
      return bs1.xor(bs2);
    })
    .add("tdegrunt.BitSet (inplace)", function () {
      return bt1.xor(bt2);
    })
    .add("roaring", function () {
      return r1.xorInPlace(r2);
    })
    .add("Set (inplace)", function () {
      return genericInplaceSetChange(s1, s2);
    })
    // add listeners
    .on("cycle", function (event) {
      console.log(String(event.target));
    })
    // run async
    .run({ async: false });
}

function XORBench() {
  console.log("starting change (XOR) query benchmark");
  const b1 = new FastBitSet();
  const tb1 = new TypedFastBitSet();
  const stb1 = new SparseTypedFastBitSet();
  let bs1 = new BitSet();
  const bt1 = new tBitSet();
  const r1 = new roaring.RoaringBitmap32();
  const r2 = new roaring.RoaringBitmap32();
  const fb1 = new fBitSet(largegap * N + 5);
  const b2 = new FastBitSet();
  const tb2 = new TypedFastBitSet();
  const stb2 = new SparseTypedFastBitSet();
  let bs2 = new BitSet();
  const bt2 = new tBitSet();
  const fb2 = new fBitSet(largegap * N + 5);
  const s1 = new Set();
  const s2 = new Set();
  for (let i = 0; i < N; i++) {
    b1.add(smallgap * i + 5);
    tb1.add(smallgap * i + 5);
    stb1.add(smallgap * i + 5);
    bs1 = bs1.set(smallgap * i + 5, true);
    bt1.set(smallgap * i + 5);
    fb1.set(smallgap * i + 5);
    s1.add(smallgap * i + 5);
    r1.add(smallgap * i + 5);
    r2.add(largegap * i + 5);
    b2.add(largegap * i + 5);
    tb2.add(largegap * i + 5);
    stb2.add(largegap * i + 5);
    bs2 = bs2.set(largegap * i + 5, true);
    bt2.set(largegap * i + 5);
    fb2.set(largegap * i + 5);
    s2.add(largegap * i + 5);
  }
  if (bs1.cardinality() != b1.size()) throw "something is off";
  if (bs1.cardinality() != bt1.cardinality()) throw "something is off";
  if (bs1.cardinality() != fb1.getCardinality()) throw "something is off";
  if (bs2.cardinality() != b2.size()) throw "something is off";
  if (bs2.cardinality() != bt2.cardinality()) throw "something is off";
  if (bs2.cardinality() != fb2.getCardinality()) throw "something is off";
  roaring.RoaringBitmap32.xor(r1, r2);
  const suite = new Benchmark.Suite();
  // add tests
  const ms = suite
    .add("roaring", function () {
      return roaring.RoaringBitmap32.xor(r1, r2);
    })
    .add("FastBitSet (creates new bitset)", function () {
      return b1.new_change(b2);
    })
    .add("TypedFastBitSet (creates new bitset)", function () {
      return tb1.new_change(tb2);
    })
    .add("SparseTypedFastBitSet (creates new bitset)", function () {
      return stb1.new_change(stb2);
    })
    .add("mattkrick.fast-bitset (creates new bitset)", function () {
      return fb1.xor(fb2);
    })
    .add("Set", function () {
      return genericSetChange(s1, s2);
    })
    // add listeners
    .on("cycle", function (event) {
      console.log(String(event.target));
    })
    // run async
    .run({ async: false });
}

const benchmarks = {
  "or": { fn: OrBench, desc: "union (new bitmap)" },
  "xor": { fn: XORBench, desc: "change/XOR (new bitmap)" },
  "and": { fn: AndBench, desc: "intersection (new bitmap)" },
  "difference": { fn: DifferenceBench, desc: "difference (new bitmap)" },
  "xor-inplace": { fn: XORInplaceBench, desc: "change/XOR (in-place)" },
  "or-inplace": { fn: OrInplaceBench, desc: "union (in-place)" },
  "and-inplace": { fn: AndInplaceBench, desc: "intersection (in-place)" },
  "andnot-inplace": { fn: AndNotInplaceBench, desc: "difference (in-place)" },
  "cardinality": { fn: CardBench, desc: "cardinality / size()" },
  "or-card": { fn: OrCardBench, desc: "union cardinality" },
  "and-card": { fn: AndCardBench, desc: "intersection cardinality" },
  "difference-card": { fn: DifferenceCardBench, desc: "difference cardinality" },
  "create": { fn: CreateBench, desc: "dynamic bitmap creation" },
  "query": { fn: QueryBench, desc: "has() query" },
  "array": { fn: ArrayBench, desc: "array extraction" },
  "foreach": { fn: ForEachBench, desc: "forEach iteration" },
  "clone": { fn: CloneBench, desc: "clone" },
};

const main = function () {
  const args = minimist(process.argv.slice(2));

  if (args.list) {
    console.log("Available benchmarks:");
    for (const [name, { desc }] of Object.entries(benchmarks)) {
      console.log(`  ${name.padEnd(20)} ${desc}`);
    }
    return;
  }

  const selected = args.select
    ? Object.entries(benchmarks).filter(([name, { desc }]) =>
        name.includes(args.select) || desc.toLowerCase().includes(args.select.toLowerCase())
      )
    : Object.entries(benchmarks);

  if (selected.length === 0) {
    console.log(`No benchmarks matching "${args.select}". Use --list to see available benchmarks.`);
    return;
  }

  function tryVersion(pkg) {
    try { return require(pkg + "/package.json").version; } catch { return ""; }
  }
  console.log("Benchmarking against:");
  console.log(
    "TypedFastBitSet.js: https://github.com/lemire/TypedFastBitSet.js"
  );
  console.log("roaring: https://www.npmjs.com/package/roaring");
  console.log(
    "infusion.BitSet.js from https://github.com/infusion/BitSet.js",
    tryVersion("bitset.js")
  );
  console.log(
    "tdegrunt.BitSet from https://github.com/tdegrunt/bitset",
    tryVersion("bitset")
  );
  console.log(
    "mattkrick.fast-bitset from https://github.com/mattkrick/fast-bitset",
    tryVersion("fast-bitset")
  );
  console.log("standard Set object from JavaScript");
  console.log("");
  console.log(
    "Not all libraries support all operations. We benchmark what is available."
  );
  console.log("");
  console.log(
    "Platform: " + process.platform + " " + os.release() + " " + process.arch
  );
  console.log(os.cpus()[0]["model"]);
  console.log(
    "Node version " +
      process.versions.node +
      ", v8 version " +
      process.versions.v8
  );
  console.log();

  for (const [name, { fn, desc }] of selected) {
    fn();
    console.log("");
  }
};

if (require.main === module) {
  main();
}
