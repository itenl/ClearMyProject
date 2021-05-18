const fs = require('fs')
const path = require('path')

export let CONFIG = {
  // 指定资源文件类型 ['.jpg', '.jpeg', '.png', '.json']
  includeAssetsSuffix: [],
  // 是否包含隐藏文件
  includeHideFile: false,
  // 指定源文件后缀名 ['.js', '.jsx', '.ts', '.tsx']
  includeFileSuffix: []
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
  Reset()
  CONFIG = Object.assign(CONFIG, config)
  DiffRedundancyAssets([ScanningProjectFile(srcPath), ScanningProjectAssets(assetsPath)])
}

const Reset = () => {
  FILE_LIST_PATHS.length = 0
  ASSETS_LIST_PATHS.length = 0
  ASSETS_PATHS_BY_FILE.length = 0
  FILE_MAP_ASSETS_PATHS.length = 0
  FILTER_RESULT.length = 0
}

const ScanningProjectAssets = assetsPath => {
  return new Promise((resolve, reject) => {
    let assets_list_paths = []
    assetsPath.forEach(path => {
      let _paths = []
      ScanningDirectory(path, CONFIG.includeAssetsSuffix, _paths, paths => {
        assets_list_paths.push(...paths)
      })
    })
    resolve(assets_list_paths)
  })
}

const ScanningProjectFile = srcPath => {
  return new Promise((resolve, reject) => {
    let _paths = []
    ScanningDirectory(srcPath, CONFIG.includeFileSuffix, _paths, file_list_paths => {
      let { file_map_assets_paths, assets_paths_by_file } = ScanningFile(file_list_paths)
      resolve({
        file_map_assets_paths,
        assets_paths_by_file,
        file_list_paths
      })
    })
  })
}

// 计算冗余的资源文件
const DiffRedundancyAssets = task => {
  Promise.all(task).then((resolve, reject) => {
    var [res1, res2] = resolve
    // res1 源代码文件内引用到的所有资源文件
    // res2 用户所有选择框内找到的图片资源
    if (res1 && res2) {
      let { file_list_paths, assets_paths_by_file, file_map_assets_paths } = res1
      let assets = assets_paths_by_file.map(m => m.absolutePath)
      res2.filter(r2 => {
        let res = assets.filter(f => f == r2)
        if (!res.length) FILTER_RESULT.push(r2)
      })
      FILE_LIST_PATHS.push(...file_list_paths)
      FILE_MAP_ASSETS_PATHS.push(...file_map_assets_paths)
      ASSETS_PATHS_BY_FILE.push(...assets_paths_by_file)
      ASSETS_LIST_PATHS.push(...res2)
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
  let file_map_assets_paths = []
  let assets_paths_by_file = []
  paths.forEach(path => {
    try {
      let txt = fs.readFileSync(path, 'utf-8')
      const assetsFilePaths = ParsingContent(txt)
      file_map_assets_paths.push({
        file: path,
        assets: assetsFilePaths
      })
      PathResolve(path, assetsFilePaths, assets_paths_by_file)
    } catch (error) {}
  })
  Sort(file_map_assets_paths)
  return {
    file_map_assets_paths,
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

export const ToClear = (files, callback) => {
  if (files && files.length) {
    files.forEach(path => {
      try {
        fs.unlinkSync(path)
      } catch (error) {}
    })
    alert('一键删除完成')
    const timer = setTimeout(() => {
      callback && callback()
      clearTimeout(timer)
    }, 500)
  }
}
