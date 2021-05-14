const fs = require('fs')
const path = require('path')

export let CONFIG = {
  includeAssetsSuffix: ['.jpg', '.png'],
  // 是否包含隐藏文件
  includeHideFile: false,
  // 指定源文件后缀名
  includeFileSuffix: [
    '.js'
    // , '.jsx', '.ts', '.tsx'
  ]
}

// 项目根目录下所有文件
export let FILE_LIST_PATHS = []
// 项目根目录下指定目录的资源文件
export let ASSETS_LIST_PATHS = []
// 来自文件里引用的资源的路径
export let ASSETS_PATHS_BY_FILE = []
// 文件与资源的路径映射
export let FILE_MAP_ASSETS_PATHS = []
// 过滤剩下的结果
export let FILTER_RESULT = []

export default (assetsPath, srcPath, config = {}) => {
  if (!assetsPath || assetsPath.length === 0) return alert('Please select assetsPath directory')
  if (!srcPath) return alert('Please select srcPath directory')
  CONFIG = Object.assign(CONFIG, config)
  DiffRedundancyAssets([ScanningProjectFile(srcPath), ScanningProjectAssets(assetsPath)])
}

const ScanningProjectAssets = assetsPath => {
  return new Promise((resolve, reject) => {
    let assets_list_paths = []
    assetsPath.forEach(path => {
      let _paths = []
      ScanningDirectory(path, CONFIG.includeAssetsSuffix, _paths, paths => {
        // ASSETS_LIST_PATHS.push(...paths)
        assets_list_paths.push(...paths)
      })
    })
    resolve(assets_list_paths)
    // resolve(ASSETS_LIST_PATHS)
  })
}

const ScanningProjectFile = srcPath => {
  return new Promise((resolve, reject) => {
    let _paths = []
    ScanningDirectory(srcPath, CONFIG.includeFileSuffix, _paths, paths => {
      // FILE_LIST_PATHS.push(...paths)
      let { file_map_assets_path, assets_paths_by_file } = ScanningFile(paths)
      resolve({
        file_map_assets_path,
        assets_paths_by_file
      })
    })
    // resolve(FILE_LIST_PATHS)
  })
}

// 计算冗余的资源文件
const DiffRedundancyAssets = task => {
  Promise.all(task).then((resolve, reject) => {
    var [res1, res2] = resolve
    // res1 源代码文件内引用到的所有资源文件
    // res2 用户所有选择框内找到的图片资源
    if (res1 && res2) {
      let {
        assets_paths_by_file
        // file_map_assets_path
      } = res1
      let assets = assets_paths_by_file.map(m => m.absolutePath)
      res2.filter(r2 => {
        let res = assets.filter(f => f == r2)
        if (!res.length) FILTER_RESULT.push(r2)
        ASSETS_LIST_PATHS.push(r2)
      })
      console.log(JSON.stringify(FILTER_RESULT))
    }
  })
}

// 将文件中的相对路径合并为全路径
const PathResolve = (filePath, assetsFilePaths, assets_paths_by_file) => {
  if (!assetsFilePaths.length) return assets_paths_by_file.push(...assetsFilePaths)
  let pathParse = path.parse(filePath)
  assetsFilePaths.forEach(assetsFilePaths => {
    let absolutePath = path.resolve(pathParse.dir, assetsFilePaths)
    assets_paths_by_file.push({
      srcPath: assetsFilePaths,
      absolutePath
    })
  })
}

// 扫描文件得到资源路径
const ScanningFile = paths => {
  let file_map_assets_path = []
  let assets_paths_by_file = []
  paths.forEach(path => {
    try {
      let txt = fs.readFileSync(path, 'utf-8')
      const assetsFilePaths = ParsingContent(txt)
      file_map_assets_path.push({
        file: path,
        assets: assetsFilePaths
      })
      PathResolve(path, assetsFilePaths, assets_paths_by_file)
    } catch (error) {}
  })
  Sort(file_map_assets_path)
  return {
    file_map_assets_path,
    assets_paths_by_file
  }
}

// 排序文件下资源个数
const Sort = list => {
  list.sort(function(a, b) {
    return b.assets.length - a.assets.length
  })
}

const ParsingContent = txt => {
  let list = []
  try {
    let result = txt.match(new RegExp(/require\(.+?\)/gi))
    let reg = new RegExp(`(${CONFIG.includeAssetsSuffix.join('|')})`)
    if (result) {
      result = result.filter(f => {
        return reg.test(f)
      })
      list = result.map(item => {
        return item.replace(/require\(['|"|`](.+?)['|"|`]\)/, function(res, group1) {
          return group1
        })
      })
      return list
    }
  } catch (error) {
    return list
  }
  return list
}

// 递归扫描文件夹得到文件目录树
const ScanningDirectory = (folder, inputExt, exportArr, callback) => {
  fs.readdir(folder, (err, files) => {
    let count = 0
    let done = () => {
      ++count == files.length && callback(exportArr)
    }
    files.forEach(file => {
      let fullPath = folder + '/' + file
      fs.stat(fullPath, (err, stats) => {
        if (stats.isDirectory()) {
          return ScanningDirectory(fullPath, inputExt, exportArr, done)
        } else {
          let ext = path.parse(file).ext
          // CONFIG.includeFileSuffix.includes(ext)
          if (inputExt.includes(ext) && (file[0] != '.' || (file[0] == '.' && CONFIG.includeHideFile))) {
            exportArr.push(fullPath)
          }
          done()
        }
      })
    })
    files.length === 0 && callback(exportArr)
  })
}
