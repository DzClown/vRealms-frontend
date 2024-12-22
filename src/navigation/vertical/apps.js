import { useLocalStorage } from "@/composables/useLocalStorage";

const userData = useLocalStorage('vRealms-dash-userData').value;
const userName = userData?.firstName || 'Guest';

const menuItems = [
  {
    heading: 'Dashboard',
  },
  {
    title: 'Dashboard',
    to: { name: 'dashboard-Dashboard' },
    icon: { icon: 'mdi-monitor-dashboard' },
  },
  {
    heading: 'Logging',
  },
  {
    title: 'Log',
    to: { name: 'dashboard-Logs' },
    icon: { icon: 'mdi-file-document' },
  },
];

export default menuItems;
