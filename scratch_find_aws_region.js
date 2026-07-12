const fs = require('fs');

async function main() {
  const ip = '2406:da1c:61c:d601:35c9:faf0:f918:9e65';
  console.log("Fetching AWS IP ranges...");
  try {
    const res = await fetch("https://ip-ranges.amazonaws.com/ip-ranges.json");
    const data = await res.json();
    console.log("Total IPv6 prefixes:", data.ipv6_prefixes.length);
    
    // We need a basic IPv6 prefix matcher
    // For simplicity, we can do string prefix matching or convert both to bigints.
    // Let's convert a prefix to bigints or just print the prefixes that start with the same first few hex groups.
    // The IP starts with "2406:da1c:61c"
    const targetGroups = ['2406', 'da1c', '61c'];
    
    const matches = [];
    for (const prefix of data.ipv6_prefixes) {
      const parts = prefix.ipv6_prefix.split(':');
      // match first two/three groups
      if (parts[0] === '2406' && parts[1] === 'da1c') {
        matches.push(prefix);
      }
    }
    
    console.log("\nMatching prefixes for 2406:da1c:");
    console.table(matches);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();
