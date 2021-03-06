import React, { useEffect, useState } from "react";
import { saveToLocalStorage } from "./helpers/localStorage";
import { formatAddress } from "./utils/formatting";
import styles from "./styles/App.module.css"
import Layout from "./components/Layout";
import darkmode from "./assets/dark-mode.png";


const App = () => {
	const [theme, setTheme] = useState("light");
	const [account, setAccount] = useState(null);

	const connectWallet = async () => {
		await window.ethereum.request({ method: 'eth_requestAccounts' });
		const addr = window.ethereum.selectedAddress
		setAccount(addr)
		saveToLocalStorage("wallet", addr)
	}

	useEffect(() => {
		async function fetchData() {
			if (window.ethereum === undefined) {
				console.log("no wallet detected")
			}
			window.ethereum.on("accountsChanged", function account() {
                setAccount(window.ethereum.selectedAddress)
            })
		}
		fetchData();
	}, [])

	const switchTheme = () => {
		if (theme === "light") {
			setTheme("dark")
		} else {
			setTheme("light")
		}

	}

	return (
		<div className={styles[`${theme}`]} >
			<span>
				<img alt="dark mode toggle" onClick={switchTheme} src={darkmode} className={styles.ekdamaiSano} />
			</span>
			{account ? <span className={styles.rightBorder}>{formatAddress(account)} </span> :
				<span onClick={connectWallet} className={styles.rightBorder}>
					Connect Wallet
				</span>}
			<Layout addr={account} />
		</div>)
}

export default App;