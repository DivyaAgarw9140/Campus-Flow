import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (menu_item_id: string) => void;
  updateQuantity: (menu_item_id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const existing = get().items.find(
          (i) => i.menu_item_id === item.menu_item_id
        );
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.menu_item_id === item.menu_item_id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          }));
        } else {
          set((state) => ({
            items: [...state.items, { ...item, quantity: 1 }],
          }));
        }
      },

      removeItem: (menu_item_id) => {
        set((state) => ({
          items: state.items.filter((i) => i.menu_item_id !== menu_item_id),
        }));
      },

      updateQuantity: (menu_item_id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menu_item_id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.menu_item_id === menu_item_id ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalItems: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "campus-flow-cart" }
  )
);