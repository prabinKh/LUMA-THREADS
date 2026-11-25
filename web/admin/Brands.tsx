import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { brandService, type Brand } from "@/api/brandService";
import { categoryService } from "@/api/categoryService";
import { type Category } from "@/lib/types";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Search, Loader, Tag, CheckSquare, Square, Store, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useGSAPReveal } from "@/hooks/useGSAP";

interface ApiError {
  response?: {
    data?: {
      detail?: string | object;
      error?: string;
    };
  };
  message?: string;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: "1", slug: "denim", name: "Denim" },
  { id: "2", slug: "tops", name: "Tops" },
  { id: "3", slug: "bottoms", name: "Bottoms" },
  { id: "4", slug: "outerwear", name: "Outerwear" },
  { id: "5", slug: "knitwear", name: "Knitwear" },
  { id: "6", slug: "accessories", name: "Accessories" },
];

export default function Brands() {
  const { user } = useAuth();
  const isAdmin = user ? (user.is_staff || user.is_superuser || user.is_admin) : true;
  const containerRef = useRef<HTMLDivElement>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo: "",
    category_ids: [] as string[],
  });

  useGSAPReveal(containerRef);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await categoryService.getAll();
      if (Array.isArray(data) && data.length > 0) {
        setCategories(data);
      }
    } catch (error) {
      console.warn("Using default categories for brand association");
    }
  }, []);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const data = await brandService.getAllAdmin(searchTerm);
      setBrands(data);
    } catch (error) {
      toast.error("Failed to load brands");
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchBrands();
    fetchCategories();
  }, [fetchBrands, fetchCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Brand name is required");
      return;
    }

    try {
      if (editingBrand) {
        await brandService.updateBrand(editingBrand.slug, formData);
        toast.success("Brand updated successfully");
      } else {
        await brandService.createBrand(formData);
        toast.success("Brand created successfully");
      }
      setFormData({ name: "", description: "", logo: "", category_ids: [] });
      setEditingBrand(null);
      setShowForm(false);
      await fetchBrands();
    } catch (error: unknown) {
      console.error("Save error:", error);
      const err = error as ApiError;
      let message = "Failed to save brand";
      const detail = err.response?.data?.detail;
      message = typeof detail === 'string' ? detail : 
                (typeof detail === 'object' ? JSON.stringify(detail) : 
                (err.response?.data?.error || err.message || "Failed to save brand"));
      toast.error(message);
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    const catIds = brand.category_ids || (Array.isArray(brand.categories) 
      ? brand.categories.map((c: any) => typeof c === 'string' ? c : (c.slug || c.id || c.name))
      : []);
    setFormData({
      name: brand.name,
      description: brand.description || "",
      logo: brand.logo || "",
      category_ids: catIds,
    });
    setShowForm(true);
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this brand?")) return;

    try {
      await brandService.deleteBrand(slug);
      toast.success("Brand deleted successfully");
      await fetchBrands();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Failed to delete brand");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBrand(null);
    setFormData({ name: "", description: "", logo: "", category_ids: [] });
  };

  const toggleCategory = (slug: string) => {
    setFormData(prev => ({
      ...prev,
      category_ids: prev.category_ids.includes(slug)
        ? prev.category_ids.filter(id => id !== slug)
        : [...prev.category_ids, slug]
    }));
  };

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (brand.description && brand.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div ref={containerRef} className="min-h-screen w-full bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 xl:p-10">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <Store size={20} />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Brand Management</h1>
            </div>
            <p className="text-sm text-slate-400">
              Create, configure, and maintain apparel brands & partner labels for the store.
            </p>
          </div>
          <button
            onClick={() => {
              if (showForm) {
                handleCancel();
              } else {
                setEditingBrand(null);
                setFormData({ name: "", description: "", logo: "", category_ids: [] });
                setShowForm(true);
              }
            }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/20 transition-all text-sm shrink-0"
          >
            <Plus size={18} />
            {showForm ? "Close Form" : "Add New Brand"}
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search brands by title, label or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
          />
        </div>

        {/* Form Modal / Drawer */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-emerald-400" />
                  {editingBrand ? `Edit Brand: ${editingBrand.name}` : "Create New Brand"}
                </h2>
                <span className="text-xs text-slate-400 font-mono">
                  {editingBrand ? `Slug: ${editingBrand.slug}` : "Slug generated automatically"}
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                      Brand Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      placeholder="e.g., Luma Atelier, Pistola Denim, Levi's"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                      Brand Logo URL
                    </label>
                    <input
                      type="url"
                      value={formData.logo}
                      onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      placeholder="https://example.com/brand-logo.png"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Description & Brand Story
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none"
                    rows={3}
                    placeholder="Brief description about the brand, fabric quality, and identity..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Associated Product Categories
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    {categories.map((cat) => {
                      const slug = cat.slug || cat.handle || String(cat.id);
                      const isSelected = formData.category_ids.includes(slug);
                      return (
                        <button
                          key={slug}
                          type="button"
                          onClick={() => toggleCategory(slug)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                            isSelected
                              ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                          }`}
                        >
                          {isSelected ? (
                            <CheckSquare size={14} className="text-emerald-400 shrink-0" />
                          ) : (
                            <Square size={14} className="text-slate-600 shrink-0" />
                          )}
                          <span className="truncate">{cat.name || cat.title || slug}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/20 transition"
                  >
                    {editingBrand ? "Update Brand" : "Save Brand"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Brands List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <Loader className="animate-spin text-emerald-500" size={32} />
              <p className="text-xs text-slate-400">Loading catalog brands...</p>
            </div>
          ) : filteredBrands.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Store size={40} className="mx-auto text-slate-600" />
              <p className="text-slate-300 font-medium">No brands found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {brands.length === 0 
                  ? "Get started by adding your first brand label using the button above." 
                  : "No brands match your current search query."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Brand</th>
                    <th className="px-6 py-4">Categories</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredBrands.map((brand) => (
                    <tr key={brand.slug || brand.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {brand.logo ? (
                            <img
                              src={brand.logo}
                              alt={brand.name}
                              className="w-10 h-10 rounded-xl object-cover bg-slate-950 border border-slate-800"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 font-bold border border-slate-700">
                              {brand.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-white">{brand.name}</div>
                            <div className="text-xs text-slate-500 font-mono">slug: {brand.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5 max-w-[220px]">
                          {brand.category_ids?.length || (Array.isArray(brand.categories) && brand.categories.length) ? (
                            (brand.categories || brand.category_ids || []).map((cat: any) => {
                              const name = typeof cat === 'string' ? cat : (cat.name || cat.title || cat.slug);
                              const key = typeof cat === 'string' ? cat : (cat.slug || cat.id || name);
                              return (
                                <span
                                  key={key}
                                  className="inline-flex items-center gap-1 bg-slate-800/80 text-emerald-400 text-[11px] font-medium px-2 py-0.5 rounded-md border border-slate-700"
                                >
                                  <Tag size={10} />
                                  {name}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-xs text-slate-500 italic">No assigned categories</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs max-w-xs truncate">
                        {brand.description || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            brand.is_active !== false
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-slate-800 text-slate-400 border border-slate-700"
                          }`}
                        >
                          {brand.is_active !== false ? "Active" : "Archived"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(brand)}
                            className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition"
                            title="Edit brand"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(brand.slug)}
                            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                            title="Delete brand"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer stats */}
          <div className="bg-slate-950/70 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing <strong className="text-white">{filteredBrands.length}</strong> of <strong className="text-white">{brands.length}</strong> brands
            </span>
            <span className="font-mono text-slate-500">Luma Threads Admin Suite</span>
          </div>
        </div>
      </div>
    </div>
  );
}
