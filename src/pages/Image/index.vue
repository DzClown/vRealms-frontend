<template>
  <DashboardLayout>
    <v-container>
      <v-card>
        <v-card-title>
          <v-row justify="space-between" align="center">
              <h3 class="m-0">Images</h3>
              <v-btn color="primary" class="mr-3" @click="openUploadDialog">
                Upload Image
              </v-btn>
            <v-row>
              <v-text-field
                v-model="filters.param"
                label="Search"
                append-icon="mdi-magnify"
                outlined
                dense
                hide-details
                @input="onFilterChange"
              />
            </v-row>
          </v-row>
        </v-card-title>
        <v-row class="image-grid">
          <v-col
            cols="12"
            sm="6"
            md="4"
            lg="3"
            xl="3"
            v-for="image in images"
            :key="image._id"
          >
            <v-card class="image-card">
              <v-img
                :src="image._link.href"
                height="200px"
                cover
                class="rounded-t"
              ></v-img>
              <v-card-title class="text-truncate">{{ image.name }}</v-card-title>
              <v-card-subtitle class="text-truncate">
                {{ image.description }}
              </v-card-subtitle>
              <v-card-text>
                <p class="mb-1">Type: {{ image.type }}</p>
                <p class="m-0">
                  Uploader:
                  <a :href="image.uploader.href" target="_blank">{{ image.uploader.id }}</a>
                </p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-pagination
          v-model="options.page"
          :length="totalPages"
          @input="loadImages"
          class="mt-4"
        ></v-pagination>
      </v-card>
    </v-container>

    <!-- Dialog Upload -->
    <v-dialog v-model="showUploadDialog" max-width="600px">
      <v-card>
        <v-card-title>Upload Image</v-card-title>
        <v-card-text>
          <v-form ref="uploadForm" v-model="valid">
            <v-text-field
              label="Related ID"
              v-model="uploadData.related_id"
              required
            ></v-text-field>
            <v-text-field
              label="Type"
              v-model="uploadData.type"
              required
            ></v-text-field>
            <v-textarea
              label="Description"
              v-model="uploadData.description"
              required
            ></v-textarea>
            <v-file-input
              label="Select Image(s)"
              multiple
              accept="image/*"
              v-model="uploadFiles"
              required
            ></v-file-input>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn text @click="closeUploadDialog">Cancel</v-btn>
          <v-btn color="primary" :disabled="!valid" @click="uploadImages">Upload</v-btn>
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
    const images = ref([]);
    const total = ref(0);
    const totalPages = ref(1);
    const loading = ref(false);
    const options = ref({ page: 1, itemsPerPage: 10 });
    const filters = ref({ param: "" });

    const showUploadDialog = ref(false);
    const uploadData = ref({ related_id: "", type: "", description: "" });
    const uploadFiles = ref(null);
    const valid = ref(false);
    const uploadForm = ref(null);

    const loadImages = async () => {
      loading.value = true;
      try {
        const params = {
          page: options.value.page,
          limit: options.value.itemsPerPage,
          param: filters.value.param || undefined,
        };

        const response = await api.get("/image", { params });
        images.value = response.data._embeded.dataImages;
        total.value = response.data.total;
        totalPages.value = response.data.totalPages;
      } catch (error) {
        console.error("Error fetching images:", error);
      } finally {
        loading.value = false;
      }
    };

    const uploadImages = async () => {
      try {
        const formData = new FormData();
        formData.append("related_id", uploadData.value.related_id);
        formData.append("type", uploadData.value.type);
        formData.append("description", uploadData.value.description);

        if (!formData.get("file")) {
          alert("Please select a file to upload.");
          return;
        }

        if (uploadFiles.value && uploadFiles.value.length > 0) {
          for (const file of uploadFiles.value) {
            formData.append("files", file);
          }
        }


        const response = await api.post("/image/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        closeUploadDialog();
        loadImages();
      } catch (error) {
        console.error("Error uploading images:", error);
      }
    };

    const openUploadDialog = () => {
      showUploadDialog.value = true;
    };

    const closeUploadDialog = () => {
      showUploadDialog.value = false;
      uploadData.value = { related_id: "", type: "", description: "" };
      uploadFiles.value = null;
    };

    const onFilterChange = () => {
      options.value.page = 1;
      loadImages();
    };

    watch(() => options.value.page, loadImages, { immediate: true });
    onMounted(() => loadImages());

    return {
      images,
      total,
      totalPages,
      loading,
      options,
      filters,
      showUploadDialog,
      uploadData,
      uploadFiles,
      valid,
      uploadForm,
      loadImages,
      uploadImages,
      openUploadDialog,
      closeUploadDialog,
      onFilterChange,
    };
  },
};
</script>

<style scoped>
.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: center;
  padding: 16px;
}

.image-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  border-radius: 8px;
}

.v-card-title {
  font-weight: bold;
}

.v-img {
  border-radius: 8px 8px 0 0;
}

.v-pagination {
  justify-content: center;
  margin-top: 16px;
}
</style>
