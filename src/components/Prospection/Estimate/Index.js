import { addDoc, updateDoc, doc, collection, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL} from "firebase/storage";
import { useEffect, useState } from 'react';
import CurrencyInput from "react-currency-input-field";
import Swal from "sweetalert2"; // cria alertas personalizado
import axios from 'axios';
import step from '../../../data/step';
import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride';
// import { dataBase } from '../../../firebase/database';
// import { Company } from '../../../data/Data'
// import { usePlacesWidget } from "react-google-autocomplete";
import {
  DistanceMatrixService,
  GoogleMap,
  useLoadScript,
} from "@react-google-maps/api";
import { styled } from '@mui/material/styles';
import styles from "./styles.module.scss";
import moment from 'moment';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import Dialog from "@mui/material/Dialog";
import useMediaQuery from '@mui/material/useMediaQuery';
import { PatternFormat } from "react-number-format";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContentText from "@mui/material/DialogContentText";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { theme } from '../../../data/theme';
import { CircularProgress, ThemeProvider } from "@mui/material";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import { KeyMaps } from '../../../data/Data';
import { dataBase } from '../../../firebase/database';


const Estimate = ({data, visits, members, openEstimate, close, open, userRef, stepIndexRef}) => {
  const storage = getStorage();
  const [nome, setNome] = useState();
  const [telefone, setTelefone] = useState();
  const [cpf, setCpf] = useState();
  const [dataNascimento, setDataNascimento] = useState();
  const [consumo, setConsumo] = useState();
  const [endereco, setEndereco] = useState();
  const [bairro, setBairro] = useState();
  const [cidade, setCidade] = useState();
  const [fatura, setFatura] = useState();
  const [anotacao, setAnotacao] = useState();
  // eslint-disable-next-line no-unused-vars
  const [rawValue ,setRawValue] = useState("");
  const [openFatura, setOpenFatura] = useState(false);
  const [viewVisit, setviewVisit] = useState('dados');
  const [visitaNumero] = useState(3600);
  const [tempoTexto, setTempoTexto] = useState(undefined);
  const [saidaCliente, setSaidaCliente] = useState(undefined);
  const [horarioTexto, setHorarioTexto] = useState(null);
  const [dataTexto, setDataTexto] = useState(null);
  const [lng, setLng] = useState();
  const [lat, setLat] = useState();
  const [rotaTempo, setRotaTempo] = useState(undefined);
  const [hoursLimit, setHoursLimit] = useState(undefined);
  const [visitsFindCount, setVisitsFindCount] = useState(undefined);
  const [saidaTexto, setSaidaTexto] = useState(undefined);
  const [chegadaTexto, setChegadaTexto] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [libraries] = useState(["places"]);
  const [run, setRun] = useState();
  const [stepIndex, setStepIndex] = useState(17);

  useEffect(() => {
    const iniciarTutorial = () => {
      if(userRef && userRef.tutorial) {
        setRun(true);
      }
  }
  iniciarTutorial();
}, [userRef]);

console.log(stepIndex);

  let isLoaded;
  window.onload = { isLoaded } = useLoadScript({
    id: "google-map-script",
    googleMapsApiKey: KeyMaps,
    libraries,
  });


  const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
  })

  useEffect(() => {
    if(openEstimate){
      navigator.geolocation.getCurrentPosition(function (position) {
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
    })
    }
  },[openEstimate])

  useEffect(() => {
    // console.log(visitaNumero);
    if (horarioTexto && dataTexto) {
      moment.locale("pt-br");

      const saidaEmpresa = moment(horarioTexto, "hh:mm"); //Horario de chegada
      const chegadaCliente = moment(horarioTexto, "hh:mm"); //Horario de chegada

      saidaEmpresa.subtract(rotaTempo, "seconds").format("hh:mm"); // Pega o tempo que o tecnico vai precisar sair da empresa

      setSaidaTexto(saidaEmpresa.format("kk:mm"));

      chegadaCliente.add(visitaNumero, "seconds").format("hh:mm"); //Adiciona tempo de viagem volta
      setSaidaCliente(chegadaCliente.format("kk:mm"));
      chegadaCliente.add(rotaTempo, "seconds").format("hh:mm"); //Adiciona tempo de viagem volta
      setChegadaTexto(chegadaCliente.format("kk:mm"));
    }

      let saidaEmpresaRef, ChegadaEmpresaRef;
      moment.locale("pt-br");
      saidaEmpresaRef = saidaTexto;
      ChegadaEmpresaRef = chegadaTexto;

      const saidaFormatada = moment(saidaEmpresaRef, "hh:mm");
      const chegadaFormatada = moment(ChegadaEmpresaRef, "hh:mm");
      let check = [];
      let visitsFindData = [];


      const dataRef = visits.filter(
        (dia) => dia.data === dataTexto);

        // console.log(dataRef)


        dataRef.map((ref) => {
          // console.log("eae");
          if (
            saidaFormatada <= moment(ref.saidaEmpresa, "hh:mm") &&
            chegadaFormatada <= moment(ref.saidaEmpresa, "hh:mm")
          ) {
            check.push(ref);
          } else {
            if (saidaFormatada >= moment(ref.chegadaEmpresa, "hh:mm"))
              check.push(ref);
          }
          return dataRef;
        });
      // console.log(visitsFindCount);

      // eslint-disable-next-line array-callback-return
      dataRef.map((a) => {
        //Percorre todos os arrays de 'dataRef' e compara se os arrays são iguais
        if (check.includes(a) === false) {
          visitsFindData.push(a);
        }
        // return setVisitsFind(visitsFindData);
      });
      setVisitsFindCount(dataRef.length - check.length)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [horarioTexto, visitaNumero, chegadaTexto, saidaTexto, rotaTempo]);

  const handleOnValueChange = (value) => {
    setRawValue(value === undefined ? "undefined" : value || " ");
    setConsumo(value);
  };

  useEffect(() => {
    if(openEstimate) {
      setCidade(data && data.cidade);
      setNome(data && data.nome);
      setTelefone(data && data.telefone);
      setConsumo(data && data.consumo);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[openEstimate])

  const onVisit = (e) => {
    e.preventDefault();
    if(fatura) {
      setviewVisit('visita');
    } else {
      Swal.fire({
        title: 'Fatura',
        html: `Envie a <b>Fatura</b> para continuar o Orçamento.`,
        icon: "error",
        showCloseButton: true,
        confirmButtonColor: "#F39200",
        confirmButtonText: "Ok",
      })
    }
  }

  const onSubmit = async (e) => {
        let visitID;
        e.preventDefault();
        try {
          if(visitsFindCount < 0 || visitsFindCount > 0){
            return Swal.fire({
              title: 'CORPBRASIL',
              text: `O horário da apresentação ultrapassa o horário de uma apresentação já existente. Verifique os horários disponiveis.`,
              icon: "warning",
              showCloseButton: true,
              confirmButtonColor: "#F39200",
              confirmButtonText: "Ok",
            }).then(() => {
              open();
            })
          }
          Swal.fire({
            title: 'Orçamento',
            text: `Todos os dados estão corretos?`,
            icon: "question",
            showCancelButton: true,
            showCloseButton: true,
            confirmButtonColor: "#F39200",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sim",
            cancelButtonText: "Não",
          }).then(async (result) => {
            if (result.isConfirmed) {
              let telefoneFormatado = telefone.replace(/\D/g, '');
              setviewVisit('loading');
              await addDoc(collection(dataBase,"Visitas"), {
                dia: moment(dataTexto).format("YYYY MM DD"),
                saidaEmpresa: saidaTexto,
                chegadaCliente: horarioTexto,
                visita: '01:00',
                visitaNumero: visitaNumero,
                saidaDoCliente: saidaCliente,
                chegadaEmpresa: chegadaTexto,
                consultora: userRef && userRef.nome,
                uid: userRef && userRef.id,
                id_user: userRef && userRef.id_user,
                tecnico: 'Bruna', // Alterar no futuro
                tecnicoUID: 'YBRHcsruCibMjGJBGG6JegVM0O02',
                leadRef: data && data.id,
                cidade: cidade,
                endereco: endereco,
                veiculo: '004',
                lat: lat,
                lng: lng,
                cliente: nome,
                observacao: '',
                data_completa: moment(dataTexto).format('DD MMMM YYYY') + '-' + horarioTexto,
                tempoRota: rotaTempo,
                tempo: tempoTexto,
                data: dataTexto,
                confirmar: false,
                tipo: 'Visita',
                categoria: 'comercial',
                corTec: '#000',
                createVisit: new Date(),
                dataRef: new Date(`${dataTexto}T${horarioTexto}`) 
              }).then(async (result) => {
                visitID = result.id
                const day = new Date();
                await addDoc(collection(dataBase,"Orcamento"), {
                  nome: nome,
                  telefone: telefoneFormatado,
                  cpf: cpf,
                  data: moment(day).format('DD MMM YYYY - HH:mm'),
                  status: 'Em Espera',
                  dataNascimento: dataNascimento,
                  consumo: consumo,
                  empresa: data.empresa,
                  createAt: new Date(),
                  orcamentista: userRef && userRef.orcamentista,
                  indicador: {
                    nome: userRef && userRef.nome,
                    uid: userRef && userRef.uid,
                    id: userRef && userRef.id_user
                  },
                  endereco: {
                    rua: endereco,
                    bairro: bairro,
                    cidade: cidade
                  },
                  anotacao: anotacao,
                  VisitRef: result.id,
                  leadRef: data.id
                }).then(async (result) => {
                  const storageRef = ref(storage, `Orcamento/Bruna/${result.id}/${fatura.complete.name}`);
                  const uploadTask = uploadBytesResumable(storageRef, fatura.complete);
                  uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                      console.log('Upload is ' + progress + '% done');
                    },
                    (error) => {
                      alert(error);
                    },
                    () => {
                      getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                        console.log('File available at', downloadURL);
                        await updateDoc(doc(dataBase, "Orcamento", result.id), {
                          fatura_url: downloadURL,
                          storageRef: storageRef.fullPath
                        })
                        await updateDoc(doc(dataBase, "Leads", data.id), {
                          status: 'Orçamento',
                          step: 2,
                          pedido: {
                            data: moment(day).format('DD MMM YYYY - HH:mm')
                          },
                          consumo: consumo,
                          visitRef: visitID,
                          telefone: telefoneFormatado,
                          orcamentoRef: result.id,
                          storageRef: storageRef.fullPath
                        }).then(async () => {
                          setLoading(false);
                          axios.post(('https://backend.botconversa.com.br/api/v1/webhooks-automation/catch/45898/jm2oCs6G0B4Q/'), {
                            nome: (userRef && userRef.nome) + ' (' + userRef.id_user + ')',
                            cliente: nome,
                            cidade: userRef.cidade && userRef.cidade.cidade,
                            cidade_cliente: cidade,
                            telefone: userRef.orcamentista && members.filter(member => member.id === userRef.orcamentista.uid)[0].telefone,
                            visita: moment(dataTexto).format('DD MMMM YYYY') + ' às ' + horarioTexto
                          })
                          await addDoc(collection(dataBase, "Membros", userRef && userRef.orcamentista.uid, 'Notificacao'), {
                            createAt: serverTimestamp(),
                            type: 'Orçamento',
                            data: moment().format('YYYY-MM-DD'),
                            text: `${userRef && userRef.nome} (${userRef && userRef.id_user}) solicitou um orçamento para <b>${nome}</b>.`
                          })
                          Swal.fire({
                               title: 'CORPBRASIL',
                               html: 'Orçamento solicitado com sucesso.',
                               icon: "success",
                               showConfirmButton: true,
                               showCloseButton: true,
                               confirmButtonColor: "#F39200"
                             }).then((result) => {
                               close();
                               setviewVisit('dados');
                             })
                        })
                      });
                    }
                  );
                })
              })
              } else {
                open();
              }   
            })
        } catch (error) {
          // console.log(error);
        }
    }

    console.log(loading);

    console.log(lat, lng);

    const closeBox = () => {
      close();
      setTimeout(() => {
        setviewVisit('dados');
      }, 500);
    }

    const handleJoyride = (data) => {
      const { action, index, type, status } = data;
      console.log(index);
      if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
        // Update state to advance the tour
          setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1));

          if(index === 19) {
            setviewVisit('visita');
          }
      } else if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
        setRun(false);
        return Swal.fire({
          title: 'Parabéns!',
          html: `Parabéns por completar o tutorial! Esperamos que tenha sido uma experiência informativa,` + 
          ` ajudando você a entender todas as funcionalidades.</br> Agora você está pronto para aproveitar ao máximo o aplicativo, e nossa equipe de suporte está disponível para qualquer ajuda adicional.`,
          icon: "success",
          showConfirmButton: true,
          showCloseButton: true,
          confirmButtonText: 'Fechar',
          confirmButtonColor: "red"
        }).then((result) => {
          close();
          setviewVisit('dados');
        })
      }
    }

  return (
    <>
    <Dialog
      className={styles.dialog}
      open={openEstimate}
      fullScreen={fullScreen}
      maxWidth="md"
      sx={{ zIndex: 90 }}
      onClose={() => closeBox()}
    >
      <IconButton
        aria-label="close"
        onClick={() => closeBox()}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
        ><CloseIcon /></IconButton>
        <Joyride
          steps={step}
          run={run}
          stepIndex={stepIndex}
          continuous={stepIndex === 23 ? false : true}
          callback={handleJoyride}
          locale={{
            back: 'Voltar',
            close: 'Finalizar',
            last: 'Finalizar',
            next: 'Próximo'
          }}/>
      <DialogTitle align="center">Solicitar Orçamento</DialogTitle>
      {viewVisit && viewVisit === 'loading' &&
      <div className={styles.loading}>
        <CircularProgress color='primary' />
      </div>
      }
      {viewVisit && viewVisit === 'visita' && 
        <DialogContent className={styles.visit_content}>
          <DialogContentText sx={{ textAlign: "center" }}>
            Escolha a data de apresentação do <b>Orçamento</b>.
          </DialogContentText>
          <form onSubmit={onSubmit}>
          <FormControl margin='dense' fullWidth>
              <TextField
                autoFocus
                margin="dense"
                id="endereco"
                label="Endereço"
                type="text"
                required
                value={endereco ? endereco : ''}
                onChange={(e) => setEndereco(e.target.value)}
                variant="outlined" />
            </FormControl>
            <div className={styles.label_content}>
              <div className={styles.input_endereco}>
                <TextField
                  margin="dense"
                  id="name"
                  label="Bairro"
                  type="text"
                  value={bairro ? bairro : ''}
                  onChange={(e) => setBairro(e.target.value)}
                  fullWidth
                  required
                  variant="outlined" /> </div>
              <div className={styles.input_endereco}>
                <TextField
                  margin="dense"
                  id="name"
                  label="Cidade"
                  type="text"
                  value={cidade ? cidade : ''}
                  onChange={(e) => setCidade(e.target.value)}
                  fullWidth
                  required
                  variant="outlined" />
              </div>
            </div>
          <div id='escolherData' className={styles.label_content}>
              <div style={{minWidth: '180px' }} className={styles.input_telefone}>
                <span>Dia</span>
                <input 
                  type="date"
                  value={dataTexto ? dataTexto : ''}
                  min={moment(new Date()).add(3, 'days').format('YYYY-MM-DD')}
                  onChange={(e) => setDataTexto(e.target.value)
                  }
                />
              </div>
              <div style={{minWidth: '180px' }} className={styles.input_telefone}>
                <span>Horário</span>
                <input 
                  type="time"
                  value={horarioTexto ? horarioTexto : ''}
                  required
                  onBlur={(e) => moment(e.target.value, 'hh:mm') < moment('07:00', 'hh:mm') || moment(e.target.value, 'hh:mm') > moment('18:00', 'hh:mm') ? setHoursLimit(true) : setHoursLimit(false)}
                  onChange={(e) => setHorarioTexto(e.target.value)
                  }
                />
                 {hoursLimit && <p className={styles.hours_alert}>Limite: 07:00 ás 18:00</p>}
              </div>
            </div>
            <div className={styles.visit_list}>      
            {visits && visits.length > 0  ? 
            <><h2>{dataTexto ? 'Apresentação do dia' : 'Apresentações Marcadas'}</h2>
            <TableContainer id='listaVisitas' className="table-visits" component={Paper} sx={{ maxHeight: 240 }}>
            <Table size="small" stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow className="table-visits_header">
                  <TableCell align="center">Data</TableCell>
                  <TableCell align="center">Saida</TableCell>
                  <TableCell align="center">Chegada</TableCell>
                  <TableCell align="center">Cidade</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visits.map((visita) => (
                  <TableRow
                    hover
                    key={visita.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell sx={{ width: 30 }} align="center" scope="row">
                      {moment(visita.dia).format("DD/MM")}
                    </TableCell>
                    <TableCell align="center">{visita.saidaEmpresa}</TableCell>
                    <TableCell align="center">{visita.chegadaEmpresa}</TableCell>
                      <TableCell align="center">{visita.cidade && visita.cidade}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
              </>:
             <div style={{ display: 'none!important' }} className="visit-aviso">
              <h2>Nenhuma Visita Encontrada</h2>
             </div>
             }
               <div id='previsão' style={{ width: '98%', margin: '0' }} className={visitsFindCount < 0 || visitsFindCount > 0 ? `${styles.visit_info} ${styles.error_aviso}` : `${styles.visit_info} ${styles.check}`}>
               <span className="">Previsão de Apresentação) {(visitsFindCount < 0 || visitsFindCount > 0) ?
               <div aria-label="Essa Apresentação ultrapassa o horário de uma Apresentação já existente. Verifique os horários disponiveis"
                data-cooltipz-dir="top" data-cooltipz-size="large" ><ErrorOutlineIcon  sx={{ fill: 'red' }} /></div> 
              :
              <div aria-label="A Apresentação pode ser criada"
                data-cooltipz-dir="top" ><CheckIcon sx={{ fill: 'green' }} /></div>
              }
                </span>
               <p className={styles.notice}>
               <ArrowCircleRightIcon />Saindo às <b>{saidaTexto ? saidaTexto : '00:00'}</b>
               </p>
               <p className={styles.notice}>
               <ArrowCircleLeftIcon />Chegando às <b>{chegadaTexto ? chegadaTexto : "00:00"}</b>
               </p>
             </div>
            </div>
             <ThemeProvider theme={theme}>
            <DialogActions id='botoesApresentação' sx={{ justifyContent: 'center' }}>
              <Button variant='outlined' color='success' type="submit">Solicitar</Button>
              <Button variant='outlined' color="error" onClick={() => setviewVisit('dados')}>Voltar</Button>
            </DialogActions>
          </ThemeProvider>
          </form>
        </DialogContent>
      }
      {viewVisit && viewVisit === 'dados' &&
        <DialogContent>
          <DialogContentText id="avisoOrçamento" sx={{ textAlign: "center" }}>
            Preencha os campos abaixo para solicitar um <b>Orçamento</b>.
          </DialogContentText>
          <form onSubmit={onVisit}>
            <ThemeProvider theme={theme}>
              <TextField
                autoFocus
                margin="dense"
                onChange={(e) => setNome(e.target.value)}
                id="name"
                label="Nome Completo"
                type="text"
                value={nome ? nome : ''}
                fullWidth
                // required
                variant="outlined" />
              <div className={styles.label_content}>
                <div className={styles.input_telefone}>
                  <span>Telefone</span>
                  <PatternFormat
                    className="label__input"
                    onChange={(e) => setTelefone(e.target.value)}
                    format="## (##) ##### ####"
                    mask="_"
                    placeholder="00 (00) 00000 0000"
                    value={telefone ? telefone : ''}
                    label="Telefone"
                    minLength={9}
                    variant="outlined"
                    color="primary"
                    required 
                    />
                </div>
                <div className={styles.input_telefone}>
                  <span>CPF</span>
                  <PatternFormat
                    className="label__input"
                    onChange={(e) => setCpf(e.target.value)}
                    format="###.###.###-##"
                    mask="_"
                    placeholder="000.000.000-00"
                    value={cpf ? cpf : ''}
                    label="Telefone"
                    minLength={9}
                    variant="outlined"
                    color="primary"
                    required 
                    />
                </div>
              </div>
              <div className={styles.label_content}>
                <div className={styles.input_telefone}>
                  <span>Data de Nascimento</span>
                  <PatternFormat
                    className="label__input"
                    onChange={(e) => setDataNascimento(e.target.value)}
                    format="##/##/####"
                    mask="_"
                    placeholder="00/00/0000"
                    value={dataNascimento ? dataNascimento : ''}
                    label="Data de Nascimento"
                    minLength={9}
                    variant="outlined"
                    color="primary"
                    required 
                    />
                </div>
                <div className={styles.input_telefone}>
                  <span>Gasto com Energia</span>
                  <CurrencyInput
                    fullWidth
                    // customInput={TextField}
                    className="label__text"
                    label="Consumo Médio de Energia"
                    placeholder="R$ 00"
                    intlConfig={{ locale: "pt-BR", currency: "BRL" }}
                    onValueChange={handleOnValueChange}
                    fixedDecimalLength={0}
                    value={consumo || ''}
                    min={50}
                    required
                    color="primary" />
                </div>
              </div>
              <div className={styles.label_last}>
              <p>Cliente pretende adquirir equipamento elétrico de alto consumo após a instalação do sistema FV?</p>
              <TextField
                    margin="dense"
                    id="name"
                    type="text"
                    rows={2}
                    label="Resposta"
                    multiline
                    value={anotacao ? anotacao : ''}
                    onChange={(e) => setAnotacao(e.target.value)}
                    fullWidth
                    required
                    variant="outlined" />
              </div>
              <div id="enviarFatura" className={styles.input_file}>
                <Button component="label" variant="contained" onChange={(e) => setFatura({ file: URL.createObjectURL(e.target.files[0]), complete: e.target.files[0] })} startIcon={<CloudUploadIcon />}>
                  Enviar Fatura
                  <VisuallyHiddenInput type="file" accept="image/png,image/jpeg" />
                </Button>
                {fatura &&
                  <Button variant='outlined' color='success' onClick={() => setOpenFatura(true)} endIcon={<CheckIcon />}>Visualizar</Button>}
                <div className={styles.input_file_icon}></div>
              </div>
            </ThemeProvider>
            <ThemeProvider theme={theme}>
              <DialogActions sx={{ justifyContent: 'center' }}>
                <Button id="botãoProximo" variant='outlined' type="submit">Proximo</Button>
                <Button variant='outlined' color="error" onClick={() => close()}>Cancelar</Button>
              </DialogActions>
            </ThemeProvider>
          </form>
        </DialogContent>
      }
      
    </Dialog>
    <Dialog
    className={styles.fatura_container}
    open={openFatura}
    fullScreen={fullScreen}
    maxWidth="lg"
    onClose={() => setOpenFatura(false)}
    >
      <IconButton
        aria-label="close"
        onClick={() => setOpenFatura(false)}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      ><CloseIcon /></IconButton>
      <div className={styles.fatura}>
        <img src={fatura && fatura.file} alt='' />
      </div>
      <ThemeProvider theme={theme}>
      <DialogActions className={styles.fatura_buttons} sx={{ justifyContent: 'center' }}>
              <Button variant='contained' onClick={() => setOpenFatura(false)}>FECHAR</Button>
            </DialogActions>
      </ThemeProvider>
      </Dialog>
      {isLoaded && 
      <GoogleMap zoom={10} center={{lat: -23.1685077, lng: -47.7486243}}>
          <DistanceMatrixService
            options={{
              destinations: [{ lat: lat, lng: lng }],
              origins: [{ lng: -47.7486243, lat: -23.1685077}],
              travelMode: "DRIVING",
              drivingOptions: { departureTime: new Date(), trafficModel: 'bestguess'}, // Pega o trafico no tempo de criação da visita
            }}
            callback={(response, status) => {
              if (status === "OK") {
                // console.log(response);
                if (
                  rotaTempo === undefined || rotaTempo !== response?.rows[0].elements[0].duration.value
                  ) {
                  setRotaTempo(response?.rows[0].elements[0].duration.value);
                  setTempoTexto(response?.rows[0].elements[0].duration.text);
                  // setCheck(false);
                }
              }
            }}
          />
        </GoogleMap>
      }
      </>
  )
}

export default Estimate