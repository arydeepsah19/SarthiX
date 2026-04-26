export const COMPANY_DATA = {
  name:        "TranzLog Industries",
  email:       "ops@tranzlog.in",
  phone:       "+91 9988776655",
  address:     "BKC, Mumbai, Maharashtra, India",
  plan:        "ENTERPRISE",
  memberSince: "Jan 10, 2021",

  stats: {
    total:     128,
    active:    11,
    completed: 103,
    cancelled: 14,
    spent:     "₹18,40,000",
  },

  shipments: [
    { id: "SHP-20063", route: "Mumbai → Nagpur",         posted: "1h ago",  bids: 3,  status: "open"       },
    { id: "SHP-20061", route: "Delhi → Jaipur",          posted: "3h ago",  bids: 7,  status: "open"       },
    { id: "SHP-20058", route: "Kolkata → Bhubaneswar",   posted: "6h ago",  bids: 5,  status: "assigned"   },
    { id: "SHP-20051", route: "Bangalore → Mysore",      posted: "12h ago", bids: 9,  status: "in_transit" },
    { id: "SHP-20044", route: "Chennai → Coimbatore",    posted: "Mar 17",  bids: 4,  status: "delivered"  },
    { id: "SHP-20041", route: "Hyderabad → Warangal",    posted: "Mar 16",  bids: 6,  status: "delivered"  },
    { id: "SHP-20036", route: "Pune → Nashik",           posted: "Mar 14",  bids: 2,  status: "delivered"  },
    { id: "SHP-20031", route: "Ahmedabad → Surat",       posted: "Mar 11",  bids: 8,  status: "cancelled"  },
  ],

  // Bids keyed to open shipments
  bids: {
    "SHP-20063": [
      { driver: "Rajan Kumar",     rating: 4.8, eta: "5 hrs", price: "₹7,800",  status: "pending" },
      { driver: "Amit Sharma",     rating: 4.5, eta: "6 hrs", price: "₹8,200",  status: "pending" },
      { driver: "Priya Logistics", rating: 4.1, eta: "7 hrs", price: "₹9,100",  status: "pending" },
    ],
    "SHP-20061": [
      { driver: "Suresh Verma",    rating: 4.7, eta: "8 hrs", price: "₹11,500", status: "pending" },
      { driver: "Deepak Transport",rating: 4.3, eta: "9 hrs", price: "₹12,000", status: "pending" },
    ],
  },

  notifications: [
    { msg: "New bid ₹7,800 on SHP-20063 by Rajan Kumar.",   time: "12 min ago", read: false },
    { msg: "New bid ₹8,200 on SHP-20063 by Amit Sharma.",   time: "28 min ago", read: false },
    { msg: "SHP-20051 is now in transit by the driver.",     time: "2 hrs ago",  read: false },
    { msg: "SHP-20044 delivered. Rate the driver.",          time: "Yesterday",  read: true  },
    { msg: "Bidding deadline for SHP-20047 passed, 0 bids.", time: "2 days ago", read: true  },
  ],
};
