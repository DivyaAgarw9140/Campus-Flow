export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
  category: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}