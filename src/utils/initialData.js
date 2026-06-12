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

export const FINANCE_QUOTES = [
  // Finance Command Quotes
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "Rule No. 1: Never lose money. Rule No. 2: Never forget rule No. 1.", author: "Warren Buffett" },
  { text: "Beware of little expenses; a small leak will sink a great ship.", author: "Benjamin Franklin" },
  { text: "Do not save what is left after spending, but spend what is left after saving.", author: "Warren Buffett" },
  { text: "Money is a terrible master but an excellent servant.", author: "P.T. Barnum" },
  { text: "It’s not how much money you make, but how much money you keep.", author: "Robert Kiyosaki" },
  { text: "The safe way to double your money is to fold it over once and put it in your pocket.", author: "Kin Hubbard" },
  { text: "Annual income twenty pounds, annual expenditure nineteen nineteen and six, result happiness.", author: "Charles Dickens" },
  { text: "Wealth consists not in having great possessions, but in having few wants.", author: "Epictetus" },

  // Habit & Motivation Quotes
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "First we make our habits, then our habits make us.", author: "John Dryden" },
  { text: "Successful people are simply those with successful habits.", author: "Brian Tracy" },
  { text: "Your habits will determine your future.", author: "Jack Canfield" },
  { text: "If you believe you can change - if you make it a habit - the change becomes real.", author: "Charles Duhigg" },
  { text: "It is easier to prevent bad habits than to break them.", author: "Benjamin Franklin" }
];

export const initialHabits = [
  {
    id: "habit-1",
    name: "Drink 3L Water",
    createdAt: "2026-06-01",
    history: ["2026-06-10", "2026-06-11", "2026-06-12"]
  },
  {
    id: "habit-2",
    name: "Morning Gym Workout",
    createdAt: "2026-06-01",
    history: ["2026-06-11"]
  },
  {
    id: "habit-3",
    name: "Read 10 Pages",
    createdAt: "2026-06-01",
    history: ["2026-06-10", "2026-06-12"]
  },
  {
    id: "habit-4",
    name: "Meditation 10 Mins",
    createdAt: "2026-06-02",
    history: []
  }
];
