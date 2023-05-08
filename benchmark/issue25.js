/* performance benchmark */
/* This script expects node.js */

"use strict";

const { TypedFastBitSet, SparseTypedFastBitSet } = require("../lib");
const Benchmark = require("benchmark");
const os = require("os");

const smallgap = 3;
const largegap = 210;
const N = 1024 * 1024;
function ForEachBench() {
  console.log("starting forEach benchmark");
  const tb = new TypedFastBitSet();
  const stb = new SparseTypedFastBitSet();
  const tb_small = new TypedFastBitSet();

  const s = new Set();
  for (let i = 0; i < N; i++) {
    if (i < 100) {
      tb_small.add(i);
    }
    tb.add(smallgap * i + 5);
    stb.add(smallgap * i + 5);
  }

  const suite = new Benchmark.Suite();
  // add tests
  const ms = suite
    .add("TypedFastBitSet-forof", function () {
      let card = 0;
      for (const element of stb) {
        card++;
      }
      return card;
    })
    .add("TypedFastBitSet-foreach", function () {
      let card = 0;
      const inc = function () {
        card++;
      };
      tb.forEach(inc);
      return card;
    })
    .add("SparseTypedFastBitSet-forof", function () {
      let card = 0;
      for (const element of stb) {
        card++;
      }
      return card;
    })
    .add("SparseTypedFastBitSet-foreach", function () {
      let card = 0;
      const inc = function () {
        card++;
      };
      tb.forEach(inc);
      return card;
    })
    .add("TypedFastBitSet-nested-forof", function () {
      let card = 0;
      for (const x of tb_small) {
        for (const y of tb_small) {
          for (const z of tb_small) {
            card += x + y + z;
          }
        }
      }
      return card;
    })
    .add("TypedFastBitSet-nested-forEach", function () {
      let card = 0;
      tb_small.forEach(function (x) {
        tb_small.forEach(function (y) {
          tb_small.forEach(function (z) {
            card += x + y + z;
          });
        });
      });
      return card;
    })
    // add listeners
    .on("cycle", function (event) {
      console.log(String(event.target));
    })
    // run async
    .run({ async: false });
}

const main = function () {
  console.log(
    "Platform: " + process.platform + " " + os.release() + " " + process.arch
  );
  console.log(os.cpus()[0]["model"]);
  console.log(
    "Node version " +
      process.versions.node +
      ", v8 version " +
      process.versions.v8
  );
  console.log("");
  ForEachBench();
  console.log("");
};

if (require.main === module) {
  main();
}
