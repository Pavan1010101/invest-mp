import { POST } from './app/api/v1/registrations/route';

async function main() {
  const req = new Request('http://localhost:3000/api/v1/registrations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: "REG-9999",
      applicantName: "Test",
      email: "test2@example.com",
      phone: "9876543210",
      organization: "Test Org",
      type: "Investor",
      badgeRole: "Investor",
      sector: "IT",
      investmentInterestINR: 10000,
    })
  });

  try {
    const res = await POST(req);
    console.log("Status:", res.status);
    console.log("Body:", await res.text());
  } catch (err) {
    console.error("Uncaught exception:", err);
  }
}

main();
