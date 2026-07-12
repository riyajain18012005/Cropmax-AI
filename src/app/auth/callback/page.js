"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader } from "@/components/ui";

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const { oauthLogin } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      oauthLogin(token);
    } else {
      window.location.href = "/login?error=OAuthTokenMissing";
    }
  }, [searchParams, oauthLogin]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
      <Loader size="lg" />
      <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm animate-pulse">
        Completing secure OAuth login authentication...
      </p>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader size="lg" />
        <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm animate-pulse">
          Loading authentication parameters...
        </p>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
