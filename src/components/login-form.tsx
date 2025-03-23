"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormInput } from "@/components/custom/form-input";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { signIn } from "next-auth/react";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await signIn("credentials", {
        ...form,
        redirect: false,
      });
      return res;
    },
    onSuccess: (data) => {
      if (data?.error) {
        setError("Invalid credentials");
      } else {
        alert("Login successful");
      }
    },
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={() => mutate()}>
            <div className="flex flex-col gap-6">
              <FormInput
                label="Email"
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              />
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <FormInput
                    label="Password"
                    id="password"
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  />
                </div>
                {error && <span className="text-red-500 text-center">{error}</span>}
              </div>
              <div className="flex flex-col gap-3">
                <Button isLoading={isPending} type="submit" className="w-full">
                  Login
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <a href="#" className="underline underline-offset-4">
                Sign up
              </a>
              <a href="#" className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                Forgot your password?
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
