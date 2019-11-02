<template>
  <div class="tableSpace">
    <div class="row">
      <q-table
          title="Events"
          row-key="index"
          hide-header
          :data="items"
          :columns="columns"
          :fullscreen.sync="isFullscreen"
        >
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td>
                <q-btn v-if="!props.row.table" flat round color="grey-9" icon="fa fa-chevron-right" size="xs"
                 @click="props.row.table = true"/>
                <q-btn v-if="props.row.table" flat round color="grey-9" icon="fa fa-chevron-down" size="xs"
                 @click="props.row.table = false"/>
            </q-td>
            <q-td key="time" :props="props">
              <div>
                <span class="record-header">{{ formatTime(props.row.time) }}</span>&nbsp;&nbsp;
                |&nbsp;&nbsp;<span class="fieldList"> {{ showArray(props.row.fields) }} </span>
              </div>
            </q-td>
          </q-tr>
          <q-tr v-if="!props.row.table" :props="props">
            <q-td></q-td>
            <q-td>
              <div class="record-data">
                <text-highlight :queries=terms>{{ props.row.msg }}</text-highlight>
              </div>
            </q-td>
          </q-tr>
          <q-tr v-if="props.row.table" :props="props">
            <q-td></q-td>
            <q-td>
              <div class="record-data">
                Dot: {{ props.row.dot }}
              </div>
            </q-td>
          </q-tr>
        </template>
        <div slot="top-left" slot-scope="{ }" class="column">
          <div class="row">
              <span class="countStyle">{{formatNumber(count)}} Matching Events</span>
          </div>
          <div class="row" style="width: 400px; align-items; display: block;">
            Sort:
            <q-btn-dropdown
              background-color="white"
              label= "Newest First"
              dense
              flat
              no-caps
              size="1em"
            >
              <q-list>
                <q-item clickable v-close-popup @click="onItemClick('Searching One Day')">
                  <q-item-section> <q-item-label>Newest First</q-item-label> </q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="onItemClick('Searching One Week')">
                  <q-item-section> <q-item-label>Oldest First</q-item-label> </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </div>
        </div>
        <div slot="top-right" slot-scope="{ }" class="column">
          <div class="row">
            <q-btn flat round color="grey-5" icon="share" size="sm"/>
            <q-btn flat round color="grey-5" icon="fa fa-download" size="sm"/>
            <q-btn
              v-if="!isFullscreen"
              @click="isFullscreen = true"
              flat round color="grey-5"
              icon="fullscreen" size="sm"/>
            <q-btn
              v-if="isFullscreen"
              @click="isFullscreen = false"
              flat round color="grey-5"
              icon="fullscreen_exit" size="sm"/>
          </div>
          <div class="row">
            Pagintation
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
import { convertJsonToDot, convertJsonToFields } from '../Common/dotNotation'

export default {
  components: {
    TextHighlight
  },
  name: 'BaseTable',
  data () {
    return {
      count: 0,
      data: {},
      items: [],
      terms: [],
      isFullscreen: false,
      columns: [
        { name: 'time', label: 'Time', field: 'time', align: 'left' }
      ],
      sortOptions: [
        { label: 'Newest', value: 'desc' },
        { label: 'Oldest', value: 'asc' }
      ],
      sortChoice: { label: 'Newest', value: 'desc' }
    }
  },
  methods: {
    cleanHold (rec) {
      const smallRec = rec._source
      return {
        index: rec._id,
        time: smallRec['@timestamp'],
        fields: convertJsonToFields(rec._source['@fields']),
        msg: smallRec['@message'],
        dot: convertJsonToDot(rec._source['@fields']), // This is the record that we want to derive field list from
        table: false
      }
    },

    showArray (rec) {
      let result = ''
      rec.forEach((x) => {
        result = result + ' ' + x + ','
      })
      // if > 0 then remvoe the last character
      return result
    },

    formatNumber (num) {
      return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
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
          this.count = resultResponse.data.response.hits.total
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

.record-header {
    font-size: 1.2em;
    white-space: normal;
    word-wrap: break-word;
}

.fieldList {
  font-size: 1em;
  font-weight: 300;
  white-space: normal;
  word-wrap: break-word;
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

.countStyle {
  font-weight: 500;
  font-size: 1.2em;
}
</style>
