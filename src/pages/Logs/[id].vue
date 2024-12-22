<template>
  <div>
    <h1>Log Details</h1>
    <p>Viewing log with ID: {{ id }}</p>
  </div>
</template>

<script>
export default {
  name: 'LogDetails',
  props: {
    id: {
      type: String,
      required: true,
    },
  },
};
</script>
