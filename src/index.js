import { runMinistryAgent } from './agent.js';
import dotenv from 'dotenv';

dotenv.config();

const topic = process.argv[2] || 'hope and healing in difficult times';

runMinistryAgent(topic)
  .then(result => {
    console.log('\n' + '═'.repeat(60));
    console.log('✨ Ministry Agent Complete!');
    console.log('═'.repeat(60) + '\n');
    if (result) console.log(result);
  })
  .catch(error => {
    console.error('\n❌ Error running ministry agent:', error.message);
    process.exit(1);
  });
