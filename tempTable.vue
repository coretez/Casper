<template>
  <div class="b-contentPage">
    <facet-sidebar
      editable
      :namespace="namespace"
      :loading="loading"
      @search="searchEmitted"
    />
    <div class="b-contentPage__content">
      <div class="b-panel -padding_top">
        <div class="b-panel__item -width_50 -align_left">
          <h3 class="b-title">Event Search</h3>
          <q-spinner v-if="loading" class="spinner" size="20px" />
        </div>
        <div class="b-panel__item -width_50 -align_right">
          <q-toggle v-model="pagePin" label="Pin this page"/>
        </div>
      </div>
      <div class="b-panel dont-print">
        <div class="b-panel__item -width_20"></div>
        <div class="b-panel__item -width_60 -align_center">
          <search-bar
            :disabled="loading"
            :will-complete="true"
            :completeList="searchList"
            @searchStringDidUpdate="string => searchString = string"
            :searchStr="searchString"
            @newSearch="searchEmitted"
          />
        </div>
        <div class="b-panel__item -width_10">
          <q-spinner v-if="loadingExportData" class="spinner" size="20px" />
        </div>
        <q-btn class="-type_basic" icon="cancel" @click="cancelSearch">
          <q-tooltip>Cancel Search</q-tooltip>
        </q-btn>
        <q-btn class="-align_right" icon="cloud_download" @click="exportData">
          <q-tooltip>Export Data</q-tooltip>
        </q-btn>
      </div>
      <div class="row justify-center">
        <div class="b-contentPage__chart">
          <fl-flot
            v-if="histographData.loaded"
            type="events"
            :zoomDateRange="zoomDateRange"
            :data="histographData.curHistoData"
            @newRange="histogramRangeChange"
          />
          <no-data-cover v-else />
        </div>
      <div class="b-contentPage__chart">
        <range-picker
          :zoomDateRange="zoomDateRange"
          :dateRangeType="dateRangeType"
          v-on:update:range="pickerChangeRange"
        />
        <div class="range-cover shadow-1">
          <div v-if="sliderData.loaded">
            <range-slider
              :chart-data="sliderData"
              :start="zoomDateRange.from"
              :end="zoomDateRange.to"
              chart-width="1000"
              chart-height="110"
              chart-background="#f8f8f8"
              @rangeset="sliderChange"
              chart-id="eventsSlider"/>
            <time-zone type="events" :sliderData="sliderData" :dateRange="dateRange" />
          </div>
          <no-data-cover v-if="!sliderData.loaded" />
        </div>
      </div>
      </div>
      <div class="main">
        <div class="content">
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
                <q-td key="timestamp" :props="props"> {{ formatTime(props.row._source['@timestamp']) }}</q-td>
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
      </div>
    </div>
  </div>
</template>

<script>

import moment from 'moment'
import { mapGetters, mapActions, mapMutations } from 'vuex'
import { facetStoreModuleMixin, paginationMixin, exportDataMixin } from 'src/mixins'
import RangeSlider from '../../utils/3dcomponents/RangeSlider.vue'
import RangePicker from './Flows/RangePicker.vue'
import FacetSidebar from '../../utils/FacetSidebar.vue'
import Flot from './Flows/Histogram.vue'
import SearchBar from '../../utils/search/SearchBar.vue'
import TimeZone from './Flows/TimeZone.vue'
import NoDataCover from 'src/components/no-data-cover'
import { generateAutoCompleteList } from 'src/services/dataParseService'
import TextHighlight from 'vue-text-highlight'

export default {
  components: {
    'fl-flot': Flot,
    FacetSidebar,
    NoDataCover,
    RangePicker,
    RangeSlider,
    SearchBar,
    TimeZone,
    TextHighlight
  },

  mixins: [facetStoreModuleMixin, paginationMixin, exportDataMixin],

  data () {
    return {
      namespace: 'eventAlt',
      searchList: [],
      isFullscreen: false,
      columns: [
        { name: 'timestamp', label: 'Time', align: 'left', field: '_source[@timestamp]', sortable: true },
        { name: 'source', label: 'Source', field: '_source[@source]', sortable: true },
        { name: 'sender', label: 'Sender', field: '_source[@sender]' },
        { name: 'level', label: 'Level', field: '_source[@level]' },
        { name: 'facility', label: 'Facility', field: '_source[@facility]' }
      ]
    }
  },

  watch: {
    items (items) {
      this.searchList = generateAutoCompleteList(items)
    },

    $route (value) {
      if (value.query) {
        this.routeParams()
      }
    }
  },

  computed: {
    ...mapGetters('metaflow', ['dateRange', 'dateRangeType', 'sliderOptions', 'zoomDateRange']),
    ...mapGetters('metaflow', { histographData: 'histographDataEvents', sliderData: 'sliderDataEvents' }),
    ...mapGetters('eventAlt', ['loading', 'sort', 'terms']),
    pagePin: {
      get () {
        return this.$store.getters['pagePin/event']
      },

      set (value) {
        this.$store.dispatch('pagePin/setEventPagePin', value)
      }
    }
  },

  methods: {
    ...mapActions('eventAlt', ['sortChange', 'resetHistograph']),
    ...mapActions('metaflow', ['cancelSearch', 'loadHistogram']),
    ...mapMutations({ inputZoomValues: 'metaflow/m_inputZoomValues', setSort: 'event/setSort' }),

    formatTime (ts) {
      return moment(ts).format('L LTS')
    },
    pickerChangeRange (event, search) {
      this.$store.dispatch('metaflow/setDateRangeAndZoom', event).then(() => {
        if (search) {
          this.setPageAndSearch(0)
        }

        this.loadHistogram('events')
      })
    },

    search (page) {
      if (this.loading) {
        this.$q.notify({ type: 'info', message: 'Already loading a search' })
      } else {
        this.setPageAndSearch(page)
      }
    },

    histogramRangeChange (e) {
      this.$store.dispatch('metaflow/setZoomDateRange', { from: e.from, to: e.to })
    },

    resetSearch () {
      this.facetClear()
      this.paginationReset()
      this.resetHistograph()
    },

    clickSearchFlow (event) {
      const routeOptions = {
        name: 'globalSearch',
        query: {
          center: event,
          minutes: 5,
          action: 'search'
        }
      }

      this.$router.push(routeOptions)
    },
    clearQueryAndSearch (event) {
      if (typeof event.query === 'undefined' || event.query === 'undefined') {
        this.setSearchString('')
        this.$router.replace({ query: {} })
      } else {
        this.$router.replace({ query: { q: event.query } })
        this.setSearchString(event.query)
      }

      this.search(0)
    },

    sliderChange (e) {
      this.$store.dispatch('metaflow/setZoomDateRange', { from: e.from.getTime(), to: e.to.getTime() })
    },

    async routeParams () {
      const { action, q, from, to, center, minutes } = this.$route.query

      if (q) {
        // clears facet/results/pagination if routed here
        await this.resetSearch()
        await this.setSearchString(q)
      }

      if (from && to) {
        // parseInt because query params come in as strings and the backend needs an integer
        await this.$store.dispatch('metaflow/setDateRangeAndZoom', { type: 'range', from: parseInt(from), to: parseInt(to) })
      } else if (center) {
        await this.$store.dispatch('metaflow/setDateRangeAndZoom', { type: 'center', center: parseInt(center), minutes: parseInt(minutes) })
      }

      if (action === 'search') {
        this.search(0)
      }
    }
  },

  beforeMount () {
    this.setPaginationRowsNumber(1)
  },

  async mounted () {
    if (this.$route && this.$route.query) {
      await this.routeParams()
    }

    this.loadHistogram('events')
  }
}
</script>

<style scoped>
.range-cover {
  display: inline-flex;
  padding: 8px;
}

.pad-below {
  padding-top: 10px;
  padding-bottom: 20px;

}

.loading {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width:1100px;
  height:400px;
  background-color: azure;
  opacity: 0.4;
}

.loading-text {
  position: relative;
  color: black;
  font-weight: 600;
}

.loading-slider {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width:900px;
  height:100px;
  background-color: azure;
  opacity: 0.4;
}

.spinner {
  margin-top: 20px;
  margin-left: 10px;
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

.page-label {
  font-size: 12px;
  padding-right: 10px;
}
</style>

