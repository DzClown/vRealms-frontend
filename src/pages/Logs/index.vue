<template>
  <DashboardLayout>
    <v-container>
      <v-card-title class="text-h4 mb-5">Logs</v-card-title>
      <v-card>
        <v-data-table-server
          v-model:items-per-page="options.itemsPerPage"
          v-model:page="options.page"
          :headers="headers"
          :items="logs"
          :items-length="total"
          :loading="loading"
          item-value="_id"
          @update:options="loadItems"
        >
          <!-- Footer untuk Filter -->
          <template v-slot:tfoot>
            <tr>
              <td>
                <v-text-field
                  v-model="filters.name"
                  class="ma-2"
                  density="compact"
                  placeholder="Search name..."
                  hide-details
                  @input="onFilterChange"
                />
              </td>
            </tr>
          </template>

          <!-- Custom Slot untuk Kolom -->
          <template v-slot:[`item.giver`]="{ item }">
            <div>{{ item.giver.name }} ({{ item.giver.identifier }})</div>
          </template>

          <template v-slot:[`item.receiver`]="{ item }">
            <div>{{ item.receiver.name }} ({{ item.receiver.identifier }})</div>
          </template>

          <template v-slot:[`item.item`]="{ item }">
            <div>{{ item.item.name }} x{{ item.item.quantity }}</div>
          </template>
        </v-data-table-server>
      </v-card>
    </v-container>
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
    const logs = ref([]); // Data logs
    const total = ref(0); // Total logs
    const loading = ref(false); // State loading
    const options = ref({ page: 1, itemsPerPage: 10 }); // Pagination options
    const filters = ref({ name: "", event: "" }); // Filters untuk footer

    // Headers untuk data table
    const headers = ref([
      { title: "Time", value: "created_at", sortable: true },
      { title: "Event", value: "event", sortable: true },
      { title: "Giver", value: "giver", sortable: false },
      { title: "Receiver", value: "receiver", sortable: false },
      { title: "Item", value: "item", sortable: false },
    ]);

    // Fetch logs
    const loadItems = async () => {
      loading.value = true;
      try {
        // Gabungkan filter ke dalam parameter `param`
        const param = [filters.value.name, filters.value.event]
          .filter(Boolean) // Hapus nilai kosong
          .join(" "); // Gabungkan dengan spasi

        const params = {
          page: options.value.page,
          limit: options.value.itemsPerPage,
          param: param || undefined, // Kirim `param` jika ada
        };

        console.log("Params sent to API:", params); // Debugging params
        const response = await api.get("/inventory", { params });

        logs.value = response.data.data;
        total.value = response.data.total;
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        loading.value = false;
      }
    };

    // Perubahan pada filter atau pagination memicu data baru
    const onFilterChange = () => {
      options.value.page = 1; // Reset ke halaman pertama
      loadItems();
    };

    // Watcher untuk perubahan pagination
    watch(options, loadItems, { immediate: true });

    // Mounted lifecycle
    onMounted(() => {
      loadItems(); // Fetch pertama kali
    });

    return {
      logs,
      total,
      loading,
      options,
      filters,
      headers,
      loadItems,
      onFilterChange,
    };
  },
};
</script>

<style scoped>
.v-data-table {
  margin-top: 16px;
}

.v-card-title {
  font-weight: bold;
}
</style>
