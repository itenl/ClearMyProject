<template>
  <div id="wrapper">
    <span> index page {{ this.$route.query.from }} </span>
    <router-link :to="{ path: '/landing', query: { from: 'from-home' } }">to landing</router-link>
  </div>
</template>

<script>
export default {
  name: 'index-page',
  methods: {}
}
</script>

<style scoped>
#wrapper {
  /* background-color: red; */
}
</style>
