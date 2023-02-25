import { bitsetTest } from "./testUtils";

bitsetTest(({ name, build, arrayEqual }) => {
  describe(name, () => {
    it("Testing forEach", () => {
      const a1 = [1, 2, 4, 5, 10];

      const mb1 = build(a1);

      const actual: number[] = [];
      mb1.forEach((a) => actual.push(a));

      arrayEqual(actual, a1);

      actual.length = 0;

      mb1.addRange(100, 400);

      mb1.forEach((a) => actual.push(a));

      arrayEqual(actual, mb1.array());
    });

    it("Testing Iterator", () => {
      const a1 = [1, 2, 4, 5, 10];

      const mb1 = build(a1);

      const actual: number[] = [];
      for (const index of mb1) {
        actual.push(index);
      }

      arrayEqual(actual, a1);

      actual.length = 0;

      mb1.addRange(100, 400);

      for (const index of mb1) {
        actual.push(index);
      }

      arrayEqual(actual, mb1.array());
    });

    it("Testing forEach delete self", () => {
      const a1 = [1, 2, 4, 5, 10];

      const mb1 = build(a1);

      const actual: number[] = [];
      mb1.forEach((a) => {
        if (a === 4) {
          mb1.remove(a);
        }
        actual.push(a);
      });

      arrayEqual(actual, a1);

      actual.length = 0;

      mb1.addRange(100, 400);

      mb1.forEach((a) => actual.push(a));

      arrayEqual(actual, mb1.array());
    });

    it("Testing Iterator delete self", () => {
      const a1 = [1, 2, 4, 5, 10];

      const mb1 = build(a1);

      const actual: number[] = [];
      for (const index of mb1) {
        if (index === 4) {
          mb1.remove(index);
        }
        actual.push(index);
      }

      arrayEqual(actual, a1);

      actual.length = 0;

      mb1.addRange(100, 400);

      for (const index of mb1) {
        actual.push(index);
      }

      arrayEqual(actual, mb1.array());
    });
  });
});
