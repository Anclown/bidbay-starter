<script setup>
import {useAuthStore} from "../store/auth";
import {useRouter} from "vue-router";
import {ref} from "vue";

const {isAuthenticated, token} = useAuthStore();
const router = useRouter();
let errorMessage = ref("");
let isSubmitting = ref(false);
let productData = {
  name: "",
  description: "",
  category: "",
  originalPrice: 0,
  pictureUrl: "",
  endDate: "",
};
async function submitForm() {
  errorMessage.value = "";
  isSubmitting.value = true;

  try {
    const response = await fetch("http://localhost:3000/api/products/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });
    const data = await response.json();
    console.log(data);
    if (response.status === 201) {
      router.push({ name: "Product", params: { productId: data.id } });
    } else {
      throw new Error("Unexpected response status");
    }
  } catch (error) {
    console.error(error);
  } finally {
    isSubmitting.value = false;
  }
}
if (!isAuthenticated.value) {
  router.push({name: "Login"});
}
// router.push({ name: "Product", params: { productId: 'TODO } });
</script>

<template>
  <h1 class="text-center">Ajouter un produit</h1>

  <div class="row justify-content-center">
    <div class="col-md-6">
      <form @submit.prevent="submitForm">
        <div v-if="errorMessage" class="alert alert-danger mt-4" role="alert">
          {{ errorMessage }}
        </div>

        <div class="mb-3">
          <label for="product_name" class="form-label"> Nom du produit </label>
          <input
              type="text"
              class="form-control"
              id="product_name"
              required
              data-test-product-name
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
          ></textarea>
        </div>

        <div class="mb-3">
          <label for="product-category" class="form-label"> Catégorie </label>
          <input
              type="text"
              class="form-control"
              id="product-name"
              required
              v-model="productName"
              data-test-product-name
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
          />
        </div>

        <div class="d-grid gap-2">
          <button
              type="submit"
              class="btn btn-primary"
              data-test-submit
          >
            Ajouter le produit
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
