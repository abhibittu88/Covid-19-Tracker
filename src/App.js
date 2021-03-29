import React, { useState, useEffect } from 'react';
import { MenuItem, FormControl, Select, Card, CardContent,} from "@material-ui/core";
import InfoBox from './InfoBox';
import Table from "./Table";
import LineGraph from "./LineGraph";
import {sortData, prettyPrintStat} from "./util";
import Map from "./Map";
import "leaflet/dist/leaflet.css";
import './App.css';


function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState(['worldwide']);
  const [countryInfo, setCountryInfo] = useState({}); // initial state empty object
  const [tableData, setTableData] = useState([]); // initial state empty array
  const [mapCenter, setmapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setmapZoom] = useState(3);
  const [mapCountries, setmapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");

  // STATE = How to write a variable in REACT <<<<<<
  // https://disease.sh/v3/covid-19/countries
  
  useEffect(() => {
     fetch("https://disease.sh/v3/covid-19/all")
     .then(response => response.json())
     .then(data => {
        setCountryInfo(data);
     });
  }, []);

  // useEffect = runs a piece of code 
  // based on a given condition

  useEffect(() => {
    // The code here will run once
    // when the component loads and not again

    // async -> send arequet, wait for it, do something with info

    const getCountriesData = async() => {
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then((response) => response.json())
      .then((data) => {
        const countries = data.map((country) => ({
            name: country.country, // United States, United Kingdom
            value: country.countryInfo.iso2 // US, UK
        }));

        const sortedData = sortData(data);
        setTableData(sortedData);
        setmapCountries(data);
        setCountries(countries);
        
      });
    };

    getCountriesData();
  }, []);


  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    setCountry(countryCode);

    const url = countryCode ==='worldwide'
     ? 'https://disease.sh/v3/covid-19/all'
     : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setCountry(countryCode);

       // All the data from the country response
        setCountryInfo(data);

        // set country lat and long
        const cCode = countryCode ==='worldwide'
          ? setmapCenter([34.80746,-40.4796])
          : setmapCenter([data.countryInfo.lat, data.countryInfo.long]);
          
        setmapZoom(4);
      });

    console.log('Country Info >>>>', countryInfo);

    // https://disease.sh/v3/covid-19/all
    // https://disease.sh/v3/covid-19/countries/[COUNTRY_CODE]
  };

  return (
    <div className="app"> {/* BEM naming convention */}
      <div className="app__left">
        {/* Header */}
        <div className="app__header">
        {/*  Title + select input dropdown field*/}
        <h1>COVID-19 TRACKER</h1>
          <FormControl className="app__dropdown">
            <Select variant="outlined" onChange={onCountryChange} value={country}>
              {/* Loop through all the countries and show
                a dropdown list of options
              */}

              <MenuItem value="worldwide">Worldwide</MenuItem>
              {
                countries.map( (country) => (
                  <MenuItem value={country.value}>{country.name}</MenuItem>
                ))
              }

              {/* <MenuItem value="worldwide">A</MenuItem>
              <MenuItem value="worldwide">B</MenuItem>
              <MenuItem value="worldwide">C</MenuItem>
              <MenuItem value="worldwide">D</MenuItem> */}
            </Select>
          </FormControl>
        </div>
        
        <div className="app__stats">
          {/* InfoBox1 title ="Coronavirus cases" */}
          <InfoBox
            isRed
            active={casesType === "cases"}
            onClick={e => setCasesType("cases")} 
            title="Coranavirus cases" 
            cases={prettyPrintStat(countryInfo.todayCases)} 
            total={prettyPrintStat(countryInfo.cases)} 
          />
          {/* InfoBox2 title ="Coronavirus recoveries" */}
          <InfoBox 
            active={casesType === "recovered"}
            onClick={e => setCasesType("recovered")}
            title="Recovered" 
            cases={prettyPrintStat(countryInfo.todayRecovered)} 
            total={prettyPrintStat(countryInfo.recovered)} 
          />
          {/* InfoBox3 */}
          <InfoBox 
            isRed
            active={casesType === "deaths"}
            onClick={e => setCasesType("deaths")}
            title="Deaths" 
            cases={prettyPrintStat(countryInfo.todayDeaths)} 
            total={prettyPrintStat(countryInfo.deaths)} 
          />
        </div>

        {/* Map*/}
        <Map
          casesType={casesType} 
          countries={mapCountries}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>

      <Card className="app__right">
        <CardContent>
          {/* Table */}
          <h3>Live Cases by Country</h3>
          <Table countries={tableData} />
            <h3 className="app__graphTitle">Worldwide new {casesType} </h3>
          <LineGraph className="app__graph" casesType={casesType} />
          {/* Graph */}
        </CardContent>
      </Card>
      
    </div>
  );
}

export default App;
