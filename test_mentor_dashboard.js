const { getMentorDashboard } = require('./app/actions/mentorship');

async function runTest() {
  const email = 'test_mentor@example.com';
  console.log("Testing getMentorDashboard for:", email);
  try {
    const result = await getMentorDashboard(email);
    console.log("Success! Dashboard retrieved:", {
      mentor: result.mentor?.name,
      clientsCount: result.clients?.length,
      reviewRequestsCount: result.reviewRequests?.length,
      sessionsCount: result.sessions?.length,
      kpis: result.kpis
    });
  } catch (err) {
    console.error("Error in getMentorDashboard:", err);
  }
}

runTest().then(() => console.log("Done."));
