<template>
  <DashboardLayout>
    <v-container>
      <v-card>
        <v-card-title>
          <v-row justify="space-between" align="center">
            <span>Images</span>
            <v-btn @click="uploadDialog = true" color="primary">Upload Image</v-btn>
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
        </v-card-title>
        <v-row>
          <v-col cols="12" sm="6" md="4" v-for="image in images" :key="image._id">
            <v-card>
              <v-img
                :src="image._link.href"
                height="200px"
                cover
              ></v-img>
              <v-card-title>{{ image.name }}</v-card-title>
              <v-card-subtitle>{{ image.description }}</v-card-subtitle>
              <v-card-text>
                <p>Type: {{ image.type }}</p>
                <p>
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
          @input="onPaginationChange"
        ></v-pagination>
      </v-card>
    </v-container>

    <v-dialog v-model="uploadDialog" max-width="600px">
      <v-card>
        <v-card-title>Upload Image</v-card-title>
        <v-card-text>
          <v-file-input
            label="Select Image"
            multiple
            dense
            outlined
            prepend-icon="mdi-image"
            v-model="uploadFiles"
          ></v-file-input>
          <v-text-field
            label="Related ID"
            v-model="uploadData.related_id"
            outlined
            dense
          ></v-text-field>
          <v-text-field
            label="Type"
            v-model="uploadData.type"
            outlined
            dense
          ></v-text-field>
          <v-textarea
            label="Description"
            v-model="uploadData.description"
            outlined
            dense
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="uploadImages">Upload</v-btn>
          <v-btn text @click="closeUploadDialog">Cancel</v-btn>
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
    const images = ref([]); // Data images
    const total = ref(0); // Total jumlah data
    const totalPages = ref(1); // Total halaman
    const loading = ref(false); // State loading
    const uploadDialog = ref(false); // State dialog upload
    const uploadFiles = ref(null); // Files yang akan diupload
    const uploadData = ref({ related_id: "", type: "", description: "" }); // Data upload
    const options = ref({ page: 1, itemsPerPage: 10 }); // Pagination options
    const filters = ref({ param: "" }); // Filters untuk pencarian

    // Fetch images
    const loadImages = async () => {
      loading.value = true;
      try {
        const params = {
          page: options.value.page,
          limit: options.value.itemsPerPage,
          param: filters.value.param?.trim() || undefined,
        };

        const response = await api.get("/image", { params });
        if (response.status === 200 && response.data) {
          images.value = response.data._embeded?.dataImages || [];
          total.value = response.data.total || 0;
          totalPages.value = response.data.totalPages || 1;
        } else {
          console.warn("Unexpected API response format:", response);
          images.value = [];
          total.value = 0;
          totalPages.value = 1;
        }
      } catch (error) {
        console.error("Error fetching images:", error);
        images.value = [];
        total.value = 0;
        totalPages.value = 1;
      } finally {
        loading.value = false;
      }
    };

    // Upload images
    const uploadImages = async () => {
      try {
        const formData = new FormData();
        formData.append("related_id", uploadData.value.related_id);
        formData.append("type", uploadData.value.type);
        formData.append("description", uploadData.value.description);

        if (uploadFiles.value && uploadFiles.value.length > 0) {
          for (const file of uploadFiles.value) {
            formData.append("files", file);
          }
        }

        const response = await api.post("/image/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            "x-upload-type": "multi",
          },
        });

        if (response.status === 201) {
          console.log("Images uploaded successfully:", response.data);
        } else {
          console.warn("Unexpected response during upload:", response);
        }

        closeUploadDialog();
        loadImages();
      } catch (error) {
        console.error("Error uploading images:", error);
      }
    };

    // Tutup dialog upload
    const closeUploadDialog = () => {
      uploadDialog.value = false;
      uploadFiles.value = null;
      uploadData.value = { related_id: "", type: "", description: "" };
    };

    // Filter & Reset halaman ke pertama
    const onFilterChange = () => {
      options.value.page = 1;
      loadImages();
    };

    // Pagination change
    const onPaginationChange = (page) => {
      options.value.page = page;
      loadImages();
    };

    // Watcher untuk perubahan halaman
    watch(options, loadImages, { immediate: true });

    // Mounted lifecycle
    onMounted(() => {
      loadImages(); // Fetch data pertama kali
    });

    return {
      images,
      total,
      totalPages,
      loading,
      options,
      filters,
      uploadDialog,
      uploadFiles,
      uploadData,
      loadImages,
      uploadImages,
      closeUploadDialog,
      onFilterChange,
      onPaginationChange,
    };
  },
};
</script>

<style scoped>
.v-card-title {
  font-weight: bold;
}

.v-row {
  row-gap: 16px;
}

.v-col {
  margin-bottom: 16px;
}
</style>
