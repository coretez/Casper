<template>
  <q-page class="page-wrapper">
    <div class="row">
      <page-header></page-header>
    </div>
    <div class="row">
      <field-summary></field-summary>
      <base-table></base-table>
    </div>
  </q-page>
</template>

<script>
import BaseTable from './Events/BaseTable'
import FieldSummary from './Common/FieldSummary'
import PageHeader from './Events/PageHeader'

export default {
  name: 'PageEvents',
  components: {
    PageHeader,
    BaseTable,
    FieldSummary
  }
}
</script>

<style>
.page-wrapper {
  margin: 15px;
}

.row {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  width: 100%;
}

.column {
  display: flex;
  flex-direction: column;
  flex-basis: 100%;
  flex: 1;
}

</style>
