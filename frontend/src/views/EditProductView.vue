<script setup>
import { useAuthStore } from "../store/auth";
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";
import { aliceToken } from "../../cypress/e2e/common/tokens";

const { isAuthenticated, token } = useAuthStore();
const router = useRouter();
const route = useRoute();

const loading = ref(false);
const error = ref(false);
if (!isAuthenticated.value) {
  router.push({ name: "Login" });
}
let productData = ref({
  name: "",
  description: "",
  category: "",
  originalPrice: 0,
  pictureUrl: "",
  endDate: "",
});
const productId = ref(route.params.productId);

function buildProductData(data) {
  productData.value.name = data.name;
  productData.value.description = data.description;
  productData.value.category = data.category;
  productData.value.originalPrice = data.originalPrice;
  productData.value.pictureUrl = data.pictureUrl;
  productData.value.endDate = formatDate(data.endDate);
}
async function fetchProduct() {
  loading.value = true;
  error.value = false;
  try {
    const res = await fetch(
      `http://localhost:3000/api/products/${productId.value}`
    );
    buildProductData(await res.json());
  } catch (e) {
    error.value = true;
  } finally {
    loading.value = false;
  }
}

async function edit() {
  loading.value = true;
  error.value = false;
  try {
    const res = await fetch(
      `http://localhost:3000/api/products/${productId.value}`,
      {
        method: "PUT",
        body: JSON.stringify(productData.value),
        headers: {
          Authorization: `Bearer ${token.value}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();
    await router.push({
      name: "ProductEdition",
      params: { productId: data.id },
    });
  } catch (e) {
    error.value = true;
  } finally {
    loading.value = false;
  }
}
function formatDate(date) {
  const dateObject = new Date(date);
  const month =
    dateObject.getMonth() > 9
      ? dateObject.getMonth()
      : "0" + dateObject.getMonth();
  const day =
    dateObject.getDay() > 9 ? dateObject.getDay() : "0" + dateObject.getDay();
  return `${dateObject.getFullYear()}-${month}-${day}`;
}
fetchProduct();
</script>

<template>
  <h1 class="text-center">Modifier un produit</h1>

  <div class="row justify-content-center">
    <div class="col-md-6">
      <form @submit.prevent="edit">
        <div
          class="alert alert-danger mt-4"
          role="alert"
          data-test-error
          v-if="error"
        >
          Une erreur est survenue
        </div>

        <div class="mb-3">
          <label for="product-name" class="form-label"> Nom du produit </label>
          <input
            type="text"
            class="form-control"
            id="product-name"
            required
            data-test-product-name
            v-model="productData.name"
          />
        </div>

        <div class="mb-3">
          <label for="product-description" class="form-label">
            Description
          </label>
          <textarea
            class="form-control"
            id="product-description"
            name="description"
            rows="3"
            required
            data-test-product-description
            v-model="productData.description"
          ></textarea>
        </div>

        <div class="mb-3">
          <label for="product-category" class="form-label"> Catégorie </label>
          <input
            type="text"
            class="form-control"
            id="product-category"
            required
            data-test-product-category
            v-model="productData.category"
          />
        </div>

        <div class="mb-3">
          <label for="product-original-price" class="form-label">
            Prix de départ
          </label>
          <div class="input-group">
            <input
              type="number"
              class="form-control"
              id="product-original-price"
              name="originalPrice"
              step="1"
              min="0"
              required
              data-test-product-price
              v-model="productData.originalPrice"
            />
            <span class="input-group-text">€</span>
          </div>
        </div>

        <div class="mb-3">
          <label for="product-picture-url" class="form-label">
            URL de l'image
          </label>
          <input
            type="url"
            class="form-control"
            id="product-picture-url"
            name="pictureUrl"
            required
            data-test-product-picture
            v-model="productData.pictureUrl"
          />
        </div>

        <div class="mb-3">
          <label for="product-end-date" class="form-label">
            Date de fin de l'enchère
          </label>
          <input
            type="date"
            class="form-control"
            id="product-end-date"
            name="endDate"
            required
            data-test-product-end-date
            v-model="productData.endDate"
          />
        </div>

        <div class="d-grid gap-2">
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="loading"
            data-test-submit
          >
            Modifier le produit
            <span
              v-if="loading"
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
              data-test-spinner
            ></span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
