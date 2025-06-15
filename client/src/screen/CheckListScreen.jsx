import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import Header from '../components/Header';

const CheckListScreen = () => {
  const { id } = useParams();
  return (
    <div >
    <Header category="Page" title="CheckList" />
      <Toaster
        position="top-right"
        reverseOrder={false}
      />
    </div>
  )
}

export default CheckListScreen