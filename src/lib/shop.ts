import { prisma } from "@/lib/db";
// import { modifyCoins } from "@/lib/currency"; // Tidak perlu import ini jika kita manual transaction

/**
 * BUY ITEM LOGIC
 */
export async function buyShopItem(userId: string, itemId: string) {
  // A. Ambil Data Item & User
  const item = await prisma.shopItem.findUnique({ where: { id: itemId } });
  const user = await prisma.user.findUnique({ 
    where: { id: userId },
    include: { inventory: true }
  });

  if (!item || !user) throw new Error("Item or User not found");

  // B. Cek Ownership (Sudah punya belum?)
  const alreadyOwned = user.inventory.some((inv) => inv.shopItemId === itemId);
  if (alreadyOwned) throw new Error("You already own this item.");

  // C. Cek Saldo
  if (user.coins < item.price) throw new Error("Not enough Nova Coins.");

  // D. Transaksi (Atomic)
  return await prisma.$transaction(async (tx) => {
    // 1. Potong Koin User
    await tx.user.update({
      where: { id: userId },
      data: { coins: { decrement: item.price } }
    });

    // 2. Catat Log Transaksi Koin
    // [FIX] Hapus field 'type', cukup pakai amount negatif
    await tx.coinTransaction.create({
      data: {
        userId,
        amount: -item.price, // Negatif otomatis menandakan "Pengeluaran"
        description: `Bought item: ${item.name}`,
      }
    });

    // 3. Masukkan ke Inventory
    const newInventory = await tx.userInventory.create({
      data: {
        userId,
        shopItemId: itemId
      }
    });

    return newInventory;
  });
}

/**
 * EQUIP ITEM LOGIC (Tetap sama)
 */
export async function equipShopItem(userId: string, itemId: string) {
  const inventoryItem = await prisma.userInventory.findUnique({
    where: {
      userId_shopItemId: { userId, shopItemId: itemId }
    },
    include: { item: true }
  });

  if (!inventoryItem) throw new Error("You don't own this item.");

  const itemType = inventoryItem.item.type; 
  const itemAsset = inventoryItem.item.asset;

  const updateData = itemType === "AVATAR" 
    ? { activeAvatar: itemAsset }
    : { activeFrame: itemAsset };

  await prisma.user.update({
    where: { id: userId },
    data: updateData
  });

  return { success: true, type: itemType, asset: itemAsset };
}