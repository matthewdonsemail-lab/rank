# Rank Capabilities for Muse

This document outlines the specific capabilities that Rank by ListeningKit provides when integrated with Meta's Muse AI agent.

## Core Capabilities

### 1. Brand Analysis and Grounding

**What it does:** Analyzes brand websites to extract structured information about identity, offerings, and content.

**Use Cases for Muse:**
- "Analyze my company website and tell me what our brand is known for"
- "Extract the key offerings from [company website]"
- "What content topics does [brand] focus on?"
- "Summarize the brand voice of [company]"

**Muse Workflow:**
1. User provides brand URL
2. Muse calls `/brand/analyze` endpoint
3. Rank crawls the website and extracts structured data
4. Muse receives brand name, tagline, offerings, sources, and voice
5. Muse can use this information for subsequent tasks

**Example Muse Conversation:**
```
User: "Analyze my company website https://acme.com"
Muse: [Calls Rank API] "I've analyzed Acme's website. Here's what I found:
- Brand: Acme Corporation
- Tagline: Building the future of manufacturing
- Key Offerings: Industrial automation, IoT sensors, predictive maintenance
- Brand Voice: Technical but accessible, focused on innovation
- Content Focus: Industry trends, case studies, technical guides"
```

### 2. Competitor Discovery

**What it does:** Finds competitor domains and identifies shared search terms and content themes.

**Use Cases for Muse:**
- "Find competitors for [brand] in the [industry] space"
- "Who are the main competitors writing about [topic]?"
- "Discover websites that cover similar topics to [brand]"
- "Find backlink opportunities in [industry]"

**Muse Workflow:**
1. User provides brand URL or ID
2. Muse calls `/prospects/discover` endpoint
3. Rank identifies competitor domains and shared terms
4. Muse receives list of prospects with authority scores
5. Muse can prioritize based on authority and relevance

**Example Muse Conversation:**
```
User: "Find competitors for my SaaS company"
Muse: [Analyzes brand, then calls discovery] "I found 42 competitors for your SaaS company:
1. competitor1.com (Authority: 85) - Shared topics: API documentation, pricing
2. competitor2.com (Authority: 72) - Shared topics: case studies, integrations
3. competitor3.com (Authority: 68) - Shared topics: tutorials, best practices

[Continues with prioritized list]"
```

### 3. Prospect Evaluation and Ranking

**What it does:** Uses AI (Nebius reranking + TypeSafe evaluation) to rank prospects by relevance and editorial fit.

**Use Cases for Muse:**
- "Which of these prospects are most relevant for guest posting?"
- "Evaluate these 20 websites and tell me which ones to pursue"
- "Rank these prospects by editorial fit for [content topic]"
- "Should I pursue outreach to [specific website]?"

**Muse Workflow:**
1. User provides prospect list or asks for evaluation
2. Muse calls `/prospects/{id}/evaluate` endpoint
3. Rank reads homepages, uses Nebius for reranking, TypeSafe for judgment
4. Muse receives judgment (act/review/drop) with confidence and reasons
5. Muse can filter and prioritize based on evaluation results

**Example Muse Conversation:**
```
User: "Evaluate these prospects for a guest post about AI in manufacturing"
Muse: [Evaluates each prospect] "Here's my evaluation:

ACT (High Confidence):
- industryblog.com (92%): High domain authority, recent AI content, clear editorial fit
- techweekly.com (88%): Strong technical audience, relevant content categories

REVIEW (Medium Confidence):
- manufacturingnews.com (75%): Relevant industry but unclear guest post policy
- automationdigest.com (68%): Good fit but lower authority score

DROP (Low Confidence):
- generallist.com (45%): Too broad, low relevance to manufacturing AI"
```

### 4. Contact Resolution

**What it does:** Finds and validates contact information for prospects (email, phone, social).

**Use Cases for Muse:**
- "Find the contact information for [website]"
- "Who should I contact at [company] for guest posts?"
- "Get the editor's email for [publication]"
- "Verify if this contact email is deliverable"

**Muse Workflow:**
1. User identifies a prospect to contact
2. Muse calls `/outbound/contact` endpoint
3. Rank resolves contact information and validates deliverability
4. Muse receives contact details with deliverability status
5. Muse can proceed with outreach or suggest alternatives

**Example Muse Conversation:**
```
User: "Find the editor contact for TechWeekly"
Muse: [Resolves contact] "I found the following contact for TechWeekly:
- Name: Sarah Johnson
- Role: Editor-in-Chief
- Email: sarah@techweekly.com
- Deliverable: Yes
- Alternative: editor@techweekly.com (backup)

Would you like me to draft an outreach email?"
```

### 5. Outreach Campaign Management

**What it does:** Manages email outreach campaigns including drafting, sending, and tracking responses.

**Use Cases for Muse:**
- "Send a guest post pitch to [contact]"
- "Create an outreach campaign for these prospects"
- "Track the status of my outreach emails"
- "Did [prospect] respond to my email?"

**Muse Workflow:**
1. User provides outreach details
2. Muse calls `/outbound/send` endpoint
3. Rank sends email and tracks campaign status
4. Muse receives campaign ID and status
5. Muse can monitor for replies and analyze sentiment

**Example Muse Conversation:**
```
User: "Send a guest post pitch to Sarah at TechWeekly about AI in manufacturing"
Muse: [Sends outreach] "I've sent the outreach email:
- To: sarah@techweekly.com
- Subject: Guest Post Proposal: AI in Manufacturing
- Template: guest-post-pitch
- Status: Sent
- Campaign ID: outbound_def456

I'll monitor for responses and let you know when they reply."
```

## Advanced Workflows

### Complete Link-Building Campaign

Muse can orchestrate a complete link-building campaign using Rank's capabilities:

```
User: "Help me build backlinks for my SaaS company"
Muse: [Comprehensive workflow]
1. "I'll start by analyzing your brand website..."
   [Analyzes brand, extracts offerings and voice]
2. "Now I'll discover competitors and prospects..."
   [Finds 42 prospects with shared topics]
3. "Let me evaluate which ones are most relevant..."
   [Ranks prospects, identifies 8 high-value targets]
4. "I'll find contact information for the top prospects..."
   [Resolves contacts for 8 prospects]
5. "Finally, I'll send personalized outreach..."
   [Sends 8 targeted emails]
6. "I'll monitor for responses and report back..."
   [Tracks replies, analyzes sentiment]

Result: 8 outreach emails sent, 3 positive responses received"
```

### Content-Based Prospecting

```
User: "Find websites that would be interested in my article about cloud security"
Muse: [Content-focused workflow]
1. "I'll analyze your article to identify key topics..."
   [Extracts: cloud security, compliance, best practices]
2. "Now I'll find prospects covering these topics..."
   [Discovers prospects with relevant content]
3. "I'll evaluate editorial fit for your specific article..."
   [Ranks by content relevance and audience match]
4. "Here are the best prospects for your article..."
   [Provides prioritized list with contact info]
```

### Competitor Backlink Analysis

```
User: "Where are my competitors getting their backlinks?"
Muse: [Competitor analysis workflow]
1. "I'll identify your main competitors..."
   [Discovers competitor domains]
2. "Let me analyze their backlink profiles..."
   [Finds websites linking to competitors]
3. "I'll evaluate which ones you should also target..."
   [Ranks by relevance and authority]
4. "Here are the best backlink opportunities..."
   [Provides prioritized outreach targets]
```

## Integration Benefits for Muse Users

### 1. Data-Driven Decision Making
- AI-powered prospect ranking ensures Muse focuses on high-value targets
- Editorial fit analysis prevents wasted outreach efforts
- Authority scores help prioritize by domain strength

### 2. Automated Workflows
- Complete end-to-end link-building campaigns
- Automated contact resolution and validation
- Response tracking and sentiment analysis

### 3. Time Efficiency
- Reduces manual research time by 80%+
- Automated homepage reading and content analysis
- Bulk prospect evaluation and ranking

### 4. Improved Success Rates
- Higher response rates through better targeting
- Personalized outreach based on brand voice analysis
- Data-driven prospect selection

## Limitations and Considerations

### Rate Limiting
- Standard: 100 requests per 15 minutes per IP
- Premium: 1000 requests per 15 minutes per IP
- Muse should implement proper backoff strategies

### Processing Time
- Brand analysis: 30-60 seconds
- Prospect discovery: 45-90 seconds
- Prospect evaluation: 60-120 seconds per prospect
- Contact resolution: 15-30 seconds per contact

### Data Freshness
- Brand analysis reflects website content at time of analysis
- Competitor data may become stale over time
- Regular re-analysis recommended for active campaigns

### Authentication Requirements
- OAuth 2.0 authentication required for most operations
- API key alternative available for limited operations
- User must have valid Rank account

## Best Practices for Muse Integration

### 1. Progressive Disclosure
- Start with brand analysis before prospect discovery
- Evaluate prospects before attempting contact resolution
- Confirm contact deliverability before sending outreach

### 2. Error Handling
- Handle rate limiting gracefully with exponential backoff
- Provide clear error messages to users
- Retry failed operations with idempotency keys

### 3. User Communication
- Keep users informed of long-running operations
- Provide progress updates for multi-step workflows
- Explain evaluation criteria and confidence scores

### 4. Result Presentation
- Present results in priority order
- Include reasoning for evaluations
- Provide actionable next steps

## Future Capabilities

Planned enhancements that could be exposed to Muse:

1. **Real-time Campaign Monitoring** - WebSocket-based status updates
2. **Advanced Analytics** - Campaign performance metrics and insights
3. **A/B Testing** - Test different outreach templates and strategies
4. **Multi-channel Outreach** - Support for social media and other channels
5. **Content Generation** - AI-powered guest post content creation
6. **Relationship Mapping** - Track long-term relationship development

## Conclusion

Rank provides Muse with a comprehensive link-building and prospect ranking capability that enables sophisticated SEO and outreach workflows. The API is designed to be agent-friendly with idempotent operations, clear error messages, and structured responses that make it easy for Muse to orchestrate complex multi-step campaigns.