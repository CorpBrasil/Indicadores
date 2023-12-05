import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { memo, useState, useEffect } from "react";
// import axios from "axios";
import Geocode from "react-geocode";
import { PatternFormat } from "react-number-format";
import { useForm } from "react-hook-form"; // cria formulário personalizado
import Swal from 'sweetalert2/dist/sweetalert2.js';
import * as moment from "moment";
import "moment/locale/pt-br";
import axios from 'axios';

import { KeyMaps } from "../../../data/Data";
import { Company } from "../../../data/Data";
import { dataBase } from "../../../firebase/database";
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import "../../Box/style.scss";

const CreateProspection = ({
  returnPage,
  userRef,
  changeLoading
}) => {
  const { register, handleSubmit } = useForm();
  const [celular, setCelular] = useState('');
  const [lng, setLng] = useState();
  const [lat, setLat] = useState();
  const [cidade, setCidade] = useState(undefined);
  const [cpfCnpj, setCpfCnpj] = useState('CPF');
  const [doc, setDoc] = useState(undefined);
  const [checkCpfCNPJ, setCheckCpfCNPJ] = useState(false);
  

  Geocode.setLanguage("pt-BR");
  Geocode.setRegion("br");
  Geocode.setApiKey(KeyMaps);
  Geocode.setLocationType("ROOFTOP");

  useEffect(() => {
    const dataLoad = () => {
      navigator.geolocation.getCurrentPosition(function (position) {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
      }) 
    }
    dataLoad();
  },[])

  console.log(lat)

  useEffect( () => {
    if(!cidade) {
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
  },[cidade,lat,lng])

  const onSubmit = async (userData) => {
    const day = moment();
    console.log(moment(day).format('DD MMM YYYY - HH:mm'))
    try {
      let msg;
      if(userData.nome === 'Teste') msg = 'Não é possivel cadastrar um cliente com o nome <b>Teste</b>.';     
      if(checkCpfCNPJ) msg = 'Não é possivel cadastrar um cliente <b>sem um documento válido.</b>';     
      if(userData.nome === 'Teste' || checkCpfCNPJ) {
        return Swal.fire({
          title: 'Nome Inválido',
          html: msg,
          icon: "error",
          showCloseButton: true,
          confirmButtonColor: "#F39200",
          confirmButtonText: "Ok",
        })
      }
      if(cidade) {
        Swal.fire({
          title: Company,
          html: `Você deseja cadastrar o <b>Lead?</b>`,
          icon: "question",
          showCancelButton: true,
          showCloseButton: true,
          confirmButtonColor: "#F39200",
          cancelButtonColor: "#d33",
          confirmButtonText: "Sim",
          cancelButtonText: "Não",
        }).then(async (result) => {
          if (result.isConfirmed) {
            let telefoneFormatado = celular.replace(/\D/g, '');
            changeLoading(true);
            await addDoc(collection(dataBase, 'Leads'), {
              ...userData,
              cpfCnpj: doc,
              telefone: '55' + telefoneFormatado,
              indicador: userRef.nome,
              data: moment(day).format('DD MMM YYYY - HH:mm'),
              createAt: serverTimestamp(),
              uid: userRef.uid,
              status: 'Ativo',
              orcamentista: userRef.orcamentista,
              step: 0,
              endereco: `https://maps.google.com/?q=${lat},${lng}`
            }).then(() => {
              Swal.fire({
                title: Company,
                html: `O Lead foi cadastrado com sucesso.`,
                icon: "success",
                showConfirmButton: true,
                showCloseButton: true,
                confirmButtonColor: "#F39200",
              }).then(() => {
                return returnPage();
              })
            })
            // .then((result) => {
            //   console.log(result);
            //   changeLoading(false);
            //   axios.post('https://n8n.corpbrasil.cloud/webhook-test/9b99e112-2485-4079-9609-d8c54de86ce8', {
            //     ...userData,
            //     telefone: '55' + telefoneFormatado,
            //     consultora: userRef.nome,
            //     status: 'Ativo',
            //     ID: result.id,
            //     orcamentista: userRef.orcamentista,
            //     endereco: `https://maps.google.com/?q=${lat},${lng}`
            //   }).then(() => {
            //     Swal.fire({
            //       title: Company,
            //       html: `O Lead foi cadastrado com sucesso.`,
            //       icon: "success",
            //       showConfirmButton: true,
            //       showCloseButton: true,
            //       confirmButtonColor: "#F39200",
            //     }).then(() => {
            //       return returnPage();
            //     })
            //   })
            // })
          }})
      } else {
        Swal.fire({
                title: 'GPS Desativado',
                html: `Ative o <b>GPS</b> para confirmar o abastecimento.`,
                icon: "error",
                showCloseButton: true,
                confirmButtonColor: "#F39200",
                confirmButtonText: "Ok",
              })
      }
    } catch {

    }
  };

  const findDoc = async () => {
    if(cpfCnpj === 'CPF') {
      if(!validaCPF(doc)) {
        setCheckCpfCNPJ(true);
      } else {
        setCheckCpfCNPJ(false);
      }
    } else {
      let docFormat = doc.replace(/\D/g, '');
     await axios.get(`https://publica.cnpj.ws/cnpj/${docFormat}`)
     .then(result => {
          console.log(result.data)
          setCheckCpfCNPJ(false);
      }).catch(e => setCheckCpfCNPJ(true))
      console.log('eae')
    }
  }

  //CPF 

  const validaCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]+/g, ''); // Remove caracteres não numéricos

    if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/))
        return false;

    let soma = 0;
    let resto;

    // Calcula o primeiro dígito verificador
    for (let i = 1; i <= 9; i++) 
        soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;

    if ((resto === 10) || (resto === 11)) 
        resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10)) ) 
        return false;

    soma = 0;

    // Calcula o segundo dígito verificador
    for (let i = 1; i <= 10; i++) 
        soma += parseInt(cpf.substring(i-1, i)) * (12 - i);
    resto = (soma * 10) % 11;

    if ((resto === 10) || (resto === 11)) 
        resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11) ) ) 
        return false;

    return true;
}

  return (
    <div className="box-visit">
      <div className="box-visit__box">
        <div className="box-visit__close">
          <button onClick={returnPage} className="btn-close" />
        </div>
        <h4>Cadastrar Lead</h4>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="box-visit__container">
            <span id="aviso" className="box-visit__notice">Campo com * é obrigatório</span>
            <div className="box-visit__form"> 
                  <label className="label">
                    <p>Responsável *</p>
                    <input
                      className="label__input"
                      type="text"
                      placeholder="Digite o nome"
                      autoComplete="off"
                      required
                      {...register("nome")} />
                  </label>
                <label className="label">
                    <p>Empresa *</p>
                    <input
                      className="label__input"
                      type="text"
                      placeholder="Digite o nome da empresa"
                      autoComplete="off"
                      required
                      {...register("empresa")} />
                    </label>
                    <label className="label">
                    <p>Cidade *</p>
                    <input
                      className="label__input"
                      type="text"
                      placeholder="Digite a cidade"
                      autoComplete="off"
                      required
                      {...register("cidade")} />
                  </label>
                    <label className="label">
                    <RadioGroup
                      className="input-radio"
                      aria-labelledby="demo-radio-buttons-group-label"
                      value={cpfCnpj}
                      onChange={(e) => setCpfCnpj(e.target.value)}
                      name="radio-buttons-group"
                    >
                      <FormControlLabel value="CPF" control={<Radio />} label="CPF" />
                      <FormControlLabel value="CNPJ" control={<Radio />} label="CNPJ" />
                    </RadioGroup>
                    <PatternFormat
                    className='label__input'
                    value={doc || ''}
                    style={{ marginBottom: '0.2rem', 
                    border: `${checkCpfCNPJ ? '1px solid red' : '1px solid #ccc'}` 
                    }}
                    onChange={(e) => setDoc(e.target.value)}
                    onBlur={() => findDoc(cpfCnpj)}
                    format={cpfCnpj === 'CPF' ? "###.###.###-##" : "##.###.###/####-##"}
                    mask="_"
                    placeholder={cpfCnpj === 'CPF' ? "000.000.000-00" : "00.000.000/0000-00"}
                    variant="outlined"
                    color="primary"/>
                    {checkCpfCNPJ && <span className="notice red">{cpfCnpj} inválido</span>} 
                  </label>
                    <label className="label">
                    <p>Telefone</p>
                    <PatternFormat
                    className="label__input"
                    value={celular || ''}
                    onChange={(e) => setCelular(e.target.value)}
                    format="(##) ##### ####"
                    mask="_"
                    required
                    placeholder="(DD) 00000-0000"
                    label="Celular"
                    variant="outlined"
                    color="primary"/>
                  </label>
                    <label className="label">
                    <p>Email</p>
                    <input
                      className="label__input"
                      type="text"
                      placeholder="Digite o email"
                      autoComplete="off"
                      {...register("email")} />
                  </label>
                    <label className="label">
                    <p>Consumo de Energia</p>
                    <input
                      className="label__input"
                      type="text"
                      placeholder="Digite o consumo de energia"
                      autoComplete="off"
                      {...register("consumo")} />
                  </label>
                  <label id="anotação" className="label-max">
                    <p>Anotação</p>
                    <textarea
                      className="label__textarea"
                      type="text"
                      placeholder="Digite uma observação"
                      autoComplete="off"
                      {...register("anotacao")} />
                  </label>
          </div>
          </div>
          <input id="criar" className="box-visit__btn" type="submit" value="CRIAR" />
        </form>
      </div>
    </div>
  );
};

export default memo(CreateProspection);
