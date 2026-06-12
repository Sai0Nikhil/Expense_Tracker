// Prepopulated mock expenses to give the user a rich, working experience immediately
export const initialExpenses = [
  {
    id: "exp-1",
    amount: 1200.00,
    description: "Monthly Rent Payment",
    date: "2026-06-01",
    category: "Housing"
  },
  {
    id: "exp-2",
    amount: 75.40,
    description: "Whole Foods Grocery",
    date: "2026-06-03",
    category: "Food"
  },
  {
    id: "exp-3",
    amount: 45.00,
    description: "Uber Ride to Airport",
    date: "2026-06-04",
    category: "Transport"
  },
  {
    id: "exp-4",
    amount: 120.50,
    description: "Electric Bill Autopay",
    date: "2026-06-05",
    category: "Utilities"
  },
  {
    id: "exp-5",
    amount: 15.99,
    description: "Netflix Subscription",
    date: "2026-06-06",
    category: "Entertainment"
  },
  {
    id: "exp-6",
    amount: 210.00,
    description: "Dinner at Steakhouse",
    date: "2026-06-07",
    category: "Food"
  },
  {
    id: "exp-7",
    amount: 55.00,
    description: "Gas Station Fuel",
    date: "2026-06-08",
    category: "Transport"
  },
  {
    id: "exp-8",
    amount: 89.00,
    description: "Nike Gym Shoes",
    date: "2026-06-09",
    category: "Shopping"
  },
  {
    id: "exp-9",
    amount: 35.00,
    description: "Starbucks Coffee & Beans",
    date: "2026-06-10",
    category: "Food"
  },
  {
    id: "exp-10",
    amount: 150.00,
    description: "Weekly Therapy Session",
    date: "2026-06-11",
    category: "Health"
  },
  // May expenses (for monthly comparison/trends)
  {
    id: "exp-m1",
    amount: 1200.00,
    description: "Monthly Rent Payment",
    date: "2026-05-01",
    category: "Housing"
  },
  {
    id: "exp-m2",
    amount: 320.00,
    description: "Weekly Groceries Total",
    date: "2026-05-10",
    category: "Food"
  },
  {
    id: "exp-m3",
    amount: 110.00,
    description: "Electric & Water Bill",
    date: "2026-05-15",
    category: "Utilities"
  },
  {
    id: "exp-m4",
    amount: 85.00,
    description: "Gasoline & Car Wash",
    date: "2026-05-18",
    category: "Transport"
  },
  {
    id: "exp-m5",
    amount: 150.00,
    description: "Concert Tickets",
    date: "2026-05-20",
    category: "Entertainment"
  },
  {
    id: "exp-m6",
    amount: 140.00,
    description: "Amazon Shopping",
    date: "2026-05-25",
    category: "Shopping"
  }
];

export const CATEGORIES = [
  "Housing",
  "Food",
  "Transport",
  "Utilities",
  "Entertainment",
  "Shopping",
  "Health",
  "Other"
];

export const CATEGORY_COLORS = {
  Housing: "from-blue-500 to-indigo-600",
  Food: "from-amber-400 to-orange-500",
  Transport: "from-emerald-400 to-teal-600",
  Utilities: "from-cyan-400 to-blue-500",
  Entertainment: "from-pink-500 to-purple-600",
  Shopping: "from-rose-400 to-red-600",
  Health: "from-green-400 to-emerald-500",
  Other: "from-slate-400 to-slate-600"
};

export const CATEGORY_COLORS_HEX = {
  Housing: "#4f46e5",
  Food: "#f59e0b",
  Transport: "#10b981",
  Utilities: "#06b6d4",
  Entertainment: "#d946ef",
  Shopping: "#f43f5e",
  Health: "#10b981",
  Other: "#64748b"
};
