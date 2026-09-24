import http from 'node:http';

async function main() {
  console.log('Testing Mock Architecture & API Routes...');

  // Dynamically import compiled/stripped mock server and client
  const { createMockServer } = await import('../mock/server.ts');
  const { mockClient } = await import('../mock/client.ts');
  const { mockStore } = await import('../mock/store.ts');

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

  console.log('Referential integrity checks passed across all 12 relational models.');

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

  // 3. Test POST /api/v1/rank dynamic inference
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
  // c1 should rank higher than c2 because of token matches
  if (rankData.results[0].id !== 'c1') {
    throw new Error('Ranking heuristic failed: expected c1 to rank 1');
  }
  console.log(`PASS: POST /api/v1/rank returned session ${rankData.sessionId} (rank 1: ${rankData.results[0].id} score: ${rankData.results[0].score})`);

  // 4. Test Mock Client bridge
  console.log('Testing ConvexMockClient interface...');
  const queryResult = await mockClient.query('rankSessions:list', { workspaceId: 'ws_rank_01' });
  if (!Array.isArray(queryResult) || queryResult.length === 0) {
    throw new Error('mockClient.query failed');
  }
  console.log('PASS: mockClient.query rankSessions:list');

  const actionResult = await mockClient.action('agent:runTurn', {
    threadId: 'ath_rank_01',
    prompt: 'Summarize candidate rankings',
  });
  if (!actionResult || !actionResult.content) {
    throw new Error('mockClient.action failed');
  }
  console.log('PASS: mockClient.action agent:runTurn');

  // Close server cleanly
  await new Promise((resolve) => server.close(resolve));
  console.log('All mock route and store verification tests completed successfully.');
}

main().catch((err) => {
  console.error('FAILED:', err);
  process.exit(1);
});
