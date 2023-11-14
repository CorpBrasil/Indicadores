import { doc, updateDoc } from "firebase/firestore";
import { memo, useState, useEffect } from "react";
import { PatternFormat } from "react-number-format";
import { useForm } from "react-hook-form"; // cria formulário personalizado
import Swal from 'sweetalert2/dist/sweetalert2.js';
import "moment/locale/pt-br";

import { Company } from "../../../data/Data";
import { dataBase } from "../../../firebase/database";

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BlockIcon from '@mui/icons-material/Block';
import EditIcon from '@mui/icons-material/Edit';
import Button from "@mui/material/Button";

import "../../Box/style.scss";

const EditProspection = ({
  data,
  refButton
}) => {
  // const [view, setView] = useState(false);
  const { register, handleSubmit, setValue, watch } = useForm();
  const [telefone, setTelefone] = useState(data.telefone.slice(0,14));
  const [inputState, setInputState] = useState('disabled');
  const [viewEdit, setViewEdit] = useState('');
  const watched =  watch();

  const toggleState = (data) => {
    if(data) {
      setViewEdit(data);
      setInputState('required')
    } else {
      setViewEdit();
      setInputState('disabled')
    }
  };


  // useEffect(() => {
  //   const fethData = async () => {
  //     // setValue('cnpj', data.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1 $2 $3/$4-$5"));
  //     setValue('nome', data.nome);
  //     setValue('empresa', data.empresa);
  //     setValue('cidade', data.cidade);
  //     setValue('email', data.email);
  //     setValue('consumo', data.consumo);
  //   }
  //   fethData();

  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // },[setValue])

  // console.log(watched);

  useEffect(() => {
    // eslint-disable-next-line no-self-compare
    if (JSON.stringify(watched) === JSON.stringify(watched) && !viewEdit) {
      // setValue('cnpj', data.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1 $2 $3/$4-$5"));
      setValue('nome', data.nome);
      setValue('empresa', data.empresa);
      setValue('cidade', data.cidade);
      setValue('email', data.email);
      setValue('consumo', data.consumo);
      setTelefone(data.telefone.slice(0,14))
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewEdit]);

  const onSubmit = async (userData) => {
    try {
      Swal.fire({
        title: Company,
        html: `Você alterar os dados do <b>Lead?</b>`,
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
          await updateDoc(doc(dataBase, 'Leads', data.id), {
            ...userData,
            telefone: '55' + telefoneFormatado,
          })
          toggleState();
          Swal.fire({
            title: Company,
            html: `O Lead foi alterado com sucesso.`,
            icon: "success",
            showConfirmButton: true,
            showCloseButton: true,
            confirmButtonColor: "#F39200",
          })
          // axios.post('https://n8n.corpbrasil.cloud/webhook/d490a21a-4488-4907-871f-b4326209c05a', {
          //   ...userData,
          //   consultora: userRef.nome,
          // }).then(() => {
          // })
        }})
    } catch (error) {
      console.log(error)
    }
  };

  return (
    <div className="box-visit__container">
                  <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="box-visit__form"> 
                  <label id="nome" className="label">
                    <p>Nome *</p>
                    <input
                      className="label__input"
                      type="text"
                      autoComplete="off"
                      required={inputState === 'required'}
                      disabled={inputState === 'disabled'}
                      {...register("nome")} />
                  </label>
                <label className="label">
                    <p>Empresa *</p>
                    <input
                      className="label__input"
                      type="text"
                      autoComplete="off"
                      required={inputState === 'required'}
                      disabled={inputState === 'disabled'}
                      {...register("empresa")} />
                    </label>
                    <label className="label">
                    <p>Cidade *</p>
                    <input
                      className="label__input"
                      type="text"
                      autoComplete="off"
                      required={inputState === 'required'}
                      disabled={inputState === 'disabled'}
                      {...register("cidade")} />
                  </label>
                    <label className="label">
                    <p>Telefone</p>
                    <PatternFormat
                    className="label__input"
                    onChange={(e) => setTelefone(e.target.value)}
                    format="(##) ##### ####"
                    mask="_"
                    value={telefone}
                    label="Telefone"
                    variant="outlined"
                    color="primary"
                    disabled={inputState === 'disabled'} />
                  </label>
                    <label className="label">
                    <p>Email</p>
                    <input
                      className="label__input"
                      type="text"
                      autoComplete="off"
                      disabled={inputState === 'disabled'}
                      {...register("email")} />
                  </label>
                    <label className="label">
                    <p>Consumo</p>
                    <input
                      className="label__input"
                      type="text"
                      autoComplete="off"
                      disabled={inputState === 'disabled'}
                      {...register("consumo")} />
                  </label>
                  </div>
                  {viewEdit && viewEdit === data.id &&
                  <div className="button-edit">
                                <><Button
            variant="outlined"
            color="success"
            size="small"
            type="submit"
            startIcon={<CheckCircleOutlineIcon />}
          >
            Confirmar
          </Button><Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => toggleState()}
            startIcon={<BlockIcon />}
          >
              Cancelar
            </Button></>
                  </div>
            }
                      </form>
                      {!viewEdit && !viewEdit &&
                      <Button
                       id="alterarDados"
                       ref={refButton}
                       variant="outlined"
                       color="primary"
                       sx={{ maxWidth: '10rem' }}
                       size="small"
                       type="button"
                       onClick={() => toggleState(data.id)}
                       startIcon={<EditIcon />}>
                          Alterar dados
                      </Button>}
    </div>
  );
};

export default memo(EditProspection);
