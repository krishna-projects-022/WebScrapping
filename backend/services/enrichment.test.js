import { enrichmentService } from './enrichment.service.js';

async function testEnrichment() {
  // Example test data with various fields
  const testData = {
    description: [
      { text: 'Contact John Doe at john.doe@example.com or jane.smith@company.org.' },
      { text: 'Call us at (555) 123-4567 or +1-800-555-9876 for more info.' }
    ],
    emails: [
      { text: 'info@demo.com' },
      { text: 'support@demo.com' }
    ],
    phones: [
      { text: '+44 20 7946 0958' },
      { text: '(212) 555-1234' }
    ]
  };

  // Test enrichment for email and phone
  const enrichmentTypes = ['email', 'phone'];
  const enriched = await enrichmentService.enrichData(testData, enrichmentTypes);

  console.log('Original Data:', JSON.stringify(testData, null, 2));
  console.log('Enriched Data:', JSON.stringify(enriched, null, 2));
}

testEnrichment();
