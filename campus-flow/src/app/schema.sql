-- 1. Menu Items(Samosa,Chai,Tea)
CREATE TABLE Menu_Items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  price int8 NOT NULL,
  category text NOT NULL,
  is_available boolean DEFAULT true,
  imag_url text
);

-- 2 Orders Table(The Main Logic)
CREATE TABLE Orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  total_price int8  NOT NULL,
  status text DEFAULT 'PENDING',
  token_number serial ,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE INSIDEITEMS(
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES Orders(id),
  Menu_ITEMS_id uuid REFERENCES MENU_ITEMS(id),
  quantity int4 NOT NULL
);