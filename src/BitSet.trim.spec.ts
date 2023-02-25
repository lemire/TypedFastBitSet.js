import { bitsetTest } from "./testUtils";
import { SparseTypedFastBitSet } from "./SparseTypedFastBitSet";

describe("sparse biggest logic", () => {
  it("Testing sparse trim", () => {
    const mb = new SparseTypedFastBitSet([0, 1, 2, 3]);
    expect(mb.array()).toEqual([3, 0, 1, 2]);

    mb.trim(); // will convert to bitset since is dense

    mb.add(2000);

    mb.trim(); // will convert to array since sparse

    expect(mb.array()).toEqual([2000, 1, 2, 3, 0]);
  });
});

bitsetTest(({ name, build, arrayEqual }) => {
  describe(name, () => {
    it("Testing trim", () => {
      const ai = [1, 2, 4, 5, 10, 31, 32, 63, 64, 127, 2030];
      const mb = build(ai);
      const mb2 = mb.clone();
      mb2.trim();
      const a = mb2.array();
      arrayEqual(a, ai); // bad value
      expect(mb.equals(mb2)).toBe(true); // bad trim/clone
    });
  });
});
