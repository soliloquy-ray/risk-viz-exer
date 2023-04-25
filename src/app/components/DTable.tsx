'use client'
import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';


const DTable = ({ data, fAsset, fBiz, fLat, fLng, setFAsset, setFBiz, setFLat, setFLng, reset }: { data: any, fAsset: any, fBiz: any, fLat: any, fLng: any, setFAsset: any, setFBiz: any, setFLat: any, setFLng: any, reset: any }) => {
  const [columns, setColumns] = useState<any[]>([]);

  useEffect(() => {
    if (data.length < 1) return;
    const cols = Object.keys(data?.[0]).map(k => ({ name: k, selector: (row:any)=> row?.[k], sortable: k !== 'Risk Factors', compact: ['Lat','Long', 'Risk Rating'].includes(k), /* omit: k === 'Year', */ grow: 'Risk Factors' === k ? 3 : 1, maxWidth: ['Lat', 'Long', 'Risk Rating'].includes(k) ? '10%' : '100%'
    }));
    setColumns(cols);
    // setFilteredData(data);
  }, [data])

  const handleSelect = (row: any) => {
    console.log(row);
    setFAsset(row?.['Asset Name']);
    setFBiz(row?.['Business Category']);
    setFLng(row?.Long);
    setFLat(row?.Lat);
  }

  return (
    <div className="DTable block" style={{ maxWidth: '100%'}}>

      { data && <DataTable
        columns={columns}
        data={data}
        fixedHeaderScrollHeight="300px"
        pagination
        responsive
        dense
        striped
        highlightOnHover
        // subHeader
        // subHeaderComponent={getSubHeaderComponent()}
        onRowClicked={handleSelect}
        paginationRowsPerPageOptions={[10,25,50,100]}
      /> }
    </div>
  )
}

export default DTable