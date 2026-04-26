export const DRIVER_DATA = {
  name:        "Rajesh Kumar",
  email:       "rajkumar@truckmail.in",
  phone:       "+91 9876553210",
  address:     "Sector 32, Gurgaon, Haryana, India",
  plan:        "PREMIUM",
  memberSince: "Mar 20, 2022",
  vehicle:     "#UP32-GH5674",
  rating:      4.8,
  ratingCount: 31,

  stats: {
    activeBids:      4,
    activeShipments: 2,
    tripsCompleted:  47,
    totalEarnings:   "₹2,40,000",
  },

  activeShipment: {
    id:       "SHP-20048",
    route:    "Mumbai → Pune",
    status:   "in_transit",
    cargo:    "320 kg Steel Rods",
    pickup:   "09:03 AM",
    progress: 62,
    timeline: [
      { label: "Bid accepted",      meta: "Mar 18 · 08:12 AM",                               done: true,  active: false },
      { label: "Shipment assigned", meta: "Mar 18 · 08:15 AM · Driver confirmed",             done: true,  active: false },
      { label: "In transit",        meta: "Mar 18 · 09:03 AM · Departed Mumbai",              done: false, active: true  },
      { label: "Delivery pending",  meta: "ETA Mar 18 · 01:30 PM · Pune warehouse",           done: false, active: false },
    ],
  },

  bids: [
    { shipment: "SHP-20059", route: "Bangalore → Chennai", price: "₹8,400",  eta: "6 hrs", status: "pending"  },
    { shipment: "SHP-20061", route: "Hyderabad → Vizag",   price: "₹14,200", eta: "9 hrs", status: "pending"  },
    { shipment: "SHP-20055", route: "Surat → Ahmedabad",   price: "₹3,800",  eta: "3 hrs", status: "rejected" },
    { shipment: "SHP-20048", route: "Mumbai → Pune",       price: "₹5,500",  eta: "4 hrs", status: "accepted" },
  ],

  trips: [
    { id: "TRP-1041", route: "Mumbai → Pune",     date: "Mar 17, 2025", earning: "₹5,500", rating: 5 },
    { id: "TRP-1038", route: "Delhi → Jaipur",    date: "Mar 12, 2025", earning: "₹9,200", rating: 4 },
    { id: "TRP-1033", route: "Surat → Baroda",    date: "Mar 05, 2025", earning: "₹3,800", rating: 5 },
    { id: "TRP-1029", route: "Chennai → Vellore", date: "Feb 28, 2025", earning: "₹4,100", rating: 4 },
    { id: "TRP-1021", route: "Kolkata → Asansol", date: "Feb 20, 2025", earning: "₹6,700", rating: 5 },
  ],

  permits: [
    { type: "Goods Carrier Permit", number: "#RJ14-AB1234", from: "05 Jun 2023", expiry: "11 Jun 2025", status: "active",  daysLeft: 85  },
    { type: "Geeda Carrier Permit", number: "#HR55-DE5678", from: "10 May 2023", expiry: "26 May 2024", status: "warning", daysLeft: 18  },
    { type: "National Permit",      number: "#UP32-FG9012", from: "01 Apr 2020", expiry: "01 Apr 2024", status: "expired", daysLeft: -5  },
  ],

  vehicles: [
    { reg: "#UP32-GH5674", type: "Heavy Truck", capacity: "20 tonnes", status: "active" },
    { reg: "#DL01-KA8821", type: "Mini Truck",  capacity: "5 tonnes",  status: "idle"   },
  ],

  notifications: [
    { msg: "Your bid has been accepted — SHP-20048 assigned to you.",    time: "2 hrs ago",  read: false },
    { msg: "New shipment open near Mumbai matching your route.",          time: "5 hrs ago",  read: false },
    { msg: "Permit HR55-DE5678 expiring in 18 days. Renew now.",         time: "Yesterday",  read: false },
    { msg: "SHP-20055 bid was rejected by the shipper.",                 time: "2 days ago", read: true  },
    { msg: "Trip TRP-1038 payment of ₹9,200 credited to your account.",  time: "3 days ago", read: true  },
  ],
};
