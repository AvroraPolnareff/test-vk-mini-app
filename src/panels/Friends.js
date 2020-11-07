import React, {useState} from 'react'
import {Avatar, Cell, Group, List, Panel} from "@vkontakte/vkui";
import Search from "@vkontakte/vkui/src/components/Search/Search";

export const Friends = ({id, friends}) => {
  const [value, setValue] = useState("")

  const displayedFriends = useMemo(() => {
    const processedFriends = friends.map(({first_name, last_name, bdate, sex}) => ({

    }))
  })

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

  const getDescription = (friend) => {
    let sex
    if (friend.sex === 1) sex = "Женщина"
    else if (friend.sex === 2) sex = "Мужчина"
    else sex = ""

    const age = getAge(friend)
    return `${sex} ${age ? `, ${age}` : ""}`
  }

  const handleChange = (e) => {
    setValue(value)
  }

  return (
    <Panel id={id}>
      <Search value={value} onChange={handleChange}/>
      <Group>
        <List>
          {friends && friends.map((friend) => (
            <Cell
              before={<Avatar src={friend.photo_100}/>}
              description={getDescription(friend)}
            >
              {`${friend.first_name} ${friend.last_name}`}
            </Cell>
          ))}
        </List>
      </Group>
    </Panel>
  )
}
