import { bitsetTest } from "./testUtils";

bitsetTest(({ name, build, arrayEqual }) => {
  describe(name, () => {
    it("Testing set/get/clear", () => {
      const mb = build();

      expect(mb.has(0)).toBe(false);
      const N = 1024;
      let step = 1; // check less as N grows
      for (let i = 0; i < N; i++) {
        if (i % 10) step++;
        mb.add(i);
        expect(mb.has(i)).toBe(true); // 'set did not register'
        expect(mb.size()).toBe(i + 1); // 'cardinality bug ' + i + ' ' + mb.size()
        for (let j = 0; j <= i; j += step) {
          expect(mb.has(j)).toBe(true); // bad get
        }
        for (let j = i + 1; j < N; j += step) {
          expect(mb.has(j)).toBe(false); // bad get
        }
      }
      for (let i = N - 1; i >= 0; i--) {
        if (i % 10) step--;
        mb.remove(i);
        expect(mb.has(i)).toBe(false); // 'clear did not register'
        expect(mb.size()).toBe(i); // 'cardinality bug ' + i + ' ' + mb.size()
        for (let j = 0; j < i; j += step) {
          expect(mb.has(j)).toBe(true); // bad get
        }
        for (let j = i; j < N; j += step) {
          expect(mb.has(j)).toBe(false); // bad get
        }
      }
    });

    it("Testing init", () => {
      const ai = [1, 2, 4, 5, 10];
      const mb = build(ai);
      expect(mb.size()).toBe(ai.length); // 'bad init'
    });

    it("Testing array", () => {
      for (let i = 0; i < 128; i++) {
        for (let j = 0; j < i; j++) {
          const ai = [j, i];
          const mb = build(ai);
          arrayEqual(mb.array(), ai); // 'bad array'
        }
      }
    });

    it("test Out off order add", () => {
      const mb = build([1024, 512, 0]);
      arrayEqual(mb.array(), [0, 512, 1024]);
    });

    it("Testing card", () => {
      for (let offset = 1; offset < 32; offset++) {
        const mb = build();
        for (let i = 0; i < 1024; i++) {
          mb.add(i * offset);
          expect(mb.size()).toBe(i + 1); // 'bad card ' + i + ' offset = ' + offset + ' ' + mb.size()
        }
      }
    });

    it("checkedAdd", () => {
      const mb = build();
      expect(mb.checkedAdd(0)).toBe(1);
      expect(mb.checkedAdd(2)).toBe(1);
      mb.remove(0);
      mb.remove(2);

      mb.addRange(20, 500);
      expect(mb.checkedAdd(0)).toBe(1);
      expect(mb.checkedAdd(2)).toBe(1);

      expect(mb.checkedAdd(0)).toBe(0);
      expect(mb.checkedAdd(2)).toBe(0);
    });

    it("Testing clear", () => {
      const mb = build();
      mb.add(1);
      mb.add(20);
      arrayEqual(mb.array(), [1, 20]);
      mb.clear();
      arrayEqual(mb.array(), []);
      expect(mb.size()).toBe(0);

      const arr = [];
      mb.addRange(0, 500);

      for (let i = 0; i < 500; i++) {
        arr.push(i);
      }
      arrayEqual(mb.array(), arr);
      expect(mb.size()).toBe(500);
      mb.clear();

      arrayEqual(mb.array(), []);
      expect(mb.size()).toBe(0);
    });

    it("Testing values", () => {
      const ai = [1, 2, 4, 5, 10];
      const mb = build(ai);
      const a = mb.array();
      arrayEqual(a, ai); // 'bad values'
      for (let i = 0; i < a.length; i++) {
        expect(mb.has(a[i])).toBe(true); // 'bad enumeration'
      }
    });

    it("Testing isEmpty", () => {
      const ai = [0];
      const mb = build(ai);
      expect(mb.isEmpty()).toBe(false);
      mb.remove(0);
      expect(mb.isEmpty()).toBe(true);
      mb.addRange(0, 400);
      expect(mb.isEmpty()).toBe(false);
      mb.removeRange(0, 400);
      expect(mb.isEmpty()).toBe(true);
    });

    it("Testing addRange/removeRange", () => {
      const b1 = build();

      b1.addRange(200, 100);
      expect(b1.size()).toBe(0); // bad size

      b1.addRange(1, 3);
      arrayEqual(b1.array(), [1, 2]);

      b1.addRange(0, 1);
      expect(b1.has(0)); // bad value
      expect(b1.size()).toBe(3); // bad size

      b1.removeRange(1, 3);

      expect(b1.size()).toBe(1); // bad size
      arrayEqual(b1.array(), [0]);

      b1.addRange(32, 64);
      for (let i = 32; i < 64; ++i) {
        expect(b1.has(i)).toBe(true); // bad value
      }
      expect(b1.size()).toBe(33); // bad size

      b1.addRange(64, 129);
      for (let i = 63; i < 129; ++i) {
        expect(b1.has(i)).toBe(true); // bad value
      }

      expect(b1.size()).toBe(98); // bad size

      let step = 1; // check less as i grows
      for (let i = 0; i < 256; ++i) {
        if (i % 10) step++;
        for (let j = i - 1; j < 256; j += step) {
          const bb = build();
          bb.addRange(i, j);
          for (let k = 0; k < 256 + 32; k += step) {
            expect(bb.has(k)).toBe(k >= i && k < j); // bad value
          }
          if (j > i) {
            expect(bb.size()).toBe(j - i); // bad count
          }
        }
      }

      const b2 = build();
      b2.addRange(0, 193);
      b2.remove(0);
      b2.remove(63);
      b2.remove(128);
      b2.trim();

      step = 1; // check less as i grows
      for (let i = 0; i < 256; ++i) {
        if (i % 10) step++;

        for (let j = i - 1; j < 256; j += step) {
          const bb = b2.clone();
          bb.removeRange(i, j);
          for (let k = 0; k < 256 + 32; k += step) {
            expect(bb.has(k) !== (b2.has(k) && !(k >= i && k < j))).toBe(false); // bad value
          }
        }
      }
    });
  });
});
