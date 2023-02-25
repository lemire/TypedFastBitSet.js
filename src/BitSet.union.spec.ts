import { bitsetTest } from "./testUtils";

bitsetTest(({ name, build, arrayEqual }) => {
  describe(name, () => {
    it("Testing union", () => {
      const a1 = [1, 2, 4, 5, 10];
      const a2 = [1, 2, 4, 5, 10, 100, 1000];
      let mb1 = build(a1);
      const mb2 = build(a2);
      let punion = mb1.union_size(mb2);
      mb1.union(mb2);
      expect(punion).toBe(mb1.size()); // bad size1
      expect(mb1.equals(mb2)).toBe(true); // bad diff
      mb1 = build(a1);
      punion = mb2.union_size(mb1);
      mb2.union(mb1);
      expect(punion).toBe(mb2.size()); // bad size2
      const a = mb2.array();
      arrayEqual(a, a2); // bad values
    });

    it("Testing empty union", () => {
      const a: number[] = [];
      const mb1 = build(a);
      const mb2 = build(a);
      expect(mb1.union_size(mb2)).toBe(0);
      mb1.union(mb2);
      arrayEqual(mb1.array(), a);
      arrayEqual(mb2.array(), a);
      arrayEqual(mb1.new_union(mb2).array(), a);
    });

    it("Testing against empty union", () => {
      const a1: number[] = [];
      const a2: number[] = [1, 3, 6];
      const mb1 = build(a1);
      const mb2 = build(a2);
      arrayEqual(mb1.new_union(mb2).array(), a2);
      arrayEqual(mb1.array(), a1);
      arrayEqual(mb2.array(), a2);

      expect(mb1.union_size(mb2)).toBe(3);
      mb1.union(mb2);
      arrayEqual(mb1.array(), a2);
      arrayEqual(mb2.array(), a2);
    });

    it("Testing union sparse", () => {
      const a1 = [1, 2, 4, 5, 10];
      const a2 = [1, 2, 4, 5, 10, 100, 1000];
      const a3 = [6, 7, 8, 9, 200];
      let mb1 = build(a1);
      let mb2 = build(a2);
      let mb3 = build(a3);
      arrayEqual(mb1.union(mb2).array(), a2);
      arrayEqual(mb1.array(), a2);
      arrayEqual(mb2.array(), a2);

      mb1 = build(a1);
      arrayEqual(mb2.union(mb1).array(), a2);
      arrayEqual(mb2.array(), a2);
      arrayEqual(mb1.array(), a1);

      const a1a3 = [...new Set([...a1, ...a3])].sort((a, b) => a - b);
      arrayEqual(mb1.union(mb3).array(), a1a3);
      arrayEqual(mb1.array(), a1a3);
      arrayEqual(mb3.array(), a3);

      mb1 = build(a1);
      arrayEqual(mb3.union(mb1).array(), a1a3);
      arrayEqual(mb1.array(), a1);
      arrayEqual(mb3.array(), a1a3);

      mb1 = build(a1);
      mb2 = build(a2);
      mb3 = build(a3);

      mb1.addRange(201, 500);

      const a1Range = mb1.array();

      const a1RangeA2 = [...new Set([...a1Range, ...a2])].sort((a, b) => a - b);
      arrayEqual(mb1.union(mb2).array(), a1RangeA2);
      arrayEqual(mb1.array(), a1RangeA2);
      arrayEqual(mb2.array(), a2);

      mb1 = build(a1Range);
      arrayEqual(mb2.union(mb1).array(), a1RangeA2);

      arrayEqual(mb1.array(), a1Range);
      arrayEqual(mb2.array(), a1RangeA2);

      const a1RangeA3 = [...new Set([...a1Range, ...a3])].sort((a, b) => a - b);
      arrayEqual(mb1.union(mb3).array(), a1RangeA3);

      arrayEqual(mb1.array(), a1RangeA3);
      arrayEqual(mb3.array(), a3);

      mb1 = build(a1Range);

      arrayEqual(mb3.union(mb1).array(), a1RangeA3);

      arrayEqual(mb1.array(), a1Range);
      arrayEqual(mb3.array(), a1RangeA3);

      mb2 = build(a2);
      mb2.addRange(600, 900);
      mb3 = build(a3);
      const a2Range = mb2.array();

      const a1RangeA2Range = [...new Set([...a1Range, ...a2Range])].sort(
        (a, b) => a - b
      );

      arrayEqual(mb1.union(mb2).array(), a1RangeA2Range);
      arrayEqual(mb1.array(), a1RangeA2Range);
      arrayEqual(mb2.array(), a2Range);

      mb1 = build(a1Range);
      arrayEqual(mb2.union(mb1).array(), a1RangeA2Range);
      arrayEqual(mb1.array(), a1Range);
      arrayEqual(mb2.array(), a1RangeA2Range);

      mb3 = build(a3);
      mb3.addRange(600, 900);
      const a3Range = mb3.array();

      const a1RangeA3Range = [...new Set([...a1Range, ...a3Range])].sort(
        (a, b) => a - b
      );

      arrayEqual(mb1.union(mb3).array(), a1RangeA3Range);
      arrayEqual(mb1.array(), a1RangeA3Range);
      arrayEqual(mb3.array(), a3Range);

      mb1 = build(a1Range);

      arrayEqual(mb3.union(mb1).array(), a1RangeA3Range);

      arrayEqual(mb1.array(), a1Range);
      arrayEqual(mb3.array(), a1RangeA3Range);
    });

    it("Testing new union", () => {
      const a1 = [1, 2, 4, 5, 10];
      const a2 = [1, 2, 4, 5, 10, 100, 1000];
      const a3 = [6, 7, 8, 9, 200];
      const mb1 = build(a1);
      const mb2 = build(a2);
      const mb3 = build(a3);

      const a1a2 = [...new Set([...a1, ...a2])].sort((a, b) => a - b);
      const a1a3 = [...new Set([...a1, ...a3])].sort((a, b) => a - b);

      arrayEqual(mb1.new_union(mb2).array(), a1a2);
      arrayEqual(mb2.new_union(mb1).array(), a1a2);
      arrayEqual(mb1.new_union(mb3).array(), a1a3);
      arrayEqual(mb3.new_union(mb1).array(), a1a3);

      arrayEqual(mb1.array(), a1);
      arrayEqual(mb2.array(), a2);
      arrayEqual(mb3.array(), a3);

      mb1.addRange(201, 500);

      const a1Range = mb1.array();

      const a1RangeA2 = [...new Set([...a1Range, ...a2])].sort((a, b) => a - b);
      const a1RangeA3 = [...new Set([...a1Range, ...a3])].sort((a, b) => a - b);
      arrayEqual(mb1.new_union(mb2).array(), a1RangeA2);
      arrayEqual(mb2.new_union(mb1).array(), a1RangeA2);
      arrayEqual(mb1.new_union(mb3).array(), a1RangeA3);
      arrayEqual(mb3.new_union(mb1).array(), a1RangeA3);

      arrayEqual(mb1.array(), a1Range);
      arrayEqual(mb2.array(), a2);
      arrayEqual(mb3.array(), a3);

      mb2.addRange(600, 900);
      const a2Range = mb2.array();

      const a1RangeA2Range = [...new Set([...a1Range, ...a2Range])].sort(
        (a, b) => a - b
      );

      arrayEqual(mb1.new_union(mb2).array(), a1RangeA2Range);
      arrayEqual(mb2.new_union(mb1).array(), a1RangeA2Range);

      arrayEqual(mb1.array(), a1Range);
      arrayEqual(mb2.array(), a2Range);

      mb3.addRange(600, 900);
      const a3Range = mb3.array();

      const a1RangeA3Range = [...new Set([...a1Range, ...a3Range])].sort(
        (a, b) => a - b
      );

      arrayEqual(mb1.new_union(mb3).array(), a1RangeA3Range);
      arrayEqual(mb3.new_union(mb1).array(), a1RangeA3Range);

      arrayEqual(mb1.array(), a1Range);
      arrayEqual(mb3.array(), a3Range);
    });

    it("Testing union size", () => {
      const a1 = [1, 2, 4, 5, 10];
      const a2 = [1, 2, 4, 5, 10, 100, 1000];
      const a3 = [6, 7, 8, 9, 200];
      const mb1 = build(a1);
      const mb2 = build(a2);
      const mb3 = build(a3);
      expect(mb1.union_size(mb2)).toBe(7);
      expect(mb2.union_size(mb1)).toBe(7);
      expect(mb1.union_size(mb3)).toBe(10);
      expect(mb3.union_size(mb1)).toBe(10);

      arrayEqual(mb1.array(), a1);
      arrayEqual(mb2.array(), a2);
      arrayEqual(mb3.array(), a3);

      mb1.addRange(201, 500);

      const a1Range = mb1.array();
      expect(mb1.union_size(mb2)).toBe(306);
      expect(mb2.union_size(mb1)).toBe(306);
      expect(mb1.union_size(mb3)).toBe(309);
      expect(mb3.union_size(mb1)).toBe(309);

      arrayEqual(mb1.array(), a1Range);
      arrayEqual(mb2.array(), a2);
      arrayEqual(mb3.array(), a3);

      mb2.addRange(600, 900);
      const a2Range = mb2.array();

      expect(mb1.union_size(mb2)).toBe(606);
      expect(mb2.union_size(mb1)).toBe(606);

      arrayEqual(mb1.array(), a1Range);
      arrayEqual(mb2.array(), a2Range);

      mb3.addRange(600, 900);
      const a3Range = mb3.array();

      expect(mb1.union_size(mb3)).toBe(609);
      expect(mb3.union_size(mb1)).toBe(609);

      arrayEqual(mb1.array(), a1Range);
      arrayEqual(mb2.array(), a2Range);
      arrayEqual(mb3.array(), a3Range);
    });
  });
});
