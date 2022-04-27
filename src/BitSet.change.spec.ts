import { SparseTypedFastBitSet } from "./SparseTypedFastBitSet";
import { bitsetTest } from "./testUtils";

describe("sparse biggest logic", () => {
  it("Testing sparse difference", () => {
    const a1 = [10, 1, 4, 3, 2, 5];
    const a2 = [1, 5, 10];
    const mb1 = new SparseTypedFastBitSet(a1);
    const mb2 = new SparseTypedFastBitSet(a2);

    expect(mb1.array()).toEqual([10, 1, 4, 3, 2, 5]); // making sure next diff won't make next biggest naturally first

    expect(mb1.new_change(mb2).array()).toEqual([4, 2, 3]);
    expect(mb1.change(mb2).array()).toEqual([4, 2, 3]);

    expect(mb1.array()).toEqual([4, 2, 3]);
  });
});

bitsetTest(({ name, build, arrayEqual }) => {
  describe(name, () => {
    it("Testing change sparse", () => {
      const a1 = [1, 2, 4, 5, 10];
      const a2 = [1, 2, 4, 5, 10, 100, 1000];
      const a3 = [6, 7, 8, 9, 200];
      let mb1 = build(a1);
      let mb2 = build(a2);
      let mb3 = build(a3);
      arrayEqual(mb1.change(mb2).array(), [100, 1000]);
      arrayEqual(mb1.array(), [100, 1000]);
      mb1 = build(a1);
      arrayEqual(mb2.array(), a2);

      arrayEqual(mb2.change(mb1).array(), [100, 1000]);
      arrayEqual(mb2.array(), [100, 1000]);
      arrayEqual(mb1.array(), a1);

      const a1Xa3 = [...a1, ...a3].sort((a, b) => a - b);

      arrayEqual(mb1.change(mb3).array(), a1Xa3);
      arrayEqual(mb1.array(), a1Xa3);
      arrayEqual(mb3.array(), a3);

      mb1 = build(a1);
      arrayEqual(mb3.change(mb1).array(), a1Xa3);
      arrayEqual(mb1.array(), a1);
      arrayEqual(mb3.array(), a1Xa3);

      mb1 = build(a1);
      mb2 = build(a2);
      mb3 = build(a3);

      mb1.addRange(201, 500);

      const a1Range = mb1.array();

      const a1RangeXa2 = build([100, 1000]);
      a1RangeXa2.addRange(201, 500);

      arrayEqual(mb1.change(mb2).array(), a1RangeXa2.array());
      arrayEqual(mb1.array(), a1RangeXa2.array());
      arrayEqual(mb2.array(), a2);

      mb1 = build(a1Range);
      arrayEqual(mb2.change(mb1).array(), a1RangeXa2.array());

      arrayEqual(mb1.array(), a1Range);
      arrayEqual(mb2.array(), a1RangeXa2.array());

      const a1RangeXa3 = [...mb1.array(), ...a3].sort((a, b) => a - b);

      arrayEqual(mb1.change(mb3).array(), a1RangeXa3);

      arrayEqual(mb1.array(), a1RangeXa3);
      arrayEqual(mb3.array(), a3);

      mb1 = build(a1Range);
      arrayEqual(mb3.change(mb1).array(), a1RangeXa3);

      arrayEqual(mb1.array(), a1Range);
      arrayEqual(mb3.array(), a1RangeXa3);

      mb2 = build(a2);
      mb2.addRange(600, 900);
      mb3 = build(a3);
      const a2Range = mb2.array();
      const a1RangeXa2Range = build([100, 1000]);
      a1RangeXa2Range.addRange(201, 500);
      a1RangeXa2Range.addRange(600, 900);

      arrayEqual(mb1.change(mb2).array(), a1RangeXa2Range.array());
      arrayEqual(mb1.array(), a1RangeXa2Range.array());
      arrayEqual(mb2.array(), a2Range);

      mb1 = build(a1Range);

      arrayEqual(mb2.change(mb1).array(), a1RangeXa2Range.array());
      arrayEqual(mb1.array(), a1Range);
      arrayEqual(mb2.array(), a1RangeXa2Range.array());

      mb3 = build(a3);
      mb3.addRange(600, 900);
      const a3Range = mb3.array();

      const a1RangeXa3Range = [...mb1.array(), ...a3Range].sort(
        (a, b) => a - b
      );

      arrayEqual(mb1.change(mb3).array(), a1RangeXa3Range);
      arrayEqual(mb1.array(), a1RangeXa3Range);
      arrayEqual(mb3.array(), a3Range);

      mb1 = build(a1Range);

      arrayEqual(mb3.change(mb1).array(), a1RangeXa3Range);

      arrayEqual(mb1.array(), a1Range);
      arrayEqual(mb3.array(), a1RangeXa3Range);
    });

    it("Testing new change", () => {
      const a1 = [1, 2, 4, 5, 10];
      const a2 = [1, 2, 4, 5, 10, 100, 1000];
      const a3 = [6, 7, 8, 9, 200];
      const mb1 = build(a1);
      const mb2 = build(a2);
      const mb3 = build(a3);
      arrayEqual(mb1.new_change(mb2).array(), [100, 1000]);
      arrayEqual(mb2.new_change(mb1).array(), [100, 1000]);

      const a1Xa3 = [...a1, ...a3].sort((a, b) => a - b);
      arrayEqual(mb1.new_change(mb3).array(), a1Xa3);

      arrayEqual(mb1.array(), a1);
      arrayEqual(mb2.array(), a2);
      arrayEqual(mb3.array(), a3);

      arrayEqual(mb3.new_change(mb1).array(), a1Xa3);
      arrayEqual(mb1.array(), a1);
      arrayEqual(mb3.array(), a3);

      mb1.addRange(201, 500);

      const a1Range = mb1.array();

      const a1RangeXa2 = build([100, 1000]);
      a1RangeXa2.addRange(201, 500);

      arrayEqual(mb1.new_change(mb2).array(), a1RangeXa2.array());
      arrayEqual(mb2.new_change(mb1).array(), a1RangeXa2.array());

      const a1RangeXa3 = [...mb1.array(), ...a3].sort((a, b) => a - b);
      arrayEqual(mb1.new_change(mb3).array(), a1RangeXa3);
      arrayEqual(mb3.new_change(mb1).array(), a1RangeXa3);

      arrayEqual(mb1.array(), a1Range);
      arrayEqual(mb2.array(), a2);
      arrayEqual(mb3.array(), a3);

      mb2.addRange(600, 900);

      const a2Range = mb2.array();
      const a1RangeXa2Range = build([100, 1000]);
      a1RangeXa2Range.addRange(201, 500);
      a1RangeXa2Range.addRange(600, 900);

      arrayEqual(mb1.new_change(mb2).array(), a1RangeXa2Range.array());
      arrayEqual(mb2.new_change(mb1).array(), a1RangeXa2Range.array());

      arrayEqual(mb1.array(), a1Range);
      arrayEqual(mb2.array(), a2Range);

      mb3.addRange(600, 900);
      const a3Range = mb3.array();

      const a1RangeXa3Range = [...mb1.array(), ...a3Range].sort(
        (a, b) => a - b
      );

      arrayEqual(mb1.new_change(mb3).array(), a1RangeXa3Range);
      arrayEqual(mb3.new_change(mb1).array(), a1RangeXa3Range);

      arrayEqual(mb1.array(), a1Range);
      arrayEqual(mb3.array(), a3Range);
    });

    it("Testing change size", () => {
      const a1 = [1, 2, 4, 5, 10];
      const a2 = [1, 2, 4, 5, 10, 100, 1000];
      const a3 = [6, 7, 8, 9, 200];
      const mb1 = build(a1);
      const mb2 = build(a2);
      const mb3 = build(a3);
      expect(mb1.change_size(mb2)).toBe([100, 1000].length);
      expect(mb2.change_size(mb1)).toBe([100, 1000].length);

      const a1Xa3 = [...a1, ...a3].sort((a, b) => a - b);
      expect(mb1.change_size(mb3)).toBe(a1Xa3.length);
      expect(mb3.change_size(mb1)).toBe(a1Xa3.length);

      arrayEqual(mb1.array(), a1);
      arrayEqual(mb2.array(), a2);
      arrayEqual(mb3.array(), a3);

      mb1.addRange(201, 500);

      const a1Range = mb1.array();

      const a1RangeXa2 = build([100, 1000]);
      a1RangeXa2.addRange(201, 500);

      expect(mb1.change_size(mb2)).toBe(a1RangeXa2.size());
      expect(mb2.change_size(mb1)).toBe(a1RangeXa2.size());

      const a1RangeXa3 = [...mb1.array(), ...a3].sort((a, b) => a - b);
      expect(mb1.change_size(mb3)).toBe(a1RangeXa3.length);
      expect(mb3.change_size(mb1)).toBe(a1RangeXa3.length);

      arrayEqual(mb1.array(), a1Range);
      arrayEqual(mb2.array(), a2);
      arrayEqual(mb3.array(), a3);

      mb2.addRange(600, 900);

      const a2Range = mb2.array();
      const a1RangeXa2Range = build([100, 1000]);
      a1RangeXa2Range.addRange(201, 500);
      a1RangeXa2Range.addRange(600, 900);

      expect(mb1.change_size(mb2)).toBe(a1RangeXa2Range.size());
      expect(mb2.change_size(mb1)).toBe(a1RangeXa2Range.size());

      arrayEqual(mb1.array(), a1Range);
      arrayEqual(mb2.array(), a2Range);

      mb3.addRange(600, 900);
      const a3Range = mb3.array();

      const a1RangeXa3Range = [...mb1.array(), ...a3Range].sort(
        (a, b) => a - b
      );

      expect(mb1.change_size(mb3)).toBe(a1RangeXa3Range.length);
      expect(mb3.change_size(mb1)).toBe(a1RangeXa3Range.length);

      arrayEqual(mb1.array(), a1Range);
      arrayEqual(mb3.array(), a3Range);
    });

    it("Testing change", () => {
      const a1 = [1, 2, 4, 5, 10];
      const a2 = [1, 2, 4, 5, 10, 100, 1000];
      const ch = [100, 1000];
      let mb1 = build(a1);
      const mb2 = build(a2);
      expect(mb1.change_size(mb2)).toBe(mb2.change_size(mb1)); // bad change_size
      expect(mb1.new_change(mb2).equals(mb2.new_change(mb1))).toBe(true); // bad change_size
      let arr = mb1.change(mb2).array();
      arrayEqual(arr, ch); // bad change
      mb1 = build(a1);
      arr = mb2.change(mb1).array();
      arrayEqual(arr, ch); // bad change
    });
  });
});
