"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  FESTIVAL_CARDS_QUERY,
  CATEGORIES_QUERY,
  CREATE_FESTIVAL_CARD_MUTATION,
  UPDATE_FESTIVAL_CARD_MUTATION,
  DELETE_FESTIVAL_CARD_MUTATION,
  PUBLISH_CARD_MUTATION,
} from "@/graphql/queries";
import { FestivalCard, FestivalCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Eye, Send, Download } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { normalizeColorForCanvas } from "@/lib/color";

function getCoord(val: any, fallback: number): number {
  if (val === undefined || val === null || val === "") return fallback;
  const num = Number(val);
  return isNaN(num) ? fallback : num;
}

function getString(val: any, fallback: string): string {
  if (val === undefined || val === null || val === "") return fallback;
  return String(val);
}

const schema = z.object({
  title: z.string().min(2, "Title required"),
  categoryId: z.string().min(1, "Category required"),
  festivalDate: z.string().min(1, "Festival Date required"),
  thumbnail: z.string().url("Must be a valid URL").or(z.string().startsWith("data:")),
  highResImage: z.string().url("Must be a valid URL").or(z.string().startsWith("data:")),
  primaryColor: z.string().default("#7C3AED"),
  secondaryColor: z.string().default("#FFFFFF"),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  tags: z.string().optional(),
  logoX: z.coerce.number().default(50),
  logoY: z.coerce.number().default(50),
  logoWidth: z.coerce.number().default(150),
  logoHeight: z.coerce.number().default(150),
  businessNameX: z.coerce.number().default(50),
  businessNameY: z.coerce.number().default(220),
  businessNameFontSize: z.coerce.number().default(24),
  businessNameColor: z.string().default("#FFFFFF"),
  phoneX: z.coerce.number().default(50),
  phoneY: z.coerce.number().default(260),
  phoneColor: z.string().default("#FFFFFF"),
  emailX: z.coerce.number().default(50),
  emailY: z.coerce.number().default(290),
  emailColor: z.string().default("#FFFFFF"),
  websiteX: z.coerce.number().default(50),
  websiteY: z.coerce.number().default(320),
  websiteColor: z.string().default("#FFFFFF"),
  addressX: z.coerce.number().default(50),
  addressY: z.coerce.number().default(350),
  addressColor: z.string().default("#FFFFFF"),
  taglineX: z.coerce.number().default(50),
  taglineY: z.coerce.number().default(385),
  taglineColor: z.string().default("#FFFFFFCC"),
  fontFamily: z.string().default("Inter"),
  isTrending: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
});
type FormData = z.infer<typeof schema>;

export default function AdminCardsPage() {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<FestivalCard | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"basic" | "positions">("basic");

  const { data, loading, refetch } = useQuery(FESTIVAL_CARDS_QUERY, {
    variables: { limit: 50 },
  });
  const { data: catData } = useQuery(CATEGORIES_QUERY, { variables: { includeHidden: true } });

  const cards: FestivalCard[] = data?.festivalCards || [];
  const categories: FestivalCategory[] = catData?.categories || [];

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const formValues = watch();

  const refetchAndClose = () => { refetch(); setModalOpen(false); setEditingCard(null); reset(); };

  const [createCard, { loading: creating }] = useMutation(CREATE_FESTIVAL_CARD_MUTATION, {
    onCompleted: () => { toast("Card created!", "success"); refetchAndClose(); },
    onError: (e) => toast(e.message, "error"),
  });

  const [updateCard, { loading: updating }] = useMutation(UPDATE_FESTIVAL_CARD_MUTATION, {
    onCompleted: () => { toast("Card updated!", "success"); refetchAndClose(); },
    onError: (e) => toast(e.message, "error"),
  });

  const [deleteCard] = useMutation(DELETE_FESTIVAL_CARD_MUTATION, {
    onCompleted: () => { toast("Card deleted", "success"); setDeleteConfirm(null); refetch(); },
    onError: (e) => toast(e.message, "error"),
  });

  const [publishCard] = useMutation(PUBLISH_CARD_MUTATION, {
    onCompleted: () => { toast("Card published!", "success"); refetch(); },
    onError: (e) => toast(e.message, "error"),
  });

  const openCreate = () => {
    setEditingCard(null);
    reset({
      title: "",
      categoryId: "",
      thumbnail: "",
      highResImage: "",
      primaryColor: "#7C3AED",
      secondaryColor: "#FFFFFF",
      status: "DRAFT",
      tags: "",
      festivalDate: new Date().toISOString().split("T")[0],
      logoX: 50,
      logoY: 50,
      logoWidth: 150,
      logoHeight: 150,
      businessNameX: 50,
      businessNameY: 220,
      businessNameFontSize: 24,
      businessNameColor: "#FFFFFF",
      phoneX: 50,
      phoneY: 260,
      phoneColor: "#FFFFFF",
      emailX: 50,
      emailY: 290,
      emailColor: "#FFFFFF",
      websiteX: 50,
      websiteY: 320,
      websiteColor: "#FFFFFF",
      addressX: 50,
      addressY: 350,
      addressColor: "#FFFFFF",
      taglineX: 50,
      taglineY: 385,
      taglineColor: "#FFFFFFCC",
      fontFamily: "Inter",
      isTrending: false,
      isFeatured: false,
    } as any);
    setModalOpen(true);
  };

  const openEdit = (card: FestivalCard) => {
    setEditingCard(card);
    let formattedDate = "";
    if (card.festivalDate) {
      try {
        formattedDate = new Date(card.festivalDate).toISOString().split("T")[0];
      } catch (e) {
        // Fallback
      }
    }
    reset({
      ...card,
      festivalDate: formattedDate,
      tags: card.tags?.join(", ") || "",
      isTrending: card.isTrending,
      isFeatured: card.isFeatured,
    } as any);
    setModalOpen(true);
  };

  const onSubmit = (data: FormData) => {
    const tagsArray = data.tags ? data.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
    const isoDate = new Date(data.festivalDate).toISOString();
    const input = { ...data, tags: tagsArray, festivalDate: isoDate };
    if (editingCard) {
      updateCard({ variables: { id: editingCard.id, input } });
    } else {
      createCard({ variables: { input } });
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Festival Cards</h1>
          <p className="text-sm text-gray-500 mt-1">Upload and manage festival card templates</p>
        </div>
        <Button onClick={openCreate} className="flex items-center gap-2">
          <Plus size={16} /> Add Card
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Cards", value: cards.length },
          { label: "Published", value: cards.filter(c => c.status === "PUBLISHED").length },
          { label: "Drafts", value: cards.filter(c => c.status === "DRAFT").length },
        ].map(s => (
          <div key={s.label} className="rounded-2xl bg-white border border-gray-100 p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Cards Table */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Card</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Downloads</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Created</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-4"><div className="skeleton h-4 rounded w-20" /></td>
                  ))}
                </tr>
              ))}
              {!loading && cards.map((card, i) => (
                <motion.tr
                  key={card.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl overflow-hidden bg-gradient-to-br from-violet-100 to-indigo-100 flex-shrink-0">
                        {card.thumbnail ? (
                          <img src={card.thumbnail} alt={card.title} className="h-full w-full object-cover" />
                        ) : <div className="flex h-full items-center justify-center text-lg">🎉</div>}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900 max-w-xs truncate">{card.title}</p>
                        <div className="flex gap-1 mt-0.5">
                          {card.isTrending && <span className="text-xs text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full">🔥 Trending</span>}
                          {card.isFeatured && <span className="text-xs text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-full">✨ Featured</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">{card.category?.name || "—"}</td>
                  <td className="px-4 py-4">
                    <Badge variant={card.status === "PUBLISHED" ? "success" : "warning"}>{card.status}</Badge>
                  </td>
                  <td className="px-4 py-4">
                    <span className="flex items-center gap-1 text-sm text-gray-600">
                      <Download size={13} /> {card.downloadCount}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-400">{formatDate(card.createdAt)}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/editor/${card.id}`} target="_blank">
                        <button className="p-2 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors" title="Preview">
                          <Eye size={15} />
                        </button>
                      </Link>
                      {card.status === "DRAFT" && (
                        <button
                          onClick={() => publishCard({ variables: { id: card.id } })}
                          className="p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Publish"
                        >
                          <Send size={15} />
                        </button>
                      )}
                      <button
                        onClick={() => openEdit(card)}
                        className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(card.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {!loading && !cards.length && (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-400">
                    <p className="text-3xl mb-2">🎨</p>
                    <p className="text-sm">No cards yet. Upload your first template!</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); reset(); setEditingCard(null); }}
        title={editingCard ? "Edit Card" : "Add Festival Card"}
        size="5xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form Side */}
          <div className="lg:col-span-7 space-y-4">
            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
              {(["basic", "positions"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all capitalize ${activeTab === tab ? "bg-white shadow text-violet-700" : "text-gray-500"}`}
                >
                  {tab === "basic" ? "Basic Info" : "Element Positions"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {activeTab === "basic" && (
                <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
                  <Input label="Card Title" placeholder="e.g. Diwali Special 2025" error={errors.title?.message} {...register("title")} />
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" {...register("categoryId")}>
                      <option value="">Select category...</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId.message}</p>}
                  </div>
                  <Input label="Festival Date" type="date" error={errors.festivalDate?.message} {...register("festivalDate")} />
                  <Input label="Thumbnail URL" placeholder="https://..." error={errors.thumbnail?.message} {...register("thumbnail")} />
                  <Input label="High-Res Image URL" placeholder="https://..." error={errors.highResImage?.message} {...register("highResImage")} />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">Primary Color</label>
                      <input type="color" className="w-full h-10 rounded-xl border border-gray-200 cursor-pointer" {...register("primaryColor")} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">Secondary Color</label>
                      <input type="color" className="w-full h-10 rounded-xl border border-gray-200 cursor-pointer" {...register("secondaryColor")} />
                    </div>
                  </div>
                  <Input label="Tags (comma separated)" placeholder="diwali, festival, lights" {...register("tags")} />
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" {...register("status")}>
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 cursor-pointer rounded-xl border border-gray-200 p-3">
                      <input type="checkbox" {...register("isTrending")} className="h-4 w-4 rounded text-violet-600" />
                      <span className="text-sm font-medium text-gray-700">Mark as Trending 🔥</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer rounded-xl border border-gray-200 p-3">
                      <input type="checkbox" {...register("isFeatured")} className="h-4 w-4 rounded text-violet-600" />
                      <span className="text-sm font-medium text-gray-700">Mark as Featured ✨</span>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === "positions" && (
                <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
                  <p className="text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-xl p-3">
                    💡 Define where each element appears on the card (in pixels from top-left). These positions overlay on the card template.
                  </p>
                  <div className="rounded-xl border border-gray-200 p-4 space-y-3">
                    <p className="text-sm font-semibold text-gray-700">Logo Position</p>
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="X (left)" type="number" {...register("logoX")} />
                      <Input label="Y (top)" type="number" {...register("logoY")} />
                      <Input label="Width" type="number" {...register("logoWidth")} />
                      <Input label="Height" type="number" {...register("logoHeight")} />
                    </div>
                  </div>
                  {[
                    { label: "Business Name", xKey: "businessNameX", yKey: "businessNameY", colorKey: "businessNameColor", extra: <Input label="Font Size" type="number" {...register("businessNameFontSize")} /> },
                    { label: "Phone", xKey: "phoneX", yKey: "phoneY", colorKey: "phoneColor" },
                    { label: "Email", xKey: "emailX", yKey: "emailY", colorKey: "emailColor" },
                    { label: "Website", xKey: "websiteX", yKey: "websiteY", colorKey: "websiteColor" },
                    { label: "Address", xKey: "addressX", yKey: "addressY", colorKey: "addressColor" },
                    { label: "Tagline", xKey: "taglineX", yKey: "taglineY", colorKey: "taglineColor" },
                  ].map((field) => (
                    <div key={field.label} className="rounded-xl border border-gray-200 p-4 space-y-3">
                      <p className="text-sm font-semibold text-gray-700">{field.label}</p>
                      <div className="grid grid-cols-2 gap-3">
                        <Input label="X (left)" type="number" {...register(field.xKey as keyof FormData)} />
                        <Input label="Y (top)" type="number" {...register(field.yKey as keyof FormData)} />
                        <div className="space-y-1.5">
                          <label className="block text-sm font-medium text-gray-700">Text Color</label>
                          <input type="color" className="w-full h-10 rounded-xl border border-gray-200 cursor-pointer" {...register(field.colorKey as keyof FormData)} />
                        </div>
                        {field.extra}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => { setModalOpen(false); reset(); }}>Cancel</Button>
                <Button type="submit" className="flex-1" loading={creating || updating}>
                  {editingCard ? "Save Changes" : "Create Card"}
                </Button>
              </div>
            </form>
          </div>

          {/* Preview Side */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Live Preview</span>
              <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">Approx. 500x500 scale</span>
            </div>

            {/* Preview Container */}
            <div
              className="relative w-full max-w-[340px] lg:max-w-none aspect-square overflow-hidden rounded-2xl shadow-lg border border-gray-200 bg-slate-50 font-sans"
              style={{
                fontFamily: getString(formValues.fontFamily, "Inter"),
                background: formValues.highResImage
                  ? "none"
                  : `linear-gradient(135deg, ${normalizeColorForCanvas(getString(formValues.primaryColor, "#7C3AED"))}, ${normalizeColorForCanvas(getString(formValues.secondaryColor, "#FFFFFF"))})`,
              }}
            >
              {/* Background Image */}
              {formValues.highResImage && (
                <img
                  src={formValues.highResImage}
                  alt="Background template"
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={(e) => {
                    // Fallback to thumbnail on error
                    if (formValues.thumbnail) {
                      (e.target as HTMLImageElement).src = formValues.thumbnail;
                    }
                  }}
                />
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/10" />

              {/* Logo Preview (Placeholder) */}
              <div
                className="absolute border border-dashed border-violet-400 bg-violet-50/40 flex items-center justify-center text-xs text-violet-700 font-semibold"
                style={{
                  left: `${getCoord(formValues.logoX, 50)}px`,
                  top: `${getCoord(formValues.logoY, 50)}px`,
                  width: `${getCoord(formValues.logoWidth, 150)}px`,
                  height: `${getCoord(formValues.logoHeight, 150)}px`,
                }}
              >
                <div className="text-center p-1 leading-tight select-none">
                  <div>🏢 LOGO</div>
                  <div className="text-[10px] text-gray-500 font-normal">
                    {getCoord(formValues.logoWidth, 150)}x{getCoord(formValues.logoHeight, 150)}
                  </div>
                </div>
              </div>

              {/* Business Name */}
              <div
                className="absolute font-bold leading-tight"
                style={{
                  left: `${getCoord(formValues.businessNameX, 50)}px`,
                  top: `${getCoord(formValues.businessNameY, 220)}px`,
                  fontSize: `${getCoord(formValues.businessNameFontSize, 24)}px`,
                  color: normalizeColorForCanvas(getString(formValues.businessNameColor, "#FFFFFF")),
                  maxWidth: "70%",
                }}
              >
                {getString(formValues.title, "Your Business Name")}
              </div>

              {/* Tagline */}
              <div
                className="absolute text-sm italic"
                style={{
                  left: `${getCoord(formValues.taglineX, 50)}px`,
                  top: `${getCoord(formValues.taglineY, 385)}px`,
                  color: normalizeColorForCanvas(getString(formValues.taglineColor, "#FFFFFFCC")),
                  maxWidth: "70%",
                }}
              >
                Your Business Tagline Here
              </div>

              {/* Phone */}
              <div
                className="absolute text-sm font-medium"
                style={{
                  left: `${getCoord(formValues.phoneX, 50)}px`,
                  top: `${getCoord(formValues.phoneY, 260)}px`,
                  color: normalizeColorForCanvas(getString(formValues.phoneColor, "#FFFFFF")),
                }}
              >
                📞 +91 98765 43210
              </div>

              {/* Email */}
              <div
                className="absolute text-xs"
                style={{
                  left: `${getCoord(formValues.emailX, 50)}px`,
                  top: `${getCoord(formValues.emailY, 290)}px`,
                  color: normalizeColorForCanvas(getString(formValues.emailColor, "#FFFFFF")),
                }}
              >
                ✉ business@example.com
              </div>

              {/* Website */}
              <div
                className="absolute text-xs"
                style={{
                  left: `${getCoord(formValues.websiteX, 50)}px`,
                  top: `${getCoord(formValues.websiteY, 320)}px`,
                  color: normalizeColorForCanvas(getString(formValues.websiteColor, "#FFFFFF")),
                }}
              >
                🌐 www.yourbusiness.com
              </div>

              {/* Address */}
              <div
                className="absolute text-xs max-w-[60%]"
                style={{
                  left: `${getCoord(formValues.addressX, 50)}px`,
                  top: `${getCoord(formValues.addressY, 350)}px`,
                  color: normalizeColorForCanvas(getString(formValues.addressColor, "#FFFFFF")),
                }}
              >
                📍 123 Street Name, Town City, India
              </div>
            </div>
            
            <p className="text-[11px] text-gray-400 mt-2 text-center select-none">
              Positions are rendered relative to the top-left corner in pixels.
            </p>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Card?" size="sm">
        <p className="text-sm text-gray-600 mb-6">This will permanently delete the card template. Downloads history will be removed.</p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="destructive" className="flex-1" onClick={() => deleteCard({ variables: { id: deleteConfirm } })}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
