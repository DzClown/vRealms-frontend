<template>
  <v-list dense>
    <template v-for="(item, index) in menuItems" :key="index">
      <v-list-subheader v-if="item.heading">{{ item.heading }}</v-list-subheader>
      <v-list-item v-else :to="item.to" router exact>
        <v-list-item-icon>
          <VIcon>{{ item.icon.icon }}</VIcon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </template>
  </v-list>
</template>

<script>
import menuItems from '@/navigation/vertical/apps';

export default {
  data() {
    return {
      menuItems,
    };
  },
};
</script>

<style scoped>
.v-list-item-icon {
  margin-right: 16px; /* Adjust spacing */
}

.v-list-item-title {
  font-weight: 500;
}

.v-list-subheader {
  font-size: 14px;
  font-weight: bold;
  margin-top: 8px;
  margin-bottom: 4px;
}
</style>
