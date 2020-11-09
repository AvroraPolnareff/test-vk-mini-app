import React, {useEffect, useMemo, useRef, useState} from 'react'
import {
  Radio,
  Avatar,
  Cell,
  Group,
  List,
  Panel,
  PanelHeaderBack,
  PanelHeader,
  Search,
  Spinner,
  FixedLayout,
  ModalRoot,
  ModalPage,
  ModalPageHeader,
  FormLayout,
  FormLayoutGroup,
  Input, Button,
  Div, PanelHeaderButton, platform, IOS
} from "@vkontakte/vkui";
import {getFriendsIterable} from "../api/vk";
import InfiniteScroll from "react-infinite-scroller";
import Icon24Filter from '@vkontakte/icons/dist/24/filter';
import Icon24Cancel from '@vkontakte/icons/dist/24/cancel';
import {useDispatch, useSelector} from "react-redux";
import {closeModal, Modals, showModal} from "../store/modalsSlice";
import {parseVkDate} from "../utils/helpers";
import {changeFilters, resetFilters} from "../store/friendsFiltersSlice";
import _ from 'lodash'
import Icon28ChevronBack from "@vkontakte/icons/dist/28/chevron_back";
import Icon24Back from "@vkontakte/icons/dist/24/back";

const osName = platform();

export const Friends = ({id, user, go}) => {
  const [value, setValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [closePeoples, setClosePeoples] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const dispatch = useDispatch()
  const filtersState = useSelector(state => state.friendsFilters)


  const iterableFetch = useRef(getFriendsIterable(user.id, 2000, {q: value,...filtersState}))

  const fetchMoreData = () => {
    setLoading(true)
    iterableFetch.current.next()
      .then(newFriends => {
        setLoading(false)
        setHasMore(!newFriends.done)
        if (!newFriends.done) {
          setClosePeoples(newFriends.value)
        }
      })
  }

  const debounceFetch = useRef(_.debounce(fetchMoreData, 1000))

  useEffect(() => {
    iterableFetch.current = getFriendsIterable(user.id, 2000, {q: value,...filtersState})
    debounceFetch.current()
  }, [value, user, filtersState])

  const getAge = (friend) => {
    if (!friend.bdate) return ""
    return parseVkDate(friend.bdate)
  }

  const getSex = (friend) => {
    if (friend.sex === 1) return "Женщина"
    else if (friend.sex === 2) return "Мужчина"
    else return ""
  }

  const getDescription = (friend) => {
    const age = getAge(friend)
    return `${getSex(friend)}${age ? `, ${age}` : ""}`
  }

  const displayedFriends = useMemo(() => {
    const processedFriends = closePeoples.map((friend) => ({
      id: friend.id,
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
  }, [closePeoples, value])

  const handleChange = (e) => {
    setValue(e.target.value)
  }

  const onFiltersButtonClick = () => {
    dispatch(showModal(Modals.FRIENDS_FILTERS))
  }

  return (
    <Panel id={id}>
      <PanelHeader
        left={<PanelHeaderButton onClick={go} data-to="home">
          {osName === IOS ? <Icon28ChevronBack/> : <Icon24Back/>}
        </PanelHeaderButton>}
      >Пользователи</PanelHeader>
      <FixedLayout vertical={"top"}>
        <Search
          value={value}
          onChange={handleChange}
          icon={<Icon24Filter/>}
          onIconClick={onFiltersButtonClick}
        />

      </FixedLayout>
      <Group style={{paddingTop: "60px"}}>
        <List ref={infiniteRef}>
          <InfiniteScroll
            loadMore={debounceFetch.current}
            hasMore={hasMore}
            loader={<Cell><Spinner/></Cell>}
          >
            {displayedFriends && displayedFriends.map((friend) => (
              <Cell
                key={friend.id}
                before={<Avatar src={friend.photo_100}/>}
                description={friend.description}
              >
                {`${friend.first_name} ${friend.last_name}`}
              </Cell>
            ))}
            </InfiniteScroll>
        </List>
      </Group>
    </Panel>
  )
}


export const FiltersModal = ({id}) => {
  const dispatch = useDispatch()
  const filtersState = useSelector(state => state.friendsFilters)

  const onModalClose = () => {
    dispatch(closeModal())
  }

  const onReset = () => {
    dispatch(resetFilters())
  }

  const onAgeChange = (e) => {
    dispatch(changeFilters({age: e.target.value}))
  }

  const onSexChange = (e) => {
    dispatch(changeFilters({sex: e.target.value}))
  }

  return (
    <ModalPage
      id={id}
      onClose={onModalClose}
      header={
        <ModalPageHeader
          right={<PanelHeaderButton onClick={onModalClose}><Icon24Cancel/></PanelHeaderButton>}

        >Фильтры</ModalPageHeader>
      }>
      <FormLayout>
        <FormLayoutGroup top="Пол" value={filtersState.sex} onChange={onSexChange}>
          <Radio name="sex" value={0} defaultChecked>Любой</Radio>
          <Radio name="sex" value={2}>Мужской</Radio>
          <Radio name="sex" value={1}>Женский</Radio>
        </FormLayoutGroup>
        <FormLayoutGroup top={"Возраст"}>
          <Input type={"number"} name={"age"} value={filtersState.age} onChange={onAgeChange}/>
        </FormLayoutGroup>
        <Div style={{display: 'flex'}}>
          <Button size="l" stretched mode="secondary" onClick={onReset} style={{ marginRight: 8 }}>Сбросить</Button>
          <Button size="l" stretched onClick={onModalClose}>Применить</Button>
        </Div>
      </FormLayout>
    </ModalPage>

  )
}
