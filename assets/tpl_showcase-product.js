document.addEventListener("DOMContentLoaded", () => {
  // Find all .quick-view-btn
  const quickViewButtons = document.querySelectorAll(".quick-view-btn");
  quickViewButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const sectionId = btn.closest("showcase-product")?.dataset.sectionId;
      const modal = document.querySelector(
        `quick-view-modal[data-section-id="${sectionId}"]`
      );

      if (modal) {
        // Call method .open(handle)
        modal.open(btn.dataset.handle, btn.closest(".product-card"));
      }
    });
  });
});

if (!customElements.get("showcase-product")) {
  class ShowcaseProduct extends HTMLElement {
    constructor() {
      super();
      this.sectionEl = this;
      this.tabContainer = this.querySelector(".tabs");
      this.allTabBtns = this.tabContainer.querySelectorAll(".collection-tab");
      this.allCollections = this.querySelectorAll(".collection-products");
    }

    connectedCallback() {
      this.initTabs();
    }

    initTabs() {
      this.allTabBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          this.allTabBtns.forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          const tabIndex = btn.dataset.tabIndex;
          this.allCollections.forEach((col) => {
            col.classList.remove("active");
          });
          const target = this.querySelector(
            `.collection-products[data-tab-content="${tabIndex}"]`
          );
          if (target) {
            target.classList.add("active");
          }
        });
      });
    }
  }

  customElements.define("showcase-product", ShowcaseProduct);
}

// *** Countdown Timer ***
if (!customElements.get("countdown-timer")) {
  class CountdownTimer extends HTMLElement {
    constructor() {
      super();

      const dataCountDown = this.getAttribute("data-datetime");
      this.countDown = new Date(dataCountDown);

      const { days, hours, minutes, seconds } = this.getDOMElements();

      this.interval = setInterval(() => {
        const now = new Date();
        const distance = Date.parse(this.countDown) - Date.parse(now);

        days.innerText = this.setDataTime(
          Math.floor(distance / (1000 * 60 * 60 * 24))
        );
        hours.innerText = this.setDataTime(
          Math.floor((distance / (1000 * 60 * 60)) % 24)
        );
        minutes.innerText = this.setDataTime(
          Math.floor((distance / 1000 / 60) % 60)
        );
        seconds.innerText = this.setDataTime(
          Math.floor((distance / 1000) % 60)
        );

        if (distance <= 0) {
          clearInterval(this.interval);
          this.classList.add("hidden");
        }
      }, 1000);
    }

    getDOMElements() {
      return {
        days: this.querySelector("[data-days]"),
        hours: this.querySelector("[data-hours]"),
        minutes: this.querySelector("[data-minutes]"),
        seconds: this.querySelector("[data-seconds]"),
      };
    }

    setDataTime(itemTime) {
      return itemTime < 10 ? `0${itemTime}` : itemTime;
    }
  }

  customElements.define("countdown-timer", CountdownTimer);
}
// *** Quick View + ATC via Storefront API ***

/**
 * Checks if a given element is currently visible within the viewport.
 * @param {HTMLElement} element
 * @returns {boolean}
 */
function isElementInViewport(element) {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

if (!customElements.get("quick-view-modal")) {
  class QuickViewModal extends HTMLElement {
    constructor() {
      super();
      // The element from which the modal was opened (for scrolling back upon close).
      this._originEl = null;
    }

    connectedCallback() {
      // Grab references to the relevant child elements.
      this.closeBtn = this.querySelector(".quick-view-close");
      this.preloader = this.querySelector(".preloader");
      this.productContainer = this.querySelector(".product-single");

      // Close modal when clicking the "×" button
      this.closeBtn?.addEventListener("click", () => this.close());
    }

    /**
     * Opens the modal, fetches product data from /products/{handle}?view=tpl_quick-view-modal,
     * and populates .product-single with the response.
     * @param {string} productHandle - The product handle (slug).
     * @param {HTMLElement} originEl - The element from which the modal was opened.
     */

    open(productHandle, originEl) {
      if (!productHandle || !originEl) return;
      this.modalEl = this;
      this._originEl = originEl;
      this.productContainer = this.querySelector(".product-single");
      this.preloader = this.querySelector(".preloader");

      this.productContainer.innerHTML = "";
      this.showPreloader();
      this.hidden = false;

      this.scrollIntoView({ behavior: "smooth", block: "start" });

      fetch(`/products/${productHandle}?view=tpl_quick-view-modal`)
        .then((resp) => resp.text())
        .then((html) => {
          this.hidePreloader();

          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");
          const productHTML = doc.querySelector(".product-single");

          if (productHTML) {
            this.productContainer.innerHTML = productHTML.innerHTML;

            this.initQuantityButtons();
            this.initAddToCart(productHandle);
          }
        })
        .catch((err) => {
          console.error("QuickViewModal error:", err);
          this.hidePreloader();
        });
    }

    /**
     * Closes the modal and, if the origin element is not in the viewport,
     * scrolls back to it.
     */
    close() {
      this.modalEl.hidden = true;
      if (this._originEl && !isElementInViewport(this._originEl)) {
        this._originEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    /** Shows the preloader (spinner or loading indicator). */
    showPreloader() {
      if (this.preloader) {
        this.preloader.hidden = false;
      }
    }

    /** Hides the preloader. */
    hidePreloader() {
      if (this.preloader) {
        this.preloader.hidden = true;
      }
    }

    /**
     * Initializes the quantity increment/decrement buttons (.qty-plus, .qty-minus)
     * to update the numeric input for quantity.
     */
    initQuantityButtons() {
      const plusBtn = this.productContainer.querySelector(".qty-plus");
      const minusBtn = this.productContainer.querySelector(".qty-minus");
      const qtyInput = this.productContainer.querySelector(".quantity-input");
      if (plusBtn && minusBtn && qtyInput) {
        plusBtn.addEventListener("click", () => {
          qtyInput.value = parseInt(qtyInput.value, 10) + 1;
        });
        minusBtn.addEventListener("click", () => {
          qtyInput.value = Math.max(1, parseInt(qtyInput.value, 10) - 1);
        });
      }
    }

    /**
     * Looks for the .add-to-cart button in the dynamically loaded content
     * and, on click, checks product availability via Storefront API,
     * then adds to cart if available.
     * @param {string} productHandle
     */
    initAddToCart(productHandle) {
      const addToCartBtn = this.productContainer.querySelector(".add-to-cart");
      if (!addToCartBtn) return;

      addToCartBtn.addEventListener("click", () => {
        const qtyInput = this.productContainer.querySelector(".quantity-input");
        const quantity = qtyInput ? parseInt(qtyInput.value, 10) : 1;
        this.checkAvailabilityAndAdd(addToCartBtn, productHandle, quantity);
      });
    }

    /**
     * Queries the Storefront API to check availability of the product (the first variant)
     * and whether quantityAvailable >= the requested quantity.
     * If all good, calls addVariantToCart(...).
     */
    checkAvailabilityAndAdd(addToCartBtn, productHandle, quantity) {
      const graphQLQuery = `
        query getProduct($handle: String!) {
          productByHandle(handle: $handle) {
            title
            variants(first: 1) {
              edges {
                node {
                  id
                  availableForSale
                  quantityAvailable
                }
              }
            }
          }
        }
      `;
      const variables = { handle: productHandle };

      fetch("/api/2025-04/graphql.json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": "YOUR_ACCESS_TOKEN_HERE",
        },
        body: JSON.stringify({ query: graphQLQuery, variables }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Storefront response:", data);

          if (!data.data || !data.data.productByHandle) {
            throw new Error("Product not found in Storefront API");
          }

          const variants = data.data.productByHandle.variants.edges;
          if (!variants || variants.length === 0) {
            throw new Error("No variants found for this product");
          }

          const variantNode = variants[0].node;
          if (!variantNode.availableForSale) {
            this.displayMessageAboveBtn(
              addToCartBtn,
              "Sorry, this product is out of stock.",
              "error"
            );
            return;
          }

          if (
            variantNode.quantityAvailable !== null &&
            variantNode.quantityAvailable < quantity
          ) {
            this.displayMessageAboveBtn(
              addToCartBtn,
              `Sorry, only ${variantNode.quantityAvailable} items available in stock.`,
              "error"
            );
            return;
          }

          // Product is available, so proceed to add to cart
          const variantId = variantNode.id;
          this.addVariantToCart(addToCartBtn, variantId, quantity);
        })
        .catch((err) => {
          console.error("Availability check error:", err);
        });
    }

    /**
     * Adds the selected variant to the cart (using /cart/add.js) via AJAX.
     * Converts the Storefront variant ID to its numeric form, then sends the request.
     */
    addVariantToCart(addToCartBtn, storefrontVariantId, quantity) {
      const numericVariantId =
        this.extractNumericIdFromGid(storefrontVariantId);
      if (!numericVariantId) {
        console.error("Invalid variant ID format");
        alert("Invalid product variant. Please try again.");
        return;
      }

      // Disable the button, show "Adding..."
      addToCartBtn.disabled = true;
      addToCartBtn.innerHTML =
        'Adding... <span class="loading-spinner"></span>';

      fetch("/cart/add.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: numericVariantId, quantity }),
      })
        .then((res) => {
          if (!res.ok) {
            return res.json().then((errData) => {
              throw new Error(
                errData.description || `Cart add error: ${res.statusText}`
              );
            });
          }
          return res.json();
        })
        .then((cartData) => {
          // Show "Added" for 2 seconds, then close the modal
          addToCartBtn.innerHTML = `
            Added
            <svg class="check-icon" xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 
                   8a1 1 0 01-1.414 0l-4-4a1 1 0 
                   011.414-1.414L8 12.586l7.293-7.293a1 1 0 
                   011.414 0z" 
                clip-rule="evenodd"
              />
            </svg>
          `;
          setTimeout(() => {
            this.close();
            addToCartBtn.innerHTML = "Add to Cart";
            addToCartBtn.disabled = false;
          }, 2000);

          console.log("Cart updated:", cartData);
        })
        .catch((err) => {
          console.error("Add to cart error:", err);
          addToCartBtn.innerHTML = "Add to Cart";
          addToCartBtn.disabled = false;
        });
    }

    /**
     * Displays a message above the button
     */

    displayMessageAboveBtn(btn, message, type = "error") {
      const elMsg = btn.parentElement.parentElement.querySelector(
        ".quick-view-message"
      );
      elMsg.textContent = "";

      if (type === "error") {
        elMsg.classList.add("error");
      }
      elMsg.textContent = message;

      setTimeout(() => {
        elMsg.textContent = "";
      }, 4000);
    }

    /**
     * Parses the numeric part of a Storefront GID, e.g.,
     * "gid://shopify/ProductVariant/12345678" -> "12345678"
     * @param {string} gid
     * @returns {string|null}
     */
    extractNumericIdFromGid(gid) {
      try {
        const parts = gid.split("/");
        return parts[parts.length - 1];
      } catch (e) {
        console.error("Error parsing variant ID:", e);
        return null;
      }
    }
  }

  customElements.define("quick-view-modal", QuickViewModal);
}
