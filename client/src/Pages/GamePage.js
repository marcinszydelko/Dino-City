import React, {useState, useEffect} from 'react';
import MapBox from '../Components/MapBox';
import MapTileRow from '../Components/MapTileRow';
import MapTile from '../Components/MapTile';
import BuildEnclosure from '../Components/BuildEnclosure';
import BuildBuilding from '../Components/BuildBuilding';
import BuildingDetails from '../Components/BuildingDetails';
import DinoPopup from "../Components/DinoPopup";
import {Redirect} from 'react-router-dom';
import GameStats from '../Components/GameStats';
import EnclosureTile from '../Components/EnclosureTile';
import EnclosureDetail from '../Components/EnclosureDetail';
import EmptyTileForEnclosure from "../Components/EmptyTileForEnclosure";
import EmptyTileForBuilding from "../Components/EmptyTileForBuilding"
import GameHeader from "../Components/GameHeader";
import GameTitle from "../Components/GameTitle";
import RandomEvent from '../Components/RandomEvent';
import BuildingTile from '../Components/BuildingTile';

function GamePage({parkName}) {
    const [showPopup, setShowPopup] = useState(false);
    const [showEnclosure, setShowEnclosure] = useState(false);
    const [showBuyBuildingPopup, setShowBuyBuildingPopup] = useState(false);
    const [showBuildingDetailsPopup, setShowBuildingDetailsPopup] = useState(false);
    const [park, setPark] = useState({money: 12000, enclosures:[], buildings: []});
    const [stats, setStats] = useState({money: 0, income:0, population: 0 });
    const [position, setPosition] = useState(null);
    const [enclosures, setEnclosures] = useState({});
    const [buildings, setBuildings] = useState({})
    const [dinosaurs, setDinosaurs] = useState([]);
    const [eventMessage, setEventMessage] = useState("")


    useEffect(() => {
       fetchStats()
        setInterval(() => {
            fetchStats()
        }, 5000)
        setInterval(() => {
            fetchEvent()
        },60000)
        fetchPark();
        fetchEnclosures();
        fetchDinosaurs();
        fetchBuildings();
    },[]);

    const fetchPark = () => {
        if(parkName){
            fetch(`http://localhost:8080/park/name/${parkName}`)
            .then(res => res.json())
            .then(park => setPark(park))
        }
    }

    function fetchStats() {
        if(parkName){
            fetch(`http://localhost:8080/park/stats/name/${parkName}`)
            .then(res => res.json())
            .then(data => setStats(data))
        }
    }

    function fetchEnclosures() {
        if(parkName) {
            fetch(`http://localhost:8080/enclosures/types`)
                .then(res => res.json())
                .then(data => setEnclosures(data))
        }
    }

    function fetchBuildings() {
        if(parkName) {
            fetch(`http://localhost:8080/buildings/types`)
            .then(res => res.json())
            .then(data => setBuildings(data.types))
        }
    }

    function fetchDinosaurs() {
        if(parkName) {
            fetch(`http://localhost:8080/dinosaur/species`)
                .then(res => res.json())
                .then(data => setDinosaurs(data.species))
        }
    }

    function fetchEvent() {
        if(parkName) {
            fetch(`http://localhost:8080/park/name/${parkName}/event`)
                .then(res => res.json())
                .then(data => setEventMessage(data.message)) 
        }
    }

    const handleOnOpenPopup = (position) => {
        setShowPopup(true);
        setPosition(position);
    };

    const handleOnClosePopup = () => {
        setShowPopup(false);
        setShowEnclosure(false);
        setEventMessage("");
        setShowBuyBuildingPopup(false);
        setShowBuildingDetailsPopup(false);
    };

    function handleOnOpenPopEnclosure(position) {
        setShowEnclosure(true);
        setPosition(position);
    }

    function handleOnOpenPopBuildBuilding(position) {
        setShowBuyBuildingPopup(true);
        setPosition(position);
    }

    function handleOnOpenPopBuildingDetails(position) {
        setShowBuildingDetailsPopup(true);
        setPosition(position);
    }

    const buyEnclosure = (size, security) => {
      setShowPopup(false);
      fetch(`http://localhost:8080/park/enclosure/${parkName}/${size.size}/${security.security}/${position}`, {method: 'POST'})
          .then(() => fetchPark())
          .then(() => fetchStats())
    };

    const buyDinosaur = (dinosaur) => {
        // setShowEnclosure(false);
        fetch(`http://localhost:8080/park/name/${parkName}/enclosure/${position}/dinosaur/${dinosaur.toUpperCase()}`, {method: 'POST'})
            .then(() => fetchPark())
            .then(() => fetchStats())
    };

    const buyBuilding = (buildingType) => {
        setShowBuyBuildingPopup(false);
        fetch(`http://localhost:8080/park/name/${parkName}/building/buy/${buildingType}/${position}`, {method: "POST"})
            .then(() => fetchPark())
            .then(() => fetchStats())
    };

    const sellDinosaur = (id) => {
        fetch(`http://localhost:8080/park/name/${parkName}/dinosaur/delete/${id}`, {method: 'DELETE'})
            .then(() => fetchPark())
            .then(() => fetchStats())
    };

    function updateEnclosureSecurity(security) {
        if(parkName) {
            fetch(`http://localhost:8080/park/name/${parkName}/enclosure/${position}/upgrade/security/${security}`, {method: 'PUT'})
                .then(() => fetchPark())
                .then(() => fetchStats())
        }
    }

    function updateEnclosureSize(size) {
        if(parkName) {
            fetch(`http://localhost:8080/park/name/${parkName}/enclosure/${position}/upgrade/size/${size}`, {method: 'PUT'})
                .then(() => fetchPark())
                .then(() => fetchStats())
        }
    }

    const sellBuilding = (position) => {
        setShowBuildingDetailsPopup(false);
        fetch(`http://localhost:8080/park/name/${parkName}/building/sell/${position}`, {method: "DELETE"})
            .then(() => fetchPark())
            .then(() => fetchStats())
    };

    function renderRedirect() {
        return <Redirect to="/" />
    }

    function initializeEndGame() {
        return <Redirect to="/game-over"/>
    }

    function getEnclosure() {
        return park.enclosures.find(enclosure => enclosure.positionId === position);
    }

    function getBuilding() {
        return  park.buildings.find(building => building.positionId === position);
    }

    function createMap(rows, columns) {
        const assetPlacement = [0,0,1,1,0,0,0,2,0,2,0,0,0,2,0,1,2,0,0,0,2,0,0,0];
        let placementIteration = 0;
        const map = [];
        for (let rowN = 0; rowN < rows; rowN++) {
            let row = [];
            for (let colN = 0; colN < columns; colN++) {
                let asset = null;
                if(assetPlacement[placementIteration] === 1) {
                   asset = <PrepareBuildingTile
                        park={park}
                        position={placementIteration}
                        onEmptyBuildingClick={handleOnOpenPopBuildBuilding}
                        onBuildingClick={handleOnOpenPopBuildingDetails}
                    />
                } else if(assetPlacement[placementIteration] === 2) {
                   asset =  <PrepareEnclosureTile
                    park={park}
                    position={placementIteration}
                    onEmptyEnclosureClick={handleOnOpenPopup}
                    onEnclosureClick={handleOnOpenPopEnclosure}
                    />
                }


                let tile = <MapTile key={rowN + colN} img={`./island/island_${rowN + 1}_${colN + 1}.png`}>
                             {asset}
                            </MapTile>
                row.push(tile);
                placementIteration ++;
            }
            map.push(<MapTileRow key={placementIteration} >{row}</MapTileRow>);
        }
        return map;
    }
 


  return (
    <>
        {!parkName && renderRedirect()}
        {park.money<= 0 && initializeEndGame()}

        <GameHeader>
            <GameTitle parkName={parkName}/>
            <GameStats stats={stats}/>
        </GameHeader>
        <DinoPopup show={showPopup} title="BUY ENCLOSURE" handleClose={handleOnClosePopup}>
            <BuildEnclosure money={park.money} buyEnclosure={buyEnclosure} enclosures={enclosures}/>
        </DinoPopup>
        <DinoPopup show={showEnclosure} title="ENCLOSURE DETAILS" handleClose={handleOnClosePopup}>
            <EnclosureDetail
                money={park.money}
                dinosaurs={dinosaurs}
                enclosure={getEnclosure()}
                enclosureTypes={enclosures}
                buyDinosaur={buyDinosaur}
                sellDinosaur={sellDinosaur}
                updateEnclosureSize={updateEnclosureSize}
                updateEnclosureSecurity={updateEnclosureSecurity}
            />
        </DinoPopup>
        <DinoPopup show={eventMessage != ""} title="A NEW EVENT!" handleClose={handleOnClosePopup}>
            <RandomEvent eventMessage={eventMessage}/>
        </DinoPopup>
        <DinoPopup show={showBuyBuildingPopup} title="BUY BUILDING" handleClose={handleOnClosePopup}>
            <BuildBuilding money={park.money} buildings={buildings} buyBuilding={buyBuilding} />
        </DinoPopup>
        <DinoPopup show={showBuildingDetailsPopup} title="BUILDING DETAILS" handleClose={handleOnClosePopup}>
            <BuildingDetails building={getBuilding()} sellBuilding={sellBuilding}/>
        </DinoPopup>

      <MapBox>
        {/* <MapTileRow>
            <MapTile img={"grass_01"}></MapTile>
            <MapTile img={"grass_02"}>
                <PrepareEnclosureTile
                    park={park} 
                    position={1} 
                    onEmptyEnclosureClick={handleOnOpenPopup}
                    onEnclosureClick={handleOnOpenPopEnclosure}
                    />
                </MapTile>
            <MapTile img={"grass_03"}></MapTile>
            <MapTile img={"grass_03"}></MapTile>
        </MapTileRow>
        <MapTileRow>
            <MapTile img={"grass_04"}></MapTile>
            <MapTile img={"grass_05"}>
                <PrepareEnclosureTile
                    park={park}
                    position={2}
                    onEmptyEnclosureClick={handleOnOpenPopup}
                    onEnclosureClick={handleOnOpenPopEnclosure}
                    />
            </MapTile>
            <MapTile img={"grass_06"}>
                <PrepareBuildingTile
                    park={park}
                    position={3}
                    onEmptyBuildingClick={handleOnOpenPopBuildBuilding}
                    onBuildingClick={handleOnOpenPopBuildingDetails}
                />
            </MapTile>
            <MapTile img={"grass_06"}></MapTile>
        </MapTileRow>
          <MapTileRow>
          <MapTile img={"grass_04"}></MapTile>
          <MapTile img={"grass_05"}>
              <PrepareBuildingTile
                  park={park}
                  position={2}
                  onEmptyBuildingClick={handleOnOpenPopup}
                  onEnclosureClick={handleOnOpenPopEnclosure}
              />
          </MapTile>
          <MapTile img={"grass_06"}></MapTile>
          <MapTile img={"grass_06"}></MapTile>
      </MapTileRow> */}
      {createMap(4,6)}
      </MapBox>
    </>
  );
}

const PrepareEnclosureTile = ({park, position, onEmptyEnclosureClick, onEnclosureClick}) => {
    const foundEnclosure = park.enclosures.find(enclosure => enclosure.positionId === position)
    if (foundEnclosure){
        return <EnclosureTile enclosure={foundEnclosure} onClick={onEnclosureClick} position={position}/>
    }
    return <EmptyTileForEnclosure onClick={onEmptyEnclosureClick} position={position}/>
};

const PrepareBuildingTile = ({park, position, onEmptyBuildingClick,  onBuildingClick}) => {
    const foundBuilding = park.buildings.find(building => building.positionId === position)
    if(foundBuilding) {
        return <BuildingTile building={foundBuilding} onClick={onBuildingClick}  position={position}  />
    }
    return <EmptyTileForBuilding onClick={onEmptyBuildingClick} position={position} />
}

export default GamePage