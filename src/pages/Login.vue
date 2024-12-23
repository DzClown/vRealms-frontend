<script>
import { api } from '@/utils/api';
import { useLocalStorage } from '@/composables/useLocalStorage';
import { useCookie } from '@/@core/composable/useCookie';
import { useAbility } from '@casl/vue';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default {
  setup() {
    const username = ref('');
    const password = ref('');
    const valid = ref(false);
    const rememberMe = ref(false);

    const route = useRoute();
    const router = useRouter();
    const ability = useAbility();
    const userDataStorage = useLocalStorage('vRealms-dash-userData');
    const userAbilityRulesStorage = useLocalStorage('vrealms-dash-admin-userAbilityRules');
    const userRoleCookie = useCookie('vrealms-dash-admin-userRole');
    const accessTokenCookie = useCookie('vrealms-dash-admin-accessToken');
    const refreshTokenCookie = useCookie('vrealms-dash-admin-refreshToken');
    const userIdCookie = useCookie('vrealms-dash-admin-userId');

    const mapPrivilegesToAbilityRules = (privileges) => {
      if (!Array.isArray(privileges)) {
        console.warn('Privileges is not a valid array:', privileges);
        return [];
      }

      return privileges
        .filter(privilege => typeof privilege === 'string') // Hanya proses elemen yang valid
        .map(privilege => {
          const [subject, action] = privilege.split('_');
          const formattedAction = action ? `${action[0].toUpperCase()}${action.slice(1).toLowerCase()}` : '';
          const formattedSubject = subject ? `${subject[0].toUpperCase()}${subject.slice(1).toLowerCase()}` : '';
          return { action: formattedAction, subject: formattedSubject };
        });
    };


    const handleLogin = async () => {
      try {
        const response = await api.post('/auth/login', {
          username: username.value,
          password: password.value,
        });

        if (!response.data || !response.data.dataLogin) {
          throw new Error('Data login tidak ditemukan');
        }

        const { _id, accessToken, refreshToken, privilage, role } = response.data.dataLogin;

        if (!_id || !accessToken || !Array.isArray(privilage)) {
          throw new Error('Data login tidak valid');
        }

        // Map privileges
        const userAbilityRules = mapPrivilegesToAbilityRules(privilage);

        // Simpan data ke cookie dan localStorage
        userRoleCookie.value = JSON.stringify(role);
        userDataStorage.value = response.data.dataLogin;
        userAbilityRulesStorage.value = userAbilityRules;

        // Update ability instance dengan aturan baru
        ability.update(userAbilityRules);

        // Simpan token di cookie dengan opsi rememberMe
        if (rememberMe.value) {
          accessTokenCookie.value = accessToken;
          refreshTokenCookie.value = refreshToken;
          accessTokenCookie.options = { maxAge: 60 * 60 * 24 * 30 }; // 1 bulan
          userIdCookie.value = _id;
          userIdCookie.options = { maxAge: 60 * 60 * 24 * 30 }; // 1 bulan
        } else {
          accessTokenCookie.value = accessToken;
          refreshTokenCookie.value = refreshToken;
          userIdCookie.value = _id;
        }

        // Redirect ke halaman dashboard atau tujuan sebelumnya
        router.replace(route.query.to || '/dashboard');
      } catch (error) {
        console.error('Login failed:', error.response?.data || error.message);
        alert('Login gagal. Periksa username atau password.');
      }
    };


    return {
      username,
      password,
      valid,
      rememberMe,
      handleLogin,
    };
  },
};
</script>


<template>
  <v-container class="fill-height d-flex justify-center align-center">
    <v-card width="400">
      <v-card-title>Login</v-card-title>
      <v-card-text>
        <v-form v-model="valid" ref="form">
          <v-text-field
            v-model="username"
            label="Username"
            required
          ></v-text-field>
          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            required
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn :disabled="!valid" @click="handleLogin">Login</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>
