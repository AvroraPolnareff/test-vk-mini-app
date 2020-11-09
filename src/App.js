import React, {useState, useEffect} from 'react';
import bridge from '@vkontakte/vk-bridge';
import View from '@vkontakte/vkui/dist/components/View/View';
import ScreenSpinner from '@vkontakte/vkui/dist/components/ScreenSpinner/ScreenSpinner';
import '@vkontakte/vkui/dist/vkui.css';
import Home from './panels/Home';
import Persik from './panels/Persik';
import {FiltersModal, Friends} from "./panels/Friends";
import {ModalRoot} from "@vkontakte/vkui";
import {useSelector} from "react-redux";
import {Modals} from "./store/modalsSlice";

const App = () => {
  const [activePanel, setActivePanel] = useState('home');
  const [user, setUser] = useState(null);
  const [popout, setPopout] = useState(<ScreenSpinner size='large'/>);
  const activeModal = useSelector(state => state.modals)

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
      setUser(user);
      setPopout(null);
    }
    fetchData();
  }, []);

  const go = e => {
    setActivePanel(e.currentTarget.dataset.to);
  };

  const modal = (
    <ModalRoot activeModal={activeModal}>
      <FiltersModal id={Modals.FRIENDS_FILTERS}/>
    </ModalRoot>
  )

  return (
    <View activePanel={activePanel} popout={popout} modal={modal}>
      <Home id='home' fetchedUser={user} go={go} />
      <Persik id='persik' go={go} />
      <Friends id='friends' user={user} go={go}/>
    </View>
  );
}

export default App;

