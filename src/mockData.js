// Pre-configured realistic data for an Electrical CCC (Construction / Cables / Contracting) company

export const initialBranches = [
  {
    id: "loc_main",
    name: "Main Central Warehouse",
    code: "MWH-01",
    type: "warehouse",
    address: "Plot 42, Tejgaon Industrial Area, Dhaka",
    inCharge: "Engr. Rafiqul Islam",
    phone: "+880 1711-234567",
    isMain: true
  },
  {
    id: "loc_site_1",
    name: "Mirpur Metro Substation Site",
    code: "SITE-MIRPUR",
    type: "site",
    address: "Mirpur-10 Circle, Section-6, Dhaka",
    inCharge: "Supervisor Tanvir Ahmed",
    phone: "+880 1819-876543",
    isMain: false
  },
  {
    id: "loc_site_2",
    name: "Uttara Commercial Tower Project",
    code: "SITE-UTTARA",
    type: "site",
    address: "Sector 3, Jasimuddin Avenue, Uttara",
    inCharge: "Site Engr. Sajjad Hossain",
    phone: "+880 1912-345678",
    isMain: false
  },
  {
    id: "loc_site_3",
    name: "Chittagong Port Electrification",
    code: "SITE-CTG",
    type: "site",
    address: "Gate No. 4, Chittagong Port Zone",
    inCharge: "Project Lead Mahmudul Hasan",
    phone: "+880 1611-998877",
    isMain: false
  },
  {
    id: "loc_site_4",
    name: "Savar EPZ Factory Expansion",
    code: "SITE-SAVAR",
    type: "site",
    address: "DEPZ Zone B, Savar, Dhaka",
    inCharge: "Supervisor Kawsar Mia",
    phone: "+880 1715-443322",
    isMain: false
  }
];

export const initialProducts = [
  {
    id: "prod_1",
    name: "BYA 2.5 rm Single Core Cable (Fire Resistant)",
    sku: "CBL-BYA-2.5",
    category: "Cables & Wires",
    unit: "Meters",
    minAlertLevel: 500,
    unitPrice: 58,
    // Stock distributed across locations: { locationId: quantity }
    stock: {
      loc_main: 4500,
      loc_site_1: 850,
      loc_site_2: 400,
      loc_site_3: 1200,
      loc_site_4: 300
    },
    specs: "BDS 901, 450/750V, Copper Conductor, PVC Insulated"
  },
  {
    id: "prod_2",
    name: "NYY 4-Core 16 rm Underground Armored Cable",
    sku: "CBL-NYY-4X16",
    category: "Cables & Wires",
    unit: "Meters",
    minAlertLevel: 200,
    unitPrice: 420,
    stock: {
      loc_main: 1250,
      loc_site_1: 250,
      loc_site_2: 0,
      loc_site_3: 450,
      loc_site_4: 100
    },
    specs: "600/1000V, Heavy Duty Armored XLPE"
  },
  {
    id: "prod_3",
    name: "Schneider 250A 3-Phase MCCB 36kA (Compact NSX)",
    sku: "BRK-SCH-250A",
    category: "Switchgear & Breakers",
    unit: "Pcs",
    minAlertLevel: 10,
    unitPrice: 18500,
    stock: {
      loc_main: 24,
      loc_site_1: 4,
      loc_site_2: 2,
      loc_site_3: 6,
      loc_site_4: 1
    },
    specs: "Thermal-Magnetic Trip Unit, Icu=36kA at 415V"
  },
  {
    id: "prod_4",
    name: "ABB 63A 3-Pole MCB (Type C)",
    sku: "BRK-ABB-63A",
    category: "Switchgear & Breakers",
    unit: "Pcs",
    minAlertLevel: 30,
    unitPrice: 1650,
    stock: {
      loc_main: 180,
      loc_site_1: 35,
      loc_site_2: 20,
      loc_site_3: 40,
      loc_site_4: 15
    },
    specs: "10kA Breaking Capacity, DIN Rail Mounted"
  },
  {
    id: "prod_5",
    name: "Perforated Cable Tray 300mm x 50mm (GI Coated)",
    sku: "TRY-GI-300",
    category: "Cable Trays & Conduits",
    unit: "Lengths (2.5m)",
    minAlertLevel: 40,
    unitPrice: 950,
    stock: {
      loc_main: 160,
      loc_site_1: 30,
      loc_site_2: 50,
      loc_site_3: 20,
      loc_site_4: 10
    },
    specs: "1.5mm thickness, Hot-dip Galvanized Sheet"
  },
  {
    id: "prod_6",
    name: "PVC Conduit Pipe 25mm Heavy Duty",
    sku: "CND-PVC-25",
    category: "Cable Trays & Conduits",
    unit: "Bundles (10pcs)",
    minAlertLevel: 50,
    unitPrice: 1200,
    stock: {
      loc_main: 210,
      loc_site_1: 45,
      loc_site_2: 30,
      loc_site_3: 60,
      loc_site_4: 25
    },
    specs: "High impact resistant, Flame retardant"
  },
  {
    id: "prod_7",
    name: "Distribution Board (MDB 12-Way Double Door)",
    sku: "PNL-DB-12WAY",
    category: "Distribution Boards",
    unit: "Sets",
    minAlertLevel: 5,
    unitPrice: 8900,
    stock: {
      loc_main: 12,
      loc_site_1: 3,
      loc_site_2: 2,
      loc_site_3: 4,
      loc_site_4: 0
    },
    specs: "IP54 Protection, Powder Coated Steel Enclosure"
  },
  {
    id: "prod_8",
    name: "Industrial LED Flood Light 200W IP66",
    sku: "LGT-FLD-200W",
    category: "Lighting & Fixtures",
    unit: "Pcs",
    minAlertLevel: 15,
    unitPrice: 4200,
    stock: {
      loc_main: 45,
      loc_site_1: 12,
      loc_site_2: 8,
      loc_site_3: 18,
      loc_site_4: 6
    },
    specs: "Die-cast Aluminum, 6500K Cool Daylight, 140 lm/W"
  },
  {
    id: "prod_9",
    name: "Copper Earthing Rod 5/8\" x 10ft with Clamp",
    sku: "ERT-COP-10FT",
    category: "Earthing & Protection",
    unit: "Sets",
    minAlertLevel: 25,
    unitPrice: 2800,
    stock: {
      loc_main: 70,
      loc_site_1: 15,
      loc_site_2: 10,
      loc_site_3: 20,
      loc_site_4: 8
    },
    specs: "99.9% Pure Copper Bonded, High Tensile Core"
  },
  {
    id: "prod_10",
    name: "Step-Down Transformer 500 kVA 11/0.415 kV",
    sku: "TRF-OIL-500KVA",
    category: "Transformers & Heavy Equipment",
    unit: "Units",
    minAlertLevel: 1,
    unitPrice: 950000,
    stock: {
      loc_main: 3,
      loc_site_1: 1,
      loc_site_2: 0,
      loc_site_3: 1,
      loc_site_4: 0
    },
    specs: "ONAN Cooling, Dyn11 Vector Group, Off-circuit tap changer"
  }
];

export const initialTransfers = [
  {
    id: "trf_001",
    challanNo: "CH-2026-0182",
    date: "2026-11-06T14:30:00.000Z",
    fromLocationId: "loc_main",
    fromLocationName: "Main Central Warehouse",
    toLocationId: "loc_site_1",
    toLocationName: "Mirpur Metro Substation Site",
    status: "in_transit", // 'in_transit' | 'received' | 'returned'
    vehicleNo: "Dhaka Metro TA-14-8890",
    driverName: "Abul Kashem",
    driverPhone: "+880 1722-114477",
    dispatchedBy: "Engr. Rafiqul Islam (Warehouse Lead)",
    notes: "Urgent dispatch for Main Substation switchboard installation.",
    items: [
      {
        productId: "prod_1",
        productName: "BYA 2.5 rm Single Core Cable (Fire Resistant)",
        sku: "CBL-BYA-2.5",
        unit: "Meters",
        quantity: 500
      },
      {
        productId: "prod_3",
        productName: "Schneider 250A 3-Phase MCCB 36kA (Compact NSX)",
        sku: "BRK-SCH-250A",
        unit: "Pcs",
        quantity: 2
      },
      {
        productId: "prod_6",
        productName: "PVC Conduit Pipe 25mm Heavy Duty",
        sku: "CND-PVC-25",
        unit: "Bundles (10pcs)",
        quantity: 15
      }
    ]
  },
  {
    id: "trf_002",
    challanNo: "CH-2026-0181",
    date: "2026-11-05T09:15:00.000Z",
    fromLocationId: "loc_main",
    fromLocationName: "Main Central Warehouse",
    toLocationId: "loc_site_2",
    toLocationName: "Uttara Commercial Tower Project",
    status: "received",
    vehicleNo: "Dhaka Metro SHA-11-5421",
    driverName: "Md. Jahangir Alam",
    driverPhone: "+880 1833-225566",
    dispatchedBy: "Engr. Rafiqul Islam",
    receivedBy: "Site Engr. Sajjad Hossain",
    receivedDate: "2026-11-05T13:45:00.000Z",
    notes: "Floor 4 to 8 cable riser delivery.",
    items: [
      {
        productId: "prod_5",
        productName: "Perforated Cable Tray 300mm x 50mm (GI Coated)",
        sku: "TRY-GI-300",
        unit: "Lengths (2.5m)",
        quantity: 25
      },
      {
        productId: "prod_4",
        productName: "ABB 63A 3-Pole MCB (Type C)",
        sku: "BRK-ABB-63A",
        unit: "Pcs",
        quantity: 10
      }
    ]
  },
  {
    id: "trf_003",
    challanNo: "CH-2026-0180",
    date: "2026-11-04T16:00:00.000Z",
    fromLocationId: "loc_main",
    fromLocationName: "Main Central Warehouse",
    toLocationId: "loc_site_3",
    toLocationName: "Chittagong Port Electrification",
    status: "received",
    vehicleNo: "Chatto Metro U-12-7711",
    driverName: "Solaiman Mia",
    driverPhone: "+880 1911-002233",
    dispatchedBy: "Engr. Rafiqul Islam",
    receivedBy: "Project Lead Mahmudul Hasan",
    receivedDate: "2026-11-05T08:00:00.000Z",
    notes: "Harbor lighting & high-tension terminal project.",
    items: [
      {
        productId: "prod_2",
        productName: "NYY 4-Core 16 rm Underground Armored Cable",
        sku: "CBL-NYY-4X16",
        unit: "Meters",
        quantity: 300
      },
      {
        productId: "prod_8",
        productName: "Industrial LED Flood Light 200W IP66",
        sku: "LGT-FLD-200W",
        unit: "Pcs",
        quantity: 12
      }
    ]
  }
];

export const initialSiteUsages = [
  {
    id: "usg_01",
    date: "2026-11-05T17:00:00.000Z",
    locationId: "loc_site_1",
    locationName: "Mirpur Metro Substation Site",
    productId: "prod_1",
    productName: "BYA 2.5 rm Single Core Cable (Fire Resistant)",
    quantity: 150,
    unit: "Meters",
    workDescription: "Installed internal lighting circuits for Control Room 1",
    reportedBy: "Supervisor Tanvir Ahmed"
  },
  {
    id: "usg_02",
    date: "2026-11-04T18:30:00.000Z",
    locationId: "loc_site_3",
    locationName: "Chittagong Port Electrification",
    productId: "prod_8",
    productName: "Industrial LED Flood Light 200W IP66",
    quantity: 6,
    unit: "Pcs",
    workDescription: "Mounted on High Mast Tower #2 for Quay area illumination",
    reportedBy: "Project Lead Mahmudul Hasan"
  }
];
