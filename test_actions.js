const {
  getTrades,
  getStrategies,
  getGoals,
  getCalendarEvents,
  getUserSettings,
  getBrokerConnections,
  getSyncLogs,
  getMistakes,
  getMentorReviews
} = require('./app/actions/trades');

// Since we are running in node, we need to load env variables first
// We will call the actions for 'test@example.com'

async function runTest() {
  const email = 'test@example.com';
  console.log("Testing server actions for:", email);

  const tests = [
    { name: 'getTrades', fn: () => getTrades(email) },
    { name: 'getStrategies', fn: () => getStrategies(email) },
    { name: 'getGoals', fn: () => getGoals(email) },
    { name: 'getCalendarEvents', fn: () => getCalendarEvents(email) },
    { name: 'getUserSettings', fn: () => getUserSettings(email) },
    { name: 'getBrokerConnections', fn: () => getBrokerConnections(email) },
    { name: 'getSyncLogs', fn: () => getSyncLogs(email) },
    { name: 'getMistakes', fn: () => getMistakes(email) },
    { name: 'getMentorReviews', fn: () => getMentorReviews(email) }
  ];

  for (const test of tests) {
    console.log(`Running ${test.name}...`);
    try {
      const start = Date.now();
      const result = await test.fn();
      console.log(`Finished ${test.name} in ${Date.now() - start}ms. Result count/presence:`, Array.isArray(result) ? result.length : (result ? 'Yes' : 'No'));
    } catch (e) {
      console.error(`Error in ${test.name}:`, e);
    }
  }
}

runTest().then(() => console.log("All tests complete."));
