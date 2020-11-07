import React, { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import View from '@vkontakte/vkui/dist/components/View/View';
import ScreenSpinner from '@vkontakte/vkui/dist/components/ScreenSpinner/ScreenSpinner';
import '@vkontakte/vkui/dist/vkui.css';

import Home from './panels/Home';
import Persik from './panels/Persik';

const App = () => {
	const [activePanel, setActivePanel] = useState('home');
	const [fetchedUser, setUser] = useState(null);
	const [popout, setPopout] = useState(<ScreenSpinner size='large' />);
	const [friends, setFriends] = useState(null)

	useEffect(() => {

		bridge.subscribe(({ detail: { type, data }}) => {
			if (type === 'VKWebAppUpdateConfig') {
				const schemeAttribute = document.createAttribute('scheme');
				schemeAttribute.value = data.scheme ? data.scheme : 'client_light';
				document.body.attributes.setNamedItem(schemeAttribute);
			}
		});
		async function fetchData() {
			const user = await bridge.send('VKWebAppGetUserInfo');

			let params = new URLSearchParams(window.location.search)
			console.log(window.location.search)
			const token = await bridge.send('VKWebAppGetAuthToken', {
				app_id: parseInt(params.get("vk_app_id"), 10),
				scope: "friends,status"
			});

			const friends = await bridge.send('VKWebAppCallAPIMethod', {
				"method": "friends.get",
				"params": {
					"access_token": token.access_token,
					"v": "5.22",
					"fields": "nickname,photo_100,sex,bdate,domain",
					"lang": "ru"
				}
			})
			setFriends(friends.items)
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
		</View>
	);
}

export default App;

