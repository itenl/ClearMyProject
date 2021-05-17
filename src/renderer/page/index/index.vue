<template>
  <div id="wrapper">
    <h2>项目冗余资源清理</h2>
    <!-- <span> index page {{ this.$route.query.from }} </span> -->
    <!-- <router-link :to="{ path: '/landing', query: { from: 'from-home' } }">to landing</router-link> -->
    <template v-for="(item, idx) in assetsPath">
      <div :key="idx">
        <input @click="openDialog('assets', idx)" type="text" :value="item" placeholder="单击选择资源目录" />
        <input v-if="idx != 0" @click="removeAssetsElement(idx)" type="button" value="删除" />
      </div>
    </template>
    <input @click="addAssetsElement" type="button" value="添加资源目录" />
    <br />
    <input type="text" @click="openDialog('src')" placeholder="单击选择源码目录" :value="srcPath" />
    <br />
    <input @click="tosubmit" type="button" value="开始扫描" />
    <input
      @click="toclear"
      :style="filter_result.length == 0 && 'color:#ababab'"
      :disabled="filter_result.length == 0"
      type="button"
      value="一键删除"
    />
    <div>总资源个数 {{ assets_list_paths.length }}</div>
    <div>冗余文件个数 {{ filter_result.length }}</div>
    <div>
      <!-- {{ file_list_paths }} -->
      <!-- {{ assets_list_paths }} -->
      <!-- {{ assets_paths_by_file }} -->
      <!-- {{ file_map_assets_paths }} -->
      <template v-for="(item, idx) in filter_result">
        <div :key="idx" class="" style="width:300px;white-space: nowrap;">
          {{ idx + 1 }}
          <a
            style="width: 50%;
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;"
            href="javascript:void(0);"
            >{{ item }}</a
          >
          <a
            style="width: 50%;
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    direction: rtl;"
            href="javascript:void(0);"
            >{{ item }}</a
          >
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import Clear, {
  FILE_LIST_PATHS,
  ASSETS_LIST_PATHS,
  ASSETS_PATHS_BY_FILE,
  FILE_MAP_ASSETS_PATHS,
  FILTER_RESULT
} from '../../../lib/clear'

export default {
  name: 'index-page',
  data() {
    return {
      assetsPath: [],
      srcPath: '',
      file_list_paths: FILE_LIST_PATHS,
      assets_list_paths: ASSETS_LIST_PATHS,
      assets_paths_by_file: ASSETS_PATHS_BY_FILE,
      file_map_assets_paths: FILE_MAP_ASSETS_PATHS,
      filter_result: FILTER_RESULT
    }
  },
  methods: {
    toclear() {
      confirm('确认一键删除吗(该操作不可逆)') && alert(123)
    },
    tosubmit() {
      Clear(this.assetsPath, this.srcPath)
    },
    getUserSelectPath() {
      const res = this.$electron.remote.dialog.showOpenDialog({
        properties: ['openDirectory', 'multiSelections']
      })
      return res && res[0]
    },
    removeAssetsElement(index) {
      this.assetsPath.splice(index, 1)
    },
    addAssetsElement() {
      const userSelectedPath = this.getUserSelectPath()
      if (userSelectedPath) {
        this.assetsPath.push(userSelectedPath)
      }
    },
    openDialog(target, index) {
      const userSelectedPath = this.getUserSelectPath()
      if (userSelectedPath) {
        switch (target) {
          case 'assets':
            this.$set(this.assetsPath, index, userSelectedPath)
            break
          case 'src':
            this.srcPath = userSelectedPath
            break
        }
      }
    }
  }
}
</script>

<style scoped>
html,
body {
  margin: 0;
  padding: 0;
}
#wrapper {
  /* background-color: red; */
}
</style>
