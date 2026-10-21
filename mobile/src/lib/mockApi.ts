import type {
  Property,
  Profile,
  Home,
  Bill,
  Payment,
  Visitor,
  Invitation,
  Complaint,
  Notice,
  Amenity,
  Booking,
  Vehicle,
  FamilyMember,
  Staff,
  Contact,
  Notification,
  ActiveVisitor,
  ActiveParcel,
  AdminStats,
  AdminComplaint,
  AdminMember,
  FinanceSummary,
  DefaulterUnit,
  GuardUnit,
  VerifiedPass,
} from "../types/api";

// Persistent state key in sessionStorage
const STATE_KEY = "neighbourly_demo_state_v1";

interface DemoState {
  currentPhone: string;
  invitations: Invitation[];
  visitors: Visitor[];
  activeVisitors: ActiveVisitor[];
  complaints: Complaint[];
  bills: Bill[];
  payments: Payment[];
  vehicles: Vehicle[];
  family: FamilyMember[];
}

function getInitialState(): DemoState {
  return {
    currentPhone: "+919876543204",
    invitations: [
      {
        id: "inv-1",
        name: "Rahul Verma",
        phone: "+919876543299",
        start_at: new Date(Date.now() - 3600000).toISOString(),
        end_at: new Date(Date.now() + 14400000).toISOString(),
        pin: "482910",
        qr_token: "v1-demo-token-1",
        status: "Valid",
        notes: "Family friend",
        vehicle_number: "DL 01 AB 1234",
      },
      {
        id: "inv-2",
        name: "Aman Gupta",
        phone: "+919876543288",
        start_at: new Date(Date.now() + 7200000).toISOString(),
        end_at: new Date(Date.now() + 25200000).toISOString(),
        pin: "719302",
        qr_token: "v1-demo-token-2",
        status: "Valid",
        notes: "Guest visit",
        vehicle_number: "",
      },
    ],
    visitors: [
      {
        id: "vis-1",
        name: "Swiggy Delivery (Karan)",
        phone: "+919812345678",
        kind: "Delivery",
        gate: "Main Gate",
        purpose: "Food Delivery",
        vehicle_number: "HR 26 DQ 9876",
        status: "Allowed",
        arrived_at: new Date(Date.now() - 1800000).toISOString(),
        entry_at: new Date(Date.now() - 1700000).toISOString(),
        exit_at: null,
      },
      {
        id: "vis-2",
        name: "Urban Company (Sunita)",
        phone: "+919811223344",
        kind: "Service",
        gate: "Main Gate",
        purpose: "Cleaning Service",
        vehicle_number: "",
        status: "Completed",
        arrived_at: new Date(Date.now() - 86400000).toISOString(),
        entry_at: new Date(Date.now() - 86000000).toISOString(),
        exit_at: new Date(Date.now() - 79000000).toISOString(),
      },
    ],
    activeVisitors: [
      {
        id: "act-1",
        name: "Karan Sharma (Swiggy)",
        phone: "+919812345678",
        kind: "Delivery",
        purpose: "Food parcel",
        tower: "Tower B",
        flat: "402",
        entry_at: new Date(Date.now() - 1700000).toISOString(),
      },
      {
        id: "act-2",
        name: "Rajesh Kumar (Amazon)",
        phone: "+919899887766",
        kind: "Delivery",
        purpose: "Package Drop",
        tower: "Tower A",
        flat: "1204",
        entry_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    complaints: [
      {
        id: "comp-1",
        title: "Master bedroom AC water seepage",
        description: "Water leaking along the outer corner of the master bedroom wall.",
        category: "Plumbing",
        priority: "High",
        status: "In Progress",
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        assigned_to: "Mukesh Plumber",
        attachments: [],
        rating: null,
        timeline: [
          { id: "t-1", text: "Complaint logged by resident", kind: "Status", created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
          { id: "t-2", text: "Assigned to Mukesh (Society Plumber)", kind: "Assignment", created_at: new Date(Date.now() - 86400000).toISOString() },
        ],
      },
    ],
    bills: [
      {
        id: "bill-oct-2026",
        period: "October 2026",
        due_date: "2026-10-31",
        amount: 450000,
        outstanding: 450000,
        status: "Unpaid",
        items: [
          { id: "item-1", label: "Society Maintenance Charges", amount: 350000 },
          { id: "item-2", label: "Sinking Fund Contribution", amount: 60000 },
          { id: "item-3", label: "Clubhouse & Gym Access", amount: 40000 },
        ],
      },
      {
        id: "bill-sep-2026",
        period: "September 2026",
        due_date: "2026-09-30",
        amount: 450000,
        outstanding: 0,
        status: "Paid",
        items: [
          { id: "item-sep-1", label: "Society Maintenance Charges", amount: 350000 },
          { id: "item-sep-2", label: "Sinking Fund Contribution", amount: 100000 },
        ],
      },
    ],
    payments: [
      {
        id: "pay-1",
        bill_id: "bill-sep-2026",
        period: "September 2026",
        amount: 450000,
        paid_at: new Date(Date.now() - 86400000 * 25).toISOString(),
        created_at: new Date(Date.now() - 86400000 * 25).toISOString(),
        status: "Success",
        method: "UPI",
        reference: "UPI/329482910482",
        provider: "razorpay",
        order_id: "order_demo_123",
      },
    ],
    vehicles: [
      {
        id: "veh-1",
        kind: "Car",
        registration: "HR 26 DQ 4421",
        manufacturer: "Hyundai",
        model: "Creta",
        color: "Polar White",
        parking_slot: "B2-104",
      },
    ],
    family: [
      {
        id: "fam-1",
        name: "Rohan Kapoor",
        phone: "+919876543290",
        relationship: "Spouse",
        app_access: true,
      },
    ],
  };
}

function loadState(): DemoState {
  if (typeof window === "undefined") return getInitialState();
  try {
    const raw = window.sessionStorage.getItem(STATE_KEY);
    if (!raw) {
      const initial = getInitialState();
      window.sessionStorage.setItem(STATE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return getInitialState();
  }
}

function saveState(state: DemoState) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {}
}

const USERS_DB: Record<string, { name: string; email: string; role: Property["role"]; properties: Property[] }> = {
  "+919876543204": {
    name: "Neha Kapoor",
    email: "neha.kapoor@example.com",
    role: "Tenant",
    properties: [
      {
        id: "prop-neha",
        society_id: "soc-green-heights",
        society: "Green Heights",
        tower: "Tower B",
        flat: "402",
        role: "Tenant",
        address: "Sector 45, Gurugram, Haryana",
        context_type: "unit",
      },
    ],
  },
  "+919876543210": {
    name: "Arjun Sharma",
    email: "arjun.sharma@example.com",
    role: "Secretary",
    properties: [
      {
        id: "prop-arjun-1",
        society_id: "soc-green-heights",
        society: "Green Heights",
        tower: "Tower A",
        flat: "1204",
        role: "Secretary",
        address: "Sector 45, Gurugram, Haryana",
        context_type: "unit",
      },
      {
        id: "prop-arjun-2",
        society_id: "soc-sunrise",
        society: "Sunrise Residency",
        tower: "Tower C",
        flat: "305",
        role: "Owner",
        address: "Phase 2, Bengaluru, Karnataka",
        context_type: "unit",
      },
    ],
  },
  "+919876543201": {
    name: "Vikram Malhotra",
    email: "vikram.malhotra@greenheights.org",
    role: "Admin",
    properties: [
      {
        id: "prop-vikram",
        society_id: "soc-green-heights",
        society: "Green Heights",
        tower: "Tower A",
        flat: "101",
        role: "Admin",
        address: "Sector 45, Gurugram, Haryana",
        context_type: "staff",
      },
    ],
  },
  "+919876543202": {
    name: "Pooja Iyer",
    email: "pooja.iyer@example.com",
    role: "Treasurer",
    properties: [
      {
        id: "prop-pooja",
        society_id: "soc-green-heights",
        society: "Green Heights",
        tower: "Tower B",
        flat: "502",
        role: "Treasurer",
        address: "Sector 45, Gurugram, Haryana",
        context_type: "staff",
      },
    ],
  },
  "+919876543211": {
    name: "Ramesh Singh",
    email: "guard.ramesh@greenheights.local",
    role: "Guard",
    properties: [
      {
        id: "prop-guard-1",
        society_id: "soc-green-heights",
        society: "Green Heights",
        tower: "Main Gate",
        flat: "Security Desk",
        role: "Guard",
        address: "Main Gate, Green Heights, Gurugram",
        context_type: "staff",
      },
    ],
  },
  "+919876543212": {
    name: "Bahadur Thapa",
    email: "guard.bahadur@greenheights.local",
    role: "Guard",
    properties: [
      {
        id: "prop-guard-2",
        society_id: "soc-green-heights",
        society: "Green Heights",
        tower: "Service Gate",
        flat: "Security Desk",
        role: "Guard",
        address: "Service Gate, Green Heights, Gurugram",
        context_type: "staff",
      },
    ],
  },
  "+919876543203": {
    name: "Sunil Kulkarni",
    email: "sunil.kulkarni@example.com",
    role: "Owner",
    properties: [
      {
        id: "prop-sunil",
        society_id: "soc-green-heights",
        society: "Green Heights",
        tower: "Tower A",
        flat: "804",
        role: "Owner",
        address: "Sector 45, Gurugram, Haryana",
        context_type: "unit",
      },
    ],
  },
};

export async function handleMockRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  const state = loadState();
  const cleanPath = path.split("?")[0];

  // 1. Auth: Request OTP
  if (cleanPath === "/auth/otp/request") {
    let phone = "+919876543204";
    try {
      const parsed = JSON.parse((options.body as string) || "{}");
      if (parsed.phone) phone = parsed.phone;
    } catch {}
    state.currentPhone = phone;
    saveState(state);
    return {
      challenge_id: "demo-ch-" + Date.now(),
      development: true,
      expires_in: 300,
    } as unknown as T;
  }

  // 2. Auth: Verify OTP
  if (cleanPath === "/auth/otp/verify") {
    return {
      access_token: "demo-jwt-token-" + encodeURIComponent(state.currentPhone),
      refresh_token: "demo-refresh-token",
      token_type: "bearer",
    } as unknown as T;
  }

  // 3. Auth: Refresh
  if (cleanPath === "/auth/refresh") {
    return {
      access_token: "demo-jwt-token-" + encodeURIComponent(state.currentPhone),
      refresh_token: "demo-refresh-token",
      token_type: "bearer",
    } as unknown as T;
  }

  // Current user info
  const user = USERS_DB[state.currentPhone] || {
    name: "Resident User",
    email: "resident@example.com",
    role: "Owner" as const,
    properties: [
      {
        id: "prop-demo",
        society_id: "soc-green-heights",
        society: "Green Heights",
        tower: "Tower B",
        flat: "402",
        role: "Owner" as const,
        address: "Sector 45, Gurugram, Haryana",
        context_type: "unit" as const,
      },
    ],
  };

  // 4. Properties List
  if (cleanPath === "/properties") {
    return user.properties as unknown as T;
  }

  // 5. Resident Profile
  if (cleanPath === "/residents/me") {
    const profile: Profile = {
      id: "usr-" + state.currentPhone.replace(/\D/g, ""),
      name: user.name,
      phone: state.currentPhone,
      email: user.email,
      avatar_id: null,
      preferences: { notifications: true, dark_mode: false },
    };
    return profile as unknown as T;
  }

  // 6. Platform Access
  if (cleanPath === "/platform/access") {
    return { allowed: user.role === "Admin" || user.role === "Secretary" } as unknown as T;
  }

  // 7. Home Dashboard
  if (cleanPath === "/home") {
    const homeData: Home = {
      due: state.bills.find((b) => b.status === "Unpaid")?.amount || 0,
      bill: state.bills[0] || null,
      visitors: state.visitors.slice(0, 3),
      active_complaints: state.complaints.filter((c) => c.status !== "Resolved").length,
      notice: {
        id: "not-1",
        title: "Clubhouse Diwali Celebration & Guidelines",
        content: "Join us this Friday for Diwali lights and cultural evening at the main lawn.",
        category: "Event",
        priority: "Normal",
        published_at: new Date(Date.now() - 3600000 * 8).toISOString(),
        attachments: [],
      },
      booking: null,
      unread: 1,
    };
    return homeData as unknown as T;
  }

  // 8. Notifications
  if (cleanPath.startsWith("/notifications")) {
    const notifications: Notification[] = [
      {
        id: "notif-1",
        title: "Visitor Arrived",
        body: "Swiggy Delivery is at Main Gate for Flat 402.",
        category: "Visitor",
        route: "/visitors",
        read_at: null,
        created_at: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: "notif-2",
        title: "Maintenance Bill Generated",
        body: "October 2026 dues of ₹4,500 are ready for payment.",
        category: "Billing",
        route: "/payments",
        read_at: null,
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
    return notifications as unknown as T;
  }

  // 9. Billing / Payments
  if (cleanPath === "/bills") {
    return {
      items: state.bills,
      total: state.bills.length,
      offset: 0,
      limit: 20,
    } as unknown as T;
  }

  if (cleanPath.startsWith("/bills/")) {
    const id = cleanPath.split("/")[2];
    const bill = state.bills.find((b) => b.id === id) || state.bills[0];
    return bill as unknown as T;
  }

  if (cleanPath === "/payments") {
    return {
      items: state.payments,
      total: state.payments.length,
      offset: 0,
      limit: 20,
    } as unknown as T;
  }

  // 10. Visitors / Invitations
  if (cleanPath === "/visitors") {
    return {
      items: state.visitors,
      total: state.visitors.length,
      offset: 0,
      limit: 20,
    } as unknown as T;
  }

  if (cleanPath === "/visitors/invitations/list") {
    return {
      items: state.invitations,
      total: state.invitations.length,
      offset: 0,
      limit: 20,
    } as unknown as T;
  }

  if (cleanPath.startsWith("/visitors/invitations/")) {
    const id = cleanPath.split("/")[3];
    const inv = state.invitations.find((i) => i.id === id) || state.invitations[0];
    return inv as unknown as T;
  }

  if (cleanPath === "/visitors/invite" && method === "POST") {
    let bodyData: any = {};
    try {
      bodyData = JSON.parse((options.body as string) || "{}");
    } catch {}
    const newInv: Invitation = {
      id: "inv-" + Date.now(),
      name: bodyData.name || "Guest Visitor",
      phone: bodyData.mobile ? "+91" + bodyData.mobile : "+919876543200",
      start_at: new Date().toISOString(),
      end_at: new Date(Date.now() + 14400000).toISOString(),
      pin: String(Math.floor(100000 + Math.random() * 900000)),
      qr_token: "v1-token-" + Date.now(),
      status: "Valid",
      notes: bodyData.notes || "",
      vehicle_number: bodyData.vehicle_number || "",
    };
    state.invitations.unshift(newInv);
    saveState(state);
    return newInv as unknown as T;
  }

  // 11. Guard API
  if (cleanPath === "/guard/visitors/expected") {
    return state.invitations.map((i) => ({
      id: i.id,
      name: i.name,
      phone: i.phone,
      tower: "Tower B",
      flat: "402",
      host: user.name,
      pin: i.pin,
      qr_token: i.qr_token,
      start_at: i.start_at,
      end_at: i.end_at,
      notes: i.notes,
    })) as unknown as T;
  }

  if (cleanPath === "/guard/visitors/active") {
    return state.activeVisitors as unknown as T;
  }

  if (cleanPath === "/guard/parcels/active") {
    const activeParcels: ActiveParcel[] = [
      {
        id: "par-1",
        courier: "Amazon",
        recipient_name: user.name,
        tracking_code: "AMZ-9824",
        tower: "Tower B",
        flat: "402",
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ];
    return activeParcels as unknown as T;
  }

  if (cleanPath === "/guard/visitors/queue") {
    return [] as unknown as T;
  }

  if (cleanPath === "/guard/units") {
    const units: GuardUnit[] = [
      { id: "u-1", tower: "Tower A", flat: "101" },
      { id: "u-2", tower: "Tower A", flat: "1204" },
      { id: "u-3", tower: "Tower B", flat: "402" },
      { id: "u-4", tower: "Tower B", flat: "502" },
      { id: "u-5", tower: "Tower C", flat: "305" },
    ];
    return units as unknown as T;
  }

  if (cleanPath.startsWith("/guard/visitors/admit") || (cleanPath.includes("/admit") && method === "POST")) {
    return { success: true } as unknown as T;
  }

  if (cleanPath.includes("/checkout") && method === "POST") {
    const visitorId = cleanPath.split("/")[3];
    state.activeVisitors = state.activeVisitors.filter((v) => v.id !== visitorId);
    saveState(state);
    return { success: true } as unknown as T;
  }

  if (cleanPath === "/guard/verify-pass") {
    const pass: VerifiedPass = {
      valid: true,
      invitation_id: "inv-1",
      visitor_name: "Rahul Verma",
      visitor_phone: "+919876543299",
      tower: "Tower B",
      flat: "402",
      host_name: user.name,
      valid_from: new Date(Date.now() - 3600000).toISOString(),
      valid_until: new Date(Date.now() + 14400000).toISOString(),
      notes: "Pre-approved friend",
    };
    return pass as unknown as T;
  }

  // 12. Complaints
  if (cleanPath === "/complaints") {
    return {
      items: state.complaints,
      total: state.complaints.length,
      offset: 0,
      limit: 20,
    } as unknown as T;
  }

  if (cleanPath.startsWith("/complaints/")) {
    const id = cleanPath.split("/")[2];
    const comp = state.complaints.find((c) => c.id === id) || state.complaints[0];
    return comp as unknown as T;
  }

  if (cleanPath === "/complaints" && method === "POST") {
    let bodyData: any = {};
    try {
      bodyData = JSON.parse((options.body as string) || "{}");
    } catch {}
    const newComp: Complaint = {
      id: "comp-" + Date.now(),
      title: bodyData.title || "Complaint",
      description: bodyData.description || "",
      category: bodyData.category || "General",
      priority: bodyData.priority || "Normal",
      status: "Submitted",
      created_at: new Date().toISOString(),
      assigned_to: null,
      attachments: [],
      rating: null,
    };
    state.complaints.unshift(newComp);
    saveState(state);
    return newComp as unknown as T;
  }

  // 13. Amenities
  if (cleanPath === "/amenities") {
    const amenities: Amenity[] = [
      {
        id: "am-1",
        name: "Swimming Pool",
        icon: "water-outline",
        description: "Olympic-sized chlorinated pool with children's splash area.",
        opens: 6,
        closes: 22,
        fee: 0,
        cancel_hours: 2,
      },
      {
        id: "am-2",
        name: "Badminton Court",
        icon: "tennisball-outline",
        description: "Indoor wooden synthetic court in the multi-purpose hall.",
        opens: 6,
        closes: 23,
        fee: 10000,
        cancel_hours: 4,
      },
      {
        id: "am-3",
        name: "Clubhouse Banquet Hall",
        icon: "business-outline",
        description: "Air-conditioned banquet venue for family functions and gatherings.",
        opens: 9,
        closes: 23,
        fee: 500000,
        cancel_hours: 24,
      },
      {
        id: "am-4",
        name: "Fitness Gym",
        icon: "barbell-outline",
        description: "Equipped with treadmills, free weights, and cross-trainers.",
        opens: 5,
        closes: 23,
        fee: 0,
        cancel_hours: 0,
      },
    ];
    return amenities as unknown as T;
  }

  // 14. Notices
  if (cleanPath === "/notices" || cleanPath === "/community/notices") {
    const notices: Notice[] = [
      {
        id: "not-1",
        title: "Clubhouse Diwali Celebration & Guidelines",
        content: "Join us this Friday for Diwali lights, sweets and cultural evening at the central lawn.",
        category: "Event",
        priority: "Normal",
        published_at: new Date(Date.now() - 3600000 * 12).toISOString(),
        attachments: [],
      },
      {
        id: "not-2",
        title: "Water Tank Maintenance on Saturday",
        content: "Underground water tank cleaning is scheduled from 10:00 AM to 2:00 PM. Please store water in advance.",
        category: "Maintenance",
        priority: "High",
        published_at: new Date(Date.now() - 86400000).toISOString(),
        attachments: [],
      },
    ];
    return {
      items: notices,
      total: notices.length,
      offset: 0,
      limit: 20,
    } as unknown as T;
  }

  // 15. Vehicles & Family & Staff
  if (cleanPath === "/vehicles") return state.vehicles as unknown as T;
  if (cleanPath === "/residents/family") return state.family as unknown as T;
  if (cleanPath === "/staff") {
    const staff: Staff[] = [
      {
        id: "st-1",
        name: "Sunita Bai",
        kind: "Maid",
        status: "Active",
        last_visit: { id: "sv-1", entry_at: new Date(Date.now() - 3600000 * 4).toISOString(), exit_at: new Date(Date.now() - 3600000 * 2).toISOString() },
      },
      {
        id: "st-2",
        name: "Raju Cook",
        kind: "Cook",
        status: "Active",
        last_visit: null,
      },
    ];
    return staff as unknown as T;
  }

  // 16. Directory / Emergency Contacts
  if (cleanPath === "/directory" || cleanPath === "/guard/directory") {
    const contacts: Contact[] = [
      { id: "dir-1", name: "Society Security Desk", phone: "+911242389100", category: "Gate & Security" },
      { id: "dir-2", name: "Society Estate Manager", phone: "+919876500001", category: "Management" },
      { id: "dir-3", name: "Mukesh Plumber", phone: "+919876500002", category: "Maintenance" },
      { id: "dir-4", name: "Ramesh Electrician", phone: "+919876500003", category: "Maintenance" },
      { id: "dir-5", name: "Local Police Station", phone: "112", category: "Emergency" },
      { id: "dir-6", name: "Fire & Rescue Service", phone: "101", category: "Emergency" },
      { id: "dir-7", name: "Ambulance", phone: "102", category: "Emergency" },
    ];
    return contacts as unknown as T;
  }

  // 17. Admin API
  if (cleanPath === "/admin/stats") {
    const stats: AdminStats = {
      open_complaints: 4,
      active_visitors: state.activeVisitors.length,
      active_parcels: 3,
      total_units: 140,
      total_members: 320,
    };
    return stats as unknown as T;
  }

  if (cleanPath === "/admin/complaints") {
    const adminComplaints: AdminComplaint[] = [
      {
        id: "ac-1",
        title: "Master bedroom AC water seepage",
        description: "Water leaking along outer wall",
        category: "Plumbing",
        priority: "High",
        status: "In Progress",
        assigned_to: "Mukesh Plumber",
        tower: "Tower B",
        flat: "402",
        resident_name: user.name,
        resident_phone: state.currentPhone,
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
    return { items: adminComplaints } as unknown as T;
  }

  if (cleanPath === "/admin/members") {
    const members: AdminMember[] = [
      {
        id: "mem-1",
        user_id: "u-1",
        name: "Vikram Malhotra",
        phone: "+919876543201",
        role: "Admin",
        tower: "Tower A",
        flat: "101",
        active: true,
        created_at: "2026-01-01T00:00:00Z",
      },
      {
        id: "mem-2",
        user_id: "u-2",
        name: "Arjun Sharma",
        phone: "+919876543210",
        role: "Secretary",
        tower: "Tower A",
        flat: "1204",
        active: true,
        created_at: "2026-01-01T00:00:00Z",
      },
      {
        id: "mem-3",
        user_id: "u-3",
        name: "Neha Kapoor",
        phone: "+919876543204",
        role: "Tenant",
        tower: "Tower B",
        flat: "402",
        active: true,
        created_at: "2026-02-15T00:00:00Z",
      },
    ];
    return members as unknown as T;
  }

  if (cleanPath === "/admin/finance/summary") {
    const summary: FinanceSummary = {
      total_billed: 6300000,
      total_collected: 5850000,
      total_outstanding: 450000,
      defaulters_count: 3,
    };
    return summary as unknown as T;
  }

  if (cleanPath === "/admin/finance/defaulters") {
    const defaulters: DefaulterUnit[] = [];
    return defaulters as unknown as T;
  }

  // Fallback for any other endpoints
  return {} as T;
}
