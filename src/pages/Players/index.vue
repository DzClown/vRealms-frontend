<template>
  <DashboardLayout>
    <v-container>
      <v-card-title class="text-h4 mb-5">Player List</v-card-title>
      <v-card>
        <v-data-table-server
          v-model:items-per-page="options.itemsPerPage"
          v-model:page="options.page"
          :headers="headers"
          :items="players"
          :items-length="total"
          :loading="loading"
          item-value="identifier"
          @update:options="loadPlayers"
        >
          <!-- Avatar
          <template v-slot:[`item.avatar`]="{ item }">
            <v-img :src="item.avatar.href" max-height="50" max-width="50" class="mr-2"></v-img>
          </template> -->

          <!-- Full Name -->
          <template v-slot:[`item.fullname`]="{ item }">
            <v-btn
              :color="getBtnColor(item.sex)"
              text
              @click="showPlayerDetail(item)"
            >
              {{ item.firstname }} {{ item.lastname }}
            </v-btn>
          </template>

          <!-- Accounts -->
          <template v-slot:[`item.accounts`]="{ item }">
            <div>
              <p><strong>Money:</strong> {{ item.accounts.money }}</p>
              <p><strong>Bank:</strong> {{ item.accounts.bank }}</p>
              <p><strong>Black Money:</strong> {{ item.accounts.black_money }}</p>
            </div>
          </template>

          <!-- Job and Grade -->
          <template v-slot:[`item.job`]="{ item }">
            <span>{{ item.job_label }} ({{ item.grade_label }})</span>
          </template>

          <!-- Footer for Search -->
          <template v-slot:tfoot>
            <tr>
              <td colspan="100%">
                <v-text-field
                  v-model="filters.param"
                  class="ma-2"
                  density="compact"
                  placeholder="Search players..."
                  hide-details
                  @input="onFilterChange"
                />
              </td>
            </tr>
          </template>
        </v-data-table-server>
      </v-card>
    </v-container>

    <!-- Modal for Player Detail -->
    <v-dialog v-model="detailDialog" max-width="600px">
      <v-card>
        <v-card-title>Player Details</v-card-title>
        <v-card-text>
          <v-img
            v-if="selectedPlayer.avatar"
            :src="selectedPlayer.avatar.href"
            max-height="200px"
            contain
          ></v-img>
          <div>
            <p><strong>Full Name:</strong> {{ selectedPlayer.firstname }} {{ selectedPlayer.lastname }}</p>
            <p><strong>Identifier:</strong> {{ selectedPlayer.identifier }}</p>
            <p><strong>Date of Birth:</strong> {{ selectedPlayer.dateofbirth }}</p>
            <p><strong>Gender:</strong> {{ selectedPlayer.sex === "f" ? "Female" : "Male" }}</p>
            <p><strong>Height:</strong> {{ selectedPlayer.height }} cm</p>
            <p><strong>Accounts:</strong></p>
            <ul>
              <li>Money: {{ selectedPlayer.accounts?.money }}</li>
              <li>Bank: {{ selectedPlayer.accounts?.bank }}</li>
              <li>Black Money: {{ selectedPlayer.accounts?.black_money }}</li>
            </ul>
            <p><strong>Job:</strong> {{ selectedPlayer.job_label }} ({{ selectedPlayer.grade_label }})</p>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn text @click="detailDialog = false">Close</v-btn>
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
    const players = ref([]); // Data players
    const total = ref(0); // Total players
    const loading = ref(false); // Loading state
    const options = ref({ page: 1, itemsPerPage: 10 }); // Pagination options
    const filters = ref({ param: "" }); // Filter options

    const detailDialog = ref(false); // State untuk modal
    const selectedPlayer = ref({}); // Data pemain yang dipilih

    // Table headers
    const headers = ref([
      { title: "Full Name", value: "fullname", sortable: true },
      { title: "Identifier", align: 'center', value: "identifier", sortable: false },
      { title: "Accounts",
        align: 'center',
        children: [
        {title: "Money", align: 'center', value: "accounts.money"},
        {title: "Bank", align: 'center', value: "accounts.bank"},
        {title: "R.O.C", align: 'center', value:"accounts.black_money"},
      ], sortable: false },
      { title: "Job", align: 'center', value: "job", sortable: false },
    ]);

    // Load players from API
    const loadPlayers = async () => {
      loading.value = true;
      try {
        const params = {
          page: options.value.page,
          limit: options.value.itemsPerPage,
          param: filters.value.param?.trim() || undefined,
        };

        console.log("Params sent to API:", params); // Debug log untuk request params
        const response = await api.get("/users", { params });

        console.log("Response from API:", response.data); // Debug log untuk response data

        if (response.status === 200 && response.data) {
          players.value = response.data.data;
          console.log("Players data processed:", players.value); // Debug log untuk players yang telah diproses
          total.value = response.data.totalData || 0;
        } else {
          console.warn("Unexpected API response structure:", response); // Jika struktur response tidak sesuai
        }
      } catch (error) {
        console.error("Error fetching players:", error); // Log error jika terjadi masalah pada request API
      } finally {
        loading.value = false;
        console.log("Loading state set to false"); // Debug log untuk memastikan loading state
      }
    };

    // const PlayerImage = (players) => {
    //   return ``
    // }

    const showPlayerDetail = (player) => {
      console.log(player)
      selectedPlayer.value = player; // Atur pemain yang dipilih
      detailDialog.value = true; // Buka dialog detail
    };

    const getBtnColor = (sex) => {
      switch (sex) {
        case "f":
          return "pink";
        case "m":
          return "blue";
        default:
          return "grey"; // Untuk nilai lain yang tidak dikenali
      }
    };

    // Watcher for options (pagination and items per page)
    watch(options, loadPlayers, { immediate: true });

    // Filter change handler
    const onFilterChange = () => {
      options.value.page = 1; // Reset to page 1
      loadPlayers();
    };

    // Load data on component mount
    onMounted(() => {
      loadPlayers();
    });

    return {
      players,
      total,
      loading,
      options,
      filters,
      headers,
      loadPlayers,
      onFilterChange,
      getBtnColor,
      detailDialog,
      selectedPlayer,
      showPlayerDetail
    };
  },
};
</script>

<style scoped>
.v-card-title {
  font-weight: bold;
}
</style>
