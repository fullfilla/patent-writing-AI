import test from "node:test";
import assert from "node:assert/strict";
import { buildStyleProfile } from "../src/style-distiller.js";

test("buildStyleProfile infers embodiment-heavy style", () => {
  const profile = buildStyleProfile({
    rawText:
      "技术领域 本发明涉及材料工艺。背景技术 现有技术存在导电性差的问题。发明内容 提出一种制备方法。具体实施方式 实施例1中，步骤S1进行清洗，步骤S2进行混料，优选地，厚度控制在30微米。实施例2中，进一步地进行双阶段固化。有益效果 提高稳定性。",
  });

  assert.equal(profile.archetype, "实施例充盈型");
  assert.match(profile.metrics.embodimentDetail, /高|中/);
  assert.ok(profile.signaturePhrases.includes("实施例"));
});
