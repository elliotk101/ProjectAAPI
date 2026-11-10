import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatVerifiedDate,
  toNyIsoDate,
  parseNySenateBillHtml,
} from './billStatusParser.js';

const SAMPLE_AWAITING_HTML = `
<div class="c-block c-detail--status c-bill-section">
  <h2 class="c-detail--subhead c-detail--section-title c-bill-detail--subhead">
    Current Bill Status -
    <span>Passed Senate &amp; Assembly</span>
  </h2>
  <figure class="nys-bill-status-figure" aria-hidden="true">
    <ul class="nys-bill-status" aria-hidden="true">
      <li class="nys-bill-status-no-group nys-bill-status-passed" title="Introduced"></li>
      <li class="nys-bill-status-top-group nys-bill-status-passed" title="Passed Assembly"></li>
      <li class="nys-bill-status-bottom-group nys-bill-status-passed" title="Passed Senate"></li>
      <li class="nys-bill-status-no-group" title="Delivered to Governor"></li>
      <li class="nys-bill-status-no-group" title="Signed By Governor"></li>
    </ul>
  </figure>
</div>
`;

const SAMPLE_SIGNED_HTML = `
<div class="c-block c-detail--status c-bill-section">
  <h2 class="c-detail--subhead">
    Current Bill Status - <span>Signed By Governor</span>
  </h2>
  <ul class="nys-bill-status">
    <li class="nys-bill-status-no-group nys-bill-status-passed" title="Introduced"></li>
    <li class="nys-bill-status-top-group nys-bill-status-passed" title="Passed Assembly"></li>
    <li class="nys-bill-status-bottom-group nys-bill-status-passed" title="Passed Senate"></li>
    <li class="nys-bill-status-no-group nys-bill-status-passed" title="Delivered to Governor"></li>
    <li class="nys-bill-status-no-group nys-bill-status-passed" title="Signed By Governor"></li>
  </ul>
</div>
`;

test('parseNySenateBillHtml detects awaiting-signature status and formats date', () => {
  const result = parseNySenateBillHtml(SAMPLE_AWAITING_HTML, '2026-11-10');
  assert.equal(result.ok, true);
  assert.equal(result.code, 'S634B');
  assert.equal(result.state, 'awaiting-signature');
  assert.equal(result.senateStatusText, 'Passed Senate & Assembly');
  assert.equal(result.milestones.passedSenate, true);
  assert.equal(result.milestones.passedAssembly, true);
  assert.equal(result.milestones.signedByGovernor, false);
  assert.equal(result.lastVerified, 'November 10, 2026');
  assert.equal(result.lastVerifiedIso, '2026-11-10');
});

test('parseNySenateBillHtml detects enacted status when signed by Governor', () => {
  const result = parseNySenateBillHtml(SAMPLE_SIGNED_HTML, '2026-11-10');
  assert.equal(result.state, 'enacted');
  assert.equal(result.milestones.signedByGovernor, true);
});

test('parseNySenateBillHtml rejects unexpected HTML without bill status markup', () => {
  assert.throws(
    () => parseNySenateBillHtml('<html><body>Maintenance</body></html>'),
    /missing nys-bill-status/
  );
});

test('formatVerifiedDate and toNyIsoDate format dates in New York timezone', () => {
  assert.equal(formatVerifiedDate('2026-11-10'), 'November 10, 2026');
  assert.equal(toNyIsoDate('2026-11-10'), '2026-11-10');
});

