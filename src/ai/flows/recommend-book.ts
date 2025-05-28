'use server';

import { z } from 'genkit';

export const RecommendBookInputSchema = z.object({
  age: z.number(),
  interests: z.string(),
  readingLevel: z.string(),
  previousBooks: z.string().optional(),
});
export type RecommendBookInput = z.infer<typeof RecommendBookInputSchema>;

export const RecommendBookOutputSchema = z.object({
  bookTitle: z.string(),
  author: z.string(),
  reason: z.string(),
});
export type RecommendBookOutput = z.infer<typeof RecommendBookOutputSchema>;

export async function recommendBook(
  input: RecommendBookInput
): Promise<RecommendBookOutput> {
  // FastAPI 요청 처리
  if (
    typeof input.interests === 'string' &&
    input.interests.startsWith('@fastapi ')
  ) {
    try {
      const response = await fetch('http://localhost:8080/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_input: input.interests.replace('@fastapi ', '') }),
      });

      if (!response.ok) {
        throw new Error('FastAPI 서버 응답 오류');
      }

      const result = await response.json();
      const top = result.recommendations?.[0];

      if (!top) throw new Error('추천 결과 없음');

      return {
        bookTitle: top.title || '제목 없음',
        author: top.author || '작자 미상',
        reason: 'FastAPI 모델 기반 추천입니다.',
      };
    } catch (e) {
      return {
        bookTitle: '추천 실패',
        author: '',
        reason: (e as Error).message,
      };
    }
  }

  // 기본 Genkit 흐름
  const { ai } = await import('@/ai/genkit');

  const prompt = ai.definePrompt({
    name: 'recommendBookPrompt',
    input: { schema: RecommendBookInputSchema },
    output: { schema: RecommendBookOutputSchema },
    prompt: `
You are a helpful chatbot that recommends books for children.

{% if previousBooks %}
The child has previously read: {{previousBooks}}
{% endif %}

Recommend a Korean children's book that matches this profile.
Respond ONLY in Korean with:
- title: 책 제목
- author: 저자명
- description: 간단한 설명

Child profile:
- Age: {{{age}}}
- Interests: {{{interests}}}
- Reading Level: {{{readingLevel}}}
    `,
  });

  const recommendBookFlow = ai.defineFlow(
    {
      name: 'recommendBookFlow',
      inputSchema: RecommendBookInputSchema,
      outputSchema: RecommendBookOutputSchema,
    },
    async (input) => {
      const { output } = await prompt(input);
      return output!;
    }
  );

  return recommendBookFlow(input);
}