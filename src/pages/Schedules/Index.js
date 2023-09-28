import { useEffect, useState, memo, forwardRef } from 'react';
import moment from "moment";
import Geocode from "react-geocode";
import axios from 'axios';
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom'; // import do hook
import { dataBase } from '../../firebase/database';
import CurrencyInput from "react-currency-input-field";
import { onSnapshot, collection } from "firebase/firestore";
import CreateSchedule from '../../components/Modal/CreateSchedule/Index';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import useAuth from '../../hooks/useAuth';
import Header from '../../components/Header/Index';
import { Users, KeyMaps } from '../../data/Data';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

import PeopleIcon from '@mui/icons-material/People';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { ReactComponent as Prospection } from '../../images/icons/Prospection.svg';
import CachedIcon from '@mui/icons-material/Cached';



import './_style.scss';

const Schedules = ({ userRef, alerts, check }) => {
  Geocode.setLanguage("pt-BR");
  Geocode.setRegion("br");
  Geocode.setApiKey(KeyMaps);
  Geocode.setLocationType("ROOFTOP");

  const Alert = forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

    const { user } = useAuth();
    const [schedules, setSchedules] = useState();
    const [posto, setPosto] = useState();
    const [km, setKm] = useState();
    const [litro, setLitro] = useState();
    const [total, setTotal] = useState();
    const [cidade, setCidade] = useState(undefined);
    const [lng, setLng] = useState();
    const [lat, setLat] = useState();
    const [combustivel, setCombustivel] = useState();
    const [members, setMembers] = useState(undefined);
    const [findTec, setFindTec] = useState(undefined);
    // eslint-disable-next-line no-unused-vars
    const [rawValue, setRawValue] = useState(" ");
    const [open, setOpen] = useState(false);
    const [financeSchedules, setFinanceSchedules] = useState();
    const navigate = useNavigate(); //chamado do hook
    const [createSchedule, setCreateSchedule] = useState(undefined);
    const schedulesCollectionRef = collection(dataBase, "Agendas");
    const FinanceSchedulesCollectionRef = collection(dataBase, "Financeiro");
    const MembersSchedulesCollectionRef = collection(dataBase, "Membros");

    useEffect(() => {
        if(collection) { 
            // const q = query(membersCollectionRef); // Pega aos chats pela ordem descrescente do 'Created'
            const unsub = () => {
              onSnapshot(schedulesCollectionRef, (schedules) => { // Atualiza os dados em tempo real
              let docSchedule = [];
              schedules.forEach(doc => {
                docSchedule.push({ ...doc.data(), id: doc.id })
              })
              setSchedules(docSchedule); // puxa a coleção 'Agendas' para o state
            });

              onSnapshot(FinanceSchedulesCollectionRef, (schedules) => { // Atualiza os dados em tempo real
              let docFinance = [];
              schedules.forEach(doc => {
                docFinance.push({ ...doc.data(), id: doc.id })
              })
              setFinanceSchedules(docFinance); // puxa a coleção 'Agendas' para o state
          })
              onSnapshot(MembersSchedulesCollectionRef, (schedules) => { // Atualiza os dados em tempo real
              let docMembers = [];
              schedules.forEach(doc => {
                docMembers.push({ ...doc.data(), id: doc.id })
              })
              setMembers(docMembers); // puxa a coleção 'Agendas' para o state
          })
        }
            unsub();
          };
    
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [collection]);
    
  useEffect(() => {
    if(members){
      setFindTec(members.find((ref) => ref.nome === user.name && ref.cargo === "Técnico"))
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[members])

  // console.log(findTec)

  const returnSchedule = () => {
    setCreateSchedule(false);
  }

  const goToSchedule = (type, year) => {
      navigate(type + year);
  }

  // const deleteSchedule = async (id) => {
  //   try {
  //     Swal.fire({
  //       title: Company,
  //       html: `Você deseja deletar essa <b>Agenda</b>?`,
  //       icon: "warning",
  //       showCancelButton: true,
  //       showCloseButton: true,
  //       confirmButtonColor: "#F39200",
  //       cancelButtonColor: "#d33",
  //       confirmButtonText: "Sim",
  //       cancelButtonText: "Não",
  //     }).then(async (result) => {
  //       if (result.isConfirmed) {
  //         await deleteDoc(doc(dataBase, "Agendas", id));
  //         await deleteDoc(doc(dataBase, "Financeiro", id));
  //         Swal.fire({
  //           title: Company,
  //           html: `A Agenda <b>${id}</b> foi deletada com sucesso.`,
  //           icon: "success",
  //           showConfirmButton: true,
  //           showCloseButton: true,
  //           confirmButtonColor: "#F39200"
  //         })
  //       }
  //     })
  //   } catch {

  //   }
  // }

  const clearCacheData = () => {
    caches.keys().then((names) => {
      names.forEach((name) => {
        caches.delete(name);
      });
    });
    Swal.fire({
      title: 'Cache Limpo',
      icon: "success",
      html: `O Cache foi limpado com sucesso.`,
      confirmButtonText: "Fechar",
      showCloseButton: true,
      confirmButtonColor: "#0eb05f"  
    }).then(() => {
      window.location.reload();
    })
  };

  const handleClickOpen = () => {
    if(check) {
      Swal.fire({
        title: 'Sem Conexão',
        icon: "error",
        html: `Não é possível Confirmar Combustivel <b>sem internet.</b> Verifique a sua conexão.`,
        confirmButtonText: "Fechar",
        showCloseButton: true,
        confirmButtonColor: "#d33"  
      })
    } else {
      navigator.geolocation.getCurrentPosition(function (position) {
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
        })
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOnValueChange = (value) => {
    setRawValue(value === undefined ? "undefined" : value || " ");
    setLitro(value);
  };

  const handleOnValueChange2 = (value) => {
    setRawValue(value === undefined ? "undefined" : value || " ");
    setTotal(value);
  };

  useEffect( () => {
    if(!cidade && lng) {
      Geocode.fromLatLng(lat,lng).then(
        async (response) => {
          // console.log(response)
         let cityRef = response.results[0].address_components;
          setCidade(cityRef.find((ref) => ref.types[0] === 'administrative_area_level_2'));
        //  console.log(cidade)
       },
       (error) => {
        //  console.log(error);
       })
    }
  },[cidade,lat,lng, open])

  const sendData = (e) => {
     e.preventDefault();
    if(cidade) {
      const totalFormat = total.replace(',',".");
      const litroFormat = litro.replace(',',".");
      // const precoTotal = (totalFormat * litroFormat).toFixed(2);
      // const precoTotalFormat = precoTotal.replace('.',",");
      // console.log(precoTotalFormat)
      const litros = (totalFormat/litroFormat).toFixed(2);
      setOpen(false);
        Swal.fire({
          title: 'Atenção',
          html: `Verifique os dados abaixo para confirmar o <b>Abastecimento.</b> </br></br>` +
          `Nome do Posto: <b>${posto}</b> </br>` +
          `Quilometragem: <b>${km}</b> </br>` +
          `Preço por Litro: <b>R$ ${litro}</b> </br>` +
          `Quantidade de Litro: <b>${litros}</b> </br>` +
          `Preço Total: <b>R$ ${total}</b> </br>` +
          `Combustivel: <b>${combustivel}</b> </br>` +
          `Veiculo: <b>${findTec.veiculo}</b>`,
          icon: "warning",
          showCancelButton: true,
          showCloseButton: true,
          confirmButtonColor: "#F39200",
          cancelButtonColor: "#d33",
          confirmButtonText: "Confirmar",
          cancelButtonText: "Cancelar",
        }).then(async (result) => {
          if(result.isConfirmed) {
            axios.post('https://n8n.corpbrasil.cloud/webhook/2223e180-0daa-4d5d-90f6-e2cd29aef7d6', {
              data: moment(new Date()).format('DD/MM/YYYY HH:mm'),
              nome: posto,
              km: km,
              litro: litro,
              QtdeLitro: `R$ ${total}`,
              total: litros,
              lat: lat,
              lng: lng,
              cidade: cidade.long_name,
              endereco: `https://maps.google.com/?q=${lat},${lng}`,
              responsavel: userRef.nome,
              telefone: '5515998307457',
              veiculo: findTec.veiculo,
              combustivel: combustivel
            })
            Swal.fire({
              position: 'top-center',
              icon: 'success',
              title: 'Abastecimento confirmado com Sucesso!',
              showConfirmButton: false,
              timer: 2000
            })
            setPosto('');
            setKm('');
            setLitro('');
            setTotal('');
            setLng('');
            setLat('');
            setCombustivel('');
          } else {
            setOpen(true);
          }
      });
    } else {
      setOpen(false);
      Swal.fire({
        title: 'GPS Desativado',
        html: `Ative o <b>GPS</b> para confirmar o abastecimento.`,
        icon: "error",
        showCloseButton: true,
        confirmButtonColor: "#F39200",
        confirmButtonText: "Ok",
      })
    }
  }
  

  return (
    <div className='container-schedules'>
      <Header user={user} userRef={userRef} alerts={alerts}></Header>
      <div className='title-schedule'>
        <HomeOutlinedIcon sx={{ width: '50px', height: '50px' }} />
        <h1>Inicio</h1>
      </div>
       <div className='content-schedule'>
        <div className='buttons-content'>
       {(user.email !== Users[1].email) &&
        <div className='box-schedule'>
          {schedules && schedules.map((schedule, index) => (
            <li key={index} className='schedule'>
              {/* {userRef && (user.email === Users[0].email || userRef.cargo === "Administrador") &&
              <div className='schedule__button'>
                <button onClick={() => deleteSchedule(schedule.id)}></button>
              </div>
              } */}
              <div className='schedule__content' onClick={() => goToSchedule('/agenda/', schedule.id)}>
              <div className='schedule__icon visits'><CalendarMonthIcon /></div>
              <div className='schedule__text-box'>
              <div className='schedule__text'>
                <p>Agenda Visita</p>
                <p>{schedule.id}</p>
              </div>
              </div>
              </div>
            </li>
          ))}
       </div>}
       {userRef && (user.email === Users[0].email || user.email === Users[1].email || userRef.cargo === "Técnico" || userRef.cargo === "Administrador") &&
        <div className='box-schedule'>
            {financeSchedules && financeSchedules.map((schedule, index) => (
              <li key={index} className='schedule'>
                {/* {userRef && (user.email === Users[0].email || userRef.cargo === "Administrador") &&
                  <div className='schedule__button'>
                    <button onClick={() => deleteSchedule(schedule.id)}></button>
                  </div>} */}
                <div className='schedule__content' onClick={() => goToSchedule('/financeiro/', schedule.id)}>
                  <div className='schedule__icon finance'><CalendarMonthIcon /></div>
                  <div className='schedule__text'>
                    <p>Agenda Financeiro</p>
                    <p>{schedule.id}</p>
                  </div>
                </div>
              </li>
            ))}
          </div>
          }
        </div>
        <div className='buttons-content'>
         {userRef && (user.email === Users[0].email || userRef.cargo === "Vendedor(a)" || userRef.cargo === "Administrador") && userRef.nome !== 'Pós-Venda' &&
         <div className='box-schedule'>
           <li className='schedule'>
             <Link className='schedule__content' to="/prospeccao">
               <div className='schedule__icon prospection'><Prospection /></div>
               <div className='schedule__text'>
                 <p>Prospecção</p>
               </div>
               </Link>
           </li>
             </div>
        }
       {userRef && (user.email === Users[0].email || userRef.cargo === "Vendedor(a)" || userRef.cargo === "Administrador") && userRef.nome !== 'Pós-Venda' &&
       <div className='box-schedule'>
         <li className='schedule'>
           <Link className='schedule__content' to="/leads">
             <div className='schedule__icon alert'><PeopleIcon /></div>
             <div className='schedule__text'>
               <p>Confirmar Leads</p>
             </div>
             </Link>
         </li>
           </div>
      }
        </div>
        <div className='buttons-content'>
       {userRef && (user.email === Users[0].email || userRef.cargo === "Administrador" || userRef.cargo === "Técnico" || findTec) &&
        <><div className='box-schedule'>
              <li className='schedule'>
                <Link className='schedule__content' onClick={() => handleClickOpen()}>
                  <div className='schedule__icon fuel'><LocalGasStationIcon /></div>
                  <div className='schedule__text'>
                    <p>Confirmar</p>
                    <p>Combustivel</p>
                  </div>
                </Link>
              </li>
            </div><div className='box-schedule'>
                <li className='schedule'>
                  <Link className='schedule__content' onClick={() => clearCacheData()}>
                    <div className='schedule__icon cache'><CachedIcon /></div>
                    <div className='schedule__text'>
                      <p>Limpar Cache</p>
                    </div>
                  </Link>
                </li>
              </div></>
      }
        </div>
      {user.email === Users[0].email &&   
      <div className='add-schedule'>
              <button onClick={() => setCreateSchedule(true)} className='add-schedule__btn'></button>
      </div>
      }
      </div>
      {createSchedule && <CreateSchedule returnSchedule={returnSchedule} schedules={schedules}></CreateSchedule>} 
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle sx={{ fontSize: '1.4rem' }}>Confirmar Combustivel</DialogTitle>
          <form onSubmit={sendData}>
        <DialogContent>
          <DialogContentText sx={{ marginBottom: "1rem" }}>
            Preencha os campos abaixo para confirmar o abastecimento do veículo.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Nome do Posto"
            type="text"
            onChange={(e) => setPosto(e.target.value)}
            value={posto || ''}
            fullWidth
            required
            variant="outlined"
          />
          <TextField
            margin="dense"
            id="name"
            label="Quilometragem do Veiculo"
            type="number"
            onChange={(e) => setKm(e.target.value)}
            value={km  || ''}
            fullWidth
            required
            variant="outlined"
          />
          <CurrencyInput
          customInput={TextField}
          style={{ margin: '0.7rem 0rem 0.3rem 0' }}
          className="label__text"
          label="Preço por Litro"
          placeholder="R$ 00"
          intlConfig={{ locale: "pt-BR", currency: "BRL" }}
          onValueChange={handleOnValueChange}
          decimalsLimit={2}
          value={litro || ''}
          required
          fullWidth
          />
          <CurrencyInput
          customInput={TextField}
          style={{ margin: '0.4rem 0rem 0.7rem 0' }}
          className="label__text"
          label="Preço Total"
          placeholder="R$ 00"
          intlConfig={{ locale: "pt-BR", currency: "BRL" }}
          onValueChange={handleOnValueChange2}
          decimalsLimit={2}
          value={total || ''}
          required
          fullWidth
          />
          <FormControl sx={{ margin: '0.3rem 0' }} fullWidth>
            <InputLabel id="demo-simple-select-label">Combustível</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={combustivel}
              label="Combustível"
              required
              onChange={(e) => setCombustivel(e.target.value)}
            >
              <MenuItem value='Gasolina'>Gasolina</MenuItem>
              <MenuItem value='Etanol'>Etanol</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            id="name"
            label="Veiculo"
            type="number"
            value={findTec && findTec.veiculo}
            disabled
            fullWidth
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button type='submit'>Confirmar</Button>
          <Button onClick={handleClose}>Cancelar</Button>
        </DialogActions>
          </form>
      </Dialog>
      <Snackbar open={check} autoHideDuration={6000}>
          <Alert severity="error" sx={{ width: '100%' }}>
            Você está sem conexão. Verifique a sua conexão com a internet.
          </Alert>
      </Snackbar>
    </div>

  )
}

export default memo(Schedules)
