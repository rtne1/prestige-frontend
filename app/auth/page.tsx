"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      
      
      const response = await api.post("/auth/login", { email, password });
      login(response.data.data.token, response.data.data.user);
    } catch (err: any) {
      const errorMsg = err.response?.data?.errors 
        ? Object.values(err.response.data.errors).flat().join(" ")
        : err.response?.data?.message || "Invalid credentials. Authentication failed.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-[fadeInUp_0.5s_forwards]">
      <div className="mb-12">
        <h1 className="font-cinzel text-3xl mb-2 text-white">Authenticate</h1>
        <p className="text-xs uppercase tracking-widest text-ash">
          Enter Your Client Portal
        </p>
      </div>

      {error && (
        <div className="bg-crimson/10 border border-crimson/30 text-crimson px-4 py-3 rounded-sm mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-2">
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <div className="pt-6">
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Login Securely
          </Button>
        </div>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-ash">
          Not part of the registry?{" "}
          <Link href="/auth/register" className="text-white border-b border-crimson pb-0.5 hover:text-crimson transition-colors">
            Create Profile
          </Link>
        </p>
      </div>
    </div>
  );
}