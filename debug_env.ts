console.log("Checking environment variables...");
const keys = ["API_KEY", "GEMINI_API_KEY", "GOOGLE_API_KEY"];
for (const key of keys) {
  const val = process.env[key];
  if (val) {
    console.log(`${key}: Found, Length: ${val.length}, StartsWith: ${val.substring(0, 4)}...`);
  } else {
    console.log(`${key}: Not found`);
  }
}
