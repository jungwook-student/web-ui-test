import type { RecommendBookOutput, Book } from "@/ai/flows/recommend-book";
import { cn } from "@/lib/utils";
import {
  Bot,
  User,
  Sparkles,
  BookOpen,
  Edit3,
  BookUser,
  ExternalLink,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ScrollArea } from "../ui/scroll-area";

export interface Message {
  id: string;
  sender: "user" | "bot" | "system";
  text?: string;
  recommendation?: RecommendBookOutput;
  isLoading?: boolean;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

const BookCard = ({ book }: { book: Book }) => {
  const PLACEHOLDER_IMG = `https://placehold.co/200x280.png?text=${encodeURIComponent(
    book.title
  )}`;
  const [imgSrc, setImgSrc] = useState(book.cover || PLACEHOLDER_IMG);

  // Google Books API로 이미지 보완
  useEffect(() => {
    if (!book.cover) {
      const fetchImageFromGoogleBooks = async (title: string) => {
        try {
          const res = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(
              title
            )}&langRestrict=ko`
          );
          const data = await res.json();
          const googleImg = data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
          if (googleImg) {
            setImgSrc(googleImg);
          } else {
            setImgSrc(PLACEHOLDER_IMG);
          }
        } catch (e) {
          setImgSrc(PLACEHOLDER_IMG);
        }
      };

      fetchImageFromGoogleBooks(book.title);
    }
  }, [book.title, book.cover]);

  return (
    <div
      className="border border-primary/20 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow p-4"
      style={{
        width: "280px",
        minWidth: "280px",
        maxWidth: "280px",
        flexShrink: 0,
        height: "auto",
      }}
    >
      {/* 헤더 */}
      <div className="flex gap-2 items-start mb-3">
        <BookOpen className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
        <div className="min-w-0 flex-1">
          <h4 className="text-lg text-primary line-clamp-2 leading-tight font-semibold">
            {book.title}
          </h4>
          <p className="text-sm text-muted-foreground mt-1">{book.author}</p>
          {book.publisher && (
            <p className="text-xs text-muted-foreground">{book.publisher}</p>
          )}
        </div>
      </div>

      {/* 이미지 */}
      <div className="mb-3">
        <img
          src={imgSrc}
          alt={book.title}
          className="rounded-md w-full h-48 object-cover"
          loading="lazy"
          onError={() => setImgSrc(PLACEHOLDER_IMG)}
        />
      </div>

      {/* 설명 */}
      <p className="text-sm text-foreground leading-relaxed line-clamp-4 mb-3">
        {book.reason}
      </p>

      {/* 가격 */}
      {book.priceSales && (
        <div className="mb-3">
          <p className="text-lg font-semibold text-primary">
            {book.priceSales.toLocaleString()}원
          </p>
        </div>
      )}

      {/* 버튼 */}
      {book.link && (
        <button
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium transition-colors"
          onClick={() => window.open(book.link, "_blank")}
        >
          <ExternalLink className="h-4 w-4" />
          자세히 보기
        </button>
      )}
    </div>
  );
};

const BookRecommendationSlider = ({
  recommendation,
}: {
  recommendation: RecommendBookOutput;
}) => {
  return (
    <div className="mt-4 relative">
      {/* 제목 */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-6 w-6 text-primary" />
        <h3 className="text-lg font-semibold text-primary">
          추천 도서 ({recommendation.totalCount}권)
        </h3>
      </div>

      {/* 스크롤 컨테이너 */}
      <div
        className="book-scroll-container relative h-[500px]"
        style={{
          overflowX: "auto",
          overflowY: "hidden",
          paddingBottom: "16px",
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div
          className="book-list absolute "
          style={{
            display: "flex",
            gap: "16px",
            width: "max-content",
            minWidth: "100%",
          }}
        >
          {Array.isArray(recommendation) &&
            recommendation.map((book, idx) => (
            <BookCard key={idx} book={book} />
          ))}
        </div>
      </div>

      {/* 안내 메시지 */}
      <div className="text-sm text-muted-foreground mt-2">
        AI가 추천한 도서입니다. 좌우로 스크롤하여 더 많은 책을 확인해보세요.
      </div>
    </div>
  );
};

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === "user";
  const isBot = message.sender === "bot";
  const isSystem = message.sender === "system";

  if (isSystem) {
    return (
      <div className="text-center my-2">
        <p className="text-xs text-muted-foreground italic px-4 py-1 bg-muted rounded-full inline-block">
          {message.text}
        </p>
      </div>
    );
  }

  // 책 추천이 있는 경우 특별한 레이아웃 사용
  if (message.recommendation && !isUser) {
    return (
      <div className="flex my-4 animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out pb-4 justify-start">
        <div className="flex items-end flex-row w-full]">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2 mb-1 shadow-sm">
            <Bot size={22} />
          </div>
          <div className="bg-card max-w-[1400px] rounded-xl rounded-bl-none border shadow-md p-4">
            {message.text && (
              <p className="whitespace-pre-wrap text-base mb-2">
                {message.text}
              </p>
            )}
            <BookRecommendationSlider recommendation={message.recommendation} />
            <p className="text-xs mt-1.5 opacity-70 text-right">
              {message.timestamp.toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex my-4 animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out pb-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex items-end",
          isUser ? "flex-row-reverse max-w-[85%]" : "flex-row max-w-[85%]"
        )}
      >
        {isBot && (
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2 mb-1 shadow-sm">
            <Bot size={22} />
          </div>
        )}
        {isUser && (
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center ml-2 mb-1 shadow-sm">
            <User size={22} />
          </div>
        )}
        <div
          className={cn(
            "p-4 rounded-xl shadow-md",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-none"
              : "bg-card text-card-foreground rounded-bl-none border",
            message.isLoading ? "italic text-muted-foreground" : ""
          )}
        >
          {message.isLoading ? (
            <div className="flex items-center space-x-2 text-base">
              <Sparkles className="h-5 w-5 animate-spin" />
              <span>답변을 생각하고 있어요...</span>
            </div>
          ) : (
            <>
              {message.text && (
                <p className="whitespace-pre-wrap text-base">{message.text}</p>
              )}
            </>
          )}
          {!isUser && !message.isLoading && (
            <p className="text-xs mt-1.5 opacity-70 text-right">
              {message.timestamp.toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
          {isUser && (
            <p className="text-xs mt-1.5 opacity-70 text-right">
              {message.timestamp.toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
