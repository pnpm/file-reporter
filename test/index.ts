import test = require('tape')
import ndjson = require('ndjson')
import child = require('child_process')
import path = require('path')
import fs = require('fs')
import exists = require('path-exists')

const fixtures = path.join(__dirname, 'fixture')

test('pnpm-log is created on fail', t => {
  const fixture = path.join(fixtures, '1')
  child.spawnSync('node', [path.join(fixture, 'index.js')], {cwd: fixture})
  const actual = fs.readFileSync(path.join(fixture, 'pnpm-debug.log'), 'UTF8')
  const expected = fs.readFileSync(path.join(fixture, 'stdout'), 'UTF8')
  t.equal(actual, expected)
  t.end()
})

test('pnpm-log is not created on success', async t => {
  const fixture = path.join(fixtures, '2')
  child.spawnSync('node', [path.join(fixture, 'index.js')], {cwd: fixture})
  t.ok(!await exists(path.join(fixture, 'pnpm-debug.log')), 'log file is not created when 0 exit code')
  t.end()
})
