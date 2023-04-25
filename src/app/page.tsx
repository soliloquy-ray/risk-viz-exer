'use client'
import { useEffect, useState } from "react";
import CSVParse from "./components/CSVParse";
import Map from "./components/Map";
import { Button, MenuItem, Select } from "@mui/material";
import DTable from "./components/DTable";
import { KeyValuePair } from "tailwindcss/types/config";
import Graph from "./components/Graph";

export interface dataInterface {
  Year: number;
  'Asset Name': string;
  'Business Category': string;
  Lat: number;
  Long: number;
  'Risk Rating': number;
  'Risk Factors': KeyValuePair;
}

const Home = () => {
  const [data, setData] = useState<dataInterface[]>([]);
  const [decade, setDecade] = useState('');
  const [fAsset, setFAsset] = useState('');
  const [fBiz, setFBiz] = useState('');
  const [fLat, setFLat] = useState<number>();
  const [fLng, setFLng] = useState<number>();
  const [filteredData, setFilteredData] = useState<dataInterface[]>([])
  const [dataAllDecades, setDataAllDecades] = useState<dataInterface[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [assetList, setAssetList] = useState<string[]>([]);
  const [bizList, setBizList] = useState<string[]>([]);

  const resetFilters = () => {
    setFAsset('');
    setFBiz('');
    setFLat(0);
    setFLng(0);
  }

  const handleDecadeChange = (dec: string) => {
    resetFilters();
    setDecade(dec);
  }

  useEffect(() => {
    const yr = data.map(d => d.Year).filter((v,i,a)=>a.indexOf(v)==i).sort((a,b)=>a-b);
    setYears(yr);
  }, [data])

  const applyFilters = (dataset: any[]) => {
    const qry: any = {
      'Asset Name': fAsset,
      'Business Category': fBiz,
      Lat: fLat,
      Long: fLng
    }
    
    let filterDataset = dataset.filter( (item) => {
      for (let key in qry) {
        if (qry[key] && !item[key].toString().toLocaleLowerCase().includes(qry[key].toString().toLocaleLowerCase())) {
          return false;
        }
      }
      return true;
    })
    setDataAllDecades(filterDataset);
    setFilteredData(filterDataset.filter(d => d.Year === Number(decade)));
    
    const biz = filterDataset.map(d => d?.['Business Category']).sort().filter((i, p, a) => !p || i!=a[p-1]);
    setBizList(biz);
    const ass = filterDataset.map(d => d?.['Asset Name']).sort().filter((i, p, a) => !p || i!=a[p-1]);
    setAssetList(ass);

    /* let filterData = fAsset && fAsset !== '' ? filteredData.filter(d => d?.['Asset Name'].toLocaleLowerCase().includes(fAsset.toLocaleLowerCase())) : data;
    filterData = fBiz && fBiz !== '' ? filterData.filter(d => d?.['Business Category'].toLocaleLowerCase().includes(fBiz.toLocaleLowerCase())) : filterData;
    filterData = fLng ? filterData?.filter(d => d.Long.toString() === fLng.toString()) : filterData;
    filterData = fLat ? filterData?.filter(d => d.Lat.toString() === fLat.toString()) : filterData;
    setDataAllDecades(filterData);
    setFilteredData(filterData?.filter(d=> d.Year === Number(decade))) */
    console.log(filterDataset);
  }
  
  const getSubHeaderComponent = () => {
    return (
      <div className='px-2 py-3 flex-row flex-end justify-space-between flex gap-2' style={{flexWrap: 'wrap'}}>
        <select className='px-2' name="asset" id="asset" value={fAsset}  onChange={e => setFAsset(e.target.value)}>
          <option value="">All</option>
          {
            assetList.map((asset, idx) => (
              <option key={idx} value={asset}>{asset}</option>
            ))
          }
        </select>
        
        <select className='px-2' name="business" id="business" value={fBiz}  onChange={e => setFBiz(e.target.value)}>
          <option value="">All</option>
          {
            bizList.map((bz, idx) => (
              <option key={idx} value={bz}>{bz}</option>
            ))
          }
        </select>
        <input placeholder='Latitude' className='px-2' style={{border: '3px solid gray', borderRadius: '8px', maxWidth:'110px'}} type="number" value={fLat} readOnly/>
        <input placeholder='Longitude' className='px-2' style={{border: '3px solid gray', borderRadius: '8px', maxWidth:'110px'}} type="number" value={fLng} readOnly/>
        <Button variant='contained' color="primary" onClick={resetFilters}>Clear</Button>
        
      </div>
    );
  };

  useEffect(() => {
    if (data.length < 1) return;
    applyFilters(data);
    
  }, [fAsset, fBiz, fLat, fLng, decade])
  return (
    <main style={{minHeight: '100vh', justifyContent:'center'}} className="home flex flex-col">
        {data.length < 1 && <CSVParse data={ data } setData={ setData }></CSVParse>}
        {data.length > 0 && 
          <nav className="fixed top-0 left-0 z-50 flex place-items-center w-full border-b border-gray-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 gap-2" style={{justifyContent: 'center'}}>
            <label htmlFor="decadeSelect" className="font-bold" style={{color:'#fff'}}>Choose a decade</label>
            <Select id="decadeSelect" className="my-2" style={{backgroundColor:'#fff', minWidth: '5rem'}} value={decade} onChange={(e)=>handleDecadeChange(e.target.value)}>
              {data.map(d => d.Year).filter((v,i,a)=>a.indexOf(v)==i).sort((a,b)=>a-b).map((dd, ddx) => (
                <MenuItem key={ddx} value={dd}>{dd}</MenuItem>
              ))}
            </Select>
            {getSubHeaderComponent()}
          </nav>
        }
        {filteredData.length > 0 && <Map data={filteredData} fAsset={fAsset} fBiz={fBiz} fLng={fLng} fLat={fLat} setFAsset={setFAsset} setFBiz={setFBiz} setFLng={setFLng} setFLat={setFLat} reset={resetFilters}></Map>}
        {filteredData.length > 0 && <DTable data={filteredData} fAsset={fAsset} fBiz={fBiz} fLng={fLng} fLat={fLat} setFAsset={setFAsset} setFBiz={setFBiz} setFLng={setFLng} setFLat={setFLat} reset={resetFilters}></DTable>}
        {dataAllDecades.length > 0 && <Graph data={dataAllDecades} fAsset={fAsset} fBiz={fBiz} fLng={fLng} fLat={fLat} setFAsset={setFAsset} setFBiz={setFBiz} setFLng={setFLng} setFLat={setFLat} reset={resetFilters} decades={years}></Graph>}
    </main>    
  )

}

export default Home;