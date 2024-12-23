<template>
  <DashboardLayout>
    <v-container>
      <v-card class="mx-auto" max-width="800">
        <v-img :src="image._link.href" aspect-ratio="16/9" alt="Image preview"></v-img>
        <v-card-title class="text-h5">{{ image.related_id }}</v-card-title>
        <v-card-subtitle>{{ image.description }}</v-card-subtitle>
        <v-card-text>
          <p><strong>Type:</strong> {{ image.type }}</p>
          <p><strong>Uploader:</strong> <a :href="image.uploader.href" target="_blank">{{ image.uploader.id }}</a></p>
          <p><strong>Created At:</strong> {{ image.created_at }}</p>
        </v-card-text>
      </v-card>
    </v-container>
  </DashboardLayout>
</template>

<script>
import DashboardLayout from "@/layouts/DashboardLayout.vue";
import { ref, onMounted } from "vue";
import { api } from "@/utils/api";

export default {
  components: {
    DashboardLayout,
  },
  setup() {
    const image = ref(null); // Detail image
    const id = window.location.pathname.split("/").pop(); // Extract ID from URL

    const fetchImageDetail = async () => {
      try {
        const response = await api.get(`/image/${id}`);
        image.value = response.data;
      } catch (error) {
        console.error("Error fetching image detail:", error);
      }
    };

    onMounted(() => {
      fetchImageDetail(); // Fetch image detail on page load
    });

    return {
      image,
    };
  },
};
</script>
