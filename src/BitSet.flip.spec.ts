import { SparseTypedFastBitSet } from "./SparseTypedFastBitSet";
import { bitsetTest } from "./testUtils";

describe("sparse biggest logic", () => {
  it("Testing sparse flip", () => {
    const mb = new SparseTypedFastBitSet([0, 1, 2, 3]);
    mb.flip(2);
    expect(mb.array()).toEqual([3, 0, 1]);

    mb.flip(4);
    expect(mb.array()).toEqual([4, 0, 1, 3]);

    mb.flip(2);
    expect(mb.array()).toEqual([4, 0, 1, 3, 2]);

    mb.flip(4);
    expect(mb.array()).toEqual([3, 0, 1, 2]);

    mb.flip(3);
    expect(mb.array()).toEqual([2, 0, 1]);
  });
});

bitsetTest(({ name, build, arrayEqual }) => {
  describe(name, () => {
    it("Testing flip", () => {
      const mb = build();
      mb.add(1);
      mb.add(10);
      mb.add(20);

      mb.flip(10);

      arrayEqual(mb.array(), [1, 20]);

      mb.addRange(200, 500);

      mb.flip(350);
      const arr = [1, 20];
      for (let i = 200; i < 350; i++) {
        arr.push(i);
      }
      for (let i = 351; i < 500; i++) {
        arr.push(i);
      }
      arrayEqual(mb.array(), arr);
      expect(mb.size()).toBe(301);
    });
  });
});
