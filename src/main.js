import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createVuetify } from 'vuetify';
import 'vuetify/styles';
import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import { abilitiesPlugin } from '@casl/vue';

// Setup initial abilities
const ability = createMongoAbility();
const vuetify = createVuetify();
const app = createApp(App);

app.use(abilitiesPlugin, ability);
app.use(router);
app.use(vuetify);
app.mount('#app');
