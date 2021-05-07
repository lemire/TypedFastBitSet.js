import TypedFastBitSet from "../TypedFastBitSet";
describe("Types", () => {
  it("Testing no type errors", () => {
    function arraysEquals(a: number[], b: number[]) {
      let i = a.length;
      if (i != b.length) return false;
      while (i--) {
        if (a[i] !== b[i]) return false;
      }
      return true;
    }
    const bs = new TypedFastBitSet();

    bs.add(3);
    bs.addRange(5, 10);
    bs.remove(6);
    bs.removeRange(9, 11);
    if (!arraysEquals([3, 5, 7, 8], Array.from(bs))) throw "bad array";
  });
});
