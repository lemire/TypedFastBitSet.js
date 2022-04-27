import { bitsetTest } from "./testUtils";

bitsetTest(({ name, build, arrayEqual }) => {
  describe(name, () => {
    it("Testing clone", () => {
      const ai = [1, 2, 4, 5, 10, 31, 32, 63, 64];
      const mb = build(ai);
      const mb2 = mb.clone();
      const a = mb2.array();
      arrayEqual(a, ai); // bad value
      expect(mb.equals(mb2)).toBe(true); // bad clone
    });

    it("Testing large clone", () => {
      const ai = [1, 2, 4, 5, 10, 31, 32, 63, 64];
      const mb = build(ai);

      mb.addRange(100, 400);

      const mb2 = mb.clone();
      const a = mb2.array();
      arrayEqual(a, mb.array()); // bad value
      expect(mb.equals(mb2)).toBe(true); // bad clone
    });
  });
});
