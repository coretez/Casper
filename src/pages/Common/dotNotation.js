// Object to manage dot notation view of data

const convertJsonToDot = (obj, parent = [], keyValue = {}) => {
  for (var key in obj) {
    const keyPath = [...parent, key]
    if (obj[key] !== null && typeof obj[key] === 'object') {
      Object.assign(keyValue, convertJsonToDot(obj[key], keyPath, keyValue))
    } else {
      keyValue[keyPath.join('.')] = obj[key]
    }
  }
  return keyValue
}

const convertJsonToFields = (obj, parent = [], keyList = []) => {
  for (var key in obj) {
    const keyPath = [...parent, key]
    if (obj[key] !== null && typeof obj[key] === 'object') {
      Object.assign(keyList, convertJsonToFields(obj[key], keyPath, keyList))
    } else {
      keyList.push(key)
    }
  }
  return keyList
}

export {
  convertJsonToDot,
  convertJsonToFields
}
