"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.password_confirmation) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      await api.get("/sanctum/csrf-cookie", { baseURL: process.env.NEXT_PUBLIC_BACKEND_URL });

      const response = await api.post("/auth/register", formData);
      login(response.data.data.token, response.data.data.user);
    } catch (err: any) {
      const errorMsg = err.response?.data?.errors 
        ? Object.values(err.response.data.errors).flat().join(" ")
        : err.response?.data?.message || "Registration failed. Please verify your details.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-[fadeInUp_0.5s_forwards]">
      <div className="mb-12">
        <h1 className="font-cinzel text-3xl mb-2 text-white">Create Profile</h1>
        <p className="text-xs uppercase tracking-widest text-ash">
          Join The Exclusive Registry
        </p>
      </div>

      {error && (
        <div className="bg-crimson/10 border border-crimson/30 text-crimson px-4 py-3 rounded-sm mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-2">
        <Input
          label="Full Name"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          required
        />
        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <Input
          label="Phone Number"
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />
        <Input
          label="Create Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <Input
          label="Confirm Password"
          type="password"
          name="password_confirmation"
          value={formData.password_confirmation}
          onChange={handleChange}
          required
        />
        
        <div className="pt-6">
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Register Profile
          </Button>
        </div>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-ash">
          Already a member?{" "}
          <Link href="/auth" className="text-white border-b border-crimson pb-0.5 hover:text-crimson transition-colors">
            Authenticate
          </Link>
        </p>
      </div>
    </div>
  );
}