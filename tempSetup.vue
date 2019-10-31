<template>
  <div class="b-content -align_centerCenter">
    <div class="b-content__inner">
      <div class="b-form">

        <q-toolbar color="primary">
          <q-toolbar-title>
            Edit device {{device.name}}
          </q-toolbar-title>
        </q-toolbar>
        <div class="q-pa-md">
          <div class="b-form__row">
            <div class="b-form__item">
              <q-input v-model.trim="device.name" required stack-label label="Name" @blur="$v.device.name.$touch()" :error="$v.device.name.$error" />
            </div>
          </div>

          <div class="b-form__row">
            <div class="b-form__item">
              <q-input type="textarea" v-model.trim="device.description" stack-label label="Description"/>
            </div>
          </div>

          <div class="b-form__row -alignVertical__center">
            <div class="b-form__item -width_90">
              <q-input v-model.trim="device.ip" stack-label label="IP" @input="checkIpOnInput()"/>
              <div class="b-message -type_error" v-if="!isValidIP">Invalid IP format</div>
            </div>
            <div class="b-form__item -width_10">
              <q-btn class="b-button" @click="resolveIp(device.ip)">
                <q-icon name="search" />
                <q-tooltip>Lookup Hostname</q-tooltip>
              </q-btn>
            </div>
          </div>

          <div class="b-form__row">
            <div class="b-form__item">
              <q-input v-model.trim="device.hostname" stack-label label="Hostname" />
            </div>
          </div>

          <div class="b-form__row">
            <div class="b-form__item">
              <q-select v-model="device.device" :options="deviceTypesOptions" stack-label label="Device type" />
            </div>
          </div>
        </div>
        <div class="align-right q-pa-md">
          <q-btn class="b-button__accent" icon="save" label="save" @click="updateDevice($v)" />
          <q-btn class="b-button q-ml-md" icon="cancel" label="cancel" color="dark" @click="createCancelDialog()" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { deviceTypesOptions } from 'src/constant/options'
import { required } from 'vuelidate/lib/validators'
import axios from 'axios'
import confirmDialog from 'src/services/confirmDialog'

export default {
  data () {
    return {
      restError: {},
      device: {
        name: '',
        description: '',
        ip: '',
        hostname: '',
        device: {
          name: '',
          category: ''
        }
      },
      isValidIP: true,
      deviceTypesOptions: deviceTypesOptions
    }
  },

  validations: {

    device: {
      name: {
        required
      },
      description: {},
      ip: {},
      hostname: {},
      category: {},
      device: {
        name: {},
        category: {}
      }
    }

  },

  methods: {

    resolveIp (ip) {
      if (ip !== '') {
        const options = {
          kargs: {
            deviceIp: ip
          }
        }

        let url = '/api/ds/resolve_device_ip'
        axios.defaults.headers.common['FluencyToken'] = this.$store.state.session.token

        axios.post(url, options)
          .then(resultResponse => {
            this.device.hostname = resultResponse.response.hosts[0]
          })
          .catch(e => {
            this.restError = e
            this.$q.notify({ type: 'negative', message: 'No such host' })
            this.device.hostname = 'n/a'
          })
      }
    },

    checkIp (ip) {
      let flag = true
      let ipReg = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
      if (ip !== '') {
        flag = ipReg.test(ip)
      }
      return flag
    },

    checkIpOnInput () {
      this.isValidIP = this.checkIp(this.device.ip)
    },
    updateDevice () {
      const options = {
        kargs: {
          entry: this.device
        }
      }
      let url = '/api/ds/update_device'
      axios.defaults.headers.common['FluencyToken'] = this.$store.state.session.token
      axios.post(url, options)
        .then(response => {
          if (response.data.verdict !== 'OK') {
            this.$q.notify({ type: 'negative', message: 'Device update error' })
          } else {
            this.$q.notify({ type: 'positive', message: `Device "${this.device.name}" added` })
          }
          this.$router.go(-1)
        })
        .catch(e => {
          this.$q.notify({ type: 'negative', message: 'Device update error' })
        })
    },

    createCancelDialog () {
      let message = 'Are you sure you want to leave the page?'
      let action = this.cancelUpdate.bind(undefined)
      confirmDialog.createDialog('Confirm', message, action)
    },

    getData () {
      this.device = this.$route.params.device
    },

    cancelUpdate () {
      this.$router.go(-1)
    },

    setup () {
      this.getData()
    }

  },

  beforeMount () {
    this.setup()
  },

  mounted () {}

}
</script>
