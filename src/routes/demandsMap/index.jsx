import React from "react";
import { connect } from "react-redux";
import {
  Toast
} from "antd-mobile";
import {
  Map,
  Base,
  Marker
} from 'rc-bmap';
import "./style.css";
import { demandsMapActions } from "../../redux/demandsMap";
import { bindActionCreators } from "redux";
import sound_img from "../../assets/sound.png";
import link_img from "../../assets/link.png";
import arrow_right_white from "../../assets/arrow_right_white.png";
import { withRouter } from "react-router-dom";
import copy from "copy-to-clipboard";

@withRouter
//该装饰器会自动将state和dispatch分别传入mapStateToProps和mapDispatchToProps
@connect(mapStateToProps, mapDispatchToProps)
class DemandsMap extends React.Component {
  componentDidMount() {
    this.props.getTotalDemands();
    this.props.getNearbyHospitals();
    this.props.getInitialLocation();    
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (location)=>{
          this.props.getInitialLocation(location.coords);
          this.props.getNearbyHospitals(location.coords);
        },
        (err)=>{
          console.log(err);
        }
      );
    } else {
      console.log('你的浏览器不支持地理位置');
    }
  }
  rebaseSupplies = (supplies = [])=> {
    let demands = '';
    if(!supplies.length) 
      return '暂不详';
    supplies.map((item, index) => 
      demands += `${item.name}${item.amount}件、 `
    )
    return demands;
  }

  enterCurrentHospital = (id) => {
    this.props.history.push("/hospitals/" + id);
  }

  copyToClickBoard = (currentHospital) => {
    let content = `联系人:${currentHospital.contacts}, 电话:${currentHospital.mobile}`
    if(copy(content)) {
      Toast.success('复制成功');
    } else {
      Toast.fail('复制失败');
    }
  }

  updateCurrentLocation = () => {
    let location = {
      longitude: window.demandsMap.getCenter().lng,
      latitude: window.demandsMap.getCenter().lat
    }
    this.props.getNearbyHospitals(location);
  }

  render() {
    const { Point, Events } = Base;
    const { totalDemands, hospitals, initialLocation, currentHospital={} } = this.props;
    return (
      <div className="demandsMap">
        <div className="map">
          <Map
            ak="WAeVpuoSBH4NswS30GNbCRrlsmdGB5Gv"
            name="demandsMap"
            zoom={13}
            doubleClickZoom
            scrollWheelZoom
          >
          <Point name="center" lng={ initialLocation.longitude } lat={ initialLocation.latitude } />
          <Events
            dragend={() => this.updateCurrentLocation()} 
            zoomend = {() => this.updateCurrentLocation()}
          />
          
          {hospitals && hospitals.map((item) => (
            <Marker title={item.hospital} key={item.id}>
              <Point lng={item.location.lon} lat={item.location.lat} />
              <Events click={() => this.props.updateCurrentHospital(item.id)} />
            </Marker>
          ))} 
          </Map>
        </div>
        <div className="infoLayer_1">
          <div className="totalDemands">
            <div className="title">全国医疗物资需求</div>
            <div className="items">
              {totalDemands && 
                (Object.entries(totalDemands).map(item => (
                  <div className="item" key={item[0]}>
                    <div className="count"> {item[1]} </div>
                    <div className="name">{item[0]}</div>
                  </div>                  
                )))}                
            </div> 
          </div>
        </div>
        <div className="infoLayer_2">
          <div className="notices">
            <div className="icon"><img src={sound_img} alt="广播图标"></img></div>
            <div className="content">武汉协和医院物资全部用尽（30分钟前）</div>
            <div className="link"><img src={arrow_right_white} alt="链接图标"></img></div>
          </div>
          <div className="hospitalInfo">
            <div className="title">
              <div className="name">{ currentHospital.hospital }</div>
              <img src={link_img} alt="链接图标" onClick={() =>this.enterCurrentHospital(currentHospital.id)}></img>
            </div>
            <div className="contact">
              <div className="top">
                <div className="left">
                  <div className="name">医院对接人： { currentHospital.contacts }</div>
                  <div className="phone"><span className="phoneTitle">对接人电话：</span> <span className="phoneNumber">{currentHospital.mobile }</span></div>
                </div>
                <div className="right">
                  <div onClick={()=> this.copyToClickBoard(currentHospital)}>复制</div>
                  <div><a href='https://www.wjx.top/jq/57775916.aspx' target='_blank' rel='noopener noreferrer'>血浆捐助</a></div>
                </div>
              </div>
              <div className="bottom">捐赠地址： { currentHospital.province + currentHospital.city +  currentHospital.area + currentHospital.street }</div>
            </div>
            <div className="demands">需求产品： { this.rebaseSupplies(currentHospital.supplies) }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

//将外部state对象的部分属性映射到UI组件的props对象;
//需要返回一个对象，其每一个键值对代表一个映射;
//mapStateToProps会自动订阅Store,当state更新的时候，就会自动执行，重新计算UI组件的参数
function mapStateToProps(state) {
  return {
    totalDemands: state.demandsMap.totalDemands,
    notices: state.demandsMap.notices,
    hospitals: state.demandsMap.hospitals,
    currentHospital: state.demandsMap.currentHospital,
    initialLocation: state.demandsMap.initialLocation
  };
}

//react-redux中的connect将dispatch传入mapDispatchToProps
function mapDispatchToProps(dispatch) {
  return {
    //利用展开运算符，直接将dispatch注入到整个actionCreators对象中，对象中的每一个actionCreator都拥有了dispatch的默认入参
    //
    //bindActionCreators()将dispatch注入到actionCreators()中;
    //每个actionCreator（是一个函数）就拥有了dispatch参数;
    //每个actionCreator可利用dispatch将data派发给reducer;
    //reducer组合当前状态和新来的data，更新Store，触发UI更新.
    ...bindActionCreators(demandsMapActions, dispatch)
  };
} 

export default DemandsMap;
