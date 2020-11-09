import bridge from "@vkontakte/vk-bridge";
import _ from "lodash";
import {parseVkDate, sleep} from "../utils/helpers";

const VERSION = "5.124"

export async function searchFriends(token, userId, fields, q) {
  const friends = await bridge.send('VKWebAppCallAPIMethod', {
    "method": "friends.search",
    "params": {
      "access_token": token.access_token,
      "user_id": userId,
      "q": q,
      "count": 1000,
      "v": VERSION,
      "fields": fields.toString(),
      "lang": "ru"
    }
  })
  return friends.response.items.filter((friend) => !friend.hasOwnProperty("deactivated"))
}

export async function fetchFriends(token, userId, fields) {
  const friends = await bridge.send('VKWebAppCallAPIMethod', {
    "method": "friends.get",
    "params": {
      "access_token": token.access_token,
      "user_id": userId,
      "v": VERSION,
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

export async function fetchToken(appId, scope) {
  appId = parseInt(appId, 10)
  const sendObj = {
    "app_id": appId,
    scope: scope.toString(),
  }
  const token = await bridge.send('VKWebAppGetAuthToken', sendObj);

  if (token.scope !== scope) throw new Error("Earned token scope mismatch")
  else return token
}


/**
 * Generator that fetches and searches friends and friends of friends from vk api
 * @param {number} userId - app user
 * @param {number} totalCount - total amount of friends
 * @param {Object.<{q: string, sex: number, age: number}>} searchOptions
 */
export async function* getFriendsIterable(userId, totalCount, searchOptions) {
  const token = await fetchToken(getAppId(), "friends")
  const fields = ["nickname", "photo_100", "sex", "bdate", "domain"]
  let ids = [userId]
  let offset = 0
  let users = []
  let searchResults = []
  let searchMode = false

  while (users.length < totalCount || offset >= users.length) {
    const foundFriends = await getFriendsForUsers(ids, fields, token)
    if (foundFriends.response.length) {
      let filtered = filterNotActiveUsers(foundFriends.response)
      users = _.unionBy(users, filtered, 'id')

      if (searchOptions && isOptionsSetted(searchOptions)) {
        searchMode = true
        searchResults = filterUsers(users, searchOptions)
        yield searchResults
      }

      if (!searchMode) {
        yield users
      }
    }
    await sleep(300)
    offset += ids.length
    ids = users.slice(offset, offset + 10).map(user => user.id)
  }
  if (searchMode) {
    return searchResults
  } else {
    return users
  }
}

function isOptionsSetted (searchOptions) {
  return Object.values(searchOptions).some(value => value)
}

function filterUsers(users, searchOptions) {
  let filtered = users
  if (searchOptions) {
    if (searchOptions.q) {
      filtered = filtered.filter(({first_name, last_name}) => (
        (first_name + " " + last_name).toLowerCase().indexOf(searchOptions.q.toLowerCase()) !== -1
      ))
    }
    if (searchOptions.age) {
      filtered = filtered.filter((({bdate}) =>
          bdate && parseInt(parseVkDate(bdate), 10) === searchOptions.age
      ))
    }
    if (searchOptions.sex) {
      filtered = filtered.filter((({sex}) =>
          sex === parseInt(searchOptions.sex, 10)
      ))
    }
  }
  return filtered
}

function filterNotActiveUsers(users) {
  return  users.filter((user) => (
    !user.hasOwnProperty("deactivated") && user.can_access_closed === true
  ))
}

async function getFriendsForUsers(userIds, fields, token) {
  const code = `
    var users = [${userIds.toString()}];
    var allFoundUsers = [];
    var i = 0;
    while (i < users.length) {
      var foundUsers = API.friends.search({
        "fields": "${fields.toString()}",
        "user_id": users[i]
      });
      
      if (foundUsers.items.length) {
        var j = 0;
        while (j < foundUsers.items.length) {
          allFoundUsers.push(foundUsers.items[j]);
          j = j + 1;
        }
      }
      i = i + 1;
    }
    
    return allFoundUsers;
  `
  return await bridge.send('VKWebAppCallAPIMethod', {
    "method": "execute",
    "params": {
      "access_token": token.access_token,
      "v": VERSION,
      "code": code
    }
  })
}
