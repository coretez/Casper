<template>
  <div class="row rowFormatHeader">
    <div>{{ k }}</div>
    <div>&nbsp;({{ value }})</div>
  </div>
</template>

<script>
export default {
  props: ['k', 'value'],
  name: 'itemRowFieldSummary',
};
</script>

<style scoped>
.rowFormatHeader{
  padding: 5px 5px 5px 25px;
  color: #677180;
}
</style>
