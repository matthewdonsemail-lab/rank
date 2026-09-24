import http from 'node:http';

async function main() {
  console.log('Testing Mock Architecture, Doc Backing Validation & Treg Routes...');

  const { createMockServer } = await import('../mock/server.ts');
  const { mockClient } = await import('../mock/client.ts');
  const { mockStore } = await import('../mock/store.ts');
  const { validateFixtureDocBacking } = await import('../mock/validator.ts');

  // 1. Verify in-memory relational store referential integrity
  console.log('Verifying relational store integrity...');
  const user = mockStore.authUsers[0];
  const org = mockStore.authOrganizations[0];
  const ws = mockStore.workspaces[0];
  const key = mockStore.apiKeys[0];
  const session = mockStore.rankSessions[0];
  const candidates = mockStore.getCandidatesBySession(session.id);
  const receipt = mockStore.getReceiptBySession(session.id);
  const benchmark = mockStore.benchmarkRuns[0];
  const agentThread = mockStore.agentThreads[0];
  const agentMessage = mockStore.agentMessages[0];
  const mailInbox = mockStore.agentMailInboxes[0];
  const mailThread = mockStore.agentMailThreads[0];
  const mailMessage = mockStore.agentMailMessages[0];
  const tregTool = mockStore.tregTools[0];
  const tregCall = mockStore.tregCalls[0];

  if (org.ownerId !== user.id) throw new Error('Referential mismatch: org.ownerId != user.id');
  if (ws.organizationId !== org.id) throw new Error('Referential mismatch: ws.organizationId != org.id');
  if (key.workspaceId !== ws.id) throw new Error('Referential mismatch: key.workspaceId != ws.id');
  if (session.workspaceId !== ws.id) throw new Error('Referential mismatch: session.workspaceId != ws.id');
  if (candidates.length === 0 || candidates[0].sessionId !== session.id) {
    throw new Error('Referential mismatch: candidate.sessionId != session.id');
  }
  if (!receipt || receipt.sessionId !== session.id) {
    throw new Error('Referential mismatch: receipt.sessionId != session.id');
  }
  if (benchmark.workspaceId !== ws.id) throw new Error('Referential mismatch: benchmark.workspaceId != ws.id');
  if (agentThread.workspaceId !== ws.id) throw new Error('Referential mismatch: agentThread.workspaceId != ws.id');
  if (agentMessage.threadId !== agentThread.id) throw new Error('Referential mismatch: agentMessage.threadId != agentThread.id');
  if (mailInbox.workspaceId !== ws.id) throw new Error('Referential mismatch: mailInbox.workspaceId != ws.id');
  if (mailThread.inboxId !== mailInbox.id) throw new Error('Referential mismatch: mailThread.inboxId != mailInbox.id');
  if (mailMessage.threadId !== mailThread.id) throw new Error('Referential mismatch: mailMessage.threadId != mailThread.id');
  if (!tregTool.endpoint) throw new Error('Treg tool missing endpoint');
  if (!tregCall.callId) throw new Error('Treg call missing callId');

  console.log('Referential integrity checks passed across all relational models.');

  // 2. Start mock server on ephemeral port
  const TEST_PORT = 3999;
  const server = createMockServer();
  await new Promise((resolve) => server.listen(TEST_PORT, resolve));
  const baseUrl = `http://localhost:${TEST_PORT}`;
  console.log(`Mock server running on ${baseUrl}`);

  const testEndpoints = [
    { method: 'GET', path: '/health', validate: (d) => d.status === 'healthy' },
    { method: 'GET', path: '/api/auth/user', validate: (d) => d.id === 'usr_rank_01' },
    { method: 'GET', path: '/api/auth/organization', validate: (d) => d.slug === 'listeningkit-lab' },
    { method: 'GET', path: '/api/workspaces', validate: (d) => Array.isArray(d) && d.length >= 2 },
    { method: 'GET', path: '/api/workspaces/nebius-core-prod', validate: (d) => d.slug === 'nebius-core-prod' && d.stats },
    { method: 'GET', path: '/api/keys?workspaceId=ws_rank_01', validate: (d) => Array.isArray(d) && d.length >= 2 },
    { method: 'GET', path: '/api/v1/sessions?workspaceId=ws_rank_01', validate: (d) => Array.isArray(d) && d.length >= 2 },
    { method: 'GET', path: '/api/v1/sessions/rs_rank_01', validate: (d) => d.session && d.candidates.length === 3 },
    { method: 'GET', path: '/api/v1/sessions/rs_rank_01/candidates', validate: (d) => Array.isArray(d) && d.length === 3 },
    { method: 'GET', path: '/api/v1/receipts?sessionId=rs_rank_01', validate: (d) => Array.isArray(d) && d.length === 1 },
    { method: 'GET', path: '/api/benchmarks?workspaceId=ws_rank_01', validate: (d) => Array.isArray(d) && d.length >= 3 },
    { method: 'GET', path: '/api/agent/threads?workspaceId=ws_rank_01', validate: (d) => Array.isArray(d) && d.length >= 2 },
    { method: 'GET', path: '/api/agent/messages?threadId=ath_rank_01', validate: (d) => Array.isArray(d) && d.length >= 2 },
    { method: 'GET', path: '/api/agentmail/inboxes?workspaceId=ws_rank_01', validate: (d) => Array.isArray(d) && d.length >= 1 },
    { method: 'GET', path: '/api/agentmail/threads?inboxId=inbox_rank_01', validate: (d) => Array.isArray(d) && d.length >= 2 },
    { method: 'GET', path: '/api/agentmail/messages?threadId=mth_rank_01', validate: (d) => Array.isArray(d) && d.length >= 2 },
    { method: 'GET', path: '/api/treg/tools', validate: (d) => Array.isArray(d) && d.length >= 4 },
    { method: 'GET', path: '/api/treg/calls', validate: (d) => Array.isArray(d) && d.length >= 2 },
  ];

  for (const ep of testEndpoints) {
    const res = await fetch(`${baseUrl}${ep.path}`, { method: ep.method });
    if (!res.ok) {
      throw new Error(`Endpoint ${ep.path} returned status ${res.status}`);
    }
    const data = await res.json();
    if (!ep.validate(data)) {
      throw new Error(`Endpoint ${ep.path} failed validation`);
    }
    console.log(`PASS: ${ep.method} ${ep.path}`);
  }

  // 3. Test documentation backing validation argument (?verifyDocBacking=true)
  console.log('Testing doc backing validation argument (?verifyDocBacking=true)...');
  const docCheckEndpoints = [
    '/api/auth/user?verifyDocBacking=true',
    '/api/workspaces?verifyDocBacking=true',
    '/api/v1/sessions?verifyDocBacking=true',
    '/api/treg/tools?verifyDocBacking=true',
    '/api/treg/calls?verifyDocBacking=true',
  ];

  for (const path of docCheckEndpoints) {
    const res = await fetch(`${baseUrl}${path}`);
    if (!res.ok) throw new Error(`Doc check endpoint ${path} returned ${res.status}`);
    const json = await res.json();
    if (!json._meta || json._meta.docBacked !== true) {
      throw new Error(`Endpoint ${path} did not return _meta.docBacked envelope`);
    }
    if (json._meta.verified !== true) {
      throw new Error(`Endpoint ${path} failed doc verification: ${json._meta.docPath}`);
    }
    console.log(`PASS: ${path} verified against ${json._meta.docPath} (${json._meta.specSection})`);
  }

  // 4. Test dynamic POST /api/v1/rank
  console.log('Testing dynamic POST /api/v1/rank...');
  const rankRes = await fetch(`${baseUrl}/api/v1/rank`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workspaceId: 'ws_rank_01',
      query: 'What is the latency of BAAI reranker on Nebius AI Studio?',
      candidates: [
        { id: 'c1', text: 'Nebius AI Studio hosts BAAI reranker with sub-15ms latency.' },
        { id: 'c2', text: 'Unrelated text about weather in Honolulu.' },
      ],
    }),
  });
  if (!rankRes.ok) throw new Error(`POST /api/v1/rank returned ${rankRes.status}`);
  const rankData = await rankRes.json();
  if (!rankData.sessionId || rankData.results.length !== 2) {
    throw new Error('Invalid rank inference response shape');
  }
  if (rankData.results[0].id !== 'c1') {
    throw new Error('Ranking heuristic failed: expected c1 to rank 1');
  }
  console.log(`PASS: POST /api/v1/rank returned session ${rankData.sessionId}`);

  // 5. Test POST /api/treg/call tool execution
  console.log('Testing POST /api/treg/call tool execution...');
  const initialCallCount = mockStore.tregCalls.length;
  const tregRes = await fetch(`${baseUrl}/api/treg/call`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      owner: 'user_test_42',
      endpoint: 'spyfu.google.domain.competitors',
      params: { domain: 'listeningkit.com' },
      maxCostUsd: 0.01,
    }),
  });
  if (!tregRes.ok) throw new Error(`POST /api/treg/call returned ${tregRes.status}`);
  const tregExecData = await tregRes.json();
  if (!tregExecData.callId || !tregExecData.result || tregExecData.costMicro !== 200) {
    throw new Error('Invalid Treg tool execution response');
  }
  if (mockStore.tregCalls.length !== initialCallCount + 1) {
    throw new Error('Treg call receipt was not recorded in mockStore');
  }
  console.log(`PASS: POST /api/treg/call executed ${tregExecData.endpoint} (callId: ${tregExecData.callId}, cost: ${tregExecData.costMicro} micro-usd)`);

  // 6. Test ConvexMockClient interface with verifyDocBacking
  console.log('Testing ConvexMockClient interface with verifyDocBacking: true...');
  const queryResult = await mockClient.query('treg:listTools', { verifyDocBacking: true });
  if (!queryResult._meta || queryResult._meta.verified !== true || !Array.isArray(queryResult.data)) {
    throw new Error('mockClient.query with verifyDocBacking failed');
  }
  console.log(`PASS: mockClient.query treg:listTools verified against ${queryResult._meta.docPath}`);

  const actionResult = await mockClient.action('treg:callTool', {
    owner: 'user_agent_turn',
    endpoint: 'brave.web.search',
    params: { query: 'Nebius cross-encoder ranking' },
    maxCostUsd: 0.05,
  });
  if (!actionResult || !actionResult.callId || actionResult.costMicro !== 800) {
    throw new Error('mockClient.action treg:callTool failed');
  }
  console.log(`PASS: mockClient.action treg:callTool returned callId ${actionResult.callId}`);

  // Close server cleanly
  await new Promise((resolve) => server.close(resolve));
  console.log('All mock route, doc backing, and Treg verification tests completed successfully.');
}

main().catch((err) => {
  console.error('FAILED:', err);
  process.exit(1);
});
