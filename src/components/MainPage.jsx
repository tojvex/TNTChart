// MainPage.js
import React from "react";
import MainComponent from "./MainComponent";
import { Header } from "./Header";
import { TokenList } from "./TokenList";
import {WalletButton} from './WalletButton'
import Footer from "./Footer";

const MainPage = () => {
  return (
    <div>
      <WalletButton />
      <Header />
      <TokenList />
      <MainComponent />
      <Footer />
    </div>
  );
};

export default MainPage;
