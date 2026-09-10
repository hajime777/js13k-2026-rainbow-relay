import test from 'node:test';
import assert from 'node:assert/strict';
import '../../src/logic.js';

const {
  BASE_STAGE_COUNT, MAX_STAGE_BONUS, FIRST_SECTION_COUNT, MAX_SECTION_COUNT,
  seedStageLimit, stageSectionCount,
} = globalThis.RainbowLogic;

test('seed stage limit stays in the standard-plus-extra range', () => {
  assert.equal(BASE_STAGE_COUNT, 32);
  assert.equal(MAX_STAGE_BONUS, 31);
  assert.equal(seedStageLimit(0), 32);
  assert.equal(seedStageLimit(0xffffffff), 63);
});

test('stage section count starts at four and caps at thirty-two', () => {
  assert.equal(FIRST_SECTION_COUNT, 4);
  assert.equal(MAX_SECTION_COUNT, 32);
  assert.equal(stageSectionCount(1), 4);
  assert.equal(stageSectionCount(2), 5);
  assert.equal(stageSectionCount(29), 32);
  assert.equal(stageSectionCount(30), 32);
  assert.equal(stageSectionCount(999), 32);
});
