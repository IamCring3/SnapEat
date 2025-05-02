#!/usr/bin/env python3
import json
import os
import sys
import re

# Define the expected category mappings
CATEGORY_MAPPINGS = {
    "Beverages": "beverages",
    "Baby Care": "babyCare",
    "Hair Care": "hairCare",
    "Personal Care": "personalCare",
    "Skin Care": "skinCare",
    "Home Care": "homeCare",
    "Oral Care": "oralCare",
    "Cleaning & Disinfectants": "cleaningDisinfectant",
    "Stationary": "stationary"
}

def extract_products_from_js(file_path):
    """Extract product data from JavaScript file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find the products array
        products_match = re.search(r'export\s+const\s+products\s*=\s*\[([\s\S]*?)\];', content)
        if not products_match:
            print(f"Could not find products array in {file_path}")
            return []
        
        # Extract the products array content
        products_content = products_match.group(1)
        
        # Convert to valid JSON by replacing JavaScript object syntax with JSON
        # This is a simplified approach and might not work for all cases
        products_json = "["
        
        # Split by product objects (assuming each product starts with '{')
        product_objects = re.findall(r'\{\s*_id:.*?},', products_content, re.DOTALL)
        
        for i, product in enumerate(product_objects):
            # Replace JavaScript property names with JSON property names
            product_json = product.replace("'", '"').replace(",\n}", "\n}")
            
            # Replace property names without quotes
            product_json = re.sub(r'(\s*)(\w+):', r'\1"\2":', product_json)
            
            # Fix trailing comma
            if product_json.endswith(','):
                product_json = product_json[:-1]
            
            products_json += product_json
            if i < len(product_objects) - 1:
                products_json += ","
        
        products_json += "]"
        
        # Try to parse the JSON
        try:
            return json.loads(products_json)
        except json.JSONDecodeError as e:
            print(f"Error parsing products JSON: {e}")
            # Save the problematic JSON for inspection
            with open('problematic_json.json', 'w') as f:
                f.write(products_json)
            print("Saved problematic JSON to 'problematic_json.json'")
            return []
            
    except Exception as e:
        print(f"Error reading file {file_path}: {e}")
        return []

def analyze_products(products):
    """Analyze products for category and _base field inconsistencies."""
    category_counts = {}
    base_counts = {}
    category_base_mismatches = []
    missing_base = []
    
    for product in products:
        category = product.get('category', 'Unknown')
        base = product.get('_base', 'Missing')
        
        # Count categories
        if category in category_counts:
            category_counts[category] += 1
        else:
            category_counts[category] = 1
        
        # Count _base values
        if base in base_counts:
            base_counts[base] += 1
        else:
            base_counts[base] = 1
        
        # Check for missing _base
        if base == 'Missing':
            missing_base.append(product)
            continue
        
        # Check for category-base mismatches
        expected_base = CATEGORY_MAPPINGS.get(category)
        if expected_base and base != expected_base:
            category_base_mismatches.append({
                'id': product.get('_id', 'Unknown'),
                'name': product.get('name', 'Unknown'),
                'category': category,
                'actual_base': base,
                'expected_base': expected_base
            })
    
    return {
        'category_counts': category_counts,
        'base_counts': base_counts,
        'category_base_mismatches': category_base_mismatches,
        'missing_base': missing_base
    }

def print_analysis(analysis):
    """Print the analysis results."""
    print("\n=== PRODUCT ANALYSIS ===\n")
    
    print("Category Counts:")
    for category, count in sorted(analysis['category_counts'].items(), key=lambda x: x[1], reverse=True):
        print(f"  {category}: {count}")
    
    print("\nBase Value Counts:")
    for base, count in sorted(analysis['base_counts'].items(), key=lambda x: x[1], reverse=True):
        print(f"  {base}: {count}")
    
    print("\nCategory-Base Mismatches:")
    if analysis['category_base_mismatches']:
        for mismatch in analysis['category_base_mismatches']:
            print(f"  Product: {mismatch['name']} (ID: {mismatch['id']})")
            print(f"    Category: {mismatch['category']}")
            print(f"    Actual _base: {mismatch['actual_base']}")
            print(f"    Expected _base: {mismatch['expected_base']}")
            print()
    else:
        print("  No mismatches found.")
    
    print("Products Missing _base Field:")
    if analysis['missing_base']:
        for product in analysis['missing_base']:
            print(f"  {product.get('name', 'Unknown')} (ID: {product.get('_id', 'Unknown')})")
    else:
        print("  No products missing _base field.")

def main():
    # Check if constants file path is provided
    if len(sys.argv) > 1:
        constants_file = sys.argv[1]
    else:
        # Default path
        constants_file = os.path.join('admin', 'constants', 'index.mjs')
    
    print(f"Analyzing products from {constants_file}...")
    products = extract_products_from_js(constants_file)
    
    if not products:
        print("No products found or could not parse products data.")
        return
    
    print(f"Found {len(products)} products.")
    analysis = analyze_products(products)
    print_analysis(analysis)
    
    # Provide specific advice for beverages category
    beverages_count = analysis['category_counts'].get('Beverages', 0)
    beverages_base_count = analysis['base_counts'].get('beverages', 0)
    
    print("\n=== SPECIFIC CATEGORY ANALYSIS ===\n")
    print(f"Beverages category: {beverages_count} products")
    print(f"beverages _base: {beverages_base_count} products")
    
    if beverages_count > beverages_base_count:
        print("ISSUE DETECTED: Some Beverages products have incorrect _base values!")
        print("This is why they're not showing up in the beverages category page.")
    
    # Check other categories
    for category, base in CATEGORY_MAPPINGS.items():
        cat_count = analysis['category_counts'].get(category, 0)
        base_count = analysis['base_counts'].get(base, 0)
        
        if cat_count != base_count:
            print(f"\n{category} category: {cat_count} products")
            print(f"{base} _base: {base_count} products")
            if cat_count > base_count:
                print(f"ISSUE DETECTED: Some {category} products have incorrect _base values!")

if __name__ == "__main__":
    main()
