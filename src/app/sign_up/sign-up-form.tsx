"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormInput } from "@/components/custom/form-input";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { registerUser } from "./action";

export function SignUpForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const result = await registerUser(form);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      router.push("/login");
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Enter your information below to create your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              mutate();
            }}
          >
            <div className="flex flex-col gap-6">
              <FormInput
                label="Name"
                id="name"
                type="text"
                placeholder="John Doe"
                required
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
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
                <FormInput
                  label="Password"
                  id="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                />
                {error && <span className="text-red-500 text-center">{error}</span>}
              </div>
              <div className="flex flex-col gap-3">
                <Button isLoading={isPending} type="submit" className="w-full">
                  Sign Up
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <a href="/login" className="underline underline-offset-4">
                Login
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
