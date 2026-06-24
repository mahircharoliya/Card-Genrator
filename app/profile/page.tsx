"use client";

import { useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { MY_BUSINESS_PROFILE_QUERY, MY_DOWNLOADS_QUERY, SAVE_BUSINESS_PROFILE_MUTATION } from "@/graphql/queries";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/user/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Download, Building2, Phone, Mail, Globe, MapPin, Instagram, Facebook, MessageCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

const schema = z.object({
  businessName: z.string().optional(),
  ownerName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().optional(),
  address: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  whatsapp: z.string().optional(),
  tagline: z.string().optional(),
  gstNumber: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function ProfilePage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace("/login");
  }, [isAuthenticated, authLoading, router]);

  const { data: profileData } = useQuery(MY_BUSINESS_PROFILE_QUERY, { skip: !isAuthenticated });
  const { data: downloadsData } = useQuery(MY_DOWNLOADS_QUERY, { skip: !isAuthenticated });

  const profile = profileData?.myBusinessProfile;
  const downloads = downloadsData?.myDownloads || [];

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (profile) {
      reset({
        businessName: profile.businessName || "",
        ownerName: profile.ownerName || "",
        phone: profile.phone || "",
        email: profile.email || "",
        website: profile.website || "",
        address: profile.address || "",
        instagram: profile.instagram || "",
        facebook: profile.facebook || "",
        whatsapp: profile.whatsapp || "",
        tagline: profile.tagline || "",
        gstNumber: profile.gstNumber || "",
      });
    }
  }, [profile, reset]);

  const [saveProfile, { loading: saving }] = useMutation(SAVE_BUSINESS_PROFILE_MUTATION, {
    onCompleted: () => toast("Business profile saved!", "success"),
    onError: (e) => toast(e.message, "error"),
    refetchQueries: [{ query: MY_BUSINESS_PROFILE_QUERY }],
  });

  const onSubmit = (data: FormData) => {
    saveProfile({ variables: { input: data } });
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="h-10 w-10 rounded-full border-4 border-violet-600 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold">{user?.name?.charAt(0)?.toUpperCase()}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Business Profile Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm mb-6">
                <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <Building2 size={17} className="text-violet-600" /> Business Information
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input label="Business Name" placeholder="Your Business Name" icon={<Building2 size={15} />} {...register("businessName")} />
                  <Input label="Owner / Proprietor" placeholder="Owner Name" {...register("ownerName")} />
                  <Input label="Phone" placeholder="+91 98765 43210" icon={<Phone size={15} />} {...register("phone")} />
                  <Input label="Email" type="email" placeholder="business@email.com" icon={<Mail size={15} />} error={errors.email?.message} {...register("email")} />
                  <Input label="Website" placeholder="www.yourbusiness.com" icon={<Globe size={15} />} {...register("website")} />
                  <Input label="GST Number" placeholder="GSTIN (optional)" {...register("gstNumber")} />
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Business Address</label>
                    <textarea rows={2} placeholder="Full business address" className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none" {...register("address")} />
                  </div>
                  <div className="sm:col-span-2">
                    <Input label="Tagline / Slogan" placeholder="Your catchy business tagline" {...register("tagline")} />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm mb-6">
                <h2 className="font-bold text-gray-900 mb-5">Social Media Links</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Input label="Instagram" placeholder="@handle" icon={<Instagram size={15} />} {...register("instagram")} />
                  <Input label="Facebook" placeholder="Page URL or name" icon={<Facebook size={15} />} {...register("facebook")} />
                  <Input label="WhatsApp" placeholder="+91 98765 43210" icon={<MessageCircle size={15} />} {...register("whatsapp")} />
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" loading={saving}>
                Save Business Profile
              </Button>
            </form>
          </div>

          {/* Sidebar: Download History */}
          <div>
            <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Download size={17} className="text-violet-600" /> Download History
              </h2>
              {downloads.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-3xl mb-2">📥</p>
                  <p className="text-sm text-gray-400">No downloads yet.</p>
                  <Link href="/gallery">
                    <Button variant="outline" size="sm" className="mt-3">Browse Gallery</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {downloads.slice(0, 10).map((dl: { id: string; format: string; createdAt: string; card?: { id: string; title: string; thumbnail?: string; category?: { name: string } } }) => (
                    <div key={dl.id} className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl overflow-hidden bg-violet-50 flex-shrink-0">
                        {dl.card?.thumbnail ? (
                          <img src={dl.card.thumbnail} alt="" className="h-full w-full object-cover" />
                        ) : <div className="flex h-full items-center justify-center text-lg">🎉</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{dl.card?.title || "Card"}</p>
                        <p className="text-xs text-gray-400">{dl.card?.category?.name} · {dl.format}</p>
                        <p className="text-xs text-gray-300">{formatDate(dl.createdAt)}</p>
                      </div>
                      {dl.card && (
                        <Link href={`/editor/${dl.card.id}`}>
                          <button className="text-xs text-violet-600 font-medium hover:text-violet-700">Use</button>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
