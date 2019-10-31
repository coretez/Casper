<template>
  <div class="tableSpace">
    <div class="row">
      <q-table
          title="Events"
          row-key="index"
          :data="items"
          :columns="columns"
          :fullscreen.sync="isFullscreen"
        >
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="time" :props="props"> {{ formatTime(props.row.time) }}</q-td>
            <q-td key="fields" :props="props"> {{ props.row.fields }}</q-td>
          </q-tr>
          <q-tr :props="props">
            <q-td colspan="2">
              <div class="record-data">
                <text-highlight :queries=terms>{{ props.row.msg }}</text-highlight>
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
      </q-table>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import moment from 'moment'
import TextHighlight from 'vue-text-highlight'

export default {
  components: {
    TextHighlight
  },
  name: 'BaseTable',
  data () {
    return {
      data: {},
      items: [],
      terms: [],
      isFullscreen: false,
      columns: [
        { name: 'time', label: 'Time', field: 'time', align: 'left' },
        { name: 'fields', label: 'Fields', field: 'fields', align: 'left' }
      ]
    }
  },
  methods: {
    cleanHold (rec) {
      const smallRec = rec._source
      return {
        index: rec._id,
        time: smallRec['@timestamp'],
        fields: 'sip, dip, sport, port, protocol',
        msg: smallRec['@message']
      }
    },

    formatTime (ts) {
      return moment(ts).format('MMM DD YYYY, HH:mm:ss.SSS')
    },

    getData (ip) {
      const url = '/api/ds/get_index_zoom_histogram_lv3'
      const options = {
        kargs: {
          dataType: 'event',
          partition: 'default',
          options: {
            fetchOffset: 0,
            fetchLimit: 20,
            facets: {
              facets: [
                {
                  title: 'Source',
                  size: 50,
                  order: 'count',
                  field: '@source'
                }, {
                  title: 'Tags',
                  size: 50,
                  order: 'count',
                  field: '@tags'
                }, {
                  title: 'Severity',
                  size: 50,
                  order: 'count',
                  field: '@level'
                }, {
                  title: 'Event Type',
                  size: 50,
                  order: 'count',
                  field: '@fields.event_type'
                }],
              mustFilters: [],
              mustNotFilters: [],
              dateFacets: [{
                name: 'dateHistogram',
                key: '@timestamp'
              }]
            },
            dataType: 'event',
            range_from: 1570514400000,
            range_to: 1570579200000,
            searchStr: 'capture',
            sortField: '@timestamp',
            sortOrder: 'desc',
            dateFacetField: '@timestamp'
          }
        }
      }
      axios.defaults.headers.common.FluencyToken = '966a95a6-5187-4d57-614a-da09572470ef'

      axios.post(url, options)
        .then(resultResponse => {
          const hold = resultResponse.data.response.hits.hits
          this.terms = resultResponse.data.response.terms
          this.items = hold.map(x => this.cleanHold(x))
        })
        .catch(e => {
          this.restError = e
          this.$q.notify({ type: 'negative', message: 'No such host' })
          this.device.hostname = 'n/a'
        })
    }
  },

  beforeMount () {
    this.getData()
  },

  mounted () {}
}

</script>

<style scoped>
.tableSpace {
  width: 100%;
  padding: 20px;
  background-color: #f5f6f8
}

.record-data {
    font-size: 0.85em;
    font-style: italic;
    white-space: normal;
    word-wrap: break-word;
    color: #555;
    margin-top: 4px;
    column-span: all;
}
</style>
