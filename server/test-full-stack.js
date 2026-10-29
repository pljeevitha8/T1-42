import { spawn } from 'child_process';

console.log('--- STARTING SKETCHTRACE AI FULL-STACK VERIFICATION TEST ---');

// Spawn server
const server = spawn('node', ['dist/index.js'], {
  cwd: process.cwd(),
  stdio: ['ignore', 'pipe', 'pipe'],
});

server.stdout.on('data', (d) => process.stdout.write(`[SERVER] ${d}`));
server.stderr.on('data', (d) => process.stderr.write(`[SERVER ERR] ${d}`));

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  await delay(2000); // Wait for server to bind

  try {
    // 1. Health check
    console.log('\n[TEST 1] Testing /api/health...');
    const healthRes = await fetch('http://localhost:5000/api/health');
    const healthData = await healthRes.json();
    console.log('Health check response:', healthData);
    if (healthData.status !== 'OPERATIONAL') throw new Error('Health check failed');
    console.log('✓ Health check passed');

    // 2. Demo Accounts
    console.log('\n[TEST 2] Testing /api/auth/demo-accounts...');
    const demoRes = await fetch('http://localhost:5000/api/auth/demo-accounts');
    const demoData = await demoRes.json();
    console.log(`Received ${demoData.demoAccounts.length} demo accounts.`);
    if (demoData.demoAccounts.length < 3) throw new Error('Expected 3 demo accounts');
    console.log('✓ Demo accounts verified');

    // 3. Login as Admin Lead Investigator
    console.log('\n[TEST 3] Testing /api/auth/login as Lead Investigator...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'lead.investigator@metro-forensics.gov',
        password: 'Forensics2026!',
      }),
    });
    const loginData = await loginRes.json();
    if (!loginData.token) throw new Error('Login failed: ' + JSON.stringify(loginData));
    const token = loginData.token;
    console.log(`✓ Authenticated as: ${loginData.user.name} (${loginData.user.role})`);

    // 4. Fetch Cases
    console.log('\n[TEST 4] Testing GET /api/cases...');
    const casesRes = await fetch('http://localhost:5000/api/cases', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const casesData = await casesRes.json();
    console.log(`✓ Retrieved ${casesData.cases.length} cases.`);
    const firstCase = casesData.cases[0];
    console.log(`First Case ID: ${firstCase.id}, Title: ${firstCase.title}, Sketches: ${firstCase.sketches.length}`);

    // 5. Test Natural Language Witness Statement Parser
    console.log('\n[TEST 5] Testing POST /api/sketches/parse-statement...');
    const parseRes = await fetch('http://localhost:5000/api/sketches/parse-statement', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        statement: 'Suspect was an athletic male, around 35 years old, sharp angular jawline, hooded dark eyes, horizontal scar over left eyebrow, short black buzz cut hair, 5 o clock shadow stubble, and wore wire-rim glasses.',
      }),
    });
    const parseData = await parseRes.json();
    console.log('AI-Extracted Features:', parseData.extracted);
    if (parseData.extracted.gender !== 'Male' || parseData.extracted.jawline !== 'Sharp Angular') {
      throw new Error('Feature extraction did not extract expected attributes');
    }
    console.log('✓ Natural Language Feature extraction passed');

    // 6. Test Sketch Generation / Iteration
    console.log('\n[TEST 6] Testing POST /api/sketches/refine...');
    const refineRes = await fetch('http://localhost:5000/api/sketches/refine', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        caseId: firstCase.id,
        features: {
          ...firstCase.features,
          refinements: {
            ...firstCase.features.refinements,
            ageOffset: 3,
            jawWidth: 75,
          },
        },
        refinementNotes: 'Witness instructed: widen the mandibular jawline and add deeper graphite shading.',
      }),
    });
    const refineData = await refineRes.json();
    console.log(`✓ Refined sketch created: ${refineData.sketch.id}, Version: v${refineData.sketch.versionNumber}, Confidence: ${refineData.sketch.confidenceScore}%`);

    // 7. Test Cryptographic Audit Verification
    console.log('\n[TEST 7] Testing GET /api/audit/verify-integrity...');
    const auditVerifyRes = await fetch('http://localhost:5000/api/audit/verify-integrity', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const auditVerifyData = await auditVerifyRes.json();
    console.log('Chain of Custody Verification:', auditVerifyData);
    if (!auditVerifyData.tamperEvidentVerified) throw new Error('Audit chain verification failed');
    console.log('✓ Cryptographic Chain of Custody verified intact!');

    // 8. Test Static Frontend Serving
    console.log('\n[TEST 8] Testing static frontend root GET /...');
    const frontendRes = await fetch('http://localhost:5000/');
    const frontendHtml = await frontendRes.text();
    if (!frontendHtml.includes('SketchTrace AI')) throw new Error('Frontend HTML does not include expected title');
    console.log('✓ Frontend static build served properly by Node server!');

    console.log('\n======================================================');
    console.log('  ALL FULL-STACK TESTS PASSED SUCCESSFULLY! (8/8)     ');
    console.log('======================================================');
  } catch (err) {
    console.error('TEST ERROR:', err);
    process.exitCode = 1;
  } finally {
    server.kill();
  }
}

runTests();
