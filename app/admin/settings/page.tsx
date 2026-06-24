"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/components/providers/AuthProvider";
import { useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { motion } from "framer-motion";
import { User, Bell, Shield, Palette } from "lucide-react";

const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($name: String, $profileImage: String) {
    updateProfile(name: $name, profileImage: $profileImage) {
      id
      name
      email
      profileImage
    }
  }
`;

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || "");
  const [activeSection, setActiveSection] = useState("profile");

  const [updateProfile, { loading }] = useMutation(UPDATE_PROFILE_MUTATION, {
    onCompleted: () => toast("Profile updated!", "success"),
    onError: (e) => toast(e.message, "error"),
  });

  const sections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your admin account and platform settings</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="w-48 flex-shrink-0">
          <nav className="space-y-1">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  activeSection === id ? "bg-violet-600 text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1">
          {activeSection === "profile" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm max-w-lg">
              <h2 className="font-bold text-gray-900 mb-5">Admin Profile</h2>

              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">{user?.name?.charAt(0)?.toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  <span className="inline-block mt-1 text-xs bg-violet-100 text-violet-700 font-semibold rounded-full px-2 py-0.5">ADMIN</span>
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input label="Email Address" value={user?.email || ""} disabled className="opacity-60" />
                <Button
                  onClick={() => updateProfile({ variables: { name } })}
                  loading={loading}
                  className="w-full"
                >
                  Save Changes
                </Button>
              </div>
            </motion.div>
          )}

          {activeSection === "notifications" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm max-w-lg">
              <h2 className="font-bold text-gray-900 mb-5">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { label: "New user registrations", desc: "Get notified when a new user signs up" },
                  { label: "Download milestones", desc: "Alerts when cards hit download milestones" },
                  { label: "Weekly reports", desc: "Summary report every Monday" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-4 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-600" />
                    </label>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeSection === "security" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm max-w-lg">
              <h2 className="font-bold text-gray-900 mb-5">Security Settings</h2>
              <div className="space-y-4">
                <Input label="Current Password" type="password" placeholder="••••••••" />
                <Input label="New Password" type="password" placeholder="••••••••" />
                <Input label="Confirm New Password" type="password" placeholder="••••••••" />
                <Button onClick={() => toast("Password change coming soon", "info" as any)} variant="outline" className="w-full">
                  Change Password
                </Button>
              </div>
            </motion.div>
          )}

          {activeSection === "appearance" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm max-w-lg">
              <h2 className="font-bold text-gray-900 mb-5">Appearance</h2>
              <div className="space-y-3">
                {[
                  { label: "Light Mode", value: "light", active: true },
                  { label: "Dark Mode", value: "dark", active: false },
                  { label: "System Default", value: "system", active: false },
                ].map((theme) => (
                  <button key={theme.value} className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${theme.active ? "border-violet-500 bg-violet-50" : "border-gray-100 hover:border-gray-200"}`}>
                    <span className="text-sm font-medium text-gray-900">{theme.label}</span>
                    {theme.active && <div className="h-4 w-4 rounded-full bg-violet-500" />}
                  </button>
                ))}
                <p className="text-xs text-gray-400 mt-2">Dark mode coming soon</p>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
