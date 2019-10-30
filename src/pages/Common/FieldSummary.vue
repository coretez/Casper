<template>
  <div class="fieldGutter">
    <div class="group" v-for="section in groups" :key="section.title">
      <title-row :icon=section.icon :title=section.title />
      <div v-for="child in section.members" :key="child.key">
        <item-row :k=child.key :value=child.value />
      </div>
    </div>
  </div>
</template>

<script>
import TitleRow from './FieldSummary/titleRow';
import ItemRow from './FieldSummary/itemRow';

export default {
  name: 'ComponentFieldSummary',
  components: {
    TitleRow,
    ItemRow,
  },
  data() {
    return {
      groups: [{
        title: 'Account Manager',
        icon: 'fa fa-user',
        members: [
          { key: 'account_name', value: 20 },
          { key: 'dest_host', value: 16 },
          { key: 'domain', value: 6 },
          { key: 'event_code', value: 7 },
          { key: 'target_user', value: 60 },
          { key: 'very long field name', value: 5 },
        ],
      }, {
        title: 'Account Switch',
        icon: 'fa fa-user',
        members: [
          { key: 'account', value: 5 },
          { key: 'dest_host', value: 4 },
          { key: 'event_code', value: 1 },
          { key: 'host', value: 5 },
          { key: 'user', value: 5 },
        ],
      }, {
        title: 'Application',
        icon: 'fa fa-user',
        members: [
          { key: 'activity', value: 3 },
          { key: 'app', value: 17 },
          { key: 'host', value: 18 },
          { key: 'src_ip', value: 19 },
          { key: 'user', value: 5 },
        ],
      },
      ],
    };
  },
};
</script>

<style scoped>
.fieldGutter {
  min-width: 120px;
  width: 20%;
  margin: 10px;
  padding: 10px;
  background-color: #f5f6f8;
}

.group {
  padding-bottom: 20px;
}
</style>
