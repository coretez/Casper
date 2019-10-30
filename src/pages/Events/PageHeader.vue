<template>
  <div class="headerSpace">
    <div class="row rowFormatHeader">
      <div class="div">
        <span class="subTitle">New search</span>
      </div>
      <div class="div">
        <q-btn
          flat stretch
          text-color="blue-6"
          label="SEARCH"
        />
        <q-btn
          flat stretch
          text-color="blue-6"
          label="LIBRARY"
        />
      </div>
    </div>
    <div class="row">
      <q-input outlined v-model="searchString" stack-label />
      <q-btn-dropdown
        :label= searchRange
        size="1em"
      >
        <q-list>
          <q-item clickable v-close-popup @click="onItemClick('Searching One Day')">
            <q-item-section> <q-item-label>One Day</q-item-label> </q-item-section>
          </q-item>
          <q-item clickable v-close-popup @click="onItemClick('Searching One Week')">
            <q-item-section> <q-item-label>One Week</q-item-label> </q-item-section>
          </q-item>
          <q-item clickable v-close-popup @click="onItemClick('Searching One Month')">
            <q-item-section> <q-item-label>One Month</q-item-label> </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
      <q-btn stretch color="primary" icon="fa fa-search" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'SectionEventsHeader',
  data() {
    return {
      searchString: '',
      searchRange: 'Within One Month',
    };
  },
  methods: {
    onItemClick(state) {
      this.searchRange = state;
    },
  },
};
</script>

<style scoped>
.headerSpace {
  width: 100%;
  margin: 10px;
  padding: 10px;
}

.rowFormatHeader{
  justify-content: space-between
}

.subTitle {
  font-weight: 500;
  font-size: 1.2em;
}
</style>
