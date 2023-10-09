import React from 'react'
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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

const Dashboard = ({dataBase, dateValue, activity, leads}) => {
  // const [dataChart, setdataChart] = useState();
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
  // const [loading, setLoading] = useState(true);
  const meses = ['01','02','03','04','05','06','07','08','09','10','11'];

  console.log(leads)

  const data = [
    {
      name: 'Page A',
      uv: 4000,
      pv: 2400,
      amt: 2400,
    },
    {
      name: 'Page B',
      uv: 3000,
      pv: 1398,
      amt: 2210,
    },
    {
      name: 'Page C',
      uv: 2000,
      pv: 9800,
      amt: 2290,
    },
    {
      name: 'Page D',
      uv: 2780,
      pv: 3908,
      amt: 2000,
    },
    {
      name: 'Page E',
      uv: 1890,
      pv: 4800,
      amt: 2181,
    },
    {
      name: 'Page F',
      uv: 2390,
      pv: 3800,
      amt: 2500,
    },
    {
      name: 'Page G',
      uv: 3490,
      pv: 4300,
      amt: 2100,
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        axios.get('https://script.google.com/macros/s/AKfycbxad1yCWiFmL9Q2qXIMglIFbH-m9KafsaNoD9UVYrhKgdmdjHpAlbJ-IxeTj-OroUjjsw/exec')
        .then((result) => {
          console.log(result);
          let sheets = [];
          result.data.GoogleSheetData.forEach((data) => {
            if(data[0].length > 1) {
              // const newData = Object.assign({}, data);
              sheets.push(data)
            }
          })
          setLeadsSheets(sheets);
          setLeadsSheetsRef(sheets);
        })
      } catch {
      }
    }
    fetchData();
},
  // eslint-disable-next-line react-hooks/exhaustive-deps
  []);

  console.log(leadsSheets)

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

//   useEffect(() => {
//     if(visitasAll) {
//       setVisitas(visitasAll);
// }
//   },[visitas])



  console.log(visitas);

  useEffect(() => {
    if (visitas) {
          setConfirmar(visitas.filter((vis) => vis.confirmar === true).length);
          setNconfirmar(visitas.filter((vis) => vis.confirmar === false).length);
      }
  }, [visitas]);

  useEffect(() => {
    if (dateValue) {
          const data1 = moment(dateValue[0]).format('YYYY-MM-DD');
          const data2 = moment(dateValue[1]).format('YYYY-MM-DD');
          setVisitas(visitasAll.filter((item) => (moment(data1).isSameOrBefore(moment(item.data).format('YYYY-MM-DD')) && moment(data2).isSameOrAfter(moment(item.data).format('YYYY-MM-DD')))))
          setAtividades(activity.filter((item) => (moment(data1).isSameOrBefore(moment(item.createAt.seconds*1000).format('YYYY-MM-DD')) && moment(data2).isSameOrAfter(moment(item.createAt.seconds*1000).format('YYYY-MM-DD')))))
          setAllLeads(leads.filter((item) => (moment(data1).isSameOrBefore(moment(item.data).format('YYYY-MM-DD')) && moment(data2).isSameOrAfter(moment(item.data).format('YYYY-MM-DD')))))
          setLeadsSheets(leadsSheetsRef.filter((item) => (moment(data1).isSameOrBefore(moment(item[0]).format('YYYY-MM-DD')) && moment(data2).isSameOrAfter(moment(item[0]).format('YYYY-MM-DD')))))
        } else {
        setVisitas(visitasAll);
        setAtividades(activity);
        setData1(activity ? activity.filter((vis) => vis.atividade === 'Email').length : 0);
        setData2(activity ? activity.filter((vis) => vis.atividade === 'Ligação').length : 0);
        setData3(activity ? activity.filter((vis) => vis.atividade === 'WhatsApp').length : 0);
        setGanho(leads ? leads.filter((vis) => vis.status === 'Ganho').length : 0);
        setPerdido(leads ? leads.filter((vis) => vis.status === 'Perdido').length : 0);
        setAllLeads(leads);
        setLeadsSheets(leadsSheetsRef);
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateValue]);

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

  console.log(ganho)
  console.log(data1)

  // useEffect(() => {
  //   if(schedule) {
  //     if(type === 'prospeccao') {
  //       setdataChart([
  //         {
  //           name: 'Ana',
  //           Atividades: schedule.filter((con) => con.consultora === 'Ana').length,
  //           fill: '#F28500'
  //         },
  //         {
  //           name: 'Bruna',
  //           Atividades: schedule.filter((con) => con.consultora === 'Bruna').length,
  //           fill: '#44BF2B'
  //         },
  //         {
  //           name: 'Lia',
  //           Atividades: schedule.filter((con) => con.consultora === 'Lia').length,
  //           fill: '#E892DD'
  //         },
  //         {
  //           name: 'Fernanda',
  //           Atividades: schedule.filter((con) => con.consultora === 'Fernanda').length,
  //           fill: '#FFC107'
  //         },
  //         {
  //           name: 'Leticia',
  //           Atividades: schedule.filter((con) => con.consultora === 'Leticia').length,
  //           fill: '#B901C6'
  //         }
  //       ])
  //     } else {
  //       setdataChart([
  //         {
  //           name: 'Ana',
  //           Visitas: schedule.filter((con) => con.consultora === 'Ana').length,
  //           fill: '#F28500'
  //         },
  //         {
  //           name: 'Bruna',
  //           Visitas: schedule.filter((con) => con.consultora === 'Bruna').length,
  //           fill: '#44BF2B'
  //         },
  //         {
  //           name: 'Lia',
  //           Visitas: schedule.filter((con) => con.consultora === 'Lia').length,
  //           fill: '#E892DD'
  //         },
  //         {
  //           name: 'Fernanda',
  //           Visitas: schedule.filter((con) => con.consultora === 'Fernanda').length,
  //           fill: '#FFC107'
  //         },
  //         {
  //           name: 'Leticia',
  //           Visitas: schedule.filter((con) => con.consultora === 'Leticia').length,
  //           fill: '#B901C6'
  //         }
  //       ])
  //     }
  //   }
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // },[schedule])

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
          <h2>Visitas x Leads</h2>
          <ResponsiveContainer width="90%" height="80%">
          <LineChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
        </LineChart>
          </ResponsiveContainer>
        </div>
          <div className={styles.dashboard__box4}>
            <div className={styles.dashboard__box4_item}>
              <div>
                <h1>{leadsSheets && leadsSheets.length}</h1>
                <h2>Leads</h2>
              </div>
              <div>
                <p><b>30</b> Trafégo/Meetime | <b>{ganho && ganho}</b> Prospecção</p>
              </div>
            </div>
            <div className={styles.dashboard__box4_item2}>
              <div>
                <h1>10</h1>
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
                    <h1>10 {ganho && ganho}</h1>
                    <p>Leads Ganhos</p>
                  </div>
                  <div>
                    <PersonAddDisabledOutlinedIcon style={{ fill: 'red' }} />
                    <h1>10 {perdido && perdido}</h1>
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
                <h1>{atividades && atividades.length}</h1>
                <h2>Atividades Realizadas</h2>
              </div>
              <ul className={styles.dashboard__box2_info_list}>
              <li className={styles.dashboard__box2_info_list_item}>
                <div>
                  <span style={{ backgroundColor: '#8a8a8a' }}><Email /></span>
                  <p>Email</p>
                </div>
              <h3>{data1}</h3>
              </li>
              <li className={styles.dashboard__box2_info_list_item}>
                <div>
                  <span style={{ backgroundColor: '#576af5' }}><Phone /></span>
                  <p>Ligação</p>
                </div>
              <h3>{data2}</h3>
              </li>
              <li className={styles.dashboard__box2_info_list_item}>
                <div>
                  <span style={{ backgroundColor: '#44bf2b' }}><WhatsApp /></span>
                  <p>WhatsApp</p>
                </div>
              <h3>{data3}</h3>
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
          <ResponsiveContainer width="90%" height="80%">
          <LineChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
        </LineChart>
          </ResponsiveContainer>
        </div>
          </div>
        </div>
  )
}

export default Dashboard;