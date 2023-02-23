import { updateDoc, doc } from 'firebase/firestore';
import { useLayoutEffect } from 'react'
import { useForm } from "react-hook-form"; // cria formulário personalizado
import Swal from "sweetalert2"; // cria alertas personalizado
import { dataBase } from '../../../../firebase/database';

import '../../_modal.scss';

const EditAdmin = ({ returnAdmin, memberRef }) => {
  const {
    register,
    handleSubmit,
    reset
  } = useForm();

  const memberDocRef = doc(dataBase,"Membros", memberRef.id);

  useLayoutEffect(() => {
    // faz a solicitação do servidor assíncrono e preenche o formulário
    setTimeout(() => {
      reset({
        nome: memberRef.nome,
        carro: memberRef.carro,
      });
    }, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberRef]);


  const onSubmit = async (userData) => {
        try {
          Swal.fire({
            title: "Infinit Energy Brasil",
            text: `Você deseja alterar o carro do Técnico?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#F39200",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sim",
            cancelButtonText: "Não",
          }).then(async (result) => {
            if (result.isConfirmed) {
              await updateDoc(memberDocRef, {
                carro: userData.carro
              })
              Swal.fire({
                title: "Infinit Energy Brasil",
                html: `O carro do Técnico <b> ${userData.nome}</b> foi alterado com sucesso.`,
                icon: "success",
                showConfirmButton: true,
                confirmButtonColor: "#F39200"
              }).then((result) => {
                returnAdmin();
              })
            }
          })
        } catch (error) {
          console.log(error);
        }
    }

  return (
    <div className='modal-visit'>
       <div className='modal-box-visit'>
            <div className='modal-box-visit__close'>
                <button onClick={returnAdmin} className='btn-close' />
            </div>
            <h4>Editar Carro do Técnico</h4> 
        <form className='form-visit' onSubmit={handleSubmit(onSubmit)}>
        <label className="form-visit__label">
        <p>Técnico</p>
            <input
              className="form-visit__text"
              type="text"
              {...register("nome")}
              disabled
            />
          </label>
           <label className="form-visit__label">
           <p>Carro</p>
            <input
              className="form-visit__text"
              type="number"
              placeholder="Digite o número do carro"
              autoComplete="off"
              onInput={(e) => e.target.value = e.target.value.slice(0, 3)}
              {...register("carro")}
              required
            />
          </label>
        <input className='form-visit__btn' type="submit" value="CRIAR"/>
      </form> 
        </div> 
    </div>
  )
}

export default EditAdmin