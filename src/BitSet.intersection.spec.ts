import { bitsetTest } from "./testUtils";
import { SparseTypedFastBitSet } from "./SparseTypedFastBitSet";
import { TypedFastBitSet } from "./TypedFastBitSet";

describe("sparse biggest logic", () => {
  it("Testing biggest works on intersection between sparse and non sparse", () => {
    const mb1 = new SparseTypedFastBitSet([3, 2, 1, 0]);
    const mb2 = new TypedFastBitSet([0, 1, 4, 6]);

    expect(mb1.array()).toEqual([3, 2, 1, 0]);
    expect(mb1.new_intersection(mb2).array()).toEqual([1, 0]);

    expect(mb1.intersection(mb2).array()).toEqual([1, 0]);
  });

  it("Testing biggest works on intersection between non sparse and sparse", () => {
    const mb1 = new SparseTypedFastBitSet([0, 1, 4, 6]);
    const mb2 = new SparseTypedFastBitSet([3, 0, 2, 1]);
    mb1.addRange(100, 400);

    expect(mb2.array()).toEqual([3, 0, 2, 1]);

    expect(mb1.new_intersection(mb2).array()).toEqual([1, 0]);
    expect(mb1.intersection(mb2).array()).toEqual([1, 0]);
  });
});

bitsetTest(({ name, build, arrayEqual }) => {
  describe(name, () => {
    it("Testing intersection", () => {
      const a1 = [1, 2, 4, 5, 10];
      const a2 = [1, 2, 4, 5, 10, 100, 1000];
      const mb1 = build(a1);
      const mb2 = build(a2);
      let pinter = mb1.intersection_size(mb2);
      mb1.intersection(mb2);
      const a = mb1.array();
      expect(pinter).toBe(mb1.size()); // bad size
      arrayEqual(a, a1); // bad values
      pinter = mb2.intersection_size(mb1);
      mb2.intersection(mb1);
      expect(pinter).toBe(mb2.size()); // bad size
      expect(mb1.equals(mb2)).toBe(true); // bad intersect
    });

    it("Testing intersection sparse", () => {
      const a1 = [1, 2, 4, 5, 10];
      const a2 = [1, 2, 4, 5, 10, 100, 1000];
      const a3 = [6, 7, 8, 9, 200];
      let mb1 = build(a1);
      let mb2 = build(a2);
      let mb3 = build(a3);
      arrayEqual(mb1.intersection(mb2).array(), a1);
      arrayEqual(mb1.array(), a1);
      arrayEqual(mb2.array(), a2);

      arrayEqual(mb2.intersection(mb1).array(), a1);
      arrayEqual(mb2.array(), a1);
      arrayEqual(mb1.array(), a1);

      arrayEqual(mb1.intersection(mb3).array(), []);
      arrayEqual(mb1.array(), []);
      arrayEqual(mb3.array(), a3);

      mb1 = build(a1);
      arrayEqual(mb3.intersection(mb1).array(), []);
      arrayEqual(mb1.array(), a1);
      arrayEqual(mb3.array(), []);

      mb1 = build(a1);
      mb2 = build(a2);
      mb3 = build(a3);

      mb1.addRange(201, 500);

      const a1Range = mb1.array();
      arrayEqual(mb1.intersection(mb2).array(), a1);
      arrayEqual(mb1.array(), a1);
      arrayEqual(mb2.array(), a2);

      mb1.addRange(201, 500);
      arrayEqual(mb1.array(), a1Range);
      arrayEqual(mb2.intersection(mb1).array(), a1);

      arrayEqual(mb1.array(), a1Range);
      arrayEqual(mb2.array(), a1);

      arrayEqual(mb1.intersection(mb3).array(), []);

      arrayEqual(mb1.array(), []);
      arrayEqual(mb3.array(), a3);

      mb1 = build(a1Range);

      arrayEqual(mb3.intersection(mb1).array(), []);

      arrayEqual(mb1.array(), a1Range);
      arrayEqual(mb3.array(), []);

      mb2 = build(a2);
      mb2.addRange(600, 900);
      mb3 = build(a3);
      const a2Range = mb2.array();

      arrayEqual(mb1.intersection(mb2).array(), a1);
      arrayEqual(mb1.array(), a1);
      arrayEqual(mb2.array(), a2Range);

      mb1 = build(a1Range);
      arrayEqual(mb2.intersection(mb1).array(), a1);
      arrayEqual(mb1.array(), a1Range);
      arrayEqual(mb2.array(), a1);

      arrayEqual(mb1.intersection(mb3).array(), []);
      arrayEqual(mb1.array(), []);
      arrayEqual(mb3.array(), a3);

      mb1 = build(a1Range);

      arrayEqual(mb3.intersection(mb1).array(), []);

      arrayEqual(mb1.array(), a1Range);
      arrayEqual(mb3.array(), []);

      mb3 = build(a3);
      mb3.addRange(600, 900);
      const a3Range = mb3.array();

      arrayEqual(mb1.intersection(mb3).array(), []);
      arrayEqual(mb1.array(), []);
      arrayEqual(mb3.array(), a3Range);

      mb1 = build(a1Range);

      arrayEqual(mb3.intersection(mb1).array(), []);

      arrayEqual(mb1.array(), a1Range);
      arrayEqual(mb3.array(), []);
    });

    it("Testing intersects", () => {
      let a1 = [1, 2, 4, 5, 10];
      let a2 = [1, 2, 4, 5, 10, 100, 1000];
      let a3 = [6, 7, 8, 9, 200];
      const mb1 = build(a1);
      const mb2 = build(a2);
      const mb3 = build(a3);
      expect(mb1.intersects(mb2)).toBe(true);
      expect(mb2.intersects(mb1)).toBe(true);
      expect(mb1.intersects(mb3)).toBe(false);
      expect(mb3.intersects(mb1)).toBe(false);

      arrayEqual(mb1.array(), a1);
      arrayEqual(mb2.array(), a2);
      arrayEqual(mb3.array(), a3);

      mb1.addRange(201, 500);

      a1 = mb1.array();
      expect(mb1.intersects(mb2)).toBe(true);
      expect(mb2.intersects(mb1)).toBe(true);
      expect(mb1.intersects(mb3)).toBe(false);
      expect(mb3.intersects(mb1)).toBe(false);

      arrayEqual(mb1.array(), a1);
      arrayEqual(mb2.array(), a2);
      arrayEqual(mb3.array(), a3);

      mb2.addRange(600, 900);
      a2 = mb2.array();

      expect(mb1.intersects(mb2)).toBe(true);
      expect(mb2.intersects(mb1)).toBe(true);
      expect(mb1.intersects(mb3)).toBe(false);
      expect(mb3.intersects(mb1)).toBe(false);

      arrayEqual(mb1.array(), a1);
      arrayEqual(mb2.array(), a2);
      arrayEqual(mb3.array(), a3);

      mb3.addRange(600, 900);
      a3 = mb3.array();

      expect(mb1.intersects(mb2)).toBe(true);
      expect(mb2.intersects(mb1)).toBe(true);
      expect(mb1.intersects(mb3)).toBe(false);
      expect(mb3.intersects(mb1)).toBe(false);

      arrayEqual(mb1.array(), a1);
      arrayEqual(mb2.array(), a2);
      arrayEqual(mb3.array(), a3);
    });

    it("Testing new intersection", () => {
      const a1 = [1, 2, 4, 5, 10];
      const a2 = [1, 2, 4, 5, 10, 100, 1000];
      const a3 = [6, 7, 8, 9, 200];
      const mb1 = build(a1);
      const mb2 = build(a2);
      const mb3 = build(a3);
      arrayEqual(mb1.new_intersection(mb2).array(), a1);
      arrayEqual(mb2.new_intersection(mb1).array(), a1);
      arrayEqual(mb1.new_intersection(mb3).array(), []);
      arrayEqual(mb3.new_intersection(mb1).array(), []);

      arrayEqual(mb1.array(), a1);
      arrayEqual(mb2.array(), a2);
      arrayEqual(mb3.array(), a3);

      mb1.addRange(201, 500);

      const a1Range = mb1.array();
      arrayEqual(mb1.new_intersection(mb2).array(), a1);
      arrayEqual(mb2.new_intersection(mb1).array(), a1);
      arrayEqual(mb1.new_intersection(mb3).array(), []);
      arrayEqual(mb3.new_intersection(mb1).array(), []);

      arrayEqual(mb1.array(), a1Range);
      arrayEqual(mb2.array(), a2);
      arrayEqual(mb3.array(), a3);

      mb2.addRange(600, 900);
      const a2Range = mb2.array();

      arrayEqual(mb1.new_intersection(mb2).array(), a1);
      arrayEqual(mb2.new_intersection(mb1).array(), a1);
      arrayEqual(mb1.new_intersection(mb3).array(), []);
      arrayEqual(mb3.new_intersection(mb1).array(), []);

      arrayEqual(mb1.array(), a1Range);
      arrayEqual(mb2.array(), a2Range);
      arrayEqual(mb3.array(), a3);

      mb3.addRange(600, 900);
      const a3Range = mb3.array();

      arrayEqual(mb1.new_intersection(mb2).array(), a1);
      arrayEqual(mb2.new_intersection(mb1).array(), a1);
      arrayEqual(mb1.new_intersection(mb3).array(), []);
      arrayEqual(mb3.new_intersection(mb1).array(), []);

      arrayEqual(mb1.array(), a1Range);
      arrayEqual(mb2.array(), a2Range);
      arrayEqual(mb3.array(), a3Range);
    });

    it("Testing intersection size", () => {
      const a1 = [1, 2, 4, 5, 10];
      const a2 = [1, 2, 4, 5, 10, 100, 1000];
      const a3 = [6, 7, 8, 9, 200];
      const mb1 = build(a1);
      const mb2 = build(a2);
      const mb3 = build(a3);
      expect(mb1.intersection_size(mb2)).toBe(5);
      expect(mb2.intersection_size(mb1)).toBe(5);
      expect(mb1.intersection_size(mb3)).toBe(0);
      expect(mb3.intersection_size(mb1)).toBe(0);

      arrayEqual(mb1.array(), a1);
      arrayEqual(mb2.array(), a2);
      arrayEqual(mb3.array(), a3);

      mb1.addRange(201, 500);

      const a1Range = mb1.array();
      expect(mb1.intersection_size(mb2)).toBe(5);
      expect(mb2.intersection_size(mb1)).toBe(5);
      expect(mb1.intersection_size(mb3)).toBe(0);
      expect(mb3.intersection_size(mb1)).toBe(0);

      arrayEqual(mb1.array(), a1Range);
      arrayEqual(mb2.array(), a2);
      arrayEqual(mb3.array(), a3);

      mb2.addRange(600, 900);
      const a2Range = mb2.array();

      expect(mb1.intersection_size(mb2)).toBe(5);
      expect(mb2.intersection_size(mb1)).toBe(5);
      expect(mb1.intersection_size(mb3)).toBe(0);
      expect(mb3.intersection_size(mb1)).toBe(0);

      arrayEqual(mb1.array(), a1Range);
      arrayEqual(mb2.array(), a2Range);
      arrayEqual(mb3.array(), a3);

      mb3.addRange(600, 900);
      const a3Range = mb3.array();

      expect(mb1.intersection_size(mb2)).toBe(5);
      expect(mb2.intersection_size(mb1)).toBe(5);
      expect(mb1.intersection_size(mb3)).toBe(0);
      expect(mb3.intersection_size(mb1)).toBe(0);

      arrayEqual(mb1.array(), a1Range);
      arrayEqual(mb2.array(), a2Range);
      arrayEqual(mb3.array(), a3Range);
    });
  });
});
