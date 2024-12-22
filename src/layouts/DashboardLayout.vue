<template>
  <v-app>
    <v-navigation-drawer app v-model="drawer" temporary>
      <Sidebar />
    </v-navigation-drawer>
    <Navbar @toggle-drawer="drawer = !drawer" />
    <v-main>
      <slot />
    </v-main>
  </v-app>
</template>

<script>
import Navbar from '@/components/Navbar.vue';
import Sidebar from '@/components/Sidebar.vue';
import { ref } from 'vue';

export default {
  components: {
    Navbar,
    Sidebar,
  },
  setup() {
    const drawer = ref(false);

    return {
      drawer,
    };
  },
};
</script>

<style scoped>
.v-navigation-drawer {
  z-index: 1000;
}

.v-app-bar {
  z-index: 1100;
}
</style>
