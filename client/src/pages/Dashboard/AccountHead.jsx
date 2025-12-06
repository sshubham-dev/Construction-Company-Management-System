import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Layout from "./Layout";

axios.defaults.withCredentials = true;

const Account_Head = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <Layout>

    </Layout>
  );
};

export default Account_Head;
