"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookHeart,
  LogOut,
  ArrowRight,
  Loader2,
  MessageCircle,
} from "lucide-react";

export default function BookIntroPage() {
  const { isAuthenticated, logout, isLoading: authIsLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, authIsLoading, router]);

  if (authIsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-fit bg-background">
      <header className="flex items-center justify-between p-4 border-b bg-card shadow-sm sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <BookHeart className="h-10 w-10 text-primary" />
          <h1 className="text-2xl font-semibold text-primary">
            {process.env.NEXT_PUBLIC_APP_NAME || "아이북"}
          </h1>
        </div>
        <Button variant="ghost" size="icon" onClick={logout} title="로그아웃">
          <LogOut className="h-7 w-7 text-muted-foreground" />
        </Button>
      </header>

      <main className="flex flex-grow flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Image
                src="/assets/books.png"
                alt="도서"
                width={600}
                height={400}
                className="rounded-lg object-cover shadow-md"
                data-ai-hint="reading children"
              />
            </div>
            <CardTitle className="text-3xl md:text-4xl font-bold text-primary break-keep">
              {process.env.NEXT_PUBLIC_APP_NAME || "아이북"}에 오신 것을
              환영합니다!
            </CardTitle>
            <div className="h-[8px]" />
            <CardDescription className="text-[12px] md:text-xl text-muted-foreground mt-4 break-keep">
              AI가 우리 아이의 연령, 관심사, 독서 수준에 꼭 맞는 책을 추천해
              드립니다. 간단한 대화를 통해 맞춤형 책을 찾아보세요!
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            <p className="text-center text-[12px] text-foreground px-4 mt-2">
              우리 아이 독서 습관, 아이북과 함께 즐겁게 시작해요! AI 친구와
              대화하며 아이에게 딱 맞는 책을 발견하는 재미를 느껴보세요.
            </p>
            <Button
              size="lg"
              className="w-full max-w-xs text-lg"
              onClick={() => router.push("/chat")}
            >
              <MessageCircle className="mr-2 h-6 w-6" />
              AI 책 추천받기
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center mt-2">
            <p className="text-[12px] text-center text-muted-foreground">
              추천된 책은 AI에 의해 생성되며, 실제 도서 정보와 다를 수 있습니다.
            </p>
          </CardFooter>
        </Card>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground border-t bg-card">
        &copy; {new Date().getFullYear()}{" "}
        {process.env.NEXT_PUBLIC_APP_NAME || "아이북"}. All rights reserved.
      </footer>
    </div>
  );
}
