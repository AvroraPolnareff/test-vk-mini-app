import React, {useMemo, useState} from 'react'
import {Avatar, Cell, Group, List, Panel, Search} from "@vkontakte/vkui";

export const Friends = ({id, friends}) => {
  const [value, setValue] = useState("")

  const getAge = (friend) => {
    if (!friend.bdate) return ""

    const dateArray = friend.bdate.split(".");
    if (dateArray.length === 3) {
      const date = new Date()
      date.setFullYear(dateArray[2], dateArray[1], dateArray[0])
      const now = new Date(Date.now())
      return `${now.getFullYear() - date.getFullYear()}`
    } else {
      return ""
    }
  }

  const getSex = (friend) => {
    if (friend.sex === 1) return  "Женщина"
    else if (friend.sex === 2) return "Мужчина"
    else return ""
  }

  const getDescription = (friend) => {
    const age = getAge(friend)
    return `${getSex(friend)}${age ? `, ${age}` : ""}`
  }

  const displayedFriends = useMemo(() => {
    const processedFriends = friends.map((friend) => ({
      first_name: friend.first_name,
      last_name: friend.last_name,
      age: getAge(friend),
      sex: getSex(friend),
      photo_100: friend.photo_100,
      description: getDescription(friend)
    }))
    if (!value) return processedFriends
    else {
      return processedFriends
    }
  })



  const handleChange = (e) => {
    setValue(value)
  }

  return (
    <Panel id={id}>
      <Search value={value} onChange={handleChange}/>
      <Group>
        <List>
          {displayedFriends && displayedFriends.map((friend) => (
            <Cell
              before={<Avatar src={friend.photo_100}/>}
              description={friend.description}
            >
              {`${friend.first_name} ${friend.last_name}`}
            </Cell>
          ))}
        </List>
      </Group>
    </Panel>
  )
}
