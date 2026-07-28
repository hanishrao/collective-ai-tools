/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */
import { http, HttpResponse } from 'msw';
import {
  mockAITools,
  mockCategories,
  mockLanguages,
  mockMCPServers,
  mockPricingTiers,
  mockPrompts,
  mockSkills,
  mockTrendingRepos,
  mockUser,
} from './data';

const pagination = (total: number) => ({
  total,
  page: 1,
  limit: 20,
  totalPages: 1,
});

export const handlers = [
  http.get('/api/filters', () =>
    HttpResponse.json({
      categories: mockCategories,
      languages: mockLanguages,
      pricing: mockPricingTiers,
    })
  ),

  http.get('/api/stats', () =>
    HttpResponse.json({
      aiTools: mockAITools.length,
      mcpServers: mockMCPServers.length,
      mcpClients: 0,
    })
  ),

  http.get('/api/ai-tools', () =>
    HttpResponse.json({
      data: mockAITools,
      pagination: pagination(mockAITools.length),
    })
  ),

  http.get('/api/mcp', () =>
    HttpResponse.json({
      data: mockMCPServers,
      pagination: pagination(mockMCPServers.length),
    })
  ),

  http.get('/api/prompts', () =>
    HttpResponse.json({
      prompts: mockPrompts,
      total: mockPrompts.length,
      totalPages: 1,
      currentPage: 1,
    })
  ),

  http.get('/api/skills', () => HttpResponse.json({ data: mockSkills })),

  http.get('/api/trending-repos', () =>
    HttpResponse.json({ data: mockTrendingRepos })
  ),

  // Auth — mocked as "always succeeds" so contributors can exercise logged-in
  // UI states without a real account. Not meant to simulate real validation.
  http.post('/api/auth/login', () => HttpResponse.json({ user: mockUser })),
  http.post('/api/auth/register', () =>
    HttpResponse.json({ user: mockUser }, { status: 201 })
  ),
  http.get('/api/auth/me', () => HttpResponse.json({ user: mockUser })),
  http.post('/api/auth/logout', () =>
    HttpResponse.json({ message: 'Logged out' })
  ),

  // Submissions — accepts anything, echoes back a fake pending submission.
  http.post('/api/submissions', async ({ request }) => {
    const body = (await request.json()) as { type?: string; data?: unknown };
    return HttpResponse.json(
      {
        message: 'Submission received successfully',
        submission: {
          _id: 'mock-submission-1',
          type: body.type,
          data: body.data,
          status: 'pending',
        },
      },
      { status: 201 }
    );
  }),
];
