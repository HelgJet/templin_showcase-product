# templin_showcase-product

🧩 Showcase Product Tabs Section – Documentation

1. Section Overview & Features

---

The Showcase Product (Tabs) section displays selected collections in a tabbed layout. Each tab can show a collection's products, a custom image, and even a sale banner with a countdown timer.

Key Features:

- Supports horizontal or vertical tab layout
- Mobile-friendly product slider using Swiper.js
- Shows a sale banner with countdown for a chosen collection
- Supports Quick View with product loading via AJAX
- Allows displaying:
  - Product labels (e.g., “New”)
  - Product metafields (e.g., ratings, custom tags)

2. How to Install in a Theme

---

🔧 File Structure

After unzipping the folder:

- sections/tpl_showcase-product.liquid – The main section file.
- snippets/tpl_product-card.liquid – A snippet used to render each product.
- templates/products/tpl_quick-view-modal.liquid – Optional view template for Quick View AJAX loading.

🪛 Installation Steps

1. Move files:

   - Place the .liquid section file into your theme’s sections/ folder.
   - Place the tpl_product-card.liquid snippet into the snippets/ folder.
   - If using Quick View, create templates/products/tpl_quick-view-modal.liquid.

2. Enable the section in your theme:

   - Open your theme editor (Online Store → Themes → Customize).
   - Add the "Showcase Product (Tabs)" section to a page.

3. Section Settings

---

| Setting               | Type       | Description                                   |
| --------------------- | ---------- | --------------------------------------------- |
| Section Title         | Text       | Optional title for the section                |
| Tab Layout            | Select     | horizontal or vertical tab alignment          |
| Limit                 | Range      | Max products per tab (2–12)                   |
| Slider                | Checkbox   | Enable Swiper.js slider on mobile             |
| Columns               | Select     | Number of products per row on desktop         |
| Sale Collection       | Collection | Collection to show countdown banner           |
| Sale Text             | Richtext   | Text for the sale banner                      |
| Sale Image            | Image      | Background image for the banner               |
| "New" Products Period | Text       | Days after which a product is no longer "new" |

Each tab (block) also lets you choose:

- A collection
- A tab image
- A custom tab title

4. Using Metafields

---

This section supports custom metafields from Collections and Products.

🧷 Collection Metafield: Countdown

Path: collection.metafields.custom.countdown  
Type: Date

This metafield controls the countdown timer for the sale banner.

> When the value is in the future, the banner is displayed under the product grid.

⭐ Product Metafields

These are used inside tpl_product-card.liquid.

| Metafield                              | Type             | Purpose                                                    |
| -------------------------------------- | ---------------- | ---------------------------------------------------------- |
| product.metafields.custom.rating       | Rating           | Display star ratings                                       |
| product.metafields.custom.custom_label | Single line text | Display custom label on product cards (e.g. “Best Seller”) |

💡 You can update the product card snippet to render these fields visually.

5. Storefront API & Dev App Access

---

To use Quick View and AJAX Add to Cart, the section makes Storefront API requests to fetch product info and check inventory.

You’ll need to:

1. Create a private Shopify App or a custom app from the Partner Dashboard
2. Enable Storefront API access
3. Copy the Storefront API access token
4. Paste it into the JS code here:

headers: {
'Content-Type': 'application/json',
'X-Shopify-Storefront-Access-Token': 'YOUR_ACCESS_TOKEN_HERE'
}

## ✅ Final Notes

- Compatible with all modern Shopify themes (Online Store 2.0+)
- Fully responsive
- Requires metafields to be set up beforehand in Shopify Admin
