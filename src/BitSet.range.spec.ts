import { bitsetTest } from "./testUtils";
import { SparseTypedFastBitSet } from "./SparseTypedFastBitSet";
import { TypedFastBitSet } from "./TypedFastBitSet";

describe("sparse biggest logic", () => {
  it("Testing sparse addRange/removeRange", () => {
    const mb = new SparseTypedFastBitSet([0, 1, 3]);

    // biggest is first
    expect(mb.array()).toEqual([3, 0, 1]);

    mb.addRange(3, 6);
    expect(mb.array()).toEqual([5, 0, 1, 3, 4]);

    mb.add(2);

    expect(mb.array()).toEqual([5, 0, 1, 3, 4, 2]);

    mb.removeRange(5, 10);

    expect(mb.array()).toEqual([4, 0, 1, 3, 2]);

    mb.removeRange(3, 5);

    expect(mb.array()).toEqual([2, 0, 1]);
  });
});

describe("fixed bitset logic", () => {
  it("Testing has any in range", () => {
    const b1 = new TypedFastBitSet();
    b1.addRange(100, 200);
    b1.addRange(230, 250);
    expect(b1.hasAnyInRange(0, 100)).toBe(false); // before
    expect(b1.hasAnyInRange(200, 204)).toBe(false); // endword === firstword
    expect(b1.hasAnyInRange(200, 229)).toBe(false); // gaps
    expect(b1.hasAnyInRange(250, 300)).toBe(false); // after
    expect(b1.hasAnyInRange(99, 101)).toBe(true); // across start 1
    expect(b1.hasAnyInRange(99, 140)).toBe(true); // across start 2
    expect(b1.hasAnyInRange(99, 201)).toBe(true); // across start/end
    expect(b1.hasAnyInRange(100, 140)).toBe(true); // start
    expect(b1.hasAnyInRange(100, 200)).toBe(true); // start past end
    expect(b1.hasAnyInRange(101, 198)).toBe(true); // inside
    expect(b1.hasAnyInRange(120, 121)).toBe(true); // smol
    expect(b1.hasAnyInRange(197, 200)).toBe(true); // end
    expect(b1.hasAnyInRange(199, 210)).toBe(true); // across end
  });
});

bitsetTest(({ name, build, arrayEqual }) => {
  describe(name, () => {
    it("Testing add Range", () => {
      const b1 = build();

      b1.addRange(200, 100);
      expect(b1.size()).toBe(0); // bad size

      b1.addRange(1, 3);
      arrayEqual(b1.array(), [1, 2]);

      b1.addRange(0, 1);
      expect(b1.has(0)); // bad value
      expect(b1.size()).toBe(3); // bad size

      b1.addRange(0, 1);
      expect(b1.size()).toBe(3); // bad size

      b1.addRange(32, 64);
      for (let i = 32; i < 64; ++i) {
        expect(b1.has(i)).toBe(true); // bad value
      }
      expect(b1.size()).toBe(35); // bad size

      b1.addRange(1000, 2000);
      b1.addRange(64, 129);
      for (let i = 63; i < 129; ++i) {
        expect(b1.has(i)).toBe(true); // bad value
      }

      expect(b1.size()).toBe(1100); // bad size
    });

    it("Testing remove Range", () => {
      const b1 = build([0, 4, 8, 32]);

      b1.removeRange(200, 0);
      expect(b1.size()).toBe(4); // bad size

      b1.removeRange(8, 50);

      arrayEqual(b1.array(), [0, 4]);

      b1.addRange(0, 1000);

      b1.removeRange(200, 900);
      expect(b1.size()).toBe(300);

      for (let i = 0; i < 1001; ++i) {
        if ((i >= 200 && i < 900) || i >= 1000) {
          expect(b1.has(i)).toBe(false);
        } else {
          expect(b1.has(i)).toBe(true);
        }
      }
    });
  });
});
