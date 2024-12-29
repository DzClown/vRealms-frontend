import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createVuetify } from 'vuetify';
import 'vuetify/styles';
import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import { abilitiesPlugin } from '@casl/vue';
import '@/styles/settings.scss';

// Setup initial abilities
const ability = createMongoAbility();
const vuetify = createVuetify({
  theme: {
    themes: {
      light: {
        primary: '#1976D2',
        secondary: '#424242',
      },
    },
  },
});
const app = createApp(App);

app.use(abilitiesPlugin, ability);
app.use(router);
app.use(vuetify);
app.mount('#app');
