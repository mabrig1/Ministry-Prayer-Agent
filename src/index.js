import runAgent from './agent.js';

try {
  await runAgent();
  console.log('\nMinistry Agent complete ✅');
} catch (error) {
  console.error('\n❌ Ministry Agent failed:', error.message);
  process.exit(1);
}
