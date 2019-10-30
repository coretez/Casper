
<template>
  <q-layout view="hHh lpR fFf">

    <q-header reveal elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>
            <img src="statics/exabeam.svg" height="24px">
        </q-toolbar-title>
        <q-space />
        <q-btn-toggle
        v-model="activePage"
        flat stretch
        text-color="light-blue-3"
        toggle-color="white"
        :options="[
          {label: 'SEARCH', value: 'search'},
          {label: 'VISUALZE', value: 'vizualize'},
          {label: 'DASHBOARD', value: 'dashboard'},
          {label: 'REPORT', value: 'report'}
        ]"
        />
        <q-separator dark vertical inset />
        <q-btn size="sm" flat round icon="fa fa-bell" />
        <q-btn size="sm" flat round icon="fa fa-cog" />
        <q-btn size="sm" flat round icon="fa fa-user" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer reveal elevated class="bg-grey-8 text-white">
      <q-toolbar>
        <q-toolbar-title>
          <img src="statics/exabeam-archive.svg" height="24px">
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>

  </q-layout>
</template>

<script>
export default {
  name: 'ArchiveLayout',
  data() {
    return {
      namespace: 'dashboard',
      activePage: 'search',
    };
  },
};
</script>

<style scoped>
.pad-chev {
  padding-right: 15px;
}
</style>
