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

const Dashboard = ({dataBase, dateValue, activity, leads, consultora, sendData}) => {
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
  const [leadsRobo, setLeadsRobo] = useState();
  const [leadsMeetime, setLeadsMeetime] = useState();
  // const [loading, setLoading] = useState(true);
  const meses = ['01','02','03','04','05','06','07','08','09','10','11'];
  const meta = {
    vendas: consultora && consultora !== 'Geral' ? 5 : 5*4,
    visitas: consultora && consultora !== 'Geral' ? 5 : 5*4,
    ganho: consultora && consultora !== 'Geral' ? 5 : 5*4,
    atividades: consultora && consultora !== 'Geral' ? 100 : 100*4
  }


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
          setVendasSheets(sheets);
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
  }, [visitas, dateValue]);

  // console.log(leadsSheetsRef)

  useEffect(() => {
    if(consultora === 'Geral') {
      if (dateValue) {
            const data1 = moment(dateValue[0]).format('YYYY-MM-DD');
            const data2 = moment(dateValue[1]).format('YYYY-MM-DD');
            setVisitas(visitasAll && visitasAll.filter((item) => (moment(data1).isSameOrBefore(moment(item.data).format('YYYY-MM-DD')) && moment(data2).isSameOrAfter(moment(item.data).format('YYYY-MM-DD')))))
            setAtividades(activity && activity.filter((item) => (moment(data1).isSameOrBefore(moment(item.createAt.seconds*1000).format('YYYY-MM-DD')) && moment(data2).isSameOrAfter(moment(item.createAt.seconds*1000).format('YYYY-MM-DD')))))
            // setAllLeads(leads && leads.filter((item) => (moment(data1).isSameOrBefore(moment.unix(item.createAt.seconds).format('YYYY-MM-DD')) && moment(data2).isSameOrAfter(moment.unix(item.createAt.seconds).format('YYYY-MM-DD')))))
            setLeadsSheets(leadsSheetsRef && leadsSheetsRef.filter((item) => (moment(data1).isSameOrBefore(moment(item[0]).format('YYYY-MM-DD')) && moment(data2).isSameOrAfter(moment(item[0]).format('YYYY-MM-DD')))))
            setVendasSheets(vendasSheetsRef && vendasSheetsRef.filter((item) => (moment(data1).isSameOrBefore(moment(item[0]).format('YYYY-MM-DD')) && moment(data2).isSameOrAfter(moment(item[0]).format('YYYY-MM-DD')))))
          } else {
          setVisitas(visitasAll);
          setAtividades(activity);
          setData1(activity ? activity.filter((vis) => vis.atividade === 'Email').length : 0);
          setData2(activity ? activity.filter((vis) => vis.atividade === 'Ligação').length : 0);
          setData3(activity ? activity.filter((vis) => vis.atividade === 'WhatsApp').length : 0);
          setGanho(leads ? leads.filter((vis) => vis.status === 'Ganho').length : 0);
          setPerdido(leads ? leads.filter((vis) => vis.status === 'Perdido').length : 0);
          setAllLeads(leads);
          setLeadsSheets(leadsSheetsRef && leadsSheetsRef);
          setVendasSheets(vendasSheetsRef && vendasSheetsRef);
        }
    } else {
      if (dateValue) {
        const data1 = moment(dateValue[0]).format('YYYY-MM-DD');
        const data2 = moment(dateValue[1]).format('YYYY-MM-DD');
        setVisitas(visitasAll && visitasAll.filter((item) => (moment(data1).isSameOrBefore(moment(item.data).format('YYYY-MM-DD')) && moment(data2).isSameOrAfter(moment(item.data).format('YYYY-MM-DD')) && item.consultora === consultora )))
        setAtividades(activity && activity.filter((item) => (moment(data1).isSameOrBefore(moment(item.createAt.seconds*1000).format('YYYY-MM-DD')) && moment(data2).isSameOrAfter(moment(item.createAt.seconds*1000).format('YYYY-MM-DD')) && item.consultora === consultora )))
        // setAllLeads(leads && leads.filter((item) => (moment(data1).isSameOrBefore(moment.unix(item.createAt.seconds).format('YYYY-MM-DD')) && moment(data2).isSameOrAfter(moment.unix(item.createAt.seconds).format('YYYY-MM-DD')) && item.consultora === consultora )))
        setAllLeads(leads && leads.filter(item => item.consultora === consultora));
        setLeadsSheets(leadsSheetsRef && leadsSheetsRef.filter((item) => (moment(data1).isSameOrBefore(moment(item[0]).format('YYYY-MM-DD')) && moment(data2).isSameOrAfter(moment(item[0]).format('YYYY-MM-DD')) && item[9] === consultora)))
        setVendasSheets(vendasSheetsRef && vendasSheetsRef.filter((item) => (moment(data1).isSameOrBefore(moment(item[0]).format('YYYY-MM-DD')) && moment(data2).isSameOrAfter(moment(item[0]).format('YYYY-MM-DD')) && item[7] === consultora)))
      } else {
      setVisitas(visitasAll);
      setAtividades(activity);
      // setData1(activity ? activity.filter((vis) => vis.atividade === 'Email' && vis.consultora === consultora).length : 0);
      // setData2(activity ? activity.filter((vis) => vis.atividade === 'Ligação' && vis.consultora === consultora).length : 0);
      // setData3(activity ? activity.filter((vis) => vis.atividade === 'WhatsApp' && vis.consultora === consultora).length : 0);
      // setGanho(leads ? leads.filter((vis) => vis.status === 'Ganho' && vis.consultora === consultora).length : 0);
      // setPerdido(leads ? leads.filter((vis) => vis.status === 'Perdido' && vis.consultora === consultora).length : 0);
      // setAllLeads(leads);
      setAllLeads(leads && leads.filter(item => item.consultora === consultora));
      setLeadsSheets(leadsSheetsRef && leadsSheetsRef);
      setVendasSheets(vendasSheetsRef && vendasSheetsRef);
    }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateValue, consultora, leads, activity]);

  // console.log(dataChart)

  useEffect(() => {
    if(dateValue || consultora) {
      sendData({
        data_inicio: dateValue && moment(dateValue[0]).format('DD/MM/YYYY'),
        data_final: dateValue && moment(dateValue[1]).format('DD/MM/YYYY'),
        consultora: consultora && consultora,
        visitas: visitas && visitas.length,
        visitas_confirmada: confirmar,
        visitas_naoConfirmada: nconfirmar,
        visitas_meta: meta.visitas,
        visitas_metaR: visitas && visitas.length/5*100,
        vendas: vendasSheets && vendasSheets.length,
        vendas_meta: meta.vendas,
        vendas_metaR: vendasSheets && vendasSheets.length/5*100,
        leads: leadsSheets && leadsSheets.length + ganho,
        leadsSheet_robo: leadsRobo,
        leadsSheet_meetime: leadsMeetime,
        leadsSheet_ganho: ganho,
        prospeccao: allLeads && allLeads.length,
        prospeccao_ganho: ganho,
        prospeccao_perdido: perdido,
        atividades: atividades && atividades.length,
        atividades_email: data1,
        atividades_ligacao: data2,
        atividades_whats: data3,
        atividades_meta: meta.atividades,
        atividades_metaR: atividades && atividades.length/100*100
      })
      console.log({
        visitas: visitas && visitas.length,
        visitas_confirmada: confirmar,
        visitas_naoConfirmada: nconfirmar,
        visitas_meta: 5,
        visitas_metaR: visitas && visitas.length/5*100,
        vendas: vendasSheets && vendasSheets.length,
        vendas_meta: 2,
        vendas_metaR: vendasSheets && vendasSheets.length/5*100,
        leads: leadsSheets && leadsSheets.length + ganho,
        leadsSheet_robo: leadsRobo,
        leadsSheet_meetime: leadsMeetime,
        leadsSheet_ganho: ganho,
        prospeccao: allLeads && allLeads.length,
        prospeccao_ganho: ganho,
        prospeccao_perdido: perdido,
        atividades: atividades && atividades.length,
        atividades_email: data1,
        atividades_ligacao: data2,
        atividades_whats: data3,
        atividades_meta: 100,
        atividades_metaR: atividades && atividades.length/100*100})
    }
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[dateValue, consultora, visitas, confirmar, nconfirmar, vendasSheets, leadsSheets, ganho, leadsRobo, leadsMeetime, allLeads, perdido, atividades, data1, data2, data3])


  useEffect(() => {
    const dataValue1 = dateValue && moment(dateValue[0]).format('YYYY-MM-DD');
    const dataValue2 = dateValue && moment(dateValue[1]).format('YYYY-MM-DD');
    console.log(dataValue1, dataValue2)
    if(atividades !== activity && consultora === 'Geral') {
      setData1(atividades ? atividades.filter((vis) => vis.atividade === 'Email').length : activity && activity.filter((vis) => vis.atividade === 'Email').length);
      setData2(atividades ? atividades.filter((vis) => vis.atividade === 'Ligação').length : activity && activity.filter((vis) => vis.atividade === 'Ligação').length);
      setData3(atividades ? atividades.filter((vis) => vis.atividade === 'WhatsApp').length : activity && activity.filter((vis) => vis.atividade === 'WhatsApp').length);
      setGanho(allLeads ? allLeads.filter((vis) => vis.status === 'Ganho' &&
      moment(dataValue1).isSameOrBefore(moment(vis.dataRef)) &&
      moment(dataValue2).isSameOrAfter(moment(vis.dataRef))).length : leads && leads.filter((vis) => vis.status === 'Ganho').length);
      setPerdido(allLeads ? 
      allLeads.filter((vis) => vis.status === 'Perdido' && moment(dataValue1).isSameOrBefore(moment(vis.dataRef)) &&
      moment(dataValue2).isSameOrAfter(moment(vis.dataRef))).length : leads && leads.filter((vis) => vis.status === 'Perdido').length);
    } else {
      setData1(atividades ? atividades.filter((vis) => vis.atividade === 'Email').length : 0);
      setData2(atividades ? atividades.filter((vis) => vis.atividade === 'Ligação').length : 0);
      setData3(atividades ? atividades.filter((vis) => vis.atividade === 'WhatsApp').length : 0);
      console.log(allLeads && allLeads.filter((el) => el.email === "costelaenome@hotmail.com"));
      setGanho(allLeads ? allLeads.filter((vis) => vis.status === 'Ganho' && vis.consultora === consultora &&
      moment(dataValue1).isSameOrBefore(moment(vis.dataRef)) &&
      moment(dataValue2).isSameOrAfter(moment(vis.dataRef))).length : 0);
      setPerdido(allLeads ? allLeads.filter((vis) => vis.status === 'Perdido' && vis.consultora === consultora &&
      moment(dataValue1).isSameOrBefore(moment(vis.dataRef)) &&
      moment(dataValue2).isSameOrAfter(moment(vis.dataRef))).length : 0); // Parei aqui
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[atividades, allLeads, dateValue, activity, consultora])

  useEffect(() => {
    if(leadsSheets || dateValue) {
      setLeadsRobo(leadsSheets && leadsSheets.filter((lead) => lead[10] === '').length);
      setLeadsMeetime(leadsSheets && leadsSheets.filter((lead) => lead[10] !== '').length);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[leadsSheets, dateValue])

  console.log(leadsSheets)

  // useEffect(() => {
  //   if(visitas && dateValue) {
  //     let dataChartRef = [];
  //     let dataChartRef2 = [];
  //     let final = dateValue[1];
  //     let inicio2 = dateValue[0];
  //     for(let inicio = inicio2; inicio <= final; inicio.setDate(inicio.getDate() + 1)) {
  //         dataChartRef.push({ name: moment(inicio).format("DD/MM/YYYY"), Confirmada: visitas && visitas.filter((v) => v.data === moment(inicio).format("YYYY-MM-DD") && v.confirmar === true && v.categoria !== 'pos_venda').length,
  //         Nao_Confirmada: visitas && visitas.filter((v) => v.data === moment(inicio).format("YYYY-MM-DD") && v.confirmar === false && v.categoria !== 'pos_venda').length})
  //       }
  //       dataChartRef2 = dataChartRef.sort((a,b) => {
  //         if(a.name > b.name) {
  //           return 1;
  //         } else if(a.name < b.name) {
  //           return -1;
  //         } return 0;
  //       })
  //       setdataChart(dataChartRef2)
  //   }
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // },[visitas, dateValue])


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

  // useEffect(() => {
  //   if(atividades && dateValue) {
  //     let dataChartRef = [];
  //     let dataChartRef2 = [];
  //     let final = dateValue[1];
  //     for(let inicio2 = dateValue[0]; inicio2 <= final; inicio2.setDate(inicio2.getDate() + 1)) {

  //         dataChartRef.push({ name: moment(inicio2).format("DD/MM/YYYY"), Atividades: atividades && atividades.filter((v) => v.dataRef === moment(inicio2).format("YYYY-MM-DD")).length})
  //         console.log('11111111111111111111111')
  //       }
  //       dataChartRef2 = dataChartRef.sort((a,b) => {
  //         if(a.name > b.name) {
  //           return 1;
  //         } else if(a.name < b.name) {
  //           return -1;
  //         } return 0;
  //       })
  //       setdataChart2(dataChartRef2)
  //   }
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // },[visitas, dateValue])

  // console.log(dateValue)

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
                  <h1>{visitas && visitas.length ? visitas.length : 0}</h1>
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
              <p>Meta da Semana</p>
              <h2>{meta.visitas}</h2>
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
                <h1>{(leadsSheets && ganho) && leadsSheets.length ?  leadsSheets.length + ganho : leadsSheets && leadsSheets.length}</h1>
                <h2>Leads</h2>
              </div>
              <div>
                <p style={{textAlign: 'center' }}><b>{leadsRobo && leadsRobo}</b> Trafégo Pago | <b>{leadsMeetime && leadsMeetime}</b> Meetime <br /> <b>{ganho && ganho}</b> Prospecção</p>
              </div>
            </div>
            <div className={styles.dashboard__box4_item2}>
              <div>
                <h1>{vendasSheets ? vendasSheets.length : 0}</h1>
                <h2>Vendas</h2>
                <h3><b style={{ color: 'green' }}>{((vendasSheets && vendasSheets.length / meta.vendas)*100).toFixed(0)}%</b>&nbsp;da Meta Alcançada</h3>
              </div>
              <div className={styles.dashboard__meta}>
              <span className={styles.visit_icon}><Trophy /></span>
              <p>Meta da Semana</p>
              <h2>{meta.vendas}</h2>
              </div>
            </div>
        </div>
          </div>
          <h2 className={styles.dashboard_title}>Prospecção</h2>
          <div className={styles.dashboard__content}>
          <div className={styles.dashboard__box2}>
            <div className={styles.dashboard__box2_info}>
              <div className={styles.dashboard__box2_info_list}>
                <h1>{allLeads && allLeads.length ? allLeads.length : 0}</h1>
                <h2>Leads Ativos</h2>
              </div>
              <div className={styles.dashboard__box2_info_list}>
                <div>
                    <HowToRegOutlinedIcon style={{ fill: 'green' }} />
                    <h1>{ganho && ganho ? ganho : 0}</h1>
                    <p>Leads Ganhos</p>
                  </div>
                  <div>
                    <PersonAddDisabledOutlinedIcon style={{ fill: 'red' }} />
                    <h1>{perdido ? perdido : 0}</h1>
                    <p>Leads Perdidos</p>
                  </div>
              </div>
              <div className={styles.dashboard__box2_info_list}>
                <h3><b style={{ color: 'green' }}>{((ganho && ganho / meta.ganho)*100).toFixed(0)}%</b>&nbsp;da Meta Alcançada</h3>
              </div>
              <div className={styles.dashboard__meta}>
              <span className={styles.visit_icon}><Trophy /></span>
              <p>Meta da Semana</p>
              <h2>{meta.ganho}</h2>
              </div>
            </div> 
          </div>
          <div className={styles.dashboard__box2}>
            <div className={styles.dashboard__box2_info}>
              <div className={styles.dashboard__box2_info_list}>
                <h1>{atividades && atividades ? atividades.length : activity && activity.length}</h1>
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
                <h3><b style={{ color: 'green' }}>{atividades && ((atividades.length / meta.atividades)*100).toFixed(0)}%</b>&nbsp;da Meta Alcançada</h3>
              </div>
              <div className={styles.dashboard__meta}>
              <span className={styles.visit_icon}><Trophy /></span>
              <p>Meta da Semana</p>
              <h2>{meta.atividades}</h2>
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