import bridge from "@vkontakte/vk-bridge";


export async function fetchFriends(token, userId, fields) {
  const friends = await bridge.send('VKWebAppCallAPIMethod', {
    "method": "friends.get",
    "params": {
      "access_token": token.access_token,
      "user_id": userId,
      "v": "5.22",
      "fields": fields.toString(),
      "lang": "ru"
    }
  })
  return friends.response.items.filter((friend) => !friend.hasOwnProperty("deactivated"))
}

export function getAppId() {
  let params = new URLSearchParams(window.location.search)
  return parseInt(params.get("vk_app_id"), 10)
}
const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time))

export async function fetchClosePeoples(count, token, userId, fields) {
  let id = userId
  let i = 0
  let peoples = []
  while (peoples.length < count) {
    try {
      const friends = await fetchFriends(token, id, fields)
      peoples.push(...friends)
    } catch (e) {
      console.log(e)
    }
    await sleep(200)
    console.log(peoples, userId, i)
    id = peoples[i].id
    i++
  }
  return peoples
}

export async function fetchToken(appId, scope) {
  appId = parseInt(appId, 10)
  const sendObj = {
    "app_id": appId,
    scope: scope.toString(),
  }
  console.log(sendObj)
  const token = await bridge.send('VKWebAppGetAuthToken', sendObj);

  if (token.scope !== scope) throw new Error("Earned token scope mismatch")
  else return token
}

