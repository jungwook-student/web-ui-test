//recommend-book.ts
'use server';
/**
 * @fileOverview Recommends books for children based on their age, interests, and reading level.
 *
 * - recommendBook - A function that recommends books.
 * - RecommendBookInput - The input type for the recommendBook function.
 * - RecommendBookOutput - The return type for the recommendBook function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendBookInputSchema = z.object({
  age: z.number().describe('The age of the child.'),
  interests: z.string().describe('The interests of the child.'),
  readingLevel: z.string().describe('The reading level of the child.'),
  previousBooks: z.string().optional().describe('Previously read books by the child.'),
});
export type RecommendBookInput = z.infer<typeof RecommendBookInputSchema>;

const RecommendBookOutputSchema = z.array(z.object({
  bookTitle: z.string().describe('The title of the recommended book.'),
  author: z.string().describe('The author of the recommended book.'),
  reason: z.string().describe('Why this book is recommended for the child.'),
  imageUrl: z.string().optional().describe('Cover image URL of the recommended book.'),
}));
export type RecommendBookOutput = z.infer<typeof RecommendBookOutputSchema>;

export async function recommendBook(input: RecommendBookInput): Promise<RecommendBookOutput> {
    const query = input.userInput.trim();

    try {
      const response = await fetch("http://127.0.0.1:8080/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_input: query }),
      });

      if (!response.ok) {
        throw new Error(`FastAPI 호출 실패: ${response.status}`);
      }

      const data = await response.json();
      const books = data?.recommendations ?? [];

      if (books.length === 0) {
        throw new Error("추천 결과 없음");
      }

      return books.map((book: any) => ({
        bookTitle: book.title || "제목 없음",
        author: book.author || "저자 미상",
        reason: book.description || "추천 사유 없음",
        imageUrl: book.cover || undefined,
      }));
    } catch (error) {
      console.error("🔥 FastAPI 호출 오류:", error);
      return [{
        bookTitle: "FastAPI 호출 실패",
        author: "-",
        reason: "FastAPI에서 추천 결과를 가져오지 못했습니다.",
        imageUrl: undefined,
      }];
    }
}

