<template>
  <DashboardLayout>
    <v-container>
      <v-card-title class="text-h4 mb-5">Vehicle List</v-card-title>
      <v-card>
        <v-data-table-server
          v-model:items-per-page="options.itemsPerPage"
          v-model:page="options.page"
          :headers="headers"
          :items="vehicles"
          :items-length="total"
          :loading="loading"
          item-value="spawn_code"
          @update:options="loadVehicles"
        >

          <!-- Image -->
          <template v-slot:[`item.image`]="{ item }">
            <v-img
              :src="item.image?.href"
              max-height="50"
              max-width="100"
              contain
              class="cursor-pointer"
              @click="showImageModal(item.image?.href)"
            ></v-img>
          </template>

          <!-- Model -->
          <template v-slot:[`item.model`]="{ item }">
            {{ item.model }}
          </template>

          <!-- Brand -->
          <template v-slot:[`item.brand`]="{ item }">
            {{ item.brand }}
          </template>

          <!-- Category -->
          <template v-slot:[`item.category`]="{ item }">
            {{ item.category }}
          </template>

          <!-- Price -->
          <template v-slot:[`item.price`]="{ item }">
            {{ item.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) }}
          </template>

          <!-- Footer for Search -->
          <template v-slot:tfoot>
            <tr>
              <td colspan="100%">
                <v-text-field
                  v-model="filters.param"
                  class="ma-2"
                  density="compact"
                  placeholder="Search vehicles..."
                  hide-details
                  @input="onFilterChange"
                />
              </td>
            </tr>
          </template>
        </v-data-table-server>
      </v-card>
    </v-container>

    <!-- Modal for Viewing Image -->
    <v-dialog v-model="imageDialog" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Vehicle Image</span>
        </v-card-title>
        <v-card-text>
          <v-img :src="selectedImage" max-height="600px" contain></v-img>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="imageDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </DashboardLayout>
</template>

<script>
import DashboardLayout from "@/layouts/DashboardLayout.vue";
import { ref, watch, onMounted } from "vue";
import { api } from "@/utils/api";

export default {
  components: {
    DashboardLayout,
  },
  setup() {
    const vehicles = ref([]); // Data vehicles
    const total = ref(0); // Total vehicles
    const loading = ref(false); // Loading state
    const options = ref({ page: 1, itemsPerPage: 10 }); // Pagination options
    const filters = ref({ param: "" }); // Filter options

    const imageDialog = ref(false); // State for image modal
    const selectedImage = ref(null); // Selected image URL

    // Table headers
    const headers = ref([
      { title: "Image", align: "center", value: "image", sortable: false },
      { title: "Model", value: "model", sortable: true },
      { title: "Brand", value: "brand", sortable: true },
      { title: "Category", value: "category", sortable: true },
      { title: "Price", align: "right", value: "price", sortable: true },
    ]);

    // Load vehicles from API
    const loadVehicles = async () => {
      loading.value = true;
      try {
        const params = {
          page: options.value.page,
          limit: options.value.itemsPerPage,
          param: filters.value.param?.trim() || undefined,
        };

        console.log("Params sent to API:", params); // Debug log untuk request params
        const response = await api.get("/vehicleinfo", { params });

        console.log("Response from API:", response.data); // Debug log untuk response data

        if (response.status === 200 && response.data) {
          vehicles.value = response.data.data;
          console.log("Vehicles data processed:", vehicles.value); // Debug log untuk vehicles yang telah diproses
          total.value = response.data.totalData || 0;
        } else {
          console.warn("Unexpected API response structure:", response); // Jika struktur response tidak sesuai
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error); // Log error jika terjadi masalah pada request API
      } finally {
        loading.value = false;
        console.log("Loading state set to false"); // Debug log untuk memastikan loading state
      }
    };

    // Show modal with selected image
    const showImageModal = (imageUrl) => {
      selectedImage.value = imageUrl;
      imageDialog.value = true;
    };

    // Filter change handler
    const onFilterChange = () => {
      options.value.page = 1; // Reset to page 1
      loadVehicles();
    };

    // Load data on component mount
    onMounted(() => {
      loadVehicles();
    });

    return {
      vehicles,
      total,
      loading,
      options,
      filters,
      headers,
      loadVehicles,
      onFilterChange,
      imageDialog,
      selectedImage,
      showImageModal,
    };
  },
};
</script>

<style scoped>
.v-card-title {
  font-weight: bold;
}
.cursor-pointer {
  cursor: pointer;
}
</style>
