"use client";

import {
  recommendBook,
  type RecommendBookInput,
  type RecommendBookOutput,
} from "@/ai/flows/recommend-book";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/auth-context";
import {
  ArrowLeft,
  BookHeart,
  Loader2,
  LogOut,
  Send,
  Info,
  CornerDownLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useRef, useEffect, useCallback } from "react";
import type { Message } from "@/components/chat/chat-message";
import { ChatMessage } from "@/components/chat/chat-message";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

type ConversationStep =
  | "idle"
  | "awaitingAge"
  | "awaitingInterests"
  | "awaitingReadingLevel"
  | "awaitingPreviousBooks"
  | "submitting";

const initialBotMessage = (step: ConversationStep, name?: string): string => {
  switch (step) {
    case "awaitingAge":
      return `안녕하세요${
        name ? ` ${name}님` : ""
      }! 아이북에 오신 것을 환영합니다. 우리 아이에게 딱 맞는 책을 찾아드릴게요. 먼저 아이의 나이를 알려주시겠어요? (예: 7)`;
    case "awaitingInterests":
      return "관심사가 있다면 알려주세요. (예: 공룡, 우주, 공주)";
    case "awaitingReadingLevel":
      return "읽기 수준은 어느 정도인가요? (예: 그림 위주, 글씨 조금, 글씨 많음)";
    case "awaitingPreviousBooks":
      return "혹시 이전에 재미있게 읽었던 책이 있나요? 있다면 알려주세요. 없다면 '없음'이라고 입력해주세요.";
    default:
      return "무엇을 도와드릴까요? '새로운 추천'이라고 입력하시면 추천을 시작할 수 있습니다.";
  }
};

export default function ChatPage() {
  const { isAuthenticated, logout, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [currentStep, setCurrentStep] =
    useState<ConversationStep>("awaitingAge");
  const [formData, setFormData] = useState<Partial<RecommendBookInput>>({});

  const [isAlertOpen, setIsAlertOpen] = useState(true);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const didInit = useRef(false);

  const addMessage = useCallback(
    (
      sender: Message["sender"],
      text?: string,
      recommendation?: RecommendBookOutput,
      isLoading?: boolean
    ) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + Math.random(),
          sender,
          text,
          recommendation,
          isLoading,
          timestamp: new Date(),
        },
      ]);
    },
    []
  );

  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, authIsLoading, router]);

  useEffect(() => {
    // Start conversation
    if (!didInit.current && messages.length === 0 && isAuthenticated) {
      addMessage("bot", initialBotMessage("awaitingAge"));
      setCurrentStep("awaitingAge");
      didInit.current = true;
    }
  }, [messages.length, isAuthenticated, addMessage]);

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    );

    if (viewport) {
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior: "smooth",
      });
    }

    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages]);

  const processUserInput = useCallback(
    async (userInput: string) => {
      // FastAPI special command
      if (userInput.startsWith("@fastapi ")) {
        try {
          setIsSending(true);
          const loadingMsgId = Date.now().toString() + Math.random();
          setMessages((prev) => [
            ...prev,
            {
              id: loadingMsgId,
              sender: "bot",
              isLoading: true,
              timestamp: new Date(),
            },
          ]);

          const response = await fetch("http://localhost:8080/recommend", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_input: userInput.replace("@fastapi ", "") }),
          });

          if (!response.ok) {
            throw new Error(`FastAPI 호출 실패: ${response.statusText}`);
          }

          const result = await response.json();

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === loadingMsgId
                ? {
                    ...msg,
                    isLoading: false,
                    text: `📚 추천 도서: ${result.bookTitle}\n✍️ 작가: ${result.author}\n💡 이유: ${result.reason}`,
                    timestamp: new Date(),
                  }
                : msg
            )
          );
        } catch (error) {
          console.error("FastAPI 호출 중 오류 발생:", error);
          const errorText =
            error instanceof Error ? error.message : "FastAPI 호출 실패";
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === loadingMsgId
                ? {
                    ...msg,
                    isLoading: false,
                    text: `❌ 오류: ${errorText}`,
                    timestamp: new Date(),
                  }
                : msg
            )
          );
        } finally {
          setIsSending(false);
        }
        return;
      }

      addMessage("user", userInput);
      setInputValue("");

      let nextStep = currentStep;
      const newFormData = { ...formData };

      if (
        userInput.toLowerCase() === "새로운 추천" ||
        userInput.toLowerCase() === "새로운추천"
      ) {
        addMessage("bot", initialBotMessage("awaitingAge"));
        setCurrentStep("awaitingAge");
        setFormData({});
        return;
      }

      switch (currentStep) {
        case "awaitingAge":
          const age = parseInt(userInput);
          if (isNaN(age) || age <= 0 || age > 18) {
            addMessage("bot", "올바른 나이를 숫자로 입력해주세요. (예: 7)");
          } else {
            newFormData.age = age;
            nextStep = "awaitingInterests";
            addMessage("bot", initialBotMessage(nextStep));
          }
          break;
        case "awaitingInterests":
          newFormData.interests = userInput;
          nextStep = "awaitingReadingLevel";
          addMessage("bot", initialBotMessage(nextStep));
          break;
        case "awaitingReadingLevel":
          newFormData.readingLevel = userInput;
          nextStep = "awaitingPreviousBooks";
          addMessage("bot", initialBotMessage(nextStep));
          break;
        case "awaitingPreviousBooks":
          if (userInput.toLowerCase() !== "없음") {
            newFormData.previousBooks = userInput;
          }
          nextStep = "submitting";
          break;
        case "idle":
          addMessage(
            "bot",
            "추천을 받으시려면 '새로운 추천'이라고 입력해주세요."
          );
          break;
      }

      setFormData(newFormData);
      setCurrentStep(nextStep);

      if (nextStep === "submitting") {
        setIsSending(true);
        const loadingMsgId = Date.now().toString() + Math.random();
        setMessages((prev) => [
          ...prev,
          {
            id: loadingMsgId,
            sender: "bot",
            isLoading: true,
            timestamp: new Date(),
          },
        ]);

        try {
          if (
            !newFormData.age ||
            !newFormData.interests ||
            !newFormData.readingLevel
          ) {
            throw new Error("필수 정보가 누락되었습니다.");
          }
          const recommendation = await recommendBook({
            age: newFormData.age,
            interests: newFormData.interests,
            readingLevel: newFormData.readingLevel,
            previousBooks: newFormData.previousBooks,
          });

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === loadingMsgId
                ? {
                    ...msg,
                    isLoading: false,
                    recommendation,
                    timestamp: new Date(),
                  }
                : msg
            )
          );
          addMessage(
            "bot",
            "다른 책을 추천받고 싶으시면 '새로운 추천'이라고 입력해주세요."
          );
          setCurrentStep("idle");
          setFormData({});
        } catch (error) {
          console.error("Error getting recommendation:", error);
          const errorText =
            error instanceof Error
              ? error.message
              : "추천을 받는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === loadingMsgId
                ? {
                    ...msg,
                    isLoading: false,
                    text: `오류: ${errorText}`,
                    timestamp: new Date(),
                  }
                : msg
            )
          );
          toast({
            title: "추천 오류",
            description: errorText,
            variant: "destructive",
          });
          addMessage(
            "bot",
            "죄송합니다. 추천 중 문제가 발생했어요. '새로운 추천'으로 다시 시도해주세요."
          );
          setCurrentStep("idle");
          setFormData({});
        } finally {
          setIsSending(false);
        }
      }
    },
    [currentStep, formData, addMessage, toast]
  );

  const handleSend = () => {
    if (inputValue.trim() && !isSending) {
      processUserInput(inputValue.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onCloseAlert = () => {
    setIsAlertOpen(false);
  };

  if (authIsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-background max-w-lg mx-auto border-x border-border/50 shadow-lg">
      <header className="flex items-center justify-between p-3 border-b bg-card shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/login")}
          className="md:hidden"
        >
          <ArrowLeft className="h-7 w-7 text-muted-foreground" />
        </Button>
        <div className="flex items-center space-x-2">
          <BookHeart className="h-10 w-10 text-primary" />
          <h1 className="text-2xl font-semibold text-primary">
            {process.env.NEXT_PUBLIC_APP_NAME || "아이북"}
          </h1>
        </div>
        <Button variant="ghost" size="icon" onClick={logout} title="로그아웃">
          <LogOut className="h-6 w-6 text-muted-foreground" />
        </Button>
      </header>

      <ScrollArea className="flex-grow px-4" ref={scrollAreaRef}>
        {isAlertOpen && (
          <div className="px-3">
            <Alert
              variant="default"
              onClick={onCloseAlert}
              className="mt-3 rounded-lg border-accent bg-accent/10 shadow-md"
            >
              <Info className="h-6 w-6" />
              <AlertTitle className="font-semibold text-foreground/70 text-lg mt-[-4px]">
                사용방법
              </AlertTitle>
              <AlertDescription className="text-accent-foreground text-base">
                AI가 아이의 연령, 관심사, 독서 수준에 맞는 책을 추천해 드립니다.
                대화를 시작해보세요!
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className="space-y-0">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
        </div>
      </ScrollArea>

      <footer className="p-3 border-t bg-card">
        <div className="flex items-center space-x-2">
          <Input
            ref={inputRef}
            type="text"
            placeholder={
              isSending ? "답변을 기다리는 중..." : "메시지를 입력하세요..."
            }
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSending || currentStep === "submitting"}
            className="flex-grow text-base focus-visible:ring-1 focus-visible:ring-primary"
            aria-label="채팅 메시지 입력"
          />
          <Button
            onClick={handleSend}
            disabled={
              isSending || !inputValue.trim() || currentStep === "submitting"
            }
            size="icon"
            className="shrink-0"
            aria-label="메시지 전송"
          >
            {isSending ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Send className="h-6 w-6" />
            )}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2 text-center">
          Enter 키로 메시지를 전송할 수 있습니다.{" "}
          <CornerDownLeft className="inline h-3 w-3" />
        </p>
      </footer>
    </div>
  );
}