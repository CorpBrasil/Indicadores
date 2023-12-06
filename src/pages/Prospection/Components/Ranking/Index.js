import { useEffect, useState } from 'react'
import styles from './styles.module.scss';

import Collapse from '@mui/material/Collapse';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { ThemeProvider } from '@emotion/react';
import { theme } from '../../../../data/theme';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { ReactComponent as Crown } from '../../../../images/icons/Crown.svg';


import Profile from '../../../../images/profile.jpg';

const Ranking = ({ leads, members }) => {
  const [openRanking, setOpenRanking] = useState(true);
  const [rankingSales, setRankingSales] = useState([]);
  const [TabsValue, setTabsValue] = useState(0);
  const [rankingEstimate, setRankingEstimate] = useState([]);

  const a11yProps = (index) => {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  console.log(members);
  console.log(leads);
  console.log(openRanking);


  useEffect(() => {
    if(members) {
      let sales = [];
      let estimate = [];
      let indicadores = members.filter((data) => data.cargo === 'Indicador');
      indicadores.map((data) => (
        sales.push({
          leads: leads.filter((ref) => data.uid === ref.uid && ref.status === 'Ganho').length,
          nome: data.nome,
          photo: data.photo,
          cidade: data.cidade.cidade
        })  
      ))
      indicadores.map((data) => (
        estimate.push({
          leads: leads.filter((ref) => data.uid === ref.uid).length,
          nome: data.nome,
          photo: data.photo,
          cidade: data.cidade.cidade
        })  
      ))
      let orderSales = [];
      let orderEstimate = [];
      orderSales = sales.sort((a , b) => {
        if(a.leads < b.leads) return -1
        if(a.leads > b.leads) return 1
        return 0 
      })
      orderEstimate = estimate.sort((a , b) => {
        if(a.leads > b.leads) return -1
        if(a.leads < b.leads) return 1
        return 0 
      })
      setRankingSales(orderSales.slice(0,5));
      setRankingEstimate(orderEstimate.slice(0,5));
    }
  },[leads, members])

 const CustomTabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box display={'flex'} alignItems={'center'}>
          {children}
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

  return (
    <div className={styles.ranking_content}>
      <div className={styles.ranking_header}>
        <h1>Meta do Mês</h1>
        <IconButton onClick={() => setOpenRanking(!openRanking)}>
        {openRanking ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </IconButton>
      </div>
      <Collapse sx={{ width: '100%' }} in={openRanking} timeout="auto" unmountOnExit>
      <ThemeProvider theme={theme}>
      <Tabs className={styles.ranking_choice} value={TabsValue} onChange={(e, newValue) => setTabsValue(newValue)} aria-label="Ranking" centered>
        <Tab label="Vendas" {...a11yProps(1)} />
        <Tab label="Orçamento" {...a11yProps(2)} />
      </Tabs>
      </ThemeProvider>
         <CustomTabPanel value={TabsValue} index={0}>
          <ul>
            {rankingSales && rankingSales.map((data, index) => (
            <li className={index === 0 ? styles.ranking_items_top : styles.ranking_items}>
              {index === 0 ? 
              <>
              <div className={styles.top_1}>
                <h1>1</h1>
                <img src={data.photo ? data.photo : Profile} alt="" />
              </div>
              <div className={styles.ranking_items_text}>
                    <h3><Crown /> {data.nome}</h3>
                    <p className={styles.city}>{data.cidade}</p>
                    <p><b>{data.leads}</b> Vendas</p>
                  </div></> : 
                  <><div>
                    <h2>{index + 1}</h2>
                    <img src={data.photo ? data.photo : Profile} alt='' />
                    <div className={styles.ranking_items_info}>
                      <h3>{data.nome}</h3>
                      <p className={styles.city}>{data.cidade}</p>
                    </div>
                  </div><h3>{data.leads}</h3></>
              }
            </li>
            ))}
          </ul>
         </CustomTabPanel>
         <CustomTabPanel value={TabsValue} index={1}>
          <ul>
            {rankingEstimate && rankingEstimate.map((data, index) => (
            <li className={index === 0 ? styles.ranking_items_top : styles.ranking_items}>
              {index === 0 ? 
              <>
              <div className={styles.top_1}>
              <h1>1</h1>
              <img src={data.photo ? data.photo : Profile} alt="" />
              </div>
              <div className={styles.ranking_items_text}>
              
                    <h3><Crown /> {data.nome}</h3>
                    <p className={styles.city}>{data.cidade}</p>
                    <p><b>{data.leads}</b> Orçamentos</p>
                  </div></> : 
                  <><div>
                    <h2>{index + 1}</h2>
                    <img src={data.photo ? data.photo : Profile} alt='' />
                    <div className={styles.ranking_items_info}>
                      <h3>{data.nome}</h3>
                      <p className={styles.city}>{data.cidade}</p>
                    </div>
                  </div><h3>{data.leads}</h3></>
              }
            </li>
            ))}
          </ul>
         </CustomTabPanel>
      </Collapse>
    </div>
  )
}

export default Ranking