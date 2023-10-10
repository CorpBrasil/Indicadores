import React from 'react'
import { useState, useEffect, memo} from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { collection, query, onSnapshot } from "firebase/firestore";
import moment from 'moment';
import axios from 'axios';

import styles from "./styles.module.scss";

import { ReactComponent as CheckIcon } from "../../../images/icons/Check.svg";
import { ReactComponent as BlockIcon } from "../../../images/icons/Block.svg";
import { ReactComponent as Email } from '../../../images/icons/Mail.svg';
import { ReactComponent as Phone } from '../../../images/icons/Phone.svg';
import { ReactComponent as WhatsApp } from '../../../images/icons/WhatsApp.svg';
import { ReactComponent as Trophy } from '../../../images/icons/Trophy.svg';
import PersonAddDisabledOutlinedIcon from '@mui/icons-material/PersonAddDisabledOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';

const Dashboard = ({dataBase, dateValue, activity, leads, consultora}) => {
  const [dataChart, setdataChart] = useState();
  const [dataChart2, setdataChart2] = useState();
  const [data1, setData1] = useState();
  const [data2, setData2] = useState();
  const [data3, setData3] = useState();
  const [ganho, setGanho] = useState(0);
  const [perdido, setPerdido] = useState(0);
  const [confirmar, setConfirmar] = useState();
  const [nconfirmar, setNconfirmar] = useState();
  const [visitas, setVisitas] = useState();
  const [visitasAll, setVisitasAll] = useState(null);
  const [atividades, setAtividades] = useState(activity);
  const [allLeads, setAllLeads] = useState();
  const [leadsSheets, setLeadsSheets] = useState();
  const [leadsSheetsRef, setLeadsSheetsRef] = useState();
  const [vendasSheets, setVendasSheets] = useState();
  const [vendasSheetsRef, setVendasSheetsRef] = useState();
  // const [loading, setLoading] = useState(true);
  const meses = ['01','02','03','04','05','06','07','08','09','10','11'];
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        await axios.get('https://script.google.com/macros/s/AKfycbxad1yCWiFmL9Q2qXIMglIFbH-m9KafsaNoD9UVYrhKgdmdjHpAlbJ-IxeTj-OroUjjsw/exec')
        .then((result) => {
          let sheets = [];
          result.data.GoogleSheetData.forEach((data) => {
            if(data[0].length > 1) {
              // const newData = Object.assign({}, data);
              sheets.push(data)
            }
          })
          setLeadsSheets(sheets.length);
          setLeadsSheetsRef(sheets);
        })
      } catch {
      }
    }
    fetchData();
},
  // eslint-disable-next-line react-hooks/exhaustive-deps
  []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await axios.get('https://script.google.com/macros/s/AKfycbyWrl_taZ0cqe8PG5NxLVPljlCNZZH62U6dAe09DRc5wQtwwOW16k7jtGZ-jb28CJjc/exec')
        .then((result) => {
          let sheets = [];
          result.data.GoogleSheetData.forEach((data) => {
            if(data[0] !== 'Data') {
              // const newData = Object.assign({}, data);
              sheets.push(data)
            }
          })
          setVendasSheets(sheets.length);
          setVendasSheetsRef(sheets);
        })
      } catch {
      }
    }
    fetchData();
},
  // eslint-disable-next-line react-hooks/exhaustive-deps
  []);

  // console.log(vendasSheetsRef)

  useEffect(() => {
      const fetchData = async () => {
        try {
          let items = [];
          meses.map(async (mes) => {
            await onSnapshot(query(collection(dataBase,"Agendas","2023", mes)), (visit) => {
              // Atualiza os dados em tempo real
              visit.forEach((doc) => {
                items.push(doc.data())
              })
            });
          })  
          //console.log(items)
          setVisitas(items);
          setVisitasAll(items);
          // setLoading(false);
        } catch {
        }
      }
      fetchData();
},
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);

  // console.log(visitas);

  useEffect(() => {
    if (visitas) {
          setConfirmar(visitas.filter((vis) => vis.confirmar === true).length);
          setNconfirmar(visitas.filter((vis) => vis.confirmar === false).length);
      }
  }, [visitas]);

  useEffect(() => {
    if(consultora === 'Geral') {
      if (dateValue) {
            const data1 = moment(dateValue[0]).format('YYYY-MM-DD');
            const data2 = moment(dateValue[1]).format('YYYY-MM-DD');
            setVisitas(visitasAll && visitasAll.filter((item) => (moment(data1).isSameOrBefore(moment(item.data).format('YYYY-MM-DD')) && moment(data2).isSameOrAfter(moment(item.data).format('YYYY-MM-DD')))))
            setAtividades(activity && activity.filter((item) => (moment(data1).isSameOrBefore(moment(item.createAt.seconds*1000).format('YYYY-MM-DD')) && moment(data2).isSameOrAfter(moment(item.createAt.seconds*1000).format('YYYY-MM-DD')))))
            setAllLeads(leads && leads.filter((item) => (moment(data1).isSameOrBefore(moment.unix(item.createAt.seconds).format('YYYY-MM-DD')) && moment(data2).isSameOrAfter(moment.unix(item.createAt.seconds).format('YYYY-MM-DD')))))
            setLeadsSheets(leadsSheetsRef && leadsSheetsRef.filter((item) => (moment(data1).isSameOrBefore(moment(item[0]).format('YYYY-MM-DD')) && moment(data2).isSameOrAfter(moment(item[0]).format('YYYY-MM-DD')))).length)
            setVendasSheets(vendasSheetsRef && vendasSheetsRef.filter((item) => (moment(data1).isSameOrBefore(moment(item[0]).format('YYYY-MM-DD')) && moment(data2).isSameOrAfter(moment(item[0]).format('YYYY-MM-DD')))).length)
          } else {
          setVisitas(visitasAll);
          setAtividades(activity);
          setData1(activity ? activity.filter((vis) => vis.atividade === 'Email').length : 0);
          setData2(activity ? activity.filter((vis) => vis.atividade === 'Ligação').length : 0);
          setData3(activity ? activity.filter((vis) => vis.atividade === 'WhatsApp').length : 0);
          setGanho(leads ? leads.filter((vis) => vis.status === 'Ganho').length : 0);
          setPerdido(leads ? leads.filter((vis) => vis.status === 'Perdido').length : 0);
          setAllLeads(leads);
          setLeadsSheets(leadsSheetsRef && leadsSheetsRef.length);
          setVendasSheets(vendasSheetsRef && vendasSheetsRef.length);
        }
    } else {
      if (dateValue) {
        const data1 = moment(dateValue[0]).format('YYYY-MM-DD');
        const data2 = moment(dateValue[1]).format('YYYY-MM-DD');
        setVisitas(visitasAll && visitasAll.filter((item) => (moment(data1).isSameOrBefore(moment(item.data).format('YYYY-MM-DD')) && moment(data2).isSameOrAfter(moment(item.data).format('YYYY-MM-DD')) && item.consultora === consultora )))
        setAtividades(activity && activity.filter((item) => (moment(data1).isSameOrBefore(moment(item.createAt.seconds*1000).format('YYYY-MM-DD')) && moment(data2).isSameOrAfter(moment(item.createAt.seconds*1000).format('YYYY-MM-DD')) && item.consultora === consultora )))
        setAllLeads(leads && leads.filter((item) => (moment(data1).isSameOrBefore(moment.unix(item.createAt.seconds).format('YYYY-MM-DD')) && moment(data2).isSameOrAfter(moment.unix(item.createAt.seconds).format('YYYY-MM-DD')) && item.consultora === consultora )))
        setLeadsSheets(leadsSheetsRef && leadsSheetsRef.filter((item) => (moment(data1).isSameOrBefore(moment(item[0]).format('YYYY-MM-DD')) && moment(data2).isSameOrAfter(moment(item[0]).format('YYYY-MM-DD')) && item[9] === consultora)).length)
        setVendasSheets(vendasSheetsRef && vendasSheetsRef.filter((item) => (moment(data1).isSameOrBefore(moment(item[0]).format('YYYY-MM-DD')) && moment(data2).isSameOrAfter(moment(item[0]).format('YYYY-MM-DD')) && item[7] === consultora)).length)
      } else {
      setVisitas(visitasAll);
      setAtividades(activity);
      setData1(activity ? activity.filter((vis) => vis.atividade === 'Email' && vis.consultora === consultora).length : 0);
      setData2(activity ? activity.filter((vis) => vis.atividade === 'Ligação' && vis.consultora === consultora).length : 0);
      setData3(activity ? activity.filter((vis) => vis.atividade === 'WhatsApp' && vis.consultora === consultora).length : 0);
      setGanho(leads ? leads.filter((vis) => vis.status === 'Ganho' && vis.consultora === consultora).length : 0);
      setPerdido(leads ? leads.filter((vis) => vis.status === 'Perdido' && vis.consultora === consultora).length : 0);
      setAllLeads(leads);
      setLeadsSheets(leadsSheetsRef && leadsSheetsRef.length);
      setVendasSheets(vendasSheetsRef && vendasSheetsRef.length);
    }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateValue, consultora]);

  // console.log(dataChart)

  useEffect(() => {
    if(atividades !== activity) {
      setData1(atividades.filter((vis) => vis.atividade === 'Email').length);
      setData2(atividades.filter((vis) => vis.atividade === 'Ligação').length);
      setData3(atividades.filter((vis) => vis.atividade === 'WhatsApp').length);
      setGanho(allLeads.filter((vis) => vis.status === 'Ganho').length);
      setPerdido(allLeads.filter((vis) => vis.status === 'Perdido').length);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[atividades, allLeads])

  useEffect(() => {
    if(visitas) {
      let dataChartRef = [];
      let dataChartRef2 = [];
      let dia = [];
        visitas && visitas.forEach((vis) => {
          if(!dia.includes(vis.data)) {   
            dia.push(vis.data)
            dataChartRef.push({ name: moment(vis.data).format("DD/MM/YYYY"), Confirmada: visitas && visitas.filter((v) => v.data === vis.data && v.confirmar === true && v.categoria !== 'pos_venda').length,
            Nao_Confirmada: visitas && visitas.filter((v) => v.data === vis.data && v.confirmar === false && v.categoria !== 'pos_venda').length})
          }
        })
        dataChartRef2 = dataChartRef.sort((a,b) => {
          if(a.name > b.name) {
            return 1;
          } else if(a.name < b.name) {
            return -1;
          } return 0;
        })
        setdataChart(dataChartRef2)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[visitas])

  useEffect(() => {
    if(atividades) {
      let dataChartRef = [];
      let dataChartRef2 = [];
      let dia = [];
        atividades && atividades.forEach((vis) => {
          if(!dia.includes(moment(vis.createAt.seconds*1000).format('YYYY-MM-DD'))) {   
            dia.push(moment(vis.createAt.seconds*1000).format('YYYY-MM-DD'))
            dataChartRef.push({ name: moment(vis.createAt.seconds*1000).format('DD/MM/YYYY'), Atividades: atividades && atividades.filter((v) => moment(v.createAt.seconds*1000).format('YYYY-MM-DD') === moment(vis.createAt.seconds*1000).format('YYYY-MM-DD')).length})
          }
        })
        dataChartRef2 = dataChartRef.sort((a,b) => {
          if(a.name > b.name) {
            return 1;
          } else if(a.name < b.name) {
            return -1;
          } return 0;
        })
        setdataChart2(dataChartRef2)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[visitas])

  return (
    <div className={styles.dashboard}>
          <h2 className={styles.dashboard_title}>Visitas e Vendas</h2>
          <div className={styles.dashboard__content}>
          <div className={styles.dashboard__box1}>
            <div className={styles.dashboard__box1_info}>
              <div className={styles.dashboard__box1_info_list}>
                <h1>{visitas && visitas.length}</h1>
                <h3>Visitas Agendadas</h3>
              </div>
              <div className={styles.dashboard__box1_info_list}>
                <div>
                    <CheckIcon />
                    <h1>{confirmar && confirmar}</h1>
                    <p>Confirmada(s)</p>
                  </div>
                  <div>
                    <BlockIcon />
                    <h1>{nconfirmar && nconfirmar}</h1>
                    <p>Não Confirmada(s)</p>
                  </div>
              </div>
              <div className={styles.dashboard__meta}>
              <span className={styles.visit_icon}><Trophy /></span>
              <p>Meta do Mês</p>
              <h2>20</h2>
              </div>
            </div> 
          </div>
          <div className="dashboard__box3">
          <h2>Visitas</h2>
          <ResponsiveContainer width="95%" height="80%">
          <LineChart
          width={500}
          height={300}
          data={dataChart}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis type="number" domain={[-1, 'dataMax + 5']} allowDataOverflow={true}  />
          <Tooltip />
          <Legend />
          <Line type="basics" legendType='plainline' name='Confirmada' strokeWidth={2} dataKey="Confirmada" stroke="green" activeDot={{ r: 8 }}>
            <LabelList dataKey="Confirmada" offset={8} position="top" />
          </Line>
          <Line type="basics" legendType='plainline' name='Não Confirmada' strokeWidth={2} dataKey="Nao_Confirmada" label="Não Confirmada" stroke="red" activeDot={{ r: 8 }} >
            <LabelList dataKey="Nao_Confirmada" offset={8} position="top" />
          </Line>
        </LineChart>
          </ResponsiveContainer>
        </div>
          <div className={styles.dashboard__box4}>
            <div className={styles.dashboard__box4_item}>
              <div>
                <h1>{leadsSheets && leadsSheets}</h1>
                <h2>Leads</h2>
              </div>
              <div>
                <p><b>{leadsSheets && leadsSheets}</b> Trafégo/Meetime | <b>{ganho && ganho}</b> Prospecção</p>
              </div>
            </div>
            <div className={styles.dashboard__box4_item2}>
              <div>
                <h1>{vendasSheets}</h1>
                <h2>Vendas</h2>
                <h3><b style={{ color: 'green' }}>100%</b> &nbsp;Alcançada</h3>
              </div>
              <div className={styles.dashboard__meta}>
              <span className={styles.visit_icon}><Trophy /></span>
              <p>Meta do Mês</p>
              <h2>20</h2>
              </div>
            </div>
        </div>
          </div>
          <h2 className={styles.dashboard_title}>Prospecção</h2>
          <div className={styles.dashboard__content}>
          <div className={styles.dashboard__box2}>
            <div className={styles.dashboard__box2_info}>
              <div className={styles.dashboard__box2_info_list}>
                <h1>{allLeads && allLeads.length}</h1>
                <h2>Leads Ativos</h2>
              </div>
              <div className={styles.dashboard__box2_info_list}>
                <div>
                    <HowToRegOutlinedIcon style={{ fill: 'green' }} />
                    <h1>{ganho ? ganho : 0}</h1>
                    <p>Leads Ganhos</p>
                  </div>
                  <div>
                    <PersonAddDisabledOutlinedIcon style={{ fill: 'red' }} />
                    <h1>{perdido ? perdido : 0}</h1>
                    <p>Leads Perdidos</p>
                  </div>
              </div>
              <div className={styles.dashboard__box2_info_list}>
                <h3><b style={{ color: 'green' }}>100%</b> &nbsp;Alcançada</h3>
              </div>
              <div className={styles.dashboard__meta}>
              <span className={styles.visit_icon}><Trophy /></span>
              <p>Meta do Mês</p>
              <h2>20</h2>
              </div>
            </div> 
          </div>
          <div className={styles.dashboard__box2}>
            <div className={styles.dashboard__box2_info}>
              <div className={styles.dashboard__box2_info_list}>
                <h1>{atividades && atividades ? atividades.length : 0}</h1>
                <h2>Atividades Realizadas</h2>
              </div>
              <ul className={styles.dashboard__box2_info_list}>
              <li className={styles.dashboard__box2_info_list_item}>
                <div>
                  <span style={{ backgroundColor: '#8a8a8a' }}><Email /></span>
                  <p>Email</p>
                </div>
              <h3>{data1 ? data1 : 0}</h3>
              </li>
              <li className={styles.dashboard__box2_info_list_item}>
                <div>
                  <span style={{ backgroundColor: '#576af5' }}><Phone /></span>
                  <p>Ligação</p>
                </div>
              <h3>{data2 ? data2 : 0}</h3>
              </li>
              <li className={styles.dashboard__box2_info_list_item}>
                <div>
                  <span style={{ backgroundColor: '#44bf2b' }}><WhatsApp /></span>
                  <p>WhatsApp</p>
                </div>
              <h3>{data3 ? data3: 0}</h3>
              </li>
            </ul>
              <div className={styles.dashboard__box2_info_list}>
                <h3><b style={{ color: 'green' }}>100%</b> &nbsp;Alcançada</h3>
              </div>
              <div className={styles.dashboard__meta}>
              <span className={styles.visit_icon}><Trophy /></span>
              <p>Meta do Mês</p>
              <h2>100</h2>
              </div>
            </div> 
          </div>
          <div className="dashboard__box3">
          <h2>Atividades</h2>
          <ResponsiveContainer width="95%" height="80%">
          <LineChart
          width={500}
          height={300}
          data={dataChart2}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis type="number" domain={[-1, 'dataMax + 5']} allowDataOverflow={true} />
          <Tooltip />
          <Legend />
          <Line type="basics" legendType='plainline' dataKey="Atividades" dot={true} stroke="#8884d8" activeDot={{ r: 8 }}>
          <LabelList dataKey="Atividades" position="top" offset={8} />
          </Line>
          {/* <ReferenceLine label="Meta" stroke="green" strokeDasharray="4 4" segment={[{ x: '02/10/2023', y: 0 }, { x: '10/10/2023', y: 400 }]} /> */}
        </LineChart>
          </ResponsiveContainer>
        </div>
          </div>
        </div>
  )
}

export default memo(Dashboard);