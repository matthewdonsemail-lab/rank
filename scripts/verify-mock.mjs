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
  const brand = mockStore.getBrand();

  if (!brand || brand.id !== 'brand-default') throw new Error('Brand record missing from mockStore');
  if (!brand.identity.name) throw new Error('Brand missing identity.name');
  if (brand.offerings.length === 0) throw new Error('Brand missing offerings');
  if (brand.sources.length === 0) throw new Error('Brand missing sources');
  if (!brand.channels.reddit) throw new Error('Brand missing reddit channel profile');

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
   const outboundDomain = mockStore.outboundDomains[0];
   const outboundInbox = mockStore.outboundInboxes[0];
   const outboundCampaign = mockStore.outboundCampaigns[0];
   const outboundThread = mockStore.outboundThreads[0];
   if (!outboundDomain || outboundDomain.owner !== 'usr_rank_01') throw new Error('Outbound domain missing owner');
   if (!outboundInbox || outboundInbox.owner !== outboundDomain.owner) throw new Error('Outbound inbox owner mismatch');
   if (!outboundCampaign || outboundCampaign.owner !== 'usr_rank_01') throw new Error('Outbound campaign missing owner');
   if (!outboundThread || outboundThread.campaignId !== outboundCampaign.id) throw new Error('Outbound thread campaign mismatch');
   if (!outboundThread.context.agentMailInboxId || !outboundThread.context.agentThreadId) {
     throw new Error('Outbound thread is missing provider links');
   }

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
     { method: 'GET', path: '/api/outbound/contact-resolutions?owner=usr_rank_01', validate: (d) => Array.isArray(d) && d.length >= 2 },
     { method: 'GET', path: '/api/outbound/domains?owner=usr_rank_01', validate: (d) => Array.isArray(d) && d.length >= 3 },
     { method: 'GET', path: '/api/outbound/inboxes?owner=usr_rank_01', validate: (d) => Array.isArray(d) && d.length >= 3 },
     { method: 'GET', path: '/api/outbound/campaigns?owner=usr_rank_01', validate: (d) => Array.isArray(d) && d.length >= 2 },
     { method: 'GET', path: '/api/outbound/threads?owner=usr_rank_01', validate: (d) => Array.isArray(d) && d.length >= 2 },
     { method: 'GET', path: '/api/outbound/pool?owner=usr_rank_01', validate: (d) => d.domains.length >= 2 && d.inboxes.length >= 2 },
     { method: 'GET', path: '/api/outbound/pool/select?owner=usr_rank_01', validate: (d) => d.inbox && d.inbox.address.includes('@') },
     { method: 'GET', path: '/api/treg/tools', validate: (d) => Array.isArray(d) && d.length >= 4 },
    { method: 'GET', path: '/api/treg/calls', validate: (d) => Array.isArray(d) && d.length >= 2 },
    { method: 'GET', path: '/api/brand', validate: (d) => d.brand && d.brand.id === 'brand-default' && d.brand.offerings.length >= 2 },
    { method: 'GET', path: '/api/brand/sources', validate: (d) => Array.isArray(d.sources) && d.sources.length >= 2 },
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
    '/api/brand?verifyDocBacking=true',
     '/api/brand/sources?verifyDocBacking=true',
     '/api/outbound/contact-resolutions?verifyDocBacking=true',
     '/api/outbound/domains?verifyDocBacking=true',
     '/api/outbound/inboxes?verifyDocBacking=true',
     '/api/outbound/campaigns?verifyDocBacking=true',
     '/api/outbound/threads?verifyDocBacking=true',
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

  // 7. Test Brand Dynamic Endpoints, Compiler & MockClient
  console.log('Testing Brand Dynamic Endpoints, Compiler & MockClient...');
  const { buildBrandSystemPrompt, simulateOutbound, retrieveSourceRefs, PROMPT_VERSION } = await import('../lib/brand/index.ts');

  // Test PUT /api/brand
  const putBrandRes = await fetch(`${baseUrl}/api/brand`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identity: { tagline: 'Updated low-latency ranking tagline' },
    }),
  });
  if (!putBrandRes.ok) throw new Error(`PUT /api/brand returned ${putBrandRes.status}`);
  const putBrandData = await putBrandRes.json();
  if (putBrandData.brand.identity.tagline !== 'Updated low-latency ranking tagline') {
    throw new Error('PUT /api/brand failed to merge tagline');
  }
  console.log('PASS: PUT /api/brand updated brand tagline');

  // Test POST /api/brand/intelligence
  const intelRes = await fetch(`${baseUrl}/api/brand/intelligence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      competitors: ['nebius.com', 'cohere.com'],
      selectedKeyword: 'cross-encoder reranking on nebius',
    }),
  });
  if (!intelRes.ok) throw new Error(`POST /api/brand/intelligence returned ${intelRes.status}`);
  const intelData = await intelRes.json();
  if (!intelData.brand.intelligence.competitors.includes('nebius.com')) {
    throw new Error('POST /api/brand/intelligence failed to append competitor');
  }
  console.log('PASS: POST /api/brand/intelligence appended competitor');

  // Test POST /api/brand/index
  const indexRes = await fetch(`${baseUrl}/api/brand/index`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      urls: ['https://listeningkit.com/benchmarks'],
    }),
  });
  if (!indexRes.ok) throw new Error(`POST /api/brand/index returned ${indexRes.status}`);
  const indexData = await indexRes.json();
  if (!indexData.sources.some((s) => s.url === 'https://listeningkit.com/benchmarks')) {
    throw new Error('POST /api/brand/index failed to register pending URL');
  }
  console.log('PASS: POST /api/brand/index indexed URL candidate');

  // Test DELETE /api/brand/sources
  const delSourceRes = await fetch(`${baseUrl}/api/brand/sources`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: 'https://listeningkit.com/benchmarks',
    }),
  });
  if (!delSourceRes.ok) throw new Error(`DELETE /api/brand/sources returned ${delSourceRes.status}`);
  const delSourceData = await delSourceRes.json();
  if (delSourceData.sources.some((s) => s.url === 'https://listeningkit.com/benchmarks')) {
    throw new Error('DELETE /api/brand/sources failed to remove URL');
  }
  console.log('PASS: DELETE /api/brand/sources removed URL');

  // Test Brand System Prompt Compiler
  const currentBrand = mockStore.getBrand();
  const compiledPrompt = buildBrandSystemPrompt(currentBrand);
  if (!compiledPrompt.includes('Voice: Friendly, plain-spoken local pro') || !compiledPrompt.includes('Services you can mention:')) {
    throw new Error('Brand compiler buildBrandSystemPrompt failed');
  }
  console.log(`PASS: buildBrandSystemPrompt generated deterministic prompt (version ${PROMPT_VERSION})`);

  // Test simulateOutbound
  const simulated = simulateOutbound(currentBrand, 'reddit', 'can anyone help with boiler install?');
  if (!simulated || !simulated.text) {
    throw new Error('simulateOutbound returned empty reply');
  }
  console.log(`PASS: simulateOutbound generated reply on reddit: "${simulated.text.slice(0, 60)}..."`);

  // Test retrieveSourceRefs
  const refs = retrieveSourceRefs(currentBrand, 'cross-encoder scoring latency');
  if (refs.length === 0) {
    throw new Error('retrieveSourceRefs returned empty matches');
  }
  console.log(`PASS: retrieveSourceRefs retrieved ${refs.length} passage citation(s)`);

  // Test MockClient brand methods
  const clientBrandRes = await mockClient.query('brand:get', { verifyDocBacking: true });
  if (!clientBrandRes._meta || clientBrandRes._meta.verified !== true || !clientBrandRes.data?.id) {
    throw new Error('mockClient.query brand:get with verifyDocBacking failed');
  }
  console.log(`PASS: mockClient.query brand:get verified against ${clientBrandRes._meta.docPath}`);

   // 8. Test outbound state, domain pool, and idempotent delivery reservation
   console.log('Testing outbound state and domain pool routes...');
   const campaignRes = await fetch(`${baseUrl}/api/outbound/campaigns`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ owner: 'usr_rank_01', name: 'Verification campaign', dailySendLimit: 5 }),
   });
   if (!campaignRes.ok) throw new Error(`POST /api/outbound/campaigns returned ${campaignRes.status}`);
   const campaignData = await campaignRes.json();
   if (campaignData.campaign.goal !== 'guest_post') throw new Error('Outbound campaign goal mismatch');

   const provisionRes = await fetch(`${baseUrl}/api/outbound/inboxes/provision`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ owner: 'usr_rank_01', domain: 'outreach.rank.dev', userName: 'Avery Stone', additionalPrefixes: ['jordan'] }),
   });
   if (!provisionRes.ok) throw new Error(`POST /api/outbound/inboxes/provision returned ${provisionRes.status}`);
   const provisionData = await provisionRes.json();
   if (!provisionData.inboxes.some((inbox) => inbox.address === 'avery-stone@outreach.rank.dev')) {
     throw new Error('User-name inbox prefix was not normalized');
   }

   const inboxRes = await fetch(`${baseUrl}/api/outbound/inboxes`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ owner: 'usr_rank_01', domain: 'outreach.rank.dev', localPart: 'verification' }),
   });
   if (!inboxRes.ok) throw new Error(`POST /api/outbound/inboxes returned ${inboxRes.status}`);
   const inboxData = await inboxRes.json();
   if (inboxData.inbox.address !== 'verification@outreach.rank.dev') {
     throw new Error('User-prefixed outbound inbox address mismatch');
   }

   const threadRes = await fetch(`${baseUrl}/api/outbound/threads`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       owner: 'usr_rank_01',
       campaignId: campaignData.campaign.id,
       prospect: {
         name: 'Verification Editor',
         email: 'editor@example.com',
         url: 'https://example.com',
         publication: 'Example Journal',
         fitRationale: 'Verification fixture',
       },
       brand: {
         name: 'Rank',
         voice: 'direct',
         guestPostAngle: 'A useful guide',
       },
     }),
   });
   if (!threadRes.ok) throw new Error(`POST /api/outbound/threads returned ${threadRes.status}`);
   const threadData = await threadRes.json();
   if (threadData.thread.state !== 'drafting') throw new Error('Outbound thread did not start in drafting');

   const assignInboxRes = await fetch(`${baseUrl}/api/outbound/threads/${threadData.thread.id}/assign-inbox`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ owner: 'usr_rank_01' }),
   });
   if (!assignInboxRes.ok) throw new Error(`POST outbound assign-inbox returned ${assignInboxRes.status}`);
   const assignInboxData = await assignInboxRes.json();
   if (!assignInboxData.thread.context.agentMailInboxId) throw new Error('Shared inbox was not assigned to outbound state');

   const contactRes = await fetch(`${baseUrl}/api/outbound/contact-resolutions`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       owner: 'usr_rank_01',
       outboundThreadId: threadData.thread.id,
       domain: 'example.com',
       candidateEmail: 'editor@example.com',
       contactName: 'Verification Editor',
       publicationUrl: 'https://example.com/about',
     }),
   });
   if (!contactRes.ok) throw new Error(`POST /api/outbound/contact-resolutions returned ${contactRes.status}`);
   const contactData = await contactRes.json();
   if (contactData.resolution.state !== 'idle') throw new Error('Contact resolution did not start idle');
   const contactEventRes = await fetch(`${baseUrl}/api/outbound/contact-resolutions/${contactData.resolution.id}/events`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ owner: 'usr_rank_01', event: { type: 'START', at: Date.now() } }),
   });
   if (!contactEventRes.ok) throw new Error(`POST contact resolution event returned ${contactEventRes.status}`);
   const contactEventData = await contactEventRes.json();
   if (contactEventData.resolution.state !== 'checking_domain') throw new Error('Contact resolution state did not persist');

   const eventRes = await fetch(`${baseUrl}/api/outbound/threads/${threadData.thread.id}/events`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       owner: 'usr_rank_01',
       event: {
         type: 'DRAFT_READY',
         at: Date.now(),
         draft: { subject: 'Verification pitch', text: 'Hello editor', labels: [] },
       },
     }),
   });
   if (!eventRes.ok) throw new Error(`POST outbound event returned ${eventRes.status}`);
   const eventData = await eventRes.json();
   if (eventData.thread.state !== 'review_required') throw new Error('Outbound event did not persist state');

   const deliveryBody = {
     owner: 'usr_rank_01',
     threadId: threadData.thread.id,
     idempotencyKey: 'verification_delivery_01',
     provider: 'agentmail',
   };
   const deliveryRes = await fetch(`${baseUrl}/api/outbound/deliveries`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(deliveryBody),
   });
   if (!deliveryRes.ok) throw new Error(`POST /api/outbound/deliveries returned ${deliveryRes.status}`);
   const duplicateRes = await fetch(`${baseUrl}/api/outbound/deliveries`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(deliveryBody),
   });
   const duplicateData = await duplicateRes.json();
   if (!duplicateData.duplicate) throw new Error('Outbound delivery idempotency check failed');

   const analysisRes = await fetch(`${baseUrl}/api/outbound/agent/analyze`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       brand: { name: 'Rank', voice: 'direct', guestPostAngle: 'A practical guide' },
       prospect: { name: 'Verification Editor', email: 'editor@example.com', url: 'https://example.com', publication: 'Example Journal', fitRationale: 'Strong fit' },
       replyText: 'Could you send an outline?',
       confidence: 0.8,
       dealLikelihood: 0.5,
     }),
   });
   if (!analysisRes.ok) throw new Error(`POST /api/outbound/agent/analyze returned ${analysisRes.status}`);
   const analysisData = await analysisRes.json();
   if (analysisData.analysis.intent !== 'question' || !analysisData.threadId) {
     throw new Error('Mock Agent analysis did not return an intent and thread');
   }

   const provisionProviderRes = await fetch(`${baseUrl}/api/outbound/agentmail/provision-inbox`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ owner: 'usr_rank_01', localPart: 'provider', domain: 'outreach.rank.dev' }),
   });
   if (!provisionProviderRes.ok) throw new Error(`POST AgentMail provision-inbox returned ${provisionProviderRes.status}`);
   const provisionProviderData = await provisionProviderRes.json();
   if (!provisionProviderData.inbox.agentMailInboxId) throw new Error('Mock AgentMail provider inbox ID missing');

   const draftRes = await fetch(`${baseUrl}/api/outbound/agentmail/draft`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ to: 'editor@example.com', brandVoice: 'Avery', guestPostAngle: 'A practical guide' }),
   });
   if (!draftRes.ok) throw new Error(`POST /api/outbound/agentmail/draft returned ${draftRes.status}`);
   const draftData = await draftRes.json();
   if (!draftData.draft.subject || !draftData.draft.labels.includes('guest-post')) {
     throw new Error('Mock AgentMail draft shape mismatch');
   }
   console.log('PASS: outbound state, provider split, prefixed inbox, and delivery idempotency routes');

   // Close server cleanly
  await new Promise((resolve) => server.close(resolve));
  console.log('All mock route, doc backing, Treg, and Brand verification tests completed successfully.');
}

main().catch((err) => {
  console.error('FAILED:', err);
  process.exit(1);
});
