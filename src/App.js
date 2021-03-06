import React, {Component} from 'react';
import './App.css';
import MapContainer from './containers/MapContainer';
import GoogleMapReact from 'google-map-react';
import 'antd/dist/antd.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import Icon from '@ant-design/icons';
// import 'bootstrap/dist/css/bootstrap.css';


class App extends Component {

  render(){
    return(
      <div className="App">
      <header className="App-header">
    {/* <img src={logo} className="App-logo" alt="logo" /> */}
    </header>
    <div className="container h-100">
    <MapContainer />
    </div>
    </div>
  );
  }
}

export default App;
