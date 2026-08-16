// Run with:  node --test src/lib/seed.test.js
import test from 'node:test'
import assert from 'node:assert/strict'
import { hostOf, rakhiSpec, safeUrl } from './seed.js'

test('safeUrl only lets http(s) through to an href', () => {
  assert.equal(safeUrl('https://amazon.in/x'), 'https://amazon.in/x')
  assert.equal(safeUrl('http://amazon.in/x'), 'http://amazon.in/x')
  // the ones that would otherwise become click-to-run script for every sister
  assert.equal(safeUrl('javascript:alert(1)'), null)
  assert.equal(safeUrl('JavaScript:alert(1)'), null)
  assert.equal(safeUrl('data:text/html,<script>x</script>'), null)
  assert.equal(safeUrl('amazon.in/x'), null) // no scheme at all
  assert.equal(safeUrl(''), null)
  assert.equal(safeUrl(null), null)
})

test('hostOf never throws on junk', () => {
  assert.equal(hostOf('https://www.amazon.in/x'), 'amazon.in')
  assert.equal(hostOf('not a url'), 'link')
})

test('a rakhi is stable for its seed and different across seeds', () => {
  assert.deepEqual(rakhiSpec('RiyaKettle'), rakhiSpec('RiyaKettle'))
  assert.notDeepEqual(rakhiSpec('RiyaKettle'), rakhiSpec('MeeraSketchbook'))
})
