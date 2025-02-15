import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './view/Home';
import {Toaster} from 'react-hot-toast';

const App: React.FC = () => {
  return (
    <div className="app">
      <Toaster position="top-right"/>
      <Home/>
    </div>
  );
};

export default App;