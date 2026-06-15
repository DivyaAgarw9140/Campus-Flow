import { create } from 'zustand';

// Define what a Cart Item looks like
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: any) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  
  addItem: (newItem) => {
    const currentItems = get().items;
    const existingItem = currentItems.find(item => item.id === newItem.id);

    if (existingItem) {
      set({
        items: currentItems.map(item =>
          item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item
        ),
      });
    } else {
      set({ items: [...currentItems, { ...newItem, quantity: 1 }] });
    }
  },

  removeItem: (id) => set({
    items: get().items.filter(item => item.id !== id)
  }),

  clearCart: () => set({ items: [] }),

  totalPrice: () => get().items.reduce((acc, item) => acc + (item.price * item.quantity), 0),
}));