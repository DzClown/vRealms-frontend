<template>
  <v-app-bar app>
    <v-app-bar-nav-icon @click="toggleDrawer"></v-app-bar-nav-icon>
    <v-toolbar-title>vRealms Dashboard</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-menu>
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" text>
          <v-avatar size="32">
            <v-img :src="avatarUrl" alt="User Avatar" />
          </v-avatar>
          <span class="ml-2">Halo, {{ username }}</span>
        </v-btn>
      </template>
      <v-list>
        <v-list-item to="/settings-profile">
          <v-list-item-title>Setting Profile</v-list-item-title>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item @click="logout">
          <v-list-item-title>Logout</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useLocalStorage } from '@/composables/useLocalStorage';

export default {
  props: {
    onToggleDrawer: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const username = ref('Guest');
    const avatarUrl = ref('https://api-service.vrealmscity.com:26920/api/v1/image/avatar/default.png'); // Default avatar
    const router = useRouter();
    const userDataStorage = useLocalStorage('vRealms-dash-userData');

    onMounted(() => {
      try {
        const userData = typeof userDataStorage.value === 'string'
          ? JSON.parse(userDataStorage.value)
          : userDataStorage.value;
        username.value = userData.firstname || userData.username || 'Guest';
        avatarUrl.value = userData.avatar?.href || 'https://api-service.vrealmscity.com:26920/api/v1/image/avatar/default.png';
      } catch (error) {
        console.error('Invalid user data:', error);
        username.value = 'Guest';
        avatarUrl.value = 'https://api-service.vrealmscity.com:26920/api/v1/image/avatar/default.png';
      }
    });

    const logout = () => {
      document.cookie = 'vRealms-dash-accessToken=; Max-Age=0; path=/';
      localStorage.removeItem('vRealms-dash-userData');
      router.push('/login');
    };

    const toggleDrawer = () => {
      props.onToggleDrawer();
    };

    return {
      username,
      avatarUrl,
      logout,
      toggleDrawer,
    };
  },
};
</script>

<style scoped>
.v-toolbar-title {
  font-weight: bold;
  font-size: 1.25rem;
}

.v-avatar img {
  border-radius: 50%;
}
</style>
