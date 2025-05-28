//recommend-book.ts
'use server';

import { z } from 'zod';

export const RecommendBookInputSchema = z.object({
  user_input: z.string().describe('사용자의 추천 요청 문장')
});
export type RecommendBookInput = z.infer<typeof RecommendBookInputSchema>;

export const RecommendBookOutputSchema = z.object({
  recommendations: z.array(
    z.object({
      title: z.string(),
      author: z.string().optional(),
      age: z.string().optional(),
      types: z.array(z.string()).optional(),
      theme: z.array(z.string()).optional(),
      description: z.string().optional(),
      link: z.string().optional(),
      cover: z.string().optional()
    })
  )
});
export type RecommendBookOutput = z.infer<typeof RecommendBookOutputSchema>;

export async function recommendBook(
  input: RecommendBookInput
): Promise<RecommendBookOutput> {
  const response = await fetch("http://localhost:8080/recommend", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    throw new Error("FastAPI 호출 실패: " + response.statusText);
  }

  const result = await response.json();
  return result;
}
