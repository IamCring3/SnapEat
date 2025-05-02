// Copy and paste this code into your browser console when on the AdminProducts page
// to fix products in Firebase with incorrect _base values

async function fixProductsInFirebase() {
  // Check if Firebase is available
  if (!firebase || !firebase.firestore) {
    console.error("Firebase is not available. Make sure you're on the AdminProducts page.");
    return;
  }

  const db = firebase.firestore();
  const productsRef = db.collection('products');
  
  // Map of category names to their correct _base values
  const categoryMappings = {
    "Beverages": "beverages",
    "Baby Care": "babyCare",
    "Hair Care": "hairCare",
    "Personal Care": "personalCare",
    "Skin Care": "skinCare",
    "Home Care": "homeCare",
    "Oral Care": "oralCare",
    "Cleaning & Disinfectants": "cleaningDisinfectant",
    "Stationary": "stationary",
    "Kitchen & Food": "kitchen"
  };
  
  console.log("Fetching all products from Firebase...");
  
  try {
    // Get all products
    const snapshot = await productsRef.get();
    console.log(`Found ${snapshot.docs.length} products in Firebase.`);
    
    let fixCount = 0;
    
    // Check each product
    for (const doc of snapshot.docs) {
      const product = doc.data();
      const category = product.category;
      const currentBase = product._base;
      
      // Check if the category has a mapping and if the _base value is incorrect
      if (category && categoryMappings[category] && currentBase !== categoryMappings[category]) {
        console.log(`Fixing product ${product.name} (ID: ${product._id}): changing _base from ${currentBase} to ${categoryMappings[category]}`);
        
        // Update the product
        await productsRef.doc(doc.id).update({
          _base: categoryMappings[category],
          pageType: categoryMappings[category] // Also update pageType to match _base
        });
        
        fixCount++;
      }
    }
    
    console.log(`Fixed ${fixCount} products in Firebase.`);
    
    if (fixCount > 0) {
      console.log("Refresh the page to see the updated products.");
    } else {
      console.log("No products needed fixing.");
    }
  } catch (error) {
    console.error("Error fixing products:", error);
  }
}

// Run the function
fixProductsInFirebase().catch(error => {
  console.error("Error fixing products:", error);
});
