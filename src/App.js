import React, {useState, useEffect} from 'react';
import bridge from '@vkontakte/vk-bridge';
import View from '@vkontakte/vkui/dist/components/View/View';
import ScreenSpinner from '@vkontakte/vkui/dist/components/ScreenSpinner/ScreenSpinner';
import '@vkontakte/vkui/dist/vkui.css';

import Home from './panels/Home';
import Persik from './panels/Persik';
import {fetchClosePeoples, fetchFriends, fetchToken, getAppId} from "./api/vk";
import {Friends} from "./panels/Friends";

const App = () => {
  const [activePanel, setActivePanel] = useState('home');
  const [fetchedUser, setUser] = useState(null);
  const [popout, setPopout] = useState(<ScreenSpinner size='large'/>);
  const [friends, setFriends] = useState(null)

  useEffect(() => {

    bridge.subscribe(({detail: {type, data}}) => {
      if (type === 'VKWebAppUpdateConfig') {
        const schemeAttribute = document.createAttribute('scheme');
        schemeAttribute.value = data.scheme ? data.scheme : 'client_light';
        document.body.attributes.setNamedItem(schemeAttribute);
      }
    });

    async function fetchData() {
      const user = await bridge.send('VKWebAppGetUserInfo');

      const token = await fetchToken(getAppId(), "friends")
      const friends = await fetchClosePeoples(
        10000,
        token,
        user.id,
        ["nickname", "photo_100", "sex", "bdate", "domain"]
      )
      setFriends(friends)
      setUser(user);
      setPopout(null);
    }

    fetchData();
  }, []);

  const go = e => {
    setActivePanel(e.currentTarget.dataset.to);
  };

  return (
    <View activePanel={activePanel} popout={popout}>
      <Home id='home' fetchedUser={fetchedUser} go={go} />
      <Persik id='persik' go={go} />
      <Friends id='friends' friends={friends}/>

    </View>
  );
}

export default App;

