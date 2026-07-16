# 🛍️ E-Millenial Store (EMS)

A premium, responsive frontend e-commerce website designed for gadgets, featuring a dynamic shopping cart system and functional **Paystack Checkout** integration (Test Mode).

---

## 📋 Features Checklist

* **Responsive Navbar & Mobile Menu**: Header collapses into a clean mobile hamburger navigation menu on small screens.
* **Product Grid Gallery**: Renders 6 electronic gadgets dynamically with direct "Add to Cart" and "Remove from Cart" status buttons.
* **Cart Badge Count**: Cart badge in the header dynamically reflects the number of *unique items* in the cart (not total quantity).
* **Sliding Cart Sidebar Modal**: Open and close the cart using the navigation badge, containing three main operational sections:
  1. **Items List**: Allows users to increase or decrease quantities (minimum of 1) and calculate subtotals, or remove items entirely.
  2. **Details Form**: Fields for Full Name, Email Address, and Phone Number.
  3. **Total Price**: Reflects the dynamic sum of all items multiplied by their individual quantities.
* **Form Field Validation**: Custom JS validators trigger real-time color highlights (green for valid, red for invalid) and display error messages on field blur.
* **Paystack Integration**: Integrates the Paystack Inline Checkout popup. Auto-converts the final Ghana Cedi total to pesewas.
* **Personalized Order Summary Receipt**: On payment success, a checkmark modal appears displaying a customized thank-you header and a summary table of items purchased.
* **Page Reset**: Closing the summary clears all cart storage and reloads the page to a fresh state.

---

## 📂 File Directory

```text
E-Commerce Store/
├── index.html       # Landing page sections & overlay modals markup
├── style.css        # Responsive layouts, slide transitions, and animations
├── app.js           # Gallery rendering, validation, and Paystack handlers
└── images/          # Assets folder
    ├── EMS.svg      # Navigation logo
    ├── cart.svg     # Shopping cart icon
    ├── check.svg    # Payment success checkmark
    ├── heroImage.svg# Hero banner illustration
    └── product*.png # Product image files (1-6)
```

---

## ⚡ How to Run Locally

Since this is a client-side frontend project, you can run it directly:

1. Double-click the `index.html` file inside the `E-Commerce Store` folder to open it in any web browser.
2. *Alternative*: Right-click `index.html` and choose **Open with Live Server** if you are using an IDE like VS Code.

---

## 💳 Testing the Paystack Checkout

When checking out:
1. Fill in the **Your Details** form inside the cart sidebar. Ensure the phone number contains **10 or 11 digits** (e.g. `0553776346`).
2. Click **Checkout**.
3. The Paystack Checkout popup will overlay on the screen in **Test Mode**.
4. You can simulate a successful transaction by selecting any of the mock options inside the Paystack window (e.g., Success).
5. Upon confirmation, the checkout modal will close, and the custom **Summary Modal** receipt will display.
