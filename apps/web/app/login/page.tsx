"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, ArrowLeft, AlertCircle } from "lucide-react";
import { Container } from "@/components/common/container";
import { Card } from "@/components/common/card";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { Label } from "@/components/common/label";
import { PageWrapper } from "@/components/layout/page-wrapper";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Invalid credentials. Please try again.");
      }

      if (data.data?.token) {
        localStorage.setItem("goyatrio_token", data.data.token);
        // Synchronize with cookie for Next.js SSR middleware verification
        const secureFlag = window.location.protocol === "https:" ? "; Secure" : "";
        document.cookie = `goyatrio_token=${encodeURIComponent(data.data.token)}; Path=/; SameSite=Lax; Max-Age=86400${secureFlag}`;
      }

      window.location.href = data.data?.user?.role === "ADMIN" ? "/admin" : "/";
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to authenticate. Please check your credentials.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper>
      <section className="min-h-[80vh] py-12 tablet:py-20 flex items-center justify-center bg-muted/20">
        <Container className="max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="size-4" />
            Back to Homepage
          </Link>

          <Card className="p-8 border border-border shadow-md rounded-2xl bg-card">
            <div className="flex flex-col items-center text-center">
              <Image
                src="/brand/goyatrio-logo.png"
                alt="GoYatrio Logo"
                width={160}
                height={48}
                className="h-10 w-auto object-contain"
                priority
              />
              <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
                Sign in to GoYatrio
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Access your account, tour bookings, and travel inquiries.
              </p>
            </div>

            {errorMessage ? (
              <div
                className="mt-6 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
                role="alert"
              >
                <AlertCircle className="size-5 shrink-0 mt-0.5" />
                <p>{errorMessage}</p>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
              <div className="space-y-2">
                <Label htmlFor="login-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                    aria-invalid={!!validationErrors.email}
                  />
                </div>
                {validationErrors.email ? (
                  <p className="text-xs text-destructive">{validationErrors.email}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password">Password</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                    aria-invalid={!!validationErrors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-muted-foreground hover:text-foreground focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {validationErrors.password ? (
                  <p className="text-xs text-destructive">{validationErrors.password}</p>
                ) : null}
              </div>

              <Button type="submit" size="lg" className="w-full mt-2" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Card>
        </Container>
      </section>
    </PageWrapper>
  );
}
