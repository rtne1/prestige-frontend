"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";

export default function AccountPage() {
  const { user, isLoading, checkAuth } = useAuth();
  const router = useRouter();

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth");
    } else if (user) {
      setFormData((prev) => ({
        ...prev,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone || "",
      }));
    }
  }, [user, isLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      await api.put("/auth/profile", formData);
      await checkAuth(); // Refresh user data in the context
      
      setMessage({ type: "success", text: "Profile updated successfully." });
      
      // Clear password fields after successful update
      setFormData((prev) => ({
        ...prev,
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      }));

      // Hide message after 5 seconds
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(" ")
        : err.response?.data?.message || "Failed to update profile.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian">
        <div className="w-8 h-8 border-2 border-glass border-t-crimson rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-12 md:py-24 animate-[fadeInUp_0.5s_forwards]">
      <header className="mb-16 border-b border-glass pb-8">
        <h1 className="font-cinzel text-4xl text-white mb-2">Client Settings</h1>
        <p className="text-ash tracking-widest uppercase text-sm">
          Manage your personal identification and security credentials.
        </p>
      </header>

      <div className="max-w-3xl">
        {message.text && (
          <div
            className={`px-4 py-3 rounded-sm mb-8 text-sm ${
              message.type === "success"
                ? "bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981]"
                : "bg-crimson/10 border border-crimson/30 text-crimson"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-12">
          {/* PERSONAL IDENTIFICATION */}
          <div className="bg-carbon border border-glass p-8 md:p-12">
            <h3 className="font-cinzel text-2xl text-white mb-8 border-b border-glass/50 pb-4">
              Personal Identification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="md:col-span-2">
                <Input
                  label="Full Name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </div>
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
            </div>
          </div>

          {/* SECURITY CREDENTIALS */}
          <div className="bg-carbon border border-glass p-8 md:p-12">
            <h3 className="font-cinzel text-2xl text-white mb-2 border-b border-glass/50 pb-4">
              Security Credentials
            </h3>
            <p className="text-xs text-ash tracking-widest uppercase mb-8">
              Leave blank if you do not wish to change your password.
            </p>
            
            <div className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                name="current_password"
                value={formData.current_password}
                onChange={handleChange}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 border-t border-glass/30 pt-8 mt-4">
                <Input
                  label="New Password"
                  type="password"
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  name="new_password_confirmation"
                  value={formData.new_password_confirmation}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" isLoading={isSaving} className="w-full md:w-auto shadow-[0_0_20px_rgba(204,0,0,0.2)]">
              Save Modifications
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}