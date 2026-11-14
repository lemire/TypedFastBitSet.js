import { bitsetTest } from "./testUtils";
import { SparseTypedFastBitSet } from "./SparseTypedFastBitSet";
import { TypedFastBitSet } from "./TypedFastBitSet";

// Regression tests for https://github.com/lemire/TypedFastBitSet.js/issues/47

describe("issue 47: TypedFastBitSet ranges", () => {
  it("hasAnyInRange checks the word before the last one", () => {
    const b = new TypedFastBitSet([200, 400]);
    expect(b.hasAnyInRange(100, 250)).toBe(true);
    expect(b.hasAnyInRange(100, 200)).toBe(false);
    expect(b.hasAnyInRange(100, 201)).toBe(true);
  });

  it("hasAnyInRange sees the last bit of the buffer", () => {
    const b = new TypedFastBitSet([255]);
    expect(b.hasAnyInRange(0, 300)).toBe(true);
    expect(b.hasAnyInRange(255, 256)).toBe(true);
    expect(b.hasAnyInRange(250, 1000)).toBe(true);
    expect(b.hasAnyInRange(256, 1000)).toBe(false);
  });

  it("removeRange removes the last bit of the buffer", () => {
    const b = new TypedFastBitSet([255]);
    b.removeRange(0, 300);
    expect(b.array()).toEqual([]);

    const c = new TypedFastBitSet([31, 63]);
    c.removeRange(63, 64);
    expect(c.array()).toEqual([31]);
  });

  it("range queries on an empty set", () => {
    const b = new TypedFastBitSet();
    expect(b.hasAnyInRange(0, 100)).toBe(false);
    b.removeRange(0, 100);
    expect(b.array()).toEqual([]);
  });

  it("checkedAdd beyond the current size", () => {
    const b = new TypedFastBitSet([10]);
    expect(b.checkedAdd(261)).toBe(1);
    expect(b.has(261)).toBe(true);
    expect(b.checkedAdd(261)).toBe(0);
  });
});

describe("issue 47: SparseTypedFastBitSet", () => {
  it("flip(0) does not match padding past arraySize", () => {
    const b = new SparseTypedFastBitSet([12, 31]);
    b.flip(0);
    expect(b.array().sort((x, y) => x - y)).toEqual([0, 12, 31]);
    expect(b.size()).toBe(3);
  });

  it("flip(x) after remove(x) does not match a stale entry", () => {
    const b = new SparseTypedFastBitSet([7, 3, 5]);
    b.remove(5);
    b.flip(5);
    expect(b.array().sort((x, y) => x - y)).toEqual([3, 5, 7]);
    b.flip(5);
    expect(b.array().sort((x, y) => x - y)).toEqual([3, 7]);
  });

  it("add after trim() of an empty set", () => {
    const b = new SparseTypedFastBitSet();
    b.trim();
    b.add(48);
    expect(b.array()).toEqual([48]);
    expect(b.has(48)).toBe(true);
  });

  it("addRange after trim() of an empty set", () => {
    const b = new SparseTypedFastBitSet();
    b.trim();
    b.addRange(0, 1000);
    expect(b.size()).toBe(1000);
    expect(b.has(0)).toBe(true);
    expect(b.has(999)).toBe(true);
    expect(b.has(1000)).toBe(false);
  });

  it("removeRange in bitset mode removes the last bit of the buffer", () => {
    const b = new SparseTypedFastBitSet();
    b.addRange(0, 3000);
    const internal = b as any;
    expect(internal.arraySize).toBe(-1); // bitset mode
    const last = (internal.data.length << 5) - 1;
    b.add(last);
    b.removeRange(0, last + 1);
    expect(b.array()).toEqual([]);
  });
});

// Deterministic pseudo-random generator (mulberry32).
const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

bitsetTest(({ name, build }) => {
  describe(`issue 47: ${name} randomized against Set`, () => {
    it("add/remove/flip/addRange/removeRange/trim agree with a Set", () => {
      for (const max of [40, 300, 3000]) {
        const rand = rng(max);
        const int = (n: number) => Math.floor(rand() * n);
        const b = build();
        const ref = new Set<number>();
        for (let step = 0; step < 3000; step++) {
          const op = int(7);
          const x = int(max);
          const y = x + int(100);
          if (op === 0) {
            b.add(x);
            ref.add(x);
          } else if (op === 1) {
            b.remove(x);
            ref.delete(x);
          } else if (op === 2) {
            b.flip(x);
            if (ref.has(x)) ref.delete(x);
            else ref.add(x);
          } else if (op === 3) {
            b.addRange(x, y);
            for (let i = x; i < y; i++) ref.add(i);
          } else if (op === 4) {
            b.removeRange(x, y);
            for (let i = x; i < y; i++) ref.delete(i);
          } else if (op === 5) {
            b.trim();
          } else {
            expect(b.checkedAdd(x)).toBe(ref.has(x) ? 0 : 1);
            ref.add(x);
          }
          if (b instanceof TypedFastBitSet) {
            let expected = false;
            for (const v of ref) if (v >= x && v < y) expected = true;
            expect(b.hasAnyInRange(x, y)).toBe(expected);
          }
          expect(b.size()).toBe(ref.size);
        }
        const sorted = (a: number[]) => a.sort((p, q) => p - q);
        expect(sorted(b.array())).toEqual(sorted([...ref]));
      }
    });
  });
});
