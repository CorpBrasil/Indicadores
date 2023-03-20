import { updateDoc, doc } from 'firebase/firestore';
import { useLayoutEffect, useState } from 'react'
import { useForm } from "react-hook-form"; // cria formulário personalizado
import Swal from "sweetalert2"; // cria alertas personalizado
import { dataBase } from '../../../../firebase/database';
import { Company } from '../../../../data/Data'

import '../../_modal.scss';

const EditAdmin = ({ returnAdmin, memberRef }) => {
  const {
    register,
    handleSubmit,
    reset
  } = useForm();

  const memberDocRef = doc(dataBase,"Membros", memberRef.id);
  const [cor, setCor] = useState(memberRef.cor);

  useLayoutEffect(() => {
    // faz a solicitação do servidor assíncrono e preenche o formulário
    setTimeout(() => {
      reset({
        nome: memberRef.nome,
        veiculo: memberRef.veiculo,
      });
    }, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberRef]);


  const onSubmit = async (userData) => {
        try {
          Swal.fire({
            title: Company,
            text: `Você deseja alterar os dados?`,
            icon: "question",
            showCancelButton: true,
            showCloseButton: true,
            confirmButtonColor: "#F39200",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sim",
            cancelButtonText: "Não",
          }).then(async (result) => {
            if (result.isConfirmed) {
              let msg;
              if(memberRef.cargo === 'Técnico') {
                await updateDoc(memberDocRef, {
                  veiculo: userData.veiculo
                })
                msg = `O veículo do ${memberRef.cargo} <b> ${userData.nome}</b> foi alterado com sucesso.`;
                 Swal.fire({
                title: Company,
                html: msg,
                icon: "success",
                showConfirmButton: true,
                showCloseButton: true,
                confirmButtonColor: "#F39200"
              }).then((result) => {
                returnAdmin();
              })
              } else {
                await updateDoc(memberDocRef, {
                  cor: cor
                })
                msg = `A Cor do ${memberRef.cargo} <b> ${userData.nome}</b> foi alterado com sucesso.`
                Swal.fire({
                  title: "Atenção",
                  html: 'Somente as visitas criadas a partir de agora irão exibir a nova cor do colaborador.',
                  icon: "warning",
                  showConfirmButton: true,
                  showCloseButton: true,
                  confirmButtonColor: "#F39200"
                }).then((result) => {
                  Swal.fire({
                    title: Company,
                    html: msg,
                    icon: "success",
                    showConfirmButton: true,
                    showCloseButton: true,
                    confirmButtonColor: "#F39200"
                  }).then((result) => {
                    returnAdmin();
                  })
                })
              }   
            }
          })
        } catch (error) {
          // console.log(error);
        }
    }

  return (
    <div className='modal-visit'>
       <div className='modal-box-visit'>
            <div className='modal-box-visit__close'>
                <button onClick={returnAdmin} className='btn-close' />
            </div>
            <h4>Editar {memberRef.cargo === 'Técnico' ? 'Veículo do Técnico' : 'Cor'}</h4> 
        <form className='form-visit' onSubmit={handleSubmit(onSubmit)}>
        <label className="form-visit__label">
        <p>Colaborador(a)</p>
            <input
              className="form-visit__text"
              type="text"
              {...register("nome")}
              disabled
            />
          </label>
           
          {memberRef.cargo !== 'Técnico' ? 
            (<><div className='form-visit__color' style={{ flexDirection: 'column' }}>
              <p>Escolha uma cor de destaque</p>
              <input
                type="color"
                autoComplete="off"
                value={cor}
                onChange={(e) => setCor(e.target.value)}
                required />
            </div><div className='form-visit__exemple'>
                <h3>Resultado:</h3>
                <p style={cor && {
                  backgroundColor: cor,
                  borderBottom: '1px solid' + cor,
                  borderRight: '1px solid' + cor,
                  borderLeft: '1px solid' + cor,
                  color: "#fff",
                  textShadow: '#5a5a5a -1px 0px 5px',
                }}>{memberRef.nome}</p>
              </div></>) : (<label className="form-visit__label">
           <p>Veículo</p>
            <input
              className="form-visit__text"
              type="number"
              placeholder="Digite o número do Veículo"
              autoComplete="off"
              onInput={(e) => e.target.value = e.target.value.slice(0, 3)}
              {...register("veiculo")}
              required
            />
          </label>)
            }
        <input className='form-visit__btn' type="submit" value="CONFIRMAR"/>
      </form> 
        </div> 
    </div>
  )
}

export default EditAdmin