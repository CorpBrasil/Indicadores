import { setDoc, doc } from 'firebase/firestore';
import React, { useState } from 'react'
import { useForm } from "react-hook-form"; // cria formulário personalizado
import Swal from "sweetalert2"; // cria alertas personalizado
import { auth } from '../../../../firebase/database';
import { dataBase } from '../../../../firebase/database';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

import '../../_modal.scss';
import { useNavigate } from 'react-router-dom';

const CreateAdmin = ({ returnAdmin, members }) => {
  const {
    register,
    handleSubmit
  } = useForm();
  const navigate = useNavigate();
  const [cargo, setCargo] = useState('Vendedor(a)');

  const onSubmit = async (userData) => {
    const findEmail = members.find(member => member.email ===  userData.email);
    console.log(findEmail);
    if (findEmail) {
          return Swal.fire({
            title: "Infinit Energy Brasil",
            html: `O email <b>${userData.email}</b> já está cadastrado no sistema.`,
            icon: "warning",
            showConfirmButton: true,
            confirmButtonColor: "#F39200",
          });
        } else {
                  try {
          Swal.fire({
            title: "Infinit Energy Brasil",
            text: `Você deseja cadastrar um novo Colaborador(a)?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#F39200",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sim",
            cancelButtonText: "Não",
          }).then(async (result) => {
            if (result.isConfirmed) {
              await createUserWithEmailAndPassword(auth, userData.email, userData.senha)
              .then((userCredential) => {
                // Signed in 
                updateProfile(auth.currentUser, {
                  displayName: userData.nome,
                })
                .then(() => {
                })
                .catch((error) => {
                  console.error(error);
                });
                const user = userCredential.user;
                setDoc(doc(dataBase, "Membros", user.uid), {...userData, cargo: cargo, uid: user.uid});
                console.log(user);
                // ...
              })
              .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode, errorMessage)
                // ..
              });
              navigate("/");
              Swal.fire({
                title: "Infinit Energy Brasil",
                html: `O Colaborador(a) <b> ${userData.nome}</b> foi cadastrado com sucesso.`,
                icon: "success",
                showConfirmButton: true,
                confirmButtonColor: "#F39200"
              }).then((result) => {
                if (result.isConfirmed) {
                  window.location.reload(true); // Recarrega a pagina
                }
              })
            }
          })
        } catch (error) {
          console.log(error);
        }
      }
    }

  return (
    <div className='modal-visit'>
       <div className='modal-box-visit'>
            <div className='modal-box-visit__close'>
                <button onClick={returnAdmin} className='btn-close' />
            </div>
            <h4>Cadastrar novo Colaborador</h4> 
        <form className='form-visit' onSubmit={handleSubmit(onSubmit)}>
        <label className="form-visit__label">
            <input
              className="form-visit__text"
              type="text"
              placeholder="Digite o nome"
              autoComplete="off"
              {...register("nome")}
              required
              minLength={3}
            />
          </label>
        <label className="form-visit__label">
            <input
              className="form-visit__text"
              type="email"
              placeholder="Digite o email"
              autoComplete="off"
              {...register("email")}
              required
            />
          </label>
          <div className='form-visit__double'>
        <label className="form-visit__label">
            <input
              className="form-visit__text"
              type="text"
              placeholder="Digite a senha"
              autoComplete="off"
              {...register("senha")}
              required
              minLength={6}
            />
          </label>
          <select value={cargo} name="cargo" onChange={(e) => setCargo(e.target.value)}>
            <option value="Vendedor(a)">Vendedor(a)</option>
            <option value="Técnico">Técnico</option>
          </select>
          </div>
          {cargo === 'Vendedor(a)' ? 
            <div className='form-visit__color'>
            <p>Escolha uma cor de destaque</p>
            <input
              type="color"
              autoComplete="off"
              {...register("cor")}
              required
            />
          </div> : <label className="form-visit__label">
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
          }  
        <input className='form-visit__btn' type="submit" value="CRIAR"/>
      </form> 
        </div> 
    </div>
  )
}

export default CreateAdmin