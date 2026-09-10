import test from 'node:test';
import assert from 'node:assert/strict';
import '../../src/logic.js';

const {
  BASE_STAGE_COUNT, MAX_STAGE_BONUS, FIRST_SECTION_COUNT, MAX_SECTION_COUNT,
  SECONDS_PER_SECTION, MIN_STAGE_TIME, MAX_CLEAN_BONUS,
  CLEANER_LEVEL_STEP, MAX_CLEANER_LEVEL, CLEANER_RADIUS, CLEANER_RADIUS_STEP, CLEANER_PUSH, CLEANER_PUSH_STEP,
  seedStageLimit, stageSectionCount, cleanerLevel, cleanerRadius, cleanerPush,
  stageBaseTime, cleanTimeBonus, nextStageTime, stageScore,
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

test('stage time grows with section count and cleaning adds bounded bonus', () => {
  assert.equal(SECONDS_PER_SECTION, 5);
  assert.equal(MIN_STAGE_TIME, 12);
  assert.equal(MAX_CLEAN_BONUS, 12);
  assert.equal(stageBaseTime(1), 20);
  assert.equal(stageBaseTime(2), 25);
  assert.equal(stageBaseTime(29), 160);
  assert.equal(stageBaseTime(99), 160);
  assert.equal(cleanTimeBonus(0), 0);
  assert.equal(cleanTimeBonus(50), 6);
  assert.equal(cleanTimeBonus(100), 12);
  assert.equal(cleanTimeBonus(999), 12);
  assert.equal(nextStageTime(1, 50), 31);
});

test('cleaner gets wider and stronger every few stages then caps', () => {
  assert.equal(CLEANER_LEVEL_STEP, 5);
  assert.equal(MAX_CLEANER_LEVEL, 8);
  assert.equal(cleanerLevel(1), 1);
  assert.equal(cleanerLevel(5), 1);
  assert.equal(cleanerLevel(6), 2);
  assert.equal(cleanerLevel(999), 8);
  assert.equal(cleanerRadius(1), CLEANER_RADIUS);
  assert.equal(cleanerRadius(6), CLEANER_RADIUS + CLEANER_RADIUS_STEP);
  assert.equal(cleanerPush(1), CLEANER_PUSH);
  assert.ok(Math.abs(cleanerPush(6) - (CLEANER_PUSH + CLEANER_PUSH_STEP)) < 1e-9);
});

test('temporary score rewards reveal cleaning and remaining time', () => {
  assert.equal(stageScore(90, 50, 0), 1400);
  assert.ok(stageScore(100, 100, 10) > stageScore(90, 50, 0));
});
