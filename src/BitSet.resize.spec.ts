import { SparseTypedFastBitSet } from "./SparseTypedFastBitSet";
import { bitsetTest } from "./testUtils";

describe("sparse resize logic", () => {
  it("Testing flips after 256 entries", () => {
    const mb = new SparseTypedFastBitSet();

    //fill to limit
    for (let i = 1; i < 257; i++) {
      mb.add(i);
    }

    expect(mb.array()[0]).toEqual(256);

    mb.resize(0); // should flip to bitset

    expect(mb.array()[0]).toEqual(1);
    expect(mb.has(256)).toBe(true);
  });

  it("Testing stays sparse if bitset will be bigger", () => {
    const mb = new SparseTypedFastBitSet();

    //fill to limit
    for (let i = 1; i < 257; i++) {
      mb.add(i);
    }

    expect(mb.array()[0]).toEqual(256);

    mb.resize(32 * 256); // should not flip as is to sparse

    expect(mb.array()[0]).toEqual(256);
    expect(mb.has(256)).toBe(true);
  });
});

bitsetTest(({ name, build, arrayEqual }) => {
  describe(name, () => {
    it("Testing resize", () => {
      const ai = [1, 2, 4, 3 * 32];
      const mb = build(ai);
      const words = mb.words; // switch to bitset
      expect(words.length).toBe(8); // default start size

      mb.resize(16 * 32 - 1);
      expect(mb.words.length).toBe(32); // 2x what is needed
    });
  });
});
