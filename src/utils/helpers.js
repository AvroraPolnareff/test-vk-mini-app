export const parseVkDate = (date) => {
  const dateArray = date.split(".");
  if (dateArray.length === 3) {
    const date = new Date()
    date.setFullYear(dateArray[2], dateArray[1], dateArray[0])
    const now = new Date(Date.now())
    return `${now.getFullYear() - date.getFullYear()}`
  } else {
    return ""
  }
}

export const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time))
