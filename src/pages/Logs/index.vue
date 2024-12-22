<template>
  <DashboardLayout>
  <v-container>
    <v-card>
      <v-card-title>
        Logs
        <!-- <v-spacer></v-spacer>
        <v-btn icon @click="fetchLogs">
          <v-icon>mdi-refresh</v-icon>
        </v-btn> -->
      </v-card-title>

      <!-- Filter Input -->
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="search"
            label="Search by details"
            @input="onFilterChange"
            clearable
            outlined
            dense
            prepend-inner-icon="mdi-magnify"
          />
        </v-col>
      </v-row>

      <!-- Data Table -->
      <v-data-table
        :headers="headers"
        :items="logs"
        :loading="loading"
        :server-items-length="total"
        v-model:options="options"
        item-value="_id"
        class="elevation-1"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Log Details</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>
        </template>

        <template v-slot:body="{ items }">
          <tbody>
            <tr v-for="(item, index) in items" :key="item._id">
              <td>{{ (options.page - 1) * options.itemsPerPage + index + 1 }}</td>
              <td>{{ item.created_at }}</td>
              <td>{{ item.event }}</td>
              <td>{{ item.details }}</td>
              <td>
                <v-chip :color="getEventColor(item.event)" dark>
                  {{ item.event }}
                </v-chip>
              </td>
            </tr>
          </tbody>
        </template>
      </v-data-table>

      <!-- Pagination -->
      <v-row justify="space-between" align="center" class="mt-3">
        <v-btn
          :disabled="options.page <= 1"
          @click="onPreviousPage"
          outlined
          small
        >
          <v-icon left>mdi-chevron-left</v-icon> Previous
        </v-btn>
        <div>Page {{ options.page }} of {{ totalPages }}</div>
        <v-btn
          :disabled="options.page >= totalPages"
          @click="onNextPage"
          outlined
          small
        >
          Next <v-icon right>mdi-chevron-right</v-icon>
        </v-btn>
      </v-row>
    </v-card>
  </v-container>
</DashboardLayout>
</template>

<script>
import DashboardLayout from "@/layouts/DashboardLayout.vue";
import { ref, watch, computed } from "vue";
import { api } from "@/utils/api"; // Handler Axios yang sudah dibuat

export default {
  components: {
    DashboardLayout,
  },
  setup() {
    const logs = ref([]);
    const loading = ref(false);
    const total = ref(0);
    const options = ref({ page: 1, itemsPerPage: 10 });
    const search = ref("");
    const totalPages = computed(() => Math.ceil(total.value / options.value.itemsPerPage));

    const headers = ref([
      { text: "No", value: "index", sortable: false },
      { text: "Created At", value: "created_at" },
      { text: "Event", value: "event" },
      { text: "Details", value: "details" },
      { text: "Tag", value: "tags" },
    ]);

    // Fungsi fetch logs
    const fetchLogs = async () => {
      loading.value = true;
      try {
        const response = await api.get("/inventory", {
          params: {
            page: options.value.page,
            limit: options.value.itemsPerPage,
            search: search.value || undefined, // Tambahkan filter search jika ada
          },
        });
        console.log('Headers sent:', response.config.headers); // Debugging
        console.log('Response:', response.data);
        logs.value = response.data.data;
        total.value = response.data.total;
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        loading.value = false;
      }
    };

    // Watcher untuk options (paginasi)
    watch(options, fetchLogs, { immediate: true });

    // Fungsi untuk warna event
    const getEventColor = (event) => {
      switch (event) {
        case "addItem":
          return "green";
        case "removeItem":
          return "red";
        case "giveItem":
          return "blue";
        default:
          return "grey";
      }
    };

    // Fungsi untuk filter
    const onFilterChange = () => {
      options.value.page = 1; // Reset ke halaman pertama saat filter berubah
      fetchLogs();
    };

    // Navigasi halaman
    const onNextPage = () => {
      if (options.value.page < totalPages.value) {
        options.value.page++;
      }
    };

    const onPreviousPage = () => {
      if (options.value.page > 1) {
        options.value.page--;
      }
    };

    return {
      logs,
      loading,
      total,
      options,
      headers,
      search,
      totalPages,
      fetchLogs,
      getEventColor,
      onFilterChange,
      onNextPage,
      onPreviousPage,
    };
  },
};
</script>

<style scoped>
.v-data-table {
  margin-top: 16px;
}

.v-chip {
  font-weight: bold;
}
</style>
