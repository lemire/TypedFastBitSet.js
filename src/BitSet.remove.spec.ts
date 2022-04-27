import { bitsetTest } from "./testUtils";
import { SparseTypedFastBitSet } from "./SparseTypedFastBitSet";

describe("sparse biggest logic", () => {
  it("Testing sparse remove", () => {
    const mb = new SparseTypedFastBitSet([0, 1, 2, 3]);

    // biggest is first
    expect(mb.array()).toEqual([3, 0, 1, 2]);
    mb.remove(3);
    mb.remove(10);
    expect(mb.array()).toEqual([2, 0, 1]);
    expect(mb.size()).toBe(3);

    mb.remove(1);
    expect(mb.array()).toEqual([2, 0]);
    expect(mb.size()).toBe(2);

    mb.remove(2);
    mb.remove(0);
    expect(mb.array()).toEqual([]);
    expect(mb.size()).toBe(0);

    mb.remove(0);
    expect(mb.array()).toEqual([]);
    expect(mb.size()).toBe(0);

    mb.add(5);
    mb.addRange(10, 12);
    mb.remove(11);

    expect(mb.array()).toEqual([10, 5]);
    expect(mb.size()).toBe(2);

    const arr = [];
    mb.addRange(0, 500);

    for (let i = 0; i < 500; i++) {
      arr.push(i);
    }
    arr.splice(128, 1);
    mb.remove(128);

    expect(mb.array()).toEqual(arr);
    expect(mb.size()).toBe(499);
  });
});

bitsetTest(({ name, build, arrayEqual }) => {
  describe(name, () => {
    it("Testing remove", () => {
      const mb = build([0, 1, 2, 3]);
      arrayEqual(mb.array(), [0, 1, 2, 3]);
      mb.remove(3);
      mb.remove(10);
      arrayEqual(mb.array(), [0, 1, 2]);
      expect(mb.size()).toBe(3);

      mb.remove(2);
      arrayEqual(mb.array(), [0, 1]);
      expect(mb.size()).toBe(2);

      mb.remove(0);
      arrayEqual(mb.array(), [1]);
      expect(mb.size()).toBe(1);

      mb.remove(0);
      arrayEqual(mb.array(), [1]);
      expect(mb.size()).toBe(1);

      const arr = [];
      mb.addRange(0, 500);

      for (let i = 0; i < 500; i++) {
        arr.push(i);
      }
      arr.splice(128, 1);
      mb.remove(128);

      arrayEqual(mb.array(), arr);
      expect(mb.size()).toBe(499);
    });
  });
});
