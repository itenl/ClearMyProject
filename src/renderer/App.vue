<template>
  <div id="app">
    <transition :name="transitionName">
      <navigation>
        <router-view />
      </navigation>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'clear-my-project',
  data() {
    return {
      transitionName: ''
    }
  },
  created() {
    this.$navigation.on('forward', (to, from) => {
      if (to.route.name === 'homePage' && !from.name) {
        return
      }
      this.transitionName = 'slide-left'
    })
    this.$navigation.on('back', (to, from) => {
      this.transitionName = 'slide-right'
    })
  },
  mounted() {
    window.$vue = this
    window.$route = this.$route
    window.$router = this.$router
  }
}
</script>

<style scoped>
html,
body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
* {
  user-select: none;
}
#app {
  width: 100%;
  height: 100%;
}
.slide-right-enter-active,
.slide-right-leave-active,
.slide-left-enter-active,
.slide-left-leave-active {
  will-change: transform;
  transition: all 300ms;
  position: fixed;
}
.slide-right-enter {
  transform: translate3d(-100%, 0, 0);
}
.slide-right-leave-active {
  transform: translate3d(100%, 0, 0);
}
.slide-left-enter {
  transform: translate3d(100%, 0, 0);
}
.slide-left-leave-active {
  transform: translate3d(-100%, 0, 0);
}
</style>
