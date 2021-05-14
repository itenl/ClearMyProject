import Vue from 'vue'
import Vuex from 'vuex'

import {
  createPersistedState
  // createSharedMutations
} from 'vuex-electron'

import modules from './modules'

Vue.use(Vuex)

export default new Vuex.Store({
  modules,
  plugins: [
    createPersistedState()
    // ERROR: Please, don't use direct commit's, use dispatch instead of this. at Store.store.commit
    // createSharedMutations()
  ],
  strict: process.env.NODE_ENV !== 'production'
})
