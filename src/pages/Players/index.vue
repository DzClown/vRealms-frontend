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

          <!-- Phone Number -->
          <template v-slot:[`item.phone`]="{ item }">
            <span v-if="item.phone_info.length > 0">
              <ul>
                <li v-for="(phone, index) in item.phone_info" :key="index">
                  {{ phone.phone_number }}
                </li>
              </ul>
            </span>
            <span v-else><h4>Not Available</h4></span>
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

          <!-- Edit Button -->
          <template v-slot:[`item.actions`]="{ item }">
            <v-btn icon @click="showEditDialog(item)">
              <v-icon>mdi-clipboard-edit-outline</v-icon>
            </v-btn>
            <v-btn icon @click="showChangePhoneDialog(item)">
              <v-icon>mdi-cellphone</v-icon>
            </v-btn>
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

    <!-- Modal for Edit Name -->
    <v-dialog v-model="editDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Edit Player Name</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <!-- Identifier (Disabled) -->
              <v-col cols="12">
                <v-text-field
                  label="Identifier"
                  v-model="editData.identifier"
                  outlined
                  dense
                  disabled
                ></v-text-field>
              </v-col>

              <!-- First Name -->
              <v-col cols="12" md="6">
                <v-text-field
                  label="First Name"
                  v-model="editData.firstname"
                  outlined
                  dense
                ></v-text-field>
              </v-col>

              <!-- Last Name -->
              <v-col cols="12" md="6">
                <v-text-field
                  label="Last Name"
                  v-model="editData.lastname"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="updatePlayerName">Save</v-btn>
          <v-btn text @click="editDialog = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal for Player Detail -->
    <v-dialog v-model="detailDialog" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Player Details</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <!-- Avatar -->
            <v-row justify="center">
              <v-col cols="12" md="6" class="text-center">
                <v-img
                  v-if="selectedPlayer.avatar"
                  :src="selectedPlayer.avatar.href"
                  max-height="400px"
                  max-width="400px"
                  contain
                ></v-img>
              </v-col>
            </v-row>

            <!-- Basic Info -->
            <v-row>
              <v-col cols="12" md="6">
                <p><strong>Full Name:</strong> {{ selectedPlayer.firstname }} {{ selectedPlayer.lastname }}</p>
                <p><strong>Identifier:</strong> {{ selectedPlayer.identifier }}</p>
                <p><strong>Date of Birth:</strong> {{ selectedPlayer.dateofbirth }}</p>
                <p><strong>Gender:</strong> {{ selectedPlayer.sex === "f" ? "Female" : "Male" }}</p>
                <p><strong>Height:</strong> {{ selectedPlayer.height }} cm</p>
              </v-col>

              <!-- Job Info -->
              <v-col cols="12" md="6">
                <p><strong>Job:</strong></p>
                <p>{{ selectedPlayer.job_label }} ({{ selectedPlayer.grade_label }})</p>
              </v-col>
            </v-row>

            <!-- Accounts Info -->
            <v-row>
              <v-col cols="12">
                <v-card outlined>
                  <v-card-title>
                    <span class="text-h6">Accounts</span>
                  </v-card-title>
                  <v-card-text>
                    <ul>
                      <li><strong>Money:</strong> {{ selectedPlayer.accounts?.money }}</li>
                      <li><strong>Bank:</strong> {{ selectedPlayer.accounts?.bank }}</li>
                      <li><strong>Black Money:</strong> {{ selectedPlayer.accounts?.black_money }}</li>
                    </ul>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- Phone Info -->
            <v-row>
              <v-col cols="12">
                <v-card outlined>
                  <v-card-title>
                    <span class="text-h6">Phone Info</span>
                  </v-card-title>
                  <v-card-text>
                    <v-row v-for="(phone, index) in selectedPlayer.phone_info" :key="index" class="mb-3">
                      <v-col cols="12" md="6">
                        <p><strong>Phone Number:</strong> {{ phone.phone_number }}</p>
                        <p><strong>Model:</strong> {{ phone.model === "md" ? "Android" : "Iphone" }}</p>
                      </v-col>
                      <v-col cols="12" md="6">
                        <p><strong>Email:</strong> {{ phone.mail }}</p>
                        <p><strong>Unique ID:</strong> {{ phone.unique_id }}</p>
                      </v-col>
                    </v-row>
                    <p v-if="!selectedPlayer.phone_info.length">No phone information available</p>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <!-- Dialog Actions -->
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="detailDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal for Change Phone Number -->
    <v-dialog v-model="changePhoneDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Change Phone Number</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <!-- Identifier (Disabled) -->
              <v-col cols="12">
                <v-text-field
                  label="Identifier"
                  v-model="phoneData.identifier"
                  outlined
                  dense
                  disabled
                ></v-text-field>
              </v-col>

              <!-- Select Phone ID -->
              <v-col cols="12">
                <v-combobox
                  label="Phone ID"
                  v-model="phoneData.phoneId"
                  :items="phoneOptions"
                  item-text="phone_number"
                  item-value="unique_id"
                  outlined
                  dense
                >
                </v-combobox>
              </v-col>

              <!-- New Phone Number -->
              <v-col cols="12">
                <v-text-field
                  label="New Phone Number"
                  v-model="phoneData.newPhoneNumber"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="updatePhoneNumber">Save</v-btn>
          <v-btn text @click="changePhoneDialog = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </DashboardLayout>
</template>

<script>
import DashboardLayout from "@/layouts/DashboardLayout.vue";
import { showSuccessAlert, showErrorAlert, showConfirmDialog } from "@/utils/swalGlobal";
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

    const editDialog = ref(false);
    const editData = ref({ identifier: "", firstname: "", lastname: "" });

    const changePhoneDialog = ref(false);
    const phoneData = ref({ identifier: null, newPhoneNumber: null, phoneId: null });
    const phoneOptions = ref({});

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
      { title: "Phone No.", align: "center", value: "phone", sortable: false },
      { title: "Job", align: 'center', value: "job", sortable: false },
      { title: "Actions", align: "center", value: "actions", sortable: false },
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

    const showChangePhoneDialog = (player) => {
      phoneData.value.identifier = player.identifier;
      phoneData.value.newPhoneNumber = "";
      phoneData.value.phoneId = "";

      // Ubah phoneOptions menjadi array string untuk "title"
      phoneOptions.value = player.phone_info.map(phone => ({
        title: `${phone.phone_number} (${phone.unique_id})`, // Format string gabungan
        value: phone.unique_id, // Pastikan ini string
      }));

      console.log("Phone Options Processed:", phoneOptions.value); // Debug hasil akhir
      changePhoneDialog.value = true;
    };

    const updatePhoneNumber = async () => {
      try {
        const payload = {
          identifier: phoneData.value.identifier,
          newPhoneNumber: phoneData.value.newPhoneNumber,
          phoneId: phoneData.value.phoneId?.value || phoneData.value.phoneId, // Ambil value jika `phoneId` adalah objek
        };
        console.log("Payload to API:", JSON.stringify(payload));

        const response = await api.put("/phonesettings/changephone", payload);

        if (response.status === 200) {
          changePhoneDialog.value = false;
          showSuccessAlert("Success", "Phone number updated successfully");
          changePhoneDialog.value = false;
          loadPlayers();
        }
      } catch (error) {
        changePhoneDialog.value = false;
        showErrorAlert("Error", "Failed to update phone number");
        console.error("Error updating phone number:", error);
      }
    };

    const showEditDialog = (player) => {
      editData.value = { ...player }; // Copy data player ke dialog
      editDialog.value = true; // Buka dialog
    };

    const updatePlayerName = async () => {

      try {
        editDialog.value = false; // Tutup dialog terlebih dahulu
        const confirm = await showConfirmDialog(
          "Are you sure?",
          "Do you want to update this player's name?"
        );

        if (!confirm) return; // Exit if user cancels
        const payload = {
          identifier: editData.value.identifier,
          firstname: editData.value.firstname,
          lastname: editData.value.lastname,
        };
        const response = await api.put("/users/changename", payload);
        if (response.status === 200) {
          console.log("Player name updated successfully:", response.data);
          editDialog.value = false;
          showSuccessAlert("Name Updated!", "Player name has been successfully updated.");
          loadPlayers();
        }
      } catch (error) {
        showErrorAlert("Failed to Update", "There was an error updating the player's name.");
        console.error("Error updating player name:", error);
      }
    };

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
      showPlayerDetail,
      editDialog,
      editData,
      showEditDialog,
      updatePlayerName,
      phoneData,
      phoneOptions,
      changePhoneDialog,
      showChangePhoneDialog,
      updatePhoneNumber,
    };
  },
};
</script>

<style scoped>
.v-card-title {
  font-weight: bold;
}
</style>
