import { bitsetTest } from "./testUtils";
import { TypedFastBitSet } from "./TypedFastBitSet";

bitsetTest(({ name, build, arrayEqual }) => {
  describe(name, () => {
    it("Testing equals", () => {
      const a1 = [1, 2, 4, 5, 10];
      const a2 = [1, 2, 4, 5, 10, 100, 1000];
      const a3 = [6, 7, 8, 9, 200];
      const mb1 = build(a1);
      const mb2 = build(a2);
      const mb3 = build(a3);

      expect(mb1.equals(mb1)).toBe(true);
      expect(mb1.equals(mb2)).toBe(false);
      expect(mb1.equals(mb3)).toBe(false);

      expect(mb1.equals(build(a1))).toBe(true);
      expect(mb1.equals(new TypedFastBitSet(a1))).toBe(true);

      arrayEqual(mb1.array(), a1);
      arrayEqual(mb1.array(), a1);
      arrayEqual(mb3.array(), a3);

      mb1.addRange(201, 500);
      const a1Range = mb1.array();

      expect(mb1.equals(mb1)).toBe(true);
      expect(mb1.equals(mb2)).toBe(false);
      expect(mb1.equals(build(a1Range))).toBe(true);

      arrayEqual(mb1.array(), a1Range);
      arrayEqual(mb2.array(), a2);

      expect(mb1.equals(new TypedFastBitSet(a1Range))).toBe(true);
    });

    it("Testing empty does not pass", () => {
      const a1: number[] = [];
      const a2 = [0];
      const mb1 = build(a1);
      const mb2 = build(a2);

      expect(mb1.equals(mb2)).toBe(false);
    });
  });
});
