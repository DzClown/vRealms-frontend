<template>
  <DashboardLayout>
    <v-container>
      <v-row>
        <v-col>
          <h1>Welcome to the Dashboard</h1>
          <p>Your content goes here...</p>
        </v-col>
      </v-row>
    </v-container>
  </DashboardLayout>
</template>

<script>
import DashboardLayout from '@/layouts/DashboardLayout.vue';

export default {
  components: {
    DashboardLayout,
  },
};
</script>

<style scoped>
h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
}
p {
  font-size: 1rem;
}
</style>
