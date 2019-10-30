<template>
  <div class="row rowFormatHeader">
    <div><q-icon :name=icon />&nbsp; {{ title }}</div>
    <div><q-icon name="fa fa-chevron-down" /></div>
  </div>
</template>

<script>
export default {
  props: ['icon', 'title'],
  name: 'titleRowFieldSummary',
};
</script>

<style scoped>
.rowFormatHeader{
  justify-content: space-between;
  padding: 5px;
}
</style>
