// Copy and paste this code into your browser console when on the AdminProducts page
// to add the sample products to Firebase

async function addSampleProductsToFirebase() {
  // Check if Firebase is available
  if (!firebase || !firebase.firestore) {
    console.error("Firebase is not available. Make sure you're on the AdminProducts page.");
    return;
  }

  const db = firebase.firestore();
  const productsRef = db.collection('products');
  
  // Sample products to add
  const sampleProducts = [
    // Beverages
    {
      _id: 4001,
      name: "Coca-Cola",
      images: ["https://i.ibb.co/Jt7v1C8/johnsons-baby-shampoo.jpg"],
      description: "Refreshing cola beverage.",
      regularPrice: 40,
      discountedPrice: 40,
      quantity: 1,
      rating: 4.8,
      reviews: 150,
      category: "Beverages",
      brand: "Coca-Cola",
      isStock: true,
      isNew: true,
      overView: "Soft Drink",
      _base: "beverages",
      pageType: "beverages"
    },
    {
      _id: 4002,
      name: "Pepsi",
      images: ["https://i.ibb.co/Jt7v1C8/johnsons-baby-shampoo.jpg"],
      description: "Classic cola beverage.",
      regularPrice: 40,
      discountedPrice: 40,
      quantity: 1,
      rating: 4.7,
      reviews: 140,
      category: "Beverages",
      brand: "Pepsi",
      isStock: true,
      isNew: true,
      overView: "Soft Drink",
      _base: "beverages",
      pageType: "beverages"
    },
    {
      _id: 4003,
      name: "Sprite",
      images: ["https://i.ibb.co/Jt7v1C8/johnsons-baby-shampoo.jpg"],
      description: "Lemon-lime flavored soft drink.",
      regularPrice: 40,
      discountedPrice: 40,
      quantity: 1,
      rating: 4.6,
      reviews: 130,
      category: "Beverages",
      brand: "Sprite",
      isStock: true,
      isNew: true,
      overView: "Soft Drink",
      _base: "beverages",
      pageType: "beverages"
    },
    
    // Home Care
    {
      _id: 5001,
      name: "Home Care Product 1",
      images: ["https://i.ibb.co/Jt7v1C8/johnsons-baby-shampoo.jpg"],
      description: "Sample product for Home Care category.",
      regularPrice: 40,
      discountedPrice: 40,
      quantity: 1,
      rating: 4.5,
      reviews: 50,
      category: "Home Care",
      brand: "Sample Brand",
      isStock: true,
      isNew: true,
      overView: "Home Care",
      _base: "homeCare",
      pageType: "homeCare"
    },
    {
      _id: 5002,
      name: "Home Care Product 2",
      images: ["https://i.ibb.co/Jt7v1C8/johnsons-baby-shampoo.jpg"],
      description: "Sample product for Home Care category.",
      regularPrice: 50,
      discountedPrice: 50,
      quantity: 1,
      rating: 4.6,
      reviews: 60,
      category: "Home Care",
      brand: "Sample Brand",
      isStock: true,
      isNew: true,
      overView: "Home Care",
      _base: "homeCare",
      pageType: "homeCare"
    },
    {
      _id: 5003,
      name: "Home Care Product 3",
      images: ["https://i.ibb.co/Jt7v1C8/johnsons-baby-shampoo.jpg"],
      description: "Sample product for Home Care category.",
      regularPrice: 60,
      discountedPrice: 60,
      quantity: 1,
      rating: 4.7,
      reviews: 70,
      category: "Home Care",
      brand: "Sample Brand",
      isStock: true,
      isNew: true,
      overView: "Home Care",
      _base: "homeCare",
      pageType: "homeCare"
    }
  ];
  
  console.log(`Adding ${sampleProducts.length} sample products to Firebase...`);
  
  // Add each product to Firebase
  for (const product of sampleProducts) {
    try {
      // Check if product already exists
      const docRef = productsRef.doc(product._id.toString());
      const doc = await docRef.get();
      
      if (doc.exists) {
        console.log(`Product ${product.name} (ID: ${product._id}) already exists, updating...`);
      } else {
        console.log(`Adding new product: ${product.name} (ID: ${product._id})`);
      }
      
      // Add or update the product
      await docRef.set(product);
      console.log(`Successfully added/updated product: ${product.name}`);
    } catch (error) {
      console.error(`Error adding product ${product.name}:`, error);
    }
  }
  
  console.log("Done! Refresh the page to see the new products.");
}

// Run the function
addSampleProductsToFirebase().catch(error => {
  console.error("Error adding sample products:", error);
});
