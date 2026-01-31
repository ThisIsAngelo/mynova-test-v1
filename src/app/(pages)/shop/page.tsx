"use client";

import Container from "@/components/container";
import { cn } from "@/lib/utils";
import { CoinsIcon, Loader2, Lock, Check, Sparkles } from "lucide-react"; // Pakai lucide untuk variasi
import Image from "next/image";
import { useEffect, useState } from "react";
import { IoArrowBack, IoBagHandleOutline, IoCartOutline, IoCheckmarkCircle, IoDiamondOutline, IoPersonOutline, IoScanOutline } from "react-icons/io5";
import Link from "next/link";
import { toast } from "sonner";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { AvatarFrame } from "@/components/ui/avatar-frame";

// --- TYPES ---
type ItemType = "AVATAR" | "FRAME";

interface ShopItem {
    id: string;
    type: ItemType;
    name: string;
    description: string;
    price: number;
    asset: string;
    isOwned: boolean;
    isEquipped: boolean;
}

// --- HELPER FRAME STYLES (Sama dengan Profile) ---
const getFrameStyles = (frameAsset: string) => {
    switch (frameAsset) {
        case "glow":
            return "border-4 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.6)] animate-pulse";
        case "gold":
            return "border-4 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.5)]";
        case "neon": // Jaga-jaga kalau nambah
            return "border-2 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.8)]";
        default:
            return "border border-border";
    }
};

export default function ShopPage() {
    const [items, setItems] = useState<ShopItem[]>([]);
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"ALL" | ItemType>("ALL");
    const [processingId, setProcessingId] = useState<string | null>(null);

    // 1. Fetch Data Shop
    useEffect(() => {
        const fetchShop = async () => {
            try {
                const res = await fetch("/api/shop/items");
                if (res.ok) {
                    const data = await res.json();
                    setItems(data.items);
                    setBalance(data.userBalance);
                }
            } catch (error) {
                toast.error("Failed to load shop");
            } finally {
                setLoading(false);
            }
        };
        fetchShop();
    }, []);

    // 2. Handle Buy
    const handleBuy = async (item: ShopItem) => {
        if (balance < item.price) {
            toast.error("Not enough Nova Coins!");
            return;
        }

        setProcessingId(item.id);
        try {
            const res = await fetch("/api/shop/buy", {
                method: "POST",
                body: JSON.stringify({ itemId: item.id }),
            });

            if (res.ok) {
                // Update State Lokal (Biar gak perlu refetch)
                setBalance((prev) => prev - item.price);
                setItems((prev) => prev.map(i => i.id === item.id ? { ...i, isOwned: true } : i));
                toast.success(`Purchased ${item.name}!`, {
                    icon: <IoBagHandleOutline className="text-emerald-500" />
                });
            } else {
                const err = await res.text();
                toast.error(err);
            }
        } catch (error) {
            toast.error("Transaction failed");
        } finally {
            setProcessingId(null);
        }
    };

    // 3. Handle Equip
    const handleEquip = async (item: ShopItem) => {
        setProcessingId(item.id);
        try {
            const res = await fetch("/api/shop/equip", {
                method: "POST",
                body: JSON.stringify({ itemId: item.id }),
            });

            if (res.ok) {
                // Update State Lokal:
                // 1. Set item ini jadi equipped
                // 2. Set item lain yang tipe-nya sama jadi unequipped
                setItems((prev) => prev.map(i => {
                    if (i.type === item.type) {
                        return { ...i, isEquipped: i.id === item.id };
                    }
                    return i;
                }));
                toast.success(`Equipped ${item.name}`);
            }
        } catch (error) {
            toast.error("Failed to equip");
        } finally {
            setProcessingId(null);
        }
    };

    // Filter Logic
    const filteredItems = filter === "ALL" ? items : items.filter(i => i.type === filter);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <AiOutlineLoading3Quarters className="animate-spin text-2xl text-muted-foreground/50" />
        </div>
    );

    return (
        <main className="min-h-screen bg-background text-foreground pt-28 pb-20 md:pt-32 md:pb-24 relative selection:bg-amber-500/30 font-sans overflow-x-hidden">

            {/* --- BACKGROUND (Consistent Theme) --- */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
                <div className="absolute top-0 right-0 w-[60vw] h-[60vh] bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent blur-[120px]" />
            </div>

            <Container className="relative z-10 max-w-6xl">

                {/* --- HEADER SECTION --- */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div className="space-y-4">
                        <Link href="/profile" className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors group px-4 py-2 rounded-full border border-border/50 hover:bg-muted/50 w-fit">
                            <IoArrowBack className="group-hover:-translate-x-1 transition-transform" /> BACK TO PROFILE
                        </Link>

                        <div>
                            <h1 className="text-4xl md:text-6xl font-heading font-black tracking-tighter text-foreground mb-2">
                                The Armory
                            </h1>
                            <p className="text-muted-foreground text-lg max-w-md font-light">
                                Enhance your identity with cosmetic upgrades.
                                <span className="block text-xs font-bold mt-2 uppercase tracking-widest opacity-60">No Pay-to-Win. Just Style.</span>
                            </p>
                        </div>
                    </div>

                    {/* COIN BALANCE DISPLAY */}
                    <div className="flex items-center gap-4 bg-card/50 backdrop-blur-xl border border-amber-500/20 p-4 rounded-3xl shadow-2xl shadow-amber-500/5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg transform rotate-3">
                            <CoinsIcon className="text-white w-8 h-8 drop-shadow-md" />
                        </div>
                        <div className="pr-4">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Your Balance</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-mono font-black text-foreground tracking-tight tabular-nums">
                                    {balance.toLocaleString()}
                                </span>
                                <span className="text-xs font-bold text-amber-500">NOVA COIN</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- FILTER TABS --- */}
                <div className="flex items-center justify-center gap-2 mb-12 p-1.5 bg-muted/30 backdrop-blur-md rounded-full w-fit mx-auto border border-border/50">
                    {(['ALL', 'AVATAR', 'FRAME'] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={cn(
                                "px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300",
                                filter === type
                                    ? "bg-foreground text-background shadow-lg scale-105"
                                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                            )}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* --- ITEMS GRID --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map((item) => (
                        <ShopCard
                            key={item.id}
                            item={item}
                            balance={balance}
                            onBuy={handleBuy}
                            onEquip={handleEquip}
                            processingId={processingId}
                        />
                    ))}
                </div>

                {filteredItems.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">
                        <IoScanOutline className="text-4xl mx-auto mb-4 opacity-20" />
                        <p className="uppercase tracking-widest text-xs">No items found in this category.</p>
                    </div>
                )}

            </Container>
        </main>
    );
}

// --- SUB COMPONENT: SHOP CARD ---
const ShopCard = ({
    item, balance, onBuy, onEquip, processingId
}: {
    item: ShopItem,
    balance: number,
    onBuy: (i: ShopItem) => void,
    onEquip: (i: ShopItem) => void,
    processingId: string | null
}) => {
    const isProcessing = processingId === item.id;
    const canAfford = balance >= item.price;

    // Preview Logic: Avatar vs Frame
    const renderPreview = () => {
        if (item.type === "AVATAR") {
            return (
                <div className="relative w-24 h-24 rounded-full overflow-hidden shadow-xl border-2 border-border/50">
                    <Image src={item.asset} alt={item.name} fill className="object-cover" />
                </div>
            );
        } else {
            // Frame Preview (pakai avatar default sebagai placeholder di tengah)
            return (
                <AvatarFrame
                    src="/assets/images/avatars/default.jpg" // Placeholder image
                    alt="Preview"
                    frameAsset={item.asset}
                    sizeClass="w-24 h-24"
                    className="bg-neutral-900 rounded-full"
                />
            );
        }
    };

    return (
        <div className={cn(
            "group relative flex flex-col justify-between p-6 rounded-[2rem] border transition-all duration-300 overflow-hidden",
            item.isOwned
                ? "bg-card/40 border-border/50 hover:border-border"
                : "bg-gradient-to-b from-card/80 to-card/40 border-border/30 hover:shadow-2xl hover:shadow-amber-500/5 hover:-translate-y-1"
        )}>
            {/* Background Gradient for Type */}
            <div className={cn(
                "absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full pointer-events-none opacity-20 transition-opacity group-hover:opacity-40",
                item.type === 'AVATAR' ? "bg-blue-500" : "bg-purple-500"
            )} />

            {/* HEADER: Icon & Price */}
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="p-3 rounded-2xl bg-background/50 backdrop-blur-md border border-white/5 shadow-sm text-muted-foreground">
                    {item.type === 'AVATAR' ? <IoPersonOutline /> : <IoDiamondOutline />}
                </div>

                {!item.isOwned && (
                    <div className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold shadow-sm backdrop-blur-md",
                        canAfford ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-destructive/10 text-destructive border-destructive/20"
                    )}>
                        <CoinsIcon size={12} />
                        {item.price}
                    </div>
                )}

                {item.isOwned && (
                    <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                        <IoCheckmarkCircle /> OWNED
                    </div>
                )}
            </div>

            {/* PREVIEW AREA */}
            <div className="flex justify-center py-4 mb-6 relative z-10">
                {renderPreview()}
            </div>

            {/* DETAILS */}
            <div className="text-center mb-6 relative z-10">
                <h3 className="text-xl font-heading font-bold mb-1">{item.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed px-4">
                    {item.description}
                </p>
            </div>

            {/* ACTION BUTTON */}
            <div className="relative z-10">
                {item.isEquipped ? (
                    <button disabled className="w-full py-3 rounded-xl bg-muted/20 border border-border text-muted-foreground text-xs font-bold uppercase tracking-widest cursor-not-allowed flex items-center justify-center gap-2">
                        <Check size={14} /> Equipped
                    </button>
                ) : item.isOwned ? (
                    <button
                        onClick={() => onEquip(item)}
                        disabled={isProcessing}
                        className="w-full py-3 rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all active:scale-95 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                        {isProcessing ? <Loader2 className="animate-spin" size={14} /> : "Equip Item"}
                    </button>
                ) : (
                    <button
                        onClick={() => onBuy(item)}
                        disabled={!canAfford || isProcessing}
                        className={cn(
                            "w-full py-3 rounded-xl transition-all active:scale-95 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg",
                            canAfford
                                ? "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/20"
                                : "bg-muted cursor-not-allowed text-muted-foreground"
                        )}
                    >
                        {isProcessing ? <Loader2 className="animate-spin" size={14} /> : (
                            <>
                                <IoCartOutline size={16} />
                                {canAfford ? "Purchase" : "Not Enough Gold"}
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};