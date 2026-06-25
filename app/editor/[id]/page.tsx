"use client";

import { useState, useRef, useCallback, useEffect, use } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { FESTIVAL_CARD_QUERY, SAVE_BUSINESS_PROFILE_MUTATION, RECORD_DOWNLOAD_MUTATION, MY_BUSINESS_PROFILE_QUERY } from "@/graphql/queries";
import { FestivalCard, CardCustomization } from "@/types";
import { Navbar } from "@/components/user/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/components/providers/AuthProvider";
import { motion } from "framer-motion";
import { Download, Upload, RefreshCw, Save, ImageIcon } from "lucide-react";
import { useDropzone } from "react-dropzone";
import html2canvas from "html2canvas";
import Image from "next/image";
import Link from "next/link";
import { normalizeColorForCanvas, normalizeCanvasColors } from "@/lib/color";

interface EditorPageProps {
  params: Promise<{ id: string }>;
}

export default function EditorPage({ params }: EditorPageProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [customization, setCustomization] = useState<CardCustomization>({});
  const [logoPreviews, setLogoPreviews] = useState<string[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unwrappedParams = use(params);
  const cardId = unwrappedParams?.id;

  const { data: cardData, loading: cardLoading, error: queryError } = useQuery(FESTIVAL_CARD_QUERY, {
    variables: { id: cardId },
    onError: (err) => {
      setError(err.message || "Failed to load card");
    },
  });

  const { data: profileData } = useQuery(MY_BUSINESS_PROFILE_QUERY, {
    skip: !isAuthenticated,
    onCompleted: (data) => {
      if (data?.myBusinessProfile) {
        const p = data.myBusinessProfile;
        setCustomization({
          businessName: p.businessName || "",
          ownerName: p.ownerName || "",
          phone: p.phone || "",
          email: p.email || "",
          website: p.website || "",
          address: p.address || "",
          instagram: p.instagram || "",
          facebook: p.facebook || "",
          tagline: p.tagline || "",
          logo: p.logo || "",
        });
        if (p.logo) setLogoPreviews([p.logo]);
      }
    },
  });

  const [saveProfile] = useMutation(SAVE_BUSINESS_PROFILE_MUTATION, {
    onCompleted: () => toast("Profile saved! ✓", "success"),
    onError: (err) => toast(err.message, "error"),
  });

  const [recordDownload] = useMutation(RECORD_DOWNLOAD_MUTATION);

  const card: FestivalCard | null = cardData?.festivalCard || null;

  const onDropLogo = useCallback((files: File[]) => {
    files.forEach((file) => {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setLogoPreviews((prev) => [...prev, dataUrl]);
        // Store first logo for API
        if (logoPreviews.length === 0) {
          setCustomization((prev) => ({ ...prev, logo: dataUrl }));
        }
      };
      reader.readAsDataURL(file);
    });
  }, [logoPreviews.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropLogo,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".svg", ".webp"] },
    maxFiles: 10,
    maxSize: 5 * 1024 * 1024,
  });

  const handleChange = (field: keyof CardCustomization) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setCustomization((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSaveProfile = () => {
    if (!isAuthenticated) {
      toast("Please sign in to save your profile", "warning" as any);
      return;
    }
    const { logo, ...rest } = customization;
    saveProfile({ variables: { input: { ...rest, logo: logoPreviews.length > 0 ? logoPreviews[0] : undefined } } });
  };

  const handleDownload = async (format: "PNG" | "JPG" | "PDF") => {
    if (!canvasRef.current || !card) return;
    setDownloading(true);
    try {
      // Pre-normalize all colors in the canvas to avoid lab/oklch errors
      normalizeCanvasColors(canvasRef.current);

      // Preload all images to ensure they're ready for canvas capture
      const images = canvasRef.current.querySelectorAll("img");
      const preloadPromises = Array.from(images).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Continue even if image fails
        });
      });
      await Promise.all(preloadPromises);

      const canvas = await html2canvas(canvasRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        imageTimeout: 15000,
        proxy: undefined,
      });

      const link = document.createElement("a");
      const filename = `${card.title || "festival-card"}-festcard`;

      if (format === "PDF") {
        const { default: jsPDF } = await import("jspdf");
        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        const w = pdf.internal.pageSize.getWidth();
        const h = (canvas.height * w) / canvas.width;
        pdf.addImage(imgData, "JPEG", 0, 0, w, h);
        pdf.save(`${filename}.pdf`);
      } else {
        const mimeType = format === "JPG" ? "image/jpeg" : "image/png";
        link.download = `${filename}.${format.toLowerCase()}`;
        link.href = canvas.toDataURL(mimeType, 0.95);
        link.click();
      }

      if (isAuthenticated) {
        await recordDownload({ variables: { cardId: card.id, format } });
      }
      toast(`Downloaded as ${format}! ✓`, "success");
    } catch (err: any) {
      console.error("Download error:", err);
      toast(err?.message || "Download failed. Please try again.", "error");
    } finally {
      setDownloading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-96 text-center px-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
            <h3 className="text-lg font-bold text-red-700 mb-2">Error Loading Card</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <Link href="/gallery"><Button variant="outline">Back to Gallery</Button></Link>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cardLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="h-12 w-12 rounded-full border-4 border-violet-600 border-t-transparent animate-spin mx-auto" />
            <p className="mt-4 text-gray-500">Loading template...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <p className="text-gray-500 mb-4">Card not found</p>
          <Link href="/gallery"><Button>Back to Gallery</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/gallery" className="text-sm text-gray-500 hover:text-violet-600">← Back to Gallery</Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">{card.title}</h1>
          <p className="text-sm text-gray-500">{card.category?.name}</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* PREVIEW */}
          <div className="order-1 lg:order-1">
            <div className="sticky top-20">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold text-gray-900">Live Preview</h2>
                <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-1">Updates instantly</span>
              </div>

              {/* Card Preview Canvas */}
              <div
                ref={canvasRef}
                className="relative w-full overflow-hidden rounded-2xl shadow-2xl"
                style={{ aspectRatio: "1 / 1", fontFamily: card.fontFamily || "Inter" }}
              >
                {/* Background Image */}
                {card.highResImage ? (
                  <div className="absolute inset-0 h-full w-full">
                    <Image
                      src={card.highResImage}
                      alt={card.title}
                      fill
                      className="object-cover"
                      crossOrigin="anonymous"
                      priority
                      unoptimized
                    />
                  </div>
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(135deg, ${normalizeColorForCanvas(card.primaryColor)}, ${normalizeColorForCanvas(card.secondaryColor)})` }}
                  />
                )}

                {/* Overlay for better text readability */}
                <div className="absolute inset-0 bg-black/10" />

                {/* Logos */}
                {logoPreviews.map((logoPreview, index) => (
                  <div
                    key={index}
                    className="absolute"
                    style={{
                      left: card.logoX + (index * 50), // Offset each logo slightly
                      top: card.logoY + (index * 10),
                      width: card.logoWidth,
                      height: card.logoHeight,
                    }}
                   >
                    <div className="relative h-full w-full">
                      <Image
                        src={logoPreview}
                        alt={`Logo ${index + 1}`}
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
                  </div>
                ))}

                {/* Business Name */}
                {customization.businessName && (
                  <div
                    className="absolute font-bold leading-tight"
                    style={{
                      left: card.businessNameX,
                      top: card.businessNameY,
                      fontSize: card.businessNameFontSize,
                      color: normalizeColorForCanvas(card.businessNameColor),
                      maxWidth: "70%",
                    }}
                  >
                    {customization.businessName}
                  </div>
                )}

                {/* Tagline */}
                {customization.tagline && (
                  <div
                    className="absolute text-sm italic"
                    style={{ left: card.taglineX, top: card.taglineY, color: normalizeColorForCanvas(card.taglineColor), maxWidth: "70%" }}
                  >
                    {customization.tagline}
                  </div>
                )}

                {/* Phone */}
                {customization.phone && (
                  <div
                    className="absolute text-sm"
                    style={{ left: card.phoneX, top: card.phoneY, color: normalizeColorForCanvas(card.phoneColor) }}
                  >
                    📞 {customization.phone}
                  </div>
                )}

                {/* Email */}
                {customization.email && (
                  <div
                    className="absolute text-xs"
                    style={{ left: card.emailX, top: card.emailY, color: normalizeColorForCanvas(card.emailColor) }}
                  >
                    ✉ {customization.email}
                  </div>
                )}

                {/* Website */}
                {customization.website && (
                  <div
                    className="absolute text-xs"
                    style={{ left: card.websiteX, top: card.websiteY, color: normalizeColorForCanvas(card.websiteColor) }}
                  >
                    🌐 {customization.website}
                  </div>
                )}

                {/* Address */}
                {customization.address && (
                  <div
                    className="absolute text-xs"
                    style={{ left: card.addressX, top: card.addressY, color: normalizeColorForCanvas(card.addressColor), maxWidth: "60%" }}
                  >
                    📍 {customization.address}
                  </div>
                )}
              </div>

              {/* Download buttons */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                {(["PNG", "JPG", "PDF"] as const).map((fmt) => (
                  <Button
                    key={fmt}
                    onClick={() => handleDownload(fmt)}
                    loading={downloading}
                    variant="outline"
                    className="flex items-center gap-1.5"
                  >
                    <Download size={14} />
                    {fmt}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* FORM */}
          <div className="order-2 lg:order-2 space-y-5">
            {/* Logo Upload */}
            <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ImageIcon size={16} className="text-violet-600" /> Business Logo
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{logoPreviews.length} logo{logoPreviews.length !== 1 ? 's' : ''}</span>
                </span>
                {logoPreviews.length > 0 && (
                  <button onClick={() => setLogoPreviews([])} className="text-xs text-red-600 hover:text-red-700 hover:underline">
                    Clear all
                  </button>
                )}
              </h3>
              <div
                {...getRootProps()}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors ${isDragActive ? "border-violet-400 bg-violet-50" : "border-gray-200 hover:border-violet-300 hover:bg-violet-50"
                  }`}
              >
                <input {...getInputProps()} multiple />
                {logoPreviews.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
                    {logoPreviews.map((preview, idx) => (
                      <div key={idx} className="relative group">
                        <img src={preview} alt={`Logo ${idx + 1}`} className="h-16 w-16 object-contain rounded-lg border border-gray-200" />
                        <button
                          onClick={(e) => { e.stopPropagation(); setLogoPreviews(prev => prev.filter((_, i) => i !== idx)); }}
                          className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <Upload size={24} className="text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-600">Drag & drop logos here</p>
                    <p className="text-xs text-gray-400 mt-1">Supports PNG, JPG, SVG up to 5MB each</p>
                    <p className="text-xs text-gray-400 mt-1">You can add up to 10 logos</p>
                  </>
                )}
              </div>
            </div>

            {/* Business Info */}
            <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900">Business Information</h3>
              <Input label="Business Name" placeholder="Your Business Name" value={customization.businessName || ""} onChange={handleChange("businessName")} />
              <Input label="Owner Name" placeholder="Owner / Proprietor Name" value={customization.ownerName || ""} onChange={handleChange("ownerName")} />
              <Input label="Tagline" placeholder="Your catchy tagline" value={customization.tagline || ""} onChange={handleChange("tagline")} />
              <Input label="Phone Number" placeholder="+91 98765 43210" value={customization.phone || ""} onChange={handleChange("phone")} />
              <Input label="Email Address" type="email" placeholder="business@example.com" value={customization.email || ""} onChange={handleChange("email")} />
              <Input label="Website" placeholder="www.yourbusiness.com" value={customization.website || ""} onChange={handleChange("website")} />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea
                  rows={2}
                  placeholder="Your business address"
                  value={customization.address || ""}
                  onChange={handleChange("address")}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900">Social Media</h3>
              <Input label="Instagram" placeholder="@yourbusiness" value={customization.instagram || ""} onChange={handleChange("instagram")} />
              <Input label="Facebook" placeholder="facebook.com/yourbusiness" value={customization.facebook || ""} onChange={handleChange("facebook")} />
              <Input label="WhatsApp" placeholder="+91 98765 43210" value={customization.whatsapp || ""} onChange={handleChange("whatsapp")} />
            </div>

            {/* Actions */}
            {isAuthenticated && (
              <Button onClick={handleSaveProfile} variant="outline" className="w-full" size="lg">
                <Save size={16} className="mr-2" /> Save Profile for Next Time
              </Button>
            )}
            {!isAuthenticated && (
              <div className="rounded-xl bg-violet-50 border border-violet-200 p-4 text-center">
                <p className="text-sm text-violet-700 font-medium">
                  <Link href="/login" className="underline">Sign in</Link> to save your business profile and access it on any template
                </p>
              </div>
            )}

            <Button onClick={() => handleDownload("PNG")} size="xl" className="w-full" loading={downloading}>
              <Download size={18} className="mr-2" /> Download HD Card
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
