import { bitsetTest } from "./testUtils";
import { SparseTypedFastBitSet } from "./SparseTypedFastBitSet";

describe("sparse biggest logic", () => {
  it("Testing sparse difference", () => {
    const a1 = [10, 1, 4, 3, 2, 5];
    const a2 = [1, 5, 10];
    const mb1 = new SparseTypedFastBitSet(a1);
    const mb2 = new SparseTypedFastBitSet(a2);

    expect(mb1.array()).toEqual([10, 1, 4, 3, 2, 5]); // making sure next diff won't make next biggest naturally first

    expect(mb1.difference2(mb2).array()).toEqual([4, 3, 2]);

    expect(mb2.array()).toEqual([4, 3, 2]);
  });
});

bitsetTest(({ name, build, arrayEqual }) => {
  describe(name, () => {
    it("Testing difference sparse", () => {
      const a1 = [1, 2, 4, 5, 10];
      const a2 = [1, 2, 4, 5, 10, 100, 1000];
      const a3 = [6, 7, 8, 9, 200];
      let mb1 = build(a1);
      let mb2 = build(a2);
      let mb3 = build(a3);
      arrayEqual(mb1.difference2(mb2).array(), []);
      arrayEqual(mb1.array(), a1);
      arrayEqual(mb2.array(), []);
      mb2 = build(a2);

      arrayEqual(mb2.difference2(mb1).array(), [100, 1000]);
      arrayEqual(mb2.array(), a2);
      arrayEqual(mb1.array(), [100, 1000]);
      mb1 = build(a1);

      arrayEqual(mb1.difference2(mb3).array(), a1);
      arrayEqual(mb1.array(), a1);
      arrayEqual(mb3.array(), a1);

      mb3 = build(a3);
      arrayEqual(mb3.difference2(mb1).array(), a3);
      arrayEqual(mb1.array(), a3);
      arrayEqual(mb3.array(), a3);

      mb1 = build(a1);
      mb2 = build(a2);
      mb3 = build(a3);

      mb1.addRange(201, 500);

      const a1Range = mb1.array();

      let expected = build();
      expected.addRange(201, 500);

      arrayEqual(mb1.difference2(mb2).array(), expected.array());
      arrayEqual(mb1.array(), a1Range);
      arrayEqual(mb2.array(), expected.array());

      mb2 = build(a2);
      arrayEqual(mb2.difference2(mb1).array(), [100, 1000]);

      arrayEqual(mb1.array(), [100, 1000]);
      arrayEqual(mb2.array(), a2);
      mb1 = build(a1Range);

      arrayEqual(mb1.difference2(mb3).array(), a1Range);

      arrayEqual(mb1.array(), a1Range);
      arrayEqual(mb3.array(), a1Range);
      mb3 = build(a3);

      arrayEqual(mb3.difference2(mb1).array(), a3);

      arrayEqual(mb1.array(), a3);
      arrayEqual(mb3.array(), a3);

      mb1 = build(a1Range);
      mb2 = build(a2);
      mb2.addRange(600, 900);
      mb3 = build(a3);
      const a2Range = mb2.array();

      arrayEqual(mb1.difference2(mb2).array(), expected.array());
      arrayEqual(mb1.array(), a1Range);
      arrayEqual(mb2.array(), expected.array());

      mb2 = build(a2Range);

      expected = build([100, 1000]);
      expected.addRange(600, 900);

      arrayEqual(mb2.difference2(mb1).array(), expected.array());
      arrayEqual(mb1.array(), expected.array());
      arrayEqual(mb2.array(), a2Range);

      mb1 = build(a1Range);

      arrayEqual(mb1.difference2(mb3).array(), a1Range);
      arrayEqual(mb1.array(), a1Range);
      arrayEqual(mb3.array(), a1Range);

      mb3 = build(a3);

      arrayEqual(mb3.difference2(mb1).array(), a3);

      arrayEqual(mb1.array(), a3);
      arrayEqual(mb3.array(), a3);
      mb1 = build(a1Range);

      mb3 = build(a3);
      mb3.addRange(600, 900);
      const a3Range = mb3.array();

      arrayEqual(mb1.difference2(mb3).array(), a1Range);
      arrayEqual(mb1.array(), a1Range);
      arrayEqual(mb3.array(), a1Range);

      mb3 = build(a3Range);

      arrayEqual(mb3.difference2(mb1).array(), a3Range);

      arrayEqual(mb1.array(), a3Range);
      arrayEqual(mb3.array(), a3Range);
    });

    it("Testing difference2", () => {
      const a1 = [1, 2, 4, 5, 10];
      const a2 = [1, 2, 4, 5, 10, 100, 1000];
      let mb1 = build(a1);
      let mb2 = build(a2);
      mb1.difference2(mb2);
      expect(mb2.isEmpty()).toBe(true); // bad diff1
      mb1 = build(a1);
      mb2 = build(a2);
      mb2.difference2(mb1);
      expect(mb1.size()).toBe(2); // bad diff2
    });

    it("difference2 the same prototype provided", () => {
      const a1 = [1, 2, 4, 5, 10];
      const a2 = [1, 2, 4, 5, 10, 100, 1000];
      const mb1 = build(a1);
      const mb2 = build(a2);
      const mb3 = mb1.difference2(mb2);
      expect(mb3.constructor).toStrictEqual(mb2.constructor);
    });
  });
});
