<template>
  <div class="tableSpace">
    <q-table
      title="Events"
      :data="items"
      :loading="loading"
      :pagination.sync="tablePagination"
      @request="tablePaginationRequest"
      :columns="columns"
      row-key="_index"
      :fullscreen.sync="isFullscreen"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="timestamp" :props="props">
            {{ formatTime(props.row._source['@timestamp']) }}]
          </q-td>
          <q-td key="source" :props="props"> {{ props.row._source['@source'] }}</q-td>
          <q-td key="sender" :props="props">{{ props.row._source['@sender'] }}</q-td>
          <q-td key="level" :props="props">{{ props.row._source['@level'] }}</q-td>
          <q-td key="facility" :props="props">{{ props.row._source['@facility'] }}</q-td>
        </q-tr>
        <q-tr :props="props">
          <q-td colspan="5">
            <div class="record-data">
              <text-highlight :queries=terms>{{ props.row._source }}</text-highlight>
            </div>
          </q-td>
        </q-tr>
      </template>
      <div slot="top-right" slot-scope="{ }" class="column">
        <div class="row">
          <q-toggle
            v-model="isFullscreen"
            checked-icon="check"
            color="green-10"
            label="Full Screen"
            unchecked-icon="clear"
          ></q-toggle>
        </div>
      </div>
      <div slot="top-left" slot-scope="pagination" class="column">
        <div class="row" style="  align-items: center; justify-content: center;">
          <div v-if="items.length != 0" class="page-label">
            {{ (pagination.pagination.page - 1) * pagination.pagination.rowsPerPage + 1 }} -
            {{ pagination.pagination.page * pagination.pagination.rowsPerPage + 1 }} of
            {{ pagination.pagination.rowsNumber }}
          </div>
          <div v-if="items.length != 0">
            <q-btn
              round
              flat
              color="primary"
              icon="chevron_left"
              size="14px;"
              @click="pagination.prevPage()" ></q-btn>
            <q-btn
              round
              flat
              color="primary"
              icon="chevron_right"
              size="14px;"
              @click="pagination.nextPage()" ></q-btn>
          </div>
        </div>
      </div>
    </q-table>
  </div>
</template>

<script>
import TextHighlight from 'vue-text-highlight';
import axios from 'axios';

export default {
  name: 'BaseTable',
  components: {
    TextHighlight,
  },
  data() {
    return {
      isFullscreen: false,
      columns: [
        {
          name: 'timestamp', label: 'Time', align: 'left', field: '_source[@timestamp]', sortable: true,
        },
        {
          name: 'source', label: 'Source', field: '_source[@source]', sortable: true,
        },
        { name: 'sender', label: 'Sender', field: '_source[@sender]' },
        { name: 'level', label: 'Level', field: '_source[@level]' },
        { name: 'facility', label: 'Facility', field: '_source[@facility]' },
      ],
    };
  },
};
</script>

<style scoped>
.tableSpace {
  width: 80%;
  margin: 10px;
  padding: 10px;
}
</style>
