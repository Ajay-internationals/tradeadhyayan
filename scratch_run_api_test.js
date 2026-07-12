async function runTest() {
  console.log("Triggering integration tests on http://localhost:3000/api/test-actions...");
  const start = Date.now();
  try {
    const response = await fetch("http://localhost:3000/api/test-actions");
    const data = await response.json();
    console.log(`\nHTTP Response Code: ${response.status} (Finished in ${Date.now() - start}ms)`);
    console.log("Response Body:\n", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Test request failed:", error.message);
  }
}

runTest();
