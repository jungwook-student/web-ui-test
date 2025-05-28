"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { BookHeart, LogIn } from "lucide-react";
import Image from "next/image";

// Simple SVG icon for Kakao
const KakaoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
  >
    <path
      fill="#3C1E1E"
      d="M12 2C6.48 2 2 5.82 2 9.99c0 2.58 1.57 4.85 3.95 6.08L4.77 22l4.08-2.14c.96.29 1.99.45 3.07.45 5.52 0 10-3.82 10-7.99S17.52 2 12 2z"
    />
  </svg>
);

// Simple SVG icon for Google
const GoogleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 48 48"
  >
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.53-4.18 7.09-10.36 7.09-17.65z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
    <path fill="none" d="M0 0h48v48H0z" />
  </svg>
);

export default function LoginPage() {
  const { login } = useAuth();

  const handleLogin = () => {
    // In a real app, this would involve actual social login flows
    // For this prototype, we just call login to set authenticated state
    login("mock_user_token");
  };

  return (
    <div className="flex flex-col items-center justify-center h-fit mt-4 bg-background p-4 selection:bg-primary/20">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <BookHeart className="h-20 w-20 text-primary" />
          </div>
          <CardTitle className="text-4xl font-bold text-primary">
            {process.env.NEXT_PUBLIC_APP_NAME || "아이북"}
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            우리 아이에게 딱 맞는 책을 찾아보세요!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={handleLogin}
            >
              <GoogleIcon />
              <span className="ml-2">Google 계정으로 시작</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#3C1E1E]"
              onClick={handleLogin}
            >
              <KakaoIcon />
              <span className="ml-2">카카오 계정으로 시작</span>
            </Button>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">또는</span>
            </div>
          </div>
          <Button size="lg" className="w-full" onClick={handleLogin}>
            <LogIn className="mr-2 h-6 w-6" />
            이메일로 계속하기 (체험)
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            계속 진행하시면 아이북의 이용약관 및 개인정보처리방침에 동의하는
            것으로 간주됩니다.
          </p>
        </CardFooter>
      </Card>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()}{" "}
        {process.env.NEXT_PUBLIC_APP_NAME || "아이북"}. All rights reserved.
      </footer>
    </div>
  );
}
