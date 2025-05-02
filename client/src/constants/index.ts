// Constants for the client application

const cat = {
  oralCare: "oralCare",
  babyCare: "babyCare",
  beverages: "beverages",
  cleaningDisinfectant: "cleaning & disinfectant",
  hairCare: "hairCare",
  homeCare: "homeCare",
  kitchen: "kitchen",
  personalCare: "personalCare",
  skinCare: "skinCare",
  stationary: "stationary",
};

export const categories = [
  {
    _id: 1001,
    name: "Oral Care",
    image: "https://i.ibb.co/kM0FR2h/cat-Tv-Audio.webp",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis repellendus dolore.",
    _base: "oralCare",
    colors: ["black"] as [string]
},
  {
    _id: 1002,
    name: "Baby Care",
    image: "https://i.ibb.co/71hR65V/catTvBox.webp",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis repellendus dolore.",
    _base: "babyCare",
    colors: ["black"] as [string]
},
  {
    _id: 1003,
    name: "Beverages",
    image: "https://i.ibb.co/0V0g6Gz/cat-Powertool.webp",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis repellendus dolore.",
    _base: "beverages",
    colors: ["black"] as [string]
},
  {
    _id: 1004,
    name: "Cleaning & Disinfectant",
    image: "https://i.ibb.co/zST2Xdp/cat-Headphone.webp",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis repellendus dolore.",
    _base: "cleaningDisinfectant",
    colors: ["black"] as [string]
},
  {
    _id: 1005,
    name: "Hair Care",
    image: "https://i.ibb.co/jgk59BL/catPhone.webp",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis repellendus dolore.",
    _base: "hairCare",
    colors: ["black"] as [string]
},
  {
    _id: 1006,
    name: "Home Care",
    image: "https://i.ibb.co/B4NKfBZ/cat-Smart-Watch.webp",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis repellendus dolore.",
    _base: "homeCare",
    colors: ["black"] as [string]
},

  {
    _id: 1008,
    name: "Personal Care",
    image: "https://i.ibb.co/xjpdQrr/cat-Robot-Clean.webp",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis repellendus dolore.",
    _base: "personalCare",
    colors: ["black"] as [string]
},
  {
    _id: 1009,
    name: "Skin Care",
    image: "https://i.ibb.co/HdNVLzh/cat-Sport-Watch.webp",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis repellendus dolore.",
    _base: "skinCare",
    colors: ["black"] as [string]
},
  {
    _id: 1010,
    name: "Stationary",
    image: "https://i.ibb.co/qCzTx4F/cat-Tablet.webp",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis repellendus dolore.",
    _base: "stationary",
    colors: ["black"] as [string]
},

  {
    _id: 1013,
    name: "Kitchen & Food",
    image: "https://i.ibb.co/Kj8wXMz/food-category.jpg",
    description: "Delicious food items including fried rice, noodles, and various meat dishes.",
    _base: "kitchen",
    isKitchenPage: true,
    colors: ["black"] as [string]
},
];

export const highlightsProducts = [
  {
    _id: 3001,
    name: "Pet Supplies",
    title: "food, treats, toys, and more",
    buttonTitle: "Shop now",
    image: "https://i.ibb.co/S73fs9fm/petbanner.webp",
    _base: "/product",
    color: "#000000",
    colors: ["black"] as [string]
},
  {
    _id: 3002,
    name: "Baby Care",
    title: "Get baby care essentials in minutes",
    buttonTitle: "Shop now",
    image: "https://i.ibb.co/TD7MTBgm/61489237316811-Y3-Jvc-Cw0-MDUs-Mz-E3-LDAs-MA.jpg",
    _base: "/category/babyCare",
    color: "#000000",
    colors: ["black"] as [string]
},
  {
    _id: 3003,
    name: "Pharmacy at your doorstep",
    title: "cough syrup, pain relief sprays, and more",
    buttonTitle: "Shop Now",
    image: "https://i.ibb.co/0pMWpgkM/pharmacy-banner.jpg",
    _base: "/product",
    color: "#000000",
    colors: ["black"] as [string]
},
];

export const products = [
  // --- CSV IMPORTED PRODUCTS START ---
  {
    _id: 2100,
    name: "Lizol - Citrus",
    images: ["https://griepit.in/wp-content/uploads/2025/03/61W8NHxqS8L._SX679_.jpg"],
    description: "Lizol - Citrus cleaning liquid.",
    regularPrice: 116,
    discountedPrice: 116,
    quantity: 1,
    rating: 4.5,
    reviews: 0,
    category: "Cleaning & Disinfectants",
    brand: "Lizol",
    isStock: true,
    isNew: true,
    overView: "Cleaning Liquid",
    _base: cat?.cleaningDisinfectant,
    pageType: "cleaning",
    colors: ["black"] as [string]
},
  {
    _id: 2101,
    name: "Lizol Disinfectant Surface Cleaner - Floral",
    images: ["https://i.ibb.co/Fq3LHjk7/Lizol-Disinfectant-Surface-Cleaner-Floral.jpg"],
    description: "Lizol Disinfectant Surface Cleaner - Floral.",
    regularPrice: 116,
    discountedPrice: 116,
    quantity: 1,
    rating: 4.5,
    reviews: 0,
    category: "Cleaning & Disinfectants",
    brand: "Lizol",
    isStock: true,
    isNew: true,
    overView: "Surface Cleaner",
    _base: cat?.cleaningDisinfectant,
    pageType: "cleaning",
    colors: ["black"] as [string]
},
  {
    _id: 2102,
    name: "Harpic",
    images: ["https://i.ibb.co/27PkMcLL/Harpic.jpg"],
    description: "Harpic toilet cleaner.",
    regularPrice: 44,
    discountedPrice: 44,
    quantity: 1,
    rating: 4.5,
    reviews: 0,
    category: "Cleaning & Disinfectants",
    brand: "Harpic",
    isStock: true,
    isNew: true,
    overView: "Toilet Cleaner",
    _base: cat?.cleaningDisinfectant,
    pageType: "cleaning",
    colors: ["black"] as [string]
},
  {
    _id: 2103,
    name: "Robin - Fabric Whiteness",
    images: ["https://i.ibb.co/kVJJk5wB/Robin-Fabric-Whiteness.jpg"],
    description: "Robin - Fabric Whiteness for laundry.",
    regularPrice: 39,
    discountedPrice: 39,
    quantity: 1,
    rating: 4.5,
    reviews: 0,
    category: "Cleaning & Disinfectants",
    brand: "Robin",
    isStock: true,
    isNew: true,
    overView: "Laundry",
    _base: cat?.cleaningDisinfectant,
    pageType: "cleaning",
    colors: ["black"] as [string]
},
  {
    _id: 2104,
    name: "Patanjali Super Dishwash Bar",
    images: ["https://i.ibb.co/PGgV1zK3/Patanjali-Super-Dishwash-Bar.webp"],
    description: "Patanjali Super Dishwash Bar for utensils.",
    regularPrice: 10,
    discountedPrice: 10,
    quantity: 1,
    rating: 4.5,
    reviews: 0,
    category: "Cleaning & Disinfectants",
    brand: "Patanjali",
    isStock: true,
    isNew: true,
    overView: "Dishwash Bar",
    _base: cat?.cleaningDisinfectant,
    pageType: "cleaning",
    colors: ["black"] as [string]
},
  {
    _id: 2105,
    name: "Odopic Dishwash Bar",
    images: ["https://i.ibb.co/WvSt4cjj/Odopic-Dishwash-Bar.webp"],
    description: "Odopic Dishwash Bar for utensils.",
    regularPrice: 60,
    discountedPrice: 60,
    quantity: 1,
    rating: 4.5,
    reviews: 0,
    category: "Cleaning & Disinfectants",
    brand: "Odopic",
    isStock: true,
    isNew: true,
    overView: "Dishwash Bar",
    _base: cat?.cleaningDisinfectant,
    pageType: "cleaning",
    colors: ["black"] as [string]
},
  {
    _id: 2106,
    name: "Tide Washing Powder - Jasmine & Rose",
    images: ["https://i.ibb.co/RTygC3B4/Tide-Washing-Powder-Jasmine-Rose.webp"],
    description: "Tide Washing Powder - Jasmine & Rose fragrance.",
    regularPrice: 10,
    discountedPrice: 10,
    quantity: 1,
    rating: 4.5,
    reviews: 0,
    category: "Cleaning & Disinfectants",
    brand: "Tide",
    isStock: true,
    isNew: true,
    overView: "Washing Powder",
    _base: cat?.cleaningDisinfectant,
    pageType: "cleaning",
    colors: ["black"] as [string]
},
  // --- CSV IMPORTED PRODUCTS END ---
  {
    _id: 2107,
    name: "Dettol Liquid Hand Wash",
    images: ["https://i.ibb.co/pjZ62sjw/Dettol-Liquid-Hand-Wash.webp"],
    description: "Dettol Liquid Hand Wash for hygiene.",
    regularPrice: 99,
    discountedPrice: 99,
    quantity: 1,
    rating: 4.5,
    reviews: 0,
    category: "Cleaning & Disinfectants",
    brand: "Dettol",
    isStock: true,
    isNew: true,
    overView: "Hand Wash",
    _base: cat?.cleaningDisinfectant,
    pageType: "cleaning",
    colors: ["black"] as [string]
},
  {
    _id: 2108,
    name: "Dettol Sensitive Liquid Hand Wash Refiller",
    images: ["https://i.ibb.co/1GtCkqR7/Dettol-Sensitive-Liquid-Hand-Wash-Refiller.webp"],
    description: "Dettol Sensitive Liquid Hand Wash Refiller.",
    regularPrice: 50,
    discountedPrice: 50,
    quantity: 1,
    rating: 4.5,
    reviews: 0,
    category: "Cleaning & Disinfectants",
    brand: "Dettol",
    isStock: true,
    isNew: true,
    overView: "Hand Wash Refiller",
    _base: cat?.cleaningDisinfectant,
    pageType: "cleaning",
    colors: ["black"] as [string]
},
  {
    _id: 2109,
    name: "Colin Glass Cleaner",
    images: ["https://i.ibb.co/JwPy559f/Colin-Glass-Cleaner.webp"],
    description: "Colin Glass Cleaner for shiny surfaces.",
    regularPrice: 109,
    discountedPrice: 109,
    quantity: 1,
    rating: 4.5,
    reviews: 0,
    category: "Cleaning & Disinfectants",
    brand: "Colin",
    isStock: true,
    isNew: true,
    overView: "Glass Cleaner",
    _base: cat?.cleaningDisinfectant,
    pageType: "cleaning",
    colors: ["black"] as [string]
},
  {
    _id: 2110,
    name: "Vivel Soap - Lime and Aloe Vera",
    images: ["https://i.ibb.co/TDTR8X2c/Vivel-Soap-Lime-and-Aloe-Vera.jpg"],
    description: "Vivel Soap with Lime and Aloe Vera.",
    regularPrice: 40,
    discountedPrice: 40,
    quantity: 1,
    rating: 4.5,
    reviews: 0,
    category: "Personal Care",
    brand: "Vivel",
    isStock: true,
    isNew: true,
    overView: "Soap",
    _base: cat?.personalCare,
    pageType: "personalCare",
    colors: ["black"] as [string]
},
  // Add more products as needed
  {
    _id: 2026,
    name: "Pork Fried Rice",
    images: [
      "https://i.ibb.co/PsQbvfyY/Pork-Fried-Rice.jpg",

    ],
    description: "Delicious pork fried rice made with fresh ingredients and authentic spices.",
    regularPrice: 190,
    discountedPrice: 190,
    quantity: 1,
    rating: 4.5,
    reviews: 50,
    category: "Kitchen & Food",
    brand: "Kitchen Specials",
    isStock: true,
    overView: "Fried Rice",
    isNew: true,
    _base: cat?.kitchen,
    isKitchenOnly: true,
    pageType: "kitchen",
    colors: ["black"] as [string]
},
  {
    _id: 2027,
    name: "Chicken Fried Rice",
    images: [
      "https://i.ibb.co/NgZY3hw6/Chicken-Fried-Rice.png"
    ],
    description: "Classic chicken fried rice prepared with tender chicken pieces and fresh vegetables.",
    regularPrice: 180,
    discountedPrice: 180,
    quantity: 1,
    rating: 4.5,
    reviews: 45,
    category: "Kitchen & Food",
    brand: "Kitchen Specials",
    isStock: true,
    overView: "Fried Rice",
    isNew: true,
    _base: cat?.kitchen,
    isKitchenOnly: true,
    pageType: "kitchen"
  }
];
