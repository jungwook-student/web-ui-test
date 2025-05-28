import type { RecommendBookOutput } from "@/ai/flows/recommend-book";
import { cn } from "@/lib/utils";
import { Bot, User, Sparkles, BookOpen, Edit3, BookUser } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { useState, useEffect } from "react";

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

const BookRecommendationCard = ({
  recommendation,
}: {
  recommendation: RecommendBookOutput;
}) => {
  const PLACEHOLDER_IMG = `https://placehold.co/300x200.png?text=${encodeURIComponent(
    recommendation.bookTitle
  )}`;
  const [imgSrc, setImgSrc] = useState(PLACEHOLDER_IMG);

  // Google Books API로 이미지 보완
  useEffect(() => {
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

    fetchImageFromGoogleBooks(recommendation.bookTitle);
  }, [recommendation.bookTitle]);

  return (
    <div className="mt-2 bg-card border-primary/50">
      <div className="mb-4">
        <div className="flex gap-2">
          <BookOpen className="h-10 w-10 text-primary" />
          <div>
            <CardTitle className="text-2xl text-primary">
              {recommendation.bookTitle}
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              작가: {recommendation.author}
            </CardDescription>
          </div>
        </div>
      </div>
      <div>
        <img
          src={imgSrc}
          alt={recommendation.bookTitle}
          width={300}
          height={200}
          className="rounded-md w-full object-contain aspect-[3/2] mb-3"
          loading="lazy"
          onError={() => setImgSrc(PLACEHOLDER_IMG)}
        />
        <p className="text-base text-foreground leading-relaxed mt-4">
          {recommendation.reason}
        </p>
      </div>
      <div className="text-sm text-muted-foreground mt-4">
        AI 추천 도서입니다.
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

  return (
    <div
      className={cn(
        "flex my-4 animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out pb-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex items-end max-w-[85%] sm:max-w-[75%]",
          isUser ? "flex-row-reverse" : "flex-row"
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
            "p-4 rounded-xl shadow-md", // Increased padding
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
              {message.recommendation && (
                <BookRecommendationCard
                  recommendation={message.recommendation}
                />
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
