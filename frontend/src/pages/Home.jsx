import React from 'react';
import styles from "../styles/App.module.css"
import { Tabs, Tab, Row, Col } from 'react-bootstrap'
import Overview from '../components/Overview';
import UserOverview from '../components/UserOverview';
import Market from '../components/Market';
import UserMarket from '../components/UserMarket';
import { ReserveJson } from '../consts/Reservelist';
import { useState } from 'react';
import { loadFromLocalStorage } from '../helpers/localStorage';
import { useEffect } from 'react';

const Home = () => {
  const [reserves] = useState(ReserveJson);
  const [walletAddr, setWalletAddr] = useState(null);

  useEffect(() => {
    const address = loadFromLocalStorage("wallet");
    setWalletAddr(address)
  }, [])

  return (
    <>
      <p className={styles.title}> HomePage</p>

      <p className={styles.h1}> Overview </p>
      <Tabs>
        <Tab eventKey="home" title="Market">
          <Overview keyx={"Total"} supply={1000} supplyRate={10} borrow={500} borrowRate={20} />
        </Tab>
          <Tab eventKey="profile" title="User">
            <UserOverview keyx={"User"} user={walletAddr} supply={1000} supplyRate={10} borrow={500} borrowRate={20} />
          </Tab> 
      </Tabs>
      <br /><br />
      <p className={styles.h1}> Markets </p>

      <Tabs className="mb-3">
        <Tab eventKey="" title="All Markets">
          <Row>
            <Col sm={4}>Asset</Col>
            <Col sm={2}>Total Supplied</Col>
            <Col sm={2}>Supply APY</Col>
            <Col sm={2}>Total Borrows</Col>
            <Col sm={2}>Borrow APY</Col>
          </Row>
          <hr />
          {
            reserves.map(i => <Market key={i.address} symbol={i.symbol} reserve={i.address} />)
          }
        </Tab>
          <Tab eventKey="profile" title="Your Markets">
            <Row>
              <Col sm={4}>Asset</Col>
              <Col sm={2}>You Supplied</Col>
              <Col sm={2}>Supply APY</Col>
              <Col sm={2}>You Borrowed</Col>
              <Col sm={2}>Borrow APY</Col>
            </Row>
            <hr />

            {
              reserves.map(i => <UserMarket key={i.address} user={walletAddr} symbol={i.symbol} reserve={i.address} />)
            }
          </Tab>
      </Tabs>
    </>
  )
}

export default Home;