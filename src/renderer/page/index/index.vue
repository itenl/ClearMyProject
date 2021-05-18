<template>
  <div id="wrapper">
    <h2>项目冗余资源清理</h2>
    <h5>检索是利用正则扫描项目文件是否存在 require</h5>
    <!-- <span> index page {{ this.$route.query.from }} </span> -->
    <!-- <router-link :to="{ path: '/landing', query: { from: 'from-home' } }">to landing</router-link> -->
    <template v-for="(item, idx) in assetsPath">
      <div :key="idx">
        <input @click="openDialog('assets', idx)" type="text" :value="item" placeholder="单击选择资源目录" />
        <input v-if="idx != 0" @click="removeAssetsElement(idx)" type="button" value="删除" />
      </div>
    </template>
    <label for="cbxjpg"> <input id="cbxjpg" v-model="assetsCheckbox" type="checkbox" value=".jpg" />.jpg </label>
    <label for="cbxjpeg"> <input id="cbxjpeg" v-model="assetsCheckbox" type="checkbox" value=".jpeg" />.jpeg </label>
    <label for="cbxpng"> <input id="cbxpng" v-model="assetsCheckbox" type="checkbox" value=".png" />.png </label>
    <label for="cbxjson"> <input id="cbxjson" v-model="assetsCheckbox" type="checkbox" value=".json" />.json </label>
    <br />
    <input @click="addAssetsElement" type="button" value="添加资源目录" />
    <br />
    <br />
    <input type="text" @click="openDialog('src')" placeholder="单击选择源码目录" :value="srcPath" />
    <br />
    <label for="cbxjs"> <input id="cbxjs" v-model="fileCheckbox" type="checkbox" value=".js" />.js </label>
    <label for="cbxjsx"> <input id="cbxjsx" v-model="fileCheckbox" type="checkbox" value=".jsx" />.jsx </label>
    <label for="cbxts"> <input id="cbxts" v-model="fileCheckbox" type="checkbox" value=".ts" />.ts </label>
    <label for="cbxtsx"> <input id="cbxtsx" v-model="fileCheckbox" type="checkbox" value=".tsx" />.tsx </label>
    <br />
    <input @click="onSubmit" type="button" value="开始扫描" />
    <input
      @click="onClear"
      :style="filter_result.length == 0 && 'color:#ababab'"
      :disabled="filter_result.length == 0"
      type="button"
      value="一键删除"
    />
    <div>总资源个数 {{ assets_list_paths.length }}</div>
    <div>冗余文件个数 {{ filter_result.length }}</div>
    <div class="list">
      <!-- {{ file_list_paths }} -->
      <!-- {{ assets_list_paths }} -->
      <!-- {{ assets_paths_by_file }} -->
      <!-- {{ file_map_assets_paths }} -->
      <template v-for="(item, idx) in filter_result">
        <div :key="idx" class="item" style="width:300px;white-space: nowrap;">
          {{ idx + 1 }}
          <a href="javascript:void(0);">{{ item }}</a>
          <a class="rtl" href="javascript:void(0);">{{ item }}</a>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import ToSearch, {
  FILE_LIST_PATHS,
  ASSETS_LIST_PATHS,
  ASSETS_PATHS_BY_FILE,
  FILE_MAP_ASSETS_PATHS,
  FILTER_RESULT,
  ToClear
} from '../../../lib/clear'

export default {
  name: 'index-page',
  data() {
    return {
      assetsCheckbox: ['.jpg', '.png'],
      fileCheckbox: ['.js'],
      assetsPath: [''],
      srcPath: '',
      file_list_paths: FILE_LIST_PATHS,
      assets_list_paths: ASSETS_LIST_PATHS,
      assets_paths_by_file: ASSETS_PATHS_BY_FILE,
      file_map_assets_paths: FILE_MAP_ASSETS_PATHS,
      filter_result: FILTER_RESULT
    }
  },
  methods: {
    onClear() {
      confirm('确认一键删除吗(该操作不可逆)') && ToClear(this.filter_result, this.onSubmit)
    },
    onSubmit() {
      ToSearch(this.assetsPath, this.srcPath, {
        includeAssetsSuffix: this.assetsCheckbox,
        includeFileSuffix: this.fileCheckbox
      })
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

<style scoped lang="less">
@import './css/index.less';
</style>
