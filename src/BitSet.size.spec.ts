import { bitsetTest } from "./testUtils";

bitsetTest(({ name, build, arrayEqual }) => {
  describe(name, () => {
    it("Testing size", () => {
      const mb = build([0, 9, 2, 8]);
      expect(mb.size()).toBe(4);

      mb.addRange(200, 500);

      expect(mb.size()).toBe(304);
    });
  });
});
