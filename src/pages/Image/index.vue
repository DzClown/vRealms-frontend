<template>
  <DashboardLayout>
    <v-container>
      <v-card-title class="text-h4 mb-5">Images</v-card-title>
      <v-row justify="space-between" class="mb-5 ml-4" align="center">
        <v-btn @click="uploadDialog = true" color="primary">Upload Image</v-btn>
      </v-row>
      <v-card>
        <v-data-table-server
          v-model:items-per-page="options.itemsPerPage"
          v-model:page="options.page"
          :headers="headers"
          :items="images"
          :items-length="total"
          :loading="loading"
          item-value="_id"
          @update:options="loadImages"
        >
        <!-- Name with clickable detail -->
        <template v-slot:[`item.name`]="{ item }">
            <v-btn text @click="showImageDetail(item.detail.href)">
              {{ item.name }}
            </v-btn>
          </template>
          <!-- Custom Slot untuk Uploader -->
          <template v-slot:[`item.uploader`]="{ item }">
            <div v-if="item.uploaderDetails">
              {{ item.uploaderDetails.firstname }} {{ item.uploaderDetails.lastname }}
            </div>
            <div v-else>Loading...</div>
          </template>
          <!-- Tombol Copy Link -->
          <template v-slot:[`item.copyLink`]="{ item }">
            <v-btn icon @click="copyLink(item._link.href)">
              <v-icon>mdi-content-copy</v-icon>
            </v-btn>
          </template>
          <!-- Footer untuk Filter -->
          <template v-slot:tfoot>
            <tr>
              <td>
                <v-text-field
                  v-model="filters.param"
                  class="ma-2"
                  density="compact"
                  placeholder="Search..."
                  hide-details
                  @input="onFilterChange"
                />
              </td>
            </tr>
          </template>
        </v-data-table-server>
      </v-card>
    </v-container>

    <!-- Modal for Image Details -->
    <v-dialog v-model="detailDialog" max-width="800px">
      <v-card>
        <v-card-title>Image Details</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-img :src="selectedImage._link?.href" max-height="400px" contain></v-img>
            </v-col>
            <v-col cols="12" md="6">
              <p><strong>Name:</strong> {{ selectedImage.name }}</p>
              <p><strong>Description:</strong> {{ selectedImage.description }}</p>
              <p><strong>Type:</strong> {{ selectedImage.type }}</p>
              <p><strong>Uploader:</strong> {{ selectedImage.uploaderDetails?.firstname }} {{ selectedImage.uploaderDetails?.lastname }}</p>
              <p><strong>Created At:</strong> {{ selectedImage.created_at }}</p>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="detailDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import { ref, onMounted, watch } from 'vue';
import { api } from '@/utils/api';

export default {
  components: {
    DashboardLayout,
  },
  setup() {
    const images = ref([]);
    const total = ref(0);
    const loading = ref(false);
    const detailDialog = ref(false);
    const selectedImage = ref({});
    const uploadDialog = ref(false);
    const uploadFiles = ref(null);
    const uploadData = ref({ related_id: '', type: '', description: '' });
    const options = ref({ page: 1, itemsPerPage: 10 });
    const filters = ref({ param: '' });

    const headers = ref([
      { title: 'Name', value: 'name' },
      { title: 'Description', value: 'description' },
      { title: 'Type', value: 'type' },
      { title: 'Uploader', value: 'uploader' },
      { title: 'Created At', value: 'created_at' },
      { title: "Copy Link", value: "copyLink" },
    ]);

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
          const dataImages = response.data._embeded?.dataImages || [];
          for (const image of dataImages) {
            const uploaderDetails = await fetchUploaderDetails(image.uploader.href);
            image.uploaderDetails = uploaderDetails;
          }
          images.value = dataImages;
          total.value = response.data.total || 0;
        }
      } catch (error) {
        console.error("Error fetching images:", error);
      } finally {
        loading.value = false;
      }
    };

    const showImageDetail = async (detailUrl) => {
      console.log(detailUrl)
      try {
        const response = await api.get(detailUrl);
        console.log(response.data)
        if (response.status === 200 && response.data) {
          selectedImage.value = response.data;
          detailDialog.value = true;
        }
      } catch (error) {
        console.error('Error fetching image detail:', error);
      }
    };

    const uploadImages = async () => {
      try {
        const formData = new FormData();
        formData.append('related_id', uploadData.value.related_id);
        formData.append('type', uploadData.value.type);
        formData.append('description', uploadData.value.description);

        if (uploadFiles.value && uploadFiles.value.length > 0) {
          for (const file of uploadFiles.value) {
            formData.append('file', file);
          }
        }

        const response = await api.post('/image/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-upload-type': 'multi',
          },
        });

        if (response.status === 201) {
          console.log('Images uploaded successfully:', response.data);
          loadImages();
        }

        closeUploadDialog();
      } catch (error) {
        console.error('Error uploading images:', error);
      }
    };

    const fetchUploaderDetails = async (url) => {
      try {
        const response = await api.get(url);
        if (response.status === 200 && response.data) {
          return response.data.data;
        }
      } catch (error) {
        console.error("Error fetching uploader details:", error);
      }
      return { firstname: "Unknown", lastname: "User" };
    };

    const closeUploadDialog = () => {
      uploadDialog.value = false;
      uploadFiles.value = null;
      uploadData.value = { related_id: '', type: '', description: '' };
    };
    const copyLink = (link) => {
      navigator.clipboard.writeText(link).then(
        () => {
          console.log("Link copied to clipboard:", link);
        },
        (err) => {
          console.error("Failed to copy link:", err);
        }
      );
    };

    const onFilterChange = () => {
      options.value.page = 1;
      loadImages();
    };

    watch(options, loadImages, { immediate: true });

    onMounted(() => {
      loadImages();
    });

    return {
      images,
      total,
      loading,
      detailDialog,
      selectedImage,
      options,
      filters,
      uploadDialog,
      uploadFiles,
      uploadData,
      headers,
      loadImages,
      uploadImages,
      copyLink,
      fetchUploaderDetails,
      closeUploadDialog,
      showImageDetail,
      onFilterChange,
    };
  },
};
</script>

<style scoped>
.v-card-title {
  font-weight: bold;
}
</style>
