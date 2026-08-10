fetch('http://localhost:3000/api/v1/registrations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
      id: "REG-1234",
      applicantName: "Test",
      email: "test@example.com",
      phone: "1234567890",
      organization: "Test Org",
      type: "Investor",
      badgeRole: "Investor",
      sector: "IT",
      investmentInterestINR: 10000,
  })
}).then(res => res.text().then(text => console.log(res.status, text))).catch(console.error);
