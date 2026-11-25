"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { productService } from "@/api/productService";
import { categoryService } from "@/api/categoryService";
import { brandService } from "@/api/brandService";
import { collectionService } from "@/api/collectionService";
import { uploadService } from "@/api/uploadService";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import {
  Shirt,
  Tag,
  Layers,
  Package,
  Sparkles,
  Check,
  CheckCircle2,
  Plus,
  Trash2,
  Upload,
  Eye,
  EyeOff,
  Save,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Ruler,
  Droplet,
  RefreshCw,
  Scissors,
  Palette,
  AlertCircle,
  Info,
  Image as ImageIcon,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Star,
  GripVertical,
  X,
  FileImage,
  SlidersHorizontal,
  Smartphone
} from "lucide-react";

// Fashion palette presets
const FASHION_PALETTE = [
  { name: "Raw Indigo", hex: "#1E293B" },
  { name: "Vintage Black", hex: "#111111" },
  { name: "Washed Charcoal", hex: "#2D3748" },
  { name: "Crisp White", hex: "#FFFFFF" },
  { name: "Bone / Oatmeal", hex: "#F3EDE2" },
  { name: "Vintage Blue", hex: "#3B82F6" },
  { name: "Washed Olive", hex: "#3F4E3A" },
  { name: "Terracotta", hex: "#A0522D" },
  { name: "Sand Dune", hex: "#D2B48C" },
  { name: "Burgundy", hex: "#5B1425" },
];

// Curated sample fashion photos for quick 1-click photo population
const SAMPLE_FASHION_PHOTOS = [
  { label: "Selvedge Denim", url: "https://images.unsplash.com/photo-1542272604-780c96856592?w=800&auto=format&fit=crop&q=80" },
  { label: "Washed Black Denim", url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80" },
  { label: "Canvas Workwear", url: "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80" },
  { label: "Black Outerwear", url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80" },
  { label: "Sage Utility Jacket", url: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800&auto=format&fit=crop&q=80" },
  { label: "Heavyweight Tee", url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80" },
  { label: "Cashmere Knit", url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80" },
  { label: "Silk Wrap Dress", url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80" },
];

// Sizing presets
const SIZE_PRESETS = {
  denim: {
    label: "Denim & Waist",
    sizes: ["24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "36"],
  },
  apparel: {
    label: "Tops & Outerwear",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  },
  dresses: {
    label: "Dresses & Tailoring",
    sizes: ["0", "2", "4", "6", "8", "10", "12"],
  },
  onesize: {
    label: "Accessories / O/S",
    sizes: ["O/S"],
  },
};

// Category Specification Blueprint Pills
const CATEGORY_FEATURE_BLUEPRINTS: Record<string, string[]> = {
  denim: [
    "100% Japanese Selvedge Cotton",
    "13.5 oz Raw Rigid Denim",
    "Custom Embossed Copper Rivets",
    "Sanforized Fabric (Minimal Shrinkage)",
    "Classic 5-Pocket Construction",
    "Chain-Stitched Hems & Waistband",
    "Button Fly with Antiqued Metal Shank",
  ],
  tops: [
    "280 GSM Heavyweight French Terry",
    "100% GOTS Certified Organic Cotton",
    "Garment-Dyed & Enzyme Washed",
    "1x1 Ribbed Collar with Bound Neckline",
    "Relaxed Drop-Shoulder Silhouette",
    "Flatlock Seam Construction",
    "Ethically Made in Portugal",
  ],
  sweaters: [
    "100% Extrafine Merino Wool",
    "7-Gauge Heavyweight Fisherman Rib",
    "Sustainably Sourced Woolmark Fibers",
    "Natural Buffalo Horn Buttons",
    "Thermal Regulating & Odor-Resistant",
    "Hand-Linked Collar & Cuffs",
  ],
  jackets: [
    "Heavyweight Double-Faced Wool Blend",
    "Water-Repellent DWR Finish",
    "100% Bemberg Cupro Satin Lining",
    "Storm Flap & Horn Buckles",
    "Deep Welt Handwarmer Pockets",
    "Interior Chest Passport Pocket",
  ],
  dresses: [
    "100% Mulberry Silk Satin",
    "Bias-Cut Silhouette for Fluid Drape",
    "Concealed Inseam Side Zip",
    "French Seam Interior Finishing",
    "Adjustable Delicate Spaghetti Straps",
    "Double-Layered Lined Bodice",
  ],
  jumpsuits: [
    "Garment-Washed Linen Cotton Twill",
    "Elasticated Cinched Waist with Belt",
    "Utility Chest & Patch Hip Pockets",
    "Concealed Front Zip Closure",
    "Tapered Ankle with Cuff Detail",
  ],
  accessories: [
    "Full-Grain Vegetable Tanned Italian Leather",
    "Solid Cast Brass Hardware",
    "Debossed Subtle Brand Monogram",
    "Burnished Hand-Finished Edges",
  ],
};

const FIT_OPTIONS = [
  "Relaxed",
  "Straight",
  "Slim",
  "Oversized",
  "Tailored",
  "Boxy",
  "Wide-Leg",
  "Barrel",
  "Flare",
  "Skinny",
];

const RISE_OPTIONS = [
  "High Rise",
  "Mid Rise",
  "Low Rise",
  "Super High Rise",
  "Standard",
];

const WASH_OPTIONS = [
  "Raw Indigo",
  "Vintage Wash",
  "Washed Black",
  "Bleached Light",
  "Stone Wash",
  "Garment Dyed",
  "Clean Finish",
  "Distressed",
];

const BADGE_PRESETS = [
  "NEW ARRIVAL",
  "BEST SELLER",
  "LIMITED EDITION",
  "EXCLUSIVE",
  "ORGANIC",
  "SALE",
];

// Colorway Variant Interface
export interface ColorwayItem {
  id: string;
  name: string;
  hex: string;
  price: string;
  originalPrice: string;
  description: string;
  descriptions?: string[];
  sizes: string[];
  stock: string;
  primaryImage: string;
  hoverImage: string;
  galleryImages: string[];
}

export default function AddProduct() {
  const { setIsSidebarOpen } = useOutletContext<{ setIsSidebarOpen?: (open: boolean) => void }>() || {};
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // SECTION 1: GARMENT IDENTIFICATION
  const [title, setTitle] = useState("");
  const [handle, setHandle] = useState("");
  const [brand, setBrand] = useState("Luma Threads");
  const [newBrandInput, setNewBrandInput] = useState("");
  const [isAddingNewBrand, setIsAddingNewBrand] = useState(false);
  const [isSavingBrand, setIsSavingBrand] = useState(false);

  // Gender / Silhouette options with Create & Delete
  const [gender, setGender] = useState<string>("Unisex");
  const [genderOptions, setGenderOptions] = useState<string[]>(["Women", "Men", "Unisex"]);
  const [showAddGenderInput, setShowAddGenderInput] = useState(false);
  const [newGenderTitle, setNewGenderTitle] = useState("");

  // Merchandising Badge options with Create & Delete
  const [badge, setBadge] = useState("NEW ARRIVAL");
  const [badges, setBadges] = useState<string[]>(BADGE_PRESETS);
  const [showAddBadgeInput, setShowAddBadgeInput] = useState(false);
  const [newBadgeTitle, setNewBadgeTitle] = useState("");

  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // Multi-image paste URL & multi-file state for active colorway
  const multiFileInputRef = useRef<HTMLInputElement>(null);
  const [showAddUrlInput, setShowAddUrlInput] = useState(false);
  const [newImageUrlInput, setNewImageUrlInput] = useState("");

  // SECTION 2: APPAREL TAXONOMY & COLLECTIONS
  const [selectedCategory, setSelectedCategory] = useState("denim");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedCollections, setSelectedCollections] = useState<string[]>(["all-denim", "all-new"]);

  // Category and SubCategory Create & Delete state
  const [showAddCategoryInput, setShowAddCategoryInput] = useState(false);
  const [newCategoryTitle, setNewCategoryTitle] = useState("");
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  const [showAddSubCategoryInput, setShowAddSubCategoryInput] = useState(false);
  const [newSubCategoryTitle, setNewSubCategoryTitle] = useState("");
  const [isSavingSubCategory, setIsSavingSubCategory] = useState(false);

  // Collections Create & Delete state
  const [showAddCollectionInput, setShowAddCollectionInput] = useState(false);
  const [newCollectionTitle, setNewCollectionTitle] = useState("");
  const [isSavingCollection, setIsSavingCollection] = useState(false);

  // SECTION 3: FEATURES & BLUEPRINT SPECIFICATIONS
  const [details, setDetails] = useState<string[]>([
    "100% Japanese Selvedge Cotton",
    "13.5 oz Raw Rigid Denim",
    "Custom Embossed Copper Rivets",
    "Sanforized Fabric (Minimal Shrinkage)",
    "Chain-Stitched Hems & Waistband",
  ]);
  const [newDetailInput, setNewDetailInput] = useState("");
  const [sizeAndFit, setSizeAndFit] = useState(
    "Model is 6'1\" / 185cm wearing size 32 waist. True to size with a comfortable straight drape."
  );
  const [care, setCare] = useState(
    "For raw denim, wear for 6 months before first wash. When needed, soak cold inside-out with mild detergent. Hang dry."
  );
  const [fit, setFit] = useState("Straight");
  const [rise, setRise] = useState("Mid Rise");
  const [wash, setWash] = useState("Raw Indigo");

  // Denim Tailoring Specifications state (with Add & Delete features)
  const [denimSpecs, setDenimSpecs] = useState<Array<{ id: string; label: string; value: string; type?: "fit" | "rise" | "wash" | "custom" }>>([
    { id: "spec-fit", label: "Fit Silhouette", value: "Straight", type: "fit" },
    { id: "spec-rise", label: "Waist Rise", value: "Mid Rise", type: "rise" },
    { id: "spec-wash", label: "Wash Finish", value: "Raw Indigo", type: "wash" },
  ]);
  const [showAddDenimSpecInput, setShowAddDenimSpecInput] = useState(false);
  const [newDenimSpecLabel, setNewDenimSpecLabel] = useState("");
  const [newDenimSpecValue, setNewDenimSpecValue] = useState("");

  // SECTION 4: COLOR-FIRST VARIANT ARCHITECTURE
  const [colorways, setColorways] = useState<ColorwayItem[]>([
    {
      id: "cw-1",
      name: "Raw Indigo",
      hex: "#1E293B",
      price: "195.00",
      originalPrice: "225.00",
      description:
        "Deep unwashed Japanese raw selvedge denim woven on vintage Toyoda shuttle looms. Features signature red selvedge ID line and develops personalized fade patterns with wear.",
      descriptions: [
        "Deep unwashed Japanese raw selvedge denim woven on vintage Toyoda shuttle looms.",
        "Features signature red selvedge ID line and develops personalized fade patterns with wear.",
        "Sanforized 13.5oz rigid cotton designed for authentic heritage draping."
      ],
      sizes: ["28", "29", "30", "31", "32", "33", "34", "36"],
      stock: "50",
      primaryImage:
        "https://images.unsplash.com/photo-1542272604-780c96856592?w=800&auto=format&fit=crop&q=80",
      hoverImage:
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80",
      galleryImages: [],
    },
    {
      id: "cw-2",
      name: "Vintage Washed Black",
      hex: "#1F1F1F",
      price: "185.00",
      originalPrice: "215.00",
      description:
        "Slightly faded charcoal black finish achieved through gentle volcanic pumice enzyme wash. Softened drape with subtle hand-scraping on thigh and pockets.",
      descriptions: [
        "Slightly faded charcoal black finish achieved through gentle volcanic pumice enzyme wash.",
        "Softened drape with subtle hand-scraping on thigh and pockets.",
        "Breathable all-season comfort with enduring dark tones."
      ],
      sizes: ["28", "29", "30", "31", "32", "34"],
      stock: "40",
      primaryImage:
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80",
      hoverImage:
        "https://images.unsplash.com/photo-1542272604-780c96856592?w=800&auto=format&fit=crop&q=80",
      galleryImages: [],
    },
  ]);

  // Which colorway is currently open in the editor form
  const [activeColorwayId, setActiveColorwayId] = useState<string>("cw-1");

  // SECTION 5: LIVE CARD PREVIEW INTERACTIVE STATE
  const [previewActiveSwatchId, setPreviewActiveSwatchId] = useState<string>("cw-1");
  const [previewHovered, setPreviewHovered] = useState(false);
  const [previewSelectedSize, setPreviewSelectedSize] = useState("");
  const [customSizeInput, setCustomSizeInput] = useState("");

  // IMAGE UPLOADING & DRAG AND DROP STATE
  const [uploadingTarget, setUploadingTarget] = useState<"primary" | "hover" | "gallery" | null>(null);
  const [isDragOverPrimary, setIsDragOverPrimary] = useState(false);
  const [isDragOverHover, setIsDragOverHover] = useState(false);
  const primaryFileInputRef = useRef<HTMLInputElement>(null);
  const hoverFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  // Backend queries
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getAll(),
  });

  const { data: dbBrands = [], isLoading: brandsLoading } = useQuery({
    queryKey: ["brands"],
    queryFn: () => brandService.getAll(),
  });

  const { data: dbCollections = [], isLoading: collectionsLoading } = useQuery({
    queryKey: ["collections"],
    queryFn: () => collectionService.getAll(),
  });

  // Ensure activeColorwayId is valid
  useEffect(() => {
    if (!colorways.some((cw) => cw.id === activeColorwayId) && colorways.length > 0) {
      setActiveColorwayId(colorways[0].id);
    }
  }, [colorways, activeColorwayId]);

  // When colorways reorder or 1st colorway changes, update preview default swatch
  useEffect(() => {
    if (colorways.length > 0 && !colorways.some((cw) => cw.id === previewActiveSwatchId)) {
      setPreviewActiveSwatchId(colorways[0].id);
    }
  }, [colorways, previewActiveSwatchId]);

  // Auto-generate handle/slug
  const handleTitleChange = (val: string) => {
    setTitle(val);
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setHandle(slug);
  };

  // Find category object
  const currentCategoryObj = useMemo(() => {
    return categories.find(
      (c) =>
        c.handle === selectedCategory ||
        c.slug === selectedCategory ||
        c.title === selectedCategory ||
        c.name === selectedCategory ||
        String(c.id) === selectedCategory
    );
  }, [categories, selectedCategory]);

  const availableSubcategories = useMemo(() => {
    return currentCategoryObj?.subcategories || [];
  }, [currentCategoryObj]);

  // Blueprint feature suggestions for current category
  const suggestedBlueprintFeatures = useMemo(() => {
    const catLower = (currentCategoryObj?.handle || selectedCategory || "").toLowerCase();
    for (const [key, features] of Object.entries(CATEGORY_FEATURE_BLUEPRINTS)) {
      if (catLower.includes(key)) return features;
    }
    return CATEGORY_FEATURE_BLUEPRINTS["tops"];
  }, [currentCategoryObj, selectedCategory]);

  // The active colorway currently being edited in the form
  const activeColorway = useMemo(() => {
    return colorways.find((cw) => cw.id === activeColorwayId) || colorways[0];
  }, [colorways, activeColorwayId]);

  // The swatch currently chosen on the Live Preview Card
  const cardPreviewColorway = useMemo(() => {
    return colorways.find((cw) => cw.id === previewActiveSwatchId) || colorways[0];
  }, [colorways, previewActiveSwatchId]);

  // Update a field on the currently active colorway
  const updateActiveColorway = (fields: Partial<ColorwayItem>) => {
    setColorways((prev) =>
      prev.map((cw) => (cw.id === activeColorway.id ? { ...cw, ...fields } : cw))
    );
  };

  // COLORWAY MANAGEMENT & REORDERING
  const moveColorway = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= colorways.length) return;
    const nextList = [...colorways];
    const [moved] = nextList.splice(fromIndex, 1);
    nextList.splice(toIndex, 0, moved);
    setColorways(nextList);
    if (toIndex === 0) {
      setPreviewActiveSwatchId(moved.id);
      toast.success(`"${moved.name}" is now the 1st / Default Colorway on the card!`);
    }
  };

  const setAsDefaultFirst = (colorwayId: string) => {
    const idx = colorways.findIndex((c) => c.id === colorwayId);
    if (idx > 0) {
      moveColorway(idx, 0);
    }
  };

  const addColorway = () => {
    const newId = `cw-${Date.now()}`;
    const newColorway: ColorwayItem = {
      id: newId,
      name: "New Colorway",
      hex: "#3F4E3A",
      price: activeColorway?.price || "185.00",
      originalPrice: activeColorway?.originalPrice || "215.00",
      description: "Artisan tailored colorway crafted with premium pigments and specialized wash techniques.",
      descriptions: [
        "Artisan tailored colorway crafted with premium pigments and specialized wash techniques."
      ],
      sizes: [...(activeColorway?.sizes || ["28", "29", "30", "31", "32"])],
      stock: "30",
      primaryImage: "https://images.unsplash.com/photo-1542272604-780c96856592?w=800",
      hoverImage: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800",
      galleryImages: [],
    };
    setColorways((prev) => [...prev, newColorway]);
    setActiveColorwayId(newId);
    toast.success("New colorway added. Configure its price, sizes, and images below.");
  };

  const removeColorway = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (colorways.length <= 1) {
      toast.error("A garment must have at least one colorway.");
      return;
    }
    const filtered = colorways.filter((cw) => cw.id !== id);
    setColorways(filtered);
    if (activeColorwayId === id) {
      setActiveColorwayId(filtered[0].id);
    }
    if (previewActiveSwatchId === id) {
      setPreviewActiveSwatchId(filtered[0].id);
    }
    toast.info("Colorway removed.");
  };

  // Multiple Descriptions for active colorway
  const activeDescriptions = useMemo(() => {
    if (activeColorway?.descriptions && activeColorway.descriptions.length > 0) {
      return activeColorway.descriptions;
    }
    if (activeColorway?.description) {
      return [activeColorway.description];
    }
    return [""];
  }, [activeColorway?.descriptions, activeColorway?.description]);

  const addDescriptionToActiveColorway = () => {
    const nextDescs = [...activeDescriptions, ""];
    updateActiveColorway({
      descriptions: nextDescs,
      description: nextDescs.filter(Boolean).join("\n\n")
    });
  };

  const updateColorwayDescriptionAt = (index: number, val: string) => {
    const nextDescs = [...activeDescriptions];
    nextDescs[index] = val;
    updateActiveColorway({
      descriptions: nextDescs,
      description: nextDescs.filter(Boolean).join("\n\n")
    });
  };

  const removeColorwayDescriptionAt = (index: number) => {
    if (activeDescriptions.length <= 1) {
      updateActiveColorway({
        descriptions: [""],
        description: ""
      });
      return;
    }
    const nextDescs = activeDescriptions.filter((_, i) => i !== index);
    updateActiveColorway({
      descriptions: nextDescs,
      description: nextDescs.filter(Boolean).join("\n\n")
    });
  };

  // ATELIER BRAND CRUD
  const allBrandOptions = useMemo(() => {
    const list = [...dbBrands];
    const defaultNames = ["Luma Threads", "Pistola Denim", "Atelier Studio"];
    defaultNames.forEach((def) => {
      if (!list.some((b: any) => b.name === def)) {
        list.push({
          id: def.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          name: def,
          slug: def.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          is_active: true,
        });
      }
    });
    return list;
  }, [dbBrands]);

  const handleCreateBrand = async () => {
    if (!newBrandInput.trim()) return;
    try {
      setIsSavingBrand(true);
      const created = await brandService.createBrand({ name: newBrandInput.trim() });
      await queryClient.invalidateQueries({ queryKey: ["brands"] });
      const brandName = created.name || newBrandInput.trim();
      setBrand(brandName);
      setNewBrandInput("");
      setIsAddingNewBrand(false);
      toast.success(`Brand "${brandName}" created successfully!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create brand.");
    } finally {
      setIsSavingBrand(false);
    }
  };

  const handleDeleteBrand = async () => {
    if (!brand) return;
    const brandObj = dbBrands.find((b: any) => b.name === brand || b.slug === brand);
    const slugToDelete = brandObj?.slug || brand.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    if (!window.confirm(`Are you sure you want to delete brand "${brand}"?`)) return;
    try {
      await brandService.deleteBrand(slugToDelete);
      await queryClient.invalidateQueries({ queryKey: ["brands"] });
      setBrand("Luma Threads");
      toast.success(`Brand "${brand}" deleted.`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete brand.");
    }
  };

  // MERCHANDISING BADGE CRUD
  const handleCreateBadge = () => {
    const trimmed = newBadgeTitle.trim().toUpperCase();
    if (!trimmed) return;
    if (!badges.includes(trimmed)) {
      setBadges((prev) => [...prev, trimmed]);
    }
    setBadge(trimmed);
    setNewBadgeTitle("");
    setShowAddBadgeInput(false);
    toast.success(`Merchandising badge "${trimmed}" added!`);
  };

  const handleDeleteBadge = (badgeToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBadges((prev) => prev.filter((b) => b !== badgeToDelete));
    if (badge === badgeToDelete) {
      setBadge("");
    }
    toast.info(`Badge "${badgeToDelete}" removed.`);
  };

  // GENDER / SILHOUETTE CRUD
  const handleCreateGender = () => {
    const trimmed = newGenderTitle.trim();
    if (!trimmed) return;
    if (!genderOptions.includes(trimmed)) {
      setGenderOptions((prev) => [...prev, trimmed]);
    }
    setGender(trimmed);
    setNewGenderTitle("");
    setShowAddGenderInput(false);
    toast.success(`Silhouette "${trimmed}" added!`);
  };

  const handleDeleteGender = (optToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (genderOptions.length <= 1) {
      toast.error("At least one silhouette option is required.");
      return;
    }
    const nextOptions = genderOptions.filter((g) => g !== optToDelete);
    setGenderOptions(nextOptions);
    if (gender === optToDelete) {
      setGender(nextOptions[0] || "");
    }
    toast.info(`Silhouette "${optToDelete}" removed.`);
  };

  // MULTIPLE IMAGES PER COLORWAY HELPERS
  const handleAddImageUrls = () => {
    if (!newImageUrlInput.trim()) return;
    const urls = newImageUrlInput
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    if (urls.length === 0) return;

    let nextPrimary = activeColorway.primaryImage;
    let nextHover = activeColorway.hoverImage;
    const nextGallery = [...(activeColorway.galleryImages || [])];

    urls.forEach((url) => {
      if (!nextPrimary) {
        nextPrimary = url;
      } else if (!nextHover) {
        nextHover = url;
      } else {
        nextGallery.push(url);
      }
    });

    updateActiveColorway({
      primaryImage: nextPrimary,
      hoverImage: nextHover,
      galleryImages: nextGallery,
    });

    setNewImageUrlInput("");
    setShowAddUrlInput(false);
    toast.success(`Added ${urls.length} picture(s) to ${activeColorway.name}!`);
  };

  const handleMultiFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      processImageFile(file, "gallery");
    });
    e.target.value = "";
  };

  const setAsPrimaryImage = (targetUrl: string) => {
    if (!targetUrl || targetUrl === activeColorway.primaryImage) return;
    const currentPrimary = activeColorway.primaryImage;
    const filteredGallery = (activeColorway.galleryImages || []).filter((u) => u !== targetUrl);
    const newGallery = currentPrimary ? [currentPrimary, ...filteredGallery] : filteredGallery;
    const newHover = activeColorway.hoverImage === targetUrl ? "" : activeColorway.hoverImage;

    updateActiveColorway({
      primaryImage: targetUrl,
      hoverImage: newHover,
      galleryImages: newGallery,
    });
    toast.success(`Set as main card swatch photo for ${activeColorway.name}!`);
  };

  const setAsHoverImage = (targetUrl: string) => {
    if (!targetUrl || targetUrl === activeColorway.hoverImage) return;
    const currentHover = activeColorway.hoverImage;
    const filteredGallery = (activeColorway.galleryImages || []).filter((u) => u !== targetUrl);
    const newGallery = currentHover ? [currentHover, ...filteredGallery] : filteredGallery;

    updateActiveColorway({
      hoverImage: targetUrl,
      galleryImages: newGallery,
    });
    toast.success(`Set as hover lookbook photo for ${activeColorway.name}!`);
  };

  const removeColorwayImage = (
    targetUrl: string,
    type: "primary" | "hover" | "gallery",
    galleryIndex?: number
  ) => {
    if (type === "primary") {
      updateActiveColorway({ primaryImage: "" });
      toast.info("Cleared primary image");
    } else if (type === "hover") {
      updateActiveColorway({ hoverImage: "" });
      toast.info("Cleared hover image");
    } else {
      const nextGallery = (activeColorway.galleryImages || []).filter(
        (u, idx) => (galleryIndex !== undefined ? idx !== galleryIndex : u !== targetUrl)
      );
      updateActiveColorway({ galleryImages: nextGallery });
      toast.info("Removed angle image");
    }
  };

  // CATEGORY & SUBCATEGORY CRUD
  const handleCreateCategory = async () => {
    if (!newCategoryTitle.trim()) return;
    try {
      setIsSavingCategory(true);
      const res = await categoryService.createCategory({ title: newCategoryTitle.trim() });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      const createdHandle = res.handle || res.slug || newCategoryTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
      setSelectedCategory(createdHandle);
      setSelectedSubCategory("");
      setNewCategoryTitle("");
      setShowAddCategoryInput(false);
      toast.success(`Category "${newCategoryTitle.trim()}" created!`);
    } catch (err) {
      toast.error("Failed to create category");
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    const catNameToDelete = currentCategoryObj?.title || selectedCategory;
    if (!window.confirm(`Are you sure you want to delete category "${catNameToDelete}"?`)) return;
    try {
      await categoryService.deleteCategory(currentCategoryObj?.id || selectedCategory);
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(`Category "${catNameToDelete}" deleted!`);
      const remaining = categories.filter((c: any) => (c.handle || c.slug || String(c.id)) !== selectedCategory);
      if (remaining.length > 0) {
        setSelectedCategory(remaining[0].handle || remaining[0].slug || String(remaining[0].id));
      } else {
        setSelectedCategory("");
      }
      setSelectedSubCategory("");
    } catch (err) {
      toast.error("Failed to delete category");
    }
  };

  const handleCreateSubCategory = async () => {
    if (!newSubCategoryTitle.trim()) return;
    try {
      setIsSavingSubCategory(true);
      const parentId = currentCategoryObj?.id || selectedCategory;
      const res = await categoryService.createSubCategory({
        title: newSubCategoryTitle.trim(),
        category_id: parentId
      });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      const createdHandle = res.handle || res.slug || newSubCategoryTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
      setSelectedSubCategory(createdHandle);
      setNewSubCategoryTitle("");
      setShowAddSubCategoryInput(false);
      toast.success(`SubCategory "${newSubCategoryTitle.trim()}" added to ${currentCategoryObj?.title || selectedCategory}!`);
    } catch (err) {
      toast.error("Failed to create subcategory");
    } finally {
      setIsSavingSubCategory(false);
    }
  };

  const handleDeleteSubCategory = async () => {
    if (!selectedSubCategory) return;
    const selectedSubObj = availableSubcategories.find((s: any) => (s.handle || s.slug || String(s.id)) === selectedSubCategory);
    const subTitle = selectedSubObj?.title || selectedSubCategory;
    if (!window.confirm(`Are you sure you want to delete subcategory "${subTitle}"?`)) return;
    try {
      await categoryService.deleteSubCategory(selectedSubObj?.id || selectedSubCategory);
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(`SubCategory "${subTitle}" deleted!`);
      setSelectedSubCategory("");
    } catch (err) {
      toast.error("Failed to delete subcategory");
    }
  };

  // COLLECTION CRUD
  const handleCreateCollection = async () => {
    if (!newCollectionTitle.trim()) return;
    try {
      setIsSavingCollection(true);
      const newCol = await collectionService.create(newCollectionTitle.trim());
      await queryClient.invalidateQueries({ queryKey: ["collections"] });
      const colKey = newCol.handle || newCol.slug || String(newCol.id);
      setSelectedCollections(prev => [...prev, colKey]);
      setNewCollectionTitle("");
      setShowAddCollectionInput(false);
      toast.success(`Collection "${newCol.title || newCollectionTitle.trim()}" created!`);
    } catch (err) {
      toast.error("Failed to create collection");
    } finally {
      setIsSavingCollection(false);
    }
  };

  const handleDeleteCollection = async (col: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const colName = col.title || col.name || "Collection";
    if (!window.confirm(`Are you sure you want to delete collection "${colName}"?`)) return;
    try {
      await collectionService.delete(col.id || col.handle);
      await queryClient.invalidateQueries({ queryKey: ["collections"] });
      const colKey = col.handle || col.slug || String(col.id);
      setSelectedCollections(prev => prev.filter(c => c !== colKey));
      toast.success(`Collection "${colName}" deleted!`);
    } catch (err) {
      toast.error("Failed to delete collection");
    }
  };

  // DENIM TAILORING SPECIFICATIONS ADD & DELETE
  const handleAddDenimSpec = (label?: string, value?: string) => {
    const specLabel = (label || newDenimSpecLabel).trim();
    const specValue = (value || newDenimSpecValue).trim() || "Standard";
    if (!specLabel) return;
    setDenimSpecs(prev => [
      ...prev,
      { id: `spec-${Date.now()}`, label: specLabel, value: specValue, type: "custom" }
    ]);
    setNewDenimSpecLabel("");
    setNewDenimSpecValue("");
    setShowAddDenimSpecInput(false);
    toast.success(`Tailoring specification "${specLabel}: ${specValue}" added!`);
  };

  const handleDeleteDenimSpec = (specId: string) => {
    setDenimSpecs(prev => prev.filter(s => s.id !== specId));
    toast.success("Tailoring specification removed.");
  };

  const handleUpdateDenimSpec = (specId: string, value: string) => {
    setDenimSpecs(prev => prev.map(s => s.id === specId ? { ...s, value } : s));
    const updated = denimSpecs.find(s => s.id === specId);
    if (updated?.type === "fit") setFit(value);
    if (updated?.type === "rise") setRise(value);
    if (updated?.type === "wash") setWash(value);
  };

  // Colorway-specific size toggle
  const toggleSizeForActiveColorway = (sz: string) => {
    if (!activeColorway) return;
    const currentSizes = activeColorway.sizes || [];
    if (currentSizes.includes(sz)) {
      if (currentSizes.length === 1) {
        toast.warning("This colorway must have at least one size.");
        return;
      }
      updateActiveColorway({ sizes: currentSizes.filter((s) => s !== sz) });
    } else {
      updateActiveColorway({ sizes: [...currentSizes, sz] });
    }
  };

  const applySizePresetToActiveColorway = (presetKey: keyof typeof SIZE_PRESETS) => {
    updateActiveColorway({ sizes: [...SIZE_PRESETS[presetKey].sizes] });
    toast.success(`Applied ${SIZE_PRESETS[presetKey].label} size preset to ${activeColorway.name}`);
  };

  const addCustomSizeToActiveColorway = () => {
    const trimmed = customSizeInput.trim().toUpperCase();
    if (!trimmed) return;
    const currentSizes = activeColorway.sizes || [];
    if (currentSizes.includes(trimmed)) {
      toast.error("Size already exists in this colorway");
      return;
    }
    updateActiveColorway({ sizes: [...currentSizes, trimmed] });
    setCustomSizeInput("");
  };

  // ROBUST IMAGE UPLOAD HANDLER WITH INSTANT PREVIEW & SERVER PERSISTENCE
  const processImageFile = async (file: File, target: "primary" | "hover" | "gallery") => {
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    // 1. Instant local preview via FileReader
    const reader = new FileReader();
    reader.onload = (e) => {
      const instantPreviewUrl = e.target?.result as string;
      if (target === "primary") {
        updateActiveColorway({ primaryImage: instantPreviewUrl });
      } else if (target === "hover") {
        updateActiveColorway({ hoverImage: instantPreviewUrl });
      } else {
        updateActiveColorway({
          galleryImages: [...(activeColorway.galleryImages || []), instantPreviewUrl],
        });
      }
    };
    reader.readAsDataURL(file);

    // 2. Upload to Django backend media storage in background
    try {
      setUploadingTarget(target);
      toast.info(`Uploading image to media server...`);
      const uploadedUrl = await uploadService.uploadImage(file, "products/garments");
      if (target === "primary") {
        updateActiveColorway({ primaryImage: uploadedUrl });
        toast.success(`Main studio photo uploaded for ${activeColorway.name}`);
      } else if (target === "hover") {
        updateActiveColorway({ hoverImage: uploadedUrl });
        toast.success(`Hover lookbook photo uploaded for ${activeColorway.name}`);
      } else {
        updateActiveColorway({
          galleryImages: [...(activeColorway.galleryImages || []).filter((u) => !u.startsWith("data:")), uploadedUrl],
        });
        toast.success(`Gallery photo added`);
      }
    } catch (err) {
      console.warn("Upload to backend storage warning, using local preview:", err);
      toast.success("Image applied to garment view.");
    } finally {
      setUploadingTarget(null);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, target: "primary" | "hover" | "gallery") => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (target === "gallery" && files.length > 1) {
      Array.from(files).forEach((f) => processImageFile(f, "gallery"));
    } else {
      processImageFile(files[0], target);
    }
    e.target.value = "";
  };

  // Drag and drop handlers
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, target: "primary" | "hover") => {
    e.preventDefault();
    e.stopPropagation();
    if (target === "primary") setIsDragOverPrimary(false);
    if (target === "hover") setIsDragOverHover(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file, target);
    }
  };

  // Category blueprint feature toggle
  const addBlueprintFeature = (feat: string) => {
    if (details.includes(feat)) {
      toast.info("Feature already added to this garment.");
      return;
    }
    setDetails((prev) => [...prev, feat]);
    toast.success(`Added blueprint: "${feat}"`);
  };

  const removeDetailBullet = (idx: number) => {
    setDetails(details.filter((_, i) => i !== idx));
  };

  const addCustomDetailBullet = () => {
    if (!newDetailInput.trim()) return;
    setDetails((prev) => [...prev, newDetailInput.trim()]);
    setNewDetailInput("");
  };

  // Form Submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a garment title");
      return;
    }

    if (colorways.length === 0) {
      toast.error("Please configure at least one colorway");
      return;
    }

    const defaultColorway = colorways[0];
    const defaultPrice = parseFloat(defaultColorway.price);
    if (isNaN(defaultPrice) || defaultPrice <= 0) {
      toast.error("Please specify a valid price for the 1st colorway");
      return;
    }

    if (!defaultColorway.primaryImage.trim()) {
      toast.error("Please provide a primary image for the 1st colorway");
      return;
    }

    setLoading(true);

    try {
      const colorVariantsPayload = colorways.map((cw) => ({
        color_name: cw.name.trim(),
        color_hex: cw.hex.trim(),
        price: parseFloat(cw.price) || defaultPrice,
        primary_image: cw.primaryImage.trim(),
        hover_image: (cw.hoverImage || cw.primaryImage).trim(),
        images: [
          cw.primaryImage.trim(),
          ...(cw.hoverImage ? [cw.hoverImage.trim()] : []),
          ...cw.galleryImages,
        ],
        sizes: cw.sizes,
        description: cw.description.trim(),
        descriptions: cw.descriptions && cw.descriptions.length > 0 ? cw.descriptions : [cw.description.trim()],
        stock: parseInt(cw.stock, 10) || 50,
      }));

      const swatchesPayload = colorways.map((cw) => ({
        name: cw.name.trim(),
        color: cw.hex.trim(),
        handle: handle.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        image: cw.primaryImage.trim(),
        hoverImage: (cw.hoverImage || cw.primaryImage).trim(),
        price: parseFloat(cw.price) || defaultPrice,
        priceFormatted: `$${(parseFloat(cw.price) || defaultPrice).toFixed(2)}`,
        sizes: cw.sizes,
        description: cw.description.trim(),
        descriptions: cw.descriptions && cw.descriptions.length > 0 ? cw.descriptions : [cw.description.trim()],
      }));

      const customSpecsDetails = denimSpecs.filter(s => s.type === "custom").map(s => `${s.label}: ${s.value}`);
      const finalDetails = Array.from(new Set([...details, ...customSpecsDetails]));

      const payload = {
        title: title.trim(),
        name: title.trim(),
        handle: handle.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        slug: handle.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        price: defaultPrice,
        image: defaultColorway.primaryImage.trim(),
        hover_image: (defaultColorway.hoverImage || defaultColorway.primaryImage).trim(),
        colorway: defaultColorway.name.trim(),
        color: defaultColorway.hex.trim(),
        sizes: defaultColorway.sizes,
        description: defaultColorway.description.trim(),
        category: selectedCategory,
        category_id: currentCategoryObj?.id || selectedCategory,
        subcategory: selectedSubCategory || undefined,
        subcategory_id: selectedSubCategory || undefined,
        collections: selectedCollections,
        brand: brand.trim(),
        brand_name: brand.trim(),
        badge: badge.trim(),
        details: finalDetails,
        size_and_fit: sizeAndFit.trim(),
        sizeAndFit: sizeAndFit.trim(),
        care: care.trim(),
        fit: fit,
        rise: isDenimOrBottoms ? rise : "",
        wash: isDenimOrBottoms ? wash : "",
        gender: gender,
        stock: parseInt(defaultColorway.stock, 10) || 50,
        is_active: isActive,
        is_featured: isFeatured,
        color_variants: colorVariantsPayload,
        swatches: swatchesPayload,
      };

      console.log("Submitting Color-First Garment to backend:", payload);
      const result = await productService.create(payload);

      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["brands"] });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });

      toast.success(`Garment "${title}" published with ${colorways.length} colorways!`);
      setTimeout(() => {
        navigate("/admin/products");
      }, 1200);
    } catch (err: any) {
      console.error("Failed to create product:", err);
      const errMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Failed to save garment to backend database";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const isDenimOrBottoms = useMemo(() => {
    const cat = selectedCategory.toLowerCase();
    return cat.includes("denim") || cat.includes("pant") || cat.includes("jean") || cat.includes("bottom");
  }, [selectedCategory]);

  return (
    <div className="flex-1 min-h-screen bg-muted/30 pb-28 lg:pb-16 text-foreground antialiased">
      {/* TOP STICKY BAR: ADAPTIVE TO ALL SCREEN SIZES */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border shadow-xs px-3 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="p-1.5 sm:p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground shrink-0"
            title="Back to products"
          >
            <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 sm:px-2 py-0.5 rounded-md truncate">
                Atelier Suite
              </span>
              <span className="text-[11px] sm:text-xs text-muted-foreground hidden sm:inline">• Add Garment</span>
            </div>
            <h1 className="text-sm sm:text-base lg:text-lg font-black tracking-tight truncate max-w-[180px] sm:max-w-md">
              {title || "Untitled Garment"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Mobile / Tablet Live Preview Button */}
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-border text-[11px] sm:text-xs font-bold hover:bg-muted transition-all lg:hidden"
          >
            <Eye size={14} />
            <span className="hidden xs:inline">Preview</span>
          </button>

          {/* Publish Button */}
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={loading}
            className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] sm:text-xs font-bold transition-all shadow-md shadow-blue-600/20 active:scale-95 disabled:opacity-50"
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{loading ? "Publishing..." : "Publish Garment"}</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER: RESPONSIVE SCREEN WIDTH */}
      <main className="w-full px-3 sm:px-6 lg:px-8 xl:px-12 pt-4 sm:pt-6 lg:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 xl:gap-10 items-start">
          
          {/* MAIN FORM: 7 COLS ON LAPTOPS, 8 ON DESKTOPS, FULL ON MOBILE */}
          <div className="lg:col-span-7 xl:col-span-7 2xl:col-span-8 space-y-6 sm:space-y-8 min-w-0">
            
            {/* SECTION 1: GARMENT IDENTIFICATION */}
            <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-7 shadow-xs space-y-5 sm:space-y-6">
              <div className="flex items-center gap-3 pb-3 sm:pb-4 border-b border-border">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                  <Shirt size={18} className="sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold">1. Garment Identification</h2>
                  <p className="text-[11px] sm:text-xs text-muted-foreground">
                    Title, atelier brand identity, gender silhouette, and merchandising badge
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Garment Name / Style Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Atelier Raw Selvedge Straight Jean"
                    className="w-full bg-muted/40 border border-border rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      URL Slug / Handle
                    </label>
                    <input
                      type="text"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      placeholder="atelier-raw-selvedge-jean"
                      className="w-full bg-muted/40 border border-border rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Atelier Brand
                      </label>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setIsAddingNewBrand(!isAddingNewBrand)}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-blue-500/10 transition-colors cursor-pointer"
                          title="Add New Brand"
                        >
                          <Plus size={11} />
                          <span>Add Brand</span>
                        </button>
                        {brand && (
                          <button
                            type="button"
                            onClick={handleDeleteBrand}
                            className="text-[10px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete Selected Brand"
                          >
                            <Trash2 size={11} />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {isAddingNewBrand && (
                      <div className="p-2.5 mb-2 bg-muted/60 border border-blue-500/30 rounded-xl space-y-2">
                        <span className="text-[11px] font-bold text-foreground">Create New Brand Identity</span>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newBrandInput}
                            onChange={(e) => setNewBrandInput(e.target.value)}
                            placeholder="Brand name (e.g. Atelier Craft Co., Heritage Studio)"
                            className="flex-1 bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-medium outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={handleCreateBrand}
                            disabled={isSavingBrand || !newBrandInput.trim()}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                          >
                            {isSavingBrand ? "Saving..." : "Save"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingNewBrand(false);
                              setNewBrandInput("");
                            }}
                            className="px-2 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    <select
                      data-testid="brand-select"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full bg-muted/40 border border-border rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-500/20 outline-none"
                    >
                      {allBrandOptions.map((b: any) => (
                        <option key={b.slug || b.name} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1 sm:pt-2">
                  <div>
                    <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Merchandising Badge
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowAddBadgeInput(!showAddBadgeInput)}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-blue-500/10 transition-colors cursor-pointer"
                        title="Add Custom Badge"
                      >
                        <Plus size={11} />
                        <span>Add Badge</span>
                      </button>
                    </div>

                    {showAddBadgeInput && (
                      <div className="p-2.5 mb-2 bg-muted/60 border border-blue-500/30 rounded-xl space-y-2">
                        <span className="text-[11px] font-bold text-foreground">Create Custom Merchandising Badge</span>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newBadgeTitle}
                            onChange={(e) => setNewBadgeTitle(e.target.value)}
                            placeholder="e.g. PRE-ORDER, ARCHIVE, CORE ESSENTIAL"
                            className="flex-1 bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-medium outline-none uppercase"
                          />
                          <button
                            type="button"
                            onClick={handleCreateBadge}
                            disabled={!newBadgeTitle.trim()}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddBadgeInput(false);
                              setNewBadgeTitle("");
                            }}
                            className="px-2 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1.5">
                      {badges.map((b) => {
                        const isSelected = badge === b;
                        return (
                          <div
                            key={b}
                            onClick={() => setBadge(isSelected ? "" : b)}
                            className={`group/badge relative flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider transition-all cursor-pointer border ${
                              isSelected
                                ? "bg-foreground text-background border-foreground shadow-xs font-black pr-6"
                                : "bg-muted text-muted-foreground hover:bg-muted/80 border-transparent pr-6"
                            }`}
                          >
                            <span>{b}</span>
                            <span
                              onClick={(e) => handleDeleteBadge(b, e)}
                              title={`Delete badge ${b}`}
                              className={`absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors cursor-pointer ${
                                isSelected ? "hover:bg-background/20 text-background/80 hover:text-background" : "hover:bg-rose-500/20 text-muted-foreground hover:text-rose-500"
                              }`}
                            >
                              <X size={10} />
                            </span>
                          </div>
                        );
                      })}
                      {badge && (
                        <button
                          type="button"
                          onClick={() => setBadge("")}
                          className="px-2 py-1 text-[9px] font-bold text-muted-foreground hover:text-rose-500 underline"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Gender / Silhouette
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowAddGenderInput(!showAddGenderInput)}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-blue-500/10 transition-colors cursor-pointer"
                        title="Add Silhouette"
                      >
                        <Plus size={11} />
                        <span>Add Silhouette</span>
                      </button>
                    </div>

                    {showAddGenderInput && (
                      <div className="p-2.5 mb-2 bg-muted/60 border border-blue-500/30 rounded-xl space-y-2">
                        <span className="text-[11px] font-bold text-foreground">Add Custom Gender / Silhouette</span>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newGenderTitle}
                            onChange={(e) => setNewGenderTitle(e.target.value)}
                            placeholder="e.g. Kids, Oversized Fit, Petite, Tall, Gender-Neutral"
                            className="flex-1 bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-medium outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleCreateGender}
                            disabled={!newGenderTitle.trim()}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddGenderInput(false);
                              setNewGenderTitle("");
                            }}
                            className="px-2 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {genderOptions.map((g) => {
                        const isSelected = gender === g;
                        return (
                          <div
                            key={g}
                            onClick={() => setGender(g)}
                            className={`group/gender relative flex items-center justify-between py-1.5 sm:py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                              isSelected
                                ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/20 pr-7"
                                : "bg-muted/30 border-border text-muted-foreground hover:bg-muted pr-7"
                            }`}
                          >
                            <span>{g}</span>
                            <span
                              onClick={(e) => handleDeleteGender(g, e)}
                              title={`Delete silhouette ${g}`}
                              className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors cursor-pointer ${
                                isSelected ? "hover:bg-blue-700 text-white/80 hover:text-white" : "hover:bg-rose-500/20 text-muted-foreground hover:text-rose-500"
                              }`}
                            >
                              <X size={11} />
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-3 border-t border-border/60">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-blue-600 focus:ring-blue-500/20"
                    />
                    <span className="text-xs font-bold">Catalog Live (Active for customer purchases)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-blue-600 focus:ring-blue-500/20"
                    />
                    <span className="text-xs font-bold">Feature on Homepage Spotlight</span>
                  </label>
                </div>
              </div>
            </div>

            {/* SECTION 2: APPAREL CATEGORY, COLLECTIONS & FEATURE BLUEPRINT */}
            <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-7 shadow-xs space-y-5 sm:space-y-6">
              <div className="flex items-center gap-3 pb-3 sm:pb-4 border-b border-border">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                  <Layers size={18} className="sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold">2. Apparel Category, Collections & Features</h2>
                  <p className="text-[11px] sm:text-xs text-muted-foreground">
                    Taxonomy hierarchy and category-specific blueprint specification chips
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Primary Apparel Category <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowAddCategoryInput(!showAddCategoryInput)}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-blue-500/10 transition-colors cursor-pointer"
                        title="Add New Category"
                      >
                        <Plus size={11} />
                        <span>Add Category</span>
                      </button>
                      {selectedCategory && (
                        <button
                          type="button"
                          onClick={handleDeleteCategory}
                          className="text-[10px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete Selected Category"
                        >
                          <Trash2 size={11} />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {showAddCategoryInput && (
                    <div className="p-2.5 mb-2 bg-muted/60 border border-blue-500/30 rounded-xl space-y-2">
                      <span className="text-[11px] font-bold text-foreground">Create New Category</span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Category name (e.g. Knitwear, Suits)"
                          value={newCategoryTitle}
                          onChange={(e) => setNewCategoryTitle(e.target.value)}
                          className="flex-1 bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-medium outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={handleCreateCategory}
                          disabled={isSavingCategory || !newCategoryTitle.trim()}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                        >
                          {isSavingCategory ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setShowAddCategoryInput(false); setNewCategoryTitle(""); }}
                          className="px-2 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setSelectedSubCategory("");
                    }}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-bold focus:ring-2 focus:ring-blue-500/20 outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat.handle || cat.slug || cat.id} value={cat.handle || cat.slug || String(cat.id)}>
                        {cat.title || cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      SubCategory Cut / Style
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowAddSubCategoryInput(!showAddSubCategoryInput)}
                        className="text-[10px] font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-purple-500/10 transition-colors cursor-pointer"
                        title={`Add SubCategory to ${currentCategoryObj?.title || selectedCategory}`}
                      >
                        <Plus size={11} />
                        <span>Add SubCategory</span>
                      </button>
                      {selectedSubCategory && (
                        <button
                          type="button"
                          onClick={handleDeleteSubCategory}
                          className="text-[10px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete Selected SubCategory"
                        >
                          <Trash2 size={11} />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {showAddSubCategoryInput && (
                    <div className="p-2.5 mb-2 bg-muted/60 border border-purple-500/30 rounded-xl space-y-2">
                      <span className="text-[11px] font-bold text-foreground">
                        Add SubCategory to {currentCategoryObj?.title || selectedCategory}
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="SubCategory name (e.g. Bootcut, Oversized)"
                          value={newSubCategoryTitle}
                          onChange={(e) => setNewSubCategoryTitle(e.target.value)}
                          className="flex-1 bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-medium outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        <button
                          type="button"
                          onClick={handleCreateSubCategory}
                          disabled={isSavingSubCategory || !newSubCategoryTitle.trim()}
                          className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 disabled:opacity-50 cursor-pointer"
                        >
                          {isSavingSubCategory ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setShowAddSubCategoryInput(false); setNewSubCategoryTitle(""); }}
                          className="px-2 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <select
                    value={selectedSubCategory}
                    onChange={(e) => setSelectedSubCategory(e.target.value)}
                    disabled={availableSubcategories.length === 0}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-500/20 outline-none disabled:opacity-50"
                  >
                    <option value="">Select subcategory...</option>
                    {availableSubcategories.map((sub: any) => (
                      <option key={sub.handle || sub.slug || sub.id} value={sub.handle || sub.slug || String(sub.id)}>
                        {sub.title || sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Collections Multi-Select */}
              <div>
                <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Curated Collections Drops
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddCollectionInput(!showAddCollectionInput)}
                    className="text-[10px] font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-purple-500/10 transition-colors cursor-pointer"
                    title="Add New Collection"
                  >
                    <Plus size={11} />
                    <span>Add Collection</span>
                  </button>
                </div>

                {showAddCollectionInput && (
                  <div className="p-2.5 mb-3 bg-muted/60 border border-purple-500/30 rounded-xl space-y-2">
                    <span className="text-[11px] font-bold text-foreground">Create New Collection Drop</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Collection name (e.g. Summer Capsule '26, Vintage Edition)"
                        value={newCollectionTitle}
                        onChange={(e) => setNewCollectionTitle(e.target.value)}
                        className="flex-1 bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-medium outline-none focus:ring-1 focus:ring-purple-500"
                      />
                      <button
                        type="button"
                        onClick={handleCreateCollection}
                        disabled={isSavingCollection || !newCollectionTitle.trim()}
                        className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 disabled:opacity-50 cursor-pointer"
                      >
                        {isSavingCollection ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowAddCollectionInput(false); setNewCollectionTitle(""); }}
                        className="px-2 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {dbCollections.map((col) => {
                    const colKey = col.handle || col.slug || String(col.id);
                    const isSelected = selectedCollections.includes(colKey);
                    return (
                      <button
                        key={col.handle || col.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedCollections(selectedCollections.filter((c) => c !== colKey));
                          } else {
                            setSelectedCollections([...selectedCollections, colKey]);
                          }
                        }}
                        className={`group/chip relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all border cursor-pointer ${
                          isSelected
                            ? "bg-purple-600 text-white border-purple-600 shadow-xs pr-7"
                            : "bg-muted/40 border-border text-muted-foreground hover:bg-muted pr-7"
                        }`}
                      >
                        {isSelected && <Check size={12} />}
                        <span>{col.title || col.name}</span>
                        <span
                          onClick={(e) => handleDeleteCollection(col, e)}
                          title={`Delete collection ${col.title || col.name}`}
                          className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md transition-colors cursor-pointer ${
                            isSelected ? "hover:bg-purple-700 text-white/80 hover:text-white" : "hover:bg-rose-500/20 text-muted-foreground hover:text-rose-500"
                          }`}
                        >
                          <X size={12} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Specification Blueprints */}
              <div className="pt-2 border-t border-border/60 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Category Features Blueprint (Click to Add)
                  </label>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Tailored for {currentCategoryObj?.title || selectedCategory}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {suggestedBlueprintFeatures.map((feat) => {
                    const isAdded = details.includes(feat);
                    return (
                      <button
                        key={feat}
                        type="button"
                        onClick={() => addBlueprintFeature(feat)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-semibold transition-all border ${
                          isAdded
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                            : "bg-muted/30 border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                        }`}
                      >
                        {isAdded ? <Check size={11} className="text-emerald-500" /> : <Plus size={11} />}
                        <span>{feat}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Active Features List */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-foreground">
                    Active Garment Craftsmanship Specs ({details.length})
                  </span>
                  <div className="space-y-1.5">
                    {details.map((d, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-muted/30 border border-border rounded-xl px-3 py-1.5 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Check size={13} className="text-emerald-500 shrink-0" />
                          <span className="font-medium">{d}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDetailBullet(idx)}
                          className="text-muted-foreground hover:text-rose-500 p-1 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={newDetailInput}
                      onChange={(e) => setNewDetailInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCustomDetailBullet();
                        }
                      }}
                      placeholder="Add custom feature (e.g. 100% GOTS Organic Cotton, Made in Japan)..."
                      className="flex-1 bg-muted/40 border border-border rounded-xl px-3 py-2 text-xs outline-none"
                    />
                    <button
                      type="button"
                      onClick={addCustomDetailBullet}
                      className="px-3 sm:px-3.5 py-2 rounded-xl bg-accent text-xs font-bold border border-border hover:bg-accent/80 shrink-0"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Denim / Bottoms Tailoring Specs */}
              {isDenimOrBottoms && (
                <div className="pt-2 border-t border-border/60 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Denim Tailoring Specifications ({denimSpecs.length})
                      </label>
                      <span className="text-[10px] text-muted-foreground">
                        Configure fit silhouette, waist rise, wash finish, and custom tailoring specs (add & delete)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddDenimSpecInput(!showAddDenimSpecInput)}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors cursor-pointer"
                    >
                      <Plus size={12} />
                      <span>+ Add Tailoring Spec</span>
                    </button>
                  </div>

                  {showAddDenimSpecInput && (
                    <div className="p-3 bg-muted/60 border border-blue-500/30 rounded-xl space-y-2">
                      <span className="text-[11px] font-bold text-foreground">Add Custom Denim Specification</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Spec Name (e.g. Inseam, Leg Opening, Stretch)"
                          value={newDenimSpecLabel}
                          onChange={(e) => setNewDenimSpecLabel(e.target.value)}
                          className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-medium outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Spec Value (e.g. 32 Inch, 16.5 Inch, 2% Stretch)"
                          value={newDenimSpecValue}
                          onChange={(e) => setNewDenimSpecValue(e.target.value)}
                          className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-medium outline-none"
                        />
                      </div>
                      <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                        <div className="flex gap-1.5 flex-wrap items-center">
                          <span className="text-[10px] text-muted-foreground font-semibold">Quick Add:</span>
                          {[
                            { label: "Inseam Length", value: "32 Inch" },
                            { label: "Leg Opening", value: "16.5 Inch" },
                            { label: "Selvedge ID", value: "Red Line ID" },
                            { label: "Hardware", value: "Antiqued Copper" },
                            { label: "Fabric Weight", value: "13.5 oz Raw Rigid" },
                          ].map(quick => (
                            <button
                              key={quick.label}
                              type="button"
                              onClick={() => handleAddDenimSpec(quick.label, quick.value)}
                              className="px-1.5 py-0.5 text-[9px] font-bold bg-background border border-border rounded hover:bg-muted text-muted-foreground cursor-pointer"
                            >
                              + {quick.label}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleAddDenimSpec()}
                            disabled={!newDenimSpecLabel.trim()}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                          >
                            Save Spec
                          </button>
                          <button
                            type="button"
                            onClick={() => { setShowAddDenimSpecInput(false); setNewDenimSpecLabel(""); setNewDenimSpecValue(""); }}
                            className="px-2 py-1 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                    {denimSpecs.map((spec) => (
                      <div key={spec.id} className="p-3 bg-muted/40 border border-border rounded-xl space-y-1.5 relative group">
                        <div className="flex items-center justify-between">
                          <span className="block text-[11px] font-bold text-muted-foreground truncate">{spec.label}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteDenimSpec(spec.id)}
                            className="text-muted-foreground hover:text-rose-500 p-1 rounded-md hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title={`Delete ${spec.label}`}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        {spec.type === "fit" ? (
                          <select
                            value={spec.value}
                            onChange={(e) => handleUpdateDenimSpec(spec.id, e.target.value)}
                            className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none"
                          >
                            {FIT_OPTIONS.map((f) => (
                              <option key={f} value={f}>{f}</option>
                            ))}
                          </select>
                        ) : spec.type === "rise" ? (
                          <select
                            value={spec.value}
                            onChange={(e) => handleUpdateDenimSpec(spec.id, e.target.value)}
                            className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none"
                          >
                            {RISE_OPTIONS.map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        ) : spec.type === "wash" ? (
                          <select
                            value={spec.value}
                            onChange={(e) => handleUpdateDenimSpec(spec.id, e.target.value)}
                            className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none"
                          >
                            {WASH_OPTIONS.map((w) => (
                              <option key={w} value={w}>{w}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={spec.value}
                            onChange={(e) => handleUpdateDenimSpec(spec.id, e.target.value)}
                            className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 3: COLOR-FIRST ARCHITECTURE & IMAGE UPLOADER */}
            <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-7 shadow-xs space-y-5 sm:space-y-6">
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-border flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                    <Palette size={18} className="sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold">3. Color-First Architecture & Image Uploader</h2>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">
                      Upload images and configure color-dependent prices, sizes, and descriptions
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addColorway}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <Plus size={14} />
                  <span>+ Add Colorway</span>
                </button>
              </div>

              {/* COLORWAYS MANAGER BAR */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-muted-foreground">
                    Colorways ({colorways.length}) — Drag / Move to set Default Card View
                  </span>
                  <span className="text-[10px] text-muted-foreground hidden sm:inline">
                    1st colorway is default on card
                  </span>
                </div>

                {/* Colorway Pills with Reordering */}
                <div className="space-y-2">
                  {colorways.map((cw, idx) => {
                    const isEditing = cw.id === activeColorway.id;
                    const isFirstDefault = idx === 0;

                    return (
                      <div
                        key={cw.id}
                        data-testid={`colorway-row-${cw.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                        onClick={() => setActiveColorwayId(cw.id)}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer gap-2.5 ${
                          isEditing
                            ? "bg-blue-500/10 border-blue-500 shadow-xs ring-1 ring-blue-500"
                            : "bg-muted/20 border-border hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Color Swatch Dot */}
                          <div
                            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-black/20 shrink-0 shadow-xs"
                            style={{ backgroundColor: cw.hex }}
                          />

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-foreground truncate">{cw.name}</span>
                              {isFirstDefault && (
                                <span className="bg-amber-500/15 text-amber-600 text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                                  <Star size={9} className="fill-amber-500" />
                                  1st (Default on Card)
                                </span>
                              )}
                              {isEditing && (
                                <span className="bg-blue-500/15 text-blue-600 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md shrink-0">
                                  Editing
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-muted-foreground pt-0.5 truncate">
                              <span className="font-mono">{cw.hex}</span>
                              <span>•</span>
                              <span className="font-bold text-foreground">${parseFloat(cw.price || "0").toFixed(2)}</span>
                              <span>•</span>
                              <span>{cw.sizes.length} sizes</span>
                            </div>
                          </div>
                        </div>

                        {/* Reordering Controls */}
                        <div className="flex items-center gap-1 self-end sm:self-auto" onClick={(e) => e.stopPropagation()}>
                          {!isFirstDefault && (
                            <button
                              type="button"
                              onClick={() => setAsDefaultFirst(cw.id)}
                              className="px-2 py-1 text-[10px] font-bold rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition-colors mr-1"
                              title="Set as 1st (Default card view)"
                            >
                              ★ Set as 1st
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveColorway(idx, idx - 1)}
                            className="p-1 sm:p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move Up"
                          >
                            <ArrowUp size={12} className="sm:w-3.5 sm:h-3.5" />
                          </button>

                          <button
                            type="button"
                            disabled={idx === colorways.length - 1}
                            onClick={() => moveColorway(idx, idx + 1)}
                            className="p-1 sm:p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move Down (Drack down)"
                          >
                            <ArrowDown size={12} className="sm:w-3.5 sm:h-3.5" />
                          </button>

                          {colorways.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => removeColorway(cw.id, e)}
                              className="p-1 sm:p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors ml-1"
                              title="Delete colorway"
                            >
                              <Trash2 size={12} className="sm:w-3.5 sm:h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ACTIVE COLORWAY SPECIFICATION EDITOR */}
              <div className="bg-muted/30 border border-border rounded-2xl p-4 sm:p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-border flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full border border-black/20"
                      style={{ backgroundColor: activeColorway.hex }}
                    />
                    <h3 className="text-xs sm:text-sm font-bold">
                      Configuring: <span className="text-blue-600">{activeColorway.name}</span>
                    </h3>
                  </div>
                  <span className="text-[11px] sm:text-xs font-mono text-muted-foreground">
                    Hex: {activeColorway.hex}
                  </span>
                </div>

                {/* Color Name & Hex Swatch */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Colorway Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={activeColorway.name}
                      onChange={(e) => updateActiveColorway({ name: e.target.value })}
                      placeholder="e.g. Washed Indigo"
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Swatch Hex Value
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={activeColorway.hex}
                        onChange={(e) => updateActiveColorway({ hex: e.target.value })}
                        className="w-9 h-9 rounded-xl cursor-pointer border border-border bg-transparent p-0.5"
                      />
                      <input
                        type="text"
                        value={activeColorway.hex}
                        onChange={(e) => updateActiveColorway({ hex: e.target.value })}
                        className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Fashion Palette presets */}
                <div>
                  <span className="block text-[11px] font-semibold text-muted-foreground mb-1.5">
                    Fashion Presets (Click to apply to this colorway):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {FASHION_PALETTE.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => updateActiveColorway({ name: p.name, hex: p.hex })}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-background border border-border hover:border-primary text-[10px] font-bold transition-all"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/20"
                          style={{ backgroundColor: p.hex }}
                        />
                        <span>{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dependent Price & Stock for this specific color */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2 border-t border-border/60">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Price for this Color ($) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xs">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={activeColorway.price}
                        onChange={(e) => updateActiveColorway({ price: e.target.value })}
                        placeholder="195.00"
                        className="w-full bg-background border border-border rounded-xl pl-7 pr-3 py-2 text-xs font-bold outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Compare-At Price ($)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xs">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={activeColorway.originalPrice}
                        onChange={(e) => updateActiveColorway({ originalPrice: e.target.value })}
                        placeholder="225.00"
                        className="w-full bg-background border border-border rounded-xl pl-7 pr-3 py-2 text-xs font-medium outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Inventory Count
                    </label>
                    <input
                      type="number"
                      value={activeColorway.stock}
                      onChange={(e) => updateActiveColorway({ stock: e.target.value })}
                      placeholder="50"
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-medium outline-none"
                    />
                  </div>
                </div>

                {/* Dependent Descriptions for this specific color (Multiple Descriptions) */}
                <div className="space-y-3 pt-2 border-t border-border/60">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                          Descriptions & Wash Stories for {activeColorway.name}
                        </label>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                          {activeDescriptions.length} {activeDescriptions.length === 1 ? "note" : "notes"}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Write multiple distinct description notes, dye processes, or wash stories specifically for {activeColorway.name}.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={addDescriptionToActiveColorway}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Description Note
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {activeDescriptions.map((descText, dIdx) => (
                      <div
                        key={dIdx}
                        className="p-3 rounded-xl border border-border bg-card/60 space-y-1.5 transition-all focus-within:border-primary/50"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold text-foreground">
                              {dIdx + 1}
                            </span>
                            Description Note #{dIdx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeColorwayDescriptionAt(dIdx)}
                            className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors cursor-pointer"
                            title="Remove this note"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          value={descText}
                          onChange={(e) => updateColorwayDescriptionAt(dIdx, e.target.value)}
                          placeholder={`Description note #${dIdx + 1} for ${activeColorway.name} (e.g., Japanese Kurabo denim, rope-dyed indigo, unique wear-in characteristics)...`}
                          className="w-full bg-background border border-border rounded-lg p-2.5 text-xs font-medium outline-none resize-y leading-relaxed focus:border-primary"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sizing Matrix for this specific color */}
                <div className="space-y-3 pt-2 border-t border-border/60">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Available Sizes for {activeColorway.name} ({activeColorway.sizes.length})
                      </label>
                    </div>

                    <div className="flex gap-1 flex-wrap">
                      {(Object.keys(SIZE_PRESETS) as (keyof typeof SIZE_PRESETS)[]).map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => applySizePresetToActiveColorway(key)}
                          className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-background hover:bg-muted text-muted-foreground border border-border"
                        >
                          {SIZE_PRESETS[key].label.split(" ")[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Size buttons */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {["XS", "S", "M", "L", "XL", "XXL", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "36", "O/S"].map(
                      (sz) => {
                        const isSelected = activeColorway.sizes.includes(sz);
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => toggleSizeForActiveColorway(sz)}
                            className={`min-w-[36px] sm:min-w-[42px] h-8 sm:h-9 px-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center ${
                              isSelected
                                ? "bg-foreground text-background border-foreground shadow-xs font-black scale-105"
                                : "bg-background border-border text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      }
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <input
                      type="text"
                      value={customSizeInput}
                      onChange={(e) => setCustomSizeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCustomSizeToActiveColorway();
                        }
                      }}
                      placeholder="Custom size (38, 40R)..."
                      className="w-36 sm:w-44 bg-background border border-border rounded-xl px-3 py-1.5 text-xs outline-none"
                    />
                    <button
                      type="button"
                      onClick={addCustomSizeToActiveColorway}
                      className="px-3 py-1.5 rounded-xl bg-accent text-xs font-bold border border-border hover:bg-accent/80"
                    >
                      + Add
                    </button>
                    <span className="text-[11px] text-muted-foreground ml-1 truncate">
                      Active: <strong className="text-foreground">{activeColorway.sizes.join(", ")}</strong>
                    </span>
                  </div>
                </div>

                {/* ADVANCED IMAGE UPLOAD SUITE FOR THIS COLORWAY (MULTIPLE PICTURE ADD FEATURE) */}
                <div className="space-y-4 pt-3 border-t border-border/60">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Imagery for {activeColorway.name} (Shown on Card Swatch Selection)
                        </label>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-bold">
                          {[
                            activeColorway.primaryImage,
                            activeColorway.hoverImage,
                            ...(activeColorway.galleryImages || []),
                          ].filter(Boolean).length}{" "}
                          pictures
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Add multiple pictures, upload files in bulk, paste image URLs, or drag & drop photos for this colorway.
                      </p>
                    </div>

                    {/* Multiple Pictures & Quick Sample Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => multiFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
                        title="Upload multiple pictures at once"
                      >
                        <Plus size={12} />
                        <span>Add Pictures (Multiple)</span>
                      </button>
                      <input
                        ref={multiFileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleMultiFileInputChange}
                      />

                      <button
                        type="button"
                        onClick={() => setShowAddUrlInput(!showAddUrlInput)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-xl bg-muted border border-border text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                        title="Paste single or multiple image URLs"
                      >
                        <FileImage size={12} />
                        <span>Paste URL(s)</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-muted-foreground font-semibold hidden sm:inline">Samples:</span>
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              updateActiveColorway({ primaryImage: e.target.value });
                              toast.success("Applied sample studio photo");
                            }
                          }}
                          className="bg-background border border-border rounded-lg px-2 py-1 text-[10px] font-semibold outline-none"
                          defaultValue=""
                        >
                          <option value="" disabled>
                            Pick Sample Photo...
                          </option>
                          {SAMPLE_FASHION_PHOTOS.map((p) => (
                            <option key={p.label} value={p.url}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Multiple Picture URLs Input Form */}
                  {showAddUrlInput && (
                    <div className="p-3 bg-muted/60 border border-blue-500/30 rounded-xl space-y-2">
                      <span className="text-[11px] font-bold text-foreground">
                        Add Picture URL(s) to {activeColorway.name}
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newImageUrlInput}
                          onChange={(e) => setNewImageUrlInput(e.target.value)}
                          placeholder="Paste image URL (or multiple URLs separated by commas)..."
                          className="flex-1 bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-medium outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddImageUrls}
                          disabled={!newImageUrlInput.trim()}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                        >
                          Add Picture(s)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddUrlInput(false);
                            setNewImageUrlInput("");
                          }}
                          className="px-2 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* VISUAL MULTIPLE PICTURES GALLERY FOR THIS COLORWAY */}
                  {(() => {
                    const allPics: { url: string; type: "primary" | "hover" | "gallery"; idx?: number }[] = [];
                    if (activeColorway.primaryImage) {
                      allPics.push({ url: activeColorway.primaryImage, type: "primary" });
                    }
                    if (activeColorway.hoverImage && activeColorway.hoverImage !== activeColorway.primaryImage) {
                      allPics.push({ url: activeColorway.hoverImage, type: "hover" });
                    }
                    (activeColorway.galleryImages || []).forEach((img, i) => {
                      if (img && img !== activeColorway.primaryImage && img !== activeColorway.hoverImage) {
                        allPics.push({ url: img, type: "gallery", idx: i });
                      }
                    });

                    if (allPics.length === 0) return null;

                    return (
                      <div className="space-y-2 pt-1 bg-card/50 border border-border rounded-xl p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                            Colorway Gallery for {activeColorway.name} ({allPics.length} pictures)
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Hover on any photo to set as Primary (shown on Card Swatch) or remove
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                          {allPics.map((pic, pIdx) => (
                            <div
                              key={`${pic.url}-${pIdx}`}
                              className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-border bg-background shadow-xs hover:border-blue-500/50 transition-all"
                            >
                              <img
                                src={pic.url}
                                alt={`${activeColorway.name} view ${pIdx + 1}`}
                                className="w-full h-full object-cover"
                              />

                              {/* Badges */}
                              <div className="absolute top-1.5 left-1.5 right-1.5 flex flex-wrap gap-1">
                                {pic.type === "primary" ? (
                                  <span className="bg-blue-600 text-white text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                                    <Star size={8} className="fill-white" /> Primary (Card Swatch)
                                  </span>
                                ) : pic.type === "hover" ? (
                                  <span className="bg-purple-600 text-white text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm">
                                    Hover Rollover
                                  </span>
                                ) : (
                                  <span className="bg-black/60 backdrop-blur-xs text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                    Angle #{pIdx + 1}
                                  </span>
                                )}
                              </div>

                              {/* Hover Actions Controls */}
                              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 gap-1.5 text-center">
                                {pic.type !== "primary" && (
                                  <button
                                    type="button"
                                    onClick={() => setAsPrimaryImage(pic.url)}
                                    className="w-full py-1 px-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[9px] font-bold transition-colors cursor-pointer"
                                  >
                                    ★ Make Primary (Card Swatch)
                                  </button>
                                )}
                                {pic.type !== "hover" && (
                                  <button
                                    type="button"
                                    onClick={() => setAsHoverImage(pic.url)}
                                    className="w-full py-1 px-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[9px] font-bold transition-colors cursor-pointer"
                                  >
                                    Make Hover Shot
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => removeColorwayImage(pic.url, pic.type, pic.idx)}
                                  className="w-full py-1 px-1 bg-rose-600/90 hover:bg-rose-700 text-white rounded text-[9px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Trash2 size={10} /> Delete Picture
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* 1. PRIMARY STUDIO IMAGE UPLOAD BOX */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                          Primary Studio Image <span className="text-rose-500">*</span>
                        </span>
                        {activeColorway.primaryImage && (
                          <button
                            type="button"
                            onClick={() => updateActiveColorway({ primaryImage: "" })}
                            className="text-[10px] text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 size={10} /> Clear
                          </button>
                        )}
                      </div>

                      {/* Dropzone container */}
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragOverPrimary(true);
                        }}
                        onDragLeave={() => setIsDragOverPrimary(false)}
                        onDrop={(e) => handleDrop(e, "primary")}
                        onClick={() => primaryFileInputRef.current?.click()}
                        className={`aspect-[3/4] rounded-2xl border-2 border-dashed transition-all relative overflow-hidden flex flex-col items-center justify-center cursor-pointer group ${
                          isDragOverPrimary
                            ? "border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/20"
                            : "border-border hover:border-blue-500/50 bg-background hover:bg-muted/30"
                        }`}
                      >
                        {activeColorway.primaryImage ? (
                          <>
                            <img
                              src={activeColorway.primaryImage}
                              alt="Primary"
                              className="w-full h-full object-cover"
                            />
                            {/* Overlay Controls */}
                            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 text-white text-center gap-2">
                              <Upload size={22} className="animate-bounce" />
                              <span className="text-xs font-bold">Click or Drop to Replace</span>
                              <span className="text-[10px] text-white/80">Supports PNG, JPG, WEBP</span>
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-4 space-y-2">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 mx-auto flex items-center justify-center">
                              <Upload size={20} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-foreground">Click to upload photo</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">or drag and drop here</p>
                            </div>
                            <span className="inline-block text-[9px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-mono">
                              Max 10MB
                            </span>
                          </div>
                        )}

                        {uploadingTarget === "primary" && (
                          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white gap-2">
                            <RefreshCw size={24} className="animate-spin text-blue-400" />
                            <span className="text-xs font-bold">Uploading to media storage...</span>
                          </div>
                        )}

                        {/* Hidden input */}
                        <input
                          ref={primaryFileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileInputChange(e, "primary")}
                        />
                      </div>

                      {/* URL input fallback */}
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={activeColorway.primaryImage}
                          onChange={(e) => updateActiveColorway({ primaryImage: e.target.value })}
                          placeholder="Or paste external image URL..."
                          className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-[11px] font-mono outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => primaryFileInputRef.current?.click()}
                          className="px-2.5 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold shrink-0 hover:bg-blue-700 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Upload file"
                        >
                          <Upload size={12} />
                          <span className="hidden xs:inline">Upload</span>
                        </button>
                      </div>
                    </div>

                    {/* 2. HOVER LOOKBOOK IMAGE UPLOAD BOX */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                          Hover Lookbook Shot (Rollover)
                        </span>
                        {activeColorway.hoverImage && (
                          <button
                            type="button"
                            onClick={() => updateActiveColorway({ hoverImage: "" })}
                            className="text-[10px] text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 size={10} /> Clear
                          </button>
                        )}
                      </div>

                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragOverHover(true);
                        }}
                        onDragLeave={() => setIsDragOverHover(false)}
                        onDrop={(e) => handleDrop(e, "hover")}
                        onClick={() => hoverFileInputRef.current?.click()}
                        className={`aspect-[3/4] rounded-2xl border-2 border-dashed transition-all relative overflow-hidden flex flex-col items-center justify-center cursor-pointer group ${
                          isDragOverHover
                            ? "border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/20"
                            : "border-border hover:border-blue-500/50 bg-background hover:bg-muted/30"
                        }`}
                      >
                        {activeColorway.hoverImage ? (
                          <>
                            <img
                              src={activeColorway.hoverImage}
                              alt="Hover"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 text-white text-center gap-2">
                              <Upload size={22} className="animate-bounce" />
                              <span className="text-xs font-bold">Click or Drop to Replace</span>
                              <span className="text-[10px] text-white/80">Shown when customer hovers over card</span>
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-4 space-y-2">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 mx-auto flex items-center justify-center">
                              <Upload size={20} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-foreground">Upload hover / back angle</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">or drag and drop here</p>
                            </div>
                            <span className="inline-block text-[9px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-mono">
                              Lookbook shot
                            </span>
                          </div>
                        )}

                        {uploadingTarget === "hover" && (
                          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white gap-2">
                            <RefreshCw size={24} className="animate-spin text-blue-400" />
                            <span className="text-xs font-bold">Uploading to media storage...</span>
                          </div>
                        )}

                        <input
                          ref={hoverFileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileInputChange(e, "hover")}
                        />
                      </div>

                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={activeColorway.hoverImage}
                          onChange={(e) => updateActiveColorway({ hoverImage: e.target.value })}
                          placeholder="Or paste hover image URL..."
                          className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-[11px] font-mono outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => hoverFileInputRef.current?.click()}
                          className="px-2.5 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-bold shrink-0 hover:bg-purple-700 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Upload file"
                        >
                          <Upload size={12} />
                          <span className="hidden xs:inline">Upload</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* GALLERY ANGLES MULTI-UPLOAD */}
                  <div className="pt-2 border-t border-border/40">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        Additional Angles ({activeColorway.galleryImages?.length || 0})
                      </span>
                      <button
                        type="button"
                        onClick={() => galleryFileInputRef.current?.click()}
                        className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Upload size={12} />
                        <span>+ Upload Angles</span>
                      </button>
                      <input
                        ref={galleryFileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileInputChange(e, "gallery")}
                      />
                    </div>

                    {activeColorway.galleryImages && activeColorway.galleryImages.length > 0 && (
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
                        {activeColorway.galleryImages.map((imgUrl, i) => (
                          <div key={i} className="aspect-square rounded-xl overflow-hidden border border-border relative group">
                            <img src={imgUrl} alt={`Angle ${i + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                updateActiveColorway({
                                  galleryImages: activeColorway.galleryImages.filter((_, idx) => idx !== i),
                                });
                              }}
                              className="absolute top-1 right-1 p-1 bg-black/75 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: FABRIC COMPOSITION & CARE */}
            <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-7 shadow-xs space-y-5 sm:space-y-6">
              <div className="flex items-center gap-3 pb-3 sm:pb-4 border-b border-border">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                  <ShieldCheck size={18} className="sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold">4. Fabric Composition & Laundering Care</h2>
                  <p className="text-[11px] sm:text-xs text-muted-foreground">
                    Sizing guidelines and laundering instructions
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Size & Fit Model Editorial Notes
                  </label>
                  <textarea
                    rows={3}
                    value={sizeAndFit}
                    onChange={(e) => setSizeAndFit(e.target.value)}
                    placeholder="e.g. Model is 6'1 wearing size 32 waist..."
                    className="w-full bg-muted/40 border border-border rounded-xl p-3 text-xs font-medium outline-none resize-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Garment Laundering & Care Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={care}
                    onChange={(e) => setCare(e.target.value)}
                    placeholder="e.g. Machine wash cold inside out..."
                    className="w-full bg-muted/40 border border-border rounded-xl p-3 text-xs font-medium outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5: LIVE STOREFRONT CARD PREVIEW (5 COLS ON LAPTOPS, 4 ON 2XL DESKTOPS) */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-5 2xl:col-span-4 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto space-y-6 pr-1 custom-scrollbar">
            <div className="bg-card border border-border rounded-3xl p-5 xl:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Sparkles size={14} />
                  Live Storefront Card
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">Real-time sync</span>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Click any color swatch below to preview how customers experience the card on the storefront.
                The <strong>1st colorway</strong> ({colorways[0]?.name}) is the default.
              </p>

              {/* Exact Storefront Product Card Rendering */}
              <div
                className="bg-background border border-border/80 rounded-2xl overflow-hidden shadow-sm transition-all"
                onMouseEnter={() => setPreviewHovered(true)}
                onMouseLeave={() => setPreviewHovered(false)}
              >
                {/* Image Aspect Box with Hover Transition */}
                <div className="aspect-[3/4] bg-muted/30 relative overflow-hidden group">
                  <img
                    src={
                      (previewHovered && cardPreviewColorway.hoverImage
                        ? cardPreviewColorway.hoverImage
                        : cardPreviewColorway.primaryImage) ||
                      "https://images.unsplash.com/photo-1542272604-780c96856592?w=800"
                    }
                    alt={title || "Preview"}
                    className="w-full h-full object-cover transition-all duration-500"
                  />

                  {/* Merchandising Badge */}
                  {badge && (
                    <span className="absolute top-3 left-3 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 shadow-sm">
                      {badge}
                    </span>
                  )}

                  {/* Indicator of which color is currently displayed on the card */}
                  <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-xs text-white px-2.5 py-1 text-[10px] flex items-center justify-between rounded-md">
                    <span className="font-semibold truncate">Showing: {cardPreviewColorway.name}</span>
                    {cardPreviewColorway.id === colorways[0].id && (
                      <span className="text-[9px] font-bold text-amber-400 shrink-0">★ Default (1st)</span>
                    )}
                  </div>
                </div>

                {/* Card Details (Dynamically bound to the chosen swatch!) */}
                <div className="p-4 space-y-3">
                  {/* Brand & Category line */}
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
                    <span>{brand}</span>
                    <span className="text-primary">{currentCategoryObj?.title || selectedCategory}</span>
                  </div>

                  {/* Title & Selected Colorway */}
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      {title || "Untitled Garment"}
                      <span className="text-muted-foreground font-normal italic">
                        {" - "}
                        {cardPreviewColorway.name}
                      </span>
                    </h3>
                  </div>

                  {/* MULTIPLE COLOR SWATCHES ROW */}
                  <div className="space-y-1 pt-1 border-t border-border/50">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="font-semibold uppercase tracking-wider">Colorways:</span>
                      <span className="font-medium text-foreground">{cardPreviewColorway.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      {colorways.map((cw, idx) => {
                        const isCardActive = cw.id === cardPreviewColorway.id;
                        const isFirstDefault = idx === 0;

                        return (
                          <button
                            key={cw.id}
                            type="button"
                            onClick={() => setPreviewActiveSwatchId(cw.id)}
                            title={`${cw.name} - $${parseFloat(cw.price || "0").toFixed(2)} ${
                              isFirstDefault ? "(1st / Default)" : ""
                            }`}
                            className={`w-5 h-5 rounded-sm transition-all relative ${
                              isCardActive
                                ? "ring-2 ring-black ring-offset-1 scale-110 shadow-xs"
                                : "border border-black/25 opacity-80 hover:opacity-100"
                            }`}
                            style={{ backgroundColor: cw.hex }}
                          >
                            {isFirstDefault && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 border border-white" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* DYNAMIC PRICE FOR CHOSEN COLORWAY */}
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-sm font-black text-foreground">
                      ${parseFloat(cardPreviewColorway.price || "0").toFixed(2)}
                    </span>
                    {cardPreviewColorway.originalPrice &&
                      parseFloat(cardPreviewColorway.originalPrice) >
                        parseFloat(cardPreviewColorway.price || "0") && (
                        <span className="text-xs text-muted-foreground line-through">
                          ${parseFloat(cardPreviewColorway.originalPrice).toFixed(2)}
                        </span>
                      )}
                  </div>

                  {/* DYNAMIC DESCRIPTION STORY FOR CHOSEN COLORWAY */}
                  {cardPreviewColorway.description && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {cardPreviewColorway.description}
                    </p>
                  )}

                  {/* DYNAMIC SIZES FOR CHOSEN COLORWAY */}
                  <div className="pt-2 border-t border-border/50">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Available Sizes for {cardPreviewColorway.name}:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {cardPreviewColorway.sizes.map((sz) => (
                        <span
                          key={sz}
                          onClick={() => setPreviewSelectedSize(sz)}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer transition-all ${
                            previewSelectedSize === sz
                              ? "bg-foreground text-background"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {sz}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Reset to 1st Colorway button */}
                  {cardPreviewColorway.id !== colorways[0].id && (
                    <button
                      type="button"
                      onClick={() => setPreviewActiveSwatchId(colorways[0].id)}
                      className="w-full text-center text-[10px] font-bold text-blue-600 hover:underline pt-1"
                    >
                      ↺ Reset card view to 1st Colorway ({colorways[0].name})
                    </button>
                  )}
                </div>
              </div>

              {/* Ready to Publish Checklist */}
              <div className="bg-muted/40 rounded-2xl p-4 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Launch Checklist
                </span>
                <div className="space-y-1.5 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    {title.trim() ? (
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    ) : (
                      <AlertCircle size={14} className="text-amber-500 shrink-0" />
                    )}
                    <span className={title.trim() ? "text-foreground" : "text-muted-foreground"}>
                      Garment title specified
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {colorways.length > 0 ? (
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    ) : (
                      <AlertCircle size={14} className="text-amber-500 shrink-0" />
                    )}
                    <span className="text-foreground">
                      {colorways.length} Colorway(s) configured (1st: {colorways[0]?.name})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {colorways[0]?.sizes.length > 0 ? (
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    ) : (
                      <AlertCircle size={14} className="text-amber-500 shrink-0" />
                    )}
                    <span className="text-foreground">
                      {colorways[0]?.sizes.length} sizes in default colorway
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {colorways[0]?.primaryImage ? (
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    ) : (
                      <AlertCircle size={14} className="text-amber-500 shrink-0" />
                    )}
                    <span className="text-foreground">Default studio photography ready</span>
                  </div>
                </div>
              </div>

              {/* Bottom Submit Button */}
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={loading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-600/25 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                <span>{loading ? "Publishing Garment..." : "Publish to Luma Threads"}</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* MOBILE / TABLET FLOATING ACTION BAR: BOTTOM FIXED */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border p-3 flex items-center justify-between gap-3 shadow-lg">
        <button
          type="button"
          onClick={() => setShowPreviewModal(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-border text-xs font-bold hover:bg-muted transition-all"
        >
          <Eye size={15} />
          <span>Card Preview ({colorways.length} colors)</span>
        </button>

        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-600/20 active:scale-95 disabled:opacity-50"
        >
          {loading ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
          <span>{loading ? "Publishing..." : "Publish Garment"}</span>
        </button>
      </div>

      {/* MOBILE / TABLET LIVE PREVIEW MODAL / DRAWER */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Sparkles size={14} />
                Live Storefront Card Preview
              </span>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            {/* Exact Card Preview */}
            <div className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="aspect-[3/4] bg-muted/30 relative overflow-hidden">
                <img
                  src={
                    cardPreviewColorway.primaryImage ||
                    "https://images.unsplash.com/photo-1542272604-780c96856592?w=800"
                  }
                  alt={title || "Preview"}
                  className="w-full h-full object-cover"
                />
                {badge && (
                  <span className="absolute top-3 left-3 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
                    {badge}
                  </span>
                )}
                <div className="absolute bottom-2 left-2 right-2 bg-black/75 text-white px-2.5 py-1 text-[10px] flex items-center justify-between rounded-md">
                  <span className="font-semibold truncate">Showing: {cardPreviewColorway.name}</span>
                </div>
              </div>

              <div className="p-4 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground uppercase font-bold">
                  <span>{brand}</span>
                  <span className="text-primary">{currentCategoryObj?.title || selectedCategory}</span>
                </div>
                <h3 className="text-sm font-bold text-foreground">
                  {title || "Untitled Garment"} - {cardPreviewColorway.name}
                </h3>

                {/* Swatches */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {colorways.map((cw) => (
                    <button
                      key={cw.id}
                      type="button"
                      onClick={() => setPreviewActiveSwatchId(cw.id)}
                      className={`w-6 h-6 rounded-sm ${
                        cw.id === cardPreviewColorway.id ? "ring-2 ring-black ring-offset-1" : "opacity-75"
                      }`}
                      style={{ backgroundColor: cw.hex }}
                    />
                  ))}
                </div>

                <div className="text-sm font-black text-foreground pt-1">
                  ${parseFloat(cardPreviewColorway.price || "0").toFixed(2)}
                </div>

                <div className="flex flex-wrap gap-1 pt-1 border-t border-border/50">
                  {cardPreviewColorway.sizes.map((sz) => (
                    <span key={sz} className="px-2 py-0.5 text-[10px] font-bold rounded bg-muted">
                      {sz}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPreviewModal(false)}
              className="w-full py-2.5 bg-foreground text-background rounded-xl font-bold text-xs"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
