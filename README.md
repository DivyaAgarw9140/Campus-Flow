🚀 Project Idea: Campus-Flow

The Problem:
In the college canteen, there is always a crowd. Students have to stand in long lines to get tokens, sometimes there is confusion or arguments, and many students end up getting late for their classes.

The Solution:
A mobile-friendly web app where students can place their food order as soon as they leave their class. The order goes directly to the canteen system, a digital token is generated, and students are notified when their food is ready. This reduces waiting time, avoids crowding at the counter, and helps students get their food quickly before their next class.

your-project/
│
├── app/
│   ├── actions/
│   │   └── place-order.ts        ← already given to you
│   ├── order/
│   │   └── [id]/
│   │       └── page.tsx          ← (next to build)
│   ├── staff/
│   │   └── page.tsx              ← your existing staff page
│   └── page.tsx                  ← your existing student menu page
│
├── components/
│   ├── Cart.tsx                  ← put it here
│   └── AddToTrayButton.tsx       ← put it here
│
├── store/
│   └── cart-store.ts             ← CREATE this folder, put it here
│
└── package.json
