'use server';
import { RecommendBookInput, RecommendBookOutput } from './types';
'use server';
/**
 * 두 가지 방식의 도서 추천을 제공:
 * - 일반 입력: Genkit 기반 추천
 * - "@fastapi"로 시작하는 입력: FastAPI 서버 호출
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

import fetch from 'node-fetch';

const RecommendBookInputSchema = z.object({
  age: z.number().describe('The age of the child.'),
  interests: z.string().describe('The interests of the child.'),
  readingLevel: z.string().describe('The reading level of the child.'),
  previousBooks: z.string().optional().describe('Previously read books by the child.'),
});
// export type RecommendBookInput = z.infer<typeof RecommendBookInputSchema>;

const RecommendBookOutputSchema = z.object({
  bookTitle: z.string().describe('The title of the recommended book.'),
  author: z.string().describe('The author of the recommended book.'),
  reason: z.string().describe('Why this book is recommended for the child.'),
});
// export type RecommendBookOutput = z.infer<typeof RecommendBookOutputSchema>;

// ✅ Genkit 기반 Prompt
const prompt = ai.definePrompt({
  name: 'recommendBookPrompt',
  input: { schema: RecommendBookInputSchema },
  output: { schema: RecommendBookOutputSchema },
  prompt: `
너는 아이의 나이, 관심사, 독서 수준에 맞는 한국어 그림책을 추천하는 챗봇이야.

{% if previousBooks %}
아이가 이전에 읽은 책: {{previousBooks}}
{% endif %}

한국어로 다음 정보를 포함해 추천해 줘 (JSON 형식으로):

- title: 책 제목
- author: 저자
- description: 추천 이유 (짧고 간결하게)

아이가 읽기 적합한 책을 못 찾을 경우, 이유를 포함해 한국어로 정중히 안내해줘.

- 나이: {{{age}}}
- 관심사: {{{interests}}}
- 읽기 수준: {{{readingLevel}}}
  `,
});

// ✅ Genkit 기반 흐름
const recommendBookFlow = ai.defineFlow(
  {
    name: 'recommendBookFlow',
    inputSchema: RecommendBookInputSchema,
    outputSchema: RecommendBookOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);

// ✅ FastAPI 호출 함수
export async function callFastAPI(input: RecommendBookInput): Promise<RecommendBookOutput> {
  const response = await fetch("http://localhost:8080/recommend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_input: formatInput(input) }),
  });

  if (!response.ok) {
    throw new Error("FastAPI 호출 실패");
  }

  const data = await response.json();
  const recommended = data.recommendations?.[0];

  if (!recommended) {
    throw new Error("추천 결과가 없습니다.");
  }

  return {
    bookTitle: recommended.title,
    author: recommended.author || "저자 미상",
    reason: `추천 이유: ${recommended.description || "설명 없음"}`,
  };
}

// ✅ 사용자 입력을 하나의 문장으로 구성
function formatInput(input: RecommendBookInput): string {
  const cleanInterests = input.interests.replace(/^@fastapi\s*/, '').trim();
  const cleanReadingLevel = input.readingLevel.replace(/^@fastapi\s*/, '').trim();
  return `${input.age}세 아이에게 ${cleanReadingLevel} 수준으로 읽을 수 있는 ${cleanInterests}에 관한 책을 추천해줘${input.previousBooks ? ` (이전에 읽은 책: ${input.previousBooks})` : ""}`;
}

// ✅ 최종 추천 함수
export async function recommendBook(input: RecommendBookInput): Promise<RecommendBookOutput> {
  if (
    input.interests.trim().startsWith("@fastapi") ||
    input.readingLevel.trim().startsWith("@fastapi")
  ) {
    console.log("📡 FastAPI 호출 분기 실행");
    return callFastAPI(input);
  }

  return recommendBookFlow(input);
}
