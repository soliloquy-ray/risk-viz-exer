'use client'

import { useEffect, useState, useRef } from "react";
import { dataInterface } from "../page";
import Chart from 'chart.js/auto';

const groupData = (data: dataInterface[]) => {
  const groups: {[key: string]: dataInterface[]} = {};

  for (const item of data) {
    const asset = item?.['Asset Name'].toLowerCase().replace(/\s+/g, '');
    const biz = item?.['Business Category'].toLowerCase().replace(/\s+/g, '');
    const lnglat = `${item.Long},${item.Lat}`;
    const key = `${asset}-${biz}-${lnglat}`;

    if (!groups[key]) {
      groups[key] = [{ Year: 2030, "Risk Rating": 0, "Asset Name": item["Asset Name"], "Business Category": item["Business Category"], "Risk Factors": item["Risk Factors"], Lat: item.Lat, Long: item.Long },{ Year: 2040, "Risk Rating": 0, "Asset Name": item["Asset Name"], "Business Category": item["Business Category"], "Risk Factors": item["Risk Factors"], Lat: item.Lat, Long: item.Long }, { Year: 2050, "Risk Rating": 0, "Asset Name": item["Asset Name"], "Business Category": item["Business Category"], "Risk Factors": item["Risk Factors"], Lat: item.Lat, Long: item.Long }, { Year: 2060, "Risk Rating": 0, "Asset Name": item["Asset Name"], "Business Category": item["Business Category"], "Risk Factors": item["Risk Factors"], Lat: item.Lat, Long: item.Long }, { Year: 2070, "Risk Rating": 0, "Asset Name": item["Asset Name"], "Business Category": item["Business Category"], "Risk Factors": item["Risk Factors"], Lat: item.Lat, Long: item.Long }];
    }

    const ind = groups[key].findIndex(g => g.Year === item.Year);
    if (groups[key][ind]["Risk Rating"] === 0) {
      groups[key][ind] = item;
    }
  }

  return groups;
}
    
const getColor = (r: number): string => {
  if (r < 0.3) {
    return '#fed976'
  } else if (r < 0.5) {
    return '#feb24c';
  } else if (r < 0.8) {
    return '#fd8d3c';
  } else if (r < 1) {
    return '#fc4e2a';
  }
  return '#e31a1c';
}

const genDataSet = (data: dataInterface[]): {label: string, data: number[]} => {
  const reduction: any = {
    label: '',
    data: [],
    factors: [],
    extra: {}
  };
  data.reduce((p, dt) => {
    reduction.label = dt["Asset Name"]+'_'+dt["Business Category"]+'_'+dt.Lat+'_'+dt.Long;
    reduction.data.push(dt["Risk Rating"]);
    reduction.factors.push(dt["Risk Factors"]);
    reduction.extra = dt;
    return p;
  }, [])
  return reduction;
}

const Graph = ({ data, fAsset, fBiz, fLat, fLng, setFAsset, setFBiz, setFLat, setFLng, reset, decades }: { data: dataInterface[], fAsset: any, fBiz: any, fLat: any, fLng: any, setFAsset: any, setFBiz: any, setFLat: any, setFLng: any, reset: any, decades: number[] }) => {
  // const [gData, setGData] = useState(groupData(data));
  const [chart, setChart] = useState<Chart>()
  
  useEffect(() => {
    if(!data || (fAsset ==='' && fBiz === '' && fLat === 0 && fLng === 0)) return;
    console.log(data);
    const gData = groupData(data);
    console.log(gData);
    const ctx = document.createElement('canvas');
    ctx.id = 'dimensions';
    const canvasContainer = document.getElementById('canvasContainer');
    if (canvasContainer) {
      canvasContainer.innerHTML = '';
      canvasContainer.appendChild(ctx);
    }

    if (chart) {
      chart.destroy();
    }
    const chartData = {
      labels: decades,
      datasets: Object.values(gData).map((d,x) => genDataSet(d)) , //{data: [...d.map(data => data['Risk Rating'])]}
    };
    
    const getOrCreateTooltip = (chart: { canvas: { parentNode: { querySelector: (arg0: string) => any; appendChild: (arg0: any) => void; }; }; }) => {
      let tooltipEl = chart.canvas.parentNode.querySelector('div');
    
      if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.style.background = 'rgba(0, 0, 0, 0.7)';
        tooltipEl.style.borderRadius = '3px';
        tooltipEl.style.color = 'white';
        tooltipEl.style.opacity = 1;
        tooltipEl.style.pointerEvents = 'none';
        tooltipEl.style.position = 'absolute';
        tooltipEl.style.transform = 'translate(-50%, 0)';
        tooltipEl.style.transition = 'all .1s ease';
        tooltipEl.style.maxHeight = '600px';
        tooltipEl.style.maxWidth = '400px';
    
        const table = document.createElement('table');
        table.style.margin = '0px';
    
        tooltipEl.appendChild(table);
        chart.canvas.parentNode.appendChild(tooltipEl);
      }
    
      return tooltipEl;
    };
    
    const externalTooltipHandler = (context: { chart: any; tooltip: any; }) => {
      // Tooltip Element
      const {chart, tooltip} = context;
      const tooltipEl = getOrCreateTooltip(chart);
      const {extra, factors} = tooltip.dataPoints?.[0]?.dataset;

      // Hide if no tooltip
      if (tooltip.opacity === 0) {
        tooltipEl.style.opacity = 0;
        return;
      }

      // Set Text
      if (tooltip.body) {
        const titleLines = tooltip.dataPoints.map((x: { dataset: { extra: { [x: string]: string; }; }; }) => (x.dataset.extra['Asset Name']+'-'+x.dataset.extra['Business Category']));// [extra?.['Asset Name'], extra?.['Business Category']];
        const bodyLines = tooltip.body.map((b: { lines: any; }) => b.lines);

        const tableHead = document.createElement('thead');

        titleLines.forEach((title: string) => {
          const tr = document.createElement('tr');
          tr.style.borderWidth = '0';

          const th = document.createElement('th');
          th.style.borderWidth = '0';
          const text = document.createTextNode(title);

          th.appendChild(text);
          tr.appendChild(th);
          tableHead.appendChild(tr);
        });

        const tableBody = document.createElement('tbody');
        bodyLines.forEach((body: string[]) => {
          // const colors = tooltip.labelColors[i];
          // console.log(body);
          const risk = Number(body[0].split(": ")[1])
          const node = `Risk Score: ${risk}`;

          const span = document.createElement('span');
          span.style.background = getColor(risk);// colors.backgroundColor;
          span.style.borderColor = getColor(risk);//colors.borderColor;
          span.style.borderWidth = '2px';
          span.style.marginRight = '10px';
          span.style.height = '10px';
          span.style.width = '10px';
          span.style.display = 'inline-block';

          const tr = document.createElement('tr');
          tr.style.backgroundColor = 'inherit';
          tr.style.borderWidth = '0';

          const td = document.createElement('td');
          td.style.borderWidth = '0';

          const text = document.createTextNode(node);

          td.appendChild(span);
          td.appendChild(text);
          tr.appendChild(td);
          tableBody.appendChild(tr);
        });
        const tableFoot = document.createElement('tfoot');
          const fc = factors[0];
          // factors.forEach(fc => {
            const tr = document.createElement('tr');
            tr.style.borderWidth = '0';

            const th = document.createElement('th');
            th.style.borderWidth = '0';
            const text = document.createTextNode(Object.entries(JSON.parse(fc)).map(joi => (`${joi[0]}: ${joi[1]}`)).join(' '));
            const h6 = document.createElement('h6');
            h6.innerText = 'Risk Factors:'

            th.appendChild(h6);
            th.appendChild(text);
            tr.appendChild(th);
            tableFoot.appendChild(tr);
          // });

        const tableRoot = tooltipEl.querySelector('table');

        // Remove old children
        while (tableRoot.firstChild) {
          tableRoot.firstChild.remove();
        }

        // Add new children
        tableRoot.appendChild(tableHead);
        tableRoot.appendChild(tableBody);
        tableRoot.appendChild(tableFoot);
      }

      const {offsetLeft: positionX, offsetTop: positionY} = chart.canvas;

      // Display, position, and set styles for font
      tooltipEl.style.opacity = 1;
      tooltipEl.style.left = positionX + tooltip.caretX + 'px';
      tooltipEl.style.top = positionY + tooltip.caretY + 'px';
      tooltipEl.style.font = tooltip.options.bodyFont.string;
      tooltipEl.style.padding = tooltip.options.padding + 'px ' + tooltip.options.padding + 'px';
    };

    let delayed: boolean;
    const ch = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
        interaction: {
          intersect: false,
          mode: 'point',
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: false,
            position: 'average',
            external: externalTooltipHandler,
          }
        },
        responsive: true,
        animation: {
          onComplete: () => {
            delayed = true;
          },
          delay: (context) => {
            let delay = 0;
            if (context.type === 'data' && context.mode === 'default' && !delayed) {
              delay = context.dataIndex * 100 + context.datasetIndex * 10;
            }
            return delay;
          },
        },
      },
      
    });
    setChart(ch);
  }, [data])
  return (
    <div className="graph">
      { data && <div style={{height: "400px", width: '100%'}} id="canvasContainer"></div>}
    </div>    
  )
}

export default Graph