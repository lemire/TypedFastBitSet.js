import { SparseTypedFastBitSet } from "./SparseTypedFastBitSet";
import { TypedFastBitSet } from "./TypedFastBitSet";
import { BitSet } from "./utils";

export const bitsetTest = (
  tests: (props: {
    name: string;
    build: (iterable?: number[]) => BitSet;
    arrayEqual: (actual: number[], expected: number[]) => void;
  }) => void
) => {
  tests({
    name: "TypedFastBitSet",
    build: (a) => new TypedFastBitSet(a),
    arrayEqual: (a, b) => expect(a).toEqual(b),
  });
  tests({
    name: "SparseTypedFastBitSet",
    build: (a) => new SparseTypedFastBitSet(a),
    arrayEqual: (a, b) => {
      a.sort();
      b.sort();
      expect(a).toEqual(b);
    },
  });
};
